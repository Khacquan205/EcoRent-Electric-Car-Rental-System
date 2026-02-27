using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos
{
    public class KycLivenessRequestDto
    {
        [Required(ErrorMessage = "Video is required")]
        public IFormFile Video { get; set; }
        
        [Required(ErrorMessage = "CccdFaceId is required")]
        public string CccdFaceId { get; set; }
    }
}
