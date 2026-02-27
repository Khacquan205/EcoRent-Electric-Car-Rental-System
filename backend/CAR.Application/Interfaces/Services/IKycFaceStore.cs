using System.IO;
using System.Threading.Tasks;

namespace CAR.Application.Interfaces.Services
{
    public interface IKycFaceStore
    {
        Task<string> SaveFaceAsync(Stream faceStream, string userId);
        Task<Stream> LoadFaceAsync(string faceId);
        Task<bool> DeleteFaceAsync(string faceId);
    }
}
