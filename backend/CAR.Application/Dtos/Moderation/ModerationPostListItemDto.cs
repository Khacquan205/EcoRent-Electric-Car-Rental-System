namespace CAR.Application.Dtos.Moderation
{
    /// <summary>
    /// Post row for Admin/Staff moderation dashboard (all statuses, filterable).
    /// </summary>
    public class ModerationPostListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CategoryName { get; set; }
        public int OwnerId { get; set; }
        public string? OwnerName { get; set; }
        public DateTime CreatedAt { get; set; }
        public short Status { get; set; }
        public string? RejectReason { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public List<string> Images { get; set; } = new();
        public List<string> Videos { get; set; } = new();
        /// <summary>Giấy tờ xe (đăng ký, kiểm định, bảo hiểm) để staff đối chiếu với ảnh xe khi duyệt.</summary>
        public string? RegistrationImageUrl { get; set; }
        public string? InspectionImageUrl { get; set; }
        public string? InsuranceImageUrl { get; set; }
    }
}
