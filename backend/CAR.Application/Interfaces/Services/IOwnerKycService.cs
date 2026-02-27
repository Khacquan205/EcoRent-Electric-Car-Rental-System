using CAR.Application.Dtos;
using CAR.Application.Dtos.OwnerKyc;

namespace CAR.Application.Interfaces.Services
{
    public interface IOwnerKycService
    {
        Task SubmitKycAsync(int userId, OwnerKycSubmitRequestDto request);
        Task<OwnerKycStatusDto> GetStatusAsync(int userId);
        Task<OwnerProfileResponseDto> GetOwnerProfileAsync(int userId);
    }
}
