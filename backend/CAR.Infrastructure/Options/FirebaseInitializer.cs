using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CAR.Infrastructure.Options
{
    public static class FirebaseInitializer
    {
        public static IHost InitializeFirebase(this IHost host)
        {
            var configuration = host.Services.GetRequiredService<IConfiguration>();
            var loggerFactory = host.Services.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger("FirebaseInitializer");
            
            try
            {
                // Check if Firebase app is already initialized
                if (FirebaseApp.DefaultInstance != null)
                {
                    logger.LogInformation("Firebase app already initialized");
                    return host;
                }

                var serviceAccountPath = configuration["Firebase:ServiceAccountKeyPath"] 
                    ?? "serviceAccountKey.json";
                
                // Try absolute path if relative doesn't exist
                if (!File.Exists(serviceAccountPath))
                {
                    var currentDirectory = Directory.GetCurrentDirectory();
                    serviceAccountPath = Path.Combine(currentDirectory, serviceAccountPath);
                }
                
                if (File.Exists(serviceAccountPath))
                {
                    var credential = GoogleCredential.FromFile(serviceAccountPath);
                    FirebaseApp.Create(new AppOptions
                    {
                        Credential = credential
                    });
                    
                    logger.LogInformation("Firebase initialized successfully");
                }
                else
                {
                    logger.LogWarning($"Firebase service account key not found at: {serviceAccountPath}. Google login will not be available.");
                    // Don't throw exception - allow app to start without Firebase
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to initialize Firebase");
                // Don't throw exception - allow app to start without Firebase
            }

            return host;
        }
    }
}
