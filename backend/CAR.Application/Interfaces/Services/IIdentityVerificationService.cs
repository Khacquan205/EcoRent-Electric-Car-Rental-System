using CAR.Application.Dtos;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IIdentityVerificationService
    {
        Task<VerifyIdentityResponseDto> VerifyIdentityAsync(int userId, VerifyIdentityRequestDto request);
        Task<OwnerProfileResponseDto> GetOwnerProfileAsync(int userId);
    }
}
