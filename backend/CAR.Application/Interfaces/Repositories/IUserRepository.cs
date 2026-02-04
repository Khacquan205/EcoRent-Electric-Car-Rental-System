using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IUserRepository : IRepository<MUser>
    {
        Task<MUser?> GetByEmailAsync(string email);
        Task<MUser?> GetByIdAsync(int id);
        Task CreateUserAsync(MUser user);
    }
}
