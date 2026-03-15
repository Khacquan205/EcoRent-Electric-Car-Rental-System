namespace CAR.Application.Dtos.Owner
{
    /// <summary>Gói đăng ký đang active (để hiển thị trên dashboard owner).</summary>
    public class OwnerDashboardActiveSubscriptionDto
    {
        public int Id { get; set; }
        public string PackageName { get; set; } = null!;
        public DateTime EndDate { get; set; }
        public int TotalPosts { get; set; }
        public int RemainingPosts { get; set; }
    }

    /// <summary>Số bài đăng theo trạng thái.</summary>
    public class OwnerDashboardPostCountByStatusDto
    {
        public int Pending { get; set; }
        public int Approved { get; set; }
        public int Rejected { get; set; }
        public int Expired { get; set; }
    }

    /// <summary>Thông tin quảng cáo trên dashboard owner.</summary>
    public class OwnerDashboardAdSummaryDto
    {
        /// <summary>Tổng số credit quảng cáo còn lại (số lần còn được dùng để boost bài).</summary>
        public int RemainingAdCredits { get; set; }
        /// <summary>Số bài đang được quảng cáo (còn hiệu lực).</summary>
        public int BoostedPostsCount { get; set; }
    }

    /// <summary>Tổng quan dashboard owner (một request).</summary>
    public class OwnerDashboardSummaryDto
    {
        public OwnerDashboardActiveSubscriptionDto? ActiveSubscription { get; set; }
        public int RemainingSlots { get; set; }
        public OwnerDashboardPostCountByStatusDto PostCountByStatus { get; set; } = null!;
        /// <summary>Phần quảng cáo: credit còn lại, số bài đang boost.</summary>
        public OwnerDashboardAdSummaryDto AdSummary { get; set; } = null!;
    }
}
