using CAR.Domain.Enums;

namespace CAR.Application.Dtos
{
    public class KycPhoneResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public bool PhoneVerified { get; set; }
        public DateTime? PhoneVerifiedAt { get; set; }
        public KycVerificationStatus Status { get; set; }
    }
}
