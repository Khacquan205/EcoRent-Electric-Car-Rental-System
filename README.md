# EcoRent - Electric Car Rental System

EcoRent la nen tang cho thue xe dien C2C (Customer-to-Customer), ket noi nguoi co xe va nguoi can thue xe tren cung mot he thong. Du an huong den trai nghiem dat xe nhanh, minh bach, an toan va co kha nang mo rong cho van hanh thuc te.

## 1. Gioi thieu du an

EcoRent cung cap he thong thue xe dien theo mo hinh marketplace, bao gom:

- Dang bai cho thue xe.
- Tim kiem, xem chi tiet va dat xe.
- Quan ly xac thuc nguoi dung va KYC.
- Quan ly goi dich vu dang bai , quang cao va quyen hien thi bai dang cho chu xe.
- Ho tro chat realtime giua cac ben lien quan.

He thong duoc tach thanh backend API va frontend web, giup trien khai va bao tri theo huong Clean Architecture.

## 2. Cong nghe su dung

### Backend

- ASP.NET Core 8
- Entity Framework Core
- PostgreSQL (Npgsql)
- SignalR (realtime notifications/chat)
- JWT Authentication
- Firebase (phone auth)

### Frontend

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- Firebase Web SDK

### Dich vu tich hop

- VNPay (thanh toan)
- FPT AI (KYC OCR/Liveness)
- OpenAI (goi y xe theo mo ta)

## 3. Tinh nang chinh

- Marketplace cho thue xe dien C2C.
- Phan quyen da vai tro: Customer, Owner, Admin.
- KYC va xac minh danh tinh (OCR, selfie/liveness, OTP).
- Dang tin cho thue, duyet bai dang va quan ly noi dung.
- Goi quang cao/goi chu xe (subscription/ad package).
- Thanh toan online qua VNPay.
- Chat realtime va thong bao realtime qua SignalR.
- Dashboard quan tri va theo doi thong ke.

## 4. Huong dan cai dat

### 4.1 Yeu cau moi truong

- .NET SDK 8.0+
- Node.js 18+
- npm 9+
- PostgreSQL 14+

### 4.2 Clone source code

```bash
git clone <repo-url>
cd EcoRent-Electric-Car-Rental-System
```

### 4.3 Cai dat Backend

```bash
cd backend
dotnet restore
dotnet build
```

### 4.4 Cai dat Frontend

```bash
cd ../frontend
npm install
```

### 4.5 Cau hinh bien moi truong

Backend:

1. Cap nhat cau hinh trong `backend/RentalCar/appsettings.json` hoac `appsettings.Development.json`:
   - `ConnectionStrings:DefaultConnection`
   - `JwtSettings`
   - `Firebase`
   - `VnPay`
   - `KYC`
   - `OpenAI`
2. Khong commit thong tin nhay cam (API keys, password, secrets) len git.

Frontend:

1. Tao file `.env.local` trong thu muc `frontend`.
2. Copy cac bien Firebase tu `frontend/env.example` va dien gia tri that.
3. (Neu can) bo sung bien API base URL theo cau hinh service hien tai.

## 5. Cach su dung

### 5.1 Chay backend

```bash
cd backend/RentalCar
dotnet run
```

Mac dinh backend chay o:

- `http://localhost:5084`
- `https://localhost:7179`

Swagger:

- `http://localhost:5084/swagger`
- `https://localhost:7179/swagger`

### 5.2 Chay frontend

```bash
cd frontend
npm run dev
```

Frontend mac dinh chay tai:

- `http://localhost:3000`

### 5.3 Quy trinh su dung co ban

1. Khoi dong backend truoc de API va database san sang.
2. Khoi dong frontend va truy cap trang web.
3. Dang ky/dang nhap tai khoan.
4. Thuc hien cac nghiep vu: tim xe, tao bai dang, chat, thanh toan, quan ly tai khoan.

## 6. Cau truc thu muc

```text
EcoRent-Electric-Car-Rental-System/
|- backend/
|  |- RentalCar.slnx
|  |- CAR.Domain/           # Entities, Enums, Constants
|  |- CAR.Application/      # DTOs, Interfaces, business contracts
|  |- CAR.Infrastructure/   # Repositories, Services, DbContext, Migrations
|  |- RentalCar/            # ASP.NET Core API (Controllers, Middleware, Program)
|  |- CAR.Test/             # Test project
|
|- frontend/
|  |- src/
|  |  |- app/               # Next.js App Router pages
|  |  |- components/        # UI components
|  |  |- services/          # API service layer
|  |  |- hooks/             # Custom hooks
|  |  |- types/             # TypeScript types
|  |  |- lib/               # Shared utilities
|  |- public/               # Static assets
|
|- docs/                    # Tai lieu du an
|- Dockerfile               # Build container (root)
|- README.md                # Tai lieu tong quan du an
```

## 7. Ghi chu phat trien

- Coding conventions cho AI assistants duoc mo ta trong `.github/copilot-instructions.md`.
- Nen tach cau hinh secrets theo moi truong (Development/Staging/Production).
- Kien nghi bo sung tai lieu API chi tiet cho tung module (Auth, Post, Payment, Chat, Admin).
