using CAR.Application.Dtos.Admin;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Constants;
using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class AdminAccountService : IAdminAccountService
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthenticationRepository _authRepository;
        private readonly IStaffProfileRepository _staffProfileRepository;
        private readonly ICustomerProfileRepository _customerProfileRepository;
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly IPostRepository _postRepository;
        private readonly IOwnerSubscriptionRepository _ownerSubscriptionRepository;
        private readonly IPhoneRepository _phoneRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AdminAccountService(
            IUserRepository userRepository,
            IAuthenticationRepository authRepository,
            IStaffProfileRepository staffProfileRepository,
            ICustomerProfileRepository customerProfileRepository,
            IOwnerProfileRepository ownerProfileRepository,
            IPostRepository postRepository,
            IOwnerSubscriptionRepository ownerSubscriptionRepository,
            IPhoneRepository phoneRepository,
            INotificationRepository notificationRepository,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _authRepository = authRepository;
            _staffProfileRepository = staffProfileRepository;
            _customerProfileRepository = customerProfileRepository;
            _ownerProfileRepository = ownerProfileRepository;
            _postRepository = postRepository;
            _ownerSubscriptionRepository = ownerSubscriptionRepository;
            _phoneRepository = phoneRepository;
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<UserListItemDto>> GetAllUsersAsync()
        {
            return await _userRepository.Query()
                .Where(u => u.Status != 0)
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

        public async Task<UserDetailDto> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.Query()
                .Include(u => u.CustomerProfile)
                .Include(u => u.OwnerProfile)
                .Include(u => u.StaffProfile)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null || user.Status == 0)
            {
                throw new UserFriendlyException(404, "USER_NOT_FOUND", "User not found");
            }

            var detail = new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                RoleId = user.RoleId,
                Status = user.Status,
                LoginProvider = user.LoginProvider,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            if (user.CustomerProfile != null)
            {
                detail.CustomerProfile = new AdminCustomerProfileDto
                {
                    Id = user.CustomerProfile.Id,
                    DisplayName = user.CustomerProfile.DisplayName,
                    Address = user.CustomerProfile.Address,
                    Latitude = user.CustomerProfile.Latitude,
                    Longitude = user.CustomerProfile.Longitude,
                    CreatedAt = user.CustomerProfile.CreatedAt,
                    UpdatedAt = user.CustomerProfile.UpdatedAt
                };
            }

            if (user.OwnerProfile != null)
            {
                detail.OwnerProfile = new AdminOwnerProfileDto
                {
                    Id = user.OwnerProfile.Id,
                    Name = user.OwnerProfile.Name,
                    FullName = user.OwnerProfile.FullName,
                    IdNumber = user.OwnerProfile.IdNumber,
                    DateOfBirth = user.OwnerProfile.DateOfBirth,
                    Gender = (int)user.OwnerProfile.Gender,
                    Phone = user.OwnerProfile.Phone,
                    IdentityVerified = user.OwnerProfile.IdentityVerified,
                    RatingAvg = user.OwnerProfile.RatingAvg,
                    TotalPosts = user.OwnerProfile.TotalPosts,
                    CreatedAt = user.OwnerProfile.CreatedAt,
                    UpdatedAt = user.OwnerProfile.UpdatedAt
                };
            }

            if (user.StaffProfile != null)
            {
                detail.StaffProfile = new AdminStaffProfileDto
                {
                    Id = user.StaffProfile.Id,
                    Name = user.StaffProfile.Name,
                    Phone = user.StaffProfile.Phone,
                    StaffCode = user.StaffProfile.StaffCode,
                    Status = user.StaffProfile.Status,
                    CreatedAt = user.StaffProfile.CreatedAt,
                    UpdatedAt = user.StaffProfile.UpdatedAt
                };
            }

            return detail;
        }

        public async Task<UserDetailDto> CreateUserAsync(CreateUserRequestDto request)
        {
            var existing = await _userRepository.GetByEmailAsync(request.Email);
            if (existing != null)
            {
                throw new UserFriendlyException(400, "EMAIL_ALREADY_EXISTS", "A user with this email already exists");
            }

            var now = DateTime.UtcNow;

            // Hash password using the same strategy as AuthService to keep consistency.
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new MUser
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                RoleId = request.RoleId,
                Status = request.Status,
                LoginProvider = "Local",
                CreatedAt = now,
                UpdatedAt = now
            };

            await _userRepository.CreateUserAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // Create an authentication record so the user can log in immediately without OTP.
            var auth = new MAuthentication
            {
                UserId = user.Id,
                Email = request.Email,
                Name = request.DisplayName,
                Address = request.Address,
                PasswordHash = passwordHash,
                AuthType = 1, // Email/Password
                AuthProvider = 1, // Local
                IsActive = request.Status == 1,
                CreatedAt = now,
                UpdatedAt = now
            };

            await _authRepository.CreateAuthenticationAsync(auth);

            // For customer accounts, create a basic customer profile so downstream flows work.
            if (request.RoleId == UserRoles.CUSTOMER)
            {
                var displayName = request.DisplayName;
                if (string.IsNullOrWhiteSpace(displayName))
                {
                    displayName = request.Email.Split('@')[0];
                }

                var customerProfile = new MCustomerProfile
                {
                    UserId = user.Id,
                    DisplayName = displayName!,
                    Address = request.Address,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                await _customerProfileRepository.CreateCustomerProfileAsync(customerProfile);
            }

            await _unitOfWork.SaveChangesAsync();

            return await GetUserByIdAsync(user.Id);
        }

        public async Task<UserDetailDto> UpdateUserAsync(int id, UpdateUserRequestDto request)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new UserFriendlyException(404, "USER_NOT_FOUND", "User not found");
            }

            user.RoleId = request.RoleId;
            user.Status = request.Status;
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);

            var auth = await _authRepository.GetByUserIdAsync(user.Id);
            if (auth != null)
            {
                // Keep authentication status in sync with user status.
                auth.IsActive = request.Status == 1;
                auth.UpdatedAt = DateTime.UtcNow;
                _authRepository.Update(auth);
            }

            await _unitOfWork.SaveChangesAsync();

            return await GetUserByIdAsync(user.Id);
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new UserFriendlyException(404, "USER_NOT_FOUND", "User not found");
            }

            // Soft delete: mark user as inactive instead of hard-deleting to avoid FK issues.
            user.Status = 0;
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);

            var auth = await _authRepository.GetByUserIdAsync(user.Id);
            if (auth != null)
            {
                auth.IsActive = false;
                auth.UpdatedAt = DateTime.UtcNow;
                _authRepository.Update(auth);
            }

            await _unitOfWork.SaveChangesAsync();
        }

        public async Task HardDeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new UserFriendlyException(404, "USER_NOT_FOUND", "User not found");
            }

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                // 1. Customer profile + phones
                var customerProfile = await _customerProfileRepository.GetByUserIdAsync(user.Id);
                if (customerProfile != null)
                {
                    var phones = await _phoneRepository.Query()
                        .Where(p => p.CustomerId == customerProfile.Id)
                        .ToListAsync();
                    foreach (var phone in phones)
                    {
                        _phoneRepository.Remove(phone);
                    }

                    _customerProfileRepository.Remove(customerProfile);
                }

                // 2. Owner profile + posts + subscriptions + payments (via cascade)
                var ownerProfile = await _ownerProfileRepository.GetByUserIdAsync(user.Id);
                if (ownerProfile != null)
                {
                    var posts = await _postRepository.Query()
                        .Where(p => p.OwnerId == ownerProfile.Id)
                        .ToListAsync();
                    foreach (var post in posts)
                    {
                        _postRepository.Remove(post);
                    }

                    var subscriptions = await _ownerSubscriptionRepository.Query()
                        .Where(s => s.OwnerId == ownerProfile.Id)
                        .ToListAsync();
                    foreach (var subscription in subscriptions)
                    {
                        _ownerSubscriptionRepository.Remove(subscription);
                    }

                    _ownerProfileRepository.Remove(ownerProfile);
                }

                // 3. Staff profile
                var staffProfile = await _staffProfileRepository.GetByUserIdAsync(user.Id);
                if (staffProfile != null)
                {
                    _staffProfileRepository.Remove(staffProfile);
                }

                // 4. Notifications for this user
                var notifications = await _notificationRepository.GetByUserIdAsync(user.Id);
                foreach (var notification in notifications)
                {
                    _notificationRepository.Remove(notification);
                }

                // 5. Authentication record
                var auth = await _authRepository.GetByUserIdAsync(user.Id);
                if (auth != null)
                {
                    _authRepository.Remove(auth);
                }

                // 6. Finally remove the user
                _userRepository.Remove(user);

                await _unitOfWork.CommitAsync();
            }
            catch
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }

        public async Task<StaffResponseDto> PromoteToStaffAsync(PromoteToStaffRequestDto request)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new UserFriendlyException(404, "USER_NOT_FOUND", "User not found");

            var existingProfile = await _staffProfileRepository.GetByUserIdAsync(user.Id);

            // Đã là STAFF và đã có profile → báo đã staff, không làm gì thêm.
            if (user.RoleId == UserRoles.STAFF && existingProfile != null)
                throw new UserFriendlyException(400, "USER_ALREADY_STAFF", "User is already a staff member");

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                // 1. Đảm bảo User có role STAFF (có thể đã set bằng Update User nhưng chưa có profile)
                if (user.RoleId != UserRoles.STAFF)
                {
                    user.RoleId = UserRoles.STAFF;
                    user.UpdatedAt = DateTime.UtcNow;
                    _userRepository.Update(user);
                }

                // 2. Tạo hoặc cập nhật Staff Profile (nếu thiếu profile thì tạo mới)
                MStaffProfile staffProfile;
                if (existingProfile == null)
                {
                    staffProfile = new MStaffProfile
                    {
                        UserId = user.Id,
                        Name = request.Name ?? "Staff",
                        Phone = request.Phone ?? "",
                        StaffCode = request.StaffCode ?? "",
                        Status = 1,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _staffProfileRepository.AddAsync(staffProfile);
                }
                else
                {
                    staffProfile = existingProfile;
                    staffProfile.Name = request.Name ?? staffProfile.Name;
                    staffProfile.Phone = request.Phone ?? staffProfile.Phone;
                    staffProfile.StaffCode = request.StaffCode ?? staffProfile.StaffCode;
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
                    Name = staffProfile.Name ?? "Staff",
                    Role = "STAFF",
                    CreatedAt = user.CreatedAt
                };
            }
            catch (UserFriendlyException)
            {
                throw;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackAsync();
                throw;
            }
        }
    }
}
