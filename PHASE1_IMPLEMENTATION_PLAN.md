# Phase 1 Implementation Plan – Pharma DMS

**Scope:** AI Conversion, Raise Request, Document Library  
**Tech stack:** Frontend React, Backend Node.js, Database PostgreSQL  
**Document preview/editing:** Syncfusion (Document Editor + PDF Viewer)

---

## 1. Current State Summary

| Area | Current State |
|------|----------------|
| **Frontend** | React 18 + TypeScript + Vite; Radix/shadcn UI; in-memory state only |
| **Backend** | None – no API or server in repo |
| **Database** | None – no persistence |
| **AI Conversion** | UI only: upload → client-side parse (Excel/Word/PDF) → `AIConversionPreview` (section edit, no real AI) |
| **Raise Request** | UI: template list → select → open form; data in React state |
| **Document Library** | UI: list/grid of reports; preview/edit via custom components (no Syncfusion) |

Phase 1 will add a Node.js backend, PostgreSQL, and Syncfusion for documents while wiring the existing flows to real APIs and storage.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  React Frontend (existing + Syncfusion + API client)                      │
│  • AI Conversion flow → Backend parse + optional AI → save template      │
│  • Raise Request → Templates API → Create request → Form data API        │
│  • Document Library → Documents API → Syncfusion preview/edit           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Node.js Backend (Express/Fastify)                                       │
│  • REST (or GraphQL) API                                                 │
│  • Auth (JWT/session), role-based access                                 │
│  • File storage (local or S3-compatible) for uploads and documents     │
│  • Optional: AI service adapter (OpenAI/Claude) for conversion          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│  PostgreSQL                    │   │  File store                    │
│  • users, roles, departments   │   │  • templates (Word/Excel/PDF)  │
│  • templates, form_sections    │   │  • document versions           │
│  • requests, form_data         │   │  • exports (PDF/Word)          │
│  • documents, versions, audit  │   │                                │
└───────────────────────────────┘   └───────────────────────────────┘
```

---

## 3. Database Schema (PostgreSQL)

### 3.1 Core Tables

- **users** – id, username, password_hash, role, department_id, full_name, created_at, updated_at  
- **departments** – id, name, code, created_at  
- **templates** – id, file_name, file_path, file_size, department_id, status (draft | approved), parsed_sections (JSONB), created_at, updated_at, uploaded_by  
- **form_sections** – id, template_id, title, "order", fields (JSONB), header, footer, images (JSONB) – optional if sections live inside templates.parsed_sections  
- **requests** – id, template_id, request_id (business key), title, department_id, status, created_by, assigned_to, created_at, updated_at  
- **form_data** – id, request_id, data (JSONB), form_sections_snapshot (JSONB), created_at, updated_at  
- **documents** – id, request_id, file_name, file_path, file_type (docx | pdf | xlsx), version, status, created_by, created_at, updated_at  
- **document_versions** – id, document_id, version, file_path, created_by, created_at  
- **audit_logs** – id, entity_type, entity_id, action, user_id, details (JSONB), ip_address, created_at  

### 3.2 Conventions

- Use UUID primary keys for all main entities.  
- `request_id` on requests can be a human-readable code (e.g. REQ-2026-0001).  
- Store parsed form structure in JSONB (sections, fields) to align with current frontend types (`FormSection`, `FormField`).  
- Index: (request_id), (template_id), (department_id), (status), (created_at) where used in filters.

---

## 4. Backend (Node.js)

### 4.1 Stack Recommendation

- **Runtime:** Node.js 20+  
- **Framework:** Express or Fastify  
- **DB:** pg + node-postgres or an ORM (e.g. Prisma/Drizzle)  
- **Auth:** JWT (access + optional refresh), middleware for role/department checks  
- **File upload:** multer (or equivalent); store to disk or S3-compatible storage  
- **Env:** dotenv; config for DB_URL, JWT_SECRET, FILE_STORAGE_PATH, AI_API_KEY (optional)

### 4.2 API Modules

| Module | Purpose |
|--------|---------|
| **Auth** | POST /auth/login, POST /auth/refresh, GET /auth/me |
| **Templates** | GET /templates, GET /templates/:id, POST /templates (upload), PATCH /templates/:id (metadata/sections), POST /templates/parse (trigger parse/AI) |
| **Requests** | GET /requests, GET /requests/:id, POST /requests (from template), PATCH /requests/:id (status, assignment) |
| **Form data** | GET /requests/:id/form-data, PUT /requests/:id/form-data |
| **Documents** | GET /documents (list with filters), GET /documents/:id, GET /documents/:id/file, POST /documents (upload version), PATCH /documents/:id |
| **Audit** | GET /audit-logs (filter by entity, user, date) |

### 4.3 AI Conversion (Backend)

- **Upload:** Accept Word/Excel/PDF; store file; return template record.  
- **Parse:** Reuse or port existing logic (e.g. from frontend utils) into Node (e.g. xlsx, mammoth, pdf-parse or pdfjs) to produce `FormSection[]`.  
- **Optional AI step:** Call OpenAI/Claude to improve section titles, field labels, or suggest field types; merge into parsed sections.  
- **Save:** Persist `parsed_sections` (and optional `converted_form_data`) on template; return updated template.

---

## 5. Frontend Changes

### 5.1 API Layer

- Add **axios** (or fetch wrapper) with base URL from env (e.g. `VITE_API_URL`).  
- Implement services: `authApi`, `templatesApi`, `requestsApi`, `formDataApi`, `documentsApi`, `auditApi`.  
- Use auth token in headers; handle 401 (redirect to login or refresh).

### 5.2 State and Data Flow

- Replace in-memory arrays (templates, reports, etc.) with server data where Phase 1 applies.  
- Options: React Query (recommended) or SWR for server state; keep local UI state in existing components.  
- After login, fetch user, templates (for Raise Request), and documents list as needed.

### 5.3 Feature-Specific Wiring

- **AI Conversion**  
  - Upload: call `POST /templates` with file; then `POST /templates/parse` (and optional AI).  
  - Load parsed sections from response; open existing `AIConversionPreview` with that data; on save call `PATCH /templates/:id` with sections (and metadata).  
  - Remove client-side parsing from App.tsx for the “save” path; keep or reuse parsers only if you still want a quick client preview before upload.

- **Raise Request**  
  - List: `GET /templates` (filter by department/status if needed).  
  - On “Raise request”: `POST /requests` with template_id → then navigate to form with `request_id`.  
  - Form load/save: `GET /requests/:id/form-data`, `PUT /requests/:id/form-data`.

- **Document Library**  
  - List: `GET /documents` (or `GET /requests` with document metadata) with filters (role, department, status).  
  - Preview: for PDF use Syncfusion PDF Viewer; for Word use Syncfusion Document Editor in read-only or export to PDF and view.  
  - Edit: open document in Syncfusion Document Editor; load/save via backend (e.g. GET document file, PATCH with new version on save).

### 5.4 Syncfusion Integration

- **Packages:**  
  - `@syncfusion/ej2-react-documenteditor` – Word-like editing (docx).  
  - `@syncfusion/ej2-react-pdfviewer` – PDF viewing (and optional form fill/print).  
- **Licensing:** Syncfusion requires a license key in production; use community license or trial during development.  
- **Usage:**  
  - **Document preview:** Use PDF Viewer for PDFs; for Word, either serve converted PDF from backend or use Document Editor in read-only mode.  
  - **Document edit:** Use Document Editor for .docx; load document via blob URL from `GET /documents/:id/file`; save via `POST /documents` or `PATCH` with new file (backend saves new version).  
- **Styling:** Import Syncfusion CSS (e.g. `@syncfusion/ej2-react-documenteditor/styles/...`) and ensure no conflict with Tailwind/shadcn.

---

## 6. Implementation Phases (Breakdown)

### Phase 1.1 – Foundation (Week 1)

| # | Task | Owner | Notes |
|---|------|--------|------|
| 1.1.1 | Create `backend/` with Node + Express/Fastify, dotenv, CORS | Dev | Port 4000 or 5000 |
| 1.1.2 | PostgreSQL: create DB, run migrations (users, departments, templates, requests, form_data, documents, document_versions, audit_logs) | Dev | Use migration tool (e.g. node-pg-migrate, Prisma migrate) |
| 1.1.3 | Auth: login (username/password), JWT issue, middleware protect routes | Dev | Hash passwords (bcrypt) |
| 1.1.4 | Frontend: add `VITE_API_URL`, axios, auth service (login, token storage, interceptors) | Dev | Store token (memory or localStorage); redirect to login on 401 |
| 1.1.5 | Seed script: at least one admin user, 2–3 departments, 1–2 sample templates (metadata only or with parsed_sections) | Dev | For manual testing |

### Phase 1.2 – AI Conversion (Week 2)

| # | Task | Owner | Notes |
|---|------|--------|------|
| 1.2.1 | Backend: POST /templates (upload file), GET /templates, GET /templates/:id | Dev | Store file in file store; path in DB |
| 1.2.2 | Backend: port or reuse parse logic (Word/Excel/PDF) → FormSection[]; POST /templates/:id/parse or /templates/parse with template_id | Dev | Return parsed sections in response |
| 1.2.3 | Backend (optional): integrate OpenAI/Claude for section/field refinement; env AI_API_KEY | Dev | Feature-flag or config |
| 1.2.4 | Backend: PATCH /templates/:id (metadata, parsed_sections) | Dev | |
| 1.2.5 | Frontend: Upload flow → call upload then parse; show AIConversionPreview with server sections; save → PATCH template | Dev | Keep AIConversionPreview UI; replace data source with API |

### Phase 1.3 – Raise Request (Week 2–3)

| # | Task | Owner | Notes |
|---|------|--------|------|
| 1.3.1 | Backend: POST /requests (template_id, created_by, department_id, optional title), GET /requests, GET /requests/:id | Dev | Generate request_id; status = draft or submitted |
| 1.3.2 | Backend: GET /requests/:id/form-data, PUT /requests/:id/form-data (JSONB) | Dev | Create form_data row on first PUT if needed |
| 1.3.3 | Frontend: Raise Request list from GET /templates; on select template → POST /requests → navigate to form with request_id | Dev | |
| 1.3.4 | Frontend: Form load/save from form-data API; submit button → PATCH request status to submitted | Dev | Keep existing FormPages/DynamicFormViewer |

### Phase 1.4 – Document Library & Syncfusion (Week 3–4)

| # | Task | Owner | Notes |
|---|------|--------|------|
| 1.4.1 | Backend: GET /documents (query: department, status, role), GET /documents/:id, GET /documents/:id/file (stream file), POST /documents (upload new version), PATCH /documents/:id (metadata) | Dev | Link documents to request_id; version on each upload |
| 1.4.2 | Frontend: Install Syncfusion Document Editor + PDF Viewer; add license key (env); create DocumentViewer and DocumentEditor wrappers | Dev | Read-only viewer for PDF; editor for docx |
| 1.4.3 | Document Library list: fetch from GET /documents (or /requests with document info); filters and role-based visibility | Dev | Reuse existing DocumentLibrary UI; data from API |
| 1.4.4 | Preview: open document in Syncfusion viewer (PDF or Word); load file from GET /documents/:id/file | Dev | Blob URL or base64 for viewer |
| 1.4.5 | Edit: open in Document Editor; save → upload file to POST /documents (new version); refresh list | Dev | Optional: track dirty state and confirm before leave |

### Phase 1.5 – Polish & Audit (Week 4)

| # | Task | Owner | Notes |
|---|------|--------|------|
| 1.5.1 | Audit: backend middleware to log critical actions to audit_logs (template create/update, request create/submit, document upload/update) | Dev | |
| 1.5.2 | Frontend: Audit log view (existing or new) from GET /audit-logs | Dev | |
| 1.5.3 | Error handling and toasts for API errors; loading states for list/detail views | Dev | |
| 1.5.4 | Documentation: README for backend (setup, env, run migrations, seed), and short doc for Phase 1 API (endpoints, auth) | Dev | |

---

## 7. File Structure (Suggested)

```
PHARMA-DMS-TEST/
├── frontend/                 # Existing React app
│   ├── src/
│   │   ├── api/              # NEW: auth, templates, requests, documents, audit
│   │   ├── components/       # Existing + Syncfusion wrappers
│   │   └── ...
│   └── package.json         # Add: axios, @syncfusion/ej2-react-documenteditor, @syncfusion/ej2-react-pdfviewer
├── backend/                  # NEW
│   ├── src/
│   │   ├── routes/           # auth, templates, requests, formData, documents, audit
│   │   ├── middleware/      # auth, audit, errorHandler
│   │   ├── services/         # parse (word/excel/pdf), optional ai
│   │   ├── db/               # client, migrations, seeds
│   │   └── config/
│   ├── package.json
│   └── .env.example
├── PHASE1_IMPLEMENTATION_PLAN.md  # This file
└── README.md                # Update with backend + DB setup
```

---

## 8. Risks and Mitigations

| Risk | Mitigation |
|------|-------------|
| Syncfusion license cost | Use community/trial for Phase 1; evaluate alternatives (e.g. PDF.js + simple editor) if needed later |
| Large file uploads (Word/PDF) | Set max body size; consider chunked upload or background job for very large files |
| Parsing accuracy (Word/Excel/PDF) | Keep “edit in AIConversionPreview” as primary; AI as assist; allow manual override of sections |
| Role/permission complexity | Start with simple role check (e.g. admin vs preparator vs reviewer); refine in Phase 2 |

---

## 9. Success Criteria for Phase 1

- User can log in; JWT protects API.  
- User can upload a template (Word/Excel/PDF), trigger parse (and optional AI), edit sections in AIConversionPreview, and save to DB.  
- User can open Raise Request, pick a template, create a request, fill form, and save form data to DB.  
- User can open Document Library, see documents from API, preview (PDF in Syncfusion viewer; Word via editor or converted PDF), and edit Word docs in Syncfusion Document Editor with save creating a new version.  
- Critical actions are written to audit_logs and visible in the app.

---

## 10. Next Steps

1. Review and approve this plan; adjust timelines if needed.  
2. Set up repo: create `backend/` and PostgreSQL database.  
3. Execute Phase 1.1 (foundation), then 1.2 → 1.4 in order, with 1.5 in parallel or at the end.  
4. Plan Phase 2 (workflows, notifications, reporting, etc.) after Phase 1 is stable.
