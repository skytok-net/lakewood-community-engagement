-- Move tables to dallas schema if they exist in public
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') THEN
        ALTER TABLE public.properties SET SCHEMA dallas;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news_items') THEN
        ALTER TABLE public.news_items SET SCHEMA dallas;
    END IF;
END $$;

-- Ensure posts table has correct structure
ALTER TABLE dallas.posts
    DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Update user_id to reference dallas.users
ALTER TABLE dallas.posts
    ADD CONSTRAINT posts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES dallas.users(id)
    ON DELETE CASCADE;

-- Enable RLS on posts table
ALTER TABLE dallas.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own posts" ON dallas.posts;
DROP POLICY IF EXISTS "Anyone can read posts" ON dallas.posts;

-- Create policies for post access
CREATE POLICY "Users can manage their own posts"
    ON dallas.posts
    FOR ALL
    USING (user_id IN (
        SELECT id FROM dallas.users 
        WHERE id = dallas.posts.user_id
    ))
    WITH CHECK (user_id IN (
        SELECT id FROM dallas.users 
        WHERE id = dallas.posts.user_id
    ));

CREATE POLICY "Anyone can read posts"
    ON dallas.posts
    FOR SELECT
    USING (true);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA dallas TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA dallas TO anon;
