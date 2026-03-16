using System;

namespace CAR.Domain.Entities
{
    /// <summary>
    /// Stores driver license / CCCD images for posts.
    /// </summary>
    public partial class TPostLicenseImage
    {
        public int Id { get; set; }

        public int PostId { get; set; }

        public string ImageUrl { get; set; } = null!;

        public int SortOrder { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
