namespace CAR.Domain.Entities
{
    public class MStaffProfile
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? StaffCode { get; set; }

        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
