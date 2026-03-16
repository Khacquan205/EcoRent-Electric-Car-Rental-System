using CAR.Application.Interfaces.Services;
using CAR.Domain.Enums;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pgvector;

namespace CAR.Infrastructure.Services
{
    /// <summary>Phase 3: Backfill embeddings cho post đã approve chưa có embedding.</summary>
    public class PostEmbeddingBackfillService : IEmbeddingBackfillService
    {
        private readonly AppDbContext _dbContext;
        private readonly IEmbeddingService _embeddingService;
        private readonly ILogger<PostEmbeddingBackfillService> _logger;

        public PostEmbeddingBackfillService(AppDbContext dbContext, IEmbeddingService embeddingService, ILogger<PostEmbeddingBackfillService> logger)
        {
            _dbContext = dbContext;
            _embeddingService = embeddingService;
            _logger = logger;
        }

        public async Task<int> BackfillApprovedPostsAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;
            var postIdsWithEmbedding = await _dbContext.PostEmbeddings.Select(e => e.PostId).ToListAsync(cancellationToken).ConfigureAwait(false);

            var posts = await _dbContext.Posts
                .Include(p => p.Category)
                .Where(p => p.Status == (short)PostStatus.Approved)
                .Where(p => p.ExpiredAt == null || p.ExpiredAt >= now)
                .Where(p => !postIdsWithEmbedding.Contains(p.Id))
                .OrderBy(p => p.Id)
                .ToListAsync(cancellationToken).ConfigureAwait(false);

            var count = 0;
            foreach (var post in posts)
            {
                if (cancellationToken.IsCancellationRequested) break;

                try
                {
                    var text = $"{post.Title} {post.Description} {post.Category?.Name}".Trim();
                    if (string.IsNullOrWhiteSpace(text)) continue;

                    var embedding = await _embeddingService.GetEmbeddingAsync(text).ConfigureAwait(false);
                    if (embedding == null || embedding.Length == 0) continue;

                    _dbContext.PostEmbeddings.Add(new TPostEmbedding
                    {
                        PostId = post.Id,
                        Embedding = new Vector(embedding),
                        CreatedAt = now
                    });
                    await _dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
                    count++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Backfill embedding failed for post {PostId}", post.Id);
                }
            }

            return count;
        }
    }
}
