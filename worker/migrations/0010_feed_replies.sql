-- Add reply_to column to feed_comments for threaded replies (Instagram-style)
ALTER TABLE feed_comments ADD COLUMN reply_to TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_feed_comments_reply ON feed_comments(post_id, reply_to);
