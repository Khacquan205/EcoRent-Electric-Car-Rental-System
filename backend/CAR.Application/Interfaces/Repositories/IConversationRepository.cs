using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IConversationRepository : IRepository<MConversation>
    {
        Task<MConversation?> GetByIdWithDetailsAsync(int id);
        Task<MConversation?> GetByParticipantsAsync(int user1Id, int user2Id, int? postId);
        Task<List<MConversation>> GetUserConversationsAsync(int userId);
        Task<bool> IsParticipantAsync(int userId, int conversationId);
    }
}
