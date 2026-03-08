using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Repositories;

public interface IAdOrderRepository : IRepository<MAdOrder>
{
    Task<MAdOrder?> GetByIdAsync(int id);
}
