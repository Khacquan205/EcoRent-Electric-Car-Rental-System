using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CAR.Application.Dtos.Chat;
using CAR.Application.Interfaces.Services;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ChatController : ControllerBase
    {
        private readonly ICarSuggestionChatService _chatService;

        public ChatController(ICarSuggestionChatService chatService)
        {
            _chatService = chatService;
        }

        /// <summary>Gửi tin nhắn, nhận gợi ý xe từ AI (chỉ xe có trong DB, ưu tiên xe quảng cáo).</summary>
        [HttpPost("suggest-cars")]
        public async Task<IActionResult> SuggestCars([FromBody] SuggestCarsRequestDto request)
        {
            var result = await _chatService.SuggestCarsAsync(request.Message ?? string.Empty);
            return Ok(result);
        }
    }
}
