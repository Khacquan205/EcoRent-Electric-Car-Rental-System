using CAR.Application.Interfaces.Services;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Dtos;
using CAR.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CAR.Infrastructure.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerProfileRepository _customerProfileRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(
            ICustomerProfileRepository customerProfileRepository,
            IUnitOfWork unitOfWork,
            ILogger<CustomerService> logger)
        {
            _customerProfileRepository = customerProfileRepository;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<CustomerProfileDto?> GetCustomerProfileAsync(int userId)
        {
            try
            {
                _logger.LogInformation("CustomerService: Getting profile for UserId: {UserId}", userId);
                var customerProfile = await _customerProfileRepository.GetByUserIdAsync(userId);

                if (customerProfile == null)
                {
                    _logger.LogInformation("CustomerService: Customer profile not found for UserId: {UserId}. Creating default profile.", userId);

                    customerProfile = new MCustomerProfile
                    {
                        UserId = userId,
                        DisplayName = string.Empty,
                        Address = null,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _customerProfileRepository.CreateCustomerProfileAsync(customerProfile);
                    await _unitOfWork.SaveChangesAsync();
                }

                _logger.LogInformation("CustomerService: Found profile for UserId: {UserId}, ProfileId: {ProfileId}", userId, customerProfile.Id);
                return MapToDto(customerProfile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CustomerService: Error getting customer profile for UserId: {UserId}", userId);
                throw;
            }
        }

        public async Task<CustomerProfileDto?> UpdateCustomerProfileAsync(int userId, UpdateCustomerProfileRequestDto request)
        {
            try
            {
                var customerProfile = await _customerProfileRepository.GetByUserIdAsync(userId);
                if (customerProfile == null)
                {
                    _logger.LogWarning("Customer profile not found for UserId: {UserId}", userId);
                    return null;
                }

                customerProfile.DisplayName = request.DisplayName;
                customerProfile.Address = request.Address;
                customerProfile.Latitude = request.Latitude;
                customerProfile.Longitude = request.Longitude;
                customerProfile.UpdatedAt = DateTime.UtcNow;

                await _customerProfileRepository.UpdateCustomerProfileAsync(customerProfile);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Updated customer profile for UserId: {UserId}", userId);

                return MapToDto(customerProfile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer profile for UserId: {UserId}", userId);
                throw;
            }
        }

        private CustomerProfileDto MapToDto(MCustomerProfile customerProfile)
        {
            return new CustomerProfileDto
            {
                Id = customerProfile.Id,
                UserId = customerProfile.UserId,
                DisplayName = customerProfile.DisplayName ?? "",
                Address = customerProfile.Address ?? "",
                Latitude = customerProfile.Latitude,
                Longitude = customerProfile.Longitude,
                CreatedAt = customerProfile.CreatedAt,
                UpdatedAt = customerProfile.UpdatedAt
            };
        }
    }
}
