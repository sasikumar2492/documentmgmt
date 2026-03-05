## PHARMA-DMS – Project Understanding & Data Model

### 1. Project Overview

**PHARMA-DMS** is an end-to-end, compliant Document Management and Workflow system tailored for regulated environments (e.g., pharma). It digitizes the full lifecycle of controlled documents and change requests:

- **Document intake & preparation**
  - Upload Word/Excel/PDF documents as templates.
  - Use AI-assisted parsing to extract sections and fields.
  - Generate configurable workflows based on document content and department.

- **Request creation & approval**
  - Initiate requests from published templates.
  - Capture structured, multi-page approval data.
  - Route requests through multi-step review and approval workflows.

- **Publishing, training, and effectiveness**
  - Publish approved documents as controlled versions.
  - Assign and track user trainings linked to published documents.
  - Monitor document effectiveness and support continuous improvement.

- **Governance, compliance & auditability**
  - Role-based access control.
  - Complete activity and audit logs.
  - Electronic signatures on critical actions.
  - Configurable notifications and email alerts.

The solution supports multiple user roles (Admin, Requestor, Preparator, Reviewer, Approver, Managers) with clear separation of duties, strong auditability, and traceable electronic signatures.

---

### 2. Key User Personas & Roles

- **Admin**
  - Manages users, roles, permissions, departments.
  - Configures workflows, SOP rules, enterprise settings.
  - Oversees reports, analytics, and audit logs.

- **Requestor**
  - Raises new change/approval requests based on templates.
  - Fills in required form data and submits requests into workflow.

- **Preparator**
  - Uploads source documents (Word/Excel/PDF).
  - Uses AI conversion to generate structured templates and dynamic forms.
  - Prepares documents for review, publication, and downstream use.

- **Reviewer / Manager Reviewer**
  - Reviews submitted requests.
  - Adds remarks, requests revisions, or recommends approval.
  - Ensures technical/compliance quality before final approval.

- **Approver / Manager Approver**
  - Performs final approval decisions.
  - Applies electronic signatures and ensures regulatory requirements.
  - Can approve, reject, or send back for revision.

- **Trainee / General Employee**
  - Consumes published documents.
  - Completes assigned trainings and acknowledges understanding.

---

### 3. Major Modules & Screens (From Existing UI)

#### 3.1. Authentication & Access

- **Home Landing (`HomePage`)**
  - Public entry screen with navigation into:
    - DMS module.
    - Ticket Flow module.
    - Login screen.

- **Ticket Flow Login (`TicketFlowLogin`)**
  - Login dedicated to the “Ticket Flow” experience.
  - Used for specialized ticket-based workflows.

- **Standard Sign-In (`SignInPage`)**
  - Username/password with role selection (admin, preparator, reviewer, approver, manager variants).
  - After authentication:
    - Admin → `AdminHomeDashboard`.
    - Manager → document management.
    - Others → main `Dashboard`.

> **Authentication-required:** All main application views after sign-in (dashboard, document management, workflows, libraries, training, settings, audit, etc.) require login.

#### 3.2. Dashboards & Navigation

- **User Dashboard (`Dashboard`, `PreparatorDashboard`)**
  - Personalized view of:
    - Assigned requests and their statuses.
    - Recently uploaded templates/documents.
    - Quick links: Raise Request, Upload Templates, etc.

- **Admin Home Dashboard (`AdminHomeDashboard`)**
  - KPIs for admins:
    - Volume of requests (by status, department, time).
    - Published documents and training coverage.
    - Pending approvals and SLA breaches.
    - Quick access to admin/configuration areas.

- **Sidebars (`LeftSidebar`, `AdminSidebar`)**
  - Left navigation structure, role-aware:
    - Dashboard, document management, raise request, reports, libraries, workflows, training, analytics, admin, audit.
  - Collapsible/expandable layout.

#### 3.3. Document Templates & Syncfusion Conversion (Phase 1.3)

- **Upload Templates / Document Management (`UploadTemplates`, `DocumentManagement`)**
  - **Flow (see Phase 1 plan 1.3):** Upload **.doc, .docx, .xlsx, .xls, or .pdf** (frontend) → backend stores in **local DB** (and optionally **S3** when configured). Frontend fetches file via `GET /templates/:id/file`; for Word, **Syncfusion Document Editor** (proxied at `/api/document-editor`) performs **Import** (DOCX → SFDT). User edits in Syncfusion Document Editor or in a section-based form; on save, frontend calls `PATCH /templates/:id` with metadata and `parsed_sections`. Download: when S3 is used, `GET /templates/:id/download` returns a presigned URL.
  - Conversion pipeline: **Syncfusion Word Processor Server** (DOCX ↔ SFDT); optional parsers/workflowGenerator for form sections and workflow proposal (departments, steps, sequence).
  - Display upload metadata: file name, size, department, upload date.

- **Workflow Approval for AI-Generated Flow (`WorkflowApprovalStep`)**
  - Preparator/Admin reviews AI-generated workflow:
    - Steps, departments, order.
  - Outcomes:
    - Approve → proceed to AI Conversion Preview (Syncfusion editor or section-based form).
    - Reject → return to Upload Templates to adjust/try again.

- **AI Conversion Preview (`AIConversionPreview`)**
  - **Syncfusion Document Editor** (SFDT) and/or **section-based form** (from `parsed_sections`): user views/edits the document or form; on save, frontend sends updated metadata and `parsed_sections` via `PATCH /templates/:id`. Export (SFDT → DOCX) is used in request/document flow where needed.
  - Optionally: visual editor for form sections and fields (refine labels, field types, required flags, department assignments).
  - Saving creates/updates a reusable **Template** entry; when S3 is configured, the template file is stored in S3 and download is via presigned URL.

#### 3.4. Request Creation & Approval Forms

- **Raise Request (`RaiseRequest`)**
  - Lists available templates.
  - User selects template and initiates a new request.
  - Depending on template:
    - Renders a **dynamic form** (AI-generated) or
    - A multi-page **fixed approval form** (`FormPages`).

- **Approval / Request Form (`FormPages`)**
  - Multi-page form with pages such as:
    - Request Information (part/material, supplier, product details, reasons, etc.).
    - Initial Review.
    - Review Process.
    - QA & Management.
    - Final Registration.
  - Supports:
    - Save, Reset, Submit, Approve, Cancel.
    - Role-based edit rights (Preparator vs Reviewer vs Approver).

- **Dynamic Document Edit Screen (`DocumentEditScreen`)**
  - Unified UI for editing and reviewing:
    - Dynamic (AI-generated) forms.
    - Fixed forms in an advanced layout.
  - Integrated with:
    - Request activity view (`ActivityLogDetail`).
    - Role-based save/submit behavior.

#### 3.5. Workflows & Libraries

- **Document Libraries**
  - `DocumentLibrary`, `PreparatorDocumentLibrary`, `ReviewerDocumentLibrary`, `ApproverDocumentLibrary`.
  - Role-specific views of:
    - Requests/documents by status (pending, submitted, in review, approved, rejected, needs revision, published).
  - Actions per role:
    - **Requestor**: view status and history.
    - **Preparator**: preview, edit, publish.
    - **Reviewer/Approver**: review, approve, reject, request changes.

- **Workflows & Configuration**
  - `Workflows`
    - Overview of workflows for templates/requests.
    - Visualizes workflow steps, statuses, and assigned departments.
  - `ConfigureWorkflow`
    - Adjust workflow steps per template/process.
    - Saves custom workflow steps (beyond AI defaults).
  - `WorkflowConfiguration`, `WorkflowRulesSetup`
    - Higher-level rules:
      - Example: “Change requests in Department X must have QA + Regulatory review.”
      - Condition-based routing and approvals.

- **Document Publishing & Lifecycle**
  - `DocumentPublishing`
    - Pre-publication staging for approved documents.
    - Final checks and scheduling of publishing.
  - `DocumentEffectiveness`
    - Tracks whether published documents are effective in practice.
    - May integrate training completion statistics and feedback.
  - `DocumentVersioning`
    - Manages versions of documents and their lifecycle.

#### 3.6. Training & Competency

- **Training Management (`TrainingManagement`)**
  - Manages trainings tied to published documents.
  - Capabilities:
    - Assign trainings by document, department, or role.
    - Track status (scheduled, in-progress, completed, overdue, cancelled).
    - Record scores, attendance, duration, trainer/trainee.

#### 3.7. Reporting & Analytics

- **Reports & Analytics**
  - `Reports`
    - List of requests with filtering and search.
    - Supports preview, delete, download, export.
  - `ReportsAnalyticsDashboard`, `AnalyticsReports`
    - Dashboards and charts showing:
      - Request volumes and status distribution.
      - Cycle times and bottlenecks.
      - Departmental workload and throughput.

#### 3.8. Activity, Audit & Remarks

- **Activity Log (`ActivityLogTable`, `ActivityLogDetail`)**
  - Per-request activity feed showing:
    - Status changes.
    - Submissions, approvals, rejections.
    - Key data changes and responsible users.

- **Audit Logs (`AuditLogs`)**
  - System-wide audit trail:
    - Logins/logouts.
    - Request submissions and resubmissions.
    - Approvals, rejections, deletions.
    - Template changes and workflow approvals.
  - Supports filtering by request, user, date, department.

- **Remarks Inbox (`RemarksInbox`, `PageRemarksModal`)**
  - Central inbox for remarks on documents/requests.
  - Allows:
    - Page-level and document-level remarks.
    - Requests for clarifications or revisions.
  - Requestors and Preparators can see and address remarks.

#### 3.9. Administration & Configuration

- **User Management (`UserManagement`)**
  - Create/edit users with roles and departments.
  - Manage activation status; potential bulk imports.

- **Role & Permission Management (`RolePermissionsManagement`)**
  - Define which roles can perform which actions:
    - Module access.
    - Ability to approve, reject, publish, configure workflows, etc.

- **Department Setup (`DepartmentSetupManagement`, `DepartmentsView`)**
  - Manage departments used in workflows and document classification.

- **Enterprise & SOP Configuration**
  - `EnterpriseSettings`
    - Global settings (branding, organization-wide defaults).
  - `SOPConfiguration`
    - SOP-level settings and mappings to workflows, templates, departments.

- **Notification Settings (`NotificationSettings`)**
  - Per-user or per-role toggles for notification preferences (email/in-app).
  - Configure which events trigger notifications.

#### 3.10. Notifications, Chat, and Ticket Flow

- **Notifications**
  - `NotificationsHub`, `NotificationsPage`.
  - In-app notification center for:
    - New request submissions/assignments.
    - Resubmissions.
    - Approval required.
    - Template/document publication.
    - Rejections and revision requests.

- **Chat (`Chat`)**
  - In-app chat/assistant or collaboration module.
  - Used for ad-hoc communication about documents/workflows.

- **Ticket Flow (`TicketFlow`)**
  - Specialized flow for ticket-based processes (e.g., support, deviations, CAPAs).
  - Has its own login (`TicketFlowLogin`) and process, separate from standard DMS login.

---

### 4. Business Entities Derived from the UI

Primary entities the system will manage:

- **User**
- **Role**
- **Permission**
- **Department**
- **User–Role assignment**
- **Template**
- **Template Section**
- **Template Field**
- **Document Request / Request Instance**
- **Dynamic Form Data (per request)**
- **Workflow Definition (per template or process)**
- **Workflow Step Definition**
- **Runtime Workflow Step Instance (per request)**
- **Notification (in-app)**
- **Email Template / Notification Event Type**
- **Email Log (sent emails)**
- **Training Record**
- **Audit Log Entry**
- **Electronic Signature**
- **Remark / Comment**
- **Ticket (for Ticket Flow)**
- **Enterprise / Organization Settings**
- **SOP Configuration**
- **Workflow Rule (condition–action rules)**
- **Published Document / Version Record**

---

### 5. Authentication-Required Screens

- **Public (no login required)**
  - `HomePage`
  - `TicketFlowLogin`
  - `SignInPage`

- **Requires standard authentication**
  - `Dashboard` / `PreparatorDashboard`
  - `AdminHomeDashboard`
  - `UploadTemplates`, `DocumentManagement`
  - `RaiseRequest`
  - `Reports`
  - Document libraries:
    - `DocumentLibrary`
    - `PreparatorDocumentLibrary`
    - `ReviewerDocumentLibrary`
    - `ApproverDocumentLibrary`
  - Forms and document interaction:
    - `FormPages`
    - `DocumentEditScreen`
    - `DocumentPreviewScreen`
  - Document lifecycle:
    - `DocumentPublishing`
    - `DocumentEffectiveness`
    - `DocumentVersioning`
  - Workflow modules:
    - `Workflows`
    - `ConfigureWorkflow`
    - `WorkflowConfiguration`
    - `WorkflowRulesSetup`
    - `WorkflowApprovalStep`
    - `AIConversionPreview`
  - Training & analytics:
    - `TrainingManagement`
    - `ReportsAnalyticsDashboard`
    - `AnalyticsReports`
  - Activity & remarks:
    - `ActivityLogTable`
    - `ActivityLogDetail`
    - `RemarksInbox`
  - Administration:
    - `UserManagement`
    - `RolePermissionsManagement`
    - `DepartmentSetupManagement`
    - `DepartmentsView`
    - `EnterpriseSettings`
    - `SOPConfiguration`
  - Notifications & chat:
    - `NotificationsPage`
    - `NotificationsHub`
    - `NotificationSettings`
    - `Chat`
  - Compliance:
    - `AuditLogs`
  - Ticket-specific:
    - `TicketFlow` (behind ticket-flow login)

---

### 6. Email Notification Expectations (Business View)

From an end-user and business perspective, emails are expected in at least these scenarios:

#### 6.1. User Account & Security

- **Welcome email** on account creation.
- **Email verification** where required.
- **Password reset / forgotten password**.
- **Security alerts** (e.g., suspicious login, account lockout).

#### 6.2. Request Lifecycle

- When a **new request is submitted**:
  - Notify reviewers/approvers and relevant managers.
- When a **request is resubmitted** after revision:
  - Notify the current reviewer/approver.
- When a **request is assigned** or re-assigned:
  - Notify the assignee.
- When a **request is approved**:
  - Notify the requestor, preparator, and stakeholders.
- When a **request is rejected**:
  - Notify requestor, preparator, and possibly line manager.
- When a **request requires revision**:
  - Send email with remarks and required changes.
- When **approval is required**:
  - Notify the next approver in the workflow sequence.
- Optional escalation emails:
  - For overdue approvals or SLA breaches.

#### 6.3. Template & Document Lifecycle

- When a new **template is created/approved**:
  - Notify admins, preparators, and department leads.
- When a document is **published**:
  - Notify impacted departments and training coordinators.
- When a **new version** of a controlled document is released:
  - Notify all users bound to that document (e.g., through training assignments).
- When a document is **archived or superseded**:
  - Notify relevant stakeholders.

#### 6.4. Training & Effectiveness

- **Training assignment** emails to trainees.
- **Reminders** for pending/overdue trainings.
- **Completion confirmations** to trainees and managers.
- Alerts when **document effectiveness checks** identify issues (optional).

#### 6.5. Ticket Flow

- Ticket **creation** confirmation to ticket creator.
- Ticket **assignment** notifications to responsible agents/managers.
- Ticket **status change** notifications (in progress, resolved, closed).

#### 6.6. System & Administration

- Optional alerts to admins for:
  - High error rates in document processing (e.g., AI parsing failures).
  - Bulk user imports or configuration changes.
  - Significant audit or security events.

All of the above will later map to configurable notification events, with toggles to enable/disable emails per event and per role/user.

---

### 7. Database Schema Overview (Conceptual, PostgreSQL-Oriented)

This section describes the relational data model that will be implemented using PostgreSQL and Prisma, aligned with the UI and business flows. It is intentionally language-agnostic (no code) but ready to translate into migrations.

#### 7.1. Design Principles

- **Alignment with UI**
  - Tables map directly to existing frontend types and flows (`TemplateData`, `ReportData`, `TrainingRecord`, `NotificationData`, `AuditLogEntry`, `ElectronicSignature`, etc.).

- **Separation of Concerns**
  - **Master data**: users, roles, departments, templates, workflows, SOPs.
  - **Transactional data**: requests, workflow instances, remarks, trainings, tickets.
  - **Cross-cutting**: notifications, emails, audit logs, signatures, configuration.

- **Flexibility**
  - Use `jsonb` (e.g., for dynamic forms and workflow rules) where structure is flexible but must remain queryable.

- **Scalability & Compliance**
  - Explicit status tracking.
  - Complete audit trails.
  - Electronic signatures referencing audit records.

---

### 8. Core Master Data

#### 8.1. `organizations`

- **Purpose**: Support multi-tenant or multi-entity usage (optional).
- **Key fields**:
  - `id` (uuid, PK)
  - `name` (text, unique)
  - `code` (text, unique, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

#### 8.2. `departments`

- **Purpose**: Represent organizational departments for routing and classification.
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK → `organizations.id`)
  - `name` (text)
  - `code` (text, unique within org)
  - `description` (text, nullable)
  - `is_active` (boolean, default true)
  - `created_at`, `updated_at` (timestamptz)

#### 8.3. `roles`

- **Purpose**: Represent system roles (admin, requestor, preparator, reviewer, approver, etc.).
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `name` (text) – e.g., `admin`, `requestor`, `preparator`, `reviewer`, `approver`, `manager_reviewer`, `manager_approver`
  - `description` (text, nullable)
  - `is_system` (boolean, default false)
  - `created_at`, `updated_at` (timestamptz)

#### 8.4. `permissions` & `role_permissions`

- **Purpose**: Fine-grained permission system.
- **`permissions` key fields**:
  - `id` (uuid, PK)
  - `key` (text, unique) – e.g., `document.view`, `request.approve`, `workflow.configure`
  - `description` (text)
  - `module` (text) – e.g., `documents`, `workflows`, `admin`
- **`role_permissions` key fields**:
  - `role_id` (uuid, FK → `roles.id`)
  - `permission_id` (uuid, FK → `permissions.id`)
  - Composite PK (`role_id`, `permission_id`).

#### 8.5. `users` & `user_roles`

- **Purpose**: Represent system users and their assigned roles.
- **`users` key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `username` (text, unique within org)
  - `email` (text, unique within org)
  - `password_hash` (text)
  - `full_name` (text)
  - `department_id` (uuid, FK → `departments.id`, nullable)
  - `is_active` (boolean, default true)
  - `last_login_at` (timestamptz, nullable)
  - `created_at`, `updated_at` (timestamptz)
- **`user_roles` key fields**:
  - `user_id` (uuid, FK → `users.id`)
  - `role_id` (uuid, FK → `roles.id`)
  - Composite PK (`user_id`, `role_id`).

---

### 9. Templates, Forms, and Documents

#### 9.1. `document_templates`

- **Purpose**: Represent uploaded template files and their AI-processed structure.
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `name` (text) – human-readable template name
  - `file_name` (text)
  - `file_size_bytes` (bigint)
  - `mime_type` (text)
  - `department_id` (uuid, FK → `departments.id`)
  - `status` (enum: `draft`, `pending_approval`, `approved`, `deprecated`)
  - `ai_parsed_sections` (jsonb, nullable) – serialized `FormSection[]`
  - `converted_form_schema` (jsonb, nullable) – normalized dynamic form schema
  - `created_by_user_id` (uuid, FK → `users.id`)
  - `approved_by_user_id` (uuid, FK → `users.id`, nullable)
  - `approved_at` (timestamptz, nullable)
  - `created_at`, `updated_at` (timestamptz)

#### 9.2. `template_versions`

- **Purpose**: Manage versions of templates over time.
- **Key fields**:
  - `id` (uuid, PK)
  - `template_id` (uuid, FK → `document_templates.id`)
  - `version_number` (int)
  - `file_name` (text)
  - `file_size_bytes` (bigint)
  - `mime_type` (text)
  - `ai_parsed_sections` (jsonb)
  - `converted_form_schema` (jsonb)
  - `status` (enum: `draft`, `active`, `deprecated`)
  - `created_by_user_id` (uuid)
  - `created_at` (timestamptz)

#### 9.3. `document_requests`

- **Purpose**: Represent each instance of a workflow run/approval request (maps to `ReportData`).
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `request_number` (text, unique per org) – e.g., `REQ001`
  - `template_id` (uuid, FK → `document_templates.id`)
  - `template_version_id` (uuid, FK → `template_versions.id`, nullable)
  - `file_name` (text)
  - `department_id` (uuid, FK → `departments.id`, nullable)
  - `status` (enum: `pending`, `submitted`, `resubmitted`, `initial_review`, `review_process`, `final_review`, `reviewed`, `approved`, `rejected`, `needs_revision`, `published`)
  - `document_type` (text, nullable)
  - `product` (text, nullable)
  - `site` (text, nullable)
  - `file_size_bytes` (bigint)
  - `uploaded_by_user_id` (uuid, FK → `users.id`, nullable)
  - `from_user_id` (uuid, FK → `users.id`, nullable)
  - `assigned_to_user_id` (uuid, FK → `users.id`, nullable)
  - `review_sequence` (jsonb, nullable) – ordered list of user IDs/roles
  - `current_reviewer_index` (int, nullable)
  - `priority` (enum or text: `low`, `medium`, `high`, `critical`)
  - `submission_comments` (text, nullable)
  - `published_at` (timestamptz, nullable)
  - `published_by_user_id` (uuid, FK → `users.id`, nullable)
  - `created_at`, `updated_at` (timestamptz)
  - `upload_date` (date)

#### 9.4. `document_request_form_data`

- **Purpose**: Store the complete multi-page form content for each request.
- **Key fields**:
  - `id` (uuid, PK)
  - `document_request_id` (uuid, FK → `document_requests.id`, unique)
  - `form_data` (jsonb) – mirrors current `FormData` interface as JSON
  - `created_at`, `updated_at` (timestamptz)

#### 9.5. `document_published_versions`

- **Purpose**: Represent final, published controlled-document records.
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `document_request_id` (uuid, FK → `document_requests.id`)
  - `template_id` (uuid, FK → `document_templates.id`)
  - `version_number` (int)
  - `document_code` (text) – regulatory/compliance code
  - `title` (text)
  - `department_id` (uuid, FK)
  - `effective_from` (date)
  - `effective_to` (date, nullable)
  - `status` (enum: `active`, `superseded`, `archived`)
  - `published_by_user_id` (uuid, FK → `users.id`)
  - `published_at` (timestamptz)
  - `metadata` (jsonb, nullable)

---

### 10. Workflows and Runtime Progression

#### 10.1. `workflows`

- **Purpose**: Define standard workflows (often linked to templates/departments).
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `name` (text)
  - `description` (text, nullable)
  - `applies_to_template_id` (uuid, FK → `document_templates.id`, nullable)
  - `applies_to_department_id` (uuid, FK → `departments.id`, nullable)
  - `is_active` (boolean, default true)
  - `created_by_user_id` (uuid)
  - `created_at`, `updated_at` (timestamptz)

#### 10.2. `workflow_steps`

- **Purpose**: Define ordered steps within a workflow.
- **Key fields**:
  - `id` (uuid, PK)
  - `workflow_id` (uuid, FK → `workflows.id`)
  - `step_order` (int)
  - `name` (text) – e.g., “Initial QA Review”
  - `department_id` (uuid, FK → `departments.id`, nullable)
  - `role_id` (uuid, FK → `roles.id`, nullable)
  - `sla_days` (int, nullable)
  - `is_approval_step` (boolean, default true)
  - `metadata` (jsonb, nullable)

#### 10.3. `request_workflow_instances` & `request_workflow_steps`

- **`request_workflow_instances` purpose**: Attach a concrete workflow configuration to a given request, including AI-generated flows.
- **Key fields**:
  - `id` (uuid, PK)
  - `document_request_id` (uuid, FK → `document_requests.id`, unique)
  - `workflow_id` (uuid, FK → `workflows.id`, nullable)
  - `ai_generated_definition` (jsonb, nullable) – stores full `AIWorkflowStep[]`
  - `created_at` (timestamptz)

- **`request_workflow_steps` purpose**: Track runtime state for each step in a request’s workflow.
- **Key fields**:
  - `id` (uuid, PK)
  - `request_workflow_instance_id` (uuid, FK → `request_workflow_instances.id`)
  - `step_order` (int)
  - `name` (text)
  - `department_id` (uuid, FK → `departments.id`, nullable)
  - `assigned_to_user_id` (uuid, FK → `users.id`, nullable)
  - `status` (enum: `pending`, `current`, `completed`, `rejected`)
  - `started_at` (timestamptz, nullable)
  - `completed_at` (timestamptz, nullable)
  - `metadata` (jsonb, nullable)

---

### 11. Remarks, Activity & Audit

#### 11.1. `document_remarks`

- **Purpose**: Support `RemarksInbox` and page-level comments.
- **Key fields**:
  - `id` (uuid, PK)
  - `document_request_id` (uuid, FK → `document_requests.id`)
  - `author_user_id` (uuid, FK → `users.id`)
  - `page_number` (int, nullable)
  - `field_identifier` (text, nullable)
  - `remark_text` (text)
  - `status` (enum: `open`, `addressed`, `closed`)
  - `created_at`, `updated_at` (timestamptz)

#### 11.2. `audit_logs`

- **Purpose**: Map to `AuditLogEntry` and provide a comprehensive audit trail.
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `timestamp` (timestamptz)
  - `action` (enum: `document_uploaded`, `request_submitted`, `request_resubmitted`, `request_approved`, `request_rejected`, `status_changed`, `template_created`, `workflow_approved`, `form_edited`, `user_login`, `user_logout`, `template_deleted`, `request_deleted`)
  - `entity_type` (enum: `document`, `request`, `template`, `workflow`, `user`, `system`)
  - `entity_id` (uuid or text)
  - `entity_name` (text)
  - `user_id` (uuid, FK → `users.id`, nullable for system)
  - `user_role_snapshot` (text)
  - `department_id` (uuid, FK → `departments.id`, nullable)
  - `details` (text)
  - `ip_address` (text, nullable)
  - `previous_value` (text, nullable)
  - `new_value` (text, nullable)
  - `request_id` (uuid, FK → `document_requests.id`, nullable)
  - `electronic_signature_id` (uuid, FK → `electronic_signatures.id`, nullable)

#### 11.3. `electronic_signatures`

- **Purpose**: Capture digital signature details for critical actions.
- **Key fields**:
  - `id` (uuid, PK)
  - `signature_id` (text, unique)
  - `certificate_number` (text)
  - `signatory_user_id` (uuid, FK → `users.id`)
  - `signatory_role_snapshot` (text)
  - `signed_at` (timestamptz)
  - `ip_address` (text)
  - `device_info` (text)
  - `verification_hash` (text)
  - `is_verified` (boolean)
  - `verification_method` (enum: `password`, `biometric`, `2fa`, `certificate`)

---

### 12. Notifications & Email

#### 12.1. `notification_event_types`

- **Purpose**: Configurable event definitions (enable/disable per event).
- **Key fields**:
  - `id` (uuid, PK)
  - `key` (text, unique) – e.g., `request_submitted`, `template_published`
  - `description` (text)
  - `category` (text: `request`, `document`, `training`, `security`, `ticket`, `system`)
  - `default_in_app_enabled` (boolean, default true)
  - `default_email_enabled` (boolean, default true)

#### 12.2. `user_notification_settings`

- **Purpose**: Per-user overrides for each notification event.
- **Key fields**:
  - `user_id` (uuid, FK → `users.id`)
  - `notification_event_type_id` (uuid, FK → `notification_event_types.id`)
  - `in_app_enabled` (boolean)
  - `email_enabled` (boolean)
  - Composite PK (`user_id`, `notification_event_type_id`).

#### 12.3. `notifications` & `user_notification_state`

- **`notifications` purpose**: Store in-app notifications.
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `type_key` (text, FK-like → `notification_event_types.key`)
  - `title` (text)
  - `message` (text)
  - `request_id` (uuid, FK → `document_requests.id`, nullable)
  - `from_user_id` (uuid, FK → `users.id`, nullable)
  - `target_user_id` (uuid, FK → `users.id`, nullable)
  - `target_role_id` (uuid, FK → `roles.id`, nullable)
  - `created_at` (timestamptz)

- **`user_notification_state` purpose**: Track read/deleted state per user.
- **Key fields**:
  - `notification_id` (uuid, FK → `notifications.id`)
  - `user_id` (uuid, FK → `users.id`)
  - `is_read` (boolean, default false)
  - `is_deleted` (boolean, default false)
  - `created_at` (timestamptz)

#### 12.4. `email_templates` & `email_logs`

- **`email_templates` purpose**: Store HTML/text templates for each event type.
- **Key fields**:
  - `id` (uuid, PK)
  - `notification_event_type_id` (uuid, FK → `notification_event_types.id`)
  - `name` (text)
  - `subject_template` (text)
  - `body_html_template` (text)
  - `body_text_template` (text, nullable)
  - `is_active` (boolean, default true)
  - `created_at`, `updated_at` (timestamptz)

- **`email_logs` purpose**: Track outgoing emails and delivery status.
- **Key fields**:
  - `id` (uuid, PK)
  - `notification_event_type_id` (uuid, FK)
  - `email_template_id` (uuid, FK)
  - `to_email` (text)
  - `cc_emails` (text[], nullable)
  - `subject` (text)
  - `body_html` (text)
  - `sent_at` (timestamptz, nullable)
  - `status` (enum: `pending`, `sent`, `failed`)
  - `error_message` (text, nullable)
  - `request_id` (uuid, FK → `document_requests.id`, nullable)
  - `retry_count` (int, default 0)

---

### 13. Training & Effectiveness

#### 13.1. `training_records`

- **Purpose**: Direct mapping to `TrainingRecord` and support for `TrainingManagement`.
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `document_published_version_id` (uuid, FK → `document_published_versions.id`)
  - `training_name` (text)
  - `department_id` (uuid, FK → `departments.id`)
  - `trainee_user_id` (uuid, FK → `users.id`)
  - `trainer_user_id` (uuid, FK → `users.id`, nullable)
  - `scheduled_date` (date)
  - `completion_date` (date, nullable)
  - `status` (enum: `scheduled`, `in_progress`, `completed`, `overdue`, `cancelled`)
  - `score` (numeric, nullable)
  - `attendance` (boolean)
  - `duration_minutes` (int)
  - `category` (text)
  - `created_at`, `updated_at` (timestamptz)

#### 13.2. `document_effectiveness_checks`

- **Purpose**: Track effectiveness checks of published documents.
- **Key fields**:
  - `id` (uuid, PK)
  - `document_published_version_id` (uuid, FK)
  - `performed_by_user_id` (uuid, FK)
  - `performed_at` (timestamptz)
  - `result` (enum: `effective`, `ineffective`, `needs_follow_up`)
  - `comments` (text, nullable)
  - `related_training_stats` (jsonb, nullable)

---

### 14. SOPs, Rules & Configuration

#### 14.1. `sop_configurations`

- **Purpose**: Represent SOP-level settings and mappings.
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `code` (text)
  - `name` (text)
  - `department_id` (uuid, FK → `departments.id`, nullable)
  - `description` (text, nullable)
  - `metadata` (jsonb, nullable)
  - `created_at`, `updated_at` (timestamptz)

#### 14.2. `workflow_rules`

- **Purpose**: Advanced rule configuration (for `WorkflowRulesSetup`).
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `name` (text)
  - `description` (text, nullable)
  - `applies_to_sop_id` (uuid, FK → `sop_configurations.id`, nullable)
  - `applies_to_template_id` (uuid, FK → `document_templates.id`, nullable)
  - `applies_to_department_id` (uuid, FK → `departments.id`, nullable)
  - `condition_json` (jsonb)
  - `action_json` (jsonb)
  - `is_active` (boolean, default true)
  - `created_by_user_id` (uuid)
  - `created_at`, `updated_at` (timestamptz)

#### 14.3. `enterprise_settings`

- **Purpose**: Global, organization-wide settings backing `EnterpriseSettings`.
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK, unique)
  - `settings` (jsonb)
  - `created_at`, `updated_at` (timestamptz)

---

### 15. Ticket Flow (Initial Modeling)

#### 15.1. `tickets`

- **Purpose**: Represent ticket-based workflows backed by `TicketFlow`.
- **Key fields**:
  - `id` (uuid, PK)
  - `organization_id` (uuid, FK)
  - `ticket_number` (text, unique per org)
  - `title` (text)
  - `description` (text)
  - `requestor_user_id` (uuid, FK → `users.id`, nullable if external)
  - `assignee_user_id` (uuid, FK → `users.id`, nullable)
  - `status` (enum: `open`, `in_progress`, `resolved`, `closed`, `cancelled`)
  - `priority` (enum or text)
  - `category` (text)
  - `created_at`, `updated_at` (timestamptz)
  - `closed_at` (timestamptz, nullable)

#### 15.2. `ticket_comments`

- **Purpose**: Support commenting and collaboration on tickets.
- **Key fields**:
  - `id` (uuid, PK)
  - `ticket_id` (uuid, FK → `tickets.id`)
  - `author_user_id` (uuid, FK → `users.id`)
  - `comment_text` (text)
  - `created_at` (timestamptz)

---

### 16. Textual ER Diagram (High-Level Relationships)

Key relationships in text form:

- `organizations` 1–* `departments`
- `organizations` 1–* `users`
- `organizations` 1–* `roles`
- `organizations` 1–* `document_templates`
- `organizations` 1–* `document_requests`
- `organizations` 1–* `document_published_versions`
- `organizations` 1–* `notification_event_types`
- `organizations` 1–* `training_records`
- `organizations` 1–* `audit_logs`
- `departments` 1–* `users`
- `departments` 1–* `document_templates`
- `departments` 1–* `document_requests`
- `departments` 1–* `training_records`
- `roles` *–* `permissions` via `role_permissions`
- `users` *–* `roles` via `user_roles`
- `document_templates` 1–* `template_versions`
- `document_templates` 1–* `document_requests`
- `document_requests` 1–1 `document_request_form_data`
- `document_requests` 1–* `document_remarks`
- `document_requests` 1–* `audit_logs` (via `request_id`)
- `document_requests` 1–1 `request_workflow_instances`
- `request_workflow_instances` 1–* `request_workflow_steps`
- `workflows` 1–* `workflow_steps`
- `workflows` *–* `document_templates` / `departments` (via FKs)
- `document_requests` 1–* `document_published_versions` (or 1–1 depending on policy)
- `document_published_versions` 1–* `training_records`
- `document_published_versions` 1–* `document_effectiveness_checks`
- `notification_event_types` 1–* `email_templates`
- `notification_event_types` 1–* `notifications`
- `notifications` *–* `users` via `user_notification_state`
- `notification_event_types` 1–* `email_logs`
- `users` 1–* `audit_logs`
- `users` 1–* `electronic_signatures`
- `electronic_signatures` 1–* `audit_logs` (via `electronic_signature_id`)
- `sop_configurations` 1–* `workflow_rules`
- `tickets` 1–* `ticket_comments`

This document serves as the client-facing understanding and as the conceptual blueprint for implementing the PostgreSQL/Prisma schema in subsequent phases.

