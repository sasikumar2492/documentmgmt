-- =============================================================================
-- Pharma DMS – SQL backup for local deployment (PostgreSQL)
-- =============================================================================
-- 1. Create database:  CREATE DATABASE pharma_dms_test;
-- 2. Connect to it and run this file:  psql -U postgres -d pharma_dms_test -f database-backup.sql
--    Or from GUI (pgAdmin, DBeaver): open this file and execute.
-- 3. Configure backend .env with same DB name/user/password.
-- 4. Test users: see users.md (admin/admin123, requestor/test123, etc.)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);

-- Templates (uploaded Word/Excel/PDF for conversion)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  department_id UUID REFERENCES departments(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  parsed_sections JSONB,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_department ON templates(department_id);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_created ON templates(created_at DESC);

-- Requests (raised from template)
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id),
  request_id TEXT NOT NULL UNIQUE,
  title TEXT,
  department_id UUID REFERENCES departments(id),
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  review_sequence JSONB,
  priority TEXT,
  submission_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_template ON requests(template_id);
CREATE INDEX IF NOT EXISTS idx_requests_department ON requests(department_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at DESC);

-- Form data (per request)
CREATE TABLE IF NOT EXISTS form_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  form_sections_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id)
);

CREATE INDEX IF NOT EXISTS idx_form_data_request ON form_data(request_id);

-- Documents (linked to request; versions in document_versions)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('docx', 'pdf', 'xlsx')),
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_request ON documents(request_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);

-- Document versions (history)
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Mark migration as applied (so runMigrations.js does not re-run)
CREATE TABLE IF NOT EXISTS _migrations (
  name TEXT PRIMARY KEY,
  run_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO _migrations (name) VALUES ('001_initial.sql') ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- Seed data: departments + test users (passwords: admin=admin123, others=test123)
-- =============================================================================
INSERT INTO departments (id, name, code) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Engineering', 'ENG'),
  ('a0000002-0000-0000-0000-000000000002', 'Quality Assurance', 'QA'),
  ('a0000003-0000-0000-0000-000000000003', 'Manufacturing', 'MFG')
ON CONFLICT (id) DO NOTHING;

-- Password hashes: admin123 -> first; test123 -> second
INSERT INTO users (id, username, password_hash, role, department_id, full_name) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'admin', '$2b$10$Fn/xsBocjVewWsoplKboWOiV8hHcwCDvTvlu2DRVnUpmPdoHj65R2', 'admin', 'a0000001-0000-0000-0000-000000000001', 'Admin User'),
  ('b0000002-0000-0000-0000-000000000001', 'requestor', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'requestor', 'a0000001-0000-0000-0000-000000000001', 'Test Requestor'),
  ('b0000003-0000-0000-0000-000000000001', 'preparator', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'preparator', 'a0000002-0000-0000-0000-000000000002', 'Test Preparator'),
  ('b0000004-0000-0000-0000-000000000001', 'manager', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'manager', 'a0000003-0000-0000-0000-000000000003', 'Test Manager'),
  ('b0000005-0000-0000-0000-000000000001', 'manager_reviewer', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'manager_reviewer', 'a0000001-0000-0000-0000-000000000001', 'Test Manager Reviewer'),
  ('b0000006-0000-0000-0000-000000000001', 'manager_approver', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'manager_approver', 'a0000002-0000-0000-0000-000000000002', 'Test Manager Approver'),
  ('b0000007-0000-0000-0000-000000000001', 'approver', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'approver', 'a0000003-0000-0000-0000-000000000003', 'Test Approver'),
  ('b0000008-0000-0000-0000-000000000001', 'reviewer1', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'Reviewer 1', 'a0000001-0000-0000-0000-000000000001', 'Test Reviewer 1'),
  ('b0000009-0000-0000-0000-000000000001', 'reviewer2', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'Reviewer 2', 'a0000002-0000-0000-0000-000000000002', 'Test Reviewer 2'),
  ('b0000010-0000-0000-0000-000000000001', 'reviewer3', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'Reviewer 3', 'a0000003-0000-0000-0000-000000000003', 'Test Reviewer 3'),
  ('b0000011-0000-0000-0000-000000000001', 'reviewer4', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'Reviewer 4', 'a0000001-0000-0000-0000-000000000001', 'Test Reviewer 4'),
  ('b0000012-0000-0000-0000-000000000001', 'approver1', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'Approver 1', 'a0000002-0000-0000-0000-000000000002', 'Test Approver 1'),
  ('b0000013-0000-0000-0000-000000000001', 'approver2', '$2b$10$gkNAT89jk0Ljkl9p/rBf4urujtVqLXPSUTLq1Endx5NHtV51AL4Qi', 'Approver 2', 'a0000003-0000-0000-0000-000000000003', 'Test Approver 2')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  department_id = EXCLUDED.department_id,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();
