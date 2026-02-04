using System;

namespace CAR.Domain.Entities
{
    public class MPhone
    {
        public int id { get; set; }
        
        public string Phone { get; set; } = string.Empty;
        
        public string Otp { get; set; } = string.Empty;
        
        public DateTime ExpiresAt { get; set; }
        
        public bool IsUsed { get; set; } = false;
        
        public DateTime? UsedAt { get; set; }
        
        public int CustomerId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
