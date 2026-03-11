using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddChatModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "m_conversation",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user1_id = table.Column<int>(type: "integer", nullable: false),
                    user2_id = table.Column<int>(type: "integer", nullable: false),
                    post_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_conversation", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_conversation_m_post_post_id",
                        column: x => x.post_id,
                        principalTable: "m_post",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_m_conversation_m_user_user1_id",
                        column: x => x.user1_id,
                        principalTable: "m_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_m_conversation_m_user_user2_id",
                        column: x => x.user2_id,
                        principalTable: "m_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "m_message",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    conversation_id = table.Column<int>(type: "integer", nullable: false),
                    sender_id = table.Column<int>(type: "integer", nullable: false),
                    content = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_message", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_message_m_conversation_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "m_conversation",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_message_m_user_sender_id",
                        column: x => x.sender_id,
                        principalTable: "m_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_conversation_updated_at",
                table: "m_conversation",
                column: "updated_at");

            migrationBuilder.CreateIndex(
                name: "ix_conversation_user1_user2_post_notnull",
                table: "m_conversation",
                columns: new[] { "user1_id", "user2_id", "post_id" },
                unique: true,
                filter: "post_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_conversation_user1_user2_post_null",
                table: "m_conversation",
                columns: new[] { "user1_id", "user2_id" },
                unique: true,
                filter: "post_id IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_m_conversation_post_id",
                table: "m_conversation",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_conversation_user2_id",
                table: "m_conversation",
                column: "user2_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_message_sender_id",
                table: "m_message",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "ix_message_conversation_created",
                table: "m_message",
                columns: new[] { "conversation_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_message_unread_lookup",
                table: "m_message",
                columns: new[] { "conversation_id", "sender_id", "is_read" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "m_message");

            migrationBuilder.DropTable(
                name: "m_conversation");
        }
    }
}
