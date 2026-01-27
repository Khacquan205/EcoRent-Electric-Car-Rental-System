using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ReportConfiguration : IEntityTypeConfiguration<MReport>
{
    public void Configure(EntityTypeBuilder<MReport> builder)
    {
        builder.ToTable("MReport");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .ValueGeneratedOnAdd()
               .IsRequired();

        builder.Property(x => x.PostId)
               .HasColumnName("post_id")
               .IsRequired();

        builder.Property(x => x.ReporterUserId)
               .HasColumnName("reporter_user_id")
               .IsRequired();

        builder.Property(x => x.Reason)
               .HasColumnName("reason")
               .IsRequired();

        builder.Property(x => x.Description)
               .HasColumnName("description")
               .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Status)
               .HasColumnName("status")
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
