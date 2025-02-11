-- Delete any existing dummy posts
DELETE FROM blog_posts;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date 
ON blog_posts(published_at DESC) 
WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_blog_posts_created_date 
ON blog_posts(created_at DESC);

-- Add constraint to ensure published_at is set when post is published
ALTER TABLE blog_posts 
ADD CONSTRAINT check_published_date 
CHECK (
  (published = false AND published_at IS NULL) OR
  (published = true AND published_at IS NOT NULL)
);

-- Add comments
COMMENT ON CONSTRAINT check_published_date ON blog_posts IS 'Ensures published_at is set when a post is published';
COMMENT ON INDEX idx_blog_posts_published_date IS 'Improves performance of queries for published posts';
COMMENT ON INDEX idx_blog_posts_created_date IS 'Improves performance of queries sorted by creation date';