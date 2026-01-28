using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.Auth
{
    public class SendOtpRequestDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [MaxLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string Email { get; set; } = null!;
    }
}
