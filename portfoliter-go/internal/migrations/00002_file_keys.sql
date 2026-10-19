-- Files live in a private R2 bucket; columns hold object keys, signed into URLs on read.

-- +goose Up
ALTER TABLE portfoliter.profile RENAME COLUMN avatar_url TO avatar_key;
ALTER TABLE portfoliter.profile RENAME COLUMN resume_url TO resume_key;
ALTER TABLE portfoliter.projects RENAME COLUMN cover_url TO cover_key;

-- +goose Down
ALTER TABLE portfoliter.projects RENAME COLUMN cover_key TO cover_url;
ALTER TABLE portfoliter.profile RENAME COLUMN resume_key TO resume_url;
ALTER TABLE portfoliter.profile RENAME COLUMN avatar_key TO avatar_url;
