using CAR.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Threading.Tasks;

namespace CAR.Infrastructure.Services
{
    public class FileKycFaceStore : IKycFaceStore
    {
        private readonly string _faceStoragePath;
        private readonly ILogger<FileKycFaceStore> _logger;

        public FileKycFaceStore(IConfiguration configuration, ILogger<FileKycFaceStore> logger)
        {
            _faceStoragePath = configuration["KYC:FaceStoragePath"] ?? Path.Combine("storage", "faces");
            _logger = logger;
            
            // Ensure directory exists
            Directory.CreateDirectory(_faceStoragePath);
        }

        public async Task<string> SaveFaceAsync(Stream faceStream, string userId)
        {
            try
            {
                var faceId = $"{userId}_{Guid.NewGuid():N}.jpg";
                var filePath = Path.Combine(_faceStoragePath, faceId);

                using var fileStream = new FileStream(filePath, FileMode.Create);
                await faceStream.CopyToAsync(fileStream);

                _logger.LogInformation("Face saved successfully: {FaceId}", faceId);
                return faceId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving face for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<Stream> LoadFaceAsync(string faceId)
        {
            try
            {
                var filePath = Path.Combine(_faceStoragePath, faceId);
                
                if (!File.Exists(filePath))
                {
                    _logger.LogWarning("Face file not found: {FaceId}", faceId);
                    return null;
                }

                var memoryStream = new MemoryStream();
                using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                await fileStream.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                return memoryStream;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading face: {FaceId}", faceId);
                throw;
            }
        }

        public async Task<bool> DeleteFaceAsync(string faceId)
        {
            try
            {
                var filePath = Path.Combine(_faceStoragePath, faceId);
                
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger.LogInformation("Face deleted successfully: {FaceId}", faceId);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting face: {FaceId}", faceId);
                return false;
            }
        }
    }
}
