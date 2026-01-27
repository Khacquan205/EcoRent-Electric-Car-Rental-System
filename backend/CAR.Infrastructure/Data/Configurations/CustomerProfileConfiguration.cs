using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CustomerProfileConfiguration : IEntityTypeConfiguration<MCustomerProfile>
{
    public void Configure(EntityTypeBuilder<MCustomerProfile> builder)
    {
        builder.ToTable("MCustomerProfile");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.UserId)
               .HasColumnName("user_id")
               .IsRequired();

        builder.Property(x => x.Name)
               .HasColumnName("name")
               .HasMaxLength(255);

        builder.Property(x => x.Phone)
               .HasColumnName("phone")
               .HasMaxLength(20);

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("datetime")
               .IsRequired();

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("datetime");
    }
}
