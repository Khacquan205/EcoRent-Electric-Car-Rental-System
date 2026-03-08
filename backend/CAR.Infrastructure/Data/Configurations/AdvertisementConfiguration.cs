using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class AdvertisementConfiguration : IEntityTypeConfiguration<MAdvertisement>
    {
        public void Configure(EntityTypeBuilder<MAdvertisement> builder)
        {
            builder.ToTable("m_advertisement");

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
                   .HasColumnType("timestamp")
                   .IsRequired();

            builder.Property(x => x.EndDate)
                   .HasColumnName("end_date")
                   .HasColumnType("timestamp")
                   .IsRequired();

            builder.Property(x => x.Status)
                   .HasColumnName("status")
                   .HasColumnType("int")
                   .IsRequired();

            builder.Property(x => x.Price)
                   .HasColumnName("price")
                   .HasColumnType("numeric(18,2)")
                   .IsRequired();

            builder.Property(x => x.PriorityLevel)
                   .HasColumnName("priority_level")
                   .IsRequired();

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasColumnType("timestamp")
                   .IsRequired();

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at")
                   .HasColumnType("timestamp")
                   .IsRequired(false);
        }
    }
}
