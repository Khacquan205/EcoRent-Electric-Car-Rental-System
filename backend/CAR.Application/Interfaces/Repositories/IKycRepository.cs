using CAR.Domain.Entities;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IKycRepository : IRepository<MKyc>
    {
        Task<MKyc?> GetByCustomerIdAsync(int customerId);
        Task<MKyc?> GetByCccdNumberAsync(string cccdNumber);
        Task CreateKycAsync(MKyc kyc);
        Task UpdateKycAsync(MKyc kyc);
    }
}
