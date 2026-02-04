using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class OwnerProfileConfiguration : IEntityTypeConfiguration<MOwnerProfile>
{
    public void Configure(EntityTypeBuilder<MOwnerProfile> builder)
    {
        builder.ToTable("MOwnerProfile");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.UserId)
               .HasColumnName("user_id")
               .IsRequired();

        builder.Property(x => x.Name)
               .HasColumnName("name")
               .HasMaxLength(255);

        builder.Property(x => x.Phone)
               .HasColumnName("phone")
               .HasMaxLength(20);

        builder.Property(x => x.IdentityVerified)
               .HasColumnName("identity_verified")
               .IsRequired();

        builder.Property(x => x.RatingAvg)
               .HasColumnName("rating_avg")
               .HasColumnType("double")
               .IsRequired();

        builder.Property(x => x.TotalPosts)
               .HasColumnName("total_posts")
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
