using CAR.Domain.Entities;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IOwnerProfileRepository : IRepository<MOwnerProfile>
    {
        Task<MOwnerProfile?> GetByUserIdAsync(int userId);
        Task<bool> ExistsByUserIdAsync(int userId);
        Task<MOwnerProfile?> GetVerifiedOwnerByUserIdAsync(int userId);
    }
}
