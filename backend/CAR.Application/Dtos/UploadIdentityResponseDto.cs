using System;

namespace CAR.Application.Dtos
{
    public class UploadIdentityResponseDto
    {
        public long Id { get; set; }

        public string Status { get; set; } = null!;

        public decimal Score { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public string? RejectReason { get; set; }

        public string? FrontDocumentUrl { get; set; }

        public string? BackDocumentUrl { get; set; }

        public string? SelfieUrl { get; set; }
    }
}
