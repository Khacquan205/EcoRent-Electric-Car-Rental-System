using CAR.Application.Dtos.OwnerKyc;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace RentalCar.Controllers
{
    [ApiController]
    [Route("api/owner/kyc")]
    [Authorize(Roles = "OWNER")]
    public class OwnerKycController : ControllerBase
    {
        private readonly IOwnerKycService _ownerKycService;

        public OwnerKycController(IOwnerKycService ownerKycService)
        {
            _ownerKycService = ownerKycService;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitKyc([FromBody] OwnerKycSubmitRequestDto request)
        {
            var userId = GetCurrentUserId();
            await _ownerKycService.SubmitKycAsync(userId, request);
            return Ok(new { message = "KYC submitted successfully and is pending review" });
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var userId = GetCurrentUserId();
            var status = await _ownerKycService.GetStatusAsync(userId);
            return Ok(status);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }
    }
}
