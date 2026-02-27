using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class MockKycLivenessService : IKycLivenessService
    {
        private readonly ILogger<MockKycLivenessService> _logger;

        public MockKycLivenessService(ILogger<MockKycLivenessService> logger)
        {
            _logger = logger;
        }

        public async Task<KycLivenessResponseDto> ProcessLivenessCheckAsync(KycLivenessRequestDto request)
        {
            await Task.Delay(1000); // Simulate API call

            _logger.LogInformation("Using Mock KYC Liveness Service");

            // For testing: always return success with realistic response
            return new KycLivenessResponseDto
            {
                IsLive = true,
                IsMatch = true,
                Confidence = 0.96,
                Raw = new { 
                    code = "0",
                    message = "Success",
                    liveness = new {
                        code = "0",
                        message = "Liveness verified successfully",
                        is_live = "true",
                        spoof_prob = "0.04",
                        need_to_review = "false",
                        is_deepfake = "false",
                        deepfake_prob = "0.02",
                        warning = ""
                    },
                    face_match = new {
                        code = "0",
                        message = "Face matched successfully",
                        isMatch = "true",
                        similarity = "0.96",
                        warning = ""
                    },
                    timestamp = DateTime.UtcNow
                }
            };

            // Alternative: Return failure for testing
            /*
            return new KycLivenessResponseDto
            {
                IsLive = false,
                IsMatch = false,
                Confidence = 0,
                ErrorMessage = "Mock liveness check failed - testing error scenario"
            };
            */
        }
    }
}
