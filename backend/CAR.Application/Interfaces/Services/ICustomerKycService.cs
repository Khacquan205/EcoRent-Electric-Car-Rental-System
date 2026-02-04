using CAR.Application.Dtos;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface ICustomerKycService
    {
        Task<KycOcrResponseDto> ProcessKycOcrAsync(int userId, KycOcrRequestDto request);
        Task<KycPhoneResponseDto> SendPhoneOtpAsync(int userId, KycPhoneRequestDto request);
        Task<KycPhoneResponseDto> VerifyPhoneOtpAsync(int userId, KycOtpRequestDto request);
        Task<KycConfirmResponseDto> ConfirmKycAsync(int userId, KycConfirmRequestDto request);
        Task<KycStatusResponseDto> GetKycStatusAsync(int userId);
    }
}
