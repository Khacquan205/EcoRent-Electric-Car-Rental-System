using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories;

public interface IAdPackageRepository : IRepository<MAdPackage>
{
    Task<MAdPackage?> GetByIdAsync(int id);
    Task<List<MAdPackage>> GetActivePackagesAsync();
}
