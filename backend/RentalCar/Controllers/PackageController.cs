using Microsoft.AspNetCore.Mvc;
using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PackageController : ControllerBase
    {
        private readonly IOwnerPackageService _ownerPackageService;

        public PackageController(IOwnerPackageService ownerPackageService)
        {
            _ownerPackageService = ownerPackageService;
        }

        /// <summary>
        /// Get all active packages
        /// </summary>
        [HttpGet("get-active-packages")]
        public async Task<IActionResult> GetActivePackages()
        {
            var result = await _ownerPackageService.GetActivePackagesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get package by ID
        /// </summary>
        [HttpGet("get-package/{id}")]
        public async Task<IActionResult> GetPackageById(int id)
        {
            var result = await _ownerPackageService.GetPackageByIdAsync(id);
            return Ok(result);
        }
    }
}
