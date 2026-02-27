using System;

namespace CAR.Application.Dtos
{
    public class SubscriptionListItemDto
    {
        public int Id { get; set; }
        public int PackageId { get; set; }
        public string PackageName { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalPosts { get; set; }
        public int RemainingPosts { get; set; }
        public short Status { get; set; }
        public string StatusName { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class SubscriptionDetailDto : SubscriptionListItemDto
    {
        public string Source { get; set; } = null!;
        public DateTime UpdatedAt { get; set; }
        public decimal Price { get; set; }
    }
}
