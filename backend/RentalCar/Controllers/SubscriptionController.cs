using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "OWNER,STAFF,ADMIN")]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        /// <summary>
        /// Activate subscription for current owner
        /// </summary>
        [HttpPost("activate-subscription")]
        public async Task<IActionResult> ActivateSubscription([FromBody] ActivateSubscriptionRequestDto request)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { Success = false, Message = "Invalid user token" });
            }

            var result = await _subscriptionService.ActivateSubscriptionAsync(userId, request);
            return Ok(result);
        }
    }
}
