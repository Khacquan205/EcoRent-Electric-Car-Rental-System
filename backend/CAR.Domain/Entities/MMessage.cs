namespace CAR.Domain.Entities
{
    /// <summary>
    /// A single chat message within a conversation.
    /// </summary>
    public partial class MMessage
    {
        public int Id { get; set; }

        public int ConversationId { get; set; }

        public int SenderId { get; set; }

        public string Content { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation
        public MConversation Conversation { get; set; } = null!;
        public MUser Sender { get; set; } = null!;
    }
}
