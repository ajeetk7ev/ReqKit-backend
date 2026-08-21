# ReqKit Backend - Agent Memory & Progress Tracker

> **Notice for AI Coding Agents**: Always check this document when starting or continuing work on the ReqKit backend. When completing any task, module, schema, or endpoint, update the status checkboxes and section notes below! No icons or emojis are allowed in any file across the repository.

---

## 1. Project Overview & Differentiator
**ReqKit** is an AI-agent-ready API management and testing tool (a mini Postman). Its core differentiator is exporting structured, token-dense API specifications (**ReqKit AI JSON**, **Markdown Context Prompts**, and **TypeScript Types**) that can be directly fed to AI Coding Agents (Cursor, Antigravity, Copilot, v0, Bolt) for generating accurate frontend components and API integrations.

---

## 2. Tech Stack & Environment
- **Node.js & Express**: Express 5 (ES Modules `import/export`)
- **Database**: MongoDB + Mongoose 9
- **Authentication**: JWT (Access Token + Refresh Token) + Google OAuth 2.0 (`google-auth-library`)
- **HTTP Client**: Axios (Proxy engine for executing user API calls)
- **Logger**: Winston (Production-level logger, no icons)
- **Environment File**: `backend/.env`

---

## 2.1 Architecture & Design Patterns (MANDATORY)

All backend code MUST strictly adhere to a **Controller-Service-Repository (CSR)** layer architecture using **Class-based design with `static` methods**.

### Directory Layout (`backend/src/`)
- `src/controllers/` - Handles HTTP requests, extracts parameters, formats responses.
- `src/services/` - Contains core business logic, validation, and domain rules.
- `src/repositories/` - Data Access Layer (DAL) interfacing with Mongoose models.
- `src/models/` - Pure Mongoose schemas & TypeScript/JSDoc interface definitions.
- `src/routes/` - Express router definitions binding HTTP paths to Controller static methods.
- `src/middleware/` - Auth guards, role checks, validation schemas, error handling.
- `src/utils/` - Shared helper utilities (JWT signing, response formatters, custom ApiError, logger).
- `src/config/` - Database connection (`db.js`), environment configuration.

### Mandatory Coding Pattern (Class with `static` methods)

```js
// 1. REPOSITORY (src/repositories/user.repository.js)
export class UserRepository {
  static async findByEmail(email) {
    return await User.findOne({ email });
  }
  static async create(userData) {
    return await User.create(userData);
  }
}

// 2. SERVICE (src/services/auth.service.js)
export class AuthService {
  static async registerUser({ name, email, password }) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new ApiError(400, 'User already exists');
    // Business logic...
    return await UserRepository.create({ name, email, passwordHash });
  }
}

// 3. CONTROLLER (src/controllers/auth.controller.js)
export class AuthController {
  static async register(req, res, next) {
    try {
      const user = await AuthService.registerUser(req.body);
      return res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }
}
```

---

## 3. Feature Progress Matrix

### Phase 1: Core Setup & Error Handling
- [x] `[CORE-01]` Setup Winston Logger (`src/utils/logger.js`), ApiError (`src/utils/ApiError.js`), ApiResponse (`src/utils/ApiResponse.js`), and AsyncHandler (`src/utils/asyncHandler.js`)
- [x] `[CORE-02]` Centralized Error Middleware (`src/middleware/error.middleware.js`) and 404 Handler (`src/middleware/notFound.middleware.js`)
- [x] `[CORE-03]` Express App Setup (`src/app.js`), MongoDB Connection (`src/config/db.js`), and Server (`src/server.js`)
- [x] `[AUTH-01]` User Mongoose Schema (`src/models/user.model.js`)
- [x] `[AUTH-02]` User Repository (`src/repositories/user.repository.js`)
- [x] `[AUTH-03]` Auth Service (`src/services/auth.service.js`) with PasswordUtil, JwtUtil, and AuthValidation
- [x] `[AUTH-04]` Auth Controller (`src/controllers/auth.controller.js`) with HTTP-only Cookies and Tokens
- [x] `[AUTH-05]` Auth Routes (`src/routes/auth.routes.js`), Passport Google OAuth, and Auth Guard Middleware (`src/middleware/auth.middleware.js`)

### Phase 2: Workspaces & Collaboration (HTTP REST)
- [x] `[WS-01]` Workspace Schema (`src/models/workspace.model.js`)
- [x] `[WS-02]` Create Workspace (`POST /api/v1/workspaces`)
- [x] `[WS-03]` Get User Workspaces (`GET /api/v1/workspaces`) - Auto-initializes personal workspace if empty
- [x] `[WS-04]` Get Workspace Details (`GET /api/v1/workspaces/:id`) with role calculations
- [x] `[WS-05]` Update Workspace (`PUT /api/v1/workspaces/:id`)
- [x] `[WS-06]` Add/Manage Workspace Members (`POST /api/v1/workspaces/:id/members`, `PATCH /api/v1/workspaces/:id/members/:userId`)
- [x] `[WS-07]` Remove Workspace Member (`DELETE /api/v1/workspaces/:id/members/:userId`)

### Phase 3: Collections & Folders
- [x] `[COLL-01]` Collection Schema (`src/models/collection.model.js`)
- [ ] `[COLL-02]` Create Collection (`POST /api/v1/collections`)
- [ ] `[COLL-03]` List Collections in Workspace (`GET /api/v1/collections/workspace/:workspaceId`)
- [ ] `[COLL-04]` Create Folder/Sub-collection (`POST /api/v1/collections/:id/folders`)
- [ ] `[COLL-05]` Update / Delete Collection (`PUT/DELETE /api/v1/collections/:id`)

### Phase 4: Requests & Live Runner
- [x] `[REQ-01]` Request Schema (`src/models/request.model.js`)
- [ ] `[REQ-02]` Create / Update / Delete Request Endpoints (`/api/v1/requests`)
- [ ] `[REQ-03]` Proxy HTTP Request Executor (`POST /api/v1/requests/execute`) - Executes external HTTP requests safely via Axios
- [x] `[REQ-04]` ResponseExample Schema (`src/models/responseExample.model.js`) - Save Success (2xx) or Error (4xx/5xx) snapshots for AI exports

### Phase 5: AI-Agent Export Engine
- [ ] `[EXP-01]` Export Single Request (`GET /api/v1/export/request/:requestId`)
- [ ] `[EXP-02]` Export Sub-collection / Folder (`GET /api/v1/export/folder/:folderId`)
- [ ] `[EXP-03]` Export Complete Collection (`GET /api/v1/export/collection/:collectionId`)
- [ ] `[EXP-04]` TypeScript Type Generator Service (`src/services/typeGenerator.service.js`)

---

## 4. Database Schema Specifications

### `User` Schema
```js
{
  name: String (required),
  email: String (required, unique, indexed),
  passwordHash: String (optional if Google Auth),
  googleId: String (optional),
  avatar: String,
  createdAt: Date
}
```

### `Workspace` Schema
```js
{
  name: String (required),
  description: String,
  owner: ObjectId (ref: 'User', required),
  members: [
    {
      user: ObjectId (ref: 'User'),
      role: String (enum: ['owner', 'editor', 'viewer'], default: 'editor')
    }
  ],
  createdAt: Date
}
```

### `Collection` Schema
```js
{
  workspace: ObjectId (ref: 'Workspace', required),
  name: String (required),
  description: String,
  variables: [{ key: String, value: String }],
  folders: [
    {
      _id: ObjectId,
      name: String,
      description: String,
      parentId: ObjectId (optional for nested folders)
    }
  ],
  createdAt: Date
}
```

### `Request` Schema
```js
{
  collectionId: ObjectId (ref: 'Collection', required),
  folderId: ObjectId (optional),
  name: String (required),
  description: String,
  method: String (enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  url: String (required),
  headers: [{ key: String, value: String, enabled: Boolean }],
  queryParams: [{ key: String, value: String, enabled: Boolean }],
  pathParams: [{ key: String, value: String }],
  auth: {
    type: String (enum: ['none', 'bearer', 'basic', 'apikey', 'inherit']),
    config: Object
  },
  body: {
    type: String (enum: ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw']),
    rawContent: String,
    formData: [{ key: String, value: String }]
  },
  responses: {
    success: {
      status: Number,
      description: String,
      headers: Object,
      sampleBody: Schema.Types.Mixed
    },
    failures: [
      {
        status: Number,
        description: String,
        sampleBody: Schema.Types.Mixed
      }
    ]
  }
}
```

---

## 5. Instructions for AI Agents Updating Memory
1. When starting work on a feature, change status to `[🔄]`.
2. When the feature is implemented and tested, change status to `[✅]`.
3. If new endpoints or schema fields are added, update Section 3 and Section 4.
4. Keep all log updates clean and concise. Do NOT use icons or emojis in any file.
