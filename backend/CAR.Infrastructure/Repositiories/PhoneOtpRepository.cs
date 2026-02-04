using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Repositiories
{
    public class PhoneOtpRepository : IPhoneOtpRepository
    {
        private readonly AppDbContext _context;
        private readonly DbSet<MPhoneOtp> _dbSet;

        public PhoneOtpRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<MPhoneOtp>();
        }

        public async Task<MPhoneOtp?> GetLatestOtpAsync(string phone)
        {
            return await _dbSet
                .Where(x => x.Phone == phone && !x.IsUsed && x.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task StoreOtpAsync(string phone, string otp, DateTime expiresAt)
        {
            var phoneOtp = new MPhoneOtp
            {
                Phone = phone,
                Otp = otp,
                ExpiresAt = expiresAt
            };

            await _dbSet.AddAsync(phoneOtp);
            await _context.SaveChangesAsync();
        }

        public async Task MarkOtpAsUsedAsync(int otpId)
        {
            var otp = await _dbSet.FindAsync(otpId);
            if (otp != null)
            {
                otp.IsUsed = true;
                otp.UsedAt = DateTime.UtcNow;
                _dbSet.Update(otp);
                await _context.SaveChangesAsync();
            }
        }

        public async Task CleanupExpiredOtpsAsync()
        {
            var expiredOtps = _dbSet.Where(x => x.ExpiresAt < DateTime.UtcNow.AddHours(-24));
            _dbSet.RemoveRange(expiredOtps);
            await _context.SaveChangesAsync();
        }
    }
}
