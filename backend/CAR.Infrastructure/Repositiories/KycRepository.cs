using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Repositiories
{
    public class KycRepository : Repository<MKyc>, IKycRepository
    {
        public KycRepository(AppDbContext context) : base(context) { }

        public async Task<MKyc?> GetByOwnerProfileIdAsync(int ownerProfileId)
        {
            return await _dbSet.FirstOrDefaultAsync(k => k.OwnerProfileId == ownerProfileId);
        }

        public async Task<MKyc?> GetByIdCardNumberAsync(string idCardNumber)
        {
            return await _dbSet.FirstOrDefaultAsync(k => k.IdCardNumber == idCardNumber);
        }
    }
}
