using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PhoneConfiguration : IEntityTypeConfiguration<MPhone>
{
    public void Configure(EntityTypeBuilder<MPhone> builder)
    {
        builder.ToTable("m_phone");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .IsRequired();

        builder.Property(x => x.Phone)
               .HasColumnName("Phone")
               .HasMaxLength(20)
               .IsRequired();

        builder.Property(x => x.Otp)
               .HasColumnName("Otp")
               .HasMaxLength(10)
               .IsRequired();

        builder.Property(x => x.ExpiresAt)
               .HasColumnName("ExpiresAt")
               .IsRequired();

        builder.Property(x => x.IsUsed)
               .HasColumnName("IsUsed")
               .IsRequired();

        builder.Property(x => x.UsedAt)
               .HasColumnName("UsedAt");

        builder.Property(x => x.CustomerId)
               .HasColumnName("CustomerId")
               .IsRequired();

        builder.Property(x => x.CreatedAt)
               .HasColumnName("CreatedAt")
               .IsRequired();

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("UpdatedAt")
               .IsRequired();

        // Configure relationship with MKyc
        builder.HasOne<MKyc>()
               .WithMany()
               .HasForeignKey(x => x.CustomerId)
               .OnDelete(DeleteBehavior.Cascade);

        // Configure unique constraint on Phone
        builder.HasIndex(x => x.Phone)
               .IsUnique();
    }
}
