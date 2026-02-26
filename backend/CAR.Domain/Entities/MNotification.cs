namespace CAR.Domain.Entities
{
    public class MNotification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? PostId { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }

        public MUser User { get; set; } = null!;
        public MPost? Post { get; set; }
    }
}
