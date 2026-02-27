using CAR.Application.Dtos;
using CAR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface ISubscriptionService
    {
        Task<CreateSubscriptionResponseDto> CreateSubscriptionAsync(int userId, CreateSubscriptionRequestDto request);
        Task<List<SubscriptionListItemDto>> GetOwnerSubscriptionsAsync(int userId);
        Task<SubscriptionDetailDto> GetSubscriptionByIdAsync(int subscriptionId, int userId);
        Task CancelSubscriptionAsync(int subscriptionId, int userId);
        Task ConsumeOnePostAsync(long subscriptionId);
        bool HasRemainingPosts(MOwnerSubscription subscription);
        bool IsActive(MOwnerSubscription subscription, DateTime currentTime);
    }
}
