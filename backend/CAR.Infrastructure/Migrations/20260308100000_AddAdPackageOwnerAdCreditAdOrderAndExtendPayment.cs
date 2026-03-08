using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdPackageOwnerAdCreditAdOrderAndExtendPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Bảng gói quảng cáo
            migrationBuilder.CreateTable(
                name: "m_ad_package",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    duration_days = table.Column<int>(type: "integer", nullable: false),
                    max_posts = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_ad_package", x => x.id);
                });

            // 2. Bảng đơn mua gói quảng cáo (trước m_owner_ad_credit vì credit không phụ thuộc order)
            migrationBuilder.CreateTable(
                name: "m_ad_order",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    owner_id = table.Column<int>(type: "integer", nullable: false),
                    ad_package_id = table.Column<int>(type: "integer", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_ad_order", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_ad_order_m_owner_profile_owner_id",
                        column: x => x.owner_id,
                        principalTable: "m_owner_profile",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_ad_order_m_ad_package_ad_package_id",
                        column: x => x.ad_package_id,
                        principalTable: "m_ad_package",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_m_ad_order_ad_package_id",
                table: "m_ad_order",
                column: "ad_package_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_ad_order_owner_id",
                table: "m_ad_order",
                column: "owner_id");

            // 3. Bảng credit quảng cáo của owner
            migrationBuilder.CreateTable(
                name: "m_owner_ad_credit",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    owner_id = table.Column<int>(type: "integer", nullable: false),
                    ad_package_id = table.Column<int>(type: "integer", nullable: false),
                    remaining_posts = table.Column<int>(type: "integer", nullable: false),
                    duration_days = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_owner_ad_credit", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_owner_ad_credit_m_owner_profile_owner_id",
                        column: x => x.owner_id,
                        principalTable: "m_owner_profile",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_owner_ad_credit_m_ad_package_ad_package_id",
                        column: x => x.ad_package_id,
                        principalTable: "m_ad_package",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_m_owner_ad_credit_ad_package_id",
                table: "m_owner_ad_credit",
                column: "ad_package_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_owner_ad_credit_owner_id",
                table: "m_owner_ad_credit",
                column: "owner_id");

            // 4. Mở rộng m_payment: thêm payment_type, ad_order_id; subscription_id cho phép NULL
            migrationBuilder.AddColumn<int>(
                name: "payment_type",
                table: "m_payment",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "ad_order_id",
                table: "m_payment",
                type: "integer",
                nullable: true);

            // Drop FK subscription để đổi cột sang nullable (PostgreSQL)
            migrationBuilder.DropForeignKey(
                name: "FK_m_payment_m_owner_subscription_subscription_id",
                table: "m_payment");

            migrationBuilder.AlterColumn<int>(
                name: "subscription_id",
                table: "m_payment",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            // Cập nhật dữ liệu cũ: payment_type = 1 cho mọi row hiện có (đã set default 1 ở AddColumn)
            // Re-add FK subscription (optional)
            migrationBuilder.AddForeignKey(
                name: "FK_m_payment_m_owner_subscription_subscription_id",
                table: "m_payment",
                column: "subscription_id",
                principalTable: "m_owner_subscription",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.CreateIndex(
                name: "IX_m_payment_ad_order_id",
                table: "m_payment",
                column: "ad_order_id");

            migrationBuilder.AddForeignKey(
                name: "FK_m_payment_m_ad_order_ad_order_id",
                table: "m_payment",
                column: "ad_order_id",
                principalTable: "m_ad_order",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_m_payment_m_ad_order_ad_order_id",
                table: "m_payment");

            migrationBuilder.DropForeignKey(
                name: "FK_m_payment_m_owner_subscription_subscription_id",
                table: "m_payment");

            migrationBuilder.DropIndex(
                name: "IX_m_payment_ad_order_id",
                table: "m_payment");

            migrationBuilder.DropColumn(
                name: "ad_order_id",
                table: "m_payment");

            migrationBuilder.DropColumn(
                name: "payment_type",
                table: "m_payment");

            migrationBuilder.AlterColumn<int>(
                name: "subscription_id",
                table: "m_payment",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_m_payment_m_owner_subscription_subscription_id",
                table: "m_payment",
                column: "subscription_id",
                principalTable: "m_owner_subscription",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropTable(
                name: "m_owner_ad_credit");

            migrationBuilder.DropTable(
                name: "m_ad_order");

            migrationBuilder.DropTable(
                name: "m_ad_package");
        }
    }
}
