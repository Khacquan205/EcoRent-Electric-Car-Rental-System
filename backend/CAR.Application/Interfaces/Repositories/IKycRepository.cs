using CAR.Domain.Entities;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IKycRepository : IRepository<MKyc>
    {
        Task<MKyc?> GetByOwnerProfileIdAsync(int ownerProfileId);
        Task<MKyc?> GetByIdCardNumberAsync(string idCardNumber);
    }
}
