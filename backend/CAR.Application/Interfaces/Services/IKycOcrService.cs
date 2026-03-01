using CAR.Application.Dtos;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IKycOcrService
    {
        Task<KycOcrResponseDto> ProcessOcrAsync(KycOcrRequestDto request);
    }
}
