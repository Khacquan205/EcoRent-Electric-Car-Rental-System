using System;

namespace CAR.Application.Dtos
{
    public class OwnerProfileResponseDto
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string? Name { get; set; }

        public string? Phone { get; set; }

        public bool IdentityVerified { get; set; }

        public string VerificationStatus { get; set; } = null!;

        public decimal VerificationScore { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public string? RejectReason { get; set; }

        public double RatingAvg { get; set; }

        public int TotalPosts { get; set; }

        public bool CanCreatePosts { get; set; }
    }
}
