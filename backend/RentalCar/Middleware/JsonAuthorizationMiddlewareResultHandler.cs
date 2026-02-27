using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using System.Text.Json;
using System.Threading.Tasks;

namespace RentalCar.Middleware
{
    /// <summary>
    /// Returns consistent JSON bodies for 401 Unauthorized and 403 Forbidden
    /// instead of empty responses.
    /// </summary>
    public class JsonAuthorizationMiddlewareResultHandler : IAuthorizationMiddlewareResultHandler
    {
        private readonly AuthorizationMiddlewareResultHandler _defaultHandler = new();

        public async Task HandleAsync(
            RequestDelegate next,
            HttpContext context,
            AuthorizationPolicy policy,
            PolicyAuthorizationResult authorizeResult)
        {
            if (authorizeResult.Challenged)
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                var body = new { status = 401, message = "Unauthorized" };
                await context.Response.WriteAsync(JsonSerializer.Serialize(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
                return;
            }

            if (authorizeResult.Forbidden)
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";
                var body = new { status = 403, message = "Forbidden - insufficient permissions" };
                await context.Response.WriteAsync(JsonSerializer.Serialize(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
                return;
            }

            await _defaultHandler.HandleAsync(next, context, policy, authorizeResult);
        }
    }
}
