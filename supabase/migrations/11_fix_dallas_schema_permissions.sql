-- Grant schema usage to all roles
GRANT USAGE ON SCHEMA dallas TO anon, authenticated, service_role;

-- Grant all privileges on all tables in dallas schema to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA dallas TO authenticated;

-- Grant select on all tables to anonymous users
GRANT SELECT ON ALL TABLES IN SCHEMA dallas TO anon;

-- Grant usage on all sequences in dallas schema
GRANT USAGE ON ALL SEQUENCES IN SCHEMA dallas TO authenticated;

-- Ensure new tables automatically inherit these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA dallas
  GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA dallas
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA dallas
  GRANT USAGE ON SEQUENCES TO authenticated;

-- Recreate RLS policies to ensure proper access
ALTER TABLE dallas.properties ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow read access to all users"
ON dallas.properties FOR SELECT
USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users full access"
ON dallas.properties FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
