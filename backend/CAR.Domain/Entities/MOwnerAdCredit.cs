namespace CAR.Domain.Entities;

/// <summary>
/// Credit quảng cáo: owner đã mua gói quảng cáo, còn X lần được dùng để boost bài.
/// </summary>
public class MOwnerAdCredit
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    public int AdPackageId { get; set; }
    /// <summary>Số lần còn lại được apply quảng cáo lên bài.</summary>
    public int RemainingPosts { get; set; }
    /// <summary>Số ngày chạy quảng cáo mỗi lần apply (copy từ package lúc mua).</summary>
    public int DurationDays { get; set; }
    public DateTime CreatedAt { get; set; }

    public MOwnerProfile OwnerProfile { get; set; } = null!;
    public MAdPackage AdPackage { get; set; } = null!;
}
