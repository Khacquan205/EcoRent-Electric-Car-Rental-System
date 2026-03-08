using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class OwnerAdCreditRepository : Repository<MOwnerAdCredit>, IOwnerAdCreditRepository
    {
        public OwnerAdCreditRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MOwnerAdCredit?> GetFirstAvailableCreditAsync(int ownerId)
        {
            return await _dbSet
                .Include(c => c.AdPackage)
                .Where(c => c.OwnerId == ownerId && c.RemainingPosts > 0)
                .OrderBy(c => c.CreatedAt)
                .FirstOrDefaultAsync();
        }
    }
}
