using System.ComponentModel.DataAnnotations;

namespace CAR.Application.Dtos.AdPackage;

public class AdPackageCreateRequestDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = null!;
    [MaxLength(500)]
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationDays { get; set; }
    public int MaxPosts { get; set; } = 1;
    /// <summary>1 = thấp, 2 = trung bình, 3 = cao. Dùng để sort bài được apply gói này.</summary>
    public int PriorityLevel { get; set; } = 1;
}

public class AdPackageUpdateRequestDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = null!;
    [MaxLength(500)]
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationDays { get; set; }
    public int MaxPosts { get; set; }
    public int PriorityLevel { get; set; } = 1;
    public short Status { get; set; }
}

public class AdPackageResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationDays { get; set; }
    public int MaxPosts { get; set; }
    public int PriorityLevel { get; set; }
    public short Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class OwnerAdCreditDto
{
    public int Id { get; set; }
    public int AdPackageId { get; set; }
    public string AdPackageName { get; set; } = null!;
    public int RemainingPosts { get; set; }
    public int DurationDays { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApplyAdToPostRequestDto
{
    public int PostId { get; set; }
}
