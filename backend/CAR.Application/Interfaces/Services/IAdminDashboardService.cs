using CAR.Application.Dtos.Admin;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IAdminDashboardService
    {
        Task<AdminDashboardStatsDto> GetStatsAsync();
        Task<List<AdminDashboardMonthlyItemDto>> GetMonthlyAsync(int months = 6);
        Task<List<AdminDashboardPackageDistributionItemDto>> GetPackageDistributionAsync();
        Task<List<AdminDashboardPostStatusItemDto>> GetPostStatusAsync();
    }
}
