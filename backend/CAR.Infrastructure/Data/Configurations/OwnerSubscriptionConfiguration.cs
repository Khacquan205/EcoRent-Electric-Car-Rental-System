using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class OwnerSubscriptionConfiguration
        : IEntityTypeConfiguration<MOwnerSubscription>
    {
        public void Configure(EntityTypeBuilder<MOwnerSubscription> builder)
        {
            builder.ToTable("MOwnerSubscription");

      
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd()
                .IsRequired();

            builder.Property(x => x.OwnerId)
                .HasColumnName("owner_id")
                .IsRequired();

            builder.Property(x => x.PackageId)
                .HasColumnName("package_id")
                .IsRequired();

     
            builder.Property(x => x.StartDate)
                .HasColumnName("start_date")
                .HasColumnType("timestamptz")
                .IsRequired();

            builder.Property(x => x.EndDate)
                .HasColumnName("end_date")
                .HasColumnType("timestamptz")
                .IsRequired();

      
            builder.Property(x => x.TotalPosts)
                .HasColumnName("total_posts")
                .IsRequired();

            builder.Property(x => x.RemainingPosts)
                .HasColumnName("remaining_posts")
                .IsRequired();

  
            builder.Property(x => x.Status)
                .HasColumnName("status")
                .IsRequired();

   
            builder.Property(x => x.Source)
                .HasColumnName("source")
                .HasMaxLength(20)
                .IsRequired();


            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamptz")
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .HasColumnType("timestamptz")
                .IsRequired();

            builder.HasIndex(x => new { x.OwnerId, x.Status });
            builder.HasIndex(x => x.EndDate);
        }
    }
}
