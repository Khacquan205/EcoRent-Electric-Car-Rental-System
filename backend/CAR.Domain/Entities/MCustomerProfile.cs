using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CAR.Domain.Enums;

namespace CAR.Domain.Entities
{
    public partial class MCustomerProfile
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string? Name { get; set; }

        public string? Phone { get; set; }

        public KycGender Gender { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
