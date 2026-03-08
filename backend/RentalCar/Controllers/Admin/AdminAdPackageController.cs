using CAR.Application.Dtos.AdPackage;
using CAR.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAR.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/ad-packages")]
    [Authorize(Roles = "ADMIN")]
    public class AdminAdPackageController : ControllerBase
    {
        private readonly IAdPackageService _adPackageService;

        public AdminAdPackageController(IAdPackageService adPackageService)
        {
            _adPackageService = adPackageService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AdPackageCreateRequestDto request)
        {
            var result = await _adPackageService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] AdPackageUpdateRequestDto request)
        {
            var result = await _adPackageService.UpdateAsync(id, request);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _adPackageService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetActive()
        {
            var result = await _adPackageService.GetActivePackagesAsync();
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Deactivate(int id)
        {
            await _adPackageService.DeactivateAsync(id);
            return NoContent();
        }
    }
}
