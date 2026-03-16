using System;
using System.Collections.Generic;

namespace CAR.Application.Dtos
{
    public class CreatePostRequestDto
    {
        public int CategoryId { get; set; }

        public int? LocationId { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public string? ContactPhone { get; set; }

        /// <summary>Optional list of image URLs for the post.</summary>
        public List<string>? ImageUrls { get; set; }

        /// <summary>Optional single image URL for backward-compatible clients.</summary>
        public string? ImageUrl { get; set; }

        /// <summary>Optional list of video URLs for the post.</summary>
        public List<string>? VideoUrls { get; set; }

        /// <summary>Optional list of driver license/CCCD image URLs.</summary>
        public List<string>? LicenseImageUrls { get; set; }

        /// <summary>URL ảnh giấy đăng ký xe (để staff đối chiếu với ảnh xe khi duyệt bài).</summary>
        public string? RegistrationImageUrl { get; set; }
        /// <summary>URL ảnh giấy kiểm định xe.</summary>
        public string? InspectionImageUrl { get; set; }
        /// <summary>URL ảnh bảo hiểm xe.</summary>
        public string? InsuranceImageUrl { get; set; }
    }
}
