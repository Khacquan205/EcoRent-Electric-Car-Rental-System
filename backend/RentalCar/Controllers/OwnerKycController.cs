using CAR.Application.Dtos;

using CAR.Application.Dtos.OwnerKyc;

using CAR.Application.Interfaces.Services;

using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;

namespace RentalCar.Controllers

{

    [ApiController]

    [Route("api/owner/kyc")]

    [Authorize]

    public class OwnerKycController : ControllerBase

    {

        private readonly IOwnerKycService _ownerKycService;
        private readonly IKycOcrService _kycOcrService;
        private readonly IKycLivenessService _kycLivenessService;
        private readonly IMemoryCache _cache;

        public OwnerKycController(
            IOwnerKycService ownerKycService, 
            IKycOcrService kycOcrService, 
            IKycLivenessService kycLivenessService, 
            IMemoryCache cache)
        {
            _ownerKycService = ownerKycService;
            _kycOcrService = kycOcrService;
            _kycLivenessService = kycLivenessService;
            _cache = cache;
        }



        [HttpPost("ocr")]

        [Authorize(Roles = "CUSTOMER")]

        public async Task<IActionResult> ProcessOcr([FromForm] KycOcrRequestDto request)
        {
            var result = await _kycOcrService.ProcessOcrAsync(request);
            if (string.IsNullOrEmpty(result.ErrorMessage))
            {
                var userId = GetCurrentUserId();
                _cache.Set($"KycOcrPassed_{userId}", true, TimeSpan.FromMinutes(30));
            }
            return Ok(result);
        }



        [HttpPost("liveness-check")]

        [Authorize(Roles = "CUSTOMER")]

        public async Task<IActionResult> LivenessCheck([FromForm] KycLivenessRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (!_cache.TryGetValue($"KycOcrPassed_{userId}", out bool ocrPassed) || !ocrPassed)
            {
                return BadRequest(new { success = false, message = "Bạn phải thực hiện bước kiểm tra thông tin CCCD (OCR) thành công trước." });
            }

            var result = await _kycLivenessService.ProcessLivenessCheckAsync(request);
            if (result.IsLive && result.IsMatch)
            {
                _cache.Set($"KycLivenessPassed_{userId}", true, TimeSpan.FromMinutes(30));
            }
            return Ok(result);
        }



        [HttpPost("submit-kyc")]

        public async Task<IActionResult> SubmitKyc([FromBody] OwnerKycSubmitRequestDto request)
        {
            var userId = GetCurrentUserId();
            if (!_cache.TryGetValue($"KycLivenessPassed_{userId}", out bool livenessPassed) || !livenessPassed)
            {
                return BadRequest(new { success = false, message = "Bạn phải thực hiện xác định khuôn mặt (Liveness Check) thành công trước khi Submit KYC." });
            }

            await _ownerKycService.SubmitKycAsync(userId, request);

            _cache.Remove($"KycOcrPassed_{userId}");
            _cache.Remove($"KycLivenessPassed_{userId}");

            return Ok(new { 
                message = "KYC submitted successfully! You are now an OWNER.",
                fullName = request.FullName,
                dob = request.DateOfBirth,
                gender = request.Gender,
                cccdNumber = request.IdCardNumber,
                role = "OWNER"
            });
        }



        [HttpGet("status")]
        [Authorize(Roles = "CUSTOMER")]
        public async Task<IActionResult> GetStatus()
        {
            var userId = GetCurrentUserId();
            var status = await _ownerKycService.GetStatusAsync(userId);
            return Ok(status);
        }

        /// <summary>
        /// Get current owner profile
        /// </summary>
        [HttpGet("/api/Owner/me")]
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> GetOwnerProfile()
        {
            var userId = GetCurrentUserId();
            var result = await _ownerKycService.GetOwnerProfileAsync(userId);
            return Ok(result);
        }



        private int GetCurrentUserId()

        {

            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(claim, out var id) ? id : 0;

        }

    }

}

