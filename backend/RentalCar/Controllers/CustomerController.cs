using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CAR.Application.Interfaces.Services;
using CAR.Application.Dtos;

namespace RentalCar.Controllers
{
    [ApiController]
    [Route("api/customer")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ICustomerKycService _customerKycService;
        private readonly ILogger<CustomerController> _logger;

        public CustomerController(
            ICustomerService customerService,
            ICustomerKycService customerKycService,
            ILogger<CustomerController> logger)
        {
            _customerService = customerService;
            _customerKycService = customerKycService;
            _logger = logger;
        }

        #region Profile Management

        /// <summary>
        /// Get customer profile information
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                // Get UserId from JWT token
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation("JWT UserId claim: {UserIdClaim}", userIdClaim);
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    _logger.LogWarning("Invalid user token. UserIdClaim: {UserIdClaim}", userIdClaim);
                    return Unauthorized("Invalid user token");
                }

                _logger.LogInformation("Getting profile for UserId: {UserId}", userId);
                var profile = await _customerService.GetCustomerProfileAsync(userId);
                
                if (profile == null)
                {
                    _logger.LogWarning("Customer profile not found for UserId: {UserId}", userId);
                    return NotFound("Customer profile not found");
                }

                _logger.LogInformation("Profile found for UserId: {UserId}", userId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer profile");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update customer profile information
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateCustomerProfileRequestDto request)
        {
            try
            {
                // Get UserId from JWT token
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("Invalid user token");
                }

                var updatedProfile = await _customerService.UpdateCustomerProfileAsync(userId, request);
                if (updatedProfile == null)
                {
                    return NotFound("Customer profile not found");
                }

                return Ok(updatedProfile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer profile");
                return StatusCode(500, "Internal server error");
            }
        }

        #endregion

        #region KYC Verification

        /// <summary>
        /// Process KYC OCR for customer identity verification
        /// </summary>
        [HttpPost("kyc/ocr")]
        public async Task<IActionResult> ProcessOcr([FromForm] KycOcrRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return BadRequest(new { message = "Invalid user token" });
                }
                
                var result = await _customerKycService.ProcessKycOcrAsync(userId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing KYC OCR" });
            }
        }

        /// <summary>
        /// Send OTP to phone number for KYC verification
        /// </summary>
        [HttpPost("kyc/send-otp")]
        public async Task<IActionResult> SendPhoneOtp([FromBody] KycPhoneRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return BadRequest(new { message = "Invalid user token" });
                }
                var result = await _customerKycService.SendPhoneOtpAsync(userId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending OTP" });
            }
        }

        /// <summary>
        /// Verify OTP code for KYC phone verification
        /// </summary>
        [HttpPost("kyc/verify-otp")]
        public async Task<IActionResult> VerifyPhoneOtp([FromBody] KycOtpRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return BadRequest(new { message = "Invalid user token" });
                }
                var result = await _customerKycService.VerifyPhoneOtpAsync(userId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while verifying OTP" });
            }
        }

        /// <summary>
        /// Confirm KYC information after OCR and phone verification
        /// </summary>
        [HttpPost("kyc/confirm")]
        public async Task<IActionResult> ConfirmKyc([FromBody] KycConfirmRequestDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return BadRequest(new { message = "Invalid user token" });
                }
                var result = await _customerKycService.ConfirmKycAsync(userId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while confirming KYC" });
            }
        }

        /// <summary>
        /// Get current KYC status
        /// </summary>
        [HttpGet("kyc/status")]
        public async Task<IActionResult> GetKycStatus()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return BadRequest(new { message = "Invalid user token" });
            }
            var result = await _customerKycService.GetKycStatusAsync(userId);
            return Ok(result);
        }

        #endregion
    }
}
