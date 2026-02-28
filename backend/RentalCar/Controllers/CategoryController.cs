using CAR.Application.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace RentalCar.Controllers
{
    /// <summary>
    /// Public API for vehicle categories (e.g. for post car form dropdown).
    /// </summary>
    [ApiController]
    [Route("api/categories")]
    [AllowAnonymous]
    public class CategoryController : ControllerBase
    {
        private readonly IVehicleCategoryRepository _repository;

        public CategoryController(IVehicleCategoryRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _repository.Query()
                .Where(c => c.Status == 1)
                .OrderBy(c => c.Name)
                .Select(c => new { c.Id, c.Name, c.Description })
                .ToListAsync();
            return Ok(categories);
        }
    }
}
