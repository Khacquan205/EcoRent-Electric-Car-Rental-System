using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class LocationConfiguration : IEntityTypeConfiguration<MLocation>
{
    public void Configure(EntityTypeBuilder<MLocation> builder)
    {
        builder.ToTable("MLocation");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.Province)
               .HasColumnName("province")
               .HasMaxLength(255);

        builder.Property(x => x.District)
               .HasColumnName("district")
               .HasMaxLength(255);

        builder.Property(x => x.Ward)
               .HasColumnName("ward")
               .HasMaxLength(255);

        builder.Property(x => x.AddressDetail)
               .HasColumnName("address_detail")
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

