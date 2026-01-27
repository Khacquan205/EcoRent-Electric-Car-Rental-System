namespace CAR.Domain.Entities
{
    public class MReport
    {
        public int Id { get; set; }

        public int PostId { get; set; }
        public int ReporterUserId { get; set; }

        public int Reason { get; set; }
        public string? Description { get; set; }

        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
