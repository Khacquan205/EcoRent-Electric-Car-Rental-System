using CAR.Application.Dtos;
using CAR.Domain.Entities;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Repositories
{
    public interface IPostRepository : IRepository<MPost>
    {
        Task<MPost> CreatePendingPostAsync(CreatePostRequestDto request, long ownerId, DateTime currentTime);
    }
}
