using CAR.Application.Dtos.AdPackage;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Services
{
    public class OwnerAdvertisementService : IOwnerAdvertisementService
    {
        private const int AdStatusActive = 1;

        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly IAdPackageRepository _adPackageRepository;
        private readonly IOwnerAdCreditRepository _ownerAdCreditRepository;
        private readonly IAdOrderRepository _adOrderRepository;
        private readonly IPostRepository _postRepository;
        private readonly IAdvertisementRepository _advertisementRepository;
        private readonly IUnitOfWork _unitOfWork;

        public OwnerAdvertisementService(
            IOwnerProfileRepository ownerProfileRepository,
            IAdPackageRepository adPackageRepository,
            IOwnerAdCreditRepository ownerAdCreditRepository,
            IAdOrderRepository adOrderRepository,
            IPostRepository postRepository,
            IAdvertisementRepository advertisementRepository,
            IUnitOfWork unitOfWork)
        {
            _ownerProfileRepository = ownerProfileRepository;
            _adPackageRepository = adPackageRepository;
            _ownerAdCreditRepository = ownerAdCreditRepository;
            _adOrderRepository = adOrderRepository;
            _postRepository = postRepository;
            _advertisementRepository = advertisementRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<AdPackageResponseDto>> GetActiveAdPackagesAsync()
        {
            var list = await _adPackageRepository.GetActivePackagesAsync();
            return list.Select(p => new AdPackageResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                DurationDays = p.DurationDays,
                MaxPosts = p.MaxPosts,
                PriorityLevel = p.PriorityLevel,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList();
        }

        public async Task<List<OwnerAdCreditDto>> GetMyAdCreditsAsync(int userId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null) return new List<OwnerAdCreditDto>();

            var credits = await _ownerAdCreditRepository.Query()
                .Include(c => c.AdPackage)
                .Where(c => c.OwnerId == owner.Id && c.RemainingPosts > 0)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return credits.Select(c => new OwnerAdCreditDto
            {
                Id = c.Id,
                AdPackageId = c.AdPackageId,
                AdPackageName = c.AdPackage.Name ?? "",
                RemainingPosts = c.RemainingPosts,
                DurationDays = c.DurationDays,
                CreatedAt = c.CreatedAt
            }).ToList();
        }

        /// <summary>Tạo đơn mua gói quảng cáo (chờ thanh toán VNPay).</summary>
        public async Task<int> CreateAdOrderAsync(int userId, int adPackageId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null)
                throw new UserFriendlyException(403, "NOT_OWNER", "User is not an owner");

            var pkg = await _adPackageRepository.GetByIdAsync(adPackageId);
            if (pkg == null || pkg.Status != 1)
                throw new UserFriendlyException(404, "AD_PACKAGE_NOT_FOUND", "Ad package not found or inactive");

            var order = new MAdOrder
            {
                OwnerId = owner.Id,
                AdPackageId = pkg.Id,
                Amount = pkg.Price,
                Status = 0,
                CreatedAt = DateTime.UtcNow
            };
            await _adOrderRepository.AddAsync(order);
            await _unitOfWork.SaveChangesAsync();
            return order.Id;
        }

        /// <summary>Mua gói quảng cáo ngay (không qua VNPay, tạo credit trực tiếp - dùng cho test hoặc khuyến mãi).</summary>
        public async Task<OwnerAdCreditDto> PurchaseAdPackageAsync(int userId, int adPackageId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null)
                throw new UserFriendlyException(403, "NOT_OWNER", "User is not an owner");

            var pkg = await _adPackageRepository.GetByIdAsync(adPackageId);
            if (pkg == null || pkg.Status != 1)
                throw new UserFriendlyException(404, "AD_PACKAGE_NOT_FOUND", "Ad package not found or inactive");

            var credit = new MOwnerAdCredit
            {
                OwnerId = owner.Id,
                AdPackageId = pkg.Id,
                RemainingPosts = pkg.MaxPosts,
                DurationDays = pkg.DurationDays,
                CreatedAt = DateTime.UtcNow
            };
            await _ownerAdCreditRepository.AddAsync(credit);
            await _unitOfWork.SaveChangesAsync();

            return new OwnerAdCreditDto
            {
                Id = credit.Id,
                AdPackageId = credit.AdPackageId,
                AdPackageName = pkg.Name ?? "",
                RemainingPosts = credit.RemainingPosts,
                DurationDays = credit.DurationDays,
                CreatedAt = credit.CreatedAt
            };
        }

        public async Task ApplyAdToPostAsync(int userId, int postId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null)
                throw new UserFriendlyException(403, "NOT_OWNER", "User is not an owner");

            var post = await _postRepository.Query()
                .FirstOrDefaultAsync(p => p.Id == postId && p.OwnerId == owner.Id);
            if (post == null)
                throw new UserFriendlyException(404, "POST_NOT_FOUND", "Post not found or not yours");

            if (post.Status != (short)PostStatus.Approved)
                throw new UserFriendlyException(400, "POST_NOT_APPROVED", "Only approved posts can be advertised");

            var existingAd = await _advertisementRepository.GetByPostIdAsync(postId);
            if (existingAd != null && existingAd.EndDate >= DateTime.UtcNow)
                throw new UserFriendlyException(400, "POST_ALREADY_ADVERTISED", "This post is already running an active advertisement");

            var credit = await _ownerAdCreditRepository.GetFirstAvailableCreditAsync(owner.Id);
            if (credit == null)
                throw new UserFriendlyException(400, "NO_AD_CREDIT", "No ad credit available. Purchase an ad package first.");

            var now = DateTime.UtcNow;
            var ad = new MAdvertisement
            {
                PostId = postId,
                StartDate = now,
                EndDate = now.AddDays(credit.DurationDays),
                Status = AdStatusActive,
                Price = credit.AdPackage.Price,
                PriorityLevel = credit.AdPackage.PriorityLevel,
                CreatedAt = now
            };
            await _advertisementRepository.AddAsync(ad);

            credit.RemainingPosts--;
            _ownerAdCreditRepository.Update(credit);

            // Cập nhật priority_level trên post để phản ánh quảng cáo (1–3 theo gói)
            post.PriorityLevel = (short)Math.Clamp(ad.PriorityLevel, 0, short.MaxValue);
            post.UpdatedAt = now;
            _postRepository.Update(post);

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
