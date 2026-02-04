using CAR.Application.Dtos.Auth;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using CAR.Domain.Constants;

namespace CAR.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthenticationRepository _authRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICustomerProfileRepository _customerProfileRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IJwtService _jwtService;
        private readonly IFirebaseService _firebaseService;

        public AuthService(
            IAuthenticationRepository authRepository,
            IUserRepository userRepository,
            ICustomerProfileRepository customerProfileRepository,
            IUnitOfWork unitOfWork,
            IEmailService emailService,
            IJwtService jwtService,
            IFirebaseService firebaseService)
        {
            _authRepository = authRepository;
            _userRepository = userRepository;
            _customerProfileRepository = customerProfileRepository;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _jwtService = jwtService;
            _firebaseService = firebaseService;
        }

        public async Task<AuthResponseDto> Register(RegisterRequestDto request)
        {
            // Validate password match
            if (request.Password != request.ConfirmPassword)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Password and Confirm Password do not match"
                };
            }

            // Check if email already exists
            var existingUser = await _userRepository.GetByEmailAsync(request.Email!);
            if (existingUser != null)
            {
                // Check if user has active account (already verified)
                var existingAuth = await _authRepository.GetByUserIdAsync(existingUser.Id);
                if (existingAuth != null && existingAuth.IsActive)
                {
                    // Account already verified - cannot re-register
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Email already registered and verified. Please login instead."
                    };
                }
                else if (existingAuth != null && existingAuth.CodeExpiresAt > DateTime.UtcNow && !existingAuth.IsActive)
                {
                    // OTP still valid but not verified - user should verify or resend OTP
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Email already registered. Please check your email for OTP verification or use resend OTP."
                    };
                }
                else
                {
                    // OTP expired or no auth record - clean up old records and allow re-registration
                    _userRepository.Remove(existingUser);
                    if (existingAuth != null)
                    {
                        _authRepository.Remove(existingAuth);
                    }
                    await _unitOfWork.SaveChangesAsync();
                }
            }

            var passwordHash = HashPassword(request.Password!);
            var otpCode = GenerateOtp();

            // Create MUser with CUSTOMER role but inactive status
            var user = new MUser
            {
                RoleId = UserRoles.CUSTOMER,
                Email = request.Email!,
                PasswordHash = passwordHash,
                Phone = request.Phone,
                Status = 0, // Inactive until OTP verification
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateUserAsync(user);
            await _unitOfWork.SaveChangesAsync();

            var authentication = new MAuthentication
            {
                UserId = user.Id,
                Email = request.Email,
                Name = request.Name,
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

            try
            {
                // Start transaction
                await _unitOfWork.BeginTransactionAsync();

                // Activate user
                user.Status = 1; // Active
                user.UpdatedAt = DateTime.UtcNow;
                _userRepository.Update(user);

                // Create MCustomerProfile
                var customerProfile = new MCustomerProfile
                {
                    UserId = user.Id,
                    Name = auth.Name ?? string.Empty,
                    Phone = user.Phone,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _customerProfileRepository.CreateCustomerProfileAsync(customerProfile);
                await _unitOfWork.SaveChangesAsync();

                // Update authentication - mark as active and OTP used
                await _authRepository.UpdateOtpStatusAsync(auth.Id, true, false);

                // Commit transaction
                await _unitOfWork.CommitAsync();

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
            catch (Exception ex)
            {
                // Rollback transaction on error
                await _unitOfWork.RollbackAsync();
                
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Verification failed: " + ex.Message
                };
            }
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

            // For legacy data: Create CustomerProfile if missing for CUSTOMER users
            // Only create fallback for users without authentication records (legacy data)
            if (user.RoleId == UserRoles.CUSTOMER)
            {
                var existingCustomerProfile = await _customerProfileRepository.GetByUserIdAsync(user.Id);
                if (existingCustomerProfile == null)
                {
                    // Check if this is legacy data (user without authentication record)
                    var userAuth = await _authRepository.GetByUserIdAsync(user.Id);
                    if (userAuth == null)
                    {
                        try
                        {
                            // Create fallback CustomerProfile with email prefix as name
                            var fallbackCustomerProfile = new MCustomerProfile
                            {
                                UserId = user.Id,
                                Name = user.Email.Split('@')[0] ?? string.Empty, // Use email prefix as temporary name
                                Phone = null,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };

                            await _customerProfileRepository.CreateCustomerProfileAsync(fallbackCustomerProfile);
                            await _unitOfWork.SaveChangesAsync();
                        }
                        catch (Exception ex)
                        {
                            // Log error but don't fail login - this is just a safety fallback
                            // Consider adding proper logging here
                            Console.WriteLine($"Warning: Failed to create fallback CustomerProfile for user {user.Id}: {ex.Message}");
                        }
                    }
                }
            }

            var auth = await _authRepository.GetByUserIdAsync(user.Id);
            if (auth == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Account not found. Please register."
                };
            }

            // Check if account is not verified and OTP has expired
            if (!auth.IsActive)
            {
                if (auth.CodeExpiresAt <= DateTime.UtcNow)
                {
                    // OTP expired - clean up and suggest re-registration
                    _userRepository.Remove(user);
                    _authRepository.Remove(auth);
                    await _unitOfWork.SaveChangesAsync();
                    
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "OTP expired. Please register again to receive a new OTP."
                    };
                }
                else
                {
                    // OTP still valid
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Account not verified. Please check your email for OTP or use resend OTP."
                    };
                }
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

        public async Task<AuthResponseDto> LoginWithGoogleAsync(GoogleLoginRequestDto request)
        {
            try
            {
                // Verify Google ID token
                var userInfo = await _firebaseService.VerifyGoogleIdTokenAsync(request.IdToken);
                
                if (userInfo == null || string.IsNullOrEmpty(userInfo.Email))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid Google ID token"
                    };
                }

                // Check if user already exists
                var existingUser = await _userRepository.GetByEmailAsync(userInfo.Email);
                
                if (existingUser == null)
                {
                    // Create new user
                    var newUser = new MUser
                    {
                        Email = userInfo.Email,
                        PasswordHash = string.Empty, // No password for Google login
                        RoleId = 2, // Default user role
                        Status = 1, // Active (no email verification needed for Google)
                        CreatedAt = DateTime.UtcNow
                    };

                    await _userRepository.CreateUserAsync(newUser);
                    await _unitOfWork.SaveChangesAsync();

                    // Create authentication record
                    var newAuth = new MAuthentication
                    {
                        UserId = newUser.Id,
                        Email = userInfo.Email,
                        PasswordHash = string.Empty,
                        AuthType = 2, // Google
                        AuthProvider = 2, // Google
                        GoogleId = userInfo.GoogleId, // Firebase UID
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _authRepository.CreateAuthenticationAsync(newAuth);
                    await _unitOfWork.SaveChangesAsync();

                    existingUser = newUser;
                }
                else
                {
                    // User exists, check/update Google authentication
                    var existingAuth = await _authRepository.GetByUserIdAsync(existingUser.Id);
                    
                    if (existingAuth == null)
                    {
                        // Create authentication record for existing user
                        existingAuth = new MAuthentication
                        {
                            UserId = existingUser.Id,
                            Email = userInfo.Email,
                            AuthType = 2, // Google
                            AuthProvider = 2, // Google
                            GoogleId = userInfo.GoogleId,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        await _authRepository.CreateAuthenticationAsync(existingAuth);
                        await _unitOfWork.SaveChangesAsync();
                    }
                    else if (existingAuth.GoogleId != userInfo.GoogleId)
                    {
                        // Update Google ID if different
                        existingAuth.GoogleId = userInfo.GoogleId;
                        existingAuth.AuthType = 2; // Google
                        existingAuth.AuthProvider = 2; // Google
                        existingAuth.IsActive = true;
                        existingAuth.UpdatedAt = DateTime.UtcNow;
                        _authRepository.Update(existingAuth);
                        await _unitOfWork.SaveChangesAsync();
                    }
                }

                // Generate system JWT
                var accessToken = _jwtService.GenerateAccessToken(existingUser);
                var expiresIn = 3600; // 1 hour in seconds

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Google login successful",
                    AccessToken = accessToken,
                    ExpiresIn = expiresIn,
                    User = new UserInfoDto
                    {
                        Id = existingUser.Id,
                        Email = existingUser.Email,
                        RoleId = existingUser.RoleId,
                        IsActive = existingUser.Status == 1
                    }
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Google login failed: " + ex.Message
                };
            }
        }
    }
}
