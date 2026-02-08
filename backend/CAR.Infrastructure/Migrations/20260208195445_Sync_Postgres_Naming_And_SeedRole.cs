using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CAR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Sync_Postgres_Naming_And_SeedRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "m_location",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    province = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    district = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ward = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    address_detail = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_location", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "m_owner_package",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    duration_days = table.Column<int>(type: "integer", nullable: false),
                    max_posts = table.Column<int>(type: "integer", nullable: false),
                    priority_level = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_owner_package", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "m_role",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_role", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "m_vehicle_category",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_vehicle_category", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "m_vehicle_verification",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    post_id = table.Column<int>(type: "integer", nullable: false),
                    registration_image = table.Column<string>(type: "text", nullable: true),
                    inspection_image = table.Column<string>(type: "text", nullable: true),
                    insurance_image = table.Column<string>(type: "text", nullable: true),
                    verified_at = table.Column<DateTime>(type: "timestamp", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_vehicle_verification", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "m_user",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_id = table.Column<int>(type: "integer", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    avatar_img_url = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'utc'"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, defaultValueSql: "NOW() AT TIME ZONE 'utc'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_user", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_user_m_role_role_id",
                        column: x => x.role_id,
                        principalTable: "m_role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_authentication",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    password_hash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    google_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    firebase_token = table.Column<string>(type: "text", nullable: true),
                    code = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    code_expires_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    code_is_used = table.Column<bool>(type: "boolean", nullable: false),
                    code_is_revoked = table.Column<bool>(type: "boolean", nullable: false),
                    auth_type = table.Column<short>(type: "smallint", nullable: false),
                    auth_provider = table.Column<short>(type: "smallint", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false, defaultValueSql: "NOW() AT TIME ZONE 'utc'"),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: true, defaultValueSql: "NOW() AT TIME ZONE 'utc'")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_authentication", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_authentication_m_user_user_id",
                        column: x => x.user_id,
                        principalTable: "m_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_customer_profile",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    gender = table.Column<int>(type: "integer", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_customer_profile", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_customer_profile_m_user_user_id",
                        column: x => x.user_id,
                        principalTable: "m_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_owner_profile",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    identity_verified = table.Column<bool>(type: "boolean", nullable: false),
                    rating_avg = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    total_posts = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_owner_profile", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_owner_profile_m_user_user_id",
                        column: x => x.user_id,
                        principalTable: "m_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_search_history",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: true),
                    keyword = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    category_id = table.Column<int>(type: "integer", nullable: true),
                    location_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_search_history", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_search_history_m_location_location_id",
                        column: x => x.location_id,
                        principalTable: "m_location",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_m_search_history_m_user_user_id",
                        column: x => x.user_id,
                        principalTable: "m_user",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_m_search_history_m_vehicle_category_category_id",
                        column: x => x.category_id,
                        principalTable: "m_vehicle_category",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "m_staff_profile",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    staff_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_staff_profile", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_staff_profile_m_user_user_id",
                        column: x => x.user_id,
                        principalTable: "m_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_kyc",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    customer_profile_id = table.Column<int>(type: "integer", nullable: false),
                    verification_status = table.Column<int>(type: "integer", nullable: false),
                    full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    date_of_birth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    gender = table.Column<int>(type: "integer", nullable: false),
                    cccd_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    front_document_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    back_document_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_kyc", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_kyc_m_customer_profile_customer_profile_id",
                        column: x => x.customer_profile_id,
                        principalTable: "m_customer_profile",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_owner_subscription",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    owner_id = table.Column<int>(type: "integer", nullable: false),
                    package_id = table.Column<int>(type: "integer", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    total_posts = table.Column<int>(type: "integer", nullable: false),
                    remaining_posts = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    OwnerProfileId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_owner_subscription", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_owner_subscription_m_owner_package_package_id",
                        column: x => x.package_id,
                        principalTable: "m_owner_package",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_owner_subscription_m_owner_profile_OwnerProfileId",
                        column: x => x.OwnerProfileId,
                        principalTable: "m_owner_profile",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MIdentityVerification",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OwnerProfileId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Score = table.Column<decimal>(type: "numeric", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectReason = table.Column<string>(type: "text", nullable: true),
                    FrontDocumentUrl = table.Column<string>(type: "text", nullable: true),
                    BackDocumentUrl = table.Column<string>(type: "text", nullable: true),
                    SelfieUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MIdentityVerification", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MIdentityVerification_m_owner_profile_OwnerProfileId",
                        column: x => x.OwnerProfileId,
                        principalTable: "m_owner_profile",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_post",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    owner_id = table.Column<int>(type: "integer", nullable: false),
                    category_id = table.Column<int>(type: "integer", nullable: false),
                    location_id = table.Column<int>(type: "integer", nullable: true),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    contact_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    status = table.Column<short>(type: "smallint", nullable: false),
                    staff_id = table.Column<int>(type: "integer", nullable: true),
                    reject_reason = table.Column<string>(type: "text", nullable: true),
                    priority_level = table.Column<short>(type: "smallint", nullable: false),
                    expired_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamptz", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    OwnerProfileId = table.Column<int>(type: "integer", nullable: false),
                    VehicleVerificationId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_post", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_post_m_location_location_id",
                        column: x => x.location_id,
                        principalTable: "m_location",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_m_post_m_owner_profile_OwnerProfileId",
                        column: x => x.OwnerProfileId,
                        principalTable: "m_owner_profile",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_post_m_staff_profile_staff_id",
                        column: x => x.staff_id,
                        principalTable: "m_staff_profile",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_m_post_m_vehicle_category_category_id",
                        column: x => x.category_id,
                        principalTable: "m_vehicle_category",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_post_m_vehicle_verification_VehicleVerificationId",
                        column: x => x.VehicleVerificationId,
                        principalTable: "m_vehicle_verification",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "m_phone",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Otp = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsUsed = table.Column<bool>(type: "boolean", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CustomerProfileId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_phone", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_phone_m_customer_profile_CustomerProfileId",
                        column: x => x.CustomerProfileId,
                        principalTable: "m_customer_profile",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_phone_m_kyc_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "m_kyc",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_payment",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    subscription_id = table.Column<int>(type: "integer", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    payment_method = table.Column<int>(type: "integer", nullable: false),
                    payment_status = table.Column<int>(type: "integer", nullable: false),
                    transaction_code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_payment", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_payment_m_owner_subscription_subscription_id",
                        column: x => x.subscription_id,
                        principalTable: "m_owner_subscription",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_advertisement",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    post_id = table.Column<int>(type: "integer", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp", nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_advertisement", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_advertisement_m_post_post_id",
                        column: x => x.post_id,
                        principalTable: "m_post",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_post_image",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    post_id = table.Column<int>(type: "integer", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true),
                    MPostId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_post_image", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_post_image_m_post_MPostId",
                        column: x => x.MPostId,
                        principalTable: "m_post",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "m_report",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    post_id = table.Column<int>(type: "integer", nullable: false),
                    reporter_user_id = table.Column<int>(type: "integer", nullable: false),
                    reason = table.Column<int>(type: "integer", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_report", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_report_m_post_post_id",
                        column: x => x.post_id,
                        principalTable: "m_post",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_report_m_user_reporter_user_id",
                        column: x => x.reporter_user_id,
                        principalTable: "m_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "m_review",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    post_id = table.Column<int>(type: "integer", nullable: false),
                    reviewer_id = table.Column<int>(type: "integer", nullable: false),
                    owner_id = table.Column<int>(type: "integer", nullable: false),
                    rating = table.Column<int>(type: "integer", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_m_review", x => x.id);
                    table.ForeignKey(
                        name: "FK_m_review_m_owner_profile_owner_id",
                        column: x => x.owner_id,
                        principalTable: "m_owner_profile",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_review_m_post_post_id",
                        column: x => x.post_id,
                        principalTable: "m_post",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_m_review_m_user_reviewer_id",
                        column: x => x.reviewer_id,
                        principalTable: "m_user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_m_advertisement_post_id",
                table: "m_advertisement",
                column: "post_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_m_authentication_user_id",
                table: "m_authentication",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_customer_profile_user_id",
                table: "m_customer_profile",
                column: "user_id",
                unique: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_m_owner_profile_user_id",
                table: "m_owner_profile",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_m_owner_subscription_end_date",
                table: "m_owner_subscription",
                column: "end_date");

            migrationBuilder.CreateIndex(
                name: "IX_m_owner_subscription_owner_id_status",
                table: "m_owner_subscription",
                columns: new[] { "owner_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_m_owner_subscription_OwnerProfileId",
                table: "m_owner_subscription",
                column: "OwnerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_m_owner_subscription_package_id",
                table: "m_owner_subscription",
                column: "package_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_payment_subscription_id",
                table: "m_payment",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_phone_CustomerId",
                table: "m_phone",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_m_phone_CustomerProfileId",
                table: "m_phone",
                column: "CustomerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_m_phone_Phone",
                table: "m_phone",
                column: "Phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_m_post_category_id",
                table: "m_post",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_post_location_id",
                table: "m_post",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_post_OwnerProfileId",
                table: "m_post",
                column: "OwnerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_m_post_staff_id",
                table: "m_post",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_post_VehicleVerificationId",
                table: "m_post",
                column: "VehicleVerificationId");

            migrationBuilder.CreateIndex(
                name: "IX_m_post_image_MPostId",
                table: "m_post_image",
                column: "MPostId");

            migrationBuilder.CreateIndex(
                name: "IX_m_report_post_id",
                table: "m_report",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_report_reporter_user_id",
                table: "m_report",
                column: "reporter_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_review_owner_id",
                table: "m_review",
                column: "owner_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_review_post_id",
                table: "m_review",
                column: "post_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_review_reviewer_id",
                table: "m_review",
                column: "reviewer_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_search_history_category_id",
                table: "m_search_history",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_search_history_location_id",
                table: "m_search_history",
                column: "location_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_search_history_user_id",
                table: "m_search_history",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_m_staff_profile_user_id",
                table: "m_staff_profile",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_m_user_role_id",
                table: "m_user",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_MIdentityVerification_OwnerProfileId",
                table: "MIdentityVerification",
                column: "OwnerProfileId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "m_advertisement");

            migrationBuilder.DropTable(
                name: "m_authentication");

            migrationBuilder.DropTable(
                name: "m_payment");

            migrationBuilder.DropTable(
                name: "m_phone");

            migrationBuilder.DropTable(
                name: "m_post_image");

            migrationBuilder.DropTable(
                name: "m_report");

            migrationBuilder.DropTable(
                name: "m_review");

            migrationBuilder.DropTable(
                name: "m_search_history");

            migrationBuilder.DropTable(
                name: "MIdentityVerification");

            migrationBuilder.DropTable(
                name: "m_owner_subscription");

            migrationBuilder.DropTable(
                name: "m_kyc");

            migrationBuilder.DropTable(
                name: "m_post");

            migrationBuilder.DropTable(
                name: "m_owner_package");

            migrationBuilder.DropTable(
                name: "m_customer_profile");

            migrationBuilder.DropTable(
                name: "m_location");

            migrationBuilder.DropTable(
                name: "m_owner_profile");

            migrationBuilder.DropTable(
                name: "m_staff_profile");

            migrationBuilder.DropTable(
                name: "m_vehicle_category");

            migrationBuilder.DropTable(
                name: "m_vehicle_verification");

            migrationBuilder.DropTable(
                name: "m_user");

            migrationBuilder.DropTable(
                name: "m_role");
        }
    }
}
