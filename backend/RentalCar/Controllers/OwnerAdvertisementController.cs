using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/owner/advertisements")]
    [Authorize(Roles = "OWNER")]
    public class OwnerAdvertisementController : ControllerBase
    {
        private readonly IOwnerAdvertisementService _ownerAdvertisementService;

        public OwnerAdvertisementController(IOwnerAdvertisementService ownerAdvertisementService)
        {
            _ownerAdvertisementService = ownerAdvertisementService;
        }

        /// <summary>Danh sách gói quảng cáo đang bán (cho owner chọn mua).</summary>
        [HttpGet("packages")]
        public async Task<IActionResult> GetAdPackages()
        {
            var result = await _ownerAdvertisementService.GetActiveAdPackagesAsync();
            return Ok(result);
        }

        /// <summary>Credit quảng cáo của owner (còn bao nhiêu lần được dùng để boost bài).</summary>
        [HttpGet("my-credits")]
        public async Task<IActionResult> GetMyCredits()
        {
            var userId = GetUserId();
            var result = await _ownerAdvertisementService.GetMyAdCreditsAsync(userId);
            return Ok(result);
        }

        /// <summary>Tạo đơn mua gói quảng cáo (chỉ tạo đơn, chưa thanh toán). Trả về adOrderId để gọi API payment tạo URL.</summary>
        [HttpPost("create-ads")]
        public async Task<IActionResult> CreateAds([FromBody] CreateAdOrderRequest request)
        {
            var userId = GetUserId();
            var adOrderId = await _ownerAdvertisementService.CreateAdOrderAsync(userId, request.AdPackageId);
            return Ok(new { adOrderId });
        }

        /// <summary>Áp dụng quảng cáo lên một bài đã duyệt (dùng 1 credit).</summary>
        [HttpPost("apply-post-ad")]
        public async Task<IActionResult> ApplyPostAd([FromBody] ApplyAdToPostRequest request)
        {
            var userId = GetUserId();
            await _ownerAdvertisementService.ApplyAdToPostAsync(userId, request.PostId);
            return Ok(new { success = true, message = "Quảng cáo đã được áp dụng cho bài viết." });
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }
    }

    /// <summary>Request tạo đơn mua gói quảng cáo (giống create-subscription: chỉ nhập id package).</summary>
    public class CreateAdOrderRequest
    {
        public int AdPackageId { get; set; }
    }

    public class ApplyAdToPostRequest
    {
        public int PostId { get; set; }
    }
}
