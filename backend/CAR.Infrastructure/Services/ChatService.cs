using CAR.Application.Dtos;
using CAR.Application.Dtos.Chat;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Services
{
    public class ChatService : IChatService
    {
        private readonly IConversationRepository _conversationRepo;
        private readonly IMessageRepository _messageRepo;
        private readonly IUserRepository _userRepo;
        private readonly IPostRepository _postRepo;
        private readonly IUnitOfWork _unitOfWork;

        public ChatService(
            IConversationRepository conversationRepo,
            IMessageRepository messageRepo,
            IUserRepository userRepo,
            IPostRepository postRepo,
            IUnitOfWork unitOfWork)
        {
            _conversationRepo = conversationRepo;
            _messageRepo = messageRepo;
            _userRepo = userRepo;
            _postRepo = postRepo;
            _unitOfWork = unitOfWork;
        }

        public async Task<ConversationResponseDto> GetOrCreateConversationAsync(
            int currentUserId, CreateConversationRequestDto request)
        {
            if (currentUserId == request.OtherUserId)
                throw new UserFriendlyException(400, "SELF_CHAT", "You cannot start a conversation with yourself");

            var otherUser = await _userRepo.GetByIdAsync(request.OtherUserId);
            if (otherUser == null)
                throw new UserFriendlyException(404, "USER_NOT_FOUND", "The other user does not exist");

            if (request.PostId.HasValue)
            {
                var postExists = await _postRepo.Query().AnyAsync(p => p.Id == request.PostId.Value);
                if (!postExists)
                    throw new UserFriendlyException(404, "POST_NOT_FOUND", "Post not found");
            }

            var user1Id = Math.Min(currentUserId, request.OtherUserId);
            var user2Id = Math.Max(currentUserId, request.OtherUserId);

            var conversation = await _conversationRepo.GetByParticipantsAsync(user1Id, user2Id, request.PostId);

            if (conversation == null)
            {
                conversation = new MConversation
                {
                    User1Id = user1Id,
                    User2Id = user2Id,
                    PostId = request.PostId,
                    CreatedAt = DateTime.UtcNow
                };
                await _conversationRepo.AddAsync(conversation);
                await _unitOfWork.SaveChangesAsync();

                // Reload with navigation properties
                conversation = await _conversationRepo.GetByIdWithDetailsAsync(conversation.Id);
            }

            var unreadCount = await _messageRepo.GetUnreadCountAsync(conversation!.Id, currentUserId);
            return MapToConversationDto(conversation, currentUserId, unreadCount);
        }

        public async Task<List<ConversationResponseDto>> GetUserConversationsAsync(int currentUserId)
        {
            var conversations = await _conversationRepo.GetUserConversationsAsync(currentUserId);
            var result = new List<ConversationResponseDto>();

            foreach (var conv in conversations)
            {
                var unreadCount = await _messageRepo.GetUnreadCountAsync(conv.Id, currentUserId);
                result.Add(MapToConversationDto(conv, currentUserId, unreadCount));
            }

            return result;
        }

        public async Task<PagedResultDto<MessageResponseDto>> GetMessagesAsync(
            int currentUserId, int conversationId, int page, int pageSize)
        {
            if (!await _conversationRepo.IsParticipantAsync(currentUserId, conversationId))
                throw new UserFriendlyException(403, "NOT_PARTICIPANT", "You are not a participant of this conversation");

            if (page < 1) page = 1;
            if (pageSize <= 0) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var messages = await _messageRepo.GetByConversationIdAsync(conversationId, page, pageSize);
            var totalCount = await _messageRepo.GetCountByConversationIdAsync(conversationId);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = messages.Select(m => MapToMessageDto(m)).ToList();

            return new PagedResultDto<MessageResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                TotalPages = totalPages,
                CurrentPage = page
            };
        }

        public async Task<MessageResponseDto> SendMessageAsync(
            int currentUserId, int conversationId, string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new UserFriendlyException(400, "EMPTY_CONTENT", "Message content cannot be empty");

            content = content.Trim();
            if (content.Length > 2000)
                throw new UserFriendlyException(400, "CONTENT_TOO_LONG", "Message content cannot exceed 2000 characters");

            var conversation = await _conversationRepo.GetByIdWithDetailsAsync(conversationId);
            if (conversation == null)
                throw new UserFriendlyException(404, "CONVERSATION_NOT_FOUND", "Conversation not found");

            if (conversation.User1Id != currentUserId && conversation.User2Id != currentUserId)
                throw new UserFriendlyException(403, "NOT_PARTICIPANT", "You are not a participant of this conversation");

            var message = new MMessage
            {
                ConversationId = conversationId,
                SenderId = currentUserId,
                Content = content,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _messageRepo.AddAsync(message);

            conversation.UpdatedAt = DateTime.UtcNow;
            _conversationRepo.Update(conversation);

            await _unitOfWork.SaveChangesAsync();

            // Resolve sender name for the response
            var sender = conversation.User1Id == currentUserId ? conversation.User1 : conversation.User2;
            message.Sender = sender;

            return MapToMessageDto(message);
        }

        public async Task MarkAsReadAsync(int currentUserId, int conversationId)
        {
            if (!await _conversationRepo.IsParticipantAsync(currentUserId, conversationId))
                throw new UserFriendlyException(403, "NOT_PARTICIPANT", "You are not a participant of this conversation");

            await _messageRepo.MarkAsReadAsync(conversationId, currentUserId);
        }

        public async Task<bool> IsParticipantAsync(int userId, int conversationId)
        {
            return await _conversationRepo.IsParticipantAsync(userId, conversationId);
        }

        // ===== Mapping helpers =====

        private static ConversationResponseDto MapToConversationDto(
            MConversation conv, int currentUserId, int unreadCount)
        {
            var isUser1 = conv.User1Id == currentUserId;
            var otherUser = isUser1 ? conv.User2 : conv.User1;
            var otherUserName = GetDisplayName(otherUser);

            var lastMessage = conv.Messages?
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefault();

            return new ConversationResponseDto
            {
                Id = conv.Id,
                OtherUserId = otherUser.Id,
                OtherUserName = otherUserName,
                PostId = conv.PostId,
                PostTitle = conv.Post?.Title,
                PostImage = conv.Post?.Images?.OrderBy(i => i.SortOrder).FirstOrDefault()?.ImageUrl,
                LastMessage = lastMessage?.Content,
                LastMessageAt = lastMessage?.CreatedAt ?? conv.UpdatedAt ?? conv.CreatedAt,
                UnreadCount = unreadCount,
                CreatedAt = conv.CreatedAt
            };
        }

        private static MessageResponseDto MapToMessageDto(MMessage m)
        {
            return new MessageResponseDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                SenderName = GetDisplayName(m.Sender),
                Content = m.Content,
                IsRead = m.IsRead,
                CreatedAt = m.CreatedAt
            };
        }

        /// <summary>
        /// Resolve a user display name from CustomerProfile.DisplayName or OwnerProfile.Name,
        /// falling back to email prefix.
        /// </summary>
        private static string GetDisplayName(MUser user)
        {
            if (user.CustomerProfile != null && !string.IsNullOrWhiteSpace(user.CustomerProfile.DisplayName))
                return user.CustomerProfile.DisplayName;
            if (user.OwnerProfile != null && !string.IsNullOrWhiteSpace(user.OwnerProfile.Name))
                return user.OwnerProfile.Name;
            // Fallback: email prefix
            return user.Email.Split('@')[0];
        }
    }
}
