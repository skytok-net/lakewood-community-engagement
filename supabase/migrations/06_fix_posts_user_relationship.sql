-- Add user_profile table if it doesn't exist
CREATE TABLE IF NOT EXISTS dallas.user_profiles (
    did TEXT PRIMARY KEY,
    handle TEXT NOT NULL,
    display_name TEXT,
    avatar TEXT
);

-- Modify posts table to properly reference user_profiles
ALTER TABLE dallas.posts
ADD CONSTRAINT fk_user_profile
FOREIGN KEY (user_did) 
REFERENCES dallas.user_profiles(did)
ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_posts_user_did ON dallas.posts(user_did);

