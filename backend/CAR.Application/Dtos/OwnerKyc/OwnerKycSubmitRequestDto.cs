namespace CAR.Application.Dtos.OwnerKyc
{
    /// <summary>
    /// Request for submit KYC (legal identity only). Owner does not require address; document upload is in OCR step.
    /// </summary>
    public class OwnerKycSubmitRequestDto
    {
        public string IdCardNumber { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string DateOfBirth { get; set; } = null!;
        public string? Gender { get; set; }
    }
}
