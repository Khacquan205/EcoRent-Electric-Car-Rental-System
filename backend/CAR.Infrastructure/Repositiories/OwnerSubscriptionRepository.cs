using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class OwnerSubscriptionRepository : Repository<MOwnerSubscription>, IOwnerSubscriptionRepository
    {
        public OwnerSubscriptionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MOwnerSubscription?> GetValidActiveSubscriptionAsync(long ownerId, DateTime currentTime)
        {
            return await _dbSet
                .Where(x => x.OwnerId == ownerId && 
                           x.Status == 1 && // ACTIVE
                           x.StartDate <= currentTime && 
                           x.EndDate >= currentTime &&
                           x.RemainingPosts > 0)
                .FirstOrDefaultAsync();
        }

        public async Task<MOwnerSubscription?> GetActiveSubscriptionByOwnerIdAsync(long ownerId)
        {
            return await _dbSet
                .Where(x => x.OwnerId == ownerId && x.Status == 1) // ACTIVE
                .FirstOrDefaultAsync();
        }
    }
}
