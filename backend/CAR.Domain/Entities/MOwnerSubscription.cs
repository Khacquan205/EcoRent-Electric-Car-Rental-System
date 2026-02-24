using System;

namespace CAR.Domain.Entities
{
    public partial class MOwnerSubscription
    {
        public int Id { get; set; }

        public int OwnerId { get; set; }

        public int PackageId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int TotalPosts { get; set; }

        public int RemainingPosts { get; set; }

        public short Status { get; set; }

        public string Source { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public MOwnerProfile OwnerProfile { get; set; } = null!;
        public MOwnerPackage Package { get; set; } = null!;
        public ICollection<MPayment> Payments { get; set; } = new List<MPayment>();
    }
}
