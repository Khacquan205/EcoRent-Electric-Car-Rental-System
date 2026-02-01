using CAR.Application.Dtos;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class OwnerPackageService : IOwnerPackageService
    {
        private readonly IOwnerPackageRepository _ownerPackageRepository;
        private readonly IUnitOfWork _unitOfWork;

        public OwnerPackageService(
            IOwnerPackageRepository ownerPackageRepository,
            IUnitOfWork unitOfWork)
        {
            _ownerPackageRepository = ownerPackageRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<CreatePackageResponseDto> CreatePackageAsync(CreatePackageRequestDto request)
        {
            await ValidatePackageRulesAsync(request.Name, request.Price, request.DurationDays, request.MaxPosts, request.PriorityLevel);

            var existingPackage = await _ownerPackageRepository.ExistsByNameAsync(request.Name);
            if (existingPackage)
            {
                throw new UserFriendlyException(
                    409,
                    "PACKAGE_NAME_EXISTS",
                    "Package name already exists for active packages"
                );
            }

            var package = new MOwnerPackage
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                DurationDays = request.DurationDays,
                MaxPosts = request.MaxPosts,
                PriorityLevel = request.PriorityLevel,
                Status = OwnerPackageStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            await _ownerPackageRepository.AddAsync(package);
            await _unitOfWork.SaveChangesAsync();

            return new CreatePackageResponseDto
            {
                Id = package.Id,
                Name = package.Name,
                Description = package.Description,
                Price = package.Price,
                DurationDays = package.DurationDays,
                MaxPosts = package.MaxPosts,
                PriorityLevel = package.PriorityLevel,
                Status = package.Status
            };
        }

        public async Task<PackageResponseDto> DeletePackageAsync(int id)
        {
            var package = await _ownerPackageRepository.GetByIdAsync(id);
            if (package == null)
            {
                throw new UserFriendlyException(
                    404,
                    "PACKAGE_NOT_FOUND",
                    "Package not found"
                );
            }

            package.Status = OwnerPackageStatus.Inactive;
            package.UpdatedAt = DateTime.UtcNow;

            _ownerPackageRepository.Update(package);
            await _unitOfWork.SaveChangesAsync();

            return new PackageResponseDto
            {
                Id = package.Id,
                Name = package.Name,
                Description = package.Description,
                Price = package.Price,
                DurationDays = package.DurationDays,
                MaxPosts = package.MaxPosts,
                PriorityLevel = package.PriorityLevel,
                Status = package.Status
            };
        }

        public async Task<PackageResponseDto> UpdatePackageAsync(int id, UpdatePackageRequestDto request)
        {
            await ValidatePackageRulesAsync(request.Name, request.Price, request.DurationDays, request.MaxPosts, request.PriorityLevel);
            ValidateStatusValue(request.Status);

            var package = await _ownerPackageRepository.GetByIdAsync(id);
            if (package == null)
            {
                throw new UserFriendlyException(
                    404,
                    "PACKAGE_NOT_FOUND",
                    "Package not found"
                );
            }

            if (request.Name != package.Name)
            {
                var existingPackage = await _ownerPackageRepository.ExistsByNameAsync(request.Name);
                if (existingPackage)
                {
                    throw new UserFriendlyException(
                        409,
                        "PACKAGE_NAME_EXISTS",
                        "Package name already exists for active packages"
                    );
                }
            }

            package.Name = request.Name;
            package.Description = request.Description;
            package.Price = request.Price;
            package.DurationDays = request.DurationDays;
            package.MaxPosts = request.MaxPosts;
            package.PriorityLevel = request.PriorityLevel;
            package.Status = request.Status;
            package.UpdatedAt = DateTime.UtcNow;

            _ownerPackageRepository.Update(package);
            await _unitOfWork.SaveChangesAsync();

            return new PackageResponseDto
            {
                Id = package.Id,
                Name = package.Name,
                Description = package.Description,
                Price = package.Price,
                DurationDays = package.DurationDays,
                MaxPosts = package.MaxPosts,
                PriorityLevel = package.PriorityLevel,
                Status = package.Status
            };
        }

        public async Task<PackageResponseDto> GetPackageByIdAsync(int id)
        {
            var package = await _ownerPackageRepository.GetByIdAsync(id);
            if (package == null)
            {
                throw new UserFriendlyException(
                    404,
                    "PACKAGE_NOT_FOUND",
                    "Package not found"
                );
            }

            return new PackageResponseDto
            {
                Id = package.Id,
                Name = package.Name,
                Description = package.Description,
                Price = package.Price,
                DurationDays = package.DurationDays,
                MaxPosts = package.MaxPosts,
                PriorityLevel = package.PriorityLevel,
                Status = package.Status
            };
        }

        public async Task<List<PackageResponseDto>> GetActivePackagesAsync()
        {
            var packages = await _ownerPackageRepository.GetActivePackagesAsync();

            return packages.Select(p => new PackageResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                DurationDays = p.DurationDays,
                MaxPosts = p.MaxPosts,
                PriorityLevel = p.PriorityLevel,
                Status = p.Status
            }).ToList();
        }

        private async Task ValidatePackageRulesAsync(string name, double price, int durationDays, int maxPosts, int priorityLevel)
        {
            if (price <= 0)
            {
                throw new UserFriendlyException(
                    400,
                    "INVALID_PRICE",
                    "Price must be greater than 0"
                );
            }

            if (durationDays <= 0)
            {
                throw new UserFriendlyException(
                    400,
                    "INVALID_DURATION",
                    "Duration days must be greater than 0"
                );
            }

            if (maxPosts <= 0)
            {
                throw new UserFriendlyException(
                    400,
                    "INVALID_MAX_POSTS",
                    "Max posts must be greater than 0"
                );
            }

            if (priorityLevel < 0)
            {
                throw new UserFriendlyException(
                    400,
                    "INVALID_PRIORITY",
                    "Priority level must be 0 or greater"
                );
            }
        }

        private void ValidateStatusValue(OwnerPackageStatus status)
        {
            if (status != OwnerPackageStatus.Active && status != OwnerPackageStatus.Inactive)
            {
                throw new UserFriendlyException(
                    400,
                    "INVALID_STATUS",
                    "Status must be 0 (Inactive) or 1 (Active)"
                );
            }
        }
    }
}
