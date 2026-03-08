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
        private readonly IPaymentService _paymentService;

        public OwnerAdvertisementController(
            IOwnerAdvertisementService ownerAdvertisementService,
            IPaymentService paymentService)
        {
            _ownerAdvertisementService = ownerAdvertisementService;
            _paymentService = paymentService;
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
        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateAdOrderRequest request)
        {
            var userId = GetUserId();
            var adOrderId = await _ownerAdvertisementService.CreateAdOrderAsync(userId, request.AdPackageId);
            return Ok(new { adOrderId });
        }

        /// <summary>Mua gói quảng cáo ngay không qua VNPay (tạo credit trực tiếp, dùng cho test/khuyến mãi).</summary>
        [HttpPost("purchase-direct")]
        public async Task<IActionResult> PurchaseDirect([FromBody] PurchaseAdPackageRequest request)
        {
            var userId = GetUserId();
            var result = await _ownerAdvertisementService.PurchaseAdPackageAsync(userId, request.AdPackageId);
            return Ok(result);
        }

        /// <summary>Áp dụng quảng cáo lên một bài đã duyệt (dùng 1 credit).</summary>
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyToPost([FromBody] ApplyAdToPostRequest request)
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

    public class PurchaseAdPackageRequest
    {
        public int AdPackageId { get; set; }
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
