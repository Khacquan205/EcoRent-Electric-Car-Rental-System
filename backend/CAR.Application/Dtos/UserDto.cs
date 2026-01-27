using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CAR.Application.Dtos
{
    public class UserDto
    {
        public int Id { get; set; }

        public int RoleId { get; set; }

        public string Email { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public string? Phone { get; set; }

        public short Gender { get; set; }

        public short Status { get; set; }

        public string? AvatarImgUrl { get; set; }
    }
}
