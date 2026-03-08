using CAR.Application.Dtos.AdPackage;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Services
{
    public class AdPackageService : IAdPackageService
    {
        private readonly IAdPackageRepository _adPackageRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AdPackageService(IAdPackageRepository adPackageRepository, IUnitOfWork unitOfWork)
        {
            _adPackageRepository = adPackageRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<AdPackageResponseDto> CreateAsync(AdPackageCreateRequestDto request)
        {
            var pkg = new MAdPackage
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                DurationDays = request.DurationDays,
                MaxPosts = request.MaxPosts,
                PriorityLevel = request.PriorityLevel,
                Status = 1,
                CreatedAt = DateTime.UtcNow
            };
            await _adPackageRepository.AddAsync(pkg);
            await _unitOfWork.SaveChangesAsync();
            return ToDto(pkg);
        }

        public async Task<AdPackageResponseDto> UpdateAsync(int id, AdPackageUpdateRequestDto request)
        {
            var pkg = await _adPackageRepository.GetByIdAsync(id);
            if (pkg == null)
                throw new UserFriendlyException(404, "AD_PACKAGE_NOT_FOUND", "Ad package not found");

            pkg.Name = request.Name;
            pkg.Description = request.Description;
            pkg.Price = request.Price;
            pkg.DurationDays = request.DurationDays;
            pkg.MaxPosts = request.MaxPosts;
            pkg.PriorityLevel = request.PriorityLevel;
            pkg.Status = request.Status;
            pkg.UpdatedAt = DateTime.UtcNow;
            _adPackageRepository.Update(pkg);
            await _unitOfWork.SaveChangesAsync();
            return ToDto(pkg);
        }

        public async Task<AdPackageResponseDto> GetByIdAsync(int id)
        {
            var pkg = await _adPackageRepository.GetByIdAsync(id);
            if (pkg == null)
                throw new UserFriendlyException(404, "AD_PACKAGE_NOT_FOUND", "Ad package not found");
            return ToDto(pkg);
        }

        public async Task<List<AdPackageResponseDto>> GetActivePackagesAsync()
        {
            var list = await _adPackageRepository.GetActivePackagesAsync();
            return list.Select(ToDto).ToList();
        }

        public async Task DeactivateAsync(int id)
        {
            var pkg = await _adPackageRepository.GetByIdAsync(id);
            if (pkg == null)
                throw new UserFriendlyException(404, "AD_PACKAGE_NOT_FOUND", "Ad package not found");
            pkg.Status = 0;
            pkg.UpdatedAt = DateTime.UtcNow;
            _adPackageRepository.Update(pkg);
            await _unitOfWork.SaveChangesAsync();
        }

        private static AdPackageResponseDto ToDto(MAdPackage p)
        {
            return new AdPackageResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                DurationDays = p.DurationDays,
                MaxPosts = p.MaxPosts,
                PriorityLevel = p.PriorityLevel,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            };
        }
    }
}
