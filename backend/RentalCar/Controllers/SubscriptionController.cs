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
        /// Create subscription for current owner
        /// </summary>
        [HttpPost("create-subscription")]
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionRequestDto request)
        {
            var userId = GetUserId();
            var result = await _subscriptionService.CreateSubscriptionAsync(userId, request);
            return Ok(result);
        }

        /// <summary>
        /// Get all subscriptions belonging to the authenticated owner
        /// </summary>
        [HttpGet("my-subscriptions")]
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> GetMySubscriptions()
        {
            var userId = GetUserId();
            var result = await _subscriptionService.GetOwnerSubscriptionsAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific subscription by ID
        /// </summary>
        [HttpGet("{subscriptionId}")]
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> GetSubscriptionDetail(int subscriptionId)
        {
            var userId = GetUserId();
            var result = await _subscriptionService.GetSubscriptionByIdAsync(subscriptionId, userId);
            return Ok(result);
        }

        /// <summary>
        /// Cancel a subscription
        /// </summary>
        [HttpDelete("{subscriptionId}")]
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> CancelSubscription(int subscriptionId)
        {
            var userId = GetUserId();
            await _subscriptionService.CancelSubscriptionAsync(subscriptionId, userId);
            return Ok(new { Success = true, Message = "Subscription cancelled successfully" });
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid user token");
            }
            return userId;
        }
    }
}
