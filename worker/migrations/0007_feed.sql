-- Odogwu Dating — Social Feed (Instagram-style timeline)
-- feed_posts: user posts with images, captions, visibility
-- feed_post_likes: like tracking per user per post
-- feed_post_saves: bookmark/save tracking per user per post
-- feed_comments: comments on posts

CREATE TABLE IF NOT EXISTS feed_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  caption TEXT NOT NULL DEFAULT '',
  visibility TEXT NOT NULL DEFAULT 'public',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feed_posts_user ON feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created ON feed_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_feed_posts_visibility ON feed_posts(visibility);

CREATE TABLE IF NOT EXISTS feed_post_likes (
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_feed_post_likes_user ON feed_post_likes(user_id);

CREATE TABLE IF NOT EXISTS feed_post_saves (
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_feed_post_saves_user ON feed_post_saves(user_id);

CREATE TABLE IF NOT EXISTS feed_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feed_comments_post ON feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_created ON feed_comments(post_id, created_at);
