using CAR.Infrastructure;
using CAR.Infrastructure.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

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
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "EcoRentAPI",
        ValidAudience = jwtSettings["Audience"] ?? "EcoRentClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});
builder.Services.AddAuthorization();

builder.Services.AddControllers();
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
    options.AddPolicy("AllowSwagger", policy =>
    {
        policy.WithOrigins("https://localhost:7179", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// DI
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

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
app.UseCors("AllowSwagger");

// Add Global Exception Middleware
app.UseMiddleware<RentalCar.Middleware.GlobalExceptionMiddleware>();

// Add Authentication middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
