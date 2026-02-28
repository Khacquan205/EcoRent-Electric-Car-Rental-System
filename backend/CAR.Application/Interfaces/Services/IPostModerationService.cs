using CAR.Application.Dtos.Moderation;

namespace CAR.Application.Interfaces.Services
{
    public interface IPostModerationService
    {
        Task<PostModerationResponseDto> ApprovePostAsync(int postId, int staffId);
        Task<PostModerationResponseDto> RejectPostAsync(int postId, int staffId, string reason);
        Task<List<PendingPostDto>> GetPendingPostsAsync();
        /// <summary>
        /// List posts for moderation dashboard with optional filters (status, ownerId, date range).
        /// </summary>
        Task<List<ModerationPostListItemDto>> GetModerationPostsAsync(short? status, int? ownerId, DateTime? fromDate, DateTime? toDate);
    }
}
