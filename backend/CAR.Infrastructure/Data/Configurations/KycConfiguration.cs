using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class KycConfiguration : IEntityTypeConfiguration<MKyc>
    {
        public void Configure(EntityTypeBuilder<MKyc> builder)
        {
            builder.ToTable("m_kyc");

            builder.HasKey(k => k.Id);

            builder.Property(k => k.Id)
                .HasColumnName("id");

            builder.Property(k => k.CustomerProfileId)
                .HasColumnName("customer_profile_id");

            builder.Property(k => k.VerificationStatus)
                .HasColumnName("verification_status")
                .IsRequired();

            builder.Property(k => k.Gender)
                .HasColumnName("gender")
                .IsRequired();

            builder.Property(k => k.FullName)
                .HasColumnName("full_name")
                .HasMaxLength(200);

            builder.Property(k => k.DateOfBirth)
                .HasColumnName("date_of_birth")
                .HasConversion(
                    v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null,
                    v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null
                );

            builder.Property(k => k.CccdNumber)
                .HasColumnName("cccd_number")
                .HasMaxLength(50);

            builder.Property(k => k.FrontDocumentUrl)
                .HasColumnName("front_document_url")
                .HasMaxLength(500);

            builder.Property(k => k.BackDocumentUrl)
                .HasColumnName("back_document_url")
                .HasMaxLength(500);

            builder.Property(k => k.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired()
                .HasConversion(v => DateTime.SpecifyKind(v, DateTimeKind.Utc), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            builder.Property(k => k.UpdatedAt)
                .HasColumnName("updated_at")
                .HasConversion(v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null, 
                                 v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

            builder.Property(k => k.VerifiedAt)
                .HasColumnName("verified_at")
                .HasConversion(v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null, 
                                 v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

            builder.HasIndex(k => k.CustomerProfileId)
                .IsUnique();

            builder.HasOne(k => k.CustomerProfile)
                .WithOne(c => c.Kyc)
                .HasForeignKey<MKyc>(k => k.CustomerProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(k => k.CccdNumber)
                .IsUnique()
                .HasFilter("\"cccd_number\" IS NOT NULL");
        }
    }
}
