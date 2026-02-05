using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos
{
    public class KycPhoneRequestDto
    {
        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        [StringLength(10, MinimumLength = 10, ErrorMessage = "Phone number must be 10 digits")]
        public string Phone { get; set; } = string.Empty;
    }
}
