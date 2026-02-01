namespace CAR.Application.Dtos
{
    public class RegisterOwnerResponseDto
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string? Name { get; set; }

        public string? Phone { get; set; }

        public bool IdentityVerified { get; set; }

        public double RatingAvg { get; set; }

        public int TotalPosts { get; set; }
    }
}
