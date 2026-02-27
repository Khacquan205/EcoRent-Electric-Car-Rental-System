using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class VehicleCategoryRepository : Repository<MVehicleCategory>, IVehicleCategoryRepository
    {
        public VehicleCategoryRepository(AppDbContext context) : base(context)
        {
        }
    }
}
