using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CAR.Domain.Enums;

namespace CAR.Domain.Entities
{
    public partial class MRole
    {
        public int Id { get; set; }

        public string Code { get; set; } = null!;

        public string? Name { get; set; }

        public string? Description { get; set; }

        public short Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
