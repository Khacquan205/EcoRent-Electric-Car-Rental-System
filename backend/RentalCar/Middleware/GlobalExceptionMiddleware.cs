using CAR.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace RentalCar.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new
            {
                Success = false,
                ErrorCode = "INTERNAL_ERROR",
                Message = "An unexpected error occurred"
            };

            switch (exception)
            {
                case UserFriendlyException userEx:
                    context.Response.StatusCode = userEx.StatusCode;
                    response = new
                    {
                        Success = false,
                        ErrorCode = userEx.ErrorCode,
                        Message = userEx.Message
                    };
                    break;

                default:
                    context.Response.StatusCode = 500;
                    // Log the full exception for debugging
                    Console.WriteLine($"Unhandled exception: {exception}");
                    break;
            }

            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }
    }
}
