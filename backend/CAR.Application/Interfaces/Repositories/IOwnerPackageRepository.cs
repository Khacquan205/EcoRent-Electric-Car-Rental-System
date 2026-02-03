using CAR.Domain.Entities;
using CAR.Domain.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IOwnerPackageRepository : IRepository<MOwnerPackage>
    {
        Task<bool> ExistsByNameAsync(string name);
        Task<MOwnerPackage?> GetByIdAsync(int id);
        Task<List<MOwnerPackage>> GetActivePackagesAsync();
    }
}
