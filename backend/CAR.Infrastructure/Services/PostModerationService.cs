using CAR.Application.Dtos.Moderation;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
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
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public PostModerationService(
            IPostRepository postRepository,
            IOwnerSubscriptionRepository ownerSubscriptionRepository,
            IStaffProfileRepository staffProfileRepository,
            INotificationService notificationService,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _ownerSubscriptionRepository = ownerSubscriptionRepository;
            _staffProfileRepository = staffProfileRepository;
            _notificationService = notificationService;
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
            if (staffProfile == null)
                throw new UserFriendlyException(403, "STAFF_PROFILE_NOT_FOUND", "Logged in staff/admin does not have a profile. Please create a staff profile first.");

            post.Status = (short)PostStatus.Approved;
            post.StaffId = staffProfile.Id;
            post.UpdatedAt = DateTime.UtcNow;

            // Set Expiration Date and Priority based on Owner's active subscription
            // Default to 30 days if no active subscription (should not happen if flow is followed)
            var activeSubscription = await _ownerSubscriptionRepository.Query()
                .Include(s => s.Package)
                .Where(s => s.OwnerId == post.OwnerId && s.Status == 1 && s.EndDate > DateTime.UtcNow)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (activeSubscription != null)
            {
                post.ExpiredAt = DateTime.UtcNow.AddDays(activeSubscription.Package.DurationDays);
                post.PriorityLevel = (short)activeSubscription.Package.PriorityLevel;
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
            if (staffProfile == null)
                throw new UserFriendlyException(403, "STAFF_PROFILE_NOT_FOUND", "Logged in staff/admin does not have a profile. Please create a staff profile first.");

            post.Status = (short)PostStatus.Rejected;
            post.StaffId = staffProfile.Id;
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
    }
}
