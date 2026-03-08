using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations;

public class AdOrderConfiguration : IEntityTypeConfiguration<MAdOrder>
{
    public void Configure(EntityTypeBuilder<MAdOrder> builder)
    {
        builder.ToTable("m_ad_order");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
        builder.Property(x => x.OwnerId).HasColumnName("owner_id").IsRequired();
        builder.Property(x => x.AdPackageId).HasColumnName("ad_package_id").IsRequired();
        builder.Property(x => x.Amount).HasColumnName("amount").HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(x => x.Status).HasColumnName("status").HasColumnType("smallint").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");

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
