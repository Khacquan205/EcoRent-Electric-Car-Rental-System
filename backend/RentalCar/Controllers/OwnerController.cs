using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OwnerController : ControllerBase
    {
        private readonly IOwnerService _ownerService;
        private readonly IIdentityVerificationService _identityVerificationService;

        public OwnerController(
            IOwnerService ownerService,
            IIdentityVerificationService identityVerificationService)
        {
            _ownerService = ownerService;
            _identityVerificationService = identityVerificationService;
        }

        /// <summary>
        /// Register current user as an owner
        /// </summary>
        [HttpPost("register-owner")]
        public async Task<IActionResult> RegisterOwner([FromBody] RegisterOwnerRequestDto request)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { Success = false, Message = "Invalid user token" });
            }

            var result = await _ownerService.RegisterOwnerAsync(userId, request);
            return Ok(result);
        }

        /// <summary>
        /// Verify owner identity (auto-verify)
        /// </summary>
        [HttpPost("verify-identity")]
        public async Task<IActionResult> VerifyIdentity([FromBody] VerifyIdentityRequestDto request)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { Success = false, Message = "Invalid user token" });
            }

            var result = await _identityVerificationService.VerifyIdentityAsync(userId, request);
            return Ok(result);
        }

        /// <summary>
        /// Get current owner profile
        /// </summary>
        [HttpGet("me")]
        public async Task<IActionResult> GetOwnerProfile()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { Success = false, Message = "Invalid user token" });
            }

            var result = await _identityVerificationService.GetOwnerProfileAsync(userId);
            return Ok(result);
        }
    }
}
