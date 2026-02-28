using CAR.Infrastructure;
using CAR.Infrastructure.Hubs;
using CAR.Infrastructure.Options;
using CAR.Application.Interfaces.Services;
using CAR.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
var builder = WebApplication.CreateBuilder(args);

// Email config debug (do not log password)
var emailServer = builder.Configuration["EmailSettings:SmtpServer"];
var emailPort = builder.Configuration["EmailSettings:SmtpPort"];
var emailFrom = builder.Configuration["EmailSettings:SenderEmail"];
var hasEmailConfig = !string.IsNullOrWhiteSpace(emailServer)
    && !string.IsNullOrWhiteSpace(emailPort)
    && !string.IsNullOrWhiteSpace(emailFrom);

Console.WriteLine($"[Config] Email: {(hasEmailConfig ? "OK" : "MISSING")}");
if (hasEmailConfig)
{
    Console.WriteLine($"[Config] SMTP: {emailServer}:{emailPort}");
    Console.WriteLine($"[Config] From: {emailFrom}");
}

// Add Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new ArgumentNullException("JwtSettings:SecretKey");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "EcoRentAPI",
        ValidAudience = jwtSettings["Audience"] ?? "EcoRentClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero,
        // JWT payload uses short name "role"; [Authorize(Roles = "ADMIN,STAFF")] must use same type
        RoleClaimType = "role"
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // 1. Prefer Authorization: Bearer <token> header (normal HTTP APIs)
            var authHeader = context.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                context.Token = authHeader.Substring("Bearer ".Length).Trim();
                return Task.CompletedTask;
            }

            // 2. Fallback for SignalR WebSocket connections using access_token query parameter
            var accessToken = context.Request.Query["access_token"];
            if (!string.IsNullOrEmpty(accessToken) &&
                context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine("JWT ERROR: " + context.Exception.Message);
            return Task.CompletedTask;
        }
    };
});
builder.Services.AddAuthorization();
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationMiddlewareResultHandler, RentalCar.Middleware.JsonAuthorizationMiddlewareResultHandler>();

builder.Services.AddMemoryCache();
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Configure form options for file upload
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
});

builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "EcoRent API", Version = "v1" });
    
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// DI
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// Add HttpClient for FPT KYC service
builder.Services.AddHttpClient<IKycOcrService, FptKycOcrService>();

// Add Validation Filter globally
builder.Services.AddControllers(options =>
{
    options.Filters.Add<RentalCar.Filters.ValidationFilter>();
});

var app = builder.Build();

// Initialize Firebase
app.InitializeFirebase();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Add Global Exception Middleware
app.UseMiddleware<RentalCar.Middleware.GlobalExceptionMiddleware>();

// Add Authentication middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.Run();
