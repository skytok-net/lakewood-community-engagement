-- Add foreign key constraint to posts table for user_profiles
ALTER TABLE dallas.posts
ADD CONSTRAINT fk_posts_user_profile
FOREIGN KEY (user_did) 
REFERENCES dallas.user_profiles(did);
