using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class VehicleVerificationConfiguration : IEntityTypeConfiguration<MVehicleVerification>
{
    public void Configure(EntityTypeBuilder<MVehicleVerification> builder)
    {
        builder.ToTable("MVehicleVerification");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.PostId)
               .HasColumnName("post_id")
               .IsRequired();

        builder.Property(x => x.RegistrationImage)
               .HasColumnName("registration_image")
               .HasColumnType("nvarchar(max)");

        builder.Property(x => x.InspectionImage)
               .HasColumnName("inspection_image")
               .HasColumnType("nvarchar(max)");

        builder.Property(x => x.InsuranceImage)
               .HasColumnName("insurance_image")
               .HasColumnType("nvarchar(max)");

        builder.Property(x => x.VerifiedAt)
               .HasColumnName("verified_at")
               .HasColumnType("datetime");

        builder.Property(x => x.StaffId)
               .HasColumnName("staff_id");

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("datetime")
               .IsRequired();

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("datetime");
    }
}
