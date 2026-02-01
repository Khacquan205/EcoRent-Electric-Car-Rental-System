using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "ADMIN")]
    public class AdminPackageController : ControllerBase
    {
        private readonly IOwnerPackageService _ownerPackageService;

        public AdminPackageController(IOwnerPackageService ownerPackageService)
        {
            _ownerPackageService = ownerPackageService;
        }

        /// <summary>
        /// Create a new package
        /// </summary>
        [HttpPost("create-package")]
        public async Task<IActionResult> CreatePackage([FromBody] CreatePackageRequestDto request)
        {
            var result = await _ownerPackageService.CreatePackageAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// Update an existing package
        /// </summary>
        [HttpPut("update-package/{id}")]
        public async Task<IActionResult> UpdatePackage(int id, [FromBody] UpdatePackageRequestDto request)
        {
            var result = await _ownerPackageService.UpdatePackageAsync(id, request);
            return Ok(result);
        }

        /// <summary>
        /// Delete (deactivate) a package
        /// </summary>
        [HttpDelete("delete-package/{id}")]
        public async Task<IActionResult> DeletePackage(int id)
        {
            var result = await _ownerPackageService.DeletePackageAsync(id);
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
