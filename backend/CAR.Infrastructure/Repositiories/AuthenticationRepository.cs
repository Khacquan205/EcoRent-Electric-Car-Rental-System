using Microsoft.EntityFrameworkCore;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class AuthenticationRepository : Repository<MAuthentication>, IAuthenticationRepository
    {
        public AuthenticationRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MAuthentication?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<MAuthentication?> GetByUserIdAsync(int userId)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId);
        }

        public async Task<MAuthentication?> GetByValidOtpAsync(string email, string code)
        {
            return await 
                _dbSet.FirstOrDefaultAsync(x => 
                x.Email == email &&
                x.Code == code && 
                x.CodeExpiresAt > DateTime.UtcNow);
        }

        public async Task UpdateOtpStatusAsync(int id, bool isUsed, bool isRevoked)
        {
            var auth = await _dbSet.FirstOrDefaultAsync(x => x.Id == id);
            if (auth != null)
            {
                auth.CodeIsUsed = isUsed;
                auth.CodeIsRevoked = isRevoked;
                if (isUsed && !isRevoked)
                {
                    auth.IsActive = true;
                }
                auth.UpdatedAt = DateTime.UtcNow;
                _dbSet.Update(auth);
            }
        }

        public async Task CreateAuthenticationAsync(MAuthentication authentication)
        {
            _dbSet.Add(authentication);
        }
    }
}
