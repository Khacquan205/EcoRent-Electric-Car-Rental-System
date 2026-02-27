using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.OwnerKyc
{
    /// <summary>
    /// Request for "Trở thành chủ xe" flow: submit KYC data read from CCCD (no liveness).
    /// </summary>
    public class OwnerKycBecomeOwnerRequestDto
    {
        [Required(ErrorMessage = "FullName is required")]
        [StringLength(200)]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = "DateOfBirth is required")]
        [StringLength(50)]
        public string DateOfBirth { get; set; } = null!;

        [Required(ErrorMessage = "IdNumber is required")]
        [StringLength(50)]
        public string IdNumber { get; set; } = null!;

        [StringLength(500)]
        public string? Address { get; set; }
    }
}
