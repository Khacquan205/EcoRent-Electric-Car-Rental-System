using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class AdPackageRepository : Repository<MAdPackage>, IAdPackageRepository
    {
        public AdPackageRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MAdPackage?> GetByIdAsync(int id)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<MAdPackage>> GetActivePackagesAsync()
        {
            return await _dbSet
                .Where(x => x.Status == 1)
                .OrderBy(x => x.Price)
                .ToListAsync();
        }
    }
}
