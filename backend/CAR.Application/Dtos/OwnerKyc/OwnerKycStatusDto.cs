using CAR.Domain.Enums;

namespace CAR.Application.Dtos.OwnerKyc
{
    public class OwnerKycStatusDto
    {
        public OwnerVerificationStatus Status { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }
}
