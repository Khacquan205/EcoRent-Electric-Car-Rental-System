using CAR.Application.Dtos;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class IdentityVerificationService : IIdentityVerificationService
    {
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly IUnitOfWork _unitOfWork;

        public IdentityVerificationService(
            IOwnerProfileRepository ownerProfileRepository,
            IUnitOfWork unitOfWork)
        {
            _ownerProfileRepository = ownerProfileRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<VerifyIdentityResponseDto> VerifyIdentityAsync(int userId, VerifyIdentityRequestDto request)
        {
            var ownerProfile = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (ownerProfile == null)
            {
                throw new UserFriendlyException(
                    403,
                    "OWNER_NOT_FOUND",
                    "User is not registered as an owner"
                );
            }

            if (ownerProfile.IdentityVerified)
            {
                throw new UserFriendlyException(
                    409,
                    "ALREADY_VERIFIED",
                    "Owner identity is already verified"
                );
            }

            ownerProfile.IdentityVerified = true;
            ownerProfile.UpdatedAt = DateTime.UtcNow;

            _ownerProfileRepository.Update(ownerProfile);
            await _unitOfWork.SaveChangesAsync();

            return new VerifyIdentityResponseDto
            {
                Id = ownerProfile.Id,
                UserId = ownerProfile.UserId,
                Name = ownerProfile.Name,
                Phone = ownerProfile.Phone,
                IdentityVerified = ownerProfile.IdentityVerified,
                VerifiedAt = ownerProfile.UpdatedAt,
                CanCreatePosts = ownerProfile.IdentityVerified
            };
        }

        public async Task<OwnerProfileResponseDto> GetOwnerProfileAsync(int userId)
        {
            var ownerProfile = await _ownerProfileRepository.GetByUserIdAsync(userId);
            if (ownerProfile == null)
            {
                throw new UserFriendlyException(
                    403,
                    "OWNER_NOT_FOUND",
                    "User is not registered as an owner"
                );
            }

            return new OwnerProfileResponseDto
            {
                Id = ownerProfile.Id,
                UserId = ownerProfile.UserId,
                Name = ownerProfile.Name,
                Phone = ownerProfile.Phone,
                IdentityVerified = ownerProfile.IdentityVerified,
                VerificationStatus = ownerProfile.IdentityVerified ? "VERIFIED" : "PENDING",
                VerificationScore = ownerProfile.IdentityVerified ? 1.0m : 0.0m,
                VerifiedAt = ownerProfile.IdentityVerified ? ownerProfile.UpdatedAt : null,
                RejectReason = null,
                RatingAvg = ownerProfile.RatingAvg,
                TotalPosts = ownerProfile.TotalPosts,
                CanCreatePosts = ownerProfile.IdentityVerified
            };
        }
    }
}
