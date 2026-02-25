using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorKycToOwner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_m_kyc_m_customer_profile_customer_profile_id",
                table: "m_kyc");

            migrationBuilder.DropIndex(
                name: "IX_m_kyc_cccd_number",
                table: "m_kyc");

            migrationBuilder.DropIndex(
                name: "IX_m_kyc_customer_profile_id",
                table: "m_kyc");

            migrationBuilder.DropColumn(
                name: "customer_profile_id",
                table: "m_kyc");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "m_kyc");

            migrationBuilder.DropColumn(
                name: "full_name",
                table: "m_kyc");

            migrationBuilder.RenameColumn(
                name: "cccd_number",
                table: "m_kyc",
                newName: "id_card_number");

            migrationBuilder.AddColumn<int>(
                name: "owner_profile_id",
                table: "m_kyc",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "full_name",
                table: "m_kyc",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "verified_at",
                table: "m_kyc",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "m_kyc",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_of_birth",
                table: "m_kyc",
                type: "timestamp",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "m_kyc",
                type: "timestamp",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "rejection_reason",
                table: "m_kyc",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_m_kyc_id_card_number",
                table: "m_kyc",
                column: "id_card_number",
                unique: true,
                filter: "id_card_number IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_m_kyc_owner_profile_id",
                table: "m_kyc",
                column: "owner_profile_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_m_kyc_m_owner_profile_owner_profile_id",
                table: "m_kyc",
                column: "owner_profile_id",
                principalTable: "m_owner_profile",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_m_kyc_m_owner_profile_owner_profile_id",
                table: "m_kyc");

            migrationBuilder.DropIndex(
                name: "IX_m_kyc_id_card_number",
                table: "m_kyc");

            migrationBuilder.DropIndex(
                name: "IX_m_kyc_owner_profile_id",
                table: "m_kyc");

            migrationBuilder.DropColumn(
                name: "rejection_reason",
                table: "m_kyc");

            migrationBuilder.DropColumn(
                name: "owner_profile_id",
                table: "m_kyc");

            migrationBuilder.DropColumn(
                name: "full_name",
                table: "m_kyc");

            migrationBuilder.RenameColumn(
                name: "id_card_number",
                table: "m_kyc",
                newName: "cccd_number");

            migrationBuilder.AddColumn<int>(
                name: "gender",
                table: "m_kyc",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "full_name",
                table: "m_kyc",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "verified_at",
                table: "m_kyc",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "m_kyc",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_of_birth",
                table: "m_kyc",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "m_kyc",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp");

            migrationBuilder.AddColumn<int>(
                name: "customer_profile_id",
                table: "m_kyc",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_m_kyc_cccd_number",
                table: "m_kyc",
                column: "cccd_number",
                unique: true,
                filter: "\"cccd_number\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_m_kyc_customer_profile_id",
                table: "m_kyc",
                column: "customer_profile_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_m_kyc_m_customer_profile_customer_profile_id",
                table: "m_kyc",
                column: "customer_profile_id",
                principalTable: "m_customer_profile",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
