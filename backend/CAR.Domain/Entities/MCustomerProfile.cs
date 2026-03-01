namespace CAR.Domain.Entities
{
    /// <summary>
    /// Customer profile: used for nearby car recommendation and location-based search.
    /// Account (MUser) holds only auth; DisplayName and Address are here.
    /// </summary>
    public partial class MCustomerProfile
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string? DisplayName { get; set; }

        public string? Address { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public MUser User { get; set; } = null!;
        public ICollection<MPhone> Phones { get; set; } = new List<MPhone>();
    }
}
