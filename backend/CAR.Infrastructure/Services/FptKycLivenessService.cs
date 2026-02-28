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
        }

        public async Task<KycLivenessResponseDto> ProcessLivenessCheckAsync(KycLivenessRequestDto request)
        {
            return await ProcessFptLivenessAsync(request);
        }

        private const double FaceMatchThreshold = 0.75;

        public async Task<KycLivenessResponseDto> ProcessSelfieMatchAsync(KycSelfieMatchRequestDto request)
        {
            return await ProcessFptSelfieMatchAsync(request);
        }

        private async Task<KycLivenessResponseDto> ProcessFptSelfieMatchAsync(KycSelfieMatchRequestDto request)
        {
            try
            {
                if (request.SelfieImage == null || string.IsNullOrEmpty(request.CccdFaceId))
                {
                    _logger.LogWarning("Face verification FAIL: missing input (SelfieImage or CccdFaceId)");
                    return FailSelfieResponse(0, "Selfie image and CccdFaceId are required");
                }

                var cccdFaceStream = await _faceStore.LoadFaceAsync(request.CccdFaceId);
                if (cccdFaceStream == null)
                {
                    _logger.LogWarning("Face verification FAIL: CCCD face not found for CccdFaceId={CccdFaceId}", request.CccdFaceId);
                    return FailSelfieResponse(0, "CCCD face image not found");
                }

                if (cccdFaceStream.CanSeek)
                    cccdFaceStream.Position = 0;

                var apiKey = _configuration["KYC:Fpt:ApiKey"] ?? throw new InvalidOperationException("FPT KYC API Key is not configured");
                var baseUrl = _configuration["KYC:Fpt:BaseUrl"] ?? "https://api.fpt.ai";
                var requestUrl = $"{baseUrl}/dmp/checkface/v1";

                // Explicit order: file[0] = ID_CARD_FACE (from store), file[1] = SELFIE_FACE (from request). Compare ID vs SELFIE only.
                using var formData = new MultipartFormDataContent();
                var cccdContent = new StreamContent(cccdFaceStream);
                cccdContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                formData.Add(cccdContent, "file[]", "id_card_face.jpg");

                await using var selfieStream = request.SelfieImage.OpenReadStream();
                if (selfieStream.CanSeek)
                    selfieStream.Position = 0;
                var selfieContent = new StreamContent(selfieStream);
                selfieContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                var selfieFileName = string.IsNullOrWhiteSpace(request.SelfieImage.FileName) ? "selfie_face.jpg" : request.SelfieImage.FileName;
                formData.Add(selfieContent, "file[]", selfieFileName);

                _logger.LogInformation("Face verification: comparing ID_CARD_FACE (from store) vs SELFIE_FACE (from request)");

                var httpRequest = new HttpRequestMessage(HttpMethod.Post, requestUrl)
                {
                    Headers = { { "api-key", apiKey } },
                    Content = formData
                };

                var response = await _httpClient.SendAsync(httpRequest);
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("FPT checkface response: {StatusCode} {Content}", response.StatusCode, responseContent);

                if (!response.IsSuccessStatusCode)
                {
                    return FailSelfieResponse(0, "Face verification service error. Please try again or use a clearer photo.");
                }

                var checkFaceResult = JsonSerializer.Deserialize<FptCheckFaceResult>(responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (checkFaceResult == null || checkFaceResult.Data == null)
                {
                    _logger.LogWarning("Face verification FAIL: invalid or empty FPT response");
                    return FailSelfieResponse(0, "Invalid response from face verification");
                }

                if (checkFaceResult.Code != "200")
                {
                    _logger.LogWarning("Face verification FAIL: FPT code={Code}, message={Message}", checkFaceResult.Code, checkFaceResult.Message);
                    return FailSelfieResponse(0, checkFaceResult.Message ?? "No faces detected or invalid image. Please use a clear photo.");
                }

                var similarity = GetSimilarityFromFptData(checkFaceResult.Data);
                if (similarity < 0 || similarity > 100)
                {
                    _logger.LogWarning("Face verification FAIL: invalid similarity value {Similarity}", similarity);
                    return FailSelfieResponse(0, "Invalid similarity result. Please try again with clear photos.");
                }

                var matchScore = similarity / 100.0;
                var isMatched = matchScore >= FaceMatchThreshold;

                _logger.LogInformation(
                    "[KYC] Real face match score from API: {MatchScore:F4} (threshold={Threshold}), isMatched={IsMatched}, similarity={Similarity:F2}%",
                    matchScore, FaceMatchThreshold, isMatched, similarity);

                return new KycLivenessResponseDto
                {
                    IsLive = true,
                    IsMatch = isMatched,
                    Confidence = matchScore,
                    Raw = checkFaceResult,
                    ErrorMessage = isMatched ? null : "Face does not match ID card. Please use a clear selfie."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing selfie face match");
                return FailSelfieResponse(0, "Face verification failed. Please try again.");
            }
        }

        private static KycLivenessResponseDto FailSelfieResponse(double matchScore, string message)
        {
            return new KycLivenessResponseDto
            {
                IsLive = true,
                IsMatch = false,
                Confidence = matchScore,
                ErrorMessage = message
            };
        }

        private static double GetSimilarityFromFptData(FptCheckFaceData data)
        {
            if (data == null) return 0;
            return data.Similarity;
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

            // If face match result is missing, do not pass (prevent auto-pass when face detection fails)
            if (fptResult.FaceMatch == null)
            {
                _logger.LogWarning("Liveness: FaceMatch is null, returning FAIL");
                return new KycLivenessResponseDto
                {
                    IsLive = fptResult.Liveness?.Result == "live",
                    IsMatch = false,
                    Confidence = 0,
                    Raw = fptResult,
                    ErrorMessage = "Face match result missing. Please try again."
                };
            }

            // Use our threshold 0.75; do not trust FPT's isMatch boolean
            var similarityRaw = fptResult.FaceMatch.Confidence;
            var matchScore = similarityRaw / 100.0;
            var isMatched = matchScore >= FaceMatchThreshold;

            _logger.LogInformation(
                "Liveness face match: similarity={Similarity:F2}, matchScore={MatchScore:F4}, threshold={Threshold}, isMatched={IsMatched}",
                similarityRaw, matchScore, FaceMatchThreshold, isMatched);

            return new KycLivenessResponseDto
            {
                IsLive = fptResult.Liveness?.Result == "live",
                IsMatch = isMatched,
                Confidence = matchScore,
                Raw = fptResult,
                ErrorMessage = isMatched ? null : "Face does not match ID card."
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

    /// <summary>FPT checkface/v1 response (compare two face images).</summary>
    public class FptCheckFaceResult
    {
        public string Code { get; set; }
        public string Message { get; set; }
        public FptCheckFaceData Data { get; set; }
    }

    public class FptCheckFaceData
    {
        public bool IsMatch { get; set; }
        public double Similarity { get; set; }
        public bool IsBothImgIDCard { get; set; }
    }
}
