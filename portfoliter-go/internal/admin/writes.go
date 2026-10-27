package admin

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func (s *Store) SetProfile(ctx context.Context, in ProfileInput) (int64, error) {
	if in.FullName == "" {
		return 0, fmt.Errorf("fullName is required")
	}
	const query = `
		INSERT INTO portfoliter.profile (id, full_name, headline, bio, avatar_key, location, email, resume_key)
		VALUES (1, $1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (id) DO UPDATE SET
			full_name = EXCLUDED.full_name, headline = EXCLUDED.headline, bio = EXCLUDED.bio,
			avatar_key = EXCLUDED.avatar_key, location = EXCLUDED.location, email = EXCLUDED.email,
			resume_key = EXCLUDED.resume_key, updated_at = now()
		RETURNING id`
	return s.mutate(ctx, "profile", "profile", 1, actionUpsert, func(tx pgx.Tx) (int64, error) {
		var id int64
		err := tx.QueryRow(ctx, query, in.FullName, in.Headline, in.Bio, in.AvatarKey, in.Location, in.Email, in.ResumeKey).Scan(&id)
		return id, err
	})
}

func (s *Store) DeleteProfile(ctx context.Context) error {
	_, err := s.mutate(ctx, "profile", "profile", 1, actionDelete, func(tx pgx.Tx) (int64, error) {
		_, err := tx.Exec(ctx, `DELETE FROM portfoliter.profile WHERE id = 1`)
		return 1, err
	})
	return err
}

func (s *Store) UpsertLink(ctx context.Context, in LinkInput) (int64, error) {
	const (
		insert = `INSERT INTO portfoliter.links (platform, url) VALUES ($1, $2) RETURNING id`
		update = `UPDATE portfoliter.links SET platform = $1, url = $2 WHERE id = $3 RETURNING id`
	)
	return s.upsert(ctx, "link", in.ID, insert, update, nil, in.Platform, in.URL)
}

func (s *Store) UpsertExperience(ctx context.Context, in ExperienceInput) (int64, error) {
	start, err := requiredDate("startDate", in.StartDate)
	if err != nil {
		return 0, err
	}
	end, err := parseDate("endDate", in.EndDate)
	if err != nil {
		return 0, err
	}
	const (
		insert = `
			INSERT INTO portfoliter.experiences (company, role, employment_type, location, start_date, end_date, description)
			VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`
		update = `
			UPDATE portfoliter.experiences SET company = $1, role = $2, employment_type = $3, location = $4,
				start_date = $5, end_date = $6, description = $7, updated_at = now()
			WHERE id = $8 RETURNING id`
	)
	afterSave := func(tx pgx.Tx, id int64) error {
		return setSkills(ctx, tx, "experience_skills", "experience_id", id, in.Skills)
	}
	return s.upsert(ctx, "experience", in.ID, insert, update, afterSave,
		in.Company, in.Role, in.EmploymentType, in.Location, start, end, in.Description)
}

func (s *Store) UpsertProject(ctx context.Context, in ProjectInput) (int64, error) {
	if err := validateProject(in); err != nil {
		return 0, err
	}
	if err := s.checkSummary(ctx, in.ID, in.Summary); err != nil {
		return 0, err
	}
	start, err := parseDate("startDate", in.StartDate)
	if err != nil {
		return 0, err
	}
	end, err := parseDate("endDate", in.EndDate)
	if err != nil {
		return 0, err
	}
	const (
		insert = `
			INSERT INTO portfoliter.projects (slug, title, project_type, experience_id, summary, content,
				repo_url, demo_url, cover_key, start_date, end_date, is_featured, education_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`
		update = `
			UPDATE portfoliter.projects SET slug = $1, title = $2, project_type = $3, experience_id = $4,
				summary = $5, content = $6, repo_url = $7, demo_url = $8, cover_key = $9,
				start_date = $10, end_date = $11, is_featured = $12, education_id = $13, updated_at = now()
			WHERE id = $14 RETURNING id`
	)
	afterSave := func(tx pgx.Tx, id int64) error {
		return setSkills(ctx, tx, "project_skills", "project_id", id, in.Skills)
	}
	return s.upsert(ctx, "project", in.ID, insert, update, afterSave,
		in.Slug, in.Title, in.ProjectType, in.ExperienceID, in.Summary, in.Content,
		in.RepoURL, in.DemoURL, in.CoverKey, start, end, in.IsFeatured, in.EducationID)
}

func (s *Store) UpsertSkill(ctx context.Context, in SkillInput) (int64, error) {
	const (
		insert = `INSERT INTO portfoliter.skills (name, category) VALUES ($1, $2) RETURNING id`
		update = `UPDATE portfoliter.skills SET name = $1, category = $2 WHERE id = $3 RETURNING id`
	)
	return s.upsert(ctx, "skill", in.ID, insert, update, nil, in.Name, in.Category)
}

func (s *Store) UpsertEducation(ctx context.Context, in EducationInput) (int64, error) {
	start, err := parseDate("startDate", in.StartDate)
	if err != nil {
		return 0, err
	}
	end, err := parseDate("endDate", in.EndDate)
	if err != nil {
		return 0, err
	}
	const (
		insert = `
			INSERT INTO portfoliter.education (institution, degree, field, start_date, end_date, description)
			VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
		update = `
			UPDATE portfoliter.education SET institution = $1, degree = $2, field = $3,
				start_date = $4, end_date = $5, description = $6
			WHERE id = $7 RETURNING id`
	)
	return s.upsert(ctx, "education", in.ID, insert, update, nil,
		in.Institution, in.Degree, in.Field, start, end, in.Description)
}

func (s *Store) UpsertCertification(ctx context.Context, in CertificationInput) (int64, error) {
	issued, err := parseDate("issuedDate", in.IssuedDate)
	if err != nil {
		return 0, err
	}
	const (
		insert = `
			INSERT INTO portfoliter.certifications (name, issuer, issued_date, credential_url)
			VALUES ($1, $2, $3, $4) RETURNING id`
		update = `
			UPDATE portfoliter.certifications SET name = $1, issuer = $2, issued_date = $3, credential_url = $4
			WHERE id = $5 RETURNING id`
	)
	return s.upsert(ctx, "certification", in.ID, insert, update, nil,
		in.Name, in.Issuer, issued, in.CredentialURL)
}

func (s *Store) UpsertSection(ctx context.Context, in SectionInput) (int64, error) {
	if in.Items == nil {
		in.Items = []any{}
	}
	items, err := toJSON(in.Items)
	if err != nil {
		return 0, err
	}
	const (
		insert = `INSERT INTO portfoliter.sections (key, title, items) VALUES ($1, $2, $3::text::jsonb) RETURNING id`
		update = `UPDATE portfoliter.sections SET key = $1, title = $2, items = $3::text::jsonb WHERE id = $4 RETURNING id`
	)
	return s.upsert(ctx, "section", in.ID, insert, update, nil, in.Key, in.Title, items)
}

// upsert runs insert (id == 0) or update. Fields bind to $1..$n; update binds the id as $n+1.
// New rows rely on the is_published default, so they start as drafts.
func (s *Store) upsert(ctx context.Context, entityType string, id int64, insert, update string,
	afterSave func(pgx.Tx, int64) error, fields ...any) (int64, error) {
	table, err := entityTable(entityType)
	if err != nil {
		return 0, err
	}
	query, args := insert, fields
	if id != 0 {
		query, args = update, append(fields, id)
	}
	return s.mutate(ctx, entityType, table, id, upsertAction(id), func(tx pgx.Tx) (int64, error) {
		var savedID int64
		if err := tx.QueryRow(ctx, query, args...).Scan(&savedID); err != nil {
			return 0, err
		}
		if afterSave == nil {
			return savedID, nil
		}
		return savedID, afterSave(tx, savedID)
	})
}

func (s *Store) SetPublished(ctx context.Context, entityType string, id int64, published bool) error {
	if !publishable[entityType] {
		return fmt.Errorf("%q cannot be published; publishable: experience, project, education, certification, section", entityType)
	}
	table, err := entityTable(entityType)
	if err != nil {
		return err
	}
	action := "unpublish"
	if published {
		action = "publish"
	}
	query := fmt.Sprintf(`UPDATE portfoliter.%s SET is_published = $2 WHERE id = $1`, table)
	_, err = s.mutate(ctx, entityType, table, id, action, func(tx pgx.Tx) (int64, error) {
		_, err := tx.Exec(ctx, query, id, published)
		return id, err
	})
	return err
}

func (s *Store) Delete(ctx context.Context, entityType string, id int64) error {
	table, err := entityTable(entityType)
	if err != nil {
		return err
	}
	query := fmt.Sprintf(`DELETE FROM portfoliter.%s WHERE id = $1`, table)
	_, err = s.mutate(ctx, entityType, table, id, actionDelete, func(tx pgx.Tx) (int64, error) {
		_, err := tx.Exec(ctx, query, id)
		return id, err
	})
	return err
}

// Reorder sets sort_order to each id's position in ids.
func (s *Store) Reorder(ctx context.Context, entityType string, ids []int64) error {
	table, err := entityTable(entityType)
	if err != nil {
		return err
	}
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck // no-op after commit

	query := fmt.Sprintf(`
		UPDATE portfoliter.%s t SET sort_order = x.ord
		FROM unnest($1::bigint[]) WITH ORDINALITY AS x(id, ord)
		WHERE t.id = x.id`, table)
	if _, err := tx.Exec(ctx, query, ids); err != nil {
		return fmt.Errorf("reorder %s: %w", entityType, err)
	}

	order, err := toJSON(ids)
	if err != nil {
		return err
	}
	const logQuery = `
		INSERT INTO portfoliter.change_log (entity_type, action, after)
		VALUES ($1, 'reorder', $2::text::jsonb)`
	if _, err := tx.Exec(ctx, logQuery, entityType, order); err != nil {
		return fmt.Errorf("write change log: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	return nil
}
