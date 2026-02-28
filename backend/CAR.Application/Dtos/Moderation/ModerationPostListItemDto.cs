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
    }
}
