using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class OwnerProfileRepository : Repository<MOwnerProfile>, IOwnerProfileRepository
    {
        public OwnerProfileRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MOwnerProfile?> GetByUserIdAsync(int userId)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId);
        }

        public async Task<bool> ExistsByUserIdAsync(int userId)
        {
            return await _dbSet.AnyAsync(x => x.UserId == userId);
        }

        public async Task<MOwnerProfile?> GetVerifiedOwnerByUserIdAsync(int userId)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId && x.IdentityVerified);
        }
    }
}
