using CAR.Domain.Entities;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IOwnerSubscriptionRepository : IRepository<MOwnerSubscription>
    {
        Task<MOwnerSubscription?> GetValidActiveSubscriptionAsync(long ownerId, DateTime currentTime);
        Task<MOwnerSubscription?> GetActiveSubscriptionByOwnerIdAsync(long ownerId);
    }
}
