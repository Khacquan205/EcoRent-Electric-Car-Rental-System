namespace CAR.Domain.Entities
{
    public class MAdvertisement
    {
        public int Id { get; set; }

        public int PostId { get; set; }

        public MPost Post { get; set; } = null!;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int Status { get; set; }
        public decimal Price { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
