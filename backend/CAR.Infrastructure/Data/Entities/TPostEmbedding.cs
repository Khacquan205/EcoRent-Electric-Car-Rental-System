using Pgvector;

namespace CAR.Infrastructure.Data.Entities
{
    /// <summary>Vector embedding cho semantic search. text-embedding-3-large = 3072 dimensions.</summary>
    public class TPostEmbedding
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public Vector? Embedding { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
