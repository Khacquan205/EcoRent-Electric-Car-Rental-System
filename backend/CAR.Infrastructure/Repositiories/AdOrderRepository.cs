using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class AdOrderRepository : Repository<MAdOrder>, IAdOrderRepository
    {
        public AdOrderRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MAdOrder?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(o => o.AdPackage)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
