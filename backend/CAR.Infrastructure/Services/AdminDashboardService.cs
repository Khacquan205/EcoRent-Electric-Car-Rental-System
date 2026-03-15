using CAR.Application.Dtos.Admin;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private const short SubscriptionStatusActive = 1;
        private readonly IOwnerSubscriptionRepository _subscriptionRepository;
        private readonly IPostRepository _postRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOwnerPackageRepository _packageRepository;

        public AdminDashboardService(
            IOwnerSubscriptionRepository subscriptionRepository,
            IPostRepository postRepository,
            IPaymentRepository paymentRepository,
            IOwnerPackageRepository packageRepository)
        {
            _subscriptionRepository = subscriptionRepository;
            _postRepository = postRepository;
            _paymentRepository = paymentRepository;
            _packageRepository = packageRepository;
        }

        public async Task<AdminDashboardStatsDto> GetStatsAsync()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var totalPackagesSold = await _subscriptionRepository.Query().CountAsync();

            var totalPosts = await _postRepository.Query().CountAsync();

            var activeOwnersCount = await _subscriptionRepository.Query()
                .Where(s => s.Status == SubscriptionStatusActive && s.EndDate >= now)
                .Select(s => s.OwnerId)
                .Distinct()
                .CountAsync();

            var monthlyRevenue = await _paymentRepository.Query()
                .Where(p => p.PaymentStatus == (int)PaymentStatus.Success
                            && p.PaymentType == (int)PaymentType.Subscription
                            && p.PayDate.HasValue
                            && p.PayDate.Value >= startOfMonth
                            && p.PayDate.Value < startOfMonth.AddMonths(1))
                .SumAsync(p => p.Amount);

            return new AdminDashboardStatsDto
            {
                TotalPackagesSold = totalPackagesSold,
                TotalPosts = totalPosts,
                ActiveOwnersCount = activeOwnersCount,
                MonthlyRevenue = monthlyRevenue
            };
        }

        public async Task<List<AdminDashboardMonthlyItemDto>> GetMonthlyAsync(int months = 6)
        {
            var now = DateTime.UtcNow;
            var start = now.AddMonths(-months);
            var subscriptionsQuery = _subscriptionRepository.Query()
                .Where(s => s.CreatedAt >= start);
            var postsQuery = _postRepository.Query()
                .Where(p => p.CreatedAt >= start);

            var subscriptionCounts = await subscriptionsQuery
                .GroupBy(s => new { s.CreatedAt.Year, s.CreatedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync();
            var postCounts = await postsQuery
                .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync();

            var result = new List<AdminDashboardMonthlyItemDto>();
            var ci = CultureInfo.GetCultureInfo("vi-VN");
            for (var i = months - 1; i >= 0; i--)
            {
                var d = now.AddMonths(-i);
                var monthLabel = d.ToString("'T'MM", ci).Replace("T", "T"); // T01, T02, ...
                var subs = subscriptionCounts.FirstOrDefault(c => c.Year == d.Year && c.Month == d.Month);
                var posts = postCounts.FirstOrDefault(c => c.Year == d.Year && c.Month == d.Month);
                result.Add(new AdminDashboardMonthlyItemDto
                {
                    Month = monthLabel,
                    PackagesSold = subs?.Count ?? 0,
                    PostsCount = posts?.Count ?? 0
                });
            }
            return result;
        }

        public async Task<List<AdminDashboardPackageDistributionItemDto>> GetPackageDistributionAsync()
        {
            var data = await _subscriptionRepository.Query()
                .Include(s => s.Package)
                .GroupBy(s => new { s.PackageId, PackageName = s.Package != null ? s.Package.Name : "N/A" })
                .Select(g => new AdminDashboardPackageDistributionItemDto
                {
                    PackageName = g.Key.PackageName ?? "N/A",
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();
            return data;
        }

        public async Task<List<AdminDashboardPostStatusItemDto>> GetPostStatusAsync()
        {
            var now = DateTime.UtcNow;
            var q = _postRepository.Query();

            var pending = await q.CountAsync(p => p.Status == (short)PostStatus.Pending);
            var rejected = await q.CountAsync(p => p.Status == (short)PostStatus.Rejected);
            var approved = await q.CountAsync(p => p.Status == (short)PostStatus.Approved && (p.ExpiredAt == null || p.ExpiredAt >= now));
            var expired = await q.CountAsync(p => p.Status == (short)PostStatus.Approved && p.ExpiredAt != null && p.ExpiredAt < now);

            return new List<AdminDashboardPostStatusItemDto>
            {
                new() { StatusName = "Đã duyệt", Count = approved },
                new() { StatusName = "Chờ duyệt", Count = pending },
                new() { StatusName = "Từ chối", Count = rejected },
                new() { StatusName = "Hết hạn", Count = expired }
            };
        }
    }
}
