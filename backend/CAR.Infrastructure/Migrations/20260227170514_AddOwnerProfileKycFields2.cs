using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOwnerProfileKycFields2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "full_name",
                table: "m_owner_profile",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "date_of_birth",
                table: "m_owner_profile",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "m_owner_profile",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "id_number",
                table: "m_owner_profile",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "full_name", table: "m_owner_profile");
            migrationBuilder.DropColumn(name: "date_of_birth", table: "m_owner_profile");
            migrationBuilder.DropColumn(name: "address", table: "m_owner_profile");
            migrationBuilder.DropColumn(name: "id_number", table: "m_owner_profile");
        }
    }
}
