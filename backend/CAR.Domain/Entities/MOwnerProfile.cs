using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CAR.Domain.Enums;

namespace CAR.Domain.Entities
{
    /// <summary>
    /// Owner profile: legal identity for KYC (FullName, IdCardNumber, DateOfBirth, Gender).
    /// No Address here; that is customer/location data.
    /// </summary>
    public partial class MOwnerProfile
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string? Name { get; set; }

        /// <summary>Họ tên pháp lý (KYC).</summary>
        public string? FullName { get; set; }

        /// <summary>Số CCCD/CMND.</summary>
        public string? IdNumber { get; set; }

        /// <summary>Ngày sinh (KYC).</summary>
        public DateTime? DateOfBirth { get; set; }

        /// <summary>Giới tính (KYC).</summary>
        public KycGender Gender { get; set; }

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
