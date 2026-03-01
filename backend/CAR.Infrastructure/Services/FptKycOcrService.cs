using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenCvSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class FptKycOcrService : IKycOcrService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<FptKycOcrService> _logger;
        private readonly IKycFaceStore _faceStore;
        private readonly string _kycProvider;

        public FptKycOcrService(HttpClient httpClient, IConfiguration configuration, ILogger<FptKycOcrService> logger, IKycFaceStore faceStore)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _faceStore = faceStore;
            _kycProvider = _configuration["KYC:Provider"]?.ToUpper() ?? "MOCK";
        }

        public async Task<KycOcrResponseDto> ProcessOcrAsync(KycOcrRequestDto request)
        {
            if (_kycProvider == "MOCK")
            {
                _logger.LogInformation("Using MOCK KYC provider");
                return GetMockResponse();
            }

            if (_kycProvider != "FPT")
            {
                throw new InvalidOperationException($"Unsupported KYC provider: {_kycProvider}");
            }

            return await ProcessFptOcrAsync(request);
        }

        private KycOcrResponseDto GetMockResponse()
        {
            return new KycOcrResponseDto
            {
                FullName = "HUỲNH ANH NHỰT",
                Dob = "25/01/2004",
                Gender = "Male",
                CccdNumber = "083204005843",
                CccdFaceId = "mock-face-id-12345",
                Address = "123 Đường ABC, Quận 1, TP.HCM",
                FrontImageUrl = "https://via.placeholder.com/400x250/cccccc/000000?text=CCCD+Front",
                BackImageUrl = "https://via.placeholder.com/400x250/cccccc/000000?text=CCCD+Back"
            };
        }

        private async Task<KycOcrResponseDto> ProcessFptOcrAsync(KycOcrRequestDto request)
        {
            try
            {
                var apiKey = _configuration["KYC:Fpt:ApiKey"] ?? "0RbR0SE14PJK3teU51RrTo2FUI89NItK";
                var baseUrl = _configuration["KYC:Fpt:BaseUrl"] ?? "https://api.fpt.ai";

                if (string.IsNullOrEmpty(apiKey))
                {
                    throw new InvalidOperationException("FPT KYC API Key is not configured");
                }

                // Xử lý ảnh trước để lấy thông tin chính
                var frontResult = await ProcessSingleImageAsync(request.FrontImage, apiKey, baseUrl, "front");
                
                // Xử lý ảnh sau để bổ sung thông tin
                var backResult = await ProcessSingleImageAsync(request.BackImage, apiKey, baseUrl, "back");
                
                // Extract and save only the cropped face from CCCD front image (for ID_FACE vs SELFIE comparison)
                var cccdFaceId = await SaveOriginalCccdImageAsync(request.FrontImage);
                if (string.IsNullOrEmpty(cccdFaceId))
                {
                    var failResult = CombineOcrResults(frontResult, backResult);
                    failResult.CccdFaceId = "";
                    failResult.ErrorMessage = "Không thể nhận diện khuôn mặt trên ảnh CCCD. Vui lòng tải ảnh mặt trước rõ, có khuôn mặt.";
                    return failResult;
                }

                // Kết hợp kết quả từ cả hai ảnh để có thông tin đầy đủ
                var combinedResult = CombineOcrResults(frontResult, backResult);
                combinedResult.CccdFaceId = cccdFaceId;

                return combinedResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing FPT OCR");
                throw;
            }
        }

        private static string? _cascadeTempPath;
        private static readonly object CascadeLock = new object();

        /// <summary>
        /// Returns path to the Haar cascade XML file: from disk (output dir) or by extracting embedded resource to a temp file.
        /// Ensures the cascade is available when the app runs from the startup project (e.g. RentalCar) where Content from Infrastructure is not copied.
        /// </summary>
        private string? GetCascadePath()
        {
            var baseDir = AppContext.BaseDirectory;
            var path1 = Path.Combine(baseDir, "Cascades", "haarcascade_frontalface_default.xml");
            if (File.Exists(path1)) return path1;
            var path2 = Path.Combine(baseDir, "haarcascade_frontalface_default.xml");
            if (File.Exists(path2)) return path2;

            if (_cascadeTempPath != null && File.Exists(_cascadeTempPath))
                return _cascadeTempPath;

            lock (CascadeLock)
            {
                if (_cascadeTempPath != null && File.Exists(_cascadeTempPath))
                    return _cascadeTempPath;

                var assembly = typeof(FptKycOcrService).Assembly;
                const string resourceName = "CAR.Infrastructure.Cascades.haarcascade_frontalface_default.xml";
                using var stream = assembly.GetManifestResourceStream(resourceName);
                if (stream == null)
                {
                    _logger.LogWarning("Embedded cascade resource {Name} not found", resourceName);
                    return null;
                }

                var tempPath = Path.Combine(Path.GetTempPath(), $"haarcascade_frontalface_default_{Guid.NewGuid():N}.xml");
                try
                {
                    using var fs = new FileStream(tempPath, FileMode.Create, FileAccess.Write, FileShare.Read);
                    stream.CopyTo(fs);
                    _cascadeTempPath = tempPath;
                    _logger.LogInformation("Haar cascade extracted to temp file for face detection");
                    return _cascadeTempPath;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to extract cascade to temp file");
                    try { File.Delete(tempPath); } catch { /* ignore */ }
                    return null;
                }
            }
        }

        /// <summary>
        /// Detects face on CCCD front image, crops the face region, and saves only the cropped face to the store.
        /// Ensures later verification compares CCCD_FACE vs SELFIE_FACE, not full ID image.
        /// Returns null if no face is detected (caller should return FAIL).
        /// </summary>
        private async Task<string?> SaveOriginalCccdImageAsync(IFormFile frontImage)
        {
            if (frontImage == null || frontImage.Length == 0)
            {
                _logger.LogWarning("SaveOriginalCccdImageAsync: no front image");
                return null;
            }

            byte[] imageBytes;
            await using (var stream = frontImage.OpenReadStream())
            using (var ms = new MemoryStream())
            {
                await stream.CopyToAsync(ms);
                imageBytes = ms.ToArray();
            }

            if (imageBytes.Length == 0)
            {
                _logger.LogWarning("SaveOriginalCccdImageAsync: empty image bytes");
                return null;
            }

            using var src = Cv2.ImDecode(imageBytes, ImreadModes.Color);
            if (src.Empty())
            {
                _logger.LogWarning("SaveOriginalCccdImageAsync: could not decode image");
                return null;
            }

            var cascadePath = GetCascadePath();
            if (string.IsNullOrEmpty(cascadePath))
            {
                _logger.LogError("Haar cascade not available; cannot detect face on CCCD");
                return null;
            }

            using var gray = new Mat();
            Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.EqualizeHist(gray, gray);

            using var cascade = new CascadeClassifier(cascadePath);
            var faces = cascade.DetectMultiScale(gray, 1.1, 5, HaarDetectionTypes.DoRoughSearch, new OpenCvSharp.Size(30, 30));

            if (faces == null || faces.Length == 0)
            {
                _logger.LogWarning("SaveOriginalCccdImageAsync: no face detected on CCCD front image");
                return null;
            }

            // Use the largest detected face (ID photo is usually the main face on the card)
            var faceRect = faces[0];
            foreach (var r in faces)
            {
                if (r.Width * r.Height > faceRect.Width * faceRect.Height)
                    faceRect = r;
            }

            var imageWidth = src.Width;
            var imageHeight = src.Height;
            var imageArea = imageWidth * imageHeight;
            var faceArea = faceRect.Width * faceRect.Height;
            _logger.LogInformation(
                "SaveOriginalCccdImageAsync: face area vs image area — face={FaceArea} ({FaceW}x{FaceH}), image={ImageArea} ({ImageW}x{ImageH}), faceAreaPercent={Percent:F2}%",
                faceArea, faceRect.Width, faceRect.Height, imageArea, imageWidth, imageHeight,
                imageArea > 0 ? (100.0 * faceArea / imageArea) : 0);

            const double minFaceFraction = 0.10;
            if (imageWidth <= 0 || imageHeight <= 0)
            {
                _logger.LogWarning("SaveOriginalCccdImageAsync: invalid image dimensions");
                return null;
            }
            if (faceRect.Width < minFaceFraction * imageWidth || faceRect.Height < minFaceFraction * imageHeight)
            {
                _logger.LogWarning(
                    "SaveOriginalCccdImageAsync: face too small — face {FaceW}x{FaceH}, image {ImageW}x{ImageH} (min {MinPct}% each dimension)",
                    faceRect.Width, faceRect.Height, imageWidth, imageHeight, minFaceFraction * 100);
                return null;
            }

            const double minAspect = 0.5;
            const double maxAspect = 2.0;
            var aspectRatio = faceRect.Width > 0 ? (double)faceRect.Height / faceRect.Width : 0;
            if (aspectRatio < minAspect || aspectRatio > maxAspect)
            {
                _logger.LogWarning(
                    "SaveOriginalCccdImageAsync: unrealistic face aspect ratio — height/width={Aspect:F2} (valid range {Min}-{Max})",
                    aspectRatio, minAspect, maxAspect);
                return null;
            }

            // Add padding and clamp to image bounds
            const int padding = 10;
            var x = Math.Max(0, faceRect.X - padding);
            var y = Math.Max(0, faceRect.Y - padding);
            var w = Math.Min(src.Width - x, faceRect.Width + 2 * padding);
            var h = Math.Min(src.Height - y, faceRect.Height + 2 * padding);
            var cropRect = new Rect(x, y, w, h);

            using var faceCrop = new Mat(src, cropRect);
            using var faceClone = faceCrop.Clone();

            if (!Cv2.ImEncode(".jpg", faceClone, out var croppedBytes) || croppedBytes == null || croppedBytes.Length == 0)
            {
                _logger.LogWarning("SaveOriginalCccdImageAsync: failed to encode cropped face");
                return null;
            }

            try
            {
                var tempUserId = $"temp_{Guid.NewGuid():N}";
                await using var croppedStream = new MemoryStream(croppedBytes);
                var faceId = await _faceStore.SaveFaceAsync(croppedStream, tempUserId);
                _logger.LogInformation("CCCD cropped face saved with ID: {FaceId} (face region only, for ID_FACE vs SELFIE comparison)", faceId);
                return faceId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving cropped CCCD face");
                throw;
            }
        }

        private async Task<KycOcrResponseDto> ProcessSingleImageAsync(IFormFile image, string apiKey, string baseUrl, string imageType)
        {
            using var formData = new MultipartFormDataContent();
            using var imageStream = image.OpenReadStream();
            formData.Add(new StreamContent(imageStream), "image", image.FileName);

            var requestUrl = $"{baseUrl}/vision/idr/vnm";
            _logger.LogInformation("Calling FPT.AI OCR API for {ImageType}: {RequestUrl}", imageType, requestUrl);
            
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, requestUrl)
            {
                Headers = { { "api-key", apiKey } },
                Content = formData
            };

            var response = await _httpClient.SendAsync(httpRequest);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("FPT API returned error for {ImageType} {StatusCode}: {ErrorContent}", 
                    imageType, response.StatusCode, errorContent);
                
                return new KycOcrResponseDto
                {
                    FullName = "",
                    Dob = "",
                    Gender = "",
                    CccdNumber = "",
                    CccdFaceId = "",
                    FrontImageUrl = "",
                    BackImageUrl = "",
                    ErrorMessage = $"Không thể xác thực ảnh {imageType}. Vui lòng tải lên ảnh rõ nét, đủ sáng và không bị mờ."
                };
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("FPT.AI Response for {ImageType}: {ResponseContent}", imageType, responseContent);
            
            var fptResponse = JsonSerializer.Deserialize<FptOcrResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (fptResponse?.Data == null || fptResponse.Data.Count == 0)
            {
                return new KycOcrResponseDto
                {
                    FullName = "",
                    Dob = "",
                    Gender = "",
                    CccdNumber = "",
                    CccdFaceId = "",
                    FrontImageUrl = "",
                    BackImageUrl = "",
                    ErrorMessage = $"Không thể nhận dạng thông tin từ ảnh {imageType}."
                };
            }

            return MapFptResponseToKycResponse(fptResponse.Data);
        }

        private KycOcrResponseDto CombineOcrResults(KycOcrResponseDto frontResult, KycOcrResponseDto backResult)
        {
            // Ưu tiên thông tin từ ảnh trước, nếu trống thì lấy từ ảnh sau
            var combined = new KycOcrResponseDto
            {
                FullName = !string.IsNullOrEmpty(frontResult.FullName) ? frontResult.FullName : backResult.FullName,
                Dob = !string.IsNullOrEmpty(frontResult.Dob) ? frontResult.Dob : backResult.Dob,
                Gender = !string.IsNullOrEmpty(frontResult.Gender) ? frontResult.Gender : backResult.Gender,
                CccdNumber = !string.IsNullOrEmpty(frontResult.CccdNumber) ? frontResult.CccdNumber : backResult.CccdNumber,
                CccdFaceId = frontResult.CccdFaceId ?? backResult.CccdFaceId,
                Address = !string.IsNullOrEmpty(frontResult.Address) ? frontResult.Address : backResult.Address,
                FrontImageUrl = !string.IsNullOrEmpty(frontResult.FrontImageUrl) ? frontResult.FrontImageUrl : backResult.FrontImageUrl,
                BackImageUrl = !string.IsNullOrEmpty(backResult.BackImageUrl) ? backResult.BackImageUrl : frontResult.BackImageUrl,
                ErrorMessage = frontResult.ErrorMessage ?? backResult.ErrorMessage
            };

            // Nếu cả hai đều có lỗi, trả về lỗi chi tiết hơn
            if (!string.IsNullOrEmpty(frontResult.ErrorMessage) && !string.IsNullOrEmpty(backResult.ErrorMessage))
            {
                combined.ErrorMessage = "Không thể xác thực cả ảnh trước và ảnh sau. Vui lòng kiểm tra lại chất lượng hình ảnh.";
            }

            return combined;
        }

        private KycOcrResponseDto MapFptResponseToKycResponse(List<FptOcrData> data)
        {
            var fptData = data[0];
            
            // Auto reject if confidence scores are too low
            if (decimal.TryParse(fptData.IdProb, out var idProb) && idProb < 90m ||
                decimal.TryParse(fptData.NameProb, out var nameProb) && nameProb < 90m ||
                decimal.TryParse(fptData.OverallScore, out var overallScore) && overallScore < 95m)
            {
                return new KycOcrResponseDto
                {
                    FullName = "",
                    Dob = "",
                    Gender = "",
                    CccdNumber = "",
                    CccdFaceId = "",
                    FrontImageUrl = "",
                    BackImageUrl = "",
                    ErrorMessage = "Chất lượng hình ảnh thấp. Vui lòng tải lên ảnh rõ nét, đủ sáng và không bị mờ."
                };
            }
            
            return new KycOcrResponseDto
            {
                FullName = fptData.Name ?? "",
                Dob = FormatDate(fptData.Dob),
                Gender = MapGender(fptData.Sex),
                CccdNumber = fptData.Id ?? "",
                CccdFaceId = "",
                Address = string.IsNullOrEmpty(fptData.Address) ? fptData.Home : fptData.Address,
                FrontImageUrl = "https://via.placeholder.com/400x250/cccccc/000000?text=CCCD+Front",
                BackImageUrl = "https://via.placeholder.com/400x250/cccccc/000000?text=CCCD+Back"
            };
        }

        private string FormatDate(string dateOfBirth)
        {
            if (string.IsNullOrEmpty(dateOfBirth))
                return "";

            if (DateTime.TryParse(dateOfBirth, out var date))
                return date.ToString("yyyy-MM-dd");

            return dateOfBirth;
        }

        private string MapGender(string gender)
        {
            if (string.IsNullOrEmpty(gender))
                return "Unknown";

            return gender.ToLower() switch
            {
                "nam" or "male" => "Male",
                "nữ" or "nu" or "female" => "Female",
                _ => "Unknown"
            };
        }
    }

    internal class FptOcrResponse
    {
        public int ErrorCode { get; set; }
        public string ErrorMessage { get; set; }
        public List<FptOcrData> Data { get; set; }
    }

    internal class FptOcrData
    {
        public string Id { get; set; }
        public string IdProb { get; set; }
        public string Name { get; set; }
        public string NameProb { get; set; }
        public string Dob { get; set; }
        public string DobProb { get; set; }
        public string Sex { get; set; }
        public string SexProb { get; set; }
        public string Nationality { get; set; }
        public string Home { get; set; }
        public string Address { get; set; }
        public string Doe { get; set; }
        public string OverallScore { get; set; }
        public string Type { get; set; }
    }
}
