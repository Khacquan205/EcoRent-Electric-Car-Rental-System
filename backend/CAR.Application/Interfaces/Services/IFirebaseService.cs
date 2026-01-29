using CAR.Application.Dtos.Auth;

namespace CAR.Application.Interfaces.Services
{
    public interface IFirebaseService
    {
        Task<GoogleUserInfoDto> VerifyGoogleIdTokenAsync(string idToken);
    }
}
