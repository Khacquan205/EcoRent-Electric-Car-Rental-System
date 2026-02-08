namespace CAR.Domain.Entities
{
    public class MSearchHistory
    {
        public int Id { get; set; }

        public int? UserId { get; set; }

        public string? Keyword { get; set; }
        public int? CategoryId { get; set; }
        public int? LocationId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public MUser? User { get; set; }
        public MVehicleCategory? Category { get; set; }
        public MLocation? Location { get; set; }
    }
}
