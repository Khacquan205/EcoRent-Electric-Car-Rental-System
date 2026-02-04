using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;
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
        private readonly string _kycProvider;

        public FptKycOcrService(HttpClient httpClient, IConfiguration configuration, ILogger<FptKycOcrService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
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
                FullName = "Nguyen Van A",
                Dob = "1998-01-01",
                Gender = "Male",
                CccdNumber = "012345678901"
            };
        }

        private async Task<KycOcrResponseDto> ProcessFptOcrAsync(KycOcrRequestDto request)
        {
            try
            {
                var apiKey = _configuration["KYC:Fpt:ApiKey"];
                var baseUrl = _configuration["KYC:Fpt:BaseUrl"] ?? "https://api.fpt.ai";

                if (string.IsNullOrEmpty(apiKey))
                {
                    throw new InvalidOperationException("FPT KYC API Key is not configured");
                }

                using var formData = new MultipartFormDataContent();
                
                // FPT.AI chỉ cần 1 image, không phân biệt front/back
                using var frontImageStream = request.FrontImage.OpenReadStream();
                formData.Add(new StreamContent(frontImageStream), "image", request.FrontImage.FileName);

                var requestUrl = $"{baseUrl}/vision/idr/vnm";
                _logger.LogInformation("Calling FPT.AI OCR API: {RequestUrl}", requestUrl);
                
                var httpRequest = new HttpRequestMessage(HttpMethod.Post, requestUrl)
                {
                    Headers = { { "api-key", apiKey } },
                    Content = formData
                };

                var response = await _httpClient.SendAsync(httpRequest);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("FPT API returned error {StatusCode}: {ErrorContent}", response.StatusCode, errorContent);
                    
                    return new KycOcrResponseDto
                    {
                        FullName = "",
                        Dob = "",
                        Gender = "",
                        CccdNumber = "",
                        ErrorMessage = "Không thể xác thực hình ảnh. Vui lòng tải lên ảnh rõ nét, đủ sáng và không bị mờ."
                    };
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("FPT.AI Response: {ResponseContent}", responseContent);
                
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
                        ErrorMessage = "Không thể nhận dạng thông tin từ hình ảnh. Vui lòng thử lại với ảnh khác."
                    };
                }

                return MapFptResponseToKycResponse(fptResponse.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing FPT OCR");
                throw;
            }
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
                    ErrorMessage = "Chất lượng hình ảnh thấp. Vui lòng tải lên ảnh rõ nét, đủ sáng và không bị mờ."
                };
            }
            
            return new KycOcrResponseDto
            {
                FullName = fptData.Name ?? "",
                Dob = FormatDate(fptData.Dob),
                Gender = MapGender(fptData.Sex),
                CccdNumber = fptData.Id ?? ""
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
