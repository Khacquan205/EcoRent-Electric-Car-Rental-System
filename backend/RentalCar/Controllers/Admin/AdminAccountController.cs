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

        [HttpGet("users/{id:int}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var result = await _adminAccountService.GetUserByIdAsync(id);
            return Ok(result);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request)
        {
            var result = await _adminAccountService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetUserById), new { id = result.Id }, result);
        }

        [HttpPut("users/{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequestDto request)
        {
            var result = await _adminAccountService.UpdateUserAsync(id, request);
            return Ok(result);
        }

        [HttpDelete("users/{id:int}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            await _adminAccountService.DeleteUserAsync(id);
            return NoContent();
        }

        [HttpDelete("users/{id:int}/hard")]
        public async Task<IActionResult> HardDeleteUser(int id)
        {
            await _adminAccountService.HardDeleteUserAsync(id);
            return NoContent();
        }

        [HttpPost("staff/promote")]
        public async Task<IActionResult> PromoteToStaff([FromBody] PromoteToStaffRequestDto request)
        {
            var result = await _adminAccountService.PromoteToStaffAsync(request);
            return Ok(result);
        }
    }
}
