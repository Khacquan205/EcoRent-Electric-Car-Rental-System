namespace CAR.Domain.Entities
{
    public class MOwnerPackage
    {
        public int Id { get; set; }

        public string? Name { get; set; }
        public string? Description { get; set; }

        public double Price { get; set; }
        public int DurationDays { get; set; }
        public int MaxPosts { get; set; }

        public int PriorityLevel { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
