using System;

namespace CAR.Application.Dtos
{
    public class VerifyIdentityResponseDto
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string? Name { get; set; }

        public string? Phone { get; set; }

        public bool IdentityVerified { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public bool CanCreatePosts { get; set; }
    }
}
