using CAR.Application.Interfaces;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Repositories;
using CAR.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CAR.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // DbContext
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection")
                )
            );

            // Unit of Work
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            
            // Repositories
            services.AddScoped<IAuthenticationRepository, AuthenticationRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ICustomerProfileRepository, CustomerProfileRepository>();
            services.AddScoped<IOwnerProfileRepository, OwnerProfileRepository>();
            services.AddScoped<IOwnerSubscriptionRepository, OwnerSubscriptionRepository>();
            services.AddScoped<IPostRepository, PostRepository>();
            services.AddScoped<IOwnerPackageRepository, OwnerPackageRepository>();
            services.AddScoped<IRepository<Domain.Entities.MUser>, Repository<Domain.Entities.MUser>>();

            // Services
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IFirebaseService, FirebaseService>();

            return services;
        }

        public static IServiceCollection AddApplication(
            this IServiceCollection services)
        {
            // Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPostService, PostService>();
            services.AddScoped<IOwnerService, OwnerService>();
            services.AddScoped<ISubscriptionService, SubscriptionService>();
            services.AddScoped<IIdentityVerificationService, IdentityVerificationService>();
            services.AddScoped<IOwnerPackageService, OwnerPackageService>();

            return services;
        }
    }
}
