using CAR.Domain.Entities;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IStaffProfileRepository : IRepository<MStaffProfile>
    {
        Task<MStaffProfile?> GetByUserIdAsync(int userId);
    }
}
