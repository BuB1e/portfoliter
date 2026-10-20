-- Site-wide settings. theme picks which design the frontend renders; valid keys are checked in Go.
-- An empty theme means the default design (the first entry in the theme catalog).

-- +goose Up
-- single row, enforced by the id check
CREATE TABLE portfoliter.site_settings (
    id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    theme      TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO portfoliter.site_settings (id) VALUES (1);

-- +goose Down
DROP TABLE portfoliter.site_settings;
