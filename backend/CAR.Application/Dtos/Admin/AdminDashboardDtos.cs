namespace CAR.Application.Dtos.Admin
{
    /// <summary>Thống kê tổng quan dashboard admin.</summary>
    public class AdminDashboardStatsDto
    {
        public int TotalPackagesSold { get; set; }
        public int TotalPosts { get; set; }
        public int ActiveOwnersCount { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }

    /// <summary>Dữ liệu theo tháng cho biểu đồ (gói đã bán, bài đăng).</summary>
    public class AdminDashboardMonthlyItemDto
    {
        public string Month { get; set; } = null!; // e.g. "T03"
        public int PackagesSold { get; set; }
        public int PostsCount { get; set; }
    }

    /// <summary>Phân bố gói đã mua (theo tên gói).</summary>
    public class AdminDashboardPackageDistributionItemDto
    {
        public string PackageName { get; set; } = null!;
        public int Count { get; set; }
    }

    /// <summary>Phân bố trạng thái bài đăng (Đã duyệt, Chờ duyệt, Từ chối, Hết hạn).</summary>
    public class AdminDashboardPostStatusItemDto
    {
        public string StatusName { get; set; } = null!;
        public int Count { get; set; }
    }
}
