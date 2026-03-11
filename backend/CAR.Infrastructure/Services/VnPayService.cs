using System.Security.Cryptography;
using System.Text;
using CAR.Application.Dtos.Payment;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CAR.Infrastructure.Services
{
    public class VnPayService : IPaymentService
    {
        private const short SubscriptionStatusActive = 1;
        private const short SubscriptionStatusInactive = 2;

        private readonly VnPaySettings _settings;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOwnerSubscriptionRepository _subscriptionRepository;
        private readonly IAdOrderRepository _adOrderRepository;
        private readonly IOwnerAdCreditRepository _ownerAdCreditRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly AppDbContext _dbContext;

        public VnPayService(
            IOptions<VnPaySettings> settings,
            IPaymentRepository paymentRepository,
            IOwnerSubscriptionRepository subscriptionRepository,
            IAdOrderRepository adOrderRepository,
            IOwnerAdCreditRepository ownerAdCreditRepository,
            IUnitOfWork unitOfWork,
            AppDbContext dbContext)
        {
            _settings = settings.Value;
            _paymentRepository = paymentRepository;
            _subscriptionRepository = subscriptionRepository;
            _adOrderRepository = adOrderRepository;
            _ownerAdCreditRepository = ownerAdCreditRepository;
            _unitOfWork = unitOfWork;
            _dbContext = dbContext;
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
                PaymentType = (int)PaymentType.Subscription,
                SubscriptionId = subscriptionId,
                AdOrderId = null,
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

        public async Task<string> CreatePaymentUrlForAdOrderAsync(int adOrderId, string ipAddress)
        {
            var order = await _adOrderRepository.GetByIdAsync(adOrderId);
            if (order == null)
                throw new UserFriendlyException(404, "AD_ORDER_NOT_FOUND", "Ad order not found");
            if (order.Status != 0)
                throw new UserFriendlyException(400, "AD_ORDER_ALREADY_PAID", "Ad order already paid");

            var txnRef = $"AD-{adOrderId}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            var createDate = DateTime.UtcNow.AddHours(7);

            var payment = new MPayment
            {
                PaymentType = (int)PaymentType.AdPackage,
                SubscriptionId = null,
                AdOrderId = adOrderId,
                Amount = order.Amount,
                PaymentMethod = (int)PaymentMethod.VnPay,
                PaymentStatus = (int)PaymentStatus.Pending,
                TransactionCode = txnRef,
                CreatedAt = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment);
            await _unitOfWork.SaveChangesAsync();

            var vnpParams = new SortedDictionary<string, string>(StringComparer.Ordinal)
            {
                { "vnp_Version", "2.1.0" },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", _settings.TmnCode },
                { "vnp_Amount", ((long)(order.Amount * 100)).ToString() },
                { "vnp_CurrCode", "VND" },
                { "vnp_TxnRef", txnRef },
                { "vnp_OrderInfo", $"Thanh toan goi quang cao {order.AdPackage?.Name ?? adOrderId.ToString()}" },
                { "vnp_OrderType", "other" },
                { "vnp_Locale", "vn" },
                { "vnp_ReturnUrl", _settings.ReturnUrl },
                { "vnp_IpAddr", ipAddress },
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

            var hashData = string.Join("&", paramsToVerify.Select(p => 
                $"{System.Net.WebUtility.UrlEncode(p.Key)}={System.Net.WebUtility.UrlEncode(p.Value)}"));
            
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

            decimal.TryParse(amountStr, out var rawAmount);

            if (isSuccess)
            {
                if (payment.SubscriptionId != null)
                {
                    var subscription = await _subscriptionRepository.Query()
                        .FirstOrDefaultAsync(s => s.Id == payment.SubscriptionId);
                    if (subscription != null)
                    {
                        var strategy = _dbContext.Database.CreateExecutionStrategy();
                        await strategy.ExecuteAsync(async () =>
                        {
                            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
                            try
                            {
                                var otherActives = await _subscriptionRepository.Query()
                                    .Where(s => s.OwnerId == subscription.OwnerId && s.Status == SubscriptionStatusActive && s.Id != subscription.Id)
                                    .ToListAsync();
                                foreach (var s in otherActives)
                                {
                                    s.Status = SubscriptionStatusInactive;
                                    s.UpdatedAt = DateTime.UtcNow;
                                    _subscriptionRepository.Update(s);
                                }
                                subscription.Status = SubscriptionStatusActive;
                                subscription.UpdatedAt = DateTime.UtcNow;
                                _subscriptionRepository.Update(subscription);
                                await _unitOfWork.SaveChangesAsync();
                                await transaction.CommitAsync();
                            }
                            catch
                            {
                                await transaction.RollbackAsync();
                                throw;
                            }
                        });
                        await _unitOfWork.SaveChangesAsync();
                        return new PaymentResponseDto
                        {
                            Success = true,
                            OrderId = txnRef,
                            TransactionId = vnpayTxnId,
                            Amount = rawAmount / 100,
                            ResponseCode = responseCode,
                            Message = "Payment successful",
                            PayDate = payment.PayDate
                        };
                    }
                }
                else if (payment.AdOrderId != null)
                {
                    var adOrder = await _adOrderRepository.GetByIdAsync(payment.AdOrderId.Value);
                    if (adOrder != null && adOrder.Status == 0)
                    {
                        var pkg = adOrder.AdPackage;
                        var strategy = _dbContext.Database.CreateExecutionStrategy();
                        await strategy.ExecuteAsync(async () =>
                        {
                            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
                            try
                            {
                                var credit = new MOwnerAdCredit
                                {
                                    OwnerId = adOrder.OwnerId,
                                    AdPackageId = adOrder.AdPackageId,
                                    RemainingPosts = pkg?.MaxPosts ?? 1,
                                    DurationDays = pkg?.DurationDays ?? 7,
                                    CreatedAt = DateTime.UtcNow
                                };
                                await _ownerAdCreditRepository.AddAsync(credit);
                                adOrder.Status = 1;
                                adOrder.UpdatedAt = DateTime.UtcNow;
                                _adOrderRepository.Update(adOrder);
                                await _unitOfWork.SaveChangesAsync();
                                await transaction.CommitAsync();
                            }
                            catch
                            {
                                await transaction.RollbackAsync();
                                throw;
                            }
                        });
                        return new PaymentResponseDto
                        {
                            Success = true,
                            OrderId = txnRef,
                            TransactionId = vnpayTxnId,
                            Amount = rawAmount / 100,
                            ResponseCode = responseCode,
                            Message = "Thanh toan goi quang cao thanh cong",
                            PayDate = payment.PayDate
                        };
                    }
                }
            }

            await _unitOfWork.SaveChangesAsync();

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
            // For VNPay 2.1.0, the hash data MUST be URL-encoded just like the query string
            var hashData = string.Join("&", vnpParams.Select(p => 
                $"{System.Net.WebUtility.UrlEncode(p.Key)}={System.Net.WebUtility.UrlEncode(p.Value)}"));
            
            var secureHash = GenerateHmacSha512(_settings.HashSecret, hashData);

            var queryString = hashData; // They are the same in 2.1.0

            return $"{_settings.BaseUrl}?{queryString}&vnp_SecureHash={secureHash}";
        }

        private static string GenerateHmacSha512(string key, string data)
        {
            using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return Convert.ToHexString(hash).ToUpper(); // VNPay usually expects Uppercase
        }
    }
}
