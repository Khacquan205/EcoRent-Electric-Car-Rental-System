using System;

namespace CAR.Application.Dtos
{
    public class ActivateSubscriptionResponseDto
    {
        public long Id { get; set; }

        public int PackageId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int TotalPosts { get; set; }

        public int RemainingPosts { get; set; }

        public short Status { get; set; }
    }
}
