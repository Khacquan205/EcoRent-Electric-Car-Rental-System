namespace CAR.Application.Dtos.Auth
{
    public class GoogleUserInfoDto
    {
        public string Email { get; set; } = null!;
        public string GoogleId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? AvatarUrl { get; set; }
    }
}
