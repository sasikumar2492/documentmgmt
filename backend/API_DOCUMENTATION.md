# Pharma DMS – API Documentation (Frontend)

**Base URL:** `http://localhost:4000/api` (or your `VITE_API_URL`)  
**Authentication:** JWT Bearer token (except login, health, forgot-password, reset-password)

---

## Completed APIs Overview

All endpoints currently implemented and available for the frontend and Postman. Includes: user-scoped request list (view=library for Document Library), reviewer→approver auto-advance on PATCH status=reviewed, activity API with requestStatus and per-entry status, user-scoped document list when request_id is omitted.

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | /api/health | No | Health check |
| 2 | POST | /api/auth/login | No | Login, get JWT |
| 3 | GET | /api/auth/me | Yes | Current user profile |
| 4 | POST | /api/auth/refresh | Yes | Re-issue JWT |
| 5 | POST | /api/auth/forgot-password | No | Request password reset |
| 6 | POST | /api/auth/reset-password | No | Reset password with token |
| 7 | GET | /api/dashboard/summary | Yes | Dashboard: requestCountsByStatus, recentRequests, recentTemplates, documentTotals |
| 8 | GET | /api/departments | Yes | List departments |
| 9 | GET | /api/users | Yes | List users |
| 10 | POST /api/users/validate-for-document |
| 11 | GET | /api/templates | Yes | List templates |
| 11 | GET | /api/templates/:id | Yes | Get template |
| 12 | GET | /api/templates/:id/file | Yes | Template file stream (binary) |
| 13 | GET | /api/templates/:id/download | Yes | Presigned S3 download URL (or 404) |
| 14 | POST | /api/templates | Yes | Upload template (multipart) |
| 15 | PATCH | /api/templates/:id | Yes | Update template |
| 16 | GET | /api/requests | Yes | List requests; view=library for Document Library (user-scoped, excludes draft/pending); filters, search, pagination, sort |
| 17 | GET | /api/requests/:id | Yes | Get request |
| 18 | GET | /api/requests/:id/activity | Yes | Request activity; response { requestStatus, activity }; each entry has status (completed, in_progress, approved, rejected, needs_revision) |
| 19 | GET | /api/requests/:id/workflow | Yes | Request workflow instance and steps |
| 20 | POST | /api/requests/:id/workflow/actions | Yes | Workflow action (init, approve, reject, request_revision) |
| 21 | POST | /api/requests | Yes | Create request |
| 22 | PATCH | /api/requests/:id | Yes | Update request; status=reviewed auto-advances assigned_to to next in review_sequence (reviewer→approver) |
| 23 | DELETE | /api/requests/:id | Yes | Delete request (and linked documents) |
| 24 | GET | /api/requests/:id/page-remarks | Yes | List page-level remarks for a request |
| 25 | PUT | /api/requests/:id/page-remarks/:page | Yes | Save/upsert page remark |
| 26 | GET | /api/requests/:id/form-data | Yes | Get form data (data, formSectionsSnapshot, updatedAt, departmentName, preparatorName) |
| 27 | PUT | /api/requests/:id/form-data | Yes | Save form data; response same shape as GET |
| 28 | GET | /api/documents | Yes | List documents; user-scoped by role when request_id omitted (preparator/reviewer/approver/admin) |
| 29 | GET | /api/documents/:id | Yes | Get document |
| 30 | GET | /api/documents/:id/file | Yes | Document file stream |
| 31 | POST | /api/documents | Yes | Upload document (multipart) |
| 32 | PATCH | /api/documents/:id | Yes | Update document status |
| 33 | GET | /api/audit-logs | Yes | List audit logs |
| 34 | GET | /api/workflows | Yes | List workflows |
| 35 | GET | /api/workflows/:id | Yes | Get workflow |
| 36 | GET | /api/workflows/:id/steps | Yes | List workflow steps |
| 37 | PUT | /api/workflows/:id/steps | Yes | Replace workflow steps |
| 38 | POST | /api/workflows | Yes | Create workflow |
| 39 | PATCH | /api/workflows/:id | Yes | Update workflow |
| 40 | GET | /api/workflow-rules | Yes | List workflow rules |
| 41 | GET | /api/workflow-rules/:id | Yes | Get workflow rule |
| 42 | POST | /api/workflow-rules | Yes | Create workflow rule |
| 43 | PATCH | /api/workflow-rules/:id | Yes | Update workflow rule |

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard](#2-dashboard)
3. [Health](#3-health)
4. [Departments](#4-departments)
5. [Users](#5-users)
6. [Templates](#6-templates)
7. [Requests](#7-requests)
8. [Form Data](#8-form-data)
9. [Documents](#9-documents)
10. [Audit Logs](#10-audit-logs)
11. [Workflows](#11-workflows)
12. [Workflow Rules](#12-workflow-rules)
13. [Error Responses](#13-error-responses)

---

## Authentication

All endpoints except **POST /auth/login** and **GET /health** require the header:

```
Authorization: Bearer <token>
```

If the token is missing or invalid, the API returns `401` with `{ "error": "Missing or invalid authorization header" }` or `{ "error": "Invalid or expired token" }`.

---

## 1. Authentication

### POST /api/auth/login

Authenticate and get a JWT.

**Auth required:** No

**Request body (JSON):**

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| username | string | Yes      | User login  |
| password | string | Yes      | Password    |

**Example:**

```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Success (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin",
    "departmentId": "uuid-or-null",
    "fullName": "Admin User"
  }
}
```

**Errors:**

- `400` – `{ "error": "Username and password required" }`
- `401` – `{ "error": "Invalid username or password" }`
- `500` – `{ "error": "Login failed" }`

---

### GET /api/auth/me

Get the current user profile.

**Auth required:** Yes (Bearer token)

**Success (200):**

```json
{
  "id": "uuid",
  "username": "admin",
  "role": "admin",
  "departmentId": "uuid-or-null",
  "fullName": "Admin User"
}
```

**Errors:**

- `401` – Missing/invalid token
- `404` – `{ "error": "User not found" }`
- `500` – `{ "error": "Failed to get user" }`

---

### POST /api/auth/refresh

Re-issue a JWT using the current Bearer token. Use when the token is about to expire.

**Auth required:** Yes (valid Bearer token)

**Request body:** None (or empty JSON).

**Success (200):** Same as login: `{ "token": "new-jwt...", "user": { ... } }`.

**Errors:**

- `401` – Missing or expired token
- `500` – `{ "error": "Refresh failed" }`

---

### POST /api/auth/forgot-password

Request a password reset. Sends (or in dev logs) a reset token for the given username.

**Auth required:** No

**Request body (JSON):**

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| username | string | Yes      | User login  |

**Success (200):** `{ "message": "If the user exists, a reset link has been sent." }` (same message regardless for privacy).

**Errors:**

- `400` – `{ "error": "Username required" }`
- `500` – `{ "error": "Failed to process request" }`

---

### POST /api/auth/reset-password

Reset password using the token received from forgot-password (e.g. via email or dev log).

**Auth required:** No

**Request body (JSON):**

| Field       | Type   | Required | Description        |
|-------------|--------|----------|--------------------|
| token      | string | Yes      | Reset token        |
| newPassword | string | Yes      | New password       |

**Success (200):** `{ "message": "Password reset successfully." }`.

**Errors:**

- `400` – `{ "error": "Token and new password required" }` or `{ "error": "Invalid or expired token" }`
- `500` – `{ "error": "Failed to reset password" }`

---

## 2. Dashboard

### GET /api/dashboard/summary

Get dashboard summary, including counts for AI Conversion-style cards (Total Documents, Templates, Approved, Pending), request counts by status, recent requests, and recent templates.

**Auth required:** Yes

**Query parameters:**

| Parameter     | Type   | Required | Description                          |
|---------------|--------|----------|--------------------------------------|
| limit         | number | No       | Max recent items (default 10)        |
| days          | number | No       | Filter recent by last N days (e.g. 7, 30, 90) |
| department_id | string | No       | Filter by department UUID           |
| assigned_to   | string | No       | Filter by assignee user UUID        |

**Success (200):**

```json
{
  "requestCountsByStatus": { "draft": 5, "submitted": 3, "approved": 10 },
  "recentRequests": [
    {
      "id": "uuid",
      "requestId": "REQ-2026-12345",
      "title": "Engineering Approval 2026",
      "status": "draft",
      "departmentName": "QA",
      "createdAt": "2026-03-06T10:00:00.000Z"
    }
  ],
  "recentTemplates": [
    {
      "id": "uuid",
      "fileName": "RSD-SOP-031 IT Support.docx",
      "status": "approved",
      "uploadDate": "2026-03-05T09:00:00.000Z",
      "updatedAt": "2026-03-05T09:15:00.000Z"
    }
  ],
  "templateCountsByStatus": {
    "draft": 2,
    "approved": 8
  },
  "templateDraftCount": 2,
  "documentTotals": 25
}
```

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to get dashboard summary" }`

---

## 3. Health

### GET /api/health

Service health check.

**Auth required:** No

**Success (200):**

```json
{
  "ok": true,
  "service": "pharma-dms-api"
}
```

---

## 4. Departments

### GET /api/departments

List all departments.

**Auth required:** Yes

**Success (200):**

```json
[
  {
    "id": "uuid",
    "name": "Quality Assurance",
    "code": "QA"
  }
]
```

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to list departments" }`

---

## 5. Users

### GET /api/users

List users (for assignee/reviewer selection and Admin User Management).

**Auth required:** Yes

**Success (200):** Array of user DTOs:

```json
[
  {
    "id": "uuid",
    "username": "john",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "role": "preparator",
    "departmentId": "uuid-or-null",
    "departmentName": "Quality Assurance"
  }
]
```

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to list users" }`

---

### POST /api/users

Create a new user. Used by the Admin Dashboard **Add New User** flow and for seeding via Postman.

**Auth required:** Yes (admin role)

**Request body (JSON):**

| Field         | Type   | Required | Description                                                                 |
|---------------|--------|----------|-----------------------------------------------------------------------------|
| username      | string | Yes      | Unique username/login                                                       |
| password      | string | Yes      | Plain-text password (server stores as bcrypt hash)                          |
| role          | string | Yes      | One of: `admin`, `preparator`, `reviewer`, `approver`, `requestor`, `manager` |
| full_name     | string | No       | Full name for display                                                       |
| email         | string | No       | Email address (used for notifications, optional in Phase 1)                |
| department_id | string | No       | Department UUID (must exist in `departments` table if provided)            |

**Example request:**

```json
{
  "username": "newuser",
  "password": "SecurePass123",
  "full_name": "New User",
  "email": "newuser@example.com",
  "role": "requestor",
  "department_id": "a0000001-0000-0000-0000-000000000001"
}
```

**Success (201):** Created user DTO:

```json
{
  "id": "b0000010-0000-0000-0000-000000000001",
  "username": "newuser",
  "fullName": "New User",
  "email": "newuser@example.com",
  "role": "requestor",
  "departmentId": "a0000001-0000-0000-0000-000000000001",
  "departmentName": "Engineering"
}
```

**Errors:**

- `400` – `{ "error": "Username and password are required" }`, `{ "error": "Role must be one of: admin, preparator, reviewer, approver, requestor, manager" }`, or other validation messages.
- `401` – Missing/invalid token.
- `409` – `{ "error": "Username already exists" }`.
- `500` – `{ "error": "Failed to create user" }`.

---

### POST /api/users/validate-for-document

Secondary verification endpoint to confirm that a user (by **username OR email + password**) is valid before performing critical actions (e.g. **review/approve** from the Document Library). This endpoint also writes an entry to `audit_logs` for the associated **request**, so it appears in `GET /api/requests/:id/activity` (View Activity).

**Auth required:** Yes

**Request body (JSON):**

| Field      | Type   | Required | Description                                                  |
|------------|--------|----------|--------------------------------------------------------------|
| identifier | string | Yes      | Username **or** email entered in the UI                     |
| password   | string | Yes      | User password (plain text; compared via bcrypt)             |
| documentId | string | Yes      | Request ID (UUID) from Document Library UI (activity scope) |

**Example request:**

```json
{
  "identifier": "reviewer@example.com",
  "password": "ReviewerPass123",
  "documentId": "doc-2026-0001"
}
```

**Success (200):** User verified; audit log entry written with:

- `entity_type = "request"`
- `entity_id = documentId` (the request UUID)
- `action = "user_validated_for_review"`
- `details` containing `username` and `email`

```json
{
  "username": "reviewer1",
  "email": "reviewer@example.com",
  "status": "verified"
}
```

**Errors:**

- `400` – `{ "error": "identifier, password, and documentId are required" }`
- `401` – `{ "error": "Invalid email or password" }` (also logs `user_validation_failed` to `audit_logs` for that request)
- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to validate user for document" }`

---

## 6. Templates

### GET /api/templates

List templates with optional filters.

**Auth required:** Yes

**Query parameters:**

| Parameter     | Type   | Required | Description        |
|---------------|--------|----------|--------------------|
| department_id | string | No       | Filter by department UUID |
| status        | string | No       | `draft` or `approved`    |

**Success (200):**

```json
[
  {
    "id": "uuid",
    "fileName": "SOP-Template.docx",
    "filePath": "templates/xxx.docx",
    "fileSize": "12345",
    "department": "uuid-or-null",
    "departmentName": "QA",
    "status": "draft",
    "parsedSections": null,
    "uploadedBy": "uuid",
    "uploadDate": "2026-02-26T10:00:00.000Z",
    "updatedAt": "2026-02-26T10:00:00.000Z"
  }
]
```

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to list templates" }`

---

### GET /api/templates/:id

Get a single template by ID.

**Auth required:** Yes

**Success (200):** Same shape as one item in the list above.

**Errors:**

- `401` – Missing/invalid token
- `404` – `{ "error": "Template not found" }`
- `500` – `{ "error": "Failed to get template" }`

---

### GET /api/templates/:id/file

Download template file (binary stream). Use for preview or Syncfusion.

**Auth required:** Yes

**Success (200):** File stream with appropriate `Content-Type` and `Content-Disposition`.

**Errors:**

- `401` – Missing/invalid token
- `404` – `{ "error": "Template not found" }` or `{ "error": "File not found on disk" }`
- `500` – `{ "error": "Failed to serve file" }`

---

### GET /api/templates/:id/download

Get a presigned download URL when the template file is stored in S3. If the template is stored locally only, returns 404.

**Auth required:** Yes

**Query parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| expiresIn | number | No       | URL validity in seconds (max 86400, default from server) |

**Success (200):**

```json
{
  "downloadUrl": "https://...",
  "expiresAt": "2026-02-26T11:00:00.000Z"
}
```

**Errors:**

- `401` – Missing/invalid token
- `404` – `{ "error": "Template not found" }` or template not in S3
- `500` – `{ "error": "Failed to get download URL" }`

---

### POST /api/templates

Upload a new template.

**Auth required:** Yes

**Content-Type:** `multipart/form-data`

**Body (form):**

| Field         | Type | Required | Description           |
|---------------|------|----------|-----------------------|
| file          | file | Yes      | Word/Excel/PDF file   |
| department_id | string | No    | Department UUID       |

**Success (201):**

```json
{
  "id": "uuid",
  "fileName": "SOP.docx",
  "filePath": "templates/xxx.docx",
  "fileSize": "12345",
  "department": "uuid-or-null",
  "status": "draft",
  "uploadDate": "2026-02-26T10:00:00.000Z",
  "updatedAt": "2026-02-26T10:00:00.000Z"
}
```

**Errors:**

- `400` – `{ "error": "Expected multipart/form-data" }` or `{ "error": "No file uploaded" }`
- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to upload template" }`

---

### PATCH /api/templates/:id

Update template metadata and/or parsed sections.

**Auth required:** Yes

**Request body (JSON):** All fields optional.

| Field          | Type   | Description                    |
|----------------|--------|--------------------------------|
| file_name      | string | Display file name             |
| department_id  | string | Department UUID                |
| status         | string | `draft` or `approved`         |
| parsed_sections | array/object | Form sections (JSONB) |

**Example:**

```json
{
  "status": "approved",
  "parsed_sections": [ { "title": "Section 1", "fields": [] } ]
}
```

**Success (200):** Same shape as GET template (includes `parsedSections`).

**Errors:**

- `400` – `{ "error": "No fields to update" }`
- `401` – Missing/invalid token
- `404` – `{ "error": "Template not found" }`
- `500` – `{ "error": "Failed to update template" }`

---

## 7. Requests

### GET /api/requests

List requests (for Raise Request / Document Library). Supports filters, search, pagination, and sort for role-specific libraries.

**Auth required:** Yes

**Query parameters:**

| Parameter     | Type   | Required | Description        |
|---------------|--------|----------|--------------------|
| view          | string | No       | `library` = Document Library: only requests the user created or is assigned to; status excludes `draft` and `pending`. Omit for full list (admin) or other views. |
| department_id | string | No       | Filter by department UUID |
| status        | string | No       | e.g. `draft`, `submitted`, `reviewed`, `needs_revision`, `rejected`, `approved` |
| q             | string | No       | Search in title, request_id, department name (ILIKE) |
| assigned_to   | string | No       | Filter by assignee user UUID |
| from_date     | string | No       | Filter created_at >= (ISO date/timestamptz) |
| to_date       | string | No       | Filter created_at <= (ISO date/timestamptz) |
| sortBy        | string | No       | `created_at`, `title`, `status`, `request_id`, `department_name`, `assigned_to_name`, `updated_at` (default `created_at`) |
| sortOrder     | string | No       | `asc` or `desc` (default `desc`) |
| page          | number | No       | Page number (use with pageSize for paginated response) |
| pageSize      | number | No       | Page size, max 500 (use with page for paginated response) |

When both `page` and `pageSize` are provided, the response is `{ data, total, page, pageSize }`. Otherwise the response is an array of requests.

**Document Library flow (GET /api/requests?view=library):**

- **Visibility (non-admin):** A request appears in the list if the user **created** it, is **assigned** to it, or is in **review_sequence** (so the reviewer continues to see it after handoff to the approver).
- Preparator creates a request and sets one reviewer and one approver in `review_sequence` (e.g. `[reviewerUuid, approverUuid]`) and sets `assigned_to` to the reviewer. Document Library shows the request with status and **Assigned to** = reviewer.
- **Reviewer** actions: set `status` to `reviewed` (pass to approver), `needs_revision`, or `rejected`. When the reviewer sets status to **reviewed**, the API automatically advances `assigned_to` to the next user in `review_sequence` (the approver). The request remains visible to the reviewer because they are in `review_sequence`. Document Library shows **Assigned to** = approver and status = reviewed.
- **Approver** actions: set `status` to `approved`, `needs_revision`, or `rejected`. Document Library reflects the final status accordingly.

**Success (200):** Array of request DTOs, or when paginated: `{ "data": [...], "total": 42, "page": 1, "pageSize": 10 }`. Each item:

```json
[
  {
    "id": "uuid",
    "templateId": "uuid",
    "requestId": "REQ-2026-12345",
    "title": "My Request",
    "departmentId": "uuid-or-null",
    "departmentName": "QA",
    "status": "draft",
    "createdBy": "uuid",
    "assignedTo": "uuid-or-null",
    "assignedToName": "John Doe",
    "reviewSequence": ["uuid1", "uuid2"],
    "priority": "high",
    "submissionComments": null,
    "createdAt": "2026-02-26T10:00:00.000Z",
    "updatedAt": "2026-02-26T10:00:00.000Z",
    "templateFileName": "SOP.docx",
    "fileSize": "12345"
  }
]
```

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to list requests" }`

---

### GET /api/requests/:id

Get a single request by ID.

**Auth required:** Yes

**Success (200):** Same shape as one item in the list above.

**Errors:**

- `401` – Missing/invalid token
- `404` – `{ "error": "Request not found" }`
- `500` – `{ "error": "Failed to get request" }`

---

### GET /api/requests/:id/activity

Get audit log entries for a single request (activity timeline).

**Auth required:** Yes

**Path:** `:id` is the **request UUID**.

**Query parameters:**

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| limit     | number | No       | Max entries (default from server) |

**Success (200):** Object with current request status and activity list (for dynamic status on View Audit Log page).

| Field          | Type   | Description |
|----------------|--------|-------------|
| requestStatus  | string | **Current** request status (e.g. draft, pending, submitted, approved, rejected, needs_revision). Use for page-level "Current status" in UI. |
| activity       | array  | Audit log entries for this request (see below). |

Each **activity** entry:

| Field       | Type   | Description |
|------------|--------|-------------|
| id         | string | Log entry ID |
| timestamp  | string | ISO 8601 created_at |
| action     | string | e.g. document_uploaded, request_created, reviewer_assigned, review_started, revisions_requested, request_approved, request_rejected, page_changed |
| entityType | string | request |
| entityId   | string | Request UUID |
| entityName | string | Request display id or name |
| user       | string | User full name or username |
| userRole   | string | User role (for UI badge) |
| department | string | User department name |
| details    | string | Human-readable description for UI |
| requestId  | string | Request display id (e.g. REQ-2026-10001) |
| title      | string | Title derived from action (e.g. "Document Uploaded") |
| status     | string | **Dynamic** per action: `completed`, `in_progress`, `approved`, `rejected`, `needs_revision` (for timeline badges) |

**Errors:**

- `401` – Missing/invalid token
- `404` – Request not found
- `500` – `{ "error": "Failed to get request activity" }`

---

### GET /api/requests/:id/workflow

Get workflow instance and steps for a request (runtime progression).

**Auth required:** Yes

**Success (200):** `{ id, requestId, workflowId, aiGeneratedDefinition, createdAt, steps: [...] }` or `{ requestId, workflowId: null, steps: [] }` when none. Each step: `id, stepOrder, name, assignedToUserId, assignedToName, status (pending|current|completed|rejected), startedAt, completedAt, metadata`.

**Errors:** `401`, `404` (Request not found), `500`

---

### POST /api/requests/:id/workflow/actions

Perform a workflow action on a request.

**Auth required:** Yes

**Request body (JSON):** `action` (required): `init`, `set_workflow`, `approve`, `reject`, `request_revision`. For `init`/`set_workflow`: optional `workflow_id`, `ai_generated_definition`. Optional `comment` for approve/reject/revision.

**Success (200):** For `init`/`set_workflow`: workflow instance with steps. For `approve`/`reject`/`request_revision`: updated request DTO.

**Errors:** `400` (Invalid action), `404` (Request not found), `500`

---

### POST /api/requests

Create a new request from a template (Raise Request).

**Auth required:** Yes

**Request body (JSON):**

| Field         | Type   | Required | Description     |
|---------------|--------|----------|-----------------|
| template_id   | string | Yes      | Template UUID   |
| title         | string | No       | Request title   |
| department_id | string | No       | Department UUID |

**Example:**

```json
{
  "template_id": "uuid-of-template",
  "title": "Annual Review 2026",
  "department_id": "uuid-of-department"
}
```

**Success (201):** Full request DTO (same shape as GET /api/requests/:id), e.g.:

```json
{
  "id": "uuid",
  "templateId": "uuid",
  "requestId": "REQ-2026-12345",
  "title": "Annual Review 2026",
  "departmentId": "uuid-or-null",
  "departmentName": "QA",
  "status": "draft",
  "createdBy": "uuid",
  "assignedTo": null,
  "assignedToName": null,
  "templateFileName": "SOP.docx",
  "createdAt": "2026-02-26T10:00:00.000Z",
  "updatedAt": "2026-02-26T10:00:00.000Z"
}
```

**Errors:**

- `400` – `{ "error": "template_id required" }`
- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to create request" }`

---

### PATCH /api/requests/:id

Update request (status, assignment, priority, etc.).

**Auth required:** Yes

Additional validation for review/approval:

- The Bearer token must map to an existing user record. If the JWT user no longer exists in `users`, the API returns `401` with `{ "error": "Authenticated user not found", "code": "USER_NOT_FOUND" }` and **does not** update the request.
- For status and assignment changes (used by the Document Library review/approval actions), audit log entries include a full `actorUser` snapshot in `details` (id, username, fullName, role, departmentId, departmentName) so the View Audit Log screen can show precise who-did-what information even if the user later changes or is deleted.

**Request body (JSON):** All fields optional. API accepts both `snake_case` and `camelCase` for some fields.

| Field              | Type   | Description                    |
|--------------------|--------|--------------------------------|
| title              | string | Request title                  |
| status             | string | See status values below        |
| assigned_to / assignedTo | string | Assignee user UUID   |
| review_sequence / reviewSequence | array | User UUIDs in order (e.g. [reviewer, approver]) |
| priority           | string | e.g. high, medium, low         |
| submission_comments / submissionComments | string | Comments on submit |

**Status values and flow:**

- **Reviewer** may set: `reviewed` (pass to approver), `needs_revision`, `rejected`.
- **Approver** may set: `approved`, `needs_revision`, `rejected`.
- When the client sets `status` to **reviewed**, the API automatically sets `assigned_to` to the **next user** in the request’s `review_sequence` (e.g. from reviewer to approver). The client does not need to send `assigned_to` in that case; the response will contain the updated assignee. Document Library (GET /api/requests?view=library) reflects the new assignee and status.

**Example:**

```json
{
  "status": "submitted",
  "assigned_to": "uuid-of-reviewer",
  "reviewSequence": ["uuid1", "uuid2"],
  "priority": "high",
  "submissionComments": "Ready for review"
}
```

**Example (reviewer passes to approver):** Send only status; assignee is advanced by the API.

```json
{
  "status": "reviewed"
}
```

**Success (200):**

```json
{
  "id": "uuid",
  "requestId": "REQ-2026-12345",
  "title": "My Request",
  "status": "submitted",
  "assignedTo": "uuid",
  "reviewSequence": ["uuid1", "uuid2"],
  "priority": "high",
  "submissionComments": "Ready for review",
  "updatedAt": "2026-02-26T10:00:00.000Z"
}
```

**Example 401 when JWT user no longer exists (extra authentication validation for Document Library review/approve):**

```json
{
  "error": "Authenticated user not found",
  "code": "USER_NOT_FOUND"
}
```

**Errors:**

- `400` – `{ "error": "No fields to update" }`
- `401` – Missing/invalid token, or `{ "error": "Authenticated user not found", "code": "USER_NOT_FOUND" }`
- `404` – `{ "error": "Request not found" }`
- `500` – `{ "error": "Failed to update request", "detail": "..." }`

---

### DELETE /api/requests/:id

Delete a request and any linked documents. This is used by the Document Library delete action (once wired) to remove a request and its associated document records.

**Auth required:** Yes

**Path:** `:id` is the **request UUID**.

**Success (204):** No content body.

Side effects:

- Deletes all `documents` rows where `request_id = :id`.
- Deletes the `requests` row itself.
- Inserts an audit log entry:
  - `entity_type = 'request'`
  - `action = 'request_deleted'`
  - `details = { requestId, title }`

**Errors:**

- `401` – Missing/invalid token
- `404` – `{ "error": "Request not found" }`
- `500` – `{ "error": "Failed to delete request" }`

---

### GET /api/requests/:id/page-remarks

List all page-level remarks for a request (used by the Raise Request / Document Library editor to show which pages have comments).

**Auth required:** Yes

**Path:** `:id` is the **request UUID**.

**Success (200):** Array of remark objects, ordered by `page_number`:

```json
[
  {
    "id": "uuid",
    "requestId": "uuid-of-request",
    "pageNumber": 1,
    "remark": "Enter your observations, requested changes, or notes for this page...",
    "createdBy": "uuid-or-null",
    "updatedBy": "uuid-or-null",
    "createdAt": "2026-03-06T10:00:00.000Z",
    "updatedAt": "2026-03-06T10:05:00.000Z"
  }
]
```

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to list page remarks" }`

---

### PUT /api/requests/:id/page-remarks/:page

Create or update a remark for a specific page of a request. This API upserts by `(request_id, page_number)`.

**Auth required:** Yes

**Path parameters:**

| Parameter | Type | Required | Description         |
|----------|------|----------|---------------------|
| id       | string | Yes    | Request UUID        |
| page     | number | Yes    | 1-based page number |

**Request body (JSON):**

| Field  | Type   | Required | Description                                   |
|--------|--------|----------|-----------------------------------------------|
| remark | string | Yes      | Free-text remark for the specified page      |

**Example:**

```json
{
  "remark": "Please double-check the revision date on this page."
}
```

**Success (200):** Remark object:

```json
{
  "id": "uuid",
  "requestId": "uuid-of-request",
  "pageNumber": 1,
  "remark": "Please double-check the revision date on this page.",
  "createdBy": "uuid-or-null",
  "updatedBy": "uuid-or-null",
  "createdAt": "2026-03-06T10:00:00.000Z",
  "updatedAt": "2026-03-06T10:10:00.000Z"
}
```

**Errors:**

- `400` – `{ "error": "Invalid page number" }`
- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to save page remark" }`

---

## 8. Form Data

### GET /api/requests/:id/form-data

Get form data for a request (dynamic form payload).

**Auth required:** Yes

**Path:** `:id` is the **request UUID** (not `requestId` like REQ-2026-12345).

**Success (200):**

Response includes `departmentName` and `preparatorName` (from the request’s department and created_by user) for use in the UI sidebar (e.g. DOCUMENT COMPLIANCE panel).

```json
{
  "data": {},
  "formSectionsSnapshot": null,
  "updatedAt": null,
  "departmentName": "Engineering",
  "preparatorName": "John Smith"
}
```

When data exists:

```json
{
  "data": { "field_1": "value1", "field_2": "value2" },
  "formSectionsSnapshot": [ { "title": "Section 1", "fields": [] } ],
  "updatedAt": "2026-02-26T10:00:00.000Z",
  "departmentName": "Engineering",
  "preparatorName": "John Smith"
}
```

**Response body fields:**

| Field                 | Type           | Description |
|-----------------------|----------------|-------------|
| data                  | object         | Key-value form data (all pages). Empty `{}` when none saved. |
| formSectionsSnapshot  | array \| null  | Snapshot of form sections (e.g. from template). Each item may have `id`, `title`, `fields`. |
| updatedAt             | string \| null | ISO 8601 timestamp of last form-data update. |
| departmentName        | string \| null | Name of the request’s department (for UI e.g. SITE FACILITY). |
| preparatorName        | string \| null | Full name of the user who created the request (for UI e.g. PREPARED BY). |

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to get form data" }`

---

### PUT /api/requests/:id/form-data

Create or update form data for a request. This powers **Save Draft** and restoring partially filled forms. It can also optionally record page-level tracking events together with the save.

**Auth required:** Yes

**Path:** `:id` is the **request UUID**.

**Request body (JSON):**

| Field                | Type    | Required | Description                                                                 |
|----------------------|---------|----------|-----------------------------------------------------------------------------|
| data                 | object  | No       | Key-value form data for all pages                                          |
| formSectionsSnapshot | any     | No       | Snapshot of form sections (e.g. from template)                             |
| pageEvents           | object[]| No       | Optional array of page tracking events to record in the audit log          |

Each **pageEvents** entry (when provided) has:

| Field      | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| pageNumber| number | Yes      | 1-based page index that was edited              |
| eventType | string | No       | `view` or `edit` (defaults to `edit`)           |
| summary   | string | No       | Optional free-text summary of what changed      |

**Example:**

```json
{
  "data": { "field_1": "value1", "field_2": "value2" },
  "formSectionsSnapshot": [ { "title": "Section 1", "fields": [] } ],
  "pageEvents": [
    {
      "pageNumber": 1,
      "eventType": "edit",
      "summary": "Updated request header information on Page 1."
    }
  ]
}
```

**Success (200):** Same response shape as GET form-data (see above): `data`, `formSectionsSnapshot`, `updatedAt`, `departmentName`, `preparatorName`. Any `pageEvents` items are written to `audit_logs` with `action='page_changed'` for the Activity Log.

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to save form data" }`

---

## 9. Documents

### GET /api/documents

List documents with optional filters. When **request_id** is not provided, results are **user-scoped** by role: preparator sees documents for requests they created; reviewer/approver see documents for requests they are assigned to; admin sees all.

**Auth required:** Yes

**Query parameters:**

| Parameter     | Type   | Required | Description           |
|---------------|--------|----------|------------------------|
| request_id    | string | No       | Filter by request UUID. If omitted, list is user-scoped (see above). |
| status        | string | No       | e.g. draft, approved   |
| department_id | string | No       | Filter by department   |

**Success (200):**

```json
[
  {
    "id": "uuid",
    "requestId": "uuid-or-null",
    "fileName": "report.docx",
    "filePath": "documents/xxx.docx",
    "fileType": "docx",
    "version": 1,
    "status": "draft",
    "createdBy": "uuid",
    "createdAt": "2026-02-26T10:00:00.000Z",
    "updatedAt": "2026-02-26T10:00:00.000Z"
  }
]
```

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to list documents" }`

---

### GET /api/documents/:id

Get a single document by ID.

**Auth required:** Yes

**Success (200):** Same shape as one item in the list above.

**Errors:**

- `401` – Missing/invalid token
- `404` – `{ "error": "Document not found" }`
- `500` – `{ "error": "Failed to get document" }`

---

### GET /api/documents/:id/file

Download document file (binary stream).

**Auth required:** Yes

**Success (200):** File stream with appropriate `Content-Type` and `Content-Disposition`.

**Errors:**

- `401` – Missing/invalid token
- `404` – `{ "error": "Document not found" }` or `{ "error": "File not found on disk" }`
- `500` – `{ "error": "Failed to serve file" }`

---

### POST /api/documents

Upload a new document (creates version 1) or new version.

**Auth required:** Yes

**Content-Type:** `multipart/form-data`

**Body (form):**

| Field      | Type   | Required | Description        |
|------------|--------|----------|--------------------|
| file       | file   | Yes      | PDF, DOCX, or XLSX |
| request_id | string | No       | Link to request UUID |

**Success (201):**

```json
{
  "id": "uuid",
  "requestId": "uuid-or-null",
  "fileName": "report.docx",
  "filePath": "documents/xxx.docx",
  "fileType": "docx",
  "version": 1,
  "status": "draft",
  "createdAt": "2026-02-26T10:00:00.000Z"
}
```

**Errors:**

- `400` – `{ "error": "No file uploaded" }` or `{ "error": "Allowed types: pdf, docx, xlsx" }`
- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to upload document" }`

---

### PATCH /api/documents/:id

Update document metadata (currently only status).

**Auth required:** Yes

**Request body (JSON):**

| Field  | Type   | Required | Description     |
|--------|--------|----------|-----------------|
| status | string | Yes      | e.g. draft, approved |

**Success (200):**

```json
{
  "id": "uuid",
  "status": "approved",
  "updatedAt": "2026-02-26T10:00:00.000Z"
}
```

**Errors:**

- `400` – `{ "error": "No fields to update" }`
- `401` – Missing/invalid token
- `404` – `{ "error": "Document not found" }`
- `500` – `{ "error": "Failed to update document" }`

---

## 10. Audit Logs

### GET /api/audit-logs

List audit log entries with filters (for Audit Logs screen).

**Auth required:** Yes

**Query parameters:**

| Parameter   | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| entity_type | string | No       | document, request, template, workflow, user |
| entity_id   | string | No       | Entity UUID                          |
| user_id     | string | No       | Filter by user UUID                  |
| request_id  | string | No       | Filter by request business ID (e.g. REQ-2026-12345) |
| date_range  | string | No       | `today`, `week`, `month`            |
| from_date   | string | No       | ISO date                             |
| to_date     | string | No       | ISO date (used when date_range not set) |
| limit       | number | No       | Max results (default 100, max 500)   |

**Success (200):**

```json
[
  {
    "id": "uuid",
    "timestamp": "2026-02-26T10:00:00.000Z",
    "action": "request_submitted",
    "entityType": "request",
    "entityId": "uuid",
    "entityName": "REQ-2026-12345",
    "user": "John Doe",
    "userRole": "preparator",
    "department": "QA",
    "details": "Request submitted for review",
    "ipAddress": "127.0.0.1",
    "requestId": "REQ-2026-12345"
  }
]
```

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to get audit logs" }`

---

## 11. Workflows

Workflow definitions and steps (for Configure Workflow / Workflow Rules UI). Runtime per request is under [Requests](#7-requests) (`GET /requests/:id/workflow`, `POST /requests/:id/workflow/actions`).

### GET /api/workflows

List workflows. Optional query: `template_id`, `department_id`, `is_active` (boolean).

**Auth required:** Yes

**Success (200):** Array of `{ id, name, description, isActive, appliesToTemplateId, appliesToDepartmentId, createdAt, updatedAt }`.

---

### GET /api/workflows/:id

Get a single workflow.

**Auth required:** Yes

**Errors:** `404` – Workflow not found

---

### POST /api/workflows

Create a workflow. Body: `name`, `description`, `is_active`, `applies_to_template_id`, `applies_to_department_id` (all optional except name).

**Auth required:** Yes

**Success (201):** Workflow DTO.

---

### PATCH /api/workflows/:id

Update workflow. Body: same fields as create (all optional).

**Auth required:** Yes

**Errors:** `400` – No fields to update, `404` – Not found

---

### GET /api/workflows/:id/steps

List steps for a workflow (ordered by step_order).

**Auth required:** Yes

**Success (200):** Array of `{ id, workflowId, stepOrder, name, roleKey, departmentId, isApprovalStep, metadata, createdAt }`.

---

### PUT /api/workflows/:id/steps

Replace all steps for a workflow. Body: array of `{ step_order, name, role_key, department_id, is_approval_step, metadata }`.

**Auth required:** Yes

**Success (200):** Array of step DTOs (same as GET steps).

---

## 12. Workflow Rules

Condition/action rules for selecting or applying workflows.

### GET /api/workflow-rules

List workflow rules. Optional query: `template_id`, `department_id`, `is_active`.

**Auth required:** Yes

**Success (200):** Array of `{ id, name, description, appliesToTemplateId, appliesToDepartmentId, conditionJson, actionJson, isActive, createdAt, updatedAt }`.

---

### GET /api/workflow-rules/:id

Get a single workflow rule.

**Auth required:** Yes

**Errors:** `404` – Not found

---

### POST /api/workflow-rules

Create a rule. Body: `name`, `description`, `applies_to_template_id`, `applies_to_department_id`, `condition_json`, `action_json`, `is_active`.

**Auth required:** Yes

**Success (201):** Rule DTO.

---

### PATCH /api/workflow-rules/:id

Update a rule. Body: same fields (all optional).

**Auth required:** Yes

**Errors:** `400` – No fields to update, `404` – Not found

---

## 13. Error Responses

All error responses are JSON with at least:

```json
{
  "error": "Human-readable message"
}
```

Some endpoints add a `detail` field (e.g. PATCH request when DB schema is outdated).

**Common status codes:**

| Code | Meaning                    |
|------|----------------------------|
| 400  | Bad request (validation)   |
| 401  | Unauthorized (no/invalid token) |
| 404  | Resource not found         |
| 500  | Internal server error      |

---

## Quick Reference – Endpoints

All completed APIs. Base URL: `/api`. Auth = Bearer token (except login, health, forgot-password, reset-password).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/auth/login | No | Login, get token |
| GET | /api/auth/me | Yes | Current user |
| POST | /api/auth/refresh | Yes | Re-issue JWT |
| POST | /api/auth/forgot-password | No | Request password reset |
| POST | /api/auth/reset-password | No | Reset password with token |
| GET | /api/dashboard/summary | Yes | Dashboard summary (counts, recent requests/templates, documentTotals) |
| GET | /api/departments | Yes | List departments |
| GET | /api/users | Yes | List users |
| GET | /api/users/:id | No  | **Deprecated** – use POST /api/users/validate-for-document instead |
| GET | /api/templates | Yes | List templates |
| GET | /api/templates/:id | Yes | Get template |
| GET | /api/templates/:id/file | Yes | Template file stream |
| GET | /api/templates/:id/download | Yes | Presigned S3 download URL (or 404) |
| POST | /api/templates | Yes | Upload template (multipart) |
| PATCH | /api/templates/:id | Yes | Update template |
| GET | /api/requests | Yes | List requests; view=library for Document Library (user-scoped); filters, search, pagination, sort |
| GET | /api/requests/:id | Yes | Get request |
| GET | /api/requests/:id/activity | Yes | Request activity; { requestStatus, activity }; per-entry status for View Audit Log |
| GET | /api/requests/:id/workflow | Yes | Request workflow instance and steps |
| POST | /api/requests/:id/workflow/actions | Yes | Workflow action (init, approve, reject, etc.) |
| POST | /api/requests | Yes | Create request |
| PATCH | /api/requests/:id | Yes | Update request; status=reviewed auto-advances assigned_to (reviewer→approver) |
| DELETE | /api/requests/:id | Yes | Delete request (and linked documents) |
| GET | /api/requests/:id/page-remarks | Yes | List page-level remarks |
| PUT | /api/requests/:id/page-remarks/:page | Yes | Save/upsert page remark |
| GET | /api/requests/:id/form-data | Yes | Get form data (includes departmentName, preparatorName for UI sidebar) |
| PUT | /api/requests/:id/form-data | Yes | Save form data; response same as GET |
| GET | /api/documents | Yes | List documents; user-scoped by role when request_id omitted |
| GET | /api/documents/:id | Yes | Get document |
| GET | /api/documents/:id/file | Yes | Document file stream |
| POST | /api/documents | Yes | Upload document (multipart) |
| PATCH | /api/documents/:id | Yes | Update document status |
| GET | /api/audit-logs | Yes | List audit logs |
| GET | /api/workflows | Yes | List workflows |
| GET | /api/workflows/:id | Yes | Get workflow |
| GET | /api/workflows/:id/steps | Yes | List workflow steps |
| PUT | /api/workflows/:id/steps | Yes | Replace workflow steps |
| POST | /api/workflows | Yes | Create workflow |
| PATCH | /api/workflows/:id | Yes | Update workflow |
| GET | /api/workflow-rules | Yes | List workflow rules |
| GET | /api/workflow-rules/:id | Yes | Get workflow rule |
| POST | /api/workflow-rules | Yes | Create workflow rule |
| PATCH | /api/workflow-rules/:id | Yes | Update workflow rule |
