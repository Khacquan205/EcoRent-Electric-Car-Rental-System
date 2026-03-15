using CAR.Application.Dtos.Owner;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CAR.Controllers
{
    /// <summary>API dashboard cho Owner: gói đang dùng, slot còn lại, số bài đăng theo trạng thái.</summary>
    [ApiController]
    [Route("api/owner/dashboard")]
    [Authorize(Roles = "OWNER")]
    public class OwnerDashboardController : ControllerBase
    {
        private readonly IOwnerDashboardService _dashboardService;

        public OwnerDashboardController(IOwnerDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>Tổng quan dashboard: gói active, slot còn lại, số bài đăng theo trạng thái.</summary>
        [HttpGet("summary")]
        public async Task<ActionResult<OwnerDashboardSummaryDto>> GetSummary()
        {
            var userId = GetCurrentUserId();
            var result = await _dashboardService.GetSummaryAsync(userId);
            return Ok(result);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || !int.TryParse(claim.Value, out int userId))
                throw new UnauthorizedAccessException("Invalid user token");
            return userId;
        }
    }
}
