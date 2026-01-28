using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.Auth
{
    public class GoogleLoginRequestDto
    {
        [Required(ErrorMessage = "Google ID token is required")]
        public string IdToken { get; set; } = null!;
    }
}
