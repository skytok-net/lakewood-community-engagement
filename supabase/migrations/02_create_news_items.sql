-- Create news items table
CREATE TABLE dallas.news_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE dallas.news_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all news items"
    ON dallas.news_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create news items"
    ON dallas.news_items
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news items"
    ON dallas.news_items
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own news items"
    ON dallas.news_items
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
