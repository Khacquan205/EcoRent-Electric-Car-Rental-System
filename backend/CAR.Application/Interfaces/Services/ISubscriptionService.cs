using CAR.Application.Dtos;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface ISubscriptionService
    {
        Task<ActivateSubscriptionResponseDto> ActivateSubscriptionAsync(int userId, ActivateSubscriptionRequestDto request);
    }
}
