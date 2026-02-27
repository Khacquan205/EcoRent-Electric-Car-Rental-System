using CAR.Application.Dtos.Admin;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RentalCar.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/accounts")]
    [Authorize(Roles = "ADMIN")]
    public class AdminAccountController : ControllerBase
    {
        private readonly IAdminAccountService _adminAccountService;

        public AdminAccountController(IAdminAccountService adminAccountService)
        {
            _adminAccountService = adminAccountService;
        }



        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _adminAccountService.GetAllUsersAsync();
            return Ok(result);
        }

        [HttpPost("staff/promote")]
        public async Task<IActionResult> PromoteToStaff([FromBody] PromoteToStaffRequestDto request)
        {
            var result = await _adminAccountService.PromoteToStaffAsync(request);
            return Ok(result);
        }
    }
}
