using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Creates a VNPay payment URL for the given subscription.
        /// </summary>
        [HttpPost("create/{subscriptionId:int}")]
        [Authorize]
        public async Task<IActionResult> CreatePayment(int subscriptionId)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString()
                            ?? "127.0.0.1";

            var paymentUrl = await _paymentService.CreatePaymentUrlAsync(subscriptionId, ipAddress);

            return Ok(new { paymentUrl });
        }

        /// <summary>
        /// Creates a VNPay payment URL for an ad order (nhập adOrderId sau khi đã gọi create-order).
        /// </summary>
        [HttpPost("create/ad-order/{adOrderId:int}")]
        [Authorize]
        public async Task<IActionResult> CreatePaymentForAdOrder(int adOrderId)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString()
                            ?? "127.0.0.1";

            var paymentUrl = await _paymentService.CreatePaymentUrlForAdOrderAsync(adOrderId, ipAddress);

            return Ok(new { paymentUrl });
        }

        /// <summary>
        /// VNPay return callback – verifies hash and updates payment status (when VNPay redirects to backend).
        /// </summary>
        [HttpGet("vnpay-return")]
        [AllowAnonymous]
        public async Task<IActionResult> VnPayReturn()
        {
            var queryParams = Request.Query
                .ToDictionary(k => k.Key, v => v.Value.ToString());

            var result = await _paymentService.HandlePaymentReturnAsync(queryParams);

            return Ok(result);
        }

        /// <summary>
        /// Verify VNPay return from frontend (e.g. when ReturnUrl is frontend and frontend sends query params here).
        /// </summary>
        [HttpPost("verify-vnpay-return")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyVnPayReturn([FromBody] IDictionary<string, string> queryParams)
        {
            if (queryParams == null || queryParams.Count == 0)
            {
                return BadRequest(new { success = false, message = "Missing query params" });
            }

            var result = await _paymentService.HandlePaymentReturnAsync(queryParams);

            return Ok(result);
        }
    }
}
