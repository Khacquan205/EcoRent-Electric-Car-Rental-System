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

    public class UserDetailDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = null!;
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public short Status { get; set; }
        public string LoginProvider { get; set; } = "Local";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public AdminCustomerProfileDto? CustomerProfile { get; set; }
        public AdminOwnerProfileDto? OwnerProfile { get; set; }
        public AdminStaffProfileDto? StaffProfile { get; set; }
    }

    public class CreateUserRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;

        /// <summary>
        /// RoleId for the new user (e.g. CUSTOMER, OWNER, STAFF).
        /// </summary>
        [Required]
        public int RoleId { get; set; }

        /// <summary>
        /// User status flag. 1 = active, 0 = inactive.
        /// </summary>
        public short Status { get; set; } = 1;

        /// <summary>
        /// Optional display name for creating a basic customer profile.
        /// </summary>
        public string? DisplayName { get; set; }

        /// <summary>
        /// Optional address for creating a basic customer profile.
        /// </summary>
        public string? Address { get; set; }
    }

    public class UpdateUserRequestDto
    {
        /// <summary>
        /// New role for the user. Only role and status are mutable from this endpoint.
        /// </summary>
        [Required]
        public int RoleId { get; set; }

        /// <summary>
        /// Updated user status. 1 = active, 0 = inactive (soft delete / lock).
        /// </summary>
        [Required]
        public short Status { get; set; }
    }

    public class AdminCustomerProfileDto
    {
        public int Id { get; set; }
        public string? DisplayName { get; set; }
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class AdminOwnerProfileDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? FullName { get; set; }
        public string? IdNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int Gender { get; set; }
        public string? Phone { get; set; }
        public bool IdentityVerified { get; set; }
        public decimal RatingAvg { get; set; }
        public int TotalPosts { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class AdminStaffProfileDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? StaffCode { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
