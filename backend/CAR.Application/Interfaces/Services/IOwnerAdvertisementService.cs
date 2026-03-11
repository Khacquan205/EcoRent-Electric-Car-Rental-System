using CAR.Application.Dtos.AdPackage;

namespace CAR.Application.Interfaces.Services;

public interface IOwnerAdvertisementService
{
    Task<List<AdPackageResponseDto>> GetActiveAdPackagesAsync();
    Task<List<OwnerAdCreditDto>> GetMyAdCreditsAsync(int userId);
    /// <summary>Tạo đơn mua gói quảng cáo (chờ thanh toán). Trả về adOrderId để FE gọi API lấy paymentUrl.</summary>
    Task<int> CreateAdOrderAsync(int userId, int adPackageId);
    Task<OwnerAdCreditDto> PurchaseAdPackageAsync(int userId, int adPackageId);
    Task ApplyAdToPostAsync(int userId, int postId);
}
