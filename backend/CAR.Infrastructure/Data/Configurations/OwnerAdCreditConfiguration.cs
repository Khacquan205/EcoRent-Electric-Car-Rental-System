using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations;

public class OwnerAdCreditConfiguration : IEntityTypeConfiguration<MOwnerAdCredit>
{
    public void Configure(EntityTypeBuilder<MOwnerAdCredit> builder)
    {
        builder.ToTable("m_owner_ad_credit");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.OwnerId).HasColumnName("owner_id").IsRequired();
        builder.Property(x => x.AdPackageId).HasColumnName("ad_package_id").IsRequired();
        builder.Property(x => x.RemainingPosts).HasColumnName("remaining_posts").IsRequired();
        builder.Property(x => x.DurationDays).HasColumnName("duration_days").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone").IsRequired();

        builder.HasOne(x => x.OwnerProfile)
            .WithMany()
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.AdPackage)
            .WithMany()
            .HasForeignKey(x => x.AdPackageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
