using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;

namespace CAR.Infrastructure.Repositories
{
    public class VehicleVerificationRepository : Repository<MVehicleVerification>, IVehicleVerificationRepository
    {
        public VehicleVerificationRepository(AppDbContext context) : base(context)
        {
        }
    }
}
