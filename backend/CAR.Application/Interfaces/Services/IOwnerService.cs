using CAR.Application.Dtos;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IOwnerService
    {
        Task<RegisterOwnerResponseDto> RegisterOwnerAsync(int userId, RegisterOwnerRequestDto request);
    }
}
