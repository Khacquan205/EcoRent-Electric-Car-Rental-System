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
        /// VNPay return callback – verifies hash and updates payment status.
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
    }
}
