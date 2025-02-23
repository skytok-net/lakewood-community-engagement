-- Add polymorphic relationship columns to comments table
ALTER TABLE dallas.comments
ADD COLUMN target_type VARCHAR(255),
ADD COLUMN target_id UUID;

-- Add indexes for efficient querying
CREATE INDEX comments_target_idx ON dallas.comments (target_type, target_id);

-- Add parent_id for threaded comments
ALTER TABLE dallas.comments
ADD COLUMN parent_id UUID REFERENCES dallas.comments(id);

-- Add likes count
ALTER TABLE dallas.comments
ADD COLUMN likes_count INTEGER DEFAULT 0;

-- Update existing comments to be standalone
UPDATE dallas.comments
SET target_type = 'standalone'
WHERE target_type IS NULL;

-- Add check constraint for valid target types
ALTER TABLE dallas.comments
ADD CONSTRAINT valid_target_type 
CHECK (target_type IN ('news_item', 'standalone'));

