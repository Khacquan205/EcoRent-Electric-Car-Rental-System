# AI Coding Rules - EcoRent Electric Car Rental System

> File này chứa các quy tắc để AI assistants (GitHub Copilot, Cursor, Claude, etc.) hiểu và tuân theo coding conventions của team.

## 📋 Project Overview

- **Project Name**: EcoRent - Electric Car Rental System
- **Backend**: ASP.NET Core 8 với Clean Architecture
- **Frontend**: Next.js với TypeScript
- **Database**: PostgreSQL với Entity Framework Core
- **Authentication**: JWT + Firebase Phone Auth

---

## 🏗️ Architecture

### Backend Layers (Clean Architecture)

```
CAR.Domain/          → Entities, Enums, Constants (không dependencies)
CAR.Application/     → DTOs, Interfaces, Business Logic Contracts
CAR.Infrastructure/  → Repositories, Services, Database Context
RentalCar/           → API Controllers, Middleware, Filters
```

### Frontend Structure

```
src/
├── app/             → Next.js App Router pages
├── components/      → React components
├── hooks/           → Custom React hooks
├── services/        → API service functions
├── types/           → TypeScript interfaces/types
└── lib/             → Utility functions
```

---

## 📝 Naming Conventions

### Backend (.NET)

| Type         | Convention              | Example                                   |
| ------------ | ----------------------- | ----------------------------------------- |
| Entity       | Prefix `M` + PascalCase | `MCustomerProfile`, `MOwnerPackage`       |
| Interface    | Prefix `I` + PascalCase | `IAuthService`, `IUserRepository`         |
| DTO Request  | Suffix `RequestDto`     | `LoginRequestDto`, `CreatePostRequestDto` |
| DTO Response | Suffix `ResponseDto`    | `LoginResponseDto`, `PackageResponseDto`  |
| Repository   | Suffix `Repository`     | `UserRepository`, `PostRepository`        |
| Service      | Suffix `Service`        | `AuthService`, `EmailService`             |
| Controller   | Suffix `Controller`     | `AuthController`, `PostController`        |
| Enum         | Prefix với context      | `KycGender`, `KycStatus`, `PostStatus`    |

### Frontend (TypeScript)

| Type             | Convention           | Example                          |
| ---------------- | -------------------- | -------------------------------- |
| Component        | PascalCase           | `CarCard`, `LoginForm`           |
| Hook             | Prefix `use`         | `useAuth`, `useCarList`          |
| Service function | camelCase            | `login`, `getCars`, `createPost` |
| Type/Interface   | PascalCase           | `LoginRequest`, `CarResponse`    |
| Constant         | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY`      |

---

## ✅ Code Patterns - PHẢI TUÂN THEO

### Backend

#### 1. Controller Pattern

```csharp
[ApiController]
[Route("api/[controller]")]
public class ExampleController : ControllerBase
{
    private readonly IExampleService _exampleService;

    public ExampleController(IExampleService exampleService)
    {
        _exampleService = exampleService;
    }

    /// <summary>
    /// Mô tả endpoint
    /// </summary>
    [HttpPost("action")]
    [Authorize] // Nếu cần authentication
    public async Task<IActionResult> Action([FromBody] RequestDto request)
    {
        var result = await _exampleService.DoSomething(request);
        return Ok(result);
    }
}
```

#### 2. Service Interface Pattern

```csharp
public interface IExampleService
{
    Task<ResponseDto> DoSomething(RequestDto request);
    Task<List<ItemDto>> GetAll();
}
```

#### 3. Repository Pattern

```csharp
public interface IExampleRepository
{
    Task<MEntity?> GetByIdAsync(int id);
    Task<List<MEntity>> GetAllAsync();
    Task AddAsync(MEntity entity);
    Task UpdateAsync(MEntity entity);
    Task DeleteAsync(MEntity entity);
}
```

#### 4. Entity Pattern

```csharp
public partial class MEntityName
{
    public int Id { get; set; }

    // Foreign keys
    public int RelatedEntityId { get; set; }

    // Properties
    public string Name { get; set; }

    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

#### 5. Dependency Injection Registration

```csharp
// Trong DependencyInjection.cs
services.AddScoped<IExampleRepository, ExampleRepository>();
services.AddScoped<IExampleService, ExampleService>();
```

### Frontend

#### 1. API Service Pattern

```typescript
import { apiFetch } from "./client";

export type ExampleRequest = {
  field1: string;
  field2: number;
};

export type ExampleResponse = ApiResult<{
  data: SomeType;
}>;

export async function doSomething(
  body: ExampleRequest,
): Promise<ExampleResponse> {
  return apiFetch<ExampleResponse>("/api/Example/action", {
    method: "POST",
    body,
  });
}
```

#### 2. Component Pattern

```typescript
"use client"; // Nếu cần client-side

import { useState } from "react";

interface ExampleProps {
  title: string;
  onAction?: () => void;
}

export function Example({ title, onAction }: ExampleProps) {
  const [state, setState] = useState<string>("");

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## ❌ KHÔNG ĐƯỢC LÀM

### Backend

- ❌ Hardcode connection strings, API keys, secrets
- ❌ Business logic trong Controllers (chỉ gọi Service)
- ❌ Truy cập DbContext trực tiếp từ Controllers
- ❌ Sử dụng synchronous database calls
- ❌ Bỏ qua null checking
- ❌ Tạo God classes (class làm quá nhiều việc)
- ❌ Expose entities trực tiếp qua API (phải dùng DTOs)

### Frontend

- ❌ Hardcode API URLs (dùng environment variables)
- ❌ Sử dụng `any` type (phải define proper types)
- ❌ Inline styles (dùng Tailwind CSS)
- ❌ Console.log trong production code
- ❌ Gọi API trực tiếp trong components (dùng services)

---

## 🔧 Error Handling

### Backend

```csharp
// Sử dụng UserFriendlyException cho business errors
throw new UserFriendlyException("Thông báo lỗi cho user");

// Validate input đầu vào
if (string.IsNullOrEmpty(request.Email))
    throw new UserFriendlyException("Email is required");
```

### Frontend

```typescript
try {
  const result = await login(credentials);
  if (!result.success) {
    // Handle business error
    toast.error(result.message);
  }
} catch (error) {
  // Handle network/unexpected error
  toast.error("Something went wrong");
}
```

---

## 🌐 API Response Format

Tất cả API responses phải tuân theo format:

```json
{
  "success": true/false,
  "message": "Mô tả kết quả",
  "data": { /* response data */ }
}
```

---

## 📁 File Organization

### Khi tạo feature mới, cần tạo các files sau:

#### Backend

1. `CAR.Domain/Entities/MNewEntity.cs` - Entity class
2. `CAR.Domain/Enums/NewEntityStatus.cs` - Enums (nếu cần)
3. `CAR.Application/Dtos/NewEntityRequestDto.cs` - Request DTO
4. `CAR.Application/Dtos/NewEntityResponseDto.cs` - Response DTO
5. `CAR.Application/Interfaces/Repositories/INewEntityRepository.cs` - Repository interface
6. `CAR.Application/Interfaces/Services/INewEntityService.cs` - Service interface
7. `CAR.Infrastructure/Repositories/NewEntityRepository.cs` - Repository implementation
8. `CAR.Infrastructure/Services/NewEntityService.cs` - Service implementation
9. `RentalCar/Controllers/NewEntityController.cs` - API Controller
10. Đăng ký DI trong `DependencyInjection.cs`

#### Frontend

1. `src/types/new-entity.ts` - TypeScript types
2. `src/services/new-entity.ts` - API service
3. `src/components/new-entity/` - Components folder
4. `src/app/new-entity/page.tsx` - Page (nếu cần)

---

## 💬 Language Rules

| Content                              | Language                |
| ------------------------------------ | ----------------------- |
| Code (variables, functions, classes) | English                 |
| Code comments                        | English                 |
| Commit messages                      | English                 |
| Documentation                        | Vietnamese hoặc English |
| User-facing messages                 | Vietnamese              |
| API error messages                   | English                 |

---

## 🧪 Testing

- Test files đặt trong `CAR.Test/`
- Naming convention: `MethodName_Scenario_ExpectedResult`
- Example: `Login_WithValidCredentials_ReturnsToken`

---

## 📌 Quick Reference Commands

```bash
# Backend - Run
cd backend/RentalCar && dotnet run

# Backend - Build
cd backend && dotnet build

# Frontend - Run
cd frontend && npm run dev

# Frontend - Build
cd frontend && npm run build
```

---

## 🔄 Workflow khi sử dụng AI

1. **Đọc file này trước** khi bắt đầu code
2. **Cung cấp context** về feature đang làm
3. **Review code** AI generate trước khi commit
4. **Kiểm tra** naming conventions và patterns
5. **Test** code trước khi merge

---

_Last updated: 2026-02-06_
