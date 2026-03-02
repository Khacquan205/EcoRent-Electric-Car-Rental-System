using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPostMedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_m_post_image_m_post_MPostId",
                table: "m_post_image");

            migrationBuilder.DropIndex(
                name: "IX_m_post_image_MPostId",
                table: "m_post_image");

            migrationBuilder.DropColumn(
                name: "MPostId",
                table: "m_post_image");

            migrationBuilder.CreateTable(
                name: "t_post_video",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    post_id = table.Column<int>(type: "integer", nullable: false),
                    video_url = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_t_post_video", x => x.id);
                    table.ForeignKey(
                        name: "FK_t_post_video_m_post_post_id",
                        column: x => x.post_id,
                        principalTable: "m_post",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_m_post_image_post_id",
                table: "m_post_image",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_t_post_video_post_id",
                table: "t_post_video",
                column: "post_id");

            migrationBuilder.AddForeignKey(
                name: "FK_m_post_image_m_post_post_id",
                table: "m_post_image",
                column: "post_id",
                principalTable: "m_post",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_m_post_image_m_post_post_id",
                table: "m_post_image");

            migrationBuilder.DropTable(
                name: "t_post_video");

            migrationBuilder.DropIndex(
                name: "IX_m_post_image_post_id",
                table: "m_post_image");

            migrationBuilder.AddColumn<int>(
                name: "MPostId",
                table: "m_post_image",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_m_post_image_MPostId",
                table: "m_post_image",
                column: "MPostId");

            migrationBuilder.AddForeignKey(
                name: "FK_m_post_image_m_post_MPostId",
                table: "m_post_image",
                column: "MPostId",
                principalTable: "m_post",
                principalColumn: "id");
        }
    }
}
