using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class PostConfiguration : IEntityTypeConfiguration<MPost>
    {
        public void Configure(EntityTypeBuilder<MPost> builder)
        {
            builder.ToTable("MPost");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd()
                .IsRequired();

            builder.Property(x => x.OwnerId)
                .HasColumnName("owner_id")
                .IsRequired();

            builder.Property(x => x.CategoryId)
                .HasColumnName("category_id")
                .IsRequired();

            builder.Property(x => x.LocationId)
                .HasColumnName("location_id");

            builder.Property(x => x.Title)
                .HasColumnName("title")
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(x => x.Description)
                .HasColumnName("description");

            builder.Property(x => x.Price)
                .HasColumnName("price")
                .HasColumnType("numeric(18,2)")
                .IsRequired();

            builder.Property(x => x.ContactPhone)
                .HasColumnName("contact_phone")
                .HasMaxLength(20);

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasColumnType("smallint")
                .IsRequired();

            builder.Property(x => x.StaffId)
                .HasColumnName("staff_id");

            builder.Property(x => x.RejectReason)
                .HasColumnName("reject_reason");

            builder.Property(x => x.PriorityLevel)
                .HasColumnName("priority_level")
                .HasColumnType("smallint")
                .IsRequired();

            builder.Property(x => x.ExpiredAt)
                .HasColumnName("expired_at")
                .HasColumnType("timestamptz");

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamptz")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamptz");
        }
    }
}
