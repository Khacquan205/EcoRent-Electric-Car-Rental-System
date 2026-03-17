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
        private readonly IVehicleVerificationRepository _vehicleVerificationRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly CAR.Infrastructure.Data.AppDbContext _dbContext;
        private readonly IEmbeddingService _embeddingService;

        public PostService(
            IPostRepository postRepository,
            IOwnerProfileRepository ownerProfileRepository,
            IOwnerSubscriptionRepository ownerSubscriptionRepository,
            IVehicleCategoryRepository categoryRepository,
            ISubscriptionService subscriptionService,
            IVehicleVerificationRepository vehicleVerificationRepository,
            IUnitOfWork unitOfWork,
            CAR.Infrastructure.Data.AppDbContext dbContext,
            IEmbeddingService embeddingService)
        {
            _postRepository = postRepository;
            _ownerProfileRepository = ownerProfileRepository;
            _ownerSubscriptionRepository = ownerSubscriptionRepository;
            _categoryRepository = categoryRepository;
            _subscriptionService = subscriptionService;
            _vehicleVerificationRepository = vehicleVerificationRepository;
            _unitOfWork = unitOfWork;
            _dbContext = dbContext;
            _embeddingService = embeddingService;
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

            // Collect image URLs from both ImageUrls (list) and ImageUrl (single)
            var imageUrls = new List<string>();
            if (request.ImageUrls != null && request.ImageUrls.Count > 0)
            {
                imageUrls.AddRange(request.ImageUrls.Where(u => !string.IsNullOrWhiteSpace(u)));
            }
            if (!string.IsNullOrWhiteSpace(request.ImageUrl))
            {
                imageUrls.Add(request.ImageUrl);
            }

            if (imageUrls.Count > 0)
            {
                for (var i = 0; i < imageUrls.Count; i++)
                {
                    post.Images.Add(new TPostImage
                    {
                        ImageUrl = imageUrls[i],
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

            // Giấy tờ xe: tạo bản ghi sau khi post đã có Id để staff xem khi duyệt
            var hasVehicleDocs = !string.IsNullOrWhiteSpace(request.RegistrationImageUrl)
                || !string.IsNullOrWhiteSpace(request.InspectionImageUrl)
                || !string.IsNullOrWhiteSpace(request.InsuranceImageUrl);
            if (hasVehicleDocs)
            {
                var vv = new MVehicleVerification
                {
                    PostId = post.Id,
                    RegistrationImage = request.RegistrationImageUrl?.Trim(),
                    InspectionImage = request.InspectionImageUrl?.Trim(),
                    InsuranceImage = request.InsuranceImageUrl?.Trim(),
                    CreatedAt = currentTime
                };
                await _vehicleVerificationRepository.AddAsync(vv);
                await _unitOfWork.SaveChangesAsync();
            }

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

        public async Task<PostDetailDto> GetPostByIdAsync(int postId)
        {
            var post = await _postRepository.Query()
                .Include(p => p.Category)
                .Include(p => p.Location)
                .Include(p => p.Images.OrderBy(i => i.SortOrder))
                .Include(p => p.Videos)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null) throw new UserFriendlyException(404, "POST_NOT_FOUND", "Post not found or access denied");

            var vehicleVerification = await _vehicleVerificationRepository.Query()
                .FirstOrDefaultAsync(v => v.PostId == postId);

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
                Videos = post.Videos.Select(v => v.VideoUrl).ToList(),
                VehicleVerification = vehicleVerification == null ? null : new VehicleVerificationDto
                {
                    RegistrationImageUrl = vehicleVerification.RegistrationImage,
                    InspectionImageUrl = vehicleVerification.InspectionImage,
                    InsuranceImageUrl = vehicleVerification.InsuranceImage
                }
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

            var now = DateTime.UtcNow;
            // Sort: (1) ad priority 1–3 (bài có quảng cáo còn hiệu lực), (2) gói đăng bài priority_level, (3) ngày tạo.
            var query = _postRepository.Query()
                .Include(p => p.Category)
                .Include(p => p.Images.OrderBy(i => i.SortOrder))
                .Include(p => p.Videos)
                .Include(p => p.Advertisement)
                .Where(p => p.Status == (short)PostStatus.Approved)
                .Where(p => p.ExpiredAt == null || p.ExpiredAt >= now)
                .OrderByDescending(p => (p.Advertisement != null && p.Advertisement.EndDate >= now) ? p.Advertisement.PriorityLevel : 0)
                .ThenByDescending(p => p.PriorityLevel)
                .ThenByDescending(p => p.CreatedAt);

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
                    p.PriorityLevel,
                    CategoryName = p.Category.Name,
                    IsPromoted = p.Advertisement != null && p.Advertisement.EndDate >= now,
                    PromotedPriorityLevel = (p.Advertisement != null && p.Advertisement.EndDate >= now) ? p.Advertisement.PriorityLevel : 0,
                    Images = p.Images
                        .OrderBy(i => i.SortOrder)
                        .Select(i => i.ImageUrl)
                        .ToList(),
                    Videos = p.Videos
                        .Select(v => v.VideoUrl)
                        .ToList()
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
                CategoryName = p.CategoryName,
                IsPromoted = p.IsPromoted,
                PromotedPriorityLevel = p.PromotedPriorityLevel,
                Images = p.Images,
                Videos = p.Videos
            }).ToList();

            return new PagedResultDto<PostListItemDto>
            {
                Items = items,
                TotalCount = totalCount,
                TotalPages = totalPages,
                CurrentPage = page
            };
        }

        public async Task<List<PostListItemDto>> GetPublicPostsForSuggestionAsync(decimal? maxPrice, decimal? minPrice, int? categoryId, IReadOnlyList<int>? locationIds, string? brandKeyword, IReadOnlyList<string>? descriptionKeywords, int limit, string? semanticQueryForRanking = null, bool orderByPriceDesc = false, bool orderByPriceAsc = false)
        {
            if (limit <= 0) limit = 10;
            if (limit > 20) limit = 20;

            var now = DateTime.UtcNow;

            // Khi sort theo giá đắt nhất/rẻ nhất: không dùng semantic, chỉ filter + sort
            var useSemantic = !orderByPriceDesc && !orderByPriceAsc && !string.IsNullOrWhiteSpace(semanticQueryForRanking);

            // Phase 3: semantic ranking when query provided and we have embedding
            if (useSemantic)
            {
                var embedding = await _embeddingService.GetEmbeddingAsync(semanticQueryForRanking.Trim()).ConfigureAwait(false);
                if (embedding != null && embedding.Length > 0)
                {
                    var orderedIds = await GetPostIdsOrderedBySimilarityAsync(embedding, maxPrice, minPrice, categoryId, locationIds, brandKeyword, descriptionKeywords, limit).ConfigureAwait(false);
                    if (orderedIds.Count > 0)
                    {
                        var idsArray = orderedIds.ToArray();
                        var semanticPosts = await _postRepository.Query()
                            .Include(p => p.Category)
                            .Include(p => p.Images)
                            .Include(p => p.Videos)
                            .Include(p => p.Advertisement)
                            .Where(p => idsArray.Contains(p.Id))
                            .ToListAsync()
                            .ConfigureAwait(false);
                        var byId = semanticPosts.ToDictionary(p => p.Id);
                        var orderedPosts = orderedIds.Where(id => byId.ContainsKey(id)).Select(id => byId[id]).ToList();
                        return orderedPosts.Select(p => new PostListItemDto
                        {
                            Id = p.Id,
                            Title = p.Title,
                            Price = p.Price,
                            Status = p.Status,
                            StatusName = Enum.GetName(typeof(PostStatus), p.Status) ?? p.Status.ToString(),
                            CreatedAt = p.CreatedAt,
                            ExpiredAt = p.ExpiredAt,
                            CategoryName = p.Category?.Name ?? "",
                            IsPromoted = p.Advertisement != null && p.Advertisement.EndDate >= now,
                            PromotedPriorityLevel = (p.Advertisement != null && p.Advertisement.EndDate >= now) ? p.Advertisement.PriorityLevel : 0,
                            Images = p.Images?.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList() ?? new List<string>(),
                            Videos = p.Videos?.Select(v => v.VideoUrl).ToList() ?? new List<string>()
                        }).ToList();
                    }
                }
            }

            // AsNoTracking + đơn giản hóa query tránh EF Npgsql "Conflicting type mappings for column 'value'"
            var query = _postRepository.Query()
                .AsNoTracking()
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Videos)
                .Include(p => p.Advertisement)
                .Where(p => p.Status == (short)PostStatus.Approved)
                .Where(p => p.ExpiredAt == null || p.ExpiredAt >= now);

            if (maxPrice.HasValue && maxPrice.Value > 0)
                query = query.Where(p => p.Price <= maxPrice.Value);
            if (minPrice.HasValue && minPrice.Value > 0)
                query = query.Where(p => p.Price >= minPrice.Value);
            if (categoryId.HasValue && categoryId.Value > 0)
                query = query.Where(p => p.CategoryId == categoryId.Value);
            if (locationIds != null && locationIds.Count > 0)
            {
                var locIdsArray = locationIds.ToArray();
                query = query.Where(p => p.LocationId != null && locIdsArray.Contains(p.LocationId.Value));
            }
            // Hãng xe: tìm trong Title và Description (chủ đăng thường ghi tên hãng ở đây)
            if (!string.IsNullOrWhiteSpace(brandKeyword))
            {
                var pattern = "%" + brandKeyword.Trim() + "%";
                query = query.Where(p =>
                    EF.Functions.ILike(p.Title, pattern) ||
                    (p.Description != null && EF.Functions.ILike(p.Description, pattern)));
            }

            // Từ khóa mô tả: xe 7 chỗ, rộng rãi, SUV... tìm trong Title HOẶC Description (match BẤT KỲ từ khóa nào)
            // Không dùng .Any() trong EF vì Npgsql gây "Conflicting type mappings for column 'value'" -> filter in-memory
            var hasDescKw = descriptionKeywords != null && descriptionKeywords.Count > 0;

            IOrderedQueryable<Domain.Entities.MPost> ordered;
            if (orderByPriceDesc)
                ordered = query.OrderByDescending(p => p.Price).ThenByDescending(p => p.CreatedAt);
            else if (orderByPriceAsc)
                ordered = query.OrderBy(p => p.Price).ThenByDescending(p => p.CreatedAt);
            else
                ordered = query
                    .OrderByDescending(p => (p.Advertisement != null && p.Advertisement.EndDate >= now) ? p.Advertisement.PriorityLevel : 0)
                    .ThenByDescending(p => p.PriorityLevel)
                    .ThenByDescending(p => p.CreatedAt);

            // Tránh Select phức tạp với Images/Videos - EF Npgsql dễ bị "Conflicting type mappings for column 'value'"
            var posts = await ordered.Take(hasDescKw ? limit * 10 : limit).ToListAsync();

            if (hasDescKw)
                posts = posts.Where(p => descriptionKeywords!.Any(kw =>
                    (p.Title != null && p.Title.Contains(kw, StringComparison.OrdinalIgnoreCase)) ||
                    (p.Description != null && p.Description.Contains(kw, StringComparison.OrdinalIgnoreCase)))).Take(limit).ToList();

            return posts.Select(p => new PostListItemDto
            {
                Id = p.Id,
                Title = p.Title,
                Price = p.Price,
                Status = p.Status,
                StatusName = Enum.GetName(typeof(PostStatus), p.Status) ?? p.Status.ToString(),
                CreatedAt = p.CreatedAt,
                ExpiredAt = p.ExpiredAt,
                CategoryName = p.Category?.Name ?? "",
                IsPromoted = p.Advertisement != null && p.Advertisement.EndDate >= now,
                PromotedPriorityLevel = (p.Advertisement != null && p.Advertisement.EndDate >= now) ? p.Advertisement.PriorityLevel : 0,
                Images = p.Images?.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList() ?? new List<string>(),
                Videos = p.Videos?.Select(v => v.VideoUrl).ToList() ?? new List<string>()
            }).ToList();
        }

        /// <summary>Phase 3: Raw SQL order by vector L2 distance. Posts without embedding ordered last.</summary>
        private async Task<List<int>> GetPostIdsOrderedBySimilarityAsync(float[] queryEmbedding, decimal? maxPrice, decimal? minPrice, int? categoryId, IReadOnlyList<int>? locationIds, string? brandKeyword, IReadOnlyList<string>? descriptionKeywords, int limit)
        {
            var now = DateTime.UtcNow;
            var vecStr = "[" + string.Join(",", queryEmbedding.Select(f => f.ToString("R", System.Globalization.CultureInfo.InvariantCulture))) + "]";
            var hasLoc = locationIds != null && locationIds.Count > 0;
            var brandEmpty = string.IsNullOrWhiteSpace(brandKeyword);
            var brandPattern = "%" + (brandKeyword ?? "").Trim() + "%";
            var locIds = locationIds?.ToArray() ?? Array.Empty<int>();
            var maxPriceVal = maxPrice ?? 0m;
            var minPriceVal = minPrice ?? 0m;
            var categoryIdVal = categoryId ?? 0;
            var hasDescKw = descriptionKeywords != null && descriptionKeywords.Count > 0;

            var descKwCondition = "";
            if (hasDescKw)
            {
                var orParts = new List<string>();
                for (var i = 0; i < descriptionKeywords!.Count; i++)
                {
                    orParts.Add($"(p.title ILIKE {{{10 + i}}} OR (p.description IS NOT NULL AND p.description ILIKE {{{10 + i}}}))");
                }
                descKwCondition = " AND (" + string.Join(" OR ", orParts) + ")";
            }

            var sql = $@"
                SELECT p.id FROM m_post p
                LEFT JOIN t_post_embedding e ON e.post_id = p.id
                WHERE p.status = 1 AND (p.expired_at IS NULL OR p.expired_at >= {{0}})
                AND ({{1}} <= 0 OR p.price <= {{1}})
                AND ({{2}} <= 0 OR p.price >= {{2}})
                AND ({{3}} <= 0 OR p.category_id = {{3}})
                AND ({{4}} = false OR p.location_id = ANY({{5}}))
                AND ({{6}} = true OR p.title ILIKE {{7}} OR (p.description IS NOT NULL AND p.description ILIKE {{7}})){descKwCondition}
                ORDER BY CASE WHEN e.embedding IS NOT NULL THEN (e.embedding <=> ({{8}})::vector) ELSE 999 END NULLS LAST,
                    COALESCE((SELECT ad.priority_level FROM m_advertisement ad WHERE ad.post_id = p.id AND ad.end_date >= {{0}} LIMIT 1), 0) DESC,
                    p.priority_level DESC, p.created_at DESC
                LIMIT {{9}}";

            var paramList = new List<object> { now, maxPriceVal, minPriceVal, categoryIdVal, hasLoc, locIds, brandEmpty, brandPattern, vecStr, limit };
            if (hasDescKw)
            {
                foreach (var kw in descriptionKeywords!)
                    paramList.Add("%" + kw + "%");
            }
            var ids = await _dbContext.Database
                .SqlQueryRaw<int>(sql, paramList.ToArray())
                .ToListAsync();
            return ids;
        }
    }
}

