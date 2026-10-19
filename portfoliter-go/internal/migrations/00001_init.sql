-- +goose Up
CREATE TYPE portfoliter.project_type AS ENUM ('PERSONAL', 'WORK');

-- single row, enforced by the id check
CREATE TABLE portfoliter.profile (
    id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    full_name  TEXT NOT NULL,
    headline   TEXT NOT NULL DEFAULT '',
    bio        TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    location   TEXT,
    email      TEXT,
    resume_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE portfoliter.links (
    id         BIGSERIAL PRIMARY KEY,
    platform   TEXT NOT NULL,
    url        TEXT NOT NULL,
    sort_order INT  NOT NULL DEFAULT 0
);

CREATE TABLE portfoliter.experiences (
    id              BIGSERIAL PRIMARY KEY,
    company         TEXT NOT NULL,
    role            TEXT NOT NULL,
    employment_type TEXT,
    location        TEXT,
    start_date      DATE NOT NULL,
    end_date        DATE, -- NULL = current
    description     TEXT NOT NULL DEFAULT '',
    sort_order      INT  NOT NULL DEFAULT 0,
    is_published    BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE portfoliter.projects (
    id            BIGSERIAL PRIMARY KEY,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    project_type  portfoliter.project_type NOT NULL,
    experience_id BIGINT REFERENCES portfoliter.experiences (id) ON DELETE SET NULL,
    summary       TEXT NOT NULL DEFAULT '',
    content       TEXT NOT NULL DEFAULT '', -- markdown
    repo_url      TEXT,
    demo_url      TEXT,
    cover_url     TEXT,
    start_date    DATE,
    end_date      DATE,
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    sort_order    INT  NOT NULL DEFAULT 0,
    is_published  BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT personal_has_no_experience
        CHECK (project_type = 'WORK' OR experience_id IS NULL)
);

CREATE TABLE portfoliter.skills (
    id         BIGSERIAL PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    category   TEXT,
    sort_order INT  NOT NULL DEFAULT 0
);

CREATE TABLE portfoliter.project_skills (
    project_id BIGINT REFERENCES portfoliter.projects (id) ON DELETE CASCADE,
    skill_id   BIGINT REFERENCES portfoliter.skills (id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, skill_id)
);

CREATE TABLE portfoliter.experience_skills (
    experience_id BIGINT REFERENCES portfoliter.experiences (id) ON DELETE CASCADE,
    skill_id      BIGINT REFERENCES portfoliter.skills (id) ON DELETE CASCADE,
    PRIMARY KEY (experience_id, skill_id)
);

CREATE TABLE portfoliter.education (
    id           BIGSERIAL PRIMARY KEY,
    institution  TEXT NOT NULL,
    degree       TEXT,
    field        TEXT,
    start_date   DATE,
    end_date     DATE,
    description  TEXT NOT NULL DEFAULT '',
    sort_order   INT  NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE portfoliter.certifications (
    id             BIGSERIAL PRIMARY KEY,
    name           TEXT NOT NULL,
    issuer         TEXT NOT NULL,
    issued_date    DATE,
    credential_url TEXT,
    sort_order     INT  NOT NULL DEFAULT 0,
    is_published   BOOLEAN NOT NULL DEFAULT false
);

-- sections that have no typed table yet (awards, talks, ...)
CREATE TABLE portfoliter.sections (
    id           BIGSERIAL PRIMARY KEY,
    key          TEXT  NOT NULL UNIQUE,
    title        TEXT  NOT NULL,
    items        JSONB NOT NULL DEFAULT '[]',
    sort_order   INT   NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false
);

-- every MCP write logs before/after so AI edits can be reviewed and reverted
CREATE TABLE portfoliter.change_log (
    id          BIGSERIAL PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id   BIGINT,
    action      TEXT NOT NULL, -- create | update | delete
    before      JSONB,
    after       JSONB,
    note        TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE portfoliter.change_log;
DROP TABLE portfoliter.sections;
DROP TABLE portfoliter.certifications;
DROP TABLE portfoliter.education;
DROP TABLE portfoliter.experience_skills;
DROP TABLE portfoliter.project_skills;
DROP TABLE portfoliter.skills;
DROP TABLE portfoliter.projects;
DROP TABLE portfoliter.experiences;
DROP TABLE portfoliter.links;
DROP TABLE portfoliter.profile;
DROP TYPE portfoliter.project_type;
