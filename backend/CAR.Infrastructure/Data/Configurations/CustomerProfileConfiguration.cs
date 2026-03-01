using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CustomerProfileConfiguration : IEntityTypeConfiguration<MCustomerProfile>
{
    public void Configure(EntityTypeBuilder<MCustomerProfile> builder)
    {
        builder.ToTable("m_customer_profile");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.UserId)
               .HasColumnName("user_id")
               .IsRequired();

        builder.Property(x => x.DisplayName)
               .HasColumnName("display_name")
               .HasMaxLength(255);

        builder.Property(x => x.Address)
               .HasColumnName("address")
               .HasMaxLength(500);

        builder.Property(x => x.Latitude)
               .HasColumnName("latitude")
               .HasColumnType("double precision");

        builder.Property(x => x.Longitude)
               .HasColumnName("longitude")
               .HasColumnType("double precision");

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("timestamp with time zone")
               .IsRequired()
               .HasConversion(v => DateTime.SpecifyKind(v, DateTimeKind.Utc), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("timestamp with time zone")
               .HasConversion(v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null,
                                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);
    }
}
