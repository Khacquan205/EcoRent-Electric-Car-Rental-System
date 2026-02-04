using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class SearchHistoryConfiguration : IEntityTypeConfiguration<MSearchHistory>
{
    public void Configure(EntityTypeBuilder<MSearchHistory> builder)
    {
        builder.ToTable("MSearchHistory");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.UserId)
               .HasColumnName("user_id");

        builder.Property(x => x.Keyword)
               .HasColumnName("keyword")
               .HasMaxLength(255);

        builder.Property(x => x.CategoryId)
               .HasColumnName("category_id");

        builder.Property(x => x.LocationId)
               .HasColumnName("location_id");

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("datetime")
               .IsRequired();

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("datetime");
    }
}
