using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos
{
    public class KycOcrRequestDto
    {
        [Required(ErrorMessage = "FrontImage is required")]
        public IFormFile FrontImage { get; set; }
        
        [Required(ErrorMessage = "BackImage is required")]
        public IFormFile BackImage { get; set; }
    }
}
