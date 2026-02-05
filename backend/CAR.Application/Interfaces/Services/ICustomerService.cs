using CAR.Application.Dtos;

namespace CAR.Application.Interfaces.Services
{
    public interface ICustomerService
    {
        Task<CustomerProfileDto?> GetCustomerProfileAsync(int userId);
        Task<CustomerProfileDto?> UpdateCustomerProfileAsync(int userId, UpdateCustomerProfileRequestDto request);
    }
}
