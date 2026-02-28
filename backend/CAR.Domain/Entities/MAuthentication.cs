using System;

namespace CAR.Domain.Entities
{
    public partial class MAuthentication
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Email { get; set; } = null!;

        /// <summary>Display name for customer (stored during registration, used when creating CustomerProfile on verify).</summary>
        public string? Name { get; set; }

        /// <summary>Address for customer (stored during registration, used when creating CustomerProfile on verify).</summary>
        public string? Address { get; set; }

        public string PasswordHash { get; set; } = null!;

        public string? GoogleId { get; set; }

        public string? FirebaseToken { get; set; }

        public string? Code { get; set; }

        public DateTime? CodeExpiresAt { get; set; }

        public bool CodeIsUsed { get; set; }

        public bool CodeIsRevoked { get; set; }

        public short AuthType { get; set; }

        public short AuthProvider { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public MUser User { get; set; } = null!;
    }
}
