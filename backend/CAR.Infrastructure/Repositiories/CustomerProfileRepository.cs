using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class CustomerProfileRepository : Repository<MCustomerProfile>, ICustomerProfileRepository
    {
        public CustomerProfileRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MCustomerProfile?> GetByUserIdAsync(int userId)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId);
        }

        public async Task CreateCustomerProfileAsync(MCustomerProfile customerProfile)
        {
            _dbSet.Add(customerProfile);
        }
    }
}
