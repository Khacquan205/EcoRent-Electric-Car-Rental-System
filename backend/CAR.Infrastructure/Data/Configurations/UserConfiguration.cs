using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserConfiguration : IEntityTypeConfiguration<MUser>
{
    public void Configure(EntityTypeBuilder<MUser> builder)
    {
        builder.ToTable("m_user");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .IsRequired();

        builder.Property(x => x.RoleId)
               .HasColumnName("role_id")
               .IsRequired();

        builder.Property(x => x.Email)
               .HasColumnName("email")
               .HasMaxLength(255)
               .IsRequired();

        builder.Property(x => x.PasswordHash)
               .HasColumnName("password_hash")
               .HasMaxLength(255)
               .IsRequired();

        builder.Property(x => x.Status)
               .HasColumnName("status")
               .HasColumnType("smallint")
               .IsRequired();

        builder.Property(x => x.LoginProvider)
               .HasColumnName("login_provider")
               .HasMaxLength(50)
               .IsRequired()
               .HasDefaultValue("Local");

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("timestamp with time zone")
               .IsRequired()
               .HasDefaultValueSql("NOW() AT TIME ZONE 'utc'"); // PostgreSQL UTC default

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("timestamp with time zone")
               .HasDefaultValueSql("NOW() AT TIME ZONE 'utc'"); // PostgreSQL UTC default
    }
}
