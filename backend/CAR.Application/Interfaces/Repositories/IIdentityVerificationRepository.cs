using CAR.Application.Dtos;
using CAR.Domain.Entities;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IIdentityVerificationRepository : IRepository<MIdentityVerification>
    {
        Task<MIdentityVerification?> GetByOwnerIdAsync(int ownerId);
        Task<MIdentityVerification> CreateForOwnerAsync(int ownerId);
        Task<OwnerProfileResponseDto> GetOwnerProfileWithVerificationAsync(int userId);
    }
}
