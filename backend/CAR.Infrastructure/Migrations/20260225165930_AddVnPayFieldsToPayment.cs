using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVnPayFieldsToPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "pay_date",
                table: "m_payment",
                type: "timestamp",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "response_code",
                table: "m_payment",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "vnpay_transaction_id",
                table: "m_payment",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "pay_date",
                table: "m_payment");

            migrationBuilder.DropColumn(
                name: "response_code",
                table: "m_payment");

            migrationBuilder.DropColumn(
                name: "vnpay_transaction_id",
                table: "m_payment");
        }
    }
}
