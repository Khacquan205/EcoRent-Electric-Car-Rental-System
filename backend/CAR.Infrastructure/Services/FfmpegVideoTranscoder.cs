using CAR.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class FfmpegVideoTranscoder : IVideoTranscoder
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<FfmpegVideoTranscoder> _logger;

        public FfmpegVideoTranscoder(IConfiguration configuration, ILogger<FfmpegVideoTranscoder> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<Stream> TranscodeToMp4Async(Stream input, CancellationToken cancellationToken)
        {
            var ffmpegPath = _configuration["KYC:Ffmpeg:Path"];
            if (string.IsNullOrWhiteSpace(ffmpegPath))
            {
                ffmpegPath = "ffmpeg";
            }

            var inputPath = Path.Combine(Path.GetTempPath(), $"kyc_in_{Guid.NewGuid():N}");
            var outputPath = Path.Combine(Path.GetTempPath(), $"kyc_out_{Guid.NewGuid():N}.mp4");

            try
            {
                await using (var fs = new FileStream(inputPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                {
                    await input.CopyToAsync(fs, cancellationToken);
                }

                var args = $"-y -i \"{inputPath}\" -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k \"{outputPath}\"";
                _logger.LogInformation("Transcoding video to mp4 using ffmpeg. Input={InputPath}, Output={OutputPath}", inputPath, outputPath);

                var startInfo = new ProcessStartInfo
                {
                    FileName = ffmpegPath,
                    Arguments = args,
                    RedirectStandardError = true,
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = new Process { StartInfo = startInfo };

                if (!process.Start())
                {
                    throw new InvalidOperationException("Failed to start ffmpeg process");
                }

                var stdoutTask = process.StandardOutput.ReadToEndAsync();
                var stderrTask = process.StandardError.ReadToEndAsync();

                await process.WaitForExitAsync(cancellationToken);

                var stdout = await stdoutTask;
                var stderr = await stderrTask;

                if (process.ExitCode != 0)
                {
                    _logger.LogWarning("ffmpeg failed. ExitCode={ExitCode}. StdErr={StdErr}", process.ExitCode, stderr);
                    throw new InvalidOperationException("ffmpeg transcoding failed");
                }

                if (!File.Exists(outputPath))
                {
                    throw new InvalidOperationException("ffmpeg produced no output file");
                }

                var ms = new MemoryStream();
                await using (var outFs = new FileStream(outputPath, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    await outFs.CopyToAsync(ms, cancellationToken);
                }
                ms.Position = 0;
                return ms;
            }
            finally
            {
                TryDelete(inputPath);
                TryDelete(outputPath);
            }
        }

        private void TryDelete(string path)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
                {
                    File.Delete(path);
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Failed to delete temp file: {Path}", path);
            }
        }
    }
}
