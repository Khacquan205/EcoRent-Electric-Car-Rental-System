namespace CAR.Domain.Entities
{
    /// <summary>
    /// 1-1 chat conversation between two users, optionally scoped to a post.
    /// User1Id is always &lt; User2Id to prevent duplicate pairs.
    /// </summary>
    public partial class MConversation
    {
        public int Id { get; set; }

        public int User1Id { get; set; }

        public int User2Id { get; set; }

        /// <summary>Optional post context (when chat starts from a listing page).</summary>
        public int? PostId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public MUser User1 { get; set; } = null!;
        public MUser User2 { get; set; } = null!;
        public MPost? Post { get; set; }
        public ICollection<MMessage> Messages { get; set; } = new List<MMessage>();
    }
}
