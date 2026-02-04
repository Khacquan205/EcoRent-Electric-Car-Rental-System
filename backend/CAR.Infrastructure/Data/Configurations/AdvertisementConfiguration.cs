using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class AdvertisementConfiguration : IEntityTypeConfiguration<MAdvertisement>
    {
        public void Configure(EntityTypeBuilder<MAdvertisement> builder)
        {
            builder.ToTable("MAdvertisement");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .HasColumnName("id")
                   .ValueGeneratedOnAdd()
                   .IsRequired();

            builder.Property(x => x.PostId)
                   .HasColumnName("post_id")
                   .IsRequired();

            builder.Property(x => x.StartDate)
                   .HasColumnName("start_date")
                   .HasColumnType("datetime")
                   .IsRequired();

            builder.Property(x => x.EndDate)
                   .HasColumnName("end_date")
                   .HasColumnType("datetime")
                   .IsRequired();

            builder.Property(x => x.Status)
                   .HasColumnName("status")
                   .HasColumnType("int")
                   .IsRequired();

            builder.Property(x => x.Price)
                   .HasColumnName("price")
                   .HasColumnType("double")
                   .IsRequired();

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("datetime")
                   .IsRequired();

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("datetime")
                   .IsRequired(false);
        }
    }
}
