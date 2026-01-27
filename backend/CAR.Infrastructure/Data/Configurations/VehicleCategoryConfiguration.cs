using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class VehicleCategoryConfiguration : IEntityTypeConfiguration<MVehicleCategory>
{
    public void Configure(EntityTypeBuilder<MVehicleCategory> builder)
    {
        builder.ToTable("MVehicleCategory");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.Name)
               .HasColumnName("name")
               .HasMaxLength(255)
               .IsRequired();

        builder.Property(x => x.Description)
               .HasColumnName("description")
               .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Status)
               .HasColumnName("status")
               .HasColumnType("smallint")
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
