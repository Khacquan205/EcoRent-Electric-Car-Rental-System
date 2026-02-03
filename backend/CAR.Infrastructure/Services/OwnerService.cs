using CAR.Application.Dtos;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class OwnerService : IOwnerService
    {
        private readonly IOwnerProfileRepository _ownerProfileRepository;
        private readonly IUnitOfWork _unitOfWork;

        public OwnerService(
            IOwnerProfileRepository ownerProfileRepository,
            IUnitOfWork unitOfWork)
        {
            _ownerProfileRepository = ownerProfileRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<RegisterOwnerResponseDto> RegisterOwnerAsync(int userId, RegisterOwnerRequestDto request)
        {
            var existingOwner = await _ownerProfileRepository.ExistsByUserIdAsync(userId);
            if (existingOwner)
            {
                throw new UserFriendlyException(
                    409,
                    "OWNER_ALREADY_EXISTS",
                    "User already has an owner profile"
                );
            }

            var ownerProfile = new MOwnerProfile
            {
                UserId = userId,
                Name = request.Name,
                Phone = request.Phone,
                IdentityVerified = false,
                RatingAvg = 0.0,
                TotalPosts = 0,
                CreatedAt = DateTime.UtcNow
            };

            await _ownerProfileRepository.AddAsync(ownerProfile);
            await _unitOfWork.SaveChangesAsync();

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
    }
}
