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

        public string? Phone { get; set; }

        public bool IdentityVerified { get; set; }

        public double RatingAvg { get; set; }

        public int TotalPosts { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
