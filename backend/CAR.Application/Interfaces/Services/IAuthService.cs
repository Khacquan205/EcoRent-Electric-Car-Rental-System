using CAR.Application.Dtos.Auth;

namespace CAR.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> Register(RegisterRequestDto request);
        Task<AuthResponseDto> VerifyRegistration(OtpVerificationRequestDto request);
        Task<AuthResponseDto> Login(LoginRequestDto request);
        Task<AuthResponseDto> SendOtp(SendOtpRequestDto request);
        Task<AuthResponseDto> ChangePassword(int userId, ChangePasswordRequestDto request);
        Task<AuthResponseDto> LoginWithGoogleAsync(GoogleLoginRequestDto request);
    }
}
