using CAR.Application.Interfaces;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Repositories;
using CAR.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using CAR.Infrastructure.Repositiories;

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
<<<<<<< HEAD
            services.AddScoped<IKycRepository, KycRepository>();
            services.AddScoped<IPhoneRepository, PhoneRepository>();
=======
>>>>>>> e48b1cfac175a5e2424f3e1473341d311e08a3c6

            // Services
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IFirebaseService, FirebaseService>();
<<<<<<< HEAD
            services.AddScoped<IKycOcrService, FptKycOcrService>();
            services.AddScoped<ITwilioSmsService, TwilioSmsService>();
            services.AddScoped<ICustomerService, CustomerService>();
=======
>>>>>>> e48b1cfac175a5e2424f3e1473341d311e08a3c6

            return services;
        }

        public static IServiceCollection AddApplication(
            this IServiceCollection services)
        {
<<<<<<< HEAD
            // Application Services
=======
            // Services
>>>>>>> e48b1cfac175a5e2424f3e1473341d311e08a3c6
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPostService, PostService>();
            services.AddScoped<IOwnerService, OwnerService>();
            services.AddScoped<ISubscriptionService, SubscriptionService>();
            services.AddScoped<IIdentityVerificationService, IdentityVerificationService>();
<<<<<<< HEAD
            services.AddScoped<IKycOcrService, FptKycOcrService>();
            services.AddScoped<IFirebasePhoneService, FirebasePhoneService>();
            services.AddScoped<ICustomerKycService, CustomerKycService>();
 
=======
            services.AddScoped<IOwnerPackageService, OwnerPackageService>();

>>>>>>> e48b1cfac175a5e2424f3e1473341d311e08a3c6
            return services;
        }
    }
}
