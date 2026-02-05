using CAR.Domain.Entities;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IPhoneRepository : IRepository<MPhone>
    {
        Task<MPhone?> GetByPhoneAsync(string phone);
        Task<MPhone?> GetByPhoneAndCustomerIdAsync(string phone, int customerId);
        Task<MPhone?> GetByCustomerIdAsync(int customerId);
        Task<MPhone?> GetVerifiedPhoneAsync(string phone);
        Task StorePhoneOtpAsync(string phone, string otp, int customerId, DateTime expiresAt);
        Task MarkOtpAsUsedAsync(string phone, string otp);
        Task CleanupExpiredOtpAsync();
    }
}
