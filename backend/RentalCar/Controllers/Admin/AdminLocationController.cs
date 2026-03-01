using CAR.Application.Dtos.Admin;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CAR.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/location")]
    [Authorize(Roles = "ADMIN")]
    public class AdminLocationController : ControllerBase
    {
        private readonly ILocationRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public AdminLocationController(ILocationRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var locations = await _repository.Query()
                .OrderBy(l => l.Province)
                .ThenBy(l => l.District)
                .ToListAsync();
            return Ok(locations);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLocationRequestDto request)
        {
            var location = new MLocation
            {
                Province = request.Province,
                District = request.District,
                Ward = request.Ward,
                AddressDetail = request.AddressDetail,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            await _repository.AddAsync(location);
            await _unitOfWork.SaveChangesAsync();
            return Ok(location);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateLocationRequestDto request)
        {
            var location = await _repository.Query().FirstOrDefaultAsync(l => l.Id == id);
            if (location == null) return NotFound();

            location.Province = request.Province;
            location.District = request.District;
            location.Ward = request.Ward;
            location.AddressDetail = request.AddressDetail;
            location.UpdatedAt = DateTime.UtcNow;

            _repository.Update(location);
            await _unitOfWork.SaveChangesAsync();
            return Ok(location);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var location = await _repository.Query().FirstOrDefaultAsync(l => l.Id == id);
            if (location == null) return NotFound();

            _repository.Remove(location);
            await _unitOfWork.SaveChangesAsync();
            return Ok(new { message = "Deleted successfully" });
        }
    }
}
