using CAR.Domain.Enums;

namespace CAR.Domain.Entities
{
    public partial class MKyc
    {
        public int Id { get; set; }

        public int OwnerProfileId { get; set; }

        public OwnerVerificationStatus VerificationStatus { get; set; }

        public string? IdCardNumber { get; set; }

        public string? FullName { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? FrontDocumentUrl { get; set; }

        public string? BackDocumentUrl { get; set; }

        public string? RejectionReason { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public MOwnerProfile OwnerProfile { get; set; } = null!;
    }
}
