using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CAR.Application.Interfaces.Services;
using CAR.Application.Dtos;
using System.Security.Claims;

namespace RentalCar.Controllers
{
    [ApiController]
    [Route("api/customer")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ILogger<CustomerController> _logger;

        public CustomerController(ICustomerService customerService, ILogger<CustomerController> logger)
        {
            _customerService = customerService;
            _logger = logger;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var profile = await _customerService.GetCustomerProfileAsync(userId);
            if (profile == null)
                return NotFound("Customer profile not found");

            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateCustomerProfileRequestDto request)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var updated = await _customerService.UpdateCustomerProfileAsync(userId, request);
            if (updated == null)
                return NotFound("Customer profile not found");

            return Ok(updated);
        }

        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return !string.IsNullOrEmpty(claim) && int.TryParse(claim, out userId);
        }
    }
}
