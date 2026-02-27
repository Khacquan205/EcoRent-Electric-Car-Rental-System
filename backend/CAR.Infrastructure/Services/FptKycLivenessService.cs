using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class FptKycLivenessService : IKycLivenessService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<FptKycLivenessService> _logger;
        private readonly IKycFaceStore _faceStore;
        private readonly IVideoTranscoder _videoTranscoder;
        private readonly string _kycProvider;

        public FptKycLivenessService(
            HttpClient httpClient, 
            IConfiguration configuration, 
            ILogger<FptKycLivenessService> logger,
            IKycFaceStore faceStore,
            IVideoTranscoder videoTranscoder)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _faceStore = faceStore;
            _videoTranscoder = videoTranscoder;
            _kycProvider = _configuration["KYC:Provider"]?.ToUpper() ?? "MOCK";
        }

        public async Task<KycLivenessResponseDto> ProcessLivenessCheckAsync(KycLivenessRequestDto request)
        {
            if (_kycProvider == "MOCK")
            {
                _logger.LogInformation("Using MOCK KYC Liveness provider");
                return GetMockResponse();
            }

            if (_kycProvider != "FPT")
            {
                throw new InvalidOperationException($"Unsupported KYC provider: {_kycProvider}");
            }

            return await ProcessFptLivenessAsync(request);
        }

        private KycLivenessResponseDto GetMockResponse()
        {
            return new KycLivenessResponseDto
            {
                IsLive = true,
                IsMatch = true,
                Confidence = 0.96,
                Raw = new { message = "Mock response for testing" }
            };
        }

        private async Task<KycLivenessResponseDto> ProcessFptLivenessAsync(KycLivenessRequestDto request)
        {
            try
            {
                // Validate inputs
                if (request.Video == null || string.IsNullOrEmpty(request.CccdFaceId))
                {
                    return new KycLivenessResponseDto
                    {
                        IsLive = false,
                        IsMatch = false,
                        Confidence = 0,
                        ErrorMessage = "Video and CccdFaceId are required"
                    };
                }

                // Load CCCD face image
                var cccdFaceStream = await _faceStore.LoadFaceAsync(request.CccdFaceId);
                if (cccdFaceStream == null)
                {
                    return new KycLivenessResponseDto
                    {
                        IsLive = false,
                        IsMatch = false,
                        Confidence = 0,
                        ErrorMessage = "CCCD face image not found"
                    };
                }

                // Reset face stream position to beginning
                if (cccdFaceStream.CanSeek)
                {
                    cccdFaceStream.Position = 0;
                }

                // Call FPT Liveness API
                await using var originalVideoStream = request.Video.OpenReadStream();
                var contentType = request.Video.ContentType;
                var fileName = request.Video.FileName;

                // Reset stream position to beginning
                if (originalVideoStream.CanSeek)
                {
                    originalVideoStream.Position = 0;
                }

                Stream videoStreamToSend = originalVideoStream;
                var contentTypeToSend = contentType;
                var fileNameToSend = fileName;
                MemoryStream transcodedStream = null;

                try
                {
                    // Skip transcoding - only accept MP4 videos
                    if (!string.Equals(contentType, "video/mp4", StringComparison.OrdinalIgnoreCase))
                    {
                        return new KycLivenessResponseDto
                        {
                            IsLive = false,
                            IsMatch = false,
                            Confidence = 0,
                            ErrorMessage = "Only MP4 videos are supported. Please record and upload in MP4 format."
                        };
                    }

                    var fptResult = await CallFptLivenessAsync(
                        videoStreamToSend,
                        cccdFaceStream,
                        contentTypeToSend,
                        fileNameToSend);

                    // Map FPT response to our response
                    return MapFptResponseToKycResponse(fptResult);
                }
                finally
                {
                    transcodedStream?.Dispose();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing FPT Liveness");
                return new KycLivenessResponseDto
                {
                    IsLive = false,
                    IsMatch = false,
                    Confidence = 0,
                    ErrorMessage = "Internal server error during liveness check"
                };
            }
        }

        private async Task<FptLivenessResult> CallFptLivenessAsync(
            Stream videoStream,
            Stream cccdFaceStream,
            string videoContentType,
            string videoFileName)
        {
            var apiKey = _configuration["KYC:Fpt:ApiKey"] ?? "0RbR0SE14PJK3teU51RrTo2FUI89NItK";
            var baseUrl = _configuration["KYC:Fpt:BaseUrl"] ?? "https://api.fpt.ai";

            if (string.IsNullOrEmpty(apiKey))
            {
                throw new InvalidOperationException("FPT KYC API Key is not configured");
            }

            using var formData = new MultipartFormDataContent();

            // Debug: Log stream info
            _logger.LogInformation("Video stream length: {VideoLength}, Face stream length: {FaceLength}", 
                videoStream.Length, cccdFaceStream.Length);

            // Video content - always use application/octet-stream as per FPT docs
            var videoContent = new StreamContent(videoStream);
            videoContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            var resolvedVideoFileName = string.IsNullOrWhiteSpace(videoFileName) ? "video.mp4" : videoFileName;
            formData.Add(videoContent, "video", resolvedVideoFileName);

            // Face image content - always use application/octet-stream as per FPT docs
            var faceContent = new StreamContent(cccdFaceStream);
            faceContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            formData.Add(faceContent, "cmnd", "face.jpg");

            // Debug: Log form data content
            _logger.LogInformation("FormData content: Video={VideoFile}, Face={FaceFile}", 
                resolvedVideoFileName, "face.jpg");

            // Use default FPT API without custom parameters (they may not be supported)
            var requestUrl = $"{baseUrl}/dmp/liveness/v3";
            _logger.LogInformation("Calling FPT.AI Liveness API: {RequestUrl}", requestUrl);

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, requestUrl)
            {
                Headers = { { "api-key", apiKey } },
                Content = formData
            };

            var response = await _httpClient.SendAsync(httpRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("FPT Liveness API returned error {StatusCode}: {ErrorContent}", 
                    response.StatusCode, errorContent);
                _logger.LogWarning("Request details: URL={Url}, VideoContentType={VideoType}, VideoFileName={VideoFile}", 
                    requestUrl, videoContentType, videoFileName);
                
                throw new InvalidOperationException($"FPT Liveness API error: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("FPT.AI Liveness Response: {ResponseContent}", responseContent);
            _logger.LogInformation("Request sent successfully: URL={Url}, VideoSize={VideoSize} bytes, FaceSize={FaceSize} bytes", 
                requestUrl, videoStream.Length, cccdFaceStream.Length);
            
            // Debug: Log the actual response for troubleshooting
            if (string.IsNullOrWhiteSpace(responseContent))
            {
                _logger.LogWarning("FPT API returned empty response");
            }
            else
            {
                _logger.LogInformation("FPT API raw response: {RawResponse}", responseContent);
            }

            return JsonSerializer.Deserialize<FptLivenessResult>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }

        private KycLivenessResponseDto MapFptResponseToKycResponse(FptLivenessResult fptResult)
        {
            if (fptResult == null)
            {
                return new KycLivenessResponseDto
                {
                    IsLive = false,
                    IsMatch = false,
                    Confidence = 0,
                    ErrorMessage = "Invalid response from FPT API"
                };
            }

            if (fptResult.ErrorCode != 0)
            {
                return new KycLivenessResponseDto
                {
                    IsLive = false,
                    IsMatch = false,
                    Confidence = 0,
                    Raw = fptResult,
                    ErrorMessage = string.IsNullOrWhiteSpace(fptResult.ErrorMessage) ? "FPT liveness returned error" : fptResult.ErrorMessage
                };
            }

            if (fptResult.Liveness == null || string.IsNullOrWhiteSpace(fptResult.Liveness.Result))
            {
                return new KycLivenessResponseDto
                {
                    IsLive = false,
                    IsMatch = false,
                    Confidence = 0,
                    Raw = fptResult,
                    ErrorMessage = "FPT liveness returned no result (unsupported/invalid video or payload)"
                };
            }

            // Map based on FPT Liveness v3 response structure
            var isLive = fptResult.Liveness?.Result == "live" || false;
            var isMatch = fptResult.FaceMatch?.Result == "match" || false;
            var confidence = 0.0;

            // Use confidence from face match if available, otherwise from liveness
            if (fptResult.FaceMatch?.Confidence != null)
            {
                confidence = double.TryParse(fptResult.FaceMatch.Confidence.ToString(), out var conf) ? conf : 0;
            }
            else if (fptResult.Liveness?.Confidence != null)
            {
                confidence = double.TryParse(fptResult.Liveness.Confidence.ToString(), out var conf) ? conf : 0;
            }

            return new KycLivenessResponseDto
            {
                IsLive = isLive,
                IsMatch = isMatch,
                Confidence = confidence,
                Raw = fptResult
            };
        }
    }

    // FPT Liveness v3 Response Models
    public class FptLivenessResult
    {
        public string Code { get; set; }
        public string Message { get; set; }
        public LivenessData Liveness { get; set; }
        public FaceMatchData FaceMatch { get; set; }
        
        // For backward compatibility
        public int ErrorCode => int.TryParse(Code, out var code) ? code : 0;
        public string ErrorMessage => Message;
    }

    public class LivenessData
    {
        public string Code { get; set; }
        public string Message { get; set; }
        public string IsLive { get; set; } // "true" or "false"
        public string SpoofProb { get; set; }
        public string NeedToReview { get; set; }
        public string IsDeepfake { get; set; }
        public string DeepfakeProb { get; set; }
        public string Warning { get; set; }
        
        // For backward compatibility
        public string Result => IsLive?.ToLower() == "true" ? "live" : "spoof";
        public double Confidence => double.TryParse(SpoofProb, out var conf) ? (100 - conf) : 0;
    }

    public class FaceMatchData
    {
        public string Code { get; set; }
        public string Message { get; set; }
        public string IsMatch { get; set; } // "true" or "false"
        public string Similarity { get; set; }
        public string Warning { get; set; }
        
        // For backward compatibility
        public string Result => IsMatch?.ToLower() == "true" ? "match" : "no_match";
        public double Confidence => double.TryParse(Similarity, out var conf) ? conf : 0;
    }
}
