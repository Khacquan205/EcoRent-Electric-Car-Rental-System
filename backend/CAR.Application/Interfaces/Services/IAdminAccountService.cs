using CAR.Application.Dtos.Admin;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IAdminAccountService
    {
        Task<List<UserListItemDto>> GetAllUsersAsync();
        Task<StaffResponseDto> PromoteToStaffAsync(PromoteToStaffRequestDto request);
        Task<UserDetailDto> GetUserByIdAsync(int id);
        Task<UserDetailDto> CreateUserAsync(CreateUserRequestDto request);
        Task<UserDetailDto> UpdateUserAsync(int id, UpdateUserRequestDto request);
        Task DeleteUserAsync(int id);
        Task HardDeleteUserAsync(int id);
    }
}
