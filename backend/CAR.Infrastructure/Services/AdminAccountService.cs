using CAR.Application.Dtos.Admin;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Constants;
using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class AdminAccountService : IAdminAccountService
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthenticationRepository _authRepository;
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AdminAccountService(
            IUserRepository userRepository,
            IAuthenticationRepository authRepository,
            IStaffProfileRepository staffProfileRepository,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _authRepository = authRepository;
            _staffProfileRepository = staffProfileRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<UserListItemDto>> GetAllUsersAsync()
        {
            return await _userRepository.Query()
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    RoleId = u.RoleId,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<StaffResponseDto> PromoteToStaffAsync(PromoteToStaffRequestDto request)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new UserFriendlyException(404, "USER_NOT_FOUND", "User not found");

            if (user.RoleId == UserRoles.STAFF)
                throw new UserFriendlyException(400, "USER_ALREADY_STAFF", "User is already a staff member");

            // Check if profile already exists (maybe previously a staff)
            var existingProfile = await _staffProfileRepository.GetByUserIdAsync(user.Id);

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                // 1. Update User Role
                user.RoleId = UserRoles.STAFF;
                user.UpdatedAt = DateTime.UtcNow;
                _userRepository.Update(user);

                // 2. Create or Update Staff Profile
                MStaffProfile staffProfile;
                if (existingProfile == null)
                {
                    staffProfile = new MStaffProfile
                    {
                        UserId = user.Id,
                        Name = request.Name,
                        Phone = request.Phone,
                        StaffCode = request.StaffCode,
                        Status = 1, // Active
                        CreatedAt = DateTime.UtcNow
                    };
                    await _staffProfileRepository.AddAsync(staffProfile);
                }
                else
                {
                    staffProfile = existingProfile;
                    staffProfile.Name = request.Name;
                    staffProfile.Phone = request.Phone;
                    staffProfile.StaffCode = request.StaffCode;
                    staffProfile.Status = 1;
                    staffProfile.UpdatedAt = DateTime.UtcNow;
                    _staffProfileRepository.Update(staffProfile);
                }

                await _unitOfWork.CommitAsync();

                return new StaffResponseDto
                {
                    UserId = user.Id,
                    StaffProfileId = staffProfile.Id,
                    Email = user.Email,
                    Name = staffProfile.Name!,
                    Role = "STAFF",
                    CreatedAt = user.CreatedAt
                };
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }
    }
}
