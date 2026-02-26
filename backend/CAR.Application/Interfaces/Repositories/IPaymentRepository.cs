using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IPaymentRepository : IRepository<MPayment>
    {
        Task<MPayment?> GetByTransactionCodeAsync(string transactionCode);
    }
}
