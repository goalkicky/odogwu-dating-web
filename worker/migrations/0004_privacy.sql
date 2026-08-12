-- Odogwu Dating — privacy settings + blocks

ALTER TABLE users ADD COLUMN show_online_status INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN profile_visibility TEXT NOT NULL DEFAULT 'everyone';
ALTER TABLE users ADD COLUMN data_analytics INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS blocks (
  id TEXT PRIMARY KEY,
  blocker_id TEXT NOT NULL,
  blocked_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);
