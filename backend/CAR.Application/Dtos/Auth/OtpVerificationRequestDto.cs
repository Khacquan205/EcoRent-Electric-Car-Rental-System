namespace CAR.Application.Dtos.Auth
{
    public class OtpVerificationRequestDto
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!;
    }
}
