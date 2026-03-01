using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Repositiories
{
    public class NotificationRepository : Repository<MNotification>, INotificationRepository
    {
        public NotificationRepository(AppDbContext context) : base(context) { }

        public async Task<List<MNotification>> GetByUserIdAsync(int userId)
        {
            return await _dbSet
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<MNotification?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }
    }
}
