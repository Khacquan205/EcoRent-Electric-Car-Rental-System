using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ReviewConfiguration : IEntityTypeConfiguration<MReview>
{
    public void Configure(EntityTypeBuilder<MReview> builder)
    {
        builder.ToTable("MReview");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.PostId)
               .HasColumnName("post_id")
               .IsRequired();

        builder.Property(x => x.ReviewerId)
               .HasColumnName("reviewer_id")
               .IsRequired();

        builder.Property(x => x.OwnerId)
               .HasColumnName("owner_id")
               .IsRequired();

        builder.Property(x => x.Rating)
               .HasColumnName("rating")
               .IsRequired();

        builder.Property(x => x.Comment)
               .HasColumnName("comment")
               .HasColumnType("nvarchar(max)");

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("datetime")
               .IsRequired();

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("datetime");
    }
}
