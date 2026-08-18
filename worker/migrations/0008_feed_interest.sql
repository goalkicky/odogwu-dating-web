-- Odogwu Dating — Tag posts with interest
-- Each post now belongs to exactly one interest so it only shows in that interest's timeline.

ALTER TABLE feed_posts ADD COLUMN interest TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_feed_posts_interest ON feed_posts(interest);
