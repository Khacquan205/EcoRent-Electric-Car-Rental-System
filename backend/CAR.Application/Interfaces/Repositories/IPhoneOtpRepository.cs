using CAR.Domain.Entities;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IPhoneOtpRepository
    {
        Task<MPhoneOtp?> GetLatestOtpAsync(string phone);
        Task StoreOtpAsync(string phone, string otp, DateTime expiresAt);
        Task MarkOtpAsUsedAsync(int otpId);
        Task CleanupExpiredOtpsAsync();
    }
}
