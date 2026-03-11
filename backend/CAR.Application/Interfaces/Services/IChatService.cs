using CAR.Application.Dtos;
using CAR.Application.Dtos.Chat;

namespace CAR.Application.Interfaces.Services
{
    public interface IChatService
    {
        Task<ConversationResponseDto> GetOrCreateConversationAsync(int currentUserId, CreateConversationRequestDto request);
        Task<List<ConversationResponseDto>> GetUserConversationsAsync(int currentUserId);
        Task<PagedResultDto<MessageResponseDto>> GetMessagesAsync(int currentUserId, int conversationId, int page, int pageSize);
        Task<MessageResponseDto> SendMessageAsync(int currentUserId, int conversationId, string content);
        Task MarkAsReadAsync(int currentUserId, int conversationId);
        Task<bool> IsParticipantAsync(int userId, int conversationId);
    }
}
