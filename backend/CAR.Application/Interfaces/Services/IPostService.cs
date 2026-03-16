using CAR.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IPostService
    {
        Task<CreatePostResponseDto> CreatePostAsync(int userId, CreatePostRequestDto request);
        Task<List<PostListItemDto>> GetOwnerPostsAsync(int userId);
        Task<PostDetailDto> GetPostByIdAsync(int postId);
        Task UpdatePostAsync(int postId, int userId, UpdatePostRequestDto request);
        Task DeletePostAsync(int postId, int userId);
        Task<PagedResultDto<PostListItemDto>> GetPublicPostsAsync(int page, int pageSize);
        /// <summary>Lấy danh sách bài public có filter (giá, category, location, hãng xe, từ khóa mô tả) để gợi ý trong chat. descriptionKeywords: tìm trong Title hoặc Description. orderByPriceDesc/Asc: sort theo giá (bỏ qua semantic).</summary>
        Task<List<PostListItemDto>> GetPublicPostsForSuggestionAsync(decimal? maxPrice, decimal? minPrice, int? categoryId, IReadOnlyList<int>? locationIds, string? brandKeyword, IReadOnlyList<string>? descriptionKeywords, int limit, string? semanticQueryForRanking = null, bool orderByPriceDesc = false, bool orderByPriceAsc = false);
    }
}
