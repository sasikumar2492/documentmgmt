# Pharma DMS – API Documentation (Frontend)

**Base URL:** `http://localhost:4000/api` (or your `VITE_API_URL`)  
**Authentication:** JWT Bearer token (except login and health)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Health](#2-health)
3. [Departments](#3-departments)
4. [Users](#4-users)
5. [Templates](#5-templates)
6. [Requests](#6-requests)
7. [Form Data](#7-form-data)
8. [Documents](#8-documents)
9. [Audit Logs](#9-audit-logs)
10. [Error Responses](#10-error-responses)

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

## 2. Health

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

## 3. Departments

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

## 4. Users

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

## 5. Templates

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

## 6. Requests

### GET /api/requests

List requests (for Raise Request / Document Library).

**Auth required:** Yes

**Query parameters:**

| Parameter     | Type   | Required | Description        |
|---------------|--------|----------|--------------------|
| department_id | string | No       | Filter by department UUID |
| status        | string | No       | e.g. `draft`, `submitted` |

**Success (200):**

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

**Success (201):**

```json
{
  "id": "uuid",
  "templateId": "uuid",
  "requestId": "REQ-2026-12345",
  "title": "Annual Review 2026",
  "departmentId": "uuid-or-null",
  "status": "draft",
  "createdBy": "uuid",
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

## 7. Form Data

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

## 8. Documents

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

## 9. Audit Logs

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

## 10. Error Responses

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
| GET | /api/departments | Yes | List departments |
| GET | /api/users | Yes | List users |
| GET | /api/templates | Yes | List templates |
| GET | /api/templates/:id | Yes | Get template |
| GET | /api/templates/:id/file | Yes | Template file stream |
| POST | /api/templates | Yes | Upload template (multipart) |
| PATCH | /api/templates/:id | Yes | Update template |
| GET | /api/requests | Yes | List requests |
| GET | /api/requests/:id | Yes | Get request |
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
