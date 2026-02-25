using CAR.Application.Dtos.Notifications;

namespace CAR.Application.Interfaces.Services
{
    public interface INotificationService
    {
        Task SendToUserAsync(int userId, string title, string message, int? postId = null);
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId);
        Task MarkAsReadAsync(int notificationId, int userId);
    }
}
