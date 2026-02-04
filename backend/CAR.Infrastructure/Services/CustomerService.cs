using CAR.Application.Interfaces.Services;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Dtos;
using CAR.Domain.Entities;
using CAR.Domain.Enums;
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
                    _logger.LogWarning("CustomerService: Customer profile not found for UserId: {UserId}", userId);
                    return null;
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

                // Update profile
                customerProfile.Name = request.Name;
                customerProfile.Phone = request.Phone;
                customerProfile.Gender = MapGender(request.Gender);
                customerProfile.DateOfBirth = request.DateOfBirth;
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
                Name = customerProfile.Name ?? "",
                Phone = customerProfile.Phone ?? "",
                Gender = customerProfile.Gender.ToString(),
                DateOfBirth = customerProfile.DateOfBirth,
                CreatedAt = customerProfile.CreatedAt,
                UpdatedAt = customerProfile.UpdatedAt
            };
        }

        private KycGender MapGender(string gender)
        {
            return gender.ToLower() switch
            {
                "male" => KycGender.Male,
                "female" => KycGender.Female,
                "other" => KycGender.Other,
                _ => KycGender.Other
            };
        }
    }
}
