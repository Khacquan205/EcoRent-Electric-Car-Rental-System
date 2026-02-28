using CAR.Application.Dtos.Moderation;
using CAR.Application.Dtos.OwnerKyc;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace RentalCar.Controllers
{
    [ApiController]
    [Route("api/moderation")]
    [Authorize(Roles = "ADMIN,STAFF")]
    public class ModerationController : ControllerBase
    {
        private readonly IPostModerationService _moderationService;

        public ModerationController(IPostModerationService moderationService)
        {
            _moderationService = moderationService;
        }

        [HttpGet("posts/pending")]
        public async Task<IActionResult> GetPendingPosts()
        {
            var posts = await _moderationService.GetPendingPostsAsync();
            return Ok(posts);
        }

        /// <summary>
        /// List posts for moderation dashboard. Optional filters: status (0=Pending, 1=Approved, 2=Rejected), ownerId, fromDate, toDate.
        /// </summary>
        [HttpGet("posts")]
        public async Task<IActionResult> GetModerationPosts([FromQuery] short? status, [FromQuery] int? ownerId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            var posts = await _moderationService.GetModerationPostsAsync(status, ownerId, fromDate, toDate);
            return Ok(posts);
        }

        [HttpPost("posts/{postId:int}/approve")]
        public async Task<IActionResult> ApprovePost(int postId)
        {
            var staffId = GetCurrentUserId();
            var result = await _moderationService.ApprovePostAsync(postId, staffId);
            return Ok(result);
        }

        [HttpPost("posts/{postId:int}/reject")]
        public async Task<IActionResult> RejectPost(int postId, [FromBody] RejectPostRequestDto request)
        {
            var staffId = GetCurrentUserId();
            var result = await _moderationService.RejectPostAsync(postId, staffId, request.Reason);
            return Ok(result);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }
    }
}
