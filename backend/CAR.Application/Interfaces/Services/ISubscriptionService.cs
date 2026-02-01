using CAR.Application.Dtos;
using CAR.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface ISubscriptionService
    {
        Task<ActivateSubscriptionResponseDto> ActivateSubscriptionAsync(int userId, ActivateSubscriptionRequestDto request);
        Task ConsumeOnePostAsync(long subscriptionId);
        bool HasRemainingPosts(MOwnerSubscription subscription);
        bool IsActive(MOwnerSubscription subscription, DateTime currentTime);
    }
}
