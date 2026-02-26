namespace CAR.Application.Dtos.OwnerKyc
{
    public class OwnerKycSummaryDto
    {
        public int OwnerProfileId { get; set; }
        public string? OwnerName { get; set; }
        public string? IdCardNumber { get; set; }
        public string? FullName { get; set; }
        public string? FrontDocumentUrl { get; set; }
        public string? BackDocumentUrl { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}
