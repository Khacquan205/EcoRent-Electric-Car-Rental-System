using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos
{
    public class KycConfirmRequestDto
    {
        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Date of birth is required")]
        public string Dob { get; set; } = string.Empty;

        [Required(ErrorMessage = "Gender is required")]
        public string Gender { get; set; } = string.Empty;

        [Required(ErrorMessage = "CCCD number is required")]
        [StringLength(12, MinimumLength = 12, ErrorMessage = "CCCD number must be 12 digits")]
        public string CccdNumber { get; set; } = string.Empty;
    }
}
