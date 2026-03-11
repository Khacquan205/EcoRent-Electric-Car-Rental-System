using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class ConversationConfiguration : IEntityTypeConfiguration<MConversation>
    {
        public void Configure(EntityTypeBuilder<MConversation> builder)
        {
            builder.ToTable("m_conversation");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.User1Id)
                .HasColumnName("user1_id")
                .IsRequired();

            builder.Property(x => x.User2Id)
                .HasColumnName("user2_id")
                .IsRequired();

            builder.Property(x => x.PostId)
                .HasColumnName("post_id");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamptz")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamptz");

            // Relationships
            builder.HasOne(x => x.User1)
                .WithMany()
                .HasForeignKey(x => x.User1Id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.User2)
                .WithMany()
                .HasForeignKey(x => x.User2Id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Post)
                .WithMany()
                .HasForeignKey(x => x.PostId)
                .OnDelete(DeleteBehavior.SetNull);

            // Unique constraint for (User1Id, User2Id, PostId) when PostId IS NOT NULL
            builder.HasIndex(x => new { x.User1Id, x.User2Id, x.PostId })
                .IsUnique()
                .HasFilter("post_id IS NOT NULL")
                .HasDatabaseName("ix_conversation_user1_user2_post_notnull");

            // Unique constraint for (User1Id, User2Id) when PostId IS NULL
            builder.HasIndex(x => new { x.User1Id, x.User2Id })
                .IsUnique()
                .HasFilter("post_id IS NULL")
                .HasDatabaseName("ix_conversation_user1_user2_post_null");

            // Index for listing user conversations sorted by activity
            builder.HasIndex(x => x.UpdatedAt)
                .HasDatabaseName("ix_conversation_updated_at");
        }
    }
}
