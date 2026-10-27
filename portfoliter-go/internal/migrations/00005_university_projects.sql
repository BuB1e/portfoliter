-- University projects: a third project type, optionally linked to the education row it belongs to.
-- experience_id stays WORK-only; education_id is UNIVERSITY-only.
--
-- The checks compare project_type::text on purpose: a new enum value cannot be used as an enum
-- literal in the same transaction that adds it, but the text comparison is safe.

-- +goose Up
ALTER TYPE portfoliter.project_type ADD VALUE IF NOT EXISTS 'UNIVERSITY';

ALTER TABLE portfoliter.projects
    RENAME CONSTRAINT personal_has_no_experience TO only_work_has_experience;

ALTER TABLE portfoliter.projects
    ADD COLUMN education_id BIGINT REFERENCES portfoliter.education (id) ON DELETE SET NULL,
    ADD CONSTRAINT only_university_has_education
        CHECK (project_type::text = 'UNIVERSITY' OR education_id IS NULL);

-- +goose Down
-- Postgres cannot drop an enum value, so the type is rebuilt without UNIVERSITY.
-- Existing UNIVERSITY projects become PERSONAL (their education link is dropped with the column);
-- each conversion is written to change_log so it can be reviewed and redone after a re-upgrade.
INSERT INTO portfoliter.change_log (entity_type, entity_id, action, before, after, note)
SELECT 'project', p.id, 'update', to_jsonb(p),
       (to_jsonb(p) - 'education_id') || jsonb_build_object('project_type', 'PERSONAL'),
       'migration 00005 down: UNIVERSITY project converted to PERSONAL'
FROM portfoliter.projects p
WHERE p.project_type::text = 'UNIVERSITY';

UPDATE portfoliter.projects SET project_type = 'PERSONAL', updated_at = now()
WHERE project_type::text = 'UNIVERSITY';

ALTER TABLE portfoliter.projects
    DROP CONSTRAINT only_university_has_education,
    DROP CONSTRAINT only_work_has_experience,
    DROP COLUMN education_id;

ALTER TYPE portfoliter.project_type RENAME TO project_type_with_university;
CREATE TYPE portfoliter.project_type AS ENUM ('PERSONAL', 'WORK');
ALTER TABLE portfoliter.projects
    ALTER COLUMN project_type TYPE portfoliter.project_type
    USING project_type::text::portfoliter.project_type;
DROP TYPE portfoliter.project_type_with_university;

ALTER TABLE portfoliter.projects
    ADD CONSTRAINT personal_has_no_experience
        CHECK (project_type = 'WORK' OR experience_id IS NULL);
