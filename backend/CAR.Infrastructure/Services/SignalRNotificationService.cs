using CAR.Application.Dtos.Notifications;
using CAR.Application.Exceptions;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Domain.Entities;
using CAR.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CAR.Infrastructure.Services
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;

        public SignalRNotificationService(
            IHubContext<NotificationHub> hubContext,
            INotificationRepository notificationRepository,
            IUnitOfWork unitOfWork)
        {
            _hubContext = hubContext;
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task SendToUserAsync(int userId, string title, string message, int? postId = null)
        {
            var notification = new MNotification
            {
                UserId = userId,
                PostId = postId,
                Title = title,
                Message = message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            var dto = new NotificationDto
            {
                Id = notification.Id,
                Title = title,
                Message = message,
                IsRead = false,
                PostId = postId,
                CreatedAt = notification.CreatedAt
            };

            await _hubContext.Clients
                .Group(userId.ToString())
                .SendAsync("ReceiveNotification", dto);
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);

            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead,
                PostId = n.PostId,
                CreatedAt = n.CreatedAt
            }).ToList();
        }

        public async Task MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);

            if (notification == null || notification.UserId != userId)
                throw new UserFriendlyException(404, "NOTIFICATION_NOT_FOUND", "Notification not found");

            notification.IsRead = true;
            _notificationRepository.Update(notification);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
