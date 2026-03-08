namespace CAR.Domain.Entities
{
    public class MAdvertisement
    {
        public int Id { get; set; }

        public int PostId { get; set; }

        public MPost Post { get; set; } = null!;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int Status { get; set; }
        public decimal Price { get; set; }
        /// <summary>Cấp ưu tiên khi sort (copy từ AdPackage lúc apply). 0 = không quảng cáo, 1–3 = theo gói.</summary>
        public int PriorityLevel { get; set; }
        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
