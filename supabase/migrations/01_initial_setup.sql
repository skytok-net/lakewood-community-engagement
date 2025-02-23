-- Create the dallas schema
CREATE SCHEMA IF NOT EXISTS dallas;

-- Create the comments table
CREATE TABLE IF NOT EXISTS dallas.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE dallas.comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all comments"
    ON dallas.comments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create comments"
    ON dallas.comments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON dallas.comments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON dallas.comments
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
