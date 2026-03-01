using CAR.Application.Dtos.Admin;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CAR.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/vehicle-category")]
    [Authorize(Roles = "ADMIN")]
    public class AdminVehicleCategoryController : ControllerBase
    {
        private readonly IVehicleCategoryRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public AdminVehicleCategoryController(IVehicleCategoryRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _repository.Query()
                .OrderBy(c => c.Name)
                .ToListAsync();
            return Ok(categories);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryRequestDto request)
        {
            var category = new MVehicleCategory
            {
                Name = request.Name,
                Description = request.Description,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            await _repository.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();
            return Ok(category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryRequestDto request)
        {
            var category = await _repository.Query().FirstOrDefaultAsync(c => c.Id == id);
            if (category == null) return NotFound();

            category.Name = request.Name;
            category.Description = request.Description;
            category.Status = request.Status;
            category.UpdatedAt = DateTime.UtcNow;

            _repository.Update(category);
            await _unitOfWork.SaveChangesAsync();
            return Ok(category);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _repository.Query().FirstOrDefaultAsync(c => c.Id == id);
            if (category == null) return NotFound();

            _repository.Remove(category);
            await _unitOfWork.SaveChangesAsync();
            return Ok(new { message = "Deleted successfully" });
        }
    }
}
