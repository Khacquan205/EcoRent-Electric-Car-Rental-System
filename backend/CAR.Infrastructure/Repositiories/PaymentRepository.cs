using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CAR.Infrastructure.Repositiories
{
    public class PaymentRepository : Repository<MPayment>, IPaymentRepository
    {
        public PaymentRepository(AppDbContext context) : base(context) { }

        public async Task<MPayment?> GetByTransactionCodeAsync(string transactionCode)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.TransactionCode == transactionCode);
        }
    }
}
