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
    [Authorize(Roles = "ADMIN")]
    public class ModerationController : ControllerBase
    {
        private readonly IPostModerationService _moderationService;
        private readonly IOwnerKycService _ownerKycService;

        public ModerationController(IPostModerationService moderationService, IOwnerKycService ownerKycService)
        {
            _moderationService = moderationService;
            _ownerKycService = ownerKycService;
        }

        [HttpGet("posts/pending")]
        public async Task<IActionResult> GetPendingPosts()
        {
            var posts = await _moderationService.GetPendingPostsAsync();
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

        // ── KYC ──────────────────────────────────────────────────────────

        [HttpGet("kyc/pending")]
        public async Task<IActionResult> GetPendingKyc()
        {
            var list = await _ownerKycService.GetPendingKycAsync();
            return Ok(list);
        }

        [HttpPost("kyc/{ownerProfileId:int}/approve")]
        public async Task<IActionResult> ApproveKyc(int ownerProfileId)
        {
            var adminId = GetCurrentUserId();
            await _ownerKycService.ApproveKycAsync(ownerProfileId, adminId);
            return Ok(new { message = "KYC approved" });
        }

        [HttpPost("kyc/{ownerProfileId:int}/reject")]
        public async Task<IActionResult> RejectKyc(int ownerProfileId, [FromBody] RejectOwnerKycRequestDto request)
        {
            var adminId = GetCurrentUserId();
            await _ownerKycService.RejectKycAsync(ownerProfileId, adminId, request.Reason);
            return Ok(new { message = "KYC rejected" });
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }
    }
}
