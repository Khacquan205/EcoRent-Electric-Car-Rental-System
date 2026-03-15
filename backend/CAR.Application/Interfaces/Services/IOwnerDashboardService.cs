using CAR.Application.Dtos.Owner;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IOwnerDashboardService
    {
        Task<OwnerDashboardSummaryDto> GetSummaryAsync(int userId);
    }
}
