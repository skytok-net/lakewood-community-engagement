-- Modify the posts table to ensure user_id is present
ALTER TABLE dallas.posts
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Enable RLS on posts table
ALTER TABLE dallas.posts ENABLE ROW LEVEL SECURITY;

-- Create policy for reading posts (allow anyone to read)
CREATE POLICY "Allow anyone to read posts"
ON dallas.posts
FOR SELECT
USING (true);

-- Create policy for inserting posts (only authenticated users)
CREATE POLICY "Allow authenticated users to create posts"
ON dallas.posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for updating own posts
CREATE POLICY "Allow users to update own posts"
ON dallas.posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for deleting own posts
CREATE POLICY "Allow users to delete own posts"
ON dallas.posts
FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated and anon roles
GRANT SELECT ON dallas.posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON dallas.posts TO authenticated;

-- Grant permissions for user_profiles table
GRANT SELECT ON dallas.user_profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON dallas.user_profiles TO authenticated;

-- Grant permissions for news_items table
GRANT SELECT ON dallas.news_items TO anon, authenticated;

-- Grant permissions for comments table
GRANT SELECT ON dallas.comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON dallas.comments TO authenticated;

-- Grant permissions for news_item_comments table
GRANT SELECT ON dallas.news_item_comments TO anon, authenticated;
GRANT INSERT, DELETE ON dallas.news_item_comments TO authenticated;

-- Grant permissions for post_comments table
GRANT SELECT ON dallas.post_comments TO anon, authenticated;
GRANT INSERT, DELETE ON dallas.post_comments TO authenticated;

-- Grant permissions for reactions table
GRANT SELECT ON dallas.reactions TO anon, authenticated;
GRANT INSERT, DELETE ON dallas.reactions TO authenticated;
