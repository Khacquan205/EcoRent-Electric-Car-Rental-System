using CAR.Application.Dtos.Auth;
using CAR.Application.Interfaces.Services;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CAR.Infrastructure.Services
{
    public class GoogleAuthProvider : IGoogleAuthProvider
    {
        private readonly string _clientId;
        private readonly ILogger<GoogleAuthProvider> _logger;

        public GoogleAuthProvider(IConfiguration configuration, ILogger<GoogleAuthProvider> logger)
        {
            _clientId = configuration["Google:ClientId"]
                        ?? throw new InvalidOperationException("Google:ClientId is not configured");
            _logger = logger;
        }

        public async Task<GoogleUserInfoDto?> ValidateIdTokenAsync(string idToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _clientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

                if (string.IsNullOrEmpty(payload.Email) || !payload.EmailVerified)
                {
                    _logger.LogWarning("Google token has unverified or missing email");
                    return null;
                }

                return new GoogleUserInfoDto
                {
                    Email = payload.Email,
                    GoogleId = payload.Subject,
                    Name = payload.Name ?? payload.Email.Split('@')[0],
                    AvatarUrl = payload.Picture
                };
            }
            catch (InvalidJwtException ex)
            {
                _logger.LogWarning(ex, "Invalid Google ID token");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Google ID token validation failed unexpectedly");
                return null;
            }
        }
    }
}
