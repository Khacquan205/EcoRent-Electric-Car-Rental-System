using System;
using System.Collections.Generic;

namespace CAR.Application.Dtos
{
    public class PostListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public decimal Price { get; set; }
        public short Status { get; set; }
        public string? StatusName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public string? CategoryName { get; set; }
        /// <summary>True nếu bài đang chạy quảng cáo (apply ad còn hiệu lực) — dùng để verify sort và hiển thị badge.</summary>
        public bool IsPromoted { get; set; }
        /// <summary>Cấp ưu tiên quảng cáo: 0 = không quảng cáo, 1–3 = theo gói (dùng để sort và hiển thị).</summary>
        public int PromotedPriorityLevel { get; set; }
        public List<string> Images { get; set; } = new List<string>();
        public List<string> Videos { get; set; } = new List<string>();
    }

    public class PostDetailDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public int? LocationId { get; set; }
        public string? LocationName { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? ContactPhone { get; set; }
        public short Status { get; set; }
        public string StatusName { get; set; } = null!;
        public string? RejectReason { get; set; }
        public short PriorityLevel { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }
        public List<string> Images { get; set; } = new List<string>();
        public List<string> Videos { get; set; } = new List<string>();
        /// <summary>Giấy tờ xe (ảnh đăng ký, kiểm định, bảo hiểm) để staff đối chiếu khi duyệt.</summary>
        public VehicleVerificationDto? VehicleVerification { get; set; }
        
        // Flat properties for easy access in frontend
        public string? RegistrationImageUrl => VehicleVerification?.RegistrationImageUrl;
        public string? InspectionImageUrl => VehicleVerification?.InspectionImageUrl;
        public string? InsuranceImageUrl => VehicleVerification?.InsuranceImageUrl;
    }

    /// <summary>Giấy tờ xe đính kèm bài đăng (cho staff xem khi duyệt).</summary>
    public class VehicleVerificationDto
    {
        public string? RegistrationImageUrl { get; set; }
        public string? InspectionImageUrl { get; set; }
        public string? InsuranceImageUrl { get; set; }
    }

    public class UpdatePostRequestDto
    {
        public int CategoryId { get; set; }
        public int? LocationId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? ContactPhone { get; set; }
    }
}
