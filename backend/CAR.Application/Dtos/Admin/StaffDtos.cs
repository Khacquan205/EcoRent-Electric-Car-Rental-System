using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.Admin
{
    public class StaffResponseDto
    {
        public int UserId { get; set; }
        public int StaffProfileId { get; set; }
        public string Email { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Role { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class UserListItemDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PromoteToStaffRequestDto
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public string Name { get; set; } = null!;
        
        public string? Phone { get; set; }
        
        public string? StaffCode { get; set; }
    }
}
