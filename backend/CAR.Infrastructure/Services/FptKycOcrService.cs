using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
                
                // Lưu ảnh CCCD gốc để dùng cho liveness check
                var cccdFaceId = await SaveOriginalCccdImageAsync(request.FrontImage);
                
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

        
        private async Task<string> SaveOriginalCccdImageAsync(IFormFile frontImage)
        {
            try
            {
                // Generate a temporary userId for face storage
                var tempUserId = $"temp_{Guid.NewGuid():N}";
                var faceId = await _faceStore.SaveFaceAsync(frontImage.OpenReadStream(), tempUserId);
                _logger.LogInformation("CCCD front image saved with ID: {FaceId}", faceId);
                return faceId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving CCCD front image");
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
