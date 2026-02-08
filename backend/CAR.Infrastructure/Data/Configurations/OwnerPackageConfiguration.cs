using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class OwnerPackageConfiguration : IEntityTypeConfiguration<MOwnerPackage>
{
    public void Configure(EntityTypeBuilder<MOwnerPackage> builder)
    {
        builder.ToTable("m_owner_package");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.Name)
               .HasColumnName("name")
               .HasMaxLength(255);

        builder.Property(x => x.Description)
               .HasColumnName("description")
               .HasColumnType("text");

        builder.Property(x => x.Price)
               .HasColumnName("price")
               .HasColumnType("numeric(18,2)")
               .IsRequired();

        builder.Property(x => x.DurationDays)
               .HasColumnName("duration_days")
               .IsRequired();

        builder.Property(x => x.MaxPosts)
               .HasColumnName("max_posts")
               .IsRequired();

        builder.Property(x => x.PriorityLevel)
               .HasColumnName("priority_level")
               .IsRequired();

        builder.Property(x => x.Status)
               .HasColumnName("status")
               .IsRequired();

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("timestamp")
               .IsRequired();

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("timestamp");
    }
}
