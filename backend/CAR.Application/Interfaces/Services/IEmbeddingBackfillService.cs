namespace CAR.Application.Interfaces.Services
{
    /// <summary>Phase 3: Backfill embeddings cho post đã approve nhưng chưa có embedding.</summary>
    public interface IEmbeddingBackfillService
    {
        /// <summary>Xử lý tất cả post approved (chưa hết hạn) chưa có embedding. Trả về số bản ghi đã tạo.</summary>
        Task<int> BackfillApprovedPostsAsync(CancellationToken cancellationToken = default);
    }
}
