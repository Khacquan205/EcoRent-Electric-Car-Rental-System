using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class KycConfiguration : IEntityTypeConfiguration<MKyc>
    {
        public void Configure(EntityTypeBuilder<MKyc> builder)
        {
            builder.ToTable("MKyc");

            builder.HasKey(k => k.id);

            builder.Property(k => k.VerificationStatus)
                .IsRequired();

            builder.Property(k => k.Gender)
                .IsRequired();

            builder.Property(k => k.FullName)
                .HasMaxLength(200);

            builder.Property(k => k.DateOfBirth)
                .HasConversion(
                    v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null,
                    v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null
                );

            builder.Property(k => k.CccdNumber)
                .HasMaxLength(50);

            builder.Property(k => k.FrontDocumentUrl)
                .HasMaxLength(500);

            builder.Property(k => k.BackDocumentUrl)
                .HasMaxLength(500);

            builder.Property(k => k.CreatedAt)
                .IsRequired()
                .HasConversion(v => DateTime.SpecifyKind(v, DateTimeKind.Utc), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            builder.Property(k => k.UpdatedAt)
                .HasConversion(v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null, 
                                 v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

            builder.Property(k => k.VerifiedAt)
                .HasConversion(v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null, 
                                 v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

            builder.HasIndex(k => k.CustomerId)
                .IsUnique();

            builder.HasIndex(k => k.CccdNumber)
                .IsUnique()
                .HasFilter("CccdNumber IS NOT NULL");
        }
    }
}
