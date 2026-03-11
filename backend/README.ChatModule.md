# Chat Module — EcoRent Electric Car Rental System

## 1. Purpose

1-1 realtime chat between Customer and Owner (or any two users), optionally scoped to a specific rental listing (`MPost`). Conversations are independent of bookings — users can chat before, during, or without any rental.

---

## 2. Architecture Overview

```
Client (Next.js)
  │
  ├─ REST ──→ ChatController ──→ IChatService ──→ Repos ──→ PostgreSQL
  │                                                              ↑
  └─ WS ────→ ChatHub ─────────→ IChatService ──→ Repos ──→ ────┘
                 │
                 └─ Broadcast to SignalR group ──→ Connected clients
```

**Core principles:**

- **Business logic lives only in `ChatService`** — Controller and Hub are thin.
- **DB-first persistence**: every message is saved to PostgreSQL _before_ being broadcast via SignalR.
- **Participant verification** on every operation — no trusting client-provided conversation IDs without checking membership.

---

## 3. File Structure

```
CAR.Domain/Entities/
    MConversation.cs                    # Conversation entity
    MMessage.cs                         # Message entity

CAR.Application/
    Dtos/Chat/
        CreateConversationRequestDto.cs
        SendMessageRequestDto.cs        # Body: Content only (ConversationId comes from route)
        ConversationResponseDto.cs
        MessageResponseDto.cs
    Interfaces/Repositories/
        IConversationRepository.cs
        IMessageRepository.cs
    Interfaces/Services/
        IChatService.cs

CAR.Infrastructure/
    Data/Configurations/
        ConversationConfiguration.cs    # EF fluent config, table m_conversation
        MessageConfiguration.cs         # EF fluent config, table m_message
    Data/AppDbContext.cs                # Modified: added DbSet<MConversation>, DbSet<MMessage>
    Repositiories/
        ConversationRepository.cs
        MessageRepository.cs
    Services/
        ChatService.cs                  # All business logic
    Hubs/
        ChatHub.cs                      # SignalR realtime transport
    DependencyInjection.cs              # Modified: registered repos + service

RentalCar/
    Controllers/
        ChatController.cs              # REST endpoints
    Program.cs                         # Modified: MapHub<ChatHub>("/hubs/chat")
```

---

## 4. Entities & Relationships

### MConversation (`m_conversation`)

| Column     | Type           | Notes                          |
| ---------- | -------------- | ------------------------------ |
| id         | int PK         | Auto-increment                 |
| user1_id   | int FK→m_user  | Always the **smaller** user ID |
| user2_id   | int FK→m_user  | Always the **larger** user ID  |
| post_id    | int? FK→m_post | Optional listing context       |
| created_at | timestamptz    |                                |
| updated_at | timestamptz?   | Refreshed on every new message |

### MMessage (`m_message`)

| Column          | Type          | Notes                      |
| --------------- | ------------- | -------------------------- |
| id              | int PK        | Auto-increment             |
| conversation_id | int FK        | → m_conversation (CASCADE) |
| sender_id       | int FK        | → m_user (RESTRICT)        |
| content         | varchar(2000) | Message text               |
| is_read         | bool          | Default false              |
| created_at      | timestamptz   |                            |

### Indexes

| Name                                     | Columns                               | Filter              |
| ---------------------------------------- | ------------------------------------- | ------------------- |
| ix_conversation_user1_user2_post_notnull | (user1_id, user2_id, post_id)         | post_id IS NOT NULL |
| ix_conversation_user1_user2_post_null    | (user1_id, user2_id)                  | post_id IS NULL     |
| ix_conversation_updated_at               | (updated_at)                          |                     |
| ix_message_conversation_created          | (conversation_id, created_at)         |                     |
| ix_message_unread_lookup                 | (conversation_id, sender_id, is_read) |                     |

**Why two filtered unique indexes?** PostgreSQL allows multiple NULL values in a regular unique index. A simple `UNIQUE(user1_id, user2_id, post_id)` would permit unlimited conversations with `post_id = NULL` between the same pair. The two filtered indexes solve this correctly.

---

## 5. DTOs

### CreateConversationRequestDto

```json
{ "otherUserId": 2, "postId": 5 }
```

`postId` is optional.

### SendMessageRequestDto

```json
{ "content": "Xe này còn cho thuê không ạ?" }
```

`conversationId` is NOT in the body — it comes from the route parameter.

### ConversationResponseDto

```json
{
  "id": 1,
  "otherUserId": 2,
  "otherUserName": "Nguyễn Văn A",
  "postId": 5,
  "postTitle": "VinFast VF8 - Cho thuê tháng",
  "postImage": "https://...",
  "lastMessage": "Xe này còn cho thuê không ạ?",
  "lastMessageAt": "2026-03-11T10:05:00Z",
  "unreadCount": 3,
  "createdAt": "2026-03-11T10:00:00Z"
}
```

### MessageResponseDto

```json
{
  "id": 42,
  "conversationId": 1,
  "senderId": 3,
  "senderName": "Trần Thị B",
  "content": "Xe này còn cho thuê không ạ?",
  "isRead": false,
  "createdAt": "2026-03-11T10:05:00Z"
}
```

---

## 6. REST API Endpoints

Base route: `/api/Chat`

| Method | Endpoint                                        | Auth | Description                  |
| ------ | ----------------------------------------------- | ---- | ---------------------------- |
| POST   | /conversations                                  | JWT  | Get or create conversation   |
| GET    | /conversations                                  | JWT  | List user's conversations    |
| GET    | /conversations/{id}/messages?page=1&pageSize=20 | JWT  | Paginated message history    |
| POST   | /conversations/{id}/messages                    | JWT  | Send message (REST fallback) |
| PUT    | /conversations/{id}/read                        | JWT  | Mark messages as read        |

---

## 7. SignalR Hub

**Endpoint:** `/hubs/chat`

### Client → Server

| Method            | Parameters                           | Description                     |
| ----------------- | ------------------------------------ | ------------------------------- |
| JoinConversation  | conversationId: int                  | Join group for realtime events  |
| LeaveConversation | conversationId: int                  | Leave group                     |
| SendMessage       | conversationId: int, content: string | Send message (save + broadcast) |
| MarkAsRead        | conversationId: int                  | Mark as read + notify partner   |

### Server → Client

| Event              | Payload                          | Description                |
| ------------------ | -------------------------------- | -------------------------- |
| ReceiveMessage     | MessageResponseDto               | New message                |
| MessagesRead       | { conversationId, readByUserId } | Partner read your messages |
| JoinedConversation | conversationId: int              | Join confirmation          |
| Error              | string                           | Error message              |

### Group naming

`conversation-{conversationId}` (e.g., `conversation-42`).

---

## 8. Authentication

### REST

Standard `Authorization: Bearer <jwt>` header. Controller is decorated with `[Authorize]`.

### SignalR

JWT is passed via `access_token` query string parameter:

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5000/hubs/chat", {
    accessTokenFactory: () => localStorage.getItem("token"),
  })
  .withAutomaticReconnect()
  .build();
```

This is already configured in `Program.cs` — the `OnMessageReceived` event reads `access_token` from query string for paths starting with `/hubs`.

---

## 9. Business Rules

| Rule                                            | Location                                                        |
| ----------------------------------------------- | --------------------------------------------------------------- |
| No self-chat                                    | ChatService.GetOrCreateConversationAsync                        |
| One conversation per (User1, User2, PostId)     | DB unique indexes + service normalize                           |
| User1Id < User2Id always                        | ChatService normalizes on create/lookup                         |
| Only participants can access conversation       | ChatService verifies on every operation                         |
| Content max 2000 chars, non-empty               | ChatService.SendMessageAsync + DTO validation                   |
| DB save before broadcast                        | ChatHub calls ChatService, broadcasts only AFTER save           |
| MarkAsRead only marks OTHER user's messages     | MessageRepository.MarkAsReadAsync filters by SenderId != userId |
| Conversation.UpdatedAt refreshed on new message | ChatService.SendMessageAsync                                    |

---

## 10. Dependency Injection Changes

In `DependencyInjection.cs`:

**AddInfrastructure** (repositories):

```csharp
services.AddScoped<IConversationRepository, ConversationRepository>();
services.AddScoped<IMessageRepository, MessageRepository>();
```

**AddApplication** (services):

```csharp
services.AddScoped<IChatService, ChatService>();
```

---

## 11. Program.cs Changes

Added hub mapping (SignalR and JWT query string support were already configured):

```csharp
app.MapHub<ChatHub>("/hubs/chat");
```

---

## 12. Migration Commands

```bash
# Create migration (already done)
cd backend/RentalCar
dotnet ef migrations add AddChatModule --project ../CAR.Infrastructure --startup-project .

# Apply to database
dotnet ef database update --project ../CAR.Infrastructure --startup-project .
```

The application also runs `db.Database.Migrate()` on startup, so the migration will auto-apply.

---

## 13. Running Locally

```bash
cd backend/RentalCar
dotnet run
```

- REST API: `https://localhost:{port}/api/Chat/conversations`
- SignalR Hub: `wss://localhost:{port}/hubs/chat`
- Swagger: `https://localhost:{port}/swagger`

---

## 14. Testing Checklist

### REST (Postman / Swagger)

1. **Login** → POST `/api/Auth/login` → get JWT token
2. **Create conversation** → POST `/api/Chat/conversations` with body `{ "otherUserId": 2, "postId": 1 }`
   - Expect: conversation DTO returned
   - Calling again with same params returns the SAME conversation (idempotent)
3. **List conversations** → GET `/api/Chat/conversations`
   - Expect: array with the conversation, unreadCount, lastMessage
4. **Send message** → POST `/api/Chat/conversations/{id}/messages` with body `{ "content": "Hello" }`
   - Expect: message DTO with auto-generated id
5. **Get messages** → GET `/api/Chat/conversations/{id}/messages?page=1&pageSize=20`
   - Expect: paginated result, newest first
6. **Mark as read** → PUT `/api/Chat/conversations/{id}/read`
   - Expect: `{ "success": true, "message": "Messages marked as read" }`
7. **Self-chat rejection** → create conversation with `otherUserId` = your own ID
   - Expect: 400 error
8. **Participant check** → try to access a conversation you're not part of
   - Expect: 403 error

### SignalR (Browser / JS client)

```javascript
import * as signalR from "@microsoft/signalr";

const conn = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5000/hubs/chat", {
    accessTokenFactory: () => "YOUR_JWT_TOKEN",
  })
  .withAutomaticReconnect()
  .build();

conn.on("ReceiveMessage", (msg) => console.log("New message:", msg));
conn.on("MessagesRead", (data) => console.log("Read:", data));
conn.on("Error", (err) => console.error("Hub error:", err));
conn.on("JoinedConversation", (id) => console.log("Joined:", id));

await conn.start();
await conn.invoke("JoinConversation", 1);
await conn.invoke("SendMessage", 1, "Hello from SignalR!");
await conn.invoke("MarkAsRead", 1);
```

---

## 15. Troubleshooting

| Issue                                 | Solution                                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **401 on SignalR connect**            | Ensure JWT token is valid and passed via `accessTokenFactory`. Check token expiry.                                            |
| **Duplicate conversation created**    | Ensure client calls `POST /conversations` (get-or-create pattern). The DB indexes will reject true duplicates.                |
| **CORS error with SignalR**           | Current config uses `AllowAnyOrigin()`. For production with credentials, switch to `WithOrigins(...)` + `AllowCredentials()`. |
| **Migration fails**                   | Ensure PostgreSQL is running and connection string is correct in appsettings.json.                                            |
| **Messages not received via SignalR** | Ensure `JoinConversation` was called first for that conversation ID.                                                          |
| **Nullable PostId uniqueness**        | Two filtered indexes handle this correctly — see Database section above.                                                      |

---

## 16. Design Decisions

1. **Business logic in ChatService, not Hub** — Hubs are transport layers. Putting logic there makes it untestable and creates coupling. ChatService is injectable and unit-testable.

2. **DB save before broadcast** — If we broadcast first and the DB write fails, the receiver sees a message that doesn't exist. Save-first guarantees consistency. The message gets a real DB-generated ID before reaching clients.

3. **User1Id/User2Id normalization** — Without normalization, (A,B) and (B,A) would be different conversations. Always storing `min` as User1Id and `max` as User2Id prevents duplicates at the application level, reinforced by DB unique indexes.

4. **Nullable PostId uniqueness with filtered indexes** — Standard PostgreSQL unique indexes treat each NULL as distinct. Two filtered indexes split the constraint: one for non-null PostId (full triple), one for null PostId (just the user pair).

5. **Repositories extend generic `Repository<T>`** — Follows the existing codebase pattern. Specific methods are added in the interface and implementation while basic CRUD comes from the base class.

6. **Hub placed in `CAR.Infrastructure/Hubs/`** — Matches the existing `NotificationHub` location in this project. Not in the API project.

---

## 17. Future Extensions

| Feature                | Complexity | Notes                                                 |
| ---------------------- | ---------- | ----------------------------------------------------- |
| File/image attachments | Medium     | Upload via Cloudinary, store URL in message           |
| Typing indicator       | Low        | SignalR-only, no DB needed                            |
| Online status          | Medium     | Track via SignalR connection events, optionally Redis |
| Unread badge (total)   | Low        | Sum unread counts across all conversations for a user |
| Block/report user      | Medium     | New entity + filter in conversation list              |
| Message search         | Medium     | PostgreSQL full-text search on content                |
| Group chat             | High       | Requires conversation model redesign                  |
| Push notifications     | Medium     | FCM integration for offline users                     |

---

_Module version: 1.0.0 | Last updated: 2026-03-11_
