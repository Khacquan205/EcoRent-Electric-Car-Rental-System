using CAR.Application.Dtos.Owner;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class OwnerDashboardService : IOwnerDashboardService
    {
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly IOwnerSubscriptionRepository _subscriptionRepository;
        private readonly IPostRepository _postRepository;
        private readonly IOwnerAdCreditRepository _ownerAdCreditRepository;
        private readonly IAdvertisementRepository _advertisementRepository;

        public OwnerDashboardService(
            IOwnerProfileRepository ownerProfileRepository,
            IOwnerSubscriptionRepository subscriptionRepository,
            IPostRepository postRepository,
            IOwnerAdCreditRepository ownerAdCreditRepository,
            IAdvertisementRepository advertisementRepository)
        {
            _ownerProfileRepository = ownerProfileRepository;
            _subscriptionRepository = subscriptionRepository;
            _postRepository = postRepository;
            _ownerAdCreditRepository = ownerAdCreditRepository;
            _advertisementRepository = advertisementRepository;
        }

        public async Task<OwnerDashboardSummaryDto> GetSummaryAsync(int userId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null)
            {
                return new OwnerDashboardSummaryDto
                {
                    ActiveSubscription = null,
                    RemainingSlots = 0,
                    PostCountByStatus = new OwnerDashboardPostCountByStatusDto(),
                    AdSummary = new OwnerDashboardAdSummaryDto()
                };
            }

            var now = DateTime.UtcNow;
            var activeSub = await _subscriptionRepository.Query()
                .Include(s => s.Package)
                .FirstOrDefaultAsync(s =>
                    s.OwnerId == owner.Id
                    && s.Status == 1 // Active
                    && s.EndDate >= now
                    && s.RemainingPosts > 0);

            OwnerDashboardActiveSubscriptionDto? activeSubscriptionDto = null;
            var remainingSlots = 0;
            if (activeSub != null)
            {
                remainingSlots = activeSub.RemainingPosts;
                activeSubscriptionDto = new OwnerDashboardActiveSubscriptionDto
                {
                    Id = activeSub.Id,
                    PackageName = activeSub.Package?.Name ?? "N/A",
                    EndDate = activeSub.EndDate,
                    TotalPosts = activeSub.TotalPosts,
                    RemainingPosts = activeSub.RemainingPosts
                };
            }

            var q = _postRepository.Query().Where(p => p.OwnerId == owner.Id);
            var pending = await q.CountAsync(p => p.Status == (short)PostStatus.Pending);
            var rejected = await q.CountAsync(p => p.Status == (short)PostStatus.Rejected);
            var approved = await q.CountAsync(p => p.Status == (short)PostStatus.Approved && (p.ExpiredAt == null || p.ExpiredAt >= now));
            var expired = await q.CountAsync(p => p.Status == (short)PostStatus.Approved && p.ExpiredAt != null && p.ExpiredAt < now);

            // Quảng cáo: tổng credit còn lại + số bài đang được boost (quảng cáo còn hiệu lực)
            var remainingAdCredits = await _ownerAdCreditRepository.Query()
                .Where(c => c.OwnerId == owner.Id && c.RemainingPosts > 0)
                .SumAsync(c => c.RemainingPosts);
            var ownerPostIds = _postRepository.Query().Where(p => p.OwnerId == owner.Id).Select(p => p.Id);
            var boostedPostsCount = await _advertisementRepository.Query()
                .Where(a => ownerPostIds.Contains(a.PostId) && a.EndDate >= now)
                .CountAsync();

            return new OwnerDashboardSummaryDto
            {
                ActiveSubscription = activeSubscriptionDto,
                RemainingSlots = remainingSlots,
                PostCountByStatus = new OwnerDashboardPostCountByStatusDto
                {
                    Pending = pending,
                    Approved = approved,
                    Rejected = rejected,
                    Expired = expired
                },
                AdSummary = new OwnerDashboardAdSummaryDto
                {
                    RemainingAdCredits = remainingAdCredits,
                    BoostedPostsCount = boostedPostsCount
                }
            };
        }
    }
}
