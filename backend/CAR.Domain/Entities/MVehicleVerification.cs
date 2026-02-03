namespace CAR.Domain.Entities
{
    public class MVehicleVerification
    {
        public int Id { get; set; }

        public int PostId { get; set; }

        public string? RegistrationImage { get; set; }
        public string? InspectionImage { get; set; }
        public string? InsuranceImage { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
