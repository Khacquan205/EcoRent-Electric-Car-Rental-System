using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CAR.Application.Dtos.Auth;
using CAR.Application.Interfaces.Services;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// register new user
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var result = await _authService.Register(request);
            return Ok(result);
        }
        /// <summary>
        /// verify user registration with otp
        /// </summary>
        [HttpPost("verify-registration")]
        public async Task<IActionResult> VerifyRegistration([FromBody] OtpVerificationRequestDto request)
        {
            var result = await _authService.VerifyRegistration(request);
            return Ok(result);
        }
        /// <summary>
        /// resend otp for user registration
        /// </summary>
        [HttpPost("resend-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequestDto request)
        {
            var result = await _authService.SendOtp(request);
            return Ok(result);
        }
        /// <summary>
        /// login user
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.Login(request);
            return Ok(result);
        }

        /// <summary>
        /// change password for authenticated user
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
        {
            // Get userId from JWT claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { Success = false, Message = "Invalid user token" });
            }

            var result = await _authService.ChangePassword(userId, request);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
