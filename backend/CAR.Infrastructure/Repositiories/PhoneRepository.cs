using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Repositiories
{
    public class PhoneRepository : IPhoneRepository
    {
        private readonly AppDbContext _context;
        private readonly DbSet<MPhone> _dbSet;

        public PhoneRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<MPhone>();
        }

        public async Task<MPhone?> GetByPhoneAsync(string phone)
        {
            return await _dbSet
                .Where(x => x.Phone == phone && !x.IsUsed && x.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<MPhone?> GetByPhoneAndCustomerIdAsync(string phone, int customerId)
        {
            return await _dbSet
                .Where(x => x.Phone == phone && x.CustomerId == customerId && !x.IsUsed && x.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<MPhone?> GetByCustomerIdAsync(int customerId)
        {
            return await _dbSet
                .Where(x => x.CustomerId == customerId && x.IsUsed)
                .OrderByDescending(x => x.UsedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<MPhone?> GetVerifiedPhoneAsync(string phone)
        {
            return await _dbSet
                .Where(x => x.Phone == phone && x.IsUsed)
                .FirstOrDefaultAsync();
        }

        public async Task StorePhoneOtpAsync(string phone, string otp, int customerId, DateTime expiresAt)
        {
            // Check if phone already exists and was sent within last 30 seconds
            var existingPhone = await GetByPhoneAsync(phone);
            if (existingPhone != null)
            {
                // Check if last OTP was sent less than 30 seconds ago
                var timeSinceLastOtp = DateTime.UtcNow - existingPhone.CreatedAt;
                if (timeSinceLastOtp.TotalSeconds < 30)
                {
                    throw new InvalidOperationException($"Please wait {30 - (int)timeSinceLastOtp.TotalSeconds} seconds before requesting a new OTP.");
                }
                
                // Update existing record
                existingPhone.Otp = otp;
                existingPhone.CustomerId = customerId;
                existingPhone.ExpiresAt = expiresAt;
                existingPhone.IsUsed = false;
                existingPhone.UsedAt = null;
                existingPhone.UpdatedAt = DateTime.UtcNow;
                
                _dbSet.Update(existingPhone);
            }
            else
            {
                // Create new record
                var phoneRecord = new MPhone
                {
                    Phone = phone,
                    Otp = otp,
                    CustomerId = customerId,
                    ExpiresAt = expiresAt,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _dbSet.AddAsync(phoneRecord);
            }
            
            await _context.SaveChangesAsync();
        }

        public async Task MarkOtpAsUsedAsync(string phone, string otp)
        {
            var phoneRecord = await _dbSet
                .Where(x => x.Phone == phone && x.Otp == otp && !x.IsUsed && x.ExpiresAt > DateTime.UtcNow)
                .FirstOrDefaultAsync();
                
            if (phoneRecord != null)
            {
                phoneRecord.IsUsed = true;
                phoneRecord.UsedAt = DateTime.UtcNow;
                phoneRecord.UpdatedAt = DateTime.UtcNow;
                _dbSet.Update(phoneRecord);
                await _context.SaveChangesAsync();
            }
        }

        public async Task CleanupExpiredOtpAsync()
        {
            var expiredOtps = _dbSet.Where(x => x.ExpiresAt < DateTime.UtcNow.AddHours(-24));
            _dbSet.RemoveRange(expiredOtps);
            await _context.SaveChangesAsync();
        }

        // IRepository implementation
        public async Task AddAsync(MPhone entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public void Update(MPhone entity)
        {
            _dbSet.Update(entity);
        }

        public void Remove(MPhone entity)
        {
            _dbSet.Remove(entity);
        }

        public IQueryable<MPhone> Query()
        {
            return _dbSet;
        }
    }
}
