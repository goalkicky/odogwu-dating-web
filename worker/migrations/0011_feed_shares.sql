-- Add shares_count to feed_posts for tracking post shares
ALTER TABLE feed_posts ADD COLUMN shares_count INTEGER NOT NULL DEFAULT 0;
