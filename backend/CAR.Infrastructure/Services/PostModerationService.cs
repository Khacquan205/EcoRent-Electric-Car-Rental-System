using CAR.Application.Dtos.Moderation;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Constants;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using Microsoft.EntityFrameworkCore;

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

        public PostModerationService(
            IPostRepository postRepository,
            IOwnerSubscriptionRepository ownerSubscriptionRepository,
            IStaffProfileRepository staffProfileRepository,
            IUserRepository userRepository,
            INotificationService notificationService,
            ISubscriptionService subscriptionService,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _ownerSubscriptionRepository = ownerSubscriptionRepository;
            _staffProfileRepository = staffProfileRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
            _subscriptionService = subscriptionService;
            _unitOfWork = unitOfWork;
        }

        public async Task<PostModerationResponseDto> ApprovePostAsync(int postId, int staffId)
        {
            var post = await _postRepository.Query()
                .Include(p => p.OwnerProfile)
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

            var activeSubscription = await _ownerSubscriptionRepository.Query()
                .Include(s => s.Package)
                .Where(s => s.OwnerId == post.OwnerId && s.Status == 1 && s.EndDate > DateTime.UtcNow)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (activeSubscription != null)
            {
                post.ExpiredAt = DateTime.UtcNow.AddDays(activeSubscription.Package.DurationDays);
                post.PriorityLevel = (short)activeSubscription.Package.PriorityLevel;
                // Deduct 1 post slot only when approved (not when pending)
                await _subscriptionService.ConsumeOnePostAsync(activeSubscription.Id);
            }
            else
            {
                post.ExpiredAt = DateTime.UtcNow.AddDays(30); // Fallback
                post.PriorityLevel = 0;
            }

            _postRepository.Update(post);
            await _unitOfWork.SaveChangesAsync();

            await _notificationService.SendToUserAsync(
                post.OwnerProfile.UserId,
                "Post Approved",
                $"Your post \"{post.Title}\" has been approved.",
                post.Id);

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
                    Description = p.Description
                })
                .ToListAsync();
        }
    }
}
