using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.Auth
{
    public class ChangePasswordRequestDto
    {
        [Required(ErrorMessage = "Current password is required")]
        [MaxLength(100, ErrorMessage = "Current password cannot exceed 100 characters")]
        public string CurrentPassword { get; set; } = null!;

        [Required(ErrorMessage = "New password is required")]
        [MinLength(8, ErrorMessage = "New password must be at least 8 characters")]
        [MaxLength(100, ErrorMessage = "New password cannot exceed 100 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$", 
            ErrorMessage = "New password must contain at least one uppercase letter, one lowercase letter, and one number")]
        public string NewPassword { get; set; } = null!;
    }
}
