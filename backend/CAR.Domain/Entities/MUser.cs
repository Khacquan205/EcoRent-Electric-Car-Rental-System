using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using CAR.Domain.Enums;

namespace CAR.Domain.Entities
{
    /// <summary>
    /// Account entity: authentication only (Id, Email, PasswordHash, Role).
    /// Customer-specific data (DisplayName, Address) lives in CustomerProfile.
    /// Owner-specific data (FullName, IdCardNumber, etc.) lives in OwnerProfile.
    /// </summary>
    public partial class MUser
    {
        public int Id { get; set; }

        public int RoleId { get; set; }

        public string Email { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public short Status { get; set; }

        /// <summary>Login provider: "Local", "Google".</summary>
        public string LoginProvider { get; set; } = "Local";

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public MRole Role { get; set; } = null!;
        public ICollection<MAuthentication> Authentications { get; set; } = new List<MAuthentication>();
        public MCustomerProfile? CustomerProfile { get; set; }
        public MOwnerProfile? OwnerProfile { get; set; }
        public MStaffProfile? StaffProfile { get; set; }
        public ICollection<MSearchHistory> SearchHistories { get; set; } = new List<MSearchHistory>();
        public ICollection<MReview> ReviewsGiven { get; set; } = new List<MReview>();
        public ICollection<MReport> ReportsMade { get; set; } = new List<MReport>();
    }
}
