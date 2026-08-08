-- Odogwu Dating — initial schema (Cloudflare D1)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  date_of_birth TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  interested_in TEXT DEFAULT 'both',
  bio TEXT DEFAULT '',
  photos TEXT DEFAULT '[]',
  latitude REAL DEFAULT 0,
  longitude REAL DEFAULT 0,
  city TEXT DEFAULT '',
  is_premium INTEGER DEFAULT 0,
  verified INTEGER DEFAULT 0,
  age INTEGER DEFAULT 0,
  premium_plan TEXT DEFAULT '',
  google_sub TEXT UNIQUE,
  password_hash TEXT DEFAULT '',
  password_salt TEXT DEFAULT '',
  last_active TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  matched_user_id TEXT NOT NULL,
  matched_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_matches_user ON matches(user_id, matched_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched ON matches(matched_user_id, user_id);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  text TEXT DEFAULT '',
  type TEXT DEFAULT 'text',
  media_url TEXT DEFAULT '',
  reply_to TEXT DEFAULT '',
  edited_at TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  read_at TEXT DEFAULT '',
  reactions TEXT DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, created_at);

CREATE TABLE IF NOT EXISTS call_signals (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  match_id TEXT DEFAULT '',
  type TEXT NOT NULL,
  call_type TEXT DEFAULT 'audio',
  data TEXT DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_signals_to ON call_signals(to_user, created_at);

CREATE TABLE IF NOT EXISTS call_logs (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL,
  to_user TEXT NOT NULL,
  match_id TEXT DEFAULT '',
  call_type TEXT DEFAULT 'audio',
  status TEXT DEFAULT 'missed',
  duration INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_call_logs_user ON call_logs(from_user, created_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_target ON call_logs(to_user, created_at);

CREATE TABLE IF NOT EXISTS oauth_flows (
  state TEXT PRIMARY KEY,
  redirect_to TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oauth_flows_created ON oauth_flows(created_at);
