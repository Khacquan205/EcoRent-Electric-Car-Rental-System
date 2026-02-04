using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CAR.Application.Dtos;
using CAR.Application.Interfaces.Services;

namespace CAR.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostController(IPostService postService)
        {
            _postService = postService;
        }

        /// <summary>
        /// Create a new post
        /// </summary>
        [HttpPost("create-post")]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostRequestDto request)
        {
            // Get userId from JWT claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { Success = false, Message = "Invalid user token" });
            }

            var result = await _postService.CreatePostAsync(userId, request);
            return Ok(result);
        }
    }
}
