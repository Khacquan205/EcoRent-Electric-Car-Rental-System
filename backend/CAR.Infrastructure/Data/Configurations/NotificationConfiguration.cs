using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<MNotification>
    {
        public void Configure(EntityTypeBuilder<MNotification> builder)
        {
            builder.ToTable("m_notification");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.UserId)
                   .HasColumnName("user_id")
                   .IsRequired();

            builder.Property(x => x.PostId)
                   .HasColumnName("post_id");

            builder.Property(x => x.Title)
                   .HasColumnName("title")
                   .HasMaxLength(200)
                   .IsRequired();

            builder.Property(x => x.Message)
                   .HasColumnName("message")
                   .HasMaxLength(1000)
                   .IsRequired();

            builder.Property(x => x.IsRead)
                   .HasColumnName("is_read")
                   .HasDefaultValue(false);

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp")
                   .IsRequired();

            builder.HasOne(x => x.User)
                   .WithMany()
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Post)
                   .WithMany()
                   .HasForeignKey(x => x.PostId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
