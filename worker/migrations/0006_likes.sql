-- Odogwu Dating — daily likes wallet
-- likes_remaining: how many likes are left for the current day (free users get 10, premium get -1 = unlimited)
-- likes_date: the UTC+1 (WAT) date the remaining count applies to (YYYY-MM-DD)

ALTER TABLE users ADD COLUMN likes_remaining INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN likes_date TEXT NOT NULL DEFAULT '';
