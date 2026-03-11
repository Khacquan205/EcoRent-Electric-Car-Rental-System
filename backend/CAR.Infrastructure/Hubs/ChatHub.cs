using System.Security.Claims;
using CAR.Application.Dtos.Chat;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CAR.Infrastructure.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public async Task JoinConversation(int conversationId)
        {
            var userId = GetCurrentUserId();

            if (!await _chatService.IsParticipantAsync(userId, conversationId))
            {
                await Clients.Caller.SendAsync("Error", "You are not a participant of this conversation");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation-{conversationId}");
            await Clients.Caller.SendAsync("JoinedConversation", conversationId);
        }

        public async Task LeaveConversation(int conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation-{conversationId}");
        }

        /// <summary>
        /// Send a message: save to DB first, then broadcast to the conversation group.
        /// </summary>
        public async Task SendMessage(int conversationId, string content)
        {
            var userId = GetCurrentUserId();

            // Business logic is in ChatService — Hub is only transport
            var messageDto = await _chatService.SendMessageAsync(userId, conversationId, content);

            await Clients.Group($"conversation-{conversationId}")
                .SendAsync("ReceiveMessage", messageDto);
        }

        public async Task MarkAsRead(int conversationId)
        {
            var userId = GetCurrentUserId();

            await _chatService.MarkAsReadAsync(userId, conversationId);

            await Clients.OthersInGroup($"conversation-{conversationId}")
                .SendAsync("MessagesRead", new { conversationId, readByUserId = userId });
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetCurrentUserId();
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetCurrentUserId();
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
            await base.OnDisconnectedAsync(exception);
        }

        private int GetCurrentUserId()
        {
            var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out var userId))
                throw new HubException("Unauthorized: user ID not found in token");
            return userId;
        }
    }
}
