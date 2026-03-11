namespace CAR.Domain.Entities
{
    public class MPayment
    {
        public int Id { get; set; }

        /// <summary>1 = Subscription (gói đăng bài), 2 = AdPackage (gói quảng cáo).</summary>
        public int PaymentType { get; set; }

        /// <summary>Khi PaymentType = Subscription.</summary>
        public int? SubscriptionId { get; set; }

        /// <summary>Khi PaymentType = AdPackage.</summary>
        public int? AdOrderId { get; set; }

        public decimal Amount { get; set; }

        public int PaymentMethod { get; set; }

        public int PaymentStatus { get; set; }

        /// <summary>Our internal order reference sent to VNPay as vnp_TxnRef.</summary>
        public string? TransactionCode { get; set; }

        /// <summary>VNPay's own transaction ID returned as vnp_TransactionNo.</summary>
        public string? VnpayTransactionId { get; set; }

        /// <summary>vnp_ResponseCode returned from VNPay callback (e.g. "00" = success).</summary>
        public string? ResponseCode { get; set; }

        /// <summary>Payment timestamp from VNPay (vnp_PayDate).</summary>
        public DateTime? PayDate { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public MOwnerSubscription? Subscription { get; set; }
        public MAdOrder? AdOrder { get; set; }
    }
}
