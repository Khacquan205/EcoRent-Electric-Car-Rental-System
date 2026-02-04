using System;
using CAR.Domain.Enums;

namespace CAR.Domain.Entities
{
    public partial class MKyc
    {
        public int id { get; set; }

        public int CustomerId { get; set; }

        public KycVerificationStatus VerificationStatus { get; set; }

        public string? FullName { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public KycGender Gender { get; set; }

        public string? CccdNumber { get; set; }

        public string? FrontDocumentUrl { get; set; }

        public string? BackDocumentUrl { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? VerifiedAt { get; set; }
    }
}
