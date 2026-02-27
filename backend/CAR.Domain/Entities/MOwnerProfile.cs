using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CAR.Domain.Entities
{
    public partial class MOwnerProfile
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string? Name { get; set; }

        /// <summary>Họ tên từ CCCD (KYC).</summary>
        public string? FullName { get; set; }

        /// <summary>Ngày sinh từ CCCD.</summary>
        public DateTime? DateOfBirth { get; set; }

        /// <summary>Địa chỉ thường trú (từ CCCD hoặc cập nhật sau).</summary>
        public string? Address { get; set; }

        /// <summary>Số CCCD/CMND.</summary>
        public string? IdNumber { get; set; }

        public string? Phone { get; set; }

        public bool IdentityVerified { get; set; }

        public decimal RatingAvg { get; set; }

        public int TotalPosts { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public MUser User { get; set; } = null!;
        public MKyc? Kyc { get; set; }
        public MIdentityVerification? IdentityVerification { get; set; }
        public ICollection<MPost> Posts { get; set; } = new List<MPost>();
        public ICollection<MReview> ReviewsReceived { get; set; } = new List<MReview>();
        public ICollection<MOwnerSubscription> Subscriptions { get; set; } = new List<MOwnerSubscription>();
    }
}
