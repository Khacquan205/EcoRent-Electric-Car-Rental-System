using CAR.Domain.Entities;

namespace CAR.Application.Interfaces.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(MUser user);
        string GenerateRefreshToken();
        System.Security.Claims.ClaimsPrincipal? ValidateToken(string token);
    }
}
