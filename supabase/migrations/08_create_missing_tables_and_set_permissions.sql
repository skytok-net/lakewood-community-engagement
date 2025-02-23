-- Create news_item_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS dallas.news_item_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    news_item_id UUID REFERENCES dallas.news_items(id),
    comment_id UUID REFERENCES dallas.comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create post_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS dallas.post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES dallas.posts(id),
    comment_id UUID REFERENCES dallas.comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS dallas.reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_did TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    comment_id UUID REFERENCES dallas.comments(id),
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on new tables
ALTER TABLE dallas.news_item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dallas.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dallas.reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for reactions
CREATE POLICY "Allow anyone to read reactions"
ON dallas.reactions FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to create reactions"
ON dallas.reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own reactions"
ON dallas.reactions FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for news_item_comments
CREATE POLICY "Allow anyone to read news_item_comments"
ON dallas.news_item_comments FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to manage news_item_comments"
ON dallas.news_item_comments FOR ALL
USING (EXISTS (
    SELECT 1 FROM dallas.comments c
    WHERE c.id = comment_id
    AND c.user_id = auth.uid()
));

-- Create policies for post_comments
CREATE POLICY "Allow anyone to read post_comments"
ON dallas.post_comments FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to manage post_comments"
ON dallas.post_comments FOR ALL
USING (EXISTS (
    SELECT 1 FROM dallas.comments c
    WHERE c.id = comment_id
    AND c.user_id = auth.uid()
));

-- Grant necessary permissions
GRANT SELECT ON dallas.news_item_comments TO anon, authenticated;
GRANT INSERT, DELETE ON dallas.news_item_comments TO authenticated;

GRANT SELECT ON dallas.post_comments TO anon, authenticated;
GRANT INSERT, DELETE ON dallas.post_comments TO authenticated;

GRANT SELECT ON dallas.reactions TO anon, authenticated;
GRANT INSERT, DELETE ON dallas.reactions TO authenticated;
