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

        public OwnerController(IOwnerService ownerService)
        {
            _ownerService = ownerService;
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

            // This would need to be implemented in OwnerService
            // For now, return a placeholder response
            return Ok(new { Success = true, Message = "Owner profile endpoint - to be implemented" });
        }
    }
}
