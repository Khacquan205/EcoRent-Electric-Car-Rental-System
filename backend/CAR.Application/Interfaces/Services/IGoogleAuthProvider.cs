using CAR.Application.Dtos.Auth;

namespace CAR.Application.Interfaces.Services
{
    public interface IGoogleAuthProvider
    {
        Task<GoogleUserInfoDto?> ValidateIdTokenAsync(string idToken);
    }
}
