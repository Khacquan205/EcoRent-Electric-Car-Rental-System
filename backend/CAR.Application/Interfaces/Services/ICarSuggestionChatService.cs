using CAR.Application.Dtos.Chat;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface ICarSuggestionChatService
    {
        Task<SuggestCarsResponseDto> SuggestCarsAsync(string userMessage);
    }
}
