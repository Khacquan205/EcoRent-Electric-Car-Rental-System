using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class PostConfiguration : IEntityTypeConfiguration<MPost>
    {
        public void Configure(EntityTypeBuilder<MPost> builder)
        {
            // TABLE
            builder.ToTable("MPost");

            // PRIMARY KEY
            builder.HasKey(x => x.Id);

            // ID
            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd()
                   .IsRequired();

            // OWNER ID
            builder.Property(x => x.OwnerId)
                   .HasColumnName("owner_id")
                   .IsRequired();

            // CATEGORY ID
            builder.Property(x => x.CategoryId)
                   .HasColumnName("category_id")
                   .IsRequired();

            // LOCATION ID (nullable)
            builder.Property(x => x.LocationId)
                   .HasColumnName("location_id")
                   .IsRequired(false);

            // TITLE
            builder.Property(x => x.Title)
                   .HasColumnName("title")
                   .HasMaxLength(255)
                   .IsRequired();

            // DESCRIPTION
            builder.Property(x => x.Description)
                   .HasColumnName("description")
                   .HasColumnType("nvarchar(max)")
                   .IsRequired(false);

            // PRICE
            builder.Property(x => x.Price)
                   .HasColumnName("price")
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            // CONTACT PHONE
            builder.Property(x => x.ContactPhone)
                   .HasColumnName("contact_phone")
                   .HasMaxLength(20)
                   .IsRequired(false);

            // STATUS
            builder.Property(x => x.Status)
                   .HasColumnName("status")
                   .HasColumnType("smallint")
                   .IsRequired();

            // PRIORITY LEVEL
            builder.Property(x => x.PriorityLevel)
                   .HasColumnName("priority_level")
                   .HasColumnType("smallint")
                   .IsRequired();

            // EXPIRED AT (nullable)
            builder.Property(x => x.ExpiredAt)
                   .HasColumnName("expired_at")
                   .HasColumnType("datetime")
                   .IsRequired(false);

            // CREATED AT
            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("datetime")
                   .IsRequired();

            // UPDATED AT (nullable)
            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("datetime")
                   .IsRequired(false);
        }
    }
}
