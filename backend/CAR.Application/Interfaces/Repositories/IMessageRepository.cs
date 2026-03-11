using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IMessageRepository : IRepository<MMessage>
    {
        Task<List<MMessage>> GetByConversationIdAsync(int conversationId, int page, int pageSize);
        Task<int> GetCountByConversationIdAsync(int conversationId);
        Task<int> GetUnreadCountAsync(int conversationId, int userId);
        Task MarkAsReadAsync(int conversationId, int userId);
    }
}
