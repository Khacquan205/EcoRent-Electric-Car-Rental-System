using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Repositiories
{
    public class KycRepository : Repository<MKyc>, IKycRepository
    {
        public KycRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MKyc?> GetByCustomerIdAsync(int customerId)
        {
            return await _context.Ky.FirstOrDefaultAsync(k => k.CustomerId == customerId);
        }

        public async Task<MKyc?> GetByCccdNumberAsync(string cccdNumber)
        {
            return await _context.Ky.FirstOrDefaultAsync(k => k.CccdNumber == cccdNumber);
        }

        public async Task CreateKycAsync(MKyc kyc)
        {
            await _context.Ky.AddAsync(kyc);
        }

        public async Task UpdateKycAsync(MKyc kyc)
        {
            _context.Ky.Update(kyc);
            await Task.CompletedTask;
        }
    }
}
