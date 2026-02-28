using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.Auth
{
    /// <summary>
    /// Customer registration: Account + CustomerProfile (DisplayName, Address required for nearby car suggestion).
    /// </summary>
    public class RegisterRequestDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
        [MaxLength(100, ErrorMessage = "Password cannot exceed 100 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "Confirm Password is required")]
        [Compare("Password", ErrorMessage = "Password and Confirm Password must match")]
        public string ConfirmPassword { get; set; } = null!;

        [Required(ErrorMessage = "Display name is required")]
        [MaxLength(255, ErrorMessage = "Display name cannot exceed 255 characters")]
        public string DisplayName { get; set; } = null!;

        [Required(ErrorMessage = "Address is required for customer (used for nearby car recommendation)")]
        [MaxLength(500, ErrorMessage = "Address cannot exceed 500 characters")]
        public string Address { get; set; } = null!;
    }
}
