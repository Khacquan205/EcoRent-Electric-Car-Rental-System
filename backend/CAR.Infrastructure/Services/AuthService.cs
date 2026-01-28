using CAR.Application.Dtos.Auth;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;

namespace CAR.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthenticationRepository _authRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IJwtService _jwtService;

        public AuthService(
            IAuthenticationRepository authRepository,
            IUserRepository userRepository,
            IUnitOfWork unitOfWork,
            IEmailService emailService,
            IJwtService jwtService)
        {
            _authRepository = authRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _jwtService = jwtService;
        }

        public async Task<AuthResponseDto> Register(RegisterRequestDto request)
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email already registered"
                };
            }

            var passwordHash = HashPassword(request.Password);
            var otpCode = GenerateOtp();

            var user = new MUser
            {
                RoleId = 2, // Default user role
                Email = request.Email,
                PasswordHash = passwordHash,
                Gender = 0,
                Status = 0, // Inactive until OTP verification
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateUserAsync(user);
            await _unitOfWork.SaveChangesAsync();

            var authentication = new MAuthentication
            {
                UserId = user.Id,
                Email = request.Email,
                PasswordHash = passwordHash,
                Code = otpCode,
                CodeExpiresAt = DateTime.UtcNow.AddMinutes(5),
                CodeIsUsed = false,
                CodeIsRevoked = false,
                AuthType = 1, // Email/Password
                AuthProvider = 1, // Local
                IsActive = false, // Inactive until verification
                CreatedAt = DateTime.UtcNow
            };

            await _authRepository.CreateAuthenticationAsync(authentication);

            // Send OTP email
            var emailSent = await _emailService.SendOtpEmailAsync(request.Email, otpCode);
            
            if (!emailSent)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Registration successful but failed to send OTP email. Please try again."
                };
            }

            await _unitOfWork.SaveChangesAsync();

            return new AuthResponseDto
            {
                Success = true,
                Message = "Registration successful. Please check your email for OTP verification."
            };
        }

        public async Task<AuthResponseDto> VerifyRegistration(OtpVerificationRequestDto request)
        {
            var auth = await _authRepository.GetByValidOtpAsync(request.Email, request.Code);
            if (auth == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid or expired OTP"
                };
            }

            // Get user by email
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            // Activate user
            user.Status = 1; // Active
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);

            // Update authentication - mark as active and OTP used
            await _authRepository.UpdateOtpStatusAsync(auth.Id, true, false);

            await _unitOfWork.SaveChangesAsync();

            var accessToken = _jwtService.GenerateAccessToken(user);
            var expiresIn = 3600; // 1 hour in seconds

            return new AuthResponseDto
            {
                Success = true,
                Message = "Account verified successfully",
                AccessToken = accessToken,
                ExpiresIn = expiresIn,
                User = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    RoleId = user.RoleId,
                    IsActive = user.Status == 1
                }
            };
        }

        public async Task<AuthResponseDto> Login(LoginRequestDto request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            var auth = await _authRepository.GetByUserIdAsync(user.Id);
            if (auth == null || !auth.IsActive)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Account not verified. Please check your email for OTP."
                };
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            var accessToken = _jwtService.GenerateAccessToken(user);
            var expiresIn = 3600; // 1 hour in seconds

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                AccessToken = accessToken,
                ExpiresIn = expiresIn,
                User = new UserInfoDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    RoleId = user.RoleId,
                    IsActive = auth.IsActive
                }
            };
        }

        public async Task<AuthResponseDto> SendOtp(SendOtpRequestDto request)
        {
            var auth = await _authRepository.GetByEmailAsync(request.Email);
            if (auth == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email not found. Please register first."
                };
            }

            var otpCode = GenerateOtp();
            auth.Code = otpCode;
            auth.CodeExpiresAt = DateTime.UtcNow.AddMinutes(5);
            auth.CodeIsUsed = false;
            auth.CodeIsRevoked = false;
            auth.UpdatedAt = DateTime.UtcNow;
            _authRepository.Update(auth);

            await _unitOfWork.SaveChangesAsync();

            var emailSent = await _emailService.SendOtpEmailAsync(request.Email, otpCode);
            
            if (!emailSent)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Failed to send OTP email. Please try again."
                };
            }

            return new AuthResponseDto
            {
                Success = true,
                Message = "OTP sent successfully. Please check your email."
            };
        }

        public async Task<AuthResponseDto> ChangePassword(int userId, ChangePasswordRequestDto request)
        {
            // Load user by userId
            var user = _userRepository.Query().FirstOrDefault(u => u.Id == userId);
            if (user == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            // Verify current password
            if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Current password is incorrect"
                };
            }

            // Check if new password is same as current
            if (VerifyPassword(request.NewPassword, user.PasswordHash))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "New password must be different from current password"
                };
            }

            // Hash new password
            var newPasswordHash = HashPassword(request.NewPassword);

            // Update password in database
            user.PasswordHash = newPasswordHash;
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);

            // Also update authentication record if exists
            var auth = await _authRepository.GetByUserIdAsync(userId);
            if (auth != null)
            {
                auth.PasswordHash = newPasswordHash;
                auth.UpdatedAt = DateTime.UtcNow;
                _authRepository.Update(auth);
            }

            await _unitOfWork.SaveChangesAsync();

            return new AuthResponseDto
            {
                Success = true,
                Message = "Password changed successfully"
            };
        }

        private string GenerateOtp()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hash)
        {
            try
            {
                // Try BCrypt verification first
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                // Fallback for old password format (if any)
                // Handle legacy password hashes if they exist
                return hash == "hashed_" + password;
            }
            catch
            {
                return false;
            }
        }
    }
}
