using CAR.Application.Interfaces;
using CAR.Application.Interfaces.Repositories;
using CAR.Application.Interfaces.Services;
using CAR.Infrastructure.Data;
using CAR.Infrastructure.Options;
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
            // DbContext with retry for transient failures (e.g. remote DB like Render, connection drops)
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    npgsqlOptions =>
                    {
                        npgsqlOptions.MigrationsAssembly("CAR.Infrastructure");
                        npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
                    }
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
            services.AddScoped<IKycRepository, KycRepository>();
            services.AddScoped<IPhoneRepository, PhoneRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IVehicleCategoryRepository, VehicleCategoryRepository>();
            services.AddScoped<ILocationRepository, LocationRepository>();
            services.AddScoped<IStaffProfileRepository, StaffProfileRepository>();
            services.AddScoped<IAdPackageRepository, AdPackageRepository>();
            services.AddScoped<IOwnerAdCreditRepository, OwnerAdCreditRepository>();
            services.AddScoped<IAdvertisementRepository, AdvertisementRepository>();
            services.AddScoped<IAdOrderRepository, AdOrderRepository>();

            // VNPay options
            services.Configure<VnPaySettings>(configuration.GetSection(VnPaySettings.SectionName));
            services.Configure<GeminiSettings>(configuration.GetSection(GeminiSettings.SectionName));
            services.AddHttpClient();

            // Services
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IFirebaseService, FirebaseService>();
            services.AddScoped<IGoogleAuthProvider, GoogleAuthProvider>();
            services.AddScoped<IKycOcrService, FptKycOcrService>();

            // KYC Liveness Service is registered in Program.cs based on KYC:LivenessProvider
            services.AddScoped<IVideoTranscoder, FfmpegVideoTranscoder>();
            services.AddScoped<IKycFaceStore, FileKycFaceStore>();
            services.AddScoped<ITwilioSmsService, TwilioSmsService>();
            services.AddScoped<ICustomerService, CustomerService>();
            services.AddScoped<IPaymentService, VnPayService>();
            services.AddScoped<INotificationService, SignalRNotificationService>();
            services.AddScoped<IOwnerKycService, OwnerKycService>();

            return services;
        }

        public static IServiceCollection AddApplication(
            this IServiceCollection services)
        {
            // Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPostService, PostService>();
            services.AddScoped<IPostModerationService, PostModerationService>();
            services.AddScoped<IAdminAccountService, AdminAccountService>();
            services.AddScoped<ISubscriptionService, SubscriptionService>();
            services.AddScoped<IKycOcrService, FptKycOcrService>();
            services.AddScoped<IFirebasePhoneService, FirebasePhoneService>();
            services.AddScoped<IOwnerPackageService, OwnerPackageService>();
            services.AddScoped<IAdPackageService, AdPackageService>();
            services.AddScoped<IOwnerAdvertisementService, OwnerAdvertisementService>();
            services.AddScoped<ICarSuggestionChatService, CarSuggestionChatService>();

            return services;
        }
    }
}
