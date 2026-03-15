namespace CAR.Application.Dtos.Moderation
{
    public class PendingPostDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int OwnerId { get; set; }
        public string? OwnerName { get; set; }
        public int CategoryId { get; set; }
        public DateTime CreatedAt { get; set; }
        /// <summary>Giấy tờ xe: đăng ký, kiểm định, bảo hiểm (để staff đối chiếu với ảnh xe).</summary>
        public string? RegistrationImageUrl { get; set; }
        public string? InspectionImageUrl { get; set; }
        public string? InsuranceImageUrl { get; set; }
    }
}
