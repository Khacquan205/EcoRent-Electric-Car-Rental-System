using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class VehicleVerificationConfiguration : IEntityTypeConfiguration<MVehicleVerification>
{
    public void Configure(EntityTypeBuilder<MVehicleVerification> builder)
    {
        builder.ToTable("m_vehicle_verification");

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
               .HasColumnType("text");

        builder.Property(x => x.InspectionImage)
               .HasColumnName("inspection_image")
               .HasColumnType("text");

        builder.Property(x => x.InsuranceImage)
               .HasColumnName("insurance_image")
               .HasColumnType("text");

        builder.Property(x => x.VerifiedAt)
               .HasColumnName("verified_at")
               .HasColumnType("timestamp");

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("timestamp")
               .IsRequired();

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("timestamp");
    }
}
