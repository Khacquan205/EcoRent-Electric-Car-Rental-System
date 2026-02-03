using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using CAR.Infrastructure.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Repositories
{
    public class OwnerPackageRepository : Repository<MOwnerPackage>, IOwnerPackageRepository
    {
        public OwnerPackageRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<bool> ExistsByNameAsync(string name)
        {
            return await _dbSet.AnyAsync(x => x.Name == name && x.Status == OwnerPackageStatus.Active);
        }

        public async Task<MOwnerPackage?> GetByIdAsync(int id)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<MOwnerPackage>> GetActivePackagesAsync()
        {
            return await _dbSet
                .Where(x => x.Status == OwnerPackageStatus.Active)
                .OrderBy(x => x.PriorityLevel)
                .ThenBy(x => x.Name)
                .ToListAsync();
        }
    }
}
