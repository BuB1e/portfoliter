package admin

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// GetAll returns every row, drafts included, with ids, is_published and skills, as JSON.
func (s *Store) GetAll(ctx context.Context) (string, error) {
	const query = `
		SELECT jsonb_build_object(
			'siteSettings', (SELECT to_jsonb(t) FROM portfoliter.site_settings t),
			'profile', (SELECT to_jsonb(p) FROM portfoliter.profile p),
			'links', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.id), '[]')
				FROM portfoliter.links t),
			'experiences', (SELECT COALESCE(jsonb_agg(to_jsonb(t) || jsonb_build_object('skills', ARRAY(
					SELECT s.name FROM portfoliter.experience_skills x
					JOIN portfoliter.skills s ON s.id = x.skill_id
					WHERE x.experience_id = t.id ORDER BY s.name)) ORDER BY t.sort_order, t.id), '[]')
				FROM portfoliter.experiences t),
			'projects', (SELECT COALESCE(jsonb_agg(to_jsonb(t) || jsonb_build_object('skills', ARRAY(
					SELECT s.name FROM portfoliter.project_skills x
					JOIN portfoliter.skills s ON s.id = x.skill_id
					WHERE x.project_id = t.id ORDER BY s.name)) ORDER BY t.sort_order, t.id), '[]')
				FROM portfoliter.projects t),
			'skills', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.name), '[]')
				FROM portfoliter.skills t),
			'education', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.id), '[]')
				FROM portfoliter.education t),
			'certifications', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.id), '[]')
				FROM portfoliter.certifications t),
			'sections', (SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.id), '[]')
				FROM portfoliter.sections t)
		)::text`

	var out string
	if err := s.pool.QueryRow(ctx, query).Scan(&out); err != nil {
		return "", fmt.Errorf("load all portfolio rows: %w", err)
	}
	return out, nil
}

// skillJoins lists entities whose single-item read also includes skill names.
var skillJoins = map[string]struct{ table, ownerColumn string }{
	"project":    {"project_skills", "project_id"},
	"experience": {"experience_skills", "experience_id"},
}

// GetItem returns one row as JSON (with skills for projects and experiences).
func (s *Store) GetItem(ctx context.Context, entityType string, id int64) (string, error) {
	table, err := entityTable(entityType)
	if err != nil {
		return "", err
	}
	skills := ""
	if join, ok := skillJoins[entityType]; ok {
		skills = fmt.Sprintf(` || jsonb_build_object('skills', ARRAY(
			SELECT s.name FROM portfoliter.%s x
			JOIN portfoliter.skills s ON s.id = x.skill_id
			WHERE x.%s = t.id ORDER BY s.name))`, join.table, join.ownerColumn)
	}
	query := fmt.Sprintf(`SELECT (to_jsonb(t)%s)::text FROM portfoliter.%s t WHERE t.id = $1`, skills, table)

	var out string
	err = s.pool.QueryRow(ctx, query, id).Scan(&out)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", fmt.Errorf("%s %d: %w", entityType, id, ErrNotFound)
	}
	if err != nil {
		return "", fmt.Errorf("get %s %d: %w", entityType, id, err)
	}
	return out, nil
}

// IsFileReferenced reports whether any row still points at the R2 key.
func (s *Store) IsFileReferenced(ctx context.Context, key string) (bool, error) {
	const query = `
		SELECT EXISTS (SELECT 1 FROM portfoliter.profile WHERE avatar_key = $1 OR resume_key = $1)
		    OR EXISTS (SELECT 1 FROM portfoliter.projects WHERE cover_key = $1)`

	var referenced bool
	if err := s.pool.QueryRow(ctx, query, key).Scan(&referenced); err != nil {
		return false, fmt.Errorf("check file references: %w", err)
	}
	return referenced, nil
}

// ListChanges returns the latest change_log entries, newest first, as JSON.
func (s *Store) ListChanges(ctx context.Context, limit int) (string, error) {
	const query = `
		SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.id DESC), '[]')::text
		FROM (SELECT * FROM portfoliter.change_log ORDER BY id DESC LIMIT $1) c`

	var out string
	if err := s.pool.QueryRow(ctx, query, limit).Scan(&out); err != nil {
		return "", fmt.Errorf("list changes: %w", err)
	}
	return out, nil
}
