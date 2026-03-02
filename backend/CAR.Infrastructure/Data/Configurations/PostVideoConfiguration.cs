using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CAR.Infrastructure.Data.Configurations
{
    public class PostVideoConfiguration : IEntityTypeConfiguration<TPostVideo>
    {
        public void Configure(EntityTypeBuilder<TPostVideo> builder)
        {
            builder.ToTable("t_post_video");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd()
                .IsRequired();

            builder.Property(x => x.PostId)
                .HasColumnName("post_id")
                .IsRequired();

            builder.Property(x => x.VideoUrl)
                .HasColumnName("video_url")
                .HasColumnType("text")
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .HasColumnType("timestamptz")
                .IsRequired();
        }
    }
}
