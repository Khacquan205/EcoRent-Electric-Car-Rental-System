using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpgradeEmbeddingTo3072 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Xóa embedding cũ (1536d) - không tương thích với 3072d
            migrationBuilder.Sql("TRUNCATE TABLE t_post_embedding;");
            migrationBuilder.AlterColumn<Vector>(
                name: "embedding",
                table: "t_post_embedding",
                type: "vector(3072)",
                nullable: true,
                oldClrType: typeof(Vector),
                oldType: "vector(1536)",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Vector>(
                name: "embedding",
                table: "t_post_embedding",
                type: "vector(1536)",
                nullable: true,
                oldClrType: typeof(Vector),
                oldType: "vector(3072)",
                oldNullable: true);
        }
    }
}
