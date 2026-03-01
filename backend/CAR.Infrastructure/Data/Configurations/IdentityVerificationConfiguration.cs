using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class IdentityVerificationConfiguration : IEntityTypeConfiguration<MIdentityVerification>
    {
        public void Configure(EntityTypeBuilder<MIdentityVerification> builder)
        {
            builder.ToTable("m_identity_verification");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id).HasColumnName("id").ValueGeneratedOnAdd();
            builder.Property(e => e.OwnerProfileId).HasColumnName("owner_profile_id").IsRequired();
            builder.Property(e => e.Status).HasColumnName("status").IsRequired().HasMaxLength(50);
            builder.Property(e => e.Score).HasColumnName("score").HasColumnType("numeric(18,2)");
            builder.Property(e => e.VerifiedAt).HasColumnName("verified_at").HasColumnType("timestamp");
            builder.Property(e => e.RejectReason).HasColumnName("reject_reason").HasMaxLength(1000);
            builder.Property(e => e.FrontDocumentUrl).HasColumnName("front_document_url").HasMaxLength(500);
            builder.Property(e => e.BackDocumentUrl).HasColumnName("back_document_url").HasMaxLength(500);
            builder.Property(e => e.SelfieUrl).HasColumnName("selfie_url").HasMaxLength(500);
            builder.Property(e => e.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp").IsRequired();
            builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp");

            builder.HasIndex(e => e.OwnerProfileId).IsUnique();

            builder.HasOne(e => e.OwnerProfile)
                .WithOne(o => o.IdentityVerification)
                .HasForeignKey<MIdentityVerification>(e => e.OwnerProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
