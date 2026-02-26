using CAR.Application.Dtos.Moderation;

namespace CAR.Application.Interfaces.Services
{
    public interface IPostModerationService
    {
        Task<PostModerationResponseDto> ApprovePostAsync(int postId, int staffId);
        Task<PostModerationResponseDto> RejectPostAsync(int postId, int staffId, string reason);
        Task<List<PendingPostDto>> GetPendingPostsAsync();
    }
}
