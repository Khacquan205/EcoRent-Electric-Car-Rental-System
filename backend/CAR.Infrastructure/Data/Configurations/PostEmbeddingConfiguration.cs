using CAR.Infrastructure.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class PostEmbeddingConfiguration : IEntityTypeConfiguration<TPostEmbedding>
    {
        public void Configure(EntityTypeBuilder<TPostEmbedding> builder)
        {
            builder.ToTable("t_post_embedding");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd()
                .IsRequired();

            builder.Property(x => x.PostId)
                .HasColumnName("post_id")
                .IsRequired();

            builder.Property(x => x.Embedding)
                .HasColumnName("embedding")
                .HasColumnType("vector(3072)");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamptz")
                .IsRequired();

            builder.HasIndex(x => x.PostId).IsUnique();
        }
    }
}
