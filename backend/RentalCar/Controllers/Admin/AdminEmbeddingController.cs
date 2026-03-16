using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RentalCar.Controllers.Admin
{
    /// <summary>Phase 3: Admin API cho embedding backfill (RAG semantic search).</summary>
    [ApiController]
    [Route("api/admin/embedding")]
    [Authorize(Roles = "ADMIN")]
    public class AdminEmbeddingController : ControllerBase
    {
        private readonly IEmbeddingBackfillService _backfillService;

        public AdminEmbeddingController(IEmbeddingBackfillService backfillService)
        {
            _backfillService = backfillService;
        }

        /// <summary>Backfill embeddings cho tất cả post đã approve nhưng chưa có embedding. Cần OpenAI API key.</summary>
        [HttpPost("backfill")]
        public async Task<IActionResult> Backfill(CancellationToken cancellationToken)
        {
            var count = await _backfillService.BackfillApprovedPostsAsync(cancellationToken).ConfigureAwait(false);
            return Ok(new { processed = count, message = $"Đã tạo embedding cho {count} bài đăng." });
        }
    }
}
