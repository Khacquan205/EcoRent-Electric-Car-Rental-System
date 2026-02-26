using CAR.Application.Dtos.OwnerKyc;

namespace CAR.Application.Interfaces.Services
{
    public interface IOwnerKycService
    {
        Task SubmitKycAsync(int userId, OwnerKycSubmitRequestDto request);
        Task<OwnerKycStatusDto> GetStatusAsync(int userId);

        // Admin
        Task<List<OwnerKycSummaryDto>> GetPendingKycAsync();
        Task ApproveKycAsync(int ownerProfileId, int adminId);
        Task RejectKycAsync(int ownerProfileId, int adminId, string reason);
    }
}
