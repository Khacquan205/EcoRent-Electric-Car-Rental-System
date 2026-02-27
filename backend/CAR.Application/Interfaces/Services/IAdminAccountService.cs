using CAR.Application.Dtos.Admin;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IAdminAccountService
    {

        Task<List<UserListItemDto>> GetAllUsersAsync();
        Task<StaffResponseDto> PromoteToStaffAsync(PromoteToStaffRequestDto request);
    }
}
