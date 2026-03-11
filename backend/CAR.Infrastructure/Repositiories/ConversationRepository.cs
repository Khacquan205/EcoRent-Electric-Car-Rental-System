using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Repositories
{
    public class ConversationRepository : Repository<MConversation>, IConversationRepository
    {
        public ConversationRepository(AppDbContext context) : base(context) { }

        public async Task<MConversation?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(c => c.User1).ThenInclude(u => u.CustomerProfile)
                .Include(c => c.User1).ThenInclude(u => u.OwnerProfile)
                .Include(c => c.User2).ThenInclude(u => u.CustomerProfile)
                .Include(c => c.User2).ThenInclude(u => u.OwnerProfile)
                .Include(c => c.Post).ThenInclude(p => p!.Images.OrderBy(i => i.SortOrder))
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<MConversation?> GetByParticipantsAsync(int user1Id, int user2Id, int? postId)
        {
            var smallerId = Math.Min(user1Id, user2Id);
            var largerId = Math.Max(user1Id, user2Id);

            return await _dbSet
                .Include(c => c.User1).ThenInclude(u => u.CustomerProfile)
                .Include(c => c.User1).ThenInclude(u => u.OwnerProfile)
                .Include(c => c.User2).ThenInclude(u => u.CustomerProfile)
                .Include(c => c.User2).ThenInclude(u => u.OwnerProfile)
                .Include(c => c.Post).ThenInclude(p => p!.Images.OrderBy(i => i.SortOrder))
                .FirstOrDefaultAsync(c =>
                    c.User1Id == smallerId &&
                    c.User2Id == largerId &&
                    c.PostId == postId);
        }

        public async Task<List<MConversation>> GetUserConversationsAsync(int userId)
        {
            return await _dbSet
                .Include(c => c.User1).ThenInclude(u => u.CustomerProfile)
                .Include(c => c.User1).ThenInclude(u => u.OwnerProfile)
                .Include(c => c.User2).ThenInclude(u => u.CustomerProfile)
                .Include(c => c.User2).ThenInclude(u => u.OwnerProfile)
                .Include(c => c.Post).ThenInclude(p => p!.Images.OrderBy(i => i.SortOrder))
                .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
                .Where(c => c.User1Id == userId || c.User2Id == userId)
                .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> IsParticipantAsync(int userId, int conversationId)
        {
            return await _dbSet.AnyAsync(c =>
                c.Id == conversationId &&
                (c.User1Id == userId || c.User2Id == userId));
        }
    }
}
