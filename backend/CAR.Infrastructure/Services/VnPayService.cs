using System.Security.Cryptography;
using System.Text;
using CAR.Application.Dtos.Payment;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using CAR.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CAR.Infrastructure.Services
{
    public class VnPayService : IPaymentService
    {
        private readonly VnPaySettings _settings;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOwnerSubscriptionRepository _subscriptionRepository;
        private readonly IUnitOfWork _unitOfWork;

        public VnPayService(
            IOptions<VnPaySettings> settings,
            IPaymentRepository paymentRepository,
            IOwnerSubscriptionRepository subscriptionRepository,
            IUnitOfWork unitOfWork)
        {
            _settings = settings.Value;
            _paymentRepository = paymentRepository;
            _subscriptionRepository = subscriptionRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<string> CreatePaymentUrlAsync(int subscriptionId, string ipAddress)
        {
            var subscription = await _subscriptionRepository.Query()
                .Include(s => s.Package)
                .FirstOrDefaultAsync(s => s.Id == subscriptionId);

            if (subscription == null)
                throw new UserFriendlyException(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found");

            var txnRef = $"{subscriptionId}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            var createDate = DateTime.UtcNow.AddHours(7); // GMT+7 (VNPay requires local time)

            var payment = new MPayment
            {
                SubscriptionId = subscriptionId,
                Amount = subscription.Package.Price,
                PaymentMethod = (int)PaymentMethod.VnPay,
                PaymentStatus = (int)PaymentStatus.Pending,
                TransactionCode = txnRef,
                CreatedAt = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment);
            await _unitOfWork.SaveChangesAsync();

            var vnpParams = new SortedDictionary<string, string>(StringComparer.Ordinal)
            {
                { "vnp_Version",    "2.1.0" },
                { "vnp_Command",    "pay" },
                { "vnp_TmnCode",    _settings.TmnCode },
                { "vnp_Amount",     ((long)(subscription.Package.Price * 100)).ToString() },
                { "vnp_CurrCode",   "VND" },
                { "vnp_TxnRef",     txnRef },
                { "vnp_OrderInfo",  $"Thanh toan goi dang ky {subscriptionId}" },
                { "vnp_OrderType",  "other" },
                { "vnp_Locale",     "vn" },
                { "vnp_ReturnUrl",  _settings.ReturnUrl },
                { "vnp_IpAddr",     ipAddress },
                { "vnp_CreateDate", createDate.ToString("yyyyMMddHHmmss") }
            };

            return BuildPaymentUrl(vnpParams);
        }

        public async Task<PaymentResponseDto> HandlePaymentReturnAsync(IDictionary<string, string> queryParams)
        {
            // Separate secure hash before verification
            queryParams.TryGetValue("vnp_SecureHash", out var receivedHash);

            var paramsToVerify = queryParams
                .Where(p => p.Key != "vnp_SecureHash" && p.Key != "vnp_SecureHashType")
                .OrderBy(p => p.Key, StringComparer.Ordinal)
                .ToList();

            var hashData = string.Join("&", paramsToVerify.Select(p => $"{p.Key}={p.Value}"));
            var computedHash = GenerateHmacSha512(_settings.HashSecret, hashData);

            if (!string.Equals(computedHash, receivedHash, StringComparison.OrdinalIgnoreCase))
            {
                return new PaymentResponseDto
                {
                    Success = false,
                    ResponseCode = "97",
                    Message = "Invalid signature"
                };
            }

            queryParams.TryGetValue("vnp_TxnRef", out var txnRef);
            queryParams.TryGetValue("vnp_ResponseCode", out var responseCode);
            queryParams.TryGetValue("vnp_TransactionNo", out var vnpayTxnId);
            queryParams.TryGetValue("vnp_Amount", out var amountStr);
            queryParams.TryGetValue("vnp_PayDate", out var payDateStr);

            var payment = await _paymentRepository.GetByTransactionCodeAsync(txnRef ?? string.Empty);

            if (payment == null)
            {
                return new PaymentResponseDto
                {
                    Success = false,
                    ResponseCode = responseCode,
                    Message = "Payment record not found"
                };
            }

            var isSuccess = responseCode == "00";

            payment.PaymentStatus = isSuccess ? (int)PaymentStatus.Success : (int)PaymentStatus.Failed;
            payment.VnpayTransactionId = vnpayTxnId;
            payment.ResponseCode = responseCode;
            payment.UpdatedAt = DateTime.UtcNow;

            if (DateTime.TryParseExact(payDateStr, "yyyyMMddHHmmss",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var payDate))
            {
                payment.PayDate = payDate;
            }

            _paymentRepository.Update(payment);
            await _unitOfWork.SaveChangesAsync();

            decimal.TryParse(amountStr, out var rawAmount);

            return new PaymentResponseDto
            {
                Success = isSuccess,
                OrderId = txnRef,
                TransactionId = vnpayTxnId,
                Amount = rawAmount / 100,
                ResponseCode = responseCode,
                Message = isSuccess ? "Payment successful" : "Payment failed",
                PayDate = payment.PayDate
            };
        }

        // ──────────────────────────────────────────────────────────────
        // Helpers
        // ──────────────────────────────────────────────────────────────

        private string BuildPaymentUrl(SortedDictionary<string, string> vnpParams)
        {
            var hashData = string.Join("&", vnpParams.Select(p => $"{p.Key}={p.Value}"));
            var secureHash = GenerateHmacSha512(_settings.HashSecret, hashData);

            var queryString = string.Join("&",
                vnpParams.Select(p => $"{Uri.EscapeDataString(p.Key)}={Uri.EscapeDataString(p.Value)}"));

            return $"{_settings.BaseUrl}?{queryString}&vnp_SecureHash={secureHash}";
        }

        private static string GenerateHmacSha512(string key, string data)
        {
            using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return Convert.ToHexString(hash).ToLower();
        }
    }
}
