namespace CAR.Domain.Entities
{
    public class MReview
    {
        public int Id { get; set; }

        public int PostId { get; set; }
        public int ReviewerId { get; set; }
        public int OwnerId { get; set; }

        public int Rating { get; set; }
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
