using CAR.Application.Dtos;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<CreateSubscriptionResponseDto> CreateSubscriptionAsync(int userId, CreateSubscriptionRequestDto request)
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
                Status = 0, // PENDING_PAYMENT
                Source = request.Source,
                CreatedAt = now,
                UpdatedAt = now
            };

            await _ownerSubscriptionRepository.AddAsync(subscription);
            await _unitOfWork.SaveChangesAsync();

            return new CreateSubscriptionResponseDto
            {
                Id = subscription.Id,
                PackageId = subscription.PackageId,
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                TotalPosts = subscription.TotalPosts,
                RemainingPosts = subscription.RemainingPosts,
                Status = subscription.Status
            };
        }

        public async Task<List<SubscriptionListItemDto>> GetOwnerSubscriptionsAsync(int userId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null) return new List<SubscriptionListItemDto>();

            var subscriptionData = await _ownerSubscriptionRepository.Query()
                .Include(s => s.Package)
                .Where(s => s.OwnerId == owner.Id)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    s.Id,
                    s.PackageId,
                    PackageName = s.Package.Name,
                    s.StartDate,
                    s.EndDate,
                    s.TotalPosts,
                    s.RemainingPosts,
                    s.Status,
                    s.CreatedAt
                })
                .ToListAsync();

            return subscriptionData.Select(s => new SubscriptionListItemDto
            {
                Id = s.Id,
                PackageId = s.PackageId,
                PackageName = s.PackageName,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                TotalPosts = s.TotalPosts,
                RemainingPosts = s.RemainingPosts,
                Status = s.Status,
                StatusName = GetStatusName(s.Status, s.EndDate),
                CreatedAt = s.CreatedAt
            }).ToList();
        }

        public async Task<SubscriptionDetailDto> GetSubscriptionByIdAsync(int subscriptionId, int userId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null) throw new UserFriendlyException(403, "NOT_OWNER", "User is not an owner");

            var s = await _ownerSubscriptionRepository.Query()
                .Include(s => s.Package)
                .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.OwnerId == owner.Id);

            if (s == null) throw new UserFriendlyException(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found");

            return new SubscriptionDetailDto
            {
                Id = s.Id,
                PackageId = s.PackageId,
                PackageName = s.Package.Name,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                TotalPosts = s.TotalPosts,
                RemainingPosts = s.RemainingPosts,
                Status = s.Status,
                StatusName = GetStatusName(s.Status, s.EndDate),
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                Source = s.Source,
                Price = s.Package.Price
            };
        }

        public async Task CancelSubscriptionAsync(int subscriptionId, int userId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null) throw new UserFriendlyException(403, "NOT_OWNER", "User is not an owner");

            var subscription = await _ownerSubscriptionRepository.Query()
                .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.OwnerId == owner.Id);

            if (subscription == null) throw new UserFriendlyException(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found");

            if (subscription.Status == 2) // Already cancelled
                return;

            subscription.Status = 2; // Cancelled
            subscription.UpdatedAt = DateTime.UtcNow;

            _ownerSubscriptionRepository.Update(subscription);
            await _unitOfWork.SaveChangesAsync();
        }

        private string GetStatusName(short status, DateTime endDate)
        {
            if (status == 1 && endDate < DateTime.UtcNow) return "Expired";
            return status switch
            {
                0 => "Pending Payment",
                1 => "Active",
                2 => "Cancelled",
                _ => "Unknown"
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
