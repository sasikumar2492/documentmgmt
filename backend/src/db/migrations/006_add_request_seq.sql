-- Add numeric internal sequence for requests using existing column request_id
-- Run with: node src/db/runMigrations.js

-- 1) Create a sequence (if it does not exist) starting at 10001
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'request_id') THEN
    CREATE SEQUENCE request_id
      START WITH 10001
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
  END IF;
END
$$;

-- 2) Convert existing request_id values to numeric, keeping the same column name.
--    This assumes existing values are either pure digits or end with digits,
--    e.g. 'REQ-2026-65305' -> 65305.
ALTER TABLE requests
  ALTER COLUMN request_id TYPE BIGINT USING
    CASE
      WHEN request_id ~ '^\d+$' THEN request_id::BIGINT
      WHEN request_id ~ '.*(\d+)$' THEN regexp_replace(request_id, '.*(\d+)$', '\1')::BIGINT
      ELSE nextval('request_id')
    END;

-- 3) Set default to use the sequence for new rows
ALTER TABLE requests
  ALTER COLUMN request_id SET DEFAULT nextval('request_id');

