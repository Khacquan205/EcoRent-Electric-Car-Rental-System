using CAR.Application.Dtos.Moderation;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Constants;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pgvector;

namespace CAR.Infrastructure.Services
{
    public class PostModerationService : IPostModerationService
    {
        private readonly IPostRepository _postRepository;
        private readonly IOwnerSubscriptionRepository _ownerSubscriptionRepository;
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmbeddingService _embeddingService;
        private readonly AppDbContext _dbContext;
        private readonly ILogger<PostModerationService> _logger;

        public PostModerationService(
            IPostRepository postRepository,
            IOwnerSubscriptionRepository ownerSubscriptionRepository,
            IStaffProfileRepository staffProfileRepository,
            IUserRepository userRepository,
            INotificationService notificationService,
            ISubscriptionService subscriptionService,
            IUnitOfWork unitOfWork,
            IEmbeddingService embeddingService,
            AppDbContext dbContext,
            ILogger<PostModerationService> logger)
        {
            _postRepository = postRepository;
            _ownerSubscriptionRepository = ownerSubscriptionRepository;
            _staffProfileRepository = staffProfileRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
            _subscriptionService = subscriptionService;
            _unitOfWork = unitOfWork;
            _embeddingService = embeddingService;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<PostModerationResponseDto> ApprovePostAsync(int postId, int staffId)
        {
            var post = await _postRepository.Query()
                .Include(p => p.OwnerProfile)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null)
                throw new UserFriendlyException(404, "POST_NOT_FOUND", "Post not found");

            if (post.Status != (short)PostStatus.Pending)
                throw new UserFriendlyException(400, "POST_NOT_PENDING", "Post is not in pending status");

            var staffProfile = await _staffProfileRepository.GetByUserIdAsync(staffId);
            int? staffProfileId = staffProfile?.Id;
            if (staffProfile == null)
            {
                var user = await _userRepository.GetByIdAsync(staffId);
                if (user == null || user.RoleId != UserRoles.ADMIN)
                    throw new UserFriendlyException(403, "STAFF_PROFILE_NOT_FOUND", "Logged in staff/admin does not have a profile. Please create a staff profile first.");
                staffProfileId = null;
            }

            post.Status = (short)PostStatus.Approved;
            post.StaffId = staffProfileId;
            post.UpdatedAt = DateTime.UtcNow;

            var activeSubscription = await _ownerSubscriptionRepository.GetValidActiveSubscriptionAsync(post.OwnerId, DateTime.UtcNow);

            if (activeSubscription != null)
            {
                if (post.ExpiredAt == null)
                    post.ExpiredAt = DateTime.UtcNow.AddDays(30);
                post.PriorityLevel = (short)activeSubscription.Package.PriorityLevel;
                await _subscriptionService.ConsumeOnePostAsync(activeSubscription.Id);
            }
            else
            {
                if (post.ExpiredAt == null)
                    post.ExpiredAt = DateTime.UtcNow.AddDays(30);
                post.PriorityLevel = 0;
            }

            _postRepository.Update(post);
            await _unitOfWork.SaveChangesAsync();

            await _notificationService.SendToUserAsync(
                post.OwnerProfile.UserId,
                "Post Approved",
                $"Your post \"{post.Title}\" has been approved.",
                post.Id);

            // Phase 3: tạo embedding cho semantic search
            await CreateOrUpdateEmbeddingAsync(post).ConfigureAwait(false);

            return new PostModerationResponseDto
            {
                PostId = post.Id,
                Status = post.Status,
                Message = "Post approved successfully"
            };
        }

        public async Task<PostModerationResponseDto> RejectPostAsync(int postId, int staffId, string reason)
        {
            var post = await _postRepository.Query()
                .Include(p => p.OwnerProfile)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null)
                throw new UserFriendlyException(404, "POST_NOT_FOUND", "Post not found");

            if (post.Status != (short)PostStatus.Pending)
                throw new UserFriendlyException(400, "POST_NOT_PENDING", "Post is not in pending status");

            var staffProfile = await _staffProfileRepository.GetByUserIdAsync(staffId);
            int? staffProfileId = staffProfile?.Id;
            if (staffProfile == null)
            {
                var user = await _userRepository.GetByIdAsync(staffId);
                if (user == null || user.RoleId != UserRoles.ADMIN)
                    throw new UserFriendlyException(403, "STAFF_PROFILE_NOT_FOUND", "Logged in staff/admin does not have a profile. Please create a staff profile first.");
                staffProfileId = null;
            }

            post.Status = (short)PostStatus.Rejected;
            post.StaffId = staffProfileId;
            post.RejectReason = reason;
            post.UpdatedAt = DateTime.UtcNow;

            _postRepository.Update(post);
            await _unitOfWork.SaveChangesAsync();

            await _notificationService.SendToUserAsync(
                post.OwnerProfile.UserId,
                "Post Rejected",
                $"Your post \"{post.Title}\" has been rejected. Reason: {reason}",
                post.Id);

            return new PostModerationResponseDto
            {
                PostId = post.Id,
                Status = post.Status,
                Message = "Post rejected successfully"
            };
        }

        public async Task<List<PendingPostDto>> GetPendingPostsAsync()
        {
            return await _postRepository.Query()
                .Include(p => p.OwnerProfile)
                .Where(p => p.Status == (short)PostStatus.Pending)
                .OrderBy(p => p.CreatedAt)
                .Select(p => new PendingPostDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    Price = p.Price,
                    OwnerId = p.OwnerId,
                    OwnerName = p.OwnerProfile.Name,
                    CategoryId = p.CategoryId,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<ModerationPostListItemDto>> GetModerationPostsAsync(short? status, int? ownerId, DateTime? fromDate, DateTime? toDate)
        {
            var query = _postRepository.Query()
                .Include(p => p.OwnerProfile)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Videos)
                .Include(p => p.LicenseImages)
                .Include(p => p.VehicleVerification)
                .AsQueryable();

            if (status.HasValue)
                query = query.Where(p => p.Status == status.Value);
            if (ownerId.HasValue)
                query = query.Where(p => p.OwnerId == ownerId.Value);
            if (fromDate.HasValue)
                query = query.Where(p => p.CreatedAt >= fromDate.Value);
            if (toDate.HasValue)
            {
                var endOfDay = toDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(p => p.CreatedAt <= endOfDay);
            }

            return await query
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new ModerationPostListItemDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    CategoryName = p.Category.Name,
                    OwnerId = p.OwnerId,
                    OwnerName = p.OwnerProfile.Name,
                    CreatedAt = p.CreatedAt,
                    Status = p.Status,
                    RejectReason = p.RejectReason,
                    Price = p.Price,
                    Description = p.Description,
                    Images = p.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList(),
                    Videos = p.Videos.OrderBy(v => v.Id).Select(v => v.VideoUrl).ToList(),
                    LicenseImageUrls = p.LicenseImages.OrderBy(li => li.SortOrder).Select(li => li.ImageUrl).ToList(),
                    RegistrationImageUrl = p.VehicleVerification != null ? p.VehicleVerification.RegistrationImage : null,
                    InspectionImageUrl = p.VehicleVerification != null ? p.VehicleVerification.InspectionImage : null,
                    InsuranceImageUrl = p.VehicleVerification != null ? p.VehicleVerification.InsuranceImage : null
                })
                .ToListAsync();
        }

        /// <summary>Phase 3: Tạo hoặc cập nhật embedding cho post (semantic search).</summary>
        private async Task CreateOrUpdateEmbeddingAsync(MPost post)
        {
            try
            {
                var text = $"{post.Title} {post.Description} {post.Category?.Name}".Trim();
                if (string.IsNullOrWhiteSpace(text)) return;

                var embedding = await _embeddingService.GetEmbeddingAsync(text).ConfigureAwait(false);
                if (embedding == null || embedding.Length == 0) return;

                var existing = await _dbContext.PostEmbeddings.FirstOrDefaultAsync(e => e.PostId == post.Id).ConfigureAwait(false);
                if (existing != null)
                {
                    existing.Embedding = new Vector(embedding);
                }
                else
                {
                    _dbContext.PostEmbeddings.Add(new TPostEmbedding
                    {
                        PostId = post.Id,
                        Embedding = new Vector(embedding),
                        CreatedAt = DateTime.UtcNow
                    });
                }
                await _dbContext.SaveChangesAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create embedding for post {PostId}", post.Id);
            }
        }
    }
}
