using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IAuthenticationRepository : IRepository<MAuthentication>
    {
        Task<MAuthentication?> GetByEmailAsync(string email);
        Task<MAuthentication?> GetByUserIdAsync(int userId);
        Task<MAuthentication?> GetByValidOtpAsync(string email, string code);
        Task UpdateOtpStatusAsync(int id, bool isUsed, bool isRevoked);
        Task CreateAuthenticationAsync(MAuthentication authentication);
    }
}
