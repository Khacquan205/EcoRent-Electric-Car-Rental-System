using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Repositories
{
    public class StaffProfileRepository : Repository<MStaffProfile>, IStaffProfileRepository
    {
        public StaffProfileRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MStaffProfile?> GetByUserIdAsync(int userId)
        {
            return await _dbSet.FirstOrDefaultAsync(s => s.UserId == userId);
        }
    }
}
