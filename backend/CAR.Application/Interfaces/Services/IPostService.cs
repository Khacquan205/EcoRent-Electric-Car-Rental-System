using CAR.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IPostService
    {
        Task<CreatePostResponseDto> CreatePostAsync(int userId, CreatePostRequestDto request);
        Task<List<PostListItemDto>> GetOwnerPostsAsync(int userId);
        Task<PostDetailDto> GetPostByIdAsync(int postId, int userId);
        Task UpdatePostAsync(int postId, int userId, UpdatePostRequestDto request);
        Task DeletePostAsync(int postId, int userId);

        /// <summary>
        /// Returns a paginated list of approved posts for public listing.
        /// </summary>
        Task<PagedResultDto<PostListItemDto>> GetPublicPostsAsync(int page, int pageSize);
    }
}

