namespace CAR.Application.Dtos.Auth
{
    public class UserInfoDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public int RoleId { get; set; }
        public bool IsActive { get; set; }
    }
}
