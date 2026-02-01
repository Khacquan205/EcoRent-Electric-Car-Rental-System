using CAR.Application.Dtos;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly IOwnerSubscriptionRepository _ownerSubscriptionRepository;
        private readonly IOwnerPackageRepository _ownerPackageRepository;
        private readonly IUnitOfWork _unitOfWork;

        public SubscriptionService(
            IOwnerProfileRepository ownerProfileRepository,
            IOwnerSubscriptionRepository ownerSubscriptionRepository,
            IOwnerPackageRepository ownerPackageRepository,
            IUnitOfWork unitOfWork)
        {
            _ownerProfileRepository = ownerProfileRepository;
            _ownerSubscriptionRepository = ownerSubscriptionRepository;
            _ownerPackageRepository = ownerPackageRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ActivateSubscriptionResponseDto> ActivateSubscriptionAsync(int userId, ActivateSubscriptionRequestDto request)
        {
            var ownerProfile = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (ownerProfile == null)
            {
                throw new UserFriendlyException(
                    403,
                    "OWNER_NOT_FOUND",
                    "User is not registered as an owner"
                );
            }

            if (ownerProfile.IdentityVerified != true)
            {
                throw new UserFriendlyException(
                    403,
                    "OWNER_NOT_VERIFIED",
                    "Owner identity verification is required"
                );
            }

            var package = await _ownerPackageRepository.GetByIdAsync(request.PackageId);
            if (package == null)
            {
                throw new UserFriendlyException(
                    404,
                    "PACKAGE_NOT_FOUND",
                    "Package not found"
                );
            }

            if (package.Status != OwnerPackageStatus.Active)
            {
                throw new UserFriendlyException(
                    400,
                    "PACKAGE_NOT_ACTIVE",
                    "Package is not available for purchase"
                );
            }

            var existingActiveSubscription = await _ownerSubscriptionRepository.GetActiveSubscriptionByOwnerIdAsync(ownerProfile.Id);
            if (existingActiveSubscription != null)
            {
                throw new UserFriendlyException(
                    409,
                    "ACTIVE_SUBSCRIPTION_EXISTS",
                    "Owner already has an active subscription"
                );
            }

            var now = DateTime.UtcNow;
            var subscription = new MOwnerSubscription
            {
                OwnerId = ownerProfile.Id,
                PackageId = package.Id,
                StartDate = now,
                EndDate = now.AddDays(package.DurationDays),
                TotalPosts = package.MaxPosts,
                RemainingPosts = package.MaxPosts,
                Status = 1, // ACTIVE
                Source = request.Source,
                CreatedAt = now,
                UpdatedAt = now
            };

            await _ownerSubscriptionRepository.AddAsync(subscription);
            await _unitOfWork.SaveChangesAsync();

            return new ActivateSubscriptionResponseDto
            {
                Id = subscription.Id,
                PackageId = (int)subscription.PackageId,
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                TotalPosts = subscription.TotalPosts,
                RemainingPosts = subscription.RemainingPosts,
                Status = subscription.Status
            };
        }

        public async Task ConsumeOnePostAsync(long subscriptionId)
        {
            var subscription = await _ownerSubscriptionRepository.Query()
                .FirstOrDefaultAsync(s => s.Id == subscriptionId);
            
            if (subscription == null)
            {
                throw new UserFriendlyException(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found");
            }

            if (subscription.RemainingPosts <= 0)
            {
                throw new UserFriendlyException(400, "NO_REMAINING_POSTS", "No remaining posts to consume");
            }

            subscription.RemainingPosts--;
            subscription.UpdatedAt = DateTime.UtcNow;

            _ownerSubscriptionRepository.Update(subscription);
            await _unitOfWork.SaveChangesAsync();
        }

        public bool HasRemainingPosts(MOwnerSubscription subscription)
        {
            return subscription.RemainingPosts > 0;
        }

        public bool IsActive(MOwnerSubscription subscription, DateTime currentTime)
        {
            return subscription.Status == 1 && subscription.StartDate <= currentTime && subscription.EndDate >= currentTime;
        }
    }
}
