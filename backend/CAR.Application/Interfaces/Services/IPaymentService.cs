using CAR.Application.Dtos.Payment;

namespace CAR.Application.Interfaces.Services
{
    public interface IPaymentService
    {
        /// <summary>
        /// Creates a VNPay payment URL for a pending subscription and persists a Pending payment record.
        /// </summary>
        Task<string> CreatePaymentUrlAsync(int subscriptionId, string ipAddress);

        /// <summary>
        /// Creates a VNPay payment URL for an ad order (mua gói quảng cáo).
        /// </summary>
        Task<string> CreatePaymentUrlForAdOrderAsync(int adOrderId, string ipAddress);

        /// <summary>
        /// Verifies the VNPay return callback, updates the payment record, and returns the result.
        /// </summary>
        Task<PaymentResponseDto> HandlePaymentReturnAsync(IDictionary<string, string> queryParams);
    }
}
