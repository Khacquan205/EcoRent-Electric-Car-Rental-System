namespace CAR.Domain.Entities;

/// <summary>
/// Gói chạy quảng cáo (khác gói đăng bài). Owner mua để boost bài đã được duyệt lên đầu trang.
/// </summary>
public class MAdPackage
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    /// <summary>Số ngày quảng cáo chạy cho mỗi bài khi owner apply.</summary>
    public int DurationDays { get; set; }
    /// <summary>Số bài tối đa được quảng cáo trong một lần mua (thường 1).</summary>
    public int MaxPosts { get; set; } = 1;
    /// <summary>Cấp ưu tiên khi sort: 1 = thấp, 2 = trung bình, 3 = cao. Bài apply gói này sẽ xếp theo level này.</summary>
    public int PriorityLevel { get; set; } = 1;
    /// <summary>0 = Inactive, 1 = Active.</summary>
    public short Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
