using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.Auth
{
    public class OtpVerificationRequestDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "OTP code is required")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP code must be exactly 6 digits")]
        public string Code { get; set; } = null!;
    }
}
