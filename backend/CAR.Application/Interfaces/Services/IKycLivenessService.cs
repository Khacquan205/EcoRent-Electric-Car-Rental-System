using CAR.Application.Dtos;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IKycLivenessService
    {
        Task<KycLivenessResponseDto> ProcessLivenessCheckAsync(KycLivenessRequestDto request);
    }

    public interface IVideoTranscoder
    {
        Task<Stream> TranscodeToMp4Async(Stream input, CancellationToken cancellationToken);
    }
}
