using CAR.Application.Dtos.Admin;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAR.Controllers
{
    /// <summary>API dashboard cho Admin/Staff: thống kê tổng quan, theo tháng, phân bố gói, trạng thái bài đăng.</summary>
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize(Roles = "ADMIN,STAFF")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _dashboardService;

        public AdminDashboardController(IAdminDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>Thống kê tổng quan: tổng gói đã bán, tổng bài đăng, chủ xe hoạt động, doanh thu tháng.</summary>
        [HttpGet("stats")]
        public async Task<ActionResult<AdminDashboardStatsDto>> GetStats()
        {
            var result = await _dashboardService.GetStatsAsync();
            return Ok(result);
        }

        /// <summary>Dữ liệu theo tháng (gói đã bán + bài đăng) cho biểu đồ, mặc định 6 tháng.</summary>
        [HttpGet("monthly")]
        public async Task<ActionResult<List<AdminDashboardMonthlyItemDto>>> GetMonthly([FromQuery] int months = 6)
        {
            if (months < 1 || months > 24) months = 6;
            var result = await _dashboardService.GetMonthlyAsync(months);
            return Ok(result);
        }

        /// <summary>Phân bố gói đã mua (theo tên gói).</summary>
        [HttpGet("package-distribution")]
        public async Task<ActionResult<List<AdminDashboardPackageDistributionItemDto>>> GetPackageDistribution()
        {
            var result = await _dashboardService.GetPackageDistributionAsync();
            return Ok(result);
        }

        /// <summary>Phân bố trạng thái bài đăng: Đã duyệt, Chờ duyệt, Từ chối, Hết hạn.</summary>
        [HttpGet("post-status")]
        public async Task<ActionResult<List<AdminDashboardPostStatusItemDto>>> GetPostStatus()
        {
            var result = await _dashboardService.GetPostStatusAsync();
            return Ok(result);
        }
    }
}
