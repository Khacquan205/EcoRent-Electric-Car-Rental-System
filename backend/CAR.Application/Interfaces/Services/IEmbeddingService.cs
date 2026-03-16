namespace CAR.Application.Interfaces.Services
{
    /// <summary>Generate embeddings (text-embedding-3-small) for semantic search.</summary>
    public interface IEmbeddingService
    {
        Task<float[]?> GetEmbeddingAsync(string text);
    }
}
