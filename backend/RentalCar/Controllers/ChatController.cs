using CAR.Application.Dtos.Chat;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ICarSuggestionChatService _carSuggestionChatService;

        public ChatController(IChatService chatService, ICarSuggestionChatService carSuggestionChatService)
        {
            _chatService = chatService;
            _carSuggestionChatService = carSuggestionChatService;
        }

        /// <summary>Get or create a conversation with another user.</summary>
        [HttpPost("conversations")]
        public async Task<IActionResult> GetOrCreateConversation([FromBody] CreateConversationRequestDto request)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.GetOrCreateConversationAsync(userId, request);
            return Ok(result);
        }

        /// <summary>List all conversations for the current user.</summary>
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.GetUserConversationsAsync(userId);
            return Ok(result);
        }

        /// <summary>Get paginated message history for a conversation.</summary>
        [HttpGet("conversations/{conversationId:int}/messages")]
        public async Task<IActionResult> GetMessages(
            int conversationId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.GetMessagesAsync(userId, conversationId, page, pageSize);
            return Ok(result);
        }

        /// <summary>Send a message via REST (fallback when SignalR is unavailable).</summary>
        [HttpPost("conversations/{conversationId:int}/messages")]
        public async Task<IActionResult> SendMessage(
            int conversationId,
            [FromBody] SendMessageRequestDto request)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.SendMessageAsync(userId, conversationId, request.Content);
            return Ok(result);
        }

        /// <summary>Mark all unread messages in a conversation as read.</summary>
        [HttpPut("conversations/{conversationId:int}/read")]
        public async Task<IActionResult> MarkAsRead(int conversationId)
        {
            var userId = GetCurrentUserId();
            await _chatService.MarkAsReadAsync(userId, conversationId);
            return Ok(new { Success = true, Message = "Messages marked as read" });
        }

        /// <summary>Gửi tin nhắn, nhận gợi ý xe từ AI (chỉ xe có trong DB, ưu tiên xe quảng cáo).</summary>
        [HttpPost("suggest-cars")]
        public async Task<IActionResult> SuggestCars([FromBody] SuggestCarsRequestDto request)
        {
            var result = await _carSuggestionChatService.SuggestCarsAsync(request.Message ?? string.Empty);
            return Ok(result);
        }

        /// <summary>Xuất dữ liệu huấn luyện cho suggest-cars (query, positive, candidates, rationale).</summary>
        [HttpGet("suggest-cars/training-dataset")]
        public async Task<IActionResult> GetSuggestCarsTrainingDataset([FromQuery] int size = 120)
        {
            var samples = await _carSuggestionChatService.BuildTrainingDatasetAsync(size);
            return Ok(new
            {
                Success = true,
                Message = $"Generated {samples.Count} training samples",
                Data = samples
            });
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || !int.TryParse(claim.Value, out int userId))
                throw new UnauthorizedAccessException("Invalid user token");
            return userId;
        }
    }
}
