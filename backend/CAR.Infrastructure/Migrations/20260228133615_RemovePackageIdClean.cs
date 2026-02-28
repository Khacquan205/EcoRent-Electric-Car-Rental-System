using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovePackageIdClean : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Chỉ xóa cột package_id và FK trên m_post (nếu có). Database đã có sẵn các bảng.
            migrationBuilder.Sql(@"
                ALTER TABLE m_post DROP CONSTRAINT IF EXISTS ""FK_m_post_m_owner_subscription_package_id"";
                ALTER TABLE m_post DROP COLUMN IF EXISTS package_id;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Không khôi phục package_id (đã loại bỏ khỏi model).
        }
    }
}
