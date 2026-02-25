namespace CAR.Application.Dtos.OwnerKyc
{
    public class OwnerKycSubmitRequestDto
    {
        public string IdCardNumber { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public DateTime? DateOfBirth { get; set; }
        public string FrontDocumentUrl { get; set; } = null!;
        public string BackDocumentUrl { get; set; } = null!;
    }
}
