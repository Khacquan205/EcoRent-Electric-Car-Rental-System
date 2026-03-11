using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class MessageConfiguration : IEntityTypeConfiguration<MMessage>
    {
        public void Configure(EntityTypeBuilder<MMessage> builder)
        {
            builder.ToTable("m_message");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(x => x.ConversationId)
                .HasColumnName("conversation_id")
                .IsRequired();

            builder.Property(x => x.SenderId)
                .HasColumnName("sender_id")
                .IsRequired();

            builder.Property(x => x.Content)
                .HasColumnName("content")
                .HasMaxLength(2000)
                .IsRequired();

            builder.Property(x => x.IsRead)
                .HasColumnName("is_read")
                .HasDefaultValue(false);

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamptz")
                .IsRequired();

            // Relationships
            builder.HasOne(x => x.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Sender)
                .WithMany()
                .HasForeignKey(x => x.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Index for paginated message query within a conversation
            builder.HasIndex(x => new { x.ConversationId, x.CreatedAt })
                .HasDatabaseName("ix_message_conversation_created");

            // Index for efficient unread count queries
            builder.HasIndex(x => new { x.ConversationId, x.SenderId, x.IsRead })
                .HasDatabaseName("ix_message_unread_lookup");
        }
    }
}
