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
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostRequestDto request)
        {
            var userId = GetUserId();
            var result = await _postService.CreatePostAsync(userId, request);
            return Ok(result);
        }

        /// <summary>
        /// Get all posts belonging to the authenticated owner
        /// </summary>
        [HttpGet("my-posts")]
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> GetMyPosts()
        {
            var userId = GetUserId();
            var result = await _postService.GetOwnerPostsAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Get a specific post by ID
        /// </summary>
        [HttpGet("{postId}")]
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> GetPostDetail(int postId)
        {
            var userId = GetUserId();
            var result = await _postService.GetPostByIdAsync(postId, userId);
            return Ok(result);
        }

        /// <summary>
        /// Update an existing post
        /// </summary>
        [HttpPut("{postId}")]
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> UpdatePost(int postId, [FromBody] UpdatePostRequestDto request)
        {
            var userId = GetUserId();
            await _postService.UpdatePostAsync(postId, userId, request);
            return Ok(new { Success = true, Message = "Post updated and sent for re-moderation" });
        }

        /// <summary>
        /// Delete a post
        /// </summary>
        [HttpDelete("{postId}")]
        [Authorize(Roles = "OWNER")]
        public async Task<IActionResult> DeletePost(int postId)
        {
            var userId = GetUserId();
            await _postService.DeletePostAsync(postId, userId);
            return Ok(new { Success = true, Message = "Post deleted successfully" });
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid user token");
            }
            return userId;
        }
    }
}
