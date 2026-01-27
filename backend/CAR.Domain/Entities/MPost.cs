using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

        public short PriorityLevel { get; set; }

        public DateTime? ExpiredAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
