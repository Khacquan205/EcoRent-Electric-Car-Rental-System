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
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly IOwnerSubscriptionRepository _ownerSubscriptionRepository;
        private readonly IVehicleCategoryRepository _categoryRepository;
        private readonly ISubscriptionService _subscriptionService;
        private readonly IUnitOfWork _unitOfWork;

        public PostService(
            IPostRepository postRepository,
            IOwnerProfileRepository ownerProfileRepository,
            IOwnerSubscriptionRepository ownerSubscriptionRepository,
            IVehicleCategoryRepository categoryRepository,
            ISubscriptionService subscriptionService,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _ownerProfileRepository = ownerProfileRepository;
            _ownerSubscriptionRepository = ownerSubscriptionRepository;
            _categoryRepository = categoryRepository;
            _subscriptionService = subscriptionService;
            _unitOfWork = unitOfWork;
        }

        public async Task<CreatePostResponseDto> CreatePostAsync(int userId, CreatePostRequestDto request)
        {
            var currentTime = DateTime.UtcNow;

            var verifiedOwner = await _ownerProfileRepository.GetVerifiedOwnerByUserIdAsync(userId);
            if (verifiedOwner == null)
            {
                throw new UserFriendlyException(
                    403,
                    "OWNER_NOT_VERIFIED",
                    "User is not registered as a verified owner"
                );
            }

            var activeSubscription = await _ownerSubscriptionRepository.GetValidActiveSubscriptionAsync(verifiedOwner.Id, currentTime);
            if (activeSubscription == null)
            {
                throw new UserFriendlyException(
                    403,
                    "NO_VALID_SUBSCRIPTION",
                    "No valid active subscription found. Please buy a package first."
                );
            }

            if (activeSubscription.RemainingPosts <= 0)
            {
                throw new UserFriendlyException(
                    403,
                    "NO_REMAINING_POSTS",
                    "No remaining post slots. Your subscription has reached the post limit."
                );
            }

            // Handle CategoryId (Swagger default 0)
            if (request.CategoryId <= 0)
            {
                throw new UserFriendlyException(400, "INVALID_CATEGORY", "Please select a valid vehicle category.");
            }

            var categoryExists = await _categoryRepository.Query().AnyAsync(c => c.Id == request.CategoryId);
            if (!categoryExists)
            {
                throw new UserFriendlyException(404, "CATEGORY_NOT_FOUND", $"Category ID {request.CategoryId} does not exist.");
            }

            // Handle LocationId 0 case (Swagger default)
            if (request.LocationId == 0) request.LocationId = null;

            var post = await _postRepository.CreatePendingPostAsync(
                request,
                verifiedOwner.Id,
                currentTime,
                activeSubscription.EndDate);

            if (request.ImageUrls != null && request.ImageUrls.Count > 0)
            {
                for (var i = 0; i < request.ImageUrls.Count; i++)
                {
                    post.Images.Add(new TPostImage
                    {
                        ImageUrl = request.ImageUrls[i],
                        SortOrder = i,
                        CreatedAt = currentTime
                    });
                }
            }

            if (request.VideoUrls != null && request.VideoUrls.Count > 0)
            {
                foreach (var url in request.VideoUrls)
                {
                    post.Videos.Add(new TPostVideo
                    {
                        VideoUrl = url,
                        CreatedAt = currentTime
                    });
                }
            }

            // Do NOT deduct slot here – deduct only when admin approves (see PostModerationService.ApprovePostAsync)
            await _unitOfWork.SaveChangesAsync();

            return new CreatePostResponseDto
            {
                Id = post.Id,
                Status = post.Status
            };
        }

        public async Task<List<PostListItemDto>> GetOwnerPostsAsync(int userId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null) return new List<PostListItemDto>();

            var postsData = await _postRepository.Query()
                .Where(p => p.OwnerId == owner.Id)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Price,
                    p.Status,
                    p.CreatedAt,
                    p.ExpiredAt,
                    CategoryName = p.Category.Name
                })
                .ToListAsync();

            return postsData.Select(p => new PostListItemDto
            {
                Id = p.Id,
                Title = p.Title,
                Price = p.Price,
                Status = p.Status,
                StatusName = Enum.GetName(typeof(PostStatus), p.Status) ?? p.Status.ToString(),
                CreatedAt = p.CreatedAt,
                ExpiredAt = p.ExpiredAt,
                CategoryName = p.CategoryName
            }).ToList();
        }

        public async Task<PostDetailDto> GetPostByIdAsync(int postId, int userId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null) throw new UserFriendlyException(403, "NOT_OWNER", "User is not an owner");

            var post = await _postRepository.Query()
                .Include(p => p.Category)
                .Include(p => p.Location)
                .Include(p => p.Images.OrderBy(i => i.SortOrder))
                .Include(p => p.Videos)
                .FirstOrDefaultAsync(p => p.Id == postId && p.OwnerId == owner.Id);

            if (post == null) throw new UserFriendlyException(404, "POST_NOT_FOUND", "Post not found or access denied");

            return new PostDetailDto
            {
                Id = post.Id,
                CategoryId = post.CategoryId,
                CategoryName = post.Category.Name,
                LocationId = post.LocationId,
                LocationName = post.Location != null 
                    ? $"{post.Location.AddressDetail}, {post.Location.Ward}, {post.Location.District}, {post.Location.Province}" 
                    : null,
                Title = post.Title,
                Description = post.Description,
                Price = post.Price,
                ContactPhone = post.ContactPhone,
                Status = post.Status,
                StatusName = Enum.GetName(typeof(PostStatus), post.Status) ?? post.Status.ToString(),
                RejectReason = post.RejectReason,
                PriorityLevel = post.PriorityLevel,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                ExpiredAt = post.ExpiredAt,
                Images = post.Images.Select(i => i.ImageUrl).ToList(),
                Videos = post.Videos.Select(v => v.VideoUrl).ToList()
            };
        }

        public async Task UpdatePostAsync(int postId, int userId, UpdatePostRequestDto request)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null) throw new UserFriendlyException(403, "NOT_OWNER", "User is not an owner");

            var post = await _postRepository.Query()
                .FirstOrDefaultAsync(p => p.Id == postId && p.OwnerId == owner.Id);

            if (post == null) throw new UserFriendlyException(404, "POST_NOT_FOUND", "Post not found or access denied");

            // Handle CategoryId (Swagger default 0)
            if (request.CategoryId <= 0)
            {
                throw new UserFriendlyException(400, "INVALID_CATEGORY", "Please select a valid vehicle category.");
            }

            var categoryExists = await _categoryRepository.Query().AnyAsync(c => c.Id == request.CategoryId);
            if (!categoryExists)
            {
                throw new UserFriendlyException(404, "CATEGORY_NOT_FOUND", $"Category ID {request.CategoryId} does not exist.");
            }

            // Handle LocationId 0 case (Swagger default)
            int? targetLocationId = request.LocationId == 0 ? null : request.LocationId;

            post.Title = request.Title;
            post.Description = request.Description;
            post.Price = request.Price;
            post.ContactPhone = request.ContactPhone;
            post.CategoryId = request.CategoryId;
            post.LocationId = targetLocationId;
            post.UpdatedAt = DateTime.UtcNow;

            // Reset status to pending for re-moderation
            post.Status = (short)PostStatus.Pending;

            _postRepository.Update(post);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeletePostAsync(int postId, int userId)
        {
            var owner = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (owner == null) throw new UserFriendlyException(403, "NOT_OWNER", "User is not an owner");

            var post = await _postRepository.Query()
                .FirstOrDefaultAsync(p => p.Id == postId && p.OwnerId == owner.Id);

            if (post == null) throw new UserFriendlyException(404, "POST_NOT_FOUND", "Post not found or access denied");

            _postRepository.Remove(post);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<PagedResultDto<PostListItemDto>> GetPublicPostsAsync(int page, int pageSize)
        {
            if (page < 1) page = 1;
            if (pageSize <= 0) pageSize = 12;
            if (pageSize > 100) pageSize = 100;

            var query = _postRepository.Query()
                .Include(p => p.Category)
                .Where(p => p.Status == (short)PostStatus.Approved)
                .OrderByDescending(p => p.CreatedAt);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var rawPosts = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Price,
                    p.Status,
                    p.CreatedAt,
                    p.ExpiredAt,
                    CategoryName = p.Category.Name
                })
                .ToListAsync();

            var items = rawPosts.Select(p => new PostListItemDto
            {
                Id = p.Id,
                Title = p.Title,
                Price = p.Price,
                Status = p.Status,
                StatusName = Enum.GetName(typeof(PostStatus), p.Status) ?? p.Status.ToString(),
                CreatedAt = p.CreatedAt,
                ExpiredAt = p.ExpiredAt,
                CategoryName = p.CategoryName
            }).ToList();

            return new PagedResultDto<PostListItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                TotalPages = totalPages,
                CurrentPage = page
            };
        }
    }
}

