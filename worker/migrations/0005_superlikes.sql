-- Odogwu Dating — daily super likes wallet
-- superlikes_remaining: how many super likes are left for the current day
-- superlikes_date: the UTC+1 (WAT) date the remaining count applies to (YYYY-MM-DD)

ALTER TABLE users ADD COLUMN superlikes_remaining INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN superlikes_date TEXT NOT NULL DEFAULT '';
