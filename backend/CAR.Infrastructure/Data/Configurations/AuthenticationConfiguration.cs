using CAR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class AuthenticationConfiguration : IEntityTypeConfiguration<MAuthentication>
{
    public void Configure(EntityTypeBuilder<MAuthentication> builder)
    {
        builder.ToTable("MAuthentication");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
               .HasColumnName("id")
               .IsRequired();

        builder.Property(x => x.UserId)
               .HasColumnName("user_id")
               .IsRequired();

        builder.Property(x => x.Name)
               .HasColumnName("Name");

        builder.Property(x => x.Email)
               .HasColumnName("email")
               .HasMaxLength(255)
               .IsRequired();

        builder.Property(x => x.PasswordHash)
               .HasColumnName("password_hash")
               .HasMaxLength(500)
               .IsRequired();

        builder.Property(x => x.GoogleId)
               .HasColumnName("google_id")
               .HasMaxLength(255);

        builder.Property(x => x.FirebaseToken)
               .HasColumnName("firebase_token")
               .HasColumnType("text");

        builder.Property(x => x.Code)
               .HasColumnName("code")
               .HasMaxLength(500);

        builder.Property(x => x.CodeExpiresAt)
               .HasColumnName("code_expires_at")
               .HasColumnType("timestamptz");

        builder.Property(x => x.CodeIsUsed)
               .HasColumnName("code_is_used")
               .IsRequired();

        builder.Property(x => x.CodeIsRevoked)
               .HasColumnName("code_is_revoked")
               .IsRequired();

        builder.Property(x => x.AuthType)
               .HasColumnName("auth_type")
               .HasColumnType("smallint")
               .IsRequired();

        builder.Property(x => x.AuthProvider)
               .HasColumnName("auth_provider")
               .HasColumnType("smallint")
               .IsRequired();

        builder.Property(x => x.IsActive)
               .HasColumnName("is_active")
               .IsRequired();

        builder.Property(x => x.CreatedAt)
               .HasColumnName("created_at")
               .HasColumnType("timestamptz")
               .IsRequired()
               .HasDefaultValueSql("NOW() AT TIME ZONE 'utc'"); // PostgreSQL UTC default

        builder.Property(x => x.UpdatedAt)
               .HasColumnName("updated_at")
               .HasColumnType("timestamptz")
               .HasDefaultValueSql("NOW() AT TIME ZONE 'utc'"); // PostgreSQL UTC default

        // Configure relationship with MUser
        builder.HasOne<MUser>()
               .WithOne()
               .HasForeignKey<MAuthentication>(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
