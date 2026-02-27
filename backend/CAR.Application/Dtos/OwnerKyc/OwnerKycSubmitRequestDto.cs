namespace CAR.Application.Dtos.OwnerKyc
{
    /// <summary>
    /// Request for submit KYC. Used by both full flow (with liveness + document URLs) and "Trở thành chủ xe" flow (CCCD only).
    /// FrontDocumentUrl, BackDocumentUrl, Gender, Address are optional for the simple flow.
    /// </summary>
    public class OwnerKycSubmitRequestDto
    {
        public string IdCardNumber { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string DateOfBirth { get; set; } = null!;
        public string? Gender { get; set; }
        public string? FrontDocumentUrl { get; set; }
        public string? BackDocumentUrl { get; set; }
        public string? Address { get; set; }
    }
}
