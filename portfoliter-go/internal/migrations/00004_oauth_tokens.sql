-- OAuth tokens for Claude web connectors; only the SHA-256 of each token is stored.

-- +goose Up
CREATE TABLE portfoliter.oauth_tokens (
    token_hash BYTEA PRIMARY KEY,
    kind       TEXT NOT NULL CHECK (kind IN ('access', 'refresh')),
    client_id  TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE portfoliter.oauth_tokens;
