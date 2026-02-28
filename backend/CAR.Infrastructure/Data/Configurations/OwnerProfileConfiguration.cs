using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class OwnerProfileConfiguration : IEntityTypeConfiguration<MOwnerProfile>
{
    public void Configure(EntityTypeBuilder<MOwnerProfile> builder)
    {
        builder.ToTable("m_owner_profile");

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

        builder.Property(x => x.FullName)
               .HasColumnName("full_name")
               .HasMaxLength(200);

        builder.Property(x => x.DateOfBirth)
               .HasColumnName("date_of_birth")
               .HasColumnType("timestamp with time zone");

        builder.Property(x => x.Gender)
               .HasColumnName("gender")
               .HasColumnType("integer")
               .IsRequired();

        builder.Property(x => x.IdNumber)
               .HasColumnName("id_number")
               .HasMaxLength(50);

        builder.Property(x => x.Phone)
               .HasColumnName("phone")
               .HasMaxLength(20);

        builder.Property(x => x.IdentityVerified)
               .HasColumnName("identity_verified")
               .IsRequired();

        builder.Property(x => x.RatingAvg)
               .HasColumnName("rating_avg")
               .HasColumnType("numeric(18,2)")
               .IsRequired();

        builder.Property(x => x.TotalPosts)
               .HasColumnName("total_posts")
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
