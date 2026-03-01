using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos
{
    /// <summary>
    /// Request for face verification via selfie upload (fallback when live camera fails).
    /// Reuses same pipeline: CCCD face from store + selfie image, match threshold 0.75.
    /// </summary>
    public class KycSelfieMatchRequestDto
    {
        [Required(ErrorMessage = "Selfie image is required")]
        public IFormFile SelfieImage { get; set; }

        [Required(ErrorMessage = "CccdFaceId is required")]
        public string CccdFaceId { get; set; }
    }
}
