-- Odogwu Dating — add user interests (Tinder-style hobby tags)

ALTER TABLE users ADD COLUMN interests TEXT NOT NULL DEFAULT '[]';
