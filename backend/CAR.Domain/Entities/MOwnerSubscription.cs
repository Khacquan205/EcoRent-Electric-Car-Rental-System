using System;

namespace CAR.Domain.Entities
{
    public partial class MOwnerSubscription
    {
        public long Id { get; set; }

        public long OwnerId { get; set; }

        public long PackageId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int TotalPosts { get; set; }

        public int RemainingPosts { get; set; }
        public short Status { get; set; }

        public string Source { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Domain behavior (DDD-lite)
        public void ConsumeOnePost()
        {
            if (RemainingPosts <= 0)
            {
                throw new InvalidOperationException("No remaining posts to consume");
            }

            RemainingPosts--;
            UpdatedAt = DateTime.UtcNow;
        }

        public bool HasRemainingPosts()
        {
            return RemainingPosts > 0;
        }

        public bool IsActive(DateTime currentTime)
        {
            return Status == 1 && StartDate <= currentTime && EndDate >= currentTime;
        }
    }
}
