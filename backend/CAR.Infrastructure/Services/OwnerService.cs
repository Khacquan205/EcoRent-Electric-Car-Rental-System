using CAR.Application.Dtos;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using CAR.Domain.Constants;
using System;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class OwnerService : IOwnerService
    {
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly ICustomerProfileRepository _customerProfileRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public OwnerService(
            IOwnerProfileRepository ownerProfileRepository,
            ICustomerProfileRepository customerProfileRepository,
            IUserRepository userRepository,
            IUnitOfWork unitOfWork)
        {
            _ownerProfileRepository = ownerProfileRepository;
            _customerProfileRepository = customerProfileRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<RegisterOwnerResponseDto> RegisterOwnerAsync(int userId, RegisterOwnerRequestDto request)
        {
            // Check if user already has an owner profile
            var existingOwner = await _ownerProfileRepository.ExistsByUserIdAsync(userId);
            if (existingOwner)
            {
                throw new UserFriendlyException(
                    409,
                    "OWNER_ALREADY_EXISTS",
                    "User already has an owner profile"
                );
            }

            // Enforce: User must have CustomerProfile
            var customerProfile = await _customerProfileRepository.GetByUserIdAsync(userId);
            if (customerProfile == null)
            {
                throw new UserFriendlyException(
                    400,
                    "CUSTOMER_PROFILE_REQUIRED",
                    "User must have a customer profile before becoming an owner"
                );
            }

            // Get user to update role
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new UserFriendlyException(
                    404,
                    "USER_NOT_FOUND",
                    "User not found"
                );
            }

            try
            {
                // Start transaction
                await _unitOfWork.BeginTransactionAsync();

                // Create OwnerProfile - copy name from CustomerProfile
                var ownerProfile = new MOwnerProfile
                {
                    UserId = userId,
                    Name = customerProfile.Name ?? string.Empty, // Copy name from CustomerProfile
                    Phone = request.Phone ?? customerProfile.Phone, // Use request phone or fallback to customer phone
                    IdentityVerified = false,
                    RatingAvg = 0.0,
                    TotalPosts = 0,
                    CreatedAt = DateTime.UtcNow
                };

                await _ownerProfileRepository.AddAsync(ownerProfile);
                await _unitOfWork.SaveChangesAsync();

                // Update user role to OWNER
                user.RoleId = UserRoles.OWNER;
                user.UpdatedAt = DateTime.UtcNow;
                _userRepository.Update(user);
                await _unitOfWork.SaveChangesAsync();

                // Commit transaction
                await _unitOfWork.CommitAsync();

                return new RegisterOwnerResponseDto
                {
                    Id = ownerProfile.Id,
                    UserId = ownerProfile.UserId,
                    Name = ownerProfile.Name,
                    Phone = ownerProfile.Phone,
                    IdentityVerified = ownerProfile.IdentityVerified,
                    RatingAvg = ownerProfile.RatingAvg,
                    TotalPosts = ownerProfile.TotalPosts
                };
            }
            catch (Exception ex)
            {
                // Rollback transaction on error
                await _unitOfWork.RollbackAsync();
                throw new UserFriendlyException(
                    500,
                    "OWNER_REGISTRATION_FAILED",
                    $"Failed to register owner: {ex.Message}"
                );
            }
        }
    }
}
