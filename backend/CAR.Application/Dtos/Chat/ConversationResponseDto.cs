namespace CAR.Application.Dtos.Chat
{
    public class ConversationResponseDto
    {
        public int Id { get; set; }

        public int OtherUserId { get; set; }
        public string OtherUserName { get; set; } = string.Empty;

        public int? PostId { get; set; }
        public string? PostTitle { get; set; }
        public string? PostImage { get; set; }

        public string? LastMessage { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public int UnreadCount { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
