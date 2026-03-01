using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories
{
    public interface INotificationRepository : IRepository<MNotification>
    {
        Task<List<MNotification>> GetByUserIdAsync(int userId);
        Task<MNotification?> GetByIdAsync(int id);
    }
}
