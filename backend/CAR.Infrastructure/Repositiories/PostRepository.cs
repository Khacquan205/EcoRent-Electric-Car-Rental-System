using CAR.Application.Dtos;
using CAR.Application.Interfaces.Repositories;
using CAR.Domain.Entities;
using CAR.Infrastructure.Data;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Repositories
{
    public class PostRepository : Repository<MPost>, IPostRepository
    {
        public PostRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<MPost> CreatePendingPostAsync(CreatePostRequestDto request, long ownerId, DateTime currentTime)
        {
            var post = new MPost
            {
                OwnerId = ownerId,
                CategoryId = request.CategoryId,
                LocationId = request.LocationId,
                Title = request.Title,
                Description = request.Description,
                Price = request.Price,
                ContactPhone = request.ContactPhone,
                Status = 0, // PENDING
                StaffId = null,
                PriorityLevel = 0,
                CreatedAt = currentTime
            };

            await _dbSet.AddAsync(post);
            return post;
        }
    }
}
