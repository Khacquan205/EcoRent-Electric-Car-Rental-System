using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories
{
    public interface ICustomerProfileRepository : IRepository<MCustomerProfile>
    {
        Task<MCustomerProfile?> GetByUserIdAsync(int userId);
        Task CreateCustomerProfileAsync(MCustomerProfile customerProfile);
    }
}
