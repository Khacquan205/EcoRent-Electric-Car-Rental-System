using System;

namespace CAR.Domain.Entities
{
    public partial class MIdentityVerification
    {
        public int Id { get; set; }

        public int OwnerProfileId { get; set; }

        public MOwnerProfile OwnerProfile { get; set; } = null!;

        public string Status { get; set; } = null!;

        public decimal Score { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public string? RejectReason { get; set; }

        public string? FrontDocumentUrl { get; set; }

        public string? BackDocumentUrl { get; set; }

        public string? SelfieUrl { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsVerified()
        {
            return Status == "VERIFIED";
        }

        public bool IsPending()
        {
            return Status == "PENDING";
        }

        public bool IsRejected()
        {
            return Status == "REJECTED";
        }

        public void MarkAsVerified(decimal score)
        {
            Status = "VERIFIED";
            Score = score;
            VerifiedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void MarkAsRejected(decimal score, string reason)
        {
            Status = "REJECTED";
            Score = score;
            RejectReason = reason;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetDocuments(string frontUrl, string backUrl, string selfieUrl)
        {
            FrontDocumentUrl = frontUrl;
            BackDocumentUrl = backUrl;
            SelfieUrl = selfieUrl;
            Status = "PROCESSING";
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
