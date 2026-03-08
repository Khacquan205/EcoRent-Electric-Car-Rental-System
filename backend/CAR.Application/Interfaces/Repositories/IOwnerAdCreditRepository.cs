using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories;

public interface IOwnerAdCreditRepository : IRepository<MOwnerAdCredit>
{
    Task<MOwnerAdCredit?> GetFirstAvailableCreditAsync(int ownerId);
}
