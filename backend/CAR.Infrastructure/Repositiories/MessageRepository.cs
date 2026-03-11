using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Repositories
{
    public class MessageRepository : Repository<MMessage>, IMessageRepository
    {
        public MessageRepository(AppDbContext context) : base(context) { }

        public async Task<List<MMessage>> GetByConversationIdAsync(int conversationId, int page, int pageSize)
        {
            return await _dbSet
                .Include(m => m.Sender).ThenInclude(u => u.CustomerProfile)
                .Include(m => m.Sender).ThenInclude(u => u.OwnerProfile)
                .Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetCountByConversationIdAsync(int conversationId)
        {
            return await _dbSet.CountAsync(m => m.ConversationId == conversationId);
        }

        public async Task<int> GetUnreadCountAsync(int conversationId, int userId)
        {
            // Count messages NOT sent by this user that are unread
            return await _dbSet.CountAsync(m =>
                m.ConversationId == conversationId &&
                m.SenderId != userId &&
                !m.IsRead);
        }

        public async Task MarkAsReadAsync(int conversationId, int userId)
        {
            // Mark messages sent by the OTHER user as read
            await _dbSet
                .Where(m =>
                    m.ConversationId == conversationId &&
                    m.SenderId != userId &&
                    !m.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true));
        }
    }
}
