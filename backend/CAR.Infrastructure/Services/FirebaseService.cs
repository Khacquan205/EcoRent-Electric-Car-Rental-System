using CAR.Application.Dtos.Auth;
using CAR.Application.Interfaces.Services;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Microsoft.Extensions.Logging;

namespace CAR.Infrastructure.Services
{
    /// <summary>
    /// Verify Firebase ID tokens (from signInWithPopup). Không dùng GoogleJsonWebSignature vì
    /// Firebase token có issuer/aud khác Google OAuth token - phải dùng Firebase Admin SDK.
    /// </summary>
    public class FirebaseService : IFirebaseService
    {
        private readonly ILogger<FirebaseService> _logger;

        public FirebaseService(ILogger<FirebaseService> logger)
        {
            _logger = logger;
        }

        public async Task<GoogleUserInfoDto> VerifyGoogleIdTokenAsync(string idToken)
        {
            if (FirebaseApp.DefaultInstance == null)
            {
                _logger.LogError("Firebase chưa được khởi tạo. Kiểm tra serviceAccountKey.json");
                throw new InvalidOperationException("Firebase is not configured");
            }

            var auth = FirebaseAuth.GetAuth(FirebaseApp.DefaultInstance);

            FirebaseToken decodedToken;
            try
            {
                decodedToken = await auth.VerifyIdTokenAsync(idToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Invalid or expired Firebase ID token");
                throw new InvalidOperationException("Invalid or expired Google token. Please sign in with Google again.");
            }

            decodedToken.Claims.TryGetValue("email", out var emailObj);
            decodedToken.Claims.TryGetValue("email_verified", out var emailVerifiedObj);
            decodedToken.Claims.TryGetValue("name", out var nameObj);
            decodedToken.Claims.TryGetValue("picture", out var pictureObj);

            var email = emailObj?.ToString();
            if (string.IsNullOrEmpty(email) || emailVerifiedObj?.ToString() != "True")
            {
                _logger.LogWarning("Firebase token has unverified or missing email");
                throw new InvalidOperationException("Invalid Google ID token: email not verified");
            }

            return new GoogleUserInfoDto
            {
                Email = email,
                GoogleId = decodedToken.Uid,
                Name = nameObj?.ToString() ?? email.Split('@')[0],
                AvatarUrl = pictureObj?.ToString()
            };
        }
    }
}
