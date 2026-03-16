using System;

namespace CAR.Domain.Entities
{
    public partial class MPost
    {
        public int Id { get; set; }

        public int OwnerId { get; set; }

        public int CategoryId { get; set; }

        public int? LocationId { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public decimal Price { get; set; }

        public string? ContactPhone { get; set; }


        public short Status { get; set; }


        public int? StaffId { get; set; }

        public string? RejectReason { get; set; }


        public short PriorityLevel { get; set; }

        public DateTime? ExpiredAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public MOwnerProfile OwnerProfile { get; set; } = null!;
        public MVehicleCategory Category { get; set; } = null!;
        public MLocation? Location { get; set; }
        public MStaffProfile? Staff { get; set; }
        public MAdvertisement? Advertisement { get; set; }
        public MVehicleVerification? VehicleVerification { get; set; }
        public ICollection<TPostImage> Images { get; set; } = new List<TPostImage>();
        public ICollection<TPostVideo> Videos { get; set; } = new List<TPostVideo>();
        public ICollection<TPostLicenseImage> LicenseImages { get; set; } = new List<TPostLicenseImage>();
        public ICollection<MReview> Reviews { get; set; } = new List<MReview>();
        public ICollection<MReport> Reports { get; set; } = new List<MReport>();
    }
}
