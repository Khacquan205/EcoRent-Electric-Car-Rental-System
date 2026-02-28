using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeparateCustomerAndOwnerProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "address",
                table: "m_user");

            migrationBuilder.DropColumn(
                name: "avatar_img_url",
                table: "m_user");

            migrationBuilder.DropColumn(
                name: "full_name",
                table: "m_user");

            migrationBuilder.DropColumn(
                name: "phone",
                table: "m_user");

            migrationBuilder.DropColumn(
                name: "address",
                table: "m_owner_profile");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "m_customer_profile");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "m_customer_profile");

            migrationBuilder.DropColumn(
                name: "phone",
                table: "m_customer_profile");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "m_customer_profile",
                newName: "display_name");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "m_authentication",
                newName: "name");

            migrationBuilder.AddColumn<int>(
                name: "gender",
                table: "m_owner_profile",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "m_customer_profile",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "latitude",
                table: "m_customer_profile",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "longitude",
                table: "m_customer_profile",
                type: "double precision",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "m_authentication",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "m_authentication",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "gender",
                table: "m_owner_profile");

            migrationBuilder.DropColumn(
                name: "address",
                table: "m_customer_profile");

            migrationBuilder.DropColumn(
                name: "latitude",
                table: "m_customer_profile");

            migrationBuilder.DropColumn(
                name: "longitude",
                table: "m_customer_profile");

            migrationBuilder.DropColumn(
                name: "address",
                table: "m_authentication");

            migrationBuilder.RenameColumn(
                name: "display_name",
                table: "m_customer_profile",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "m_authentication",
                newName: "Name");

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "m_user",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "avatar_img_url",
                table: "m_user",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "full_name",
                table: "m_user",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "phone",
                table: "m_user",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "m_owner_profile",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "m_customer_profile",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "gender",
                table: "m_customer_profile",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "phone",
                table: "m_customer_profile",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "m_authentication",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);
        }
    }
}
