using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations;

public class AdPackageConfiguration : IEntityTypeConfiguration<MAdPackage>
{
    public void Configure(EntityTypeBuilder<MAdPackage> builder)
    {
        builder.ToTable("m_ad_package");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(255).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description").HasMaxLength(500);
        builder.Property(x => x.Price).HasColumnName("price").HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.DurationDays).HasColumnName("duration_days").IsRequired();
        builder.Property(x => x.MaxPosts).HasColumnName("max_posts").IsRequired();
        builder.Property(x => x.PriorityLevel).HasColumnName("priority_level").IsRequired();
        builder.Property(x => x.Status).HasColumnName("status").HasColumnType("smallint").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");
    }
}
