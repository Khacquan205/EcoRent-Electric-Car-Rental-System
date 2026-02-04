using System;

namespace CAR.Domain.Entities
{
    public class MPhoneOtp
    {
        public int Id { get; set; }
        
        public string Phone { get; set; } = string.Empty;
        
        public string Otp { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime ExpiresAt { get; set; }
        
        public bool IsUsed { get; set; } = false;
        
        public DateTime? UsedAt { get; set; }
    }
}
