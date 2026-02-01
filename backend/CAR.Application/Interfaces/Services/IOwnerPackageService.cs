using CAR.Application.Dtos;
using CAR.Domain.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IOwnerPackageService
    {
        Task<CreatePackageResponseDto> CreatePackageAsync(CreatePackageRequestDto request);
        Task<PackageResponseDto> UpdatePackageAsync(int id, UpdatePackageRequestDto request);
        Task<PackageResponseDto> DeletePackageAsync(int id);
        Task<PackageResponseDto> GetPackageByIdAsync(int id);
        Task<List<PackageResponseDto>> GetActivePackagesAsync();
    }
}
