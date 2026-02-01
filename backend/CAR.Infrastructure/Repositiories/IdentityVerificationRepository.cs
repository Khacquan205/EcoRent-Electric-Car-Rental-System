using CAR.Application.Dtos;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Repositories
{
    public class IdentityVerificationRepository : Repository<MIdentityVerification>, IIdentityVerificationRepository
    {
        private readonly AppDbContext _context;

        public IdentityVerificationRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<MIdentityVerification?> GetByOwnerIdAsync(long ownerId)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.OwnerId == ownerId);
        }

        public async Task<MIdentityVerification> CreateForOwnerAsync(long ownerId)
        {
            var verification = new MIdentityVerification
            {
                OwnerId = ownerId,
                Status = "PENDING",
                Score = 0,
                CreatedAt = System.DateTime.UtcNow
            };

            await _dbSet.AddAsync(verification);
            return verification;
        }

        public async Task<OwnerProfileResponseDto> GetOwnerProfileWithVerificationAsync(int userId)
        {
            var ownerProfile = await _context.Set<MOwnerProfile>()
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (ownerProfile == null)
            {
                return null;
            }

            var verification = await _dbSet
                .FirstOrDefaultAsync(x => x.OwnerId == ownerProfile.Id);

            return new OwnerProfileResponseDto
            {
                Id = ownerProfile.Id,
                UserId = ownerProfile.UserId,
                Name = ownerProfile.Name,
                Phone = ownerProfile.Phone,
                IdentityVerified = ownerProfile.IdentityVerified,
                VerificationStatus = verification?.Status ?? "PENDING",
                VerificationScore = verification?.Score ?? 0,
                VerifiedAt = verification?.VerifiedAt,
                RejectReason = verification?.RejectReason,
                RatingAvg = ownerProfile.RatingAvg,
                TotalPosts = ownerProfile.TotalPosts,
                CanCreatePosts = ownerProfile.IdentityVerified
            };
        }
    }
}
