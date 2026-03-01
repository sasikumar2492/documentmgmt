# Pharma DMS – API Documentation (Frontend)

**Base URL:** `http://localhost:4000/api` (or your `VITE_API_URL`)  
**Authentication:** JWT Bearer token (except login and health)

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

Get dashboard summary: request counts by status, recent requests, and recent templates.

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
  "recentRequests": [ { "id": "uuid", "requestId": "REQ-2026-12345", "title": "...", "status": "draft", "departmentName": "QA", "createdAt": "..." } ],
  "recentTemplates": [ { "id": "uuid", "fileName": "SOP.docx", "status": "draft", "updatedAt": "..." } ]
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

List users (for assignee/reviewer selection).

**Auth required:** Yes

**Success (200):**

```json
[
  {
    "id": "uuid",
    "username": "john",
    "fullName": "John Doe",
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
| department_id | string | No       | Filter by department UUID |
| status        | string | No       | e.g. `draft`, `submitted` |
| q             | string | No       | Search in title, request_id, department name (ILIKE) |
| assigned_to   | string | No       | Filter by assignee user UUID |
| from_date     | string | No       | Filter created_at >= (ISO date/timestamptz) |
| to_date       | string | No       | Filter created_at <= (ISO date/timestamptz) |
| sortBy        | string | No       | `created_at`, `title`, `status`, `request_id`, `department_name`, `assigned_to_name`, `updated_at` (default `created_at`) |
| sortOrder     | string | No       | `asc` or `desc` (default `desc`) |
| page          | number | No       | Page number (use with pageSize for paginated response) |
| pageSize      | number | No       | Page size, max 500 (use with page for paginated response) |

When both `page` and `pageSize` are provided, the response is `{ data, total, page, pageSize }`. Otherwise the response is an array of requests.

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

**Success (200):** Array of audit log entries (same shape as GET /api/audit-logs), filtered by `entity_type=request` and `entity_id=:id`.

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to get activity" }`

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

**Request body (JSON):** All fields optional. API accepts both `snake_case` and `camelCase` for some fields.

| Field              | Type   | Description                    |
|--------------------|--------|--------------------------------|
| title              | string | Request title                  |
| status             | string | e.g. submitted, approved      |
| assigned_to / assignedTo | string | Assignee user UUID   |
| review_sequence / reviewSequence | array | User UUIDs in order |
| priority           | string | e.g. high, medium, low         |
| submission_comments / submissionComments | string | Comments on submit |

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

**Errors:**

- `400` – `{ "error": "No fields to update" }`
- `401` – Missing/invalid token
- `404` – `{ "error": "Request not found" }`
- `500` – `{ "error": "Failed to update request", "detail": "..." }`

---

## 8. Form Data

### GET /api/requests/:id/form-data

Get form data for a request (dynamic form payload).

**Auth required:** Yes

**Path:** `:id` is the **request UUID** (not `requestId` like REQ-2026-12345).

**Success (200):**

```json
{
  "data": {},
  "formSectionsSnapshot": null,
  "updatedAt": null
}
```

When data exists:

```json
{
  "data": { "field_1": "value1", "field_2": "value2" },
  "formSectionsSnapshot": [ { "title": "Section 1", "fields": [] } ],
  "updatedAt": "2026-02-26T10:00:00.000Z"
}
```

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to get form data" }`

---

### PUT /api/requests/:id/form-data

Create or update form data for a request.

**Auth required:** Yes

**Path:** `:id` is the **request UUID**.

**Request body (JSON):**

| Field              | Type   | Required | Description              |
|--------------------|--------|----------|--------------------------|
| data               | object | No       | Key-value form data      |
| formSectionsSnapshot | any  | No       | Snapshot of form sections (e.g. from template) |

**Example:**

```json
{
  "data": { "field_1": "value1", "field_2": "value2" },
  "formSectionsSnapshot": [ { "title": "Section 1", "fields": [] } ]
}
```

**Success (200):** Same shape as GET form-data (updated `data`, `formSectionsSnapshot`, `updatedAt`).

**Errors:**

- `401` – Missing/invalid token
- `500` – `{ "error": "Failed to save form data" }`

---

## 9. Documents

### GET /api/documents

List documents with optional filters.

**Auth required:** Yes

**Query parameters:**

| Parameter     | Type   | Required | Description           |
|---------------|--------|----------|------------------------|
| request_id    | string | No       | Filter by request UUID |
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

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/auth/login | No | Login, get token |
| GET | /api/auth/me | Yes | Current user |
| POST | /api/auth/refresh | Yes | Re-issue JWT |
| POST | /api/auth/forgot-password | No | Request password reset |
| POST | /api/auth/reset-password | No | Reset password with token |
| GET | /api/dashboard/summary | Yes | Dashboard summary (counts, recent requests/templates) |
| GET | /api/departments | Yes | List departments |
| GET | /api/users | Yes | List users |
| GET | /api/templates | Yes | List templates |
| GET | /api/templates/:id | Yes | Get template |
| GET | /api/templates/:id/file | Yes | Template file stream |
| GET | /api/templates/:id/download | Yes | Presigned S3 download URL (or 404) |
| POST | /api/templates | Yes | Upload template (multipart) |
| PATCH | /api/templates/:id | Yes | Update template |
| GET | /api/requests | Yes | List requests |
| GET | /api/requests/:id | Yes | Get request |
| GET | /api/requests/:id/activity | Yes | Request activity/audit entries |
| GET | /api/requests/:id/workflow | Yes | Request workflow instance and steps |
| POST | /api/requests/:id/workflow/actions | Yes | Workflow action (init, approve, reject, etc.) |
| POST | /api/requests | Yes | Create request |
| PATCH | /api/requests/:id | Yes | Update request |
| GET | /api/requests/:id/form-data | Yes | Get form data |
| PUT | /api/requests/:id/form-data | Yes | Save form data |
| GET | /api/documents | Yes | List documents |
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
