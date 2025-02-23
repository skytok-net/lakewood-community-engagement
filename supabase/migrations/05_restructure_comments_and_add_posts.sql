-- Create posts table
CREATE TABLE dallas.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_did TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Modify comments table
ALTER TABLE dallas.comments
DROP COLUMN target_type,
DROP COLUMN target_id,
DROP COLUMN likes_count;

-- Create reactions table
CREATE TABLE dallas.reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_did TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    comment_id UUID REFERENCES dallas.comments(id),
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for news items and comments
CREATE TABLE dallas.news_item_comments (
    news_item_id UUID REFERENCES dallas.news_items(id),
    comment_id UUID REFERENCES dallas.comments(id),
    PRIMARY KEY (news_item_id, comment_id)
);

-- Create junction table for posts and comments
CREATE TABLE dallas.post_comments (
    post_id UUID REFERENCES dallas.posts(id),
    comment_id UUID REFERENCES dallas.comments(id),
    PRIMARY KEY (post_id, comment_id)
);

-- Add indexes for efficient querying
CREATE INDEX idx_reactions_comment_id ON dallas.reactions(comment_id);
CREATE INDEX idx_news_item_comments_news_item_id ON dallas.news_item_comments(news_item_id);
CREATE INDEX idx_post_comments_post_id ON dallas.post_comments(post_id);

-- Update the increment_comment_likes function to work with reactions
CREATE OR REPLACE FUNCTION dallas.add_comment_reaction(p_comment_id UUID, p_user_did TEXT, p_user_id UUID, p_reaction_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO dallas.reactions (comment_id, user_did, user_id, type)
  VALUES (p_comment_id, p_user_did, p_user_id, p_reaction_type)
  ON CONFLICT (comment_id, user_did, type) DO NOTHING;
END;
$$;
