using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PostImageConfiguration : IEntityTypeConfiguration<TPostImage>
{
    public void Configure(EntityTypeBuilder<TPostImage> builder)
    {
        builder.ToTable("TPostImage");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.PostId)
               .HasColumnName("post_id")
               .IsRequired();

        builder.Property(x => x.ImageUrl)
               .HasColumnName("image_url")
               .HasColumnType("nvarchar(max)")
               .IsRequired();

        builder.Property(x => x.SortOrder)
               .HasColumnName("sort_order")
               .IsRequired();

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("datetime")
               .IsRequired();

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("datetime");
    }
}
