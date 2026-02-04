using System;

namespace CAR.Domain.Entities
{
    public partial class MPost
    {
        public long Id { get; set; }

        public long OwnerId { get; set; }

        public long CategoryId { get; set; }

        public long? LocationId { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public string? ContactPhone { get; set; }


        public short Status { get; set; }


        public long? StaffId { get; set; }

        public string? RejectReason { get; set; }


        public short PriorityLevel { get; set; }

        public DateTime? ExpiredAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
