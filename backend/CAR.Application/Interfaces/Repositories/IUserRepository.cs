using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IUserRepository : IRepository<MUser>
    {
        Task<MUser?> GetByEmailAsync(string email);
        Task CreateUserAsync(MUser user);
    }
}
