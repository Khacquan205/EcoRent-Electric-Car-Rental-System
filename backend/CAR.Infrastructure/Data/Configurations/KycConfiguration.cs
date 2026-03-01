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
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd();

            builder.Property(k => k.OwnerProfileId)
                   .HasColumnName("owner_profile_id")
                   .IsRequired();

            builder.Property(k => k.VerificationStatus)
                   .HasColumnName("verification_status")
                   .IsRequired();

            builder.Property(k => k.IdCardNumber)
                   .HasColumnName("id_card_number")
                   .HasMaxLength(50);

            builder.Property(k => k.FullName)
                   .HasColumnName("full_name")
                   .HasMaxLength(200);

            builder.Property(k => k.DateOfBirth)
                   .HasColumnName("date_of_birth")
                   .HasColumnType("timestamp");

            builder.Property(k => k.FrontDocumentUrl)
                   .HasColumnName("front_document_url")
                   .HasMaxLength(500);

            builder.Property(k => k.BackDocumentUrl)
                   .HasColumnName("back_document_url")
                   .HasMaxLength(500);

            builder.Property(k => k.RejectionReason)
                   .HasColumnName("rejection_reason")
                   .HasMaxLength(1000);

            builder.Property(k => k.VerifiedAt)
                   .HasColumnName("verified_at")
                   .HasColumnType("timestamp");

            builder.Property(k => k.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp")
                   .IsRequired();

            builder.Property(k => k.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp");

            builder.HasIndex(k => k.OwnerProfileId)
                   .IsUnique();

            builder.HasIndex(k => k.IdCardNumber)
                   .IsUnique()
                   .HasFilter("id_card_number IS NOT NULL");

            builder.HasOne(k => k.OwnerProfile)
                   .WithOne(o => o.Kyc)
                   .HasForeignKey<MKyc>(k => k.OwnerProfileId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
