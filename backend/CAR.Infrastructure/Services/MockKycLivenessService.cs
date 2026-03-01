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
            await Task.Delay(1000);

            if (request == null || request.Video == null || string.IsNullOrEmpty(request.CccdFaceId))
            {
                _logger.LogWarning("Mock liveness: invalid request, returning FAIL");
                return new KycLivenessResponseDto
                {
                    IsLive = false,
                    IsMatch = false,
                    Confidence = 0,
                    ErrorMessage = "Video and CccdFaceId are required"
                };
            }

            _logger.LogInformation("Using Mock KYC Liveness Service: matchScore=0.96, isMatched=true");
            return new KycLivenessResponseDto
            {
                IsLive = true,
                IsMatch = true,
                Confidence = 0.96,
                Raw = new { message = "Mock response for testing" }
            };
        }

        public async Task<KycLivenessResponseDto> ProcessSelfieMatchAsync(KycSelfieMatchRequestDto request)
        {
            await Task.Delay(500);

            if (request == null || request.SelfieImage == null || string.IsNullOrEmpty(request.CccdFaceId))
            {
                _logger.LogWarning("Mock selfie match: invalid request, returning FAIL");
                return new KycLivenessResponseDto
                {
                    IsLive = true,
                    IsMatch = false,
                    Confidence = 0,
                    ErrorMessage = "Selfie image and CccdFaceId are required"
                };
            }

            _logger.LogInformation("Using Mock KYC Liveness Service for selfie match: matchScore=0.92, isMatched=true");
            return new KycLivenessResponseDto
            {
                IsLive = true,
                IsMatch = true,
                Confidence = 0.92,
                Raw = new { message = "Mock selfie match success" }
            };
        }
    }
}
