using Microsoft.EntityFrameworkCore;
using CAR.Domain.Entities;

namespace CAR.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // ===== DbSet =====
        public DbSet<MUser> Users { get; set; }
        public DbSet<MRole> Roles { get; set; }
        public DbSet<MAuthentication> Authentications { get; set; }
        public DbSet<MCustomerProfile> CustomerProfiles { get; set; }
        public DbSet<MOwnerProfile> OwnerProfiles { get; set; }
        public DbSet<MLocation> Locations { get; set; }
        public DbSet<MPost> Posts { get; set; }
        public DbSet<MVehicleCategory> VehicleCategories { get; set; }
        public DbSet<TPostImage> PostImages { get; set; }
        public DbSet<MStaffProfile> StaffProfiles { get; set; }
        public DbSet<MAdvertisement> Advertisements { get; set; }
        public DbSet<MReport> Reports { get; set; }
        public DbSet<MOwnerPackage> OwnerPackages { get; set; }
        public DbSet<MPayment> Payments { get; set; }
        public DbSet<MReview> Reviews { get; set; }
        public DbSet<MSearchHistory> SearchHistories { get; set; }
        public DbSet<MVehicleVerification> VehicleVerifications { get; set; }
        public DbSet<MOwnerSubscription> OwnerSubscriptions { get; set; }
        public DbSet<MKyc> Ky { get; set; }
        public DbSet<MPhone> Phones { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Auto apply all IEntityTypeConfiguration<>
            modelBuilder.ApplyConfigurationsFromAssembly(
                typeof(UserConfiguration).Assembly
            );
        }
    }
}
