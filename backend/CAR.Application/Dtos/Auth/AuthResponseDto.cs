namespace CAR.Application.Dtos.Auth
{
    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public string? AccessToken { get; set; }
        public int? ExpiresIn { get; set; }
        public UserInfoDto? User { get; set; }
    }
}
