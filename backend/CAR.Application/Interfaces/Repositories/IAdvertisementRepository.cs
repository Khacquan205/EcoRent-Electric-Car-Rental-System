using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories;

public interface IAdvertisementRepository : IRepository<MAdvertisement>
{
    Task<MAdvertisement?> GetByPostIdAsync(int postId);
}
