using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Seed_Correct_Roles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "m_role",
                columns: new[] { "id", "code", "name", "description", "status", "created_at", "updated_at" },
                values: new object[,]
                {
                    { 0, "GUEST", "Guest User", "Unauthenticated user", (short)1, DateTime.UtcNow, null },
                    { 1, "CUSTOMER", "Customer", "Regular customer who can rent vehicles", (short)1, DateTime.UtcNow, null },
                    { 2, "OWNER", "Owner", "Vehicle owner who can list vehicles for rent", (short)1, DateTime.UtcNow, null },
                    { 3, "STAFF", "Staff", "Staff member with limited admin access", (short)1, DateTime.UtcNow, null },
                    { 4, "ADMIN", "Administrator", "System administrator with full access", (short)1, DateTime.UtcNow, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "m_role",
                keyColumn: "id",
                keyValue: 0);

            migrationBuilder.DeleteData(
                table: "m_role",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "m_role",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "m_role",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "m_role",
                keyColumn: "id",
                keyValue: 4);
        }
    }
}
