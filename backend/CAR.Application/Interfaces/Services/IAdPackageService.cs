using CAR.Application.Dtos.AdPackage;

namespace CAR.Application.Interfaces.Services;

public interface IAdPackageService
{
    Task<AdPackageResponseDto> CreateAsync(AdPackageCreateRequestDto request);
    Task<AdPackageResponseDto> UpdateAsync(int id, AdPackageUpdateRequestDto request);
    Task<AdPackageResponseDto> GetByIdAsync(int id);
    Task<List<AdPackageResponseDto>> GetActivePackagesAsync();
    Task DeactivateAsync(int id);
}
