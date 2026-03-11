using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class AdvertisementRepository : Repository<MAdvertisement>, IAdvertisementRepository
    {
        public AdvertisementRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MAdvertisement?> GetByPostIdAsync(int postId)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.PostId == postId);
        }
    }
}
