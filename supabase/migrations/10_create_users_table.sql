-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS dallas.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    did TEXT NOT NULL UNIQUE,
    handle TEXT NOT NULL,
    email TEXT,
    display_name TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE dallas.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anyone to read users"
    ON dallas.users
    FOR SELECT
    USING (true);

CREATE POLICY "Allow users to update their own profile"
    ON dallas.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile"
    ON dallas.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT ON dallas.users TO anon, authenticated;
GRANT INSERT, UPDATE ON dallas.users TO authenticated;
