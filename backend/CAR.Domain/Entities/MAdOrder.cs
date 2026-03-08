namespace CAR.Domain.Entities
{
    /// <summary>Đơn mua gói quảng cáo (chờ thanh toán hoặc đã thanh toán).</summary>
    public class MAdOrder
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public int AdPackageId { get; set; }
        public decimal Amount { get; set; }
        /// <summary>0 = Chờ thanh toán, 1 = Đã thanh toán.</summary>
        public short Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public MOwnerProfile OwnerProfile { get; set; } = null!;
        public MAdPackage AdPackage { get; set; } = null!;
    }
}
