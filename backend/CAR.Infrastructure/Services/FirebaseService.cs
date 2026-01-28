using CAR.Application.Dtos.Auth;
using CAR.Application.Interfaces.Services;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;

namespace CAR.Infrastructure.Services
{
    public class FirebaseService : IFirebaseService
    {
        private readonly IConfiguration _configuration;

        public FirebaseService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<GoogleUserInfoDto> VerifyGoogleIdTokenAsync(string idToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new[] { _configuration["Firebase:ProjectId"] }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
                
                return new GoogleUserInfoDto
                {
                    Email = payload.Email,
                    GoogleId = payload.Subject,
                    Name = payload.Name,
                    AvatarUrl = payload.Picture
                };
            }
            catch
            {
                throw new InvalidOperationException("Invalid Google ID token");
            }
        }
    }
}
