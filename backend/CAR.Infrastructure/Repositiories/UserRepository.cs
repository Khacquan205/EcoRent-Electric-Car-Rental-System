using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class UserRepository : Repository<MUser>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MUser?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<MUser?> GetByIdAsync(int id)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task CreateUserAsync(MUser user)
        {
            await _dbSet.AddAsync(user);
        }
    }
}
