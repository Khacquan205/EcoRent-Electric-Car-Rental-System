using Microsoft.AspNetCore.Mvc;
using CAR.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CAR.Controllers
{
    [ApiController]
    [Route("Test/Connection")]
    public class TestController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TestController(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Test database connection & simple query
        /// </summary>
        [HttpGet("db")]
        public IActionResult CheckDatabase()
        {
            try
            {
                var canConnect = _db.Database.CanConnect();
                var userCount = _db.Users.Count();

                return Ok(new
                {
                    success = true,
                    canConnect = canConnect,
                    totalUsers = userCount,
                    message = "Database connected very Good"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    inner = ex.InnerException?.Message,
                    inner2 = ex.InnerException?.InnerException?.Message
                });
            }
        }
    }
}
