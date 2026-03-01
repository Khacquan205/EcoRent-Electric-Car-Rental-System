# EF Core Migrations – Clean Architecture

## Đã cấu hình

- **DbContext** (`CAR.Infrastructure/Data/AppDbContext.cs`): Đã khai báo đủ `DbSet<>` cho mọi entity, gồm `MIdentityVerification` 
- **MigrationsAssembly**: Trong `CAR.Infrastructure/DependencyInjection.cs` đã dùng `npgsqlOptions.MigrationsAssembly("CAR.Infrastructure")`.
- **Migration mới**: `20260301175621_InitialCreate` tạo đầy đủ bảng (m_user, m_role, m_post, m_identity_verification, …) trong schema `public`.

## Trên DB mới (Render PostgreSQL)

Vì DB có thể đã apply migration cũ (bản ghi trong `__EFMigrationsHistory`), cần đồng bộ lại:

### 1. Xóa lịch sử migration cũ trên DB (chọn một cách)

**Cách A – Chỉ xóa bảng lịch sử (giữ data nếu có):**

```sql
DROP TABLE IF EXISTS "__EFMigrationsHistory";
```

**Cách B – DB hoàn toàn mới / muốn tạo lại từ đầu:**

Xóa toàn bộ schema hoặc drop database rồi tạo lại (trong Render: tạo DB mới và dùng connection string mới).

### 2. Apply migration từ project

Từ thư mục `backend/RentalCar`:

```bash
dotnet ef database update --project ../CAR.Infrastructure --startup-project .
```

### 3. Kiểm tra bảng trong DB

Trong pgAdmin / DBeaver / psql:

```sql
\dt
```

Hoặc:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
```

Bạn sẽ thấy các bảng dạng `m_*` (ví dụ: m_user, m_role, m_post, m_identity_verification, m_owner_profile, …) và `__EFMigrationsHistory`.
