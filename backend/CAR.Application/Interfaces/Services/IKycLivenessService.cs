using CAR.Application.Dtos;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IKycLivenessService
    {
        Task<KycLivenessResponseDto> ProcessLivenessCheckAsync(KycLivenessRequestDto request);

        /// <summary>
        /// Face verification by selfie upload (fallback when live camera fails).
        /// Reuses ID card face from store and same matching threshold (0.75).
        /// </summary>
        Task<KycLivenessResponseDto> ProcessSelfieMatchAsync(KycSelfieMatchRequestDto request);
    }

    public interface IVideoTranscoder
    {
        Task<Stream> TranscodeToMp4Async(Stream input, CancellationToken cancellationToken);
    }
}
