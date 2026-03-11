using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPriorityLevelToAdPackageAndAdvertisement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "priority_level",
                table: "m_ad_package",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "priority_level",
                table: "m_advertisement",
                type: "integer",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "priority_level",
                table: "m_ad_package");

            migrationBuilder.DropColumn(
                name: "priority_level",
                table: "m_advertisement");
        }
    }
}
