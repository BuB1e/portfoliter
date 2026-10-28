package portfolio

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrNotFound        = errors.New("portfolio not found")
	ErrProjectNotFound = errors.New("project not found")
)

const (
	themeQuery = `
		SELECT COALESCE((SELECT theme FROM portfoliter.site_settings WHERE id = 1), '')`

	profileQuery = `
		SELECT full_name, headline, bio, avatar_key, location, email, resume_key
		FROM portfoliter.profile
		WHERE id = 1`

	linksQuery = `
		SELECT platform, url
		FROM portfoliter.links
		ORDER BY sort_order, id`

	experiencesQuery = `
		SELECT id, company, role, employment_type, location, start_date, end_date, description
		FROM portfoliter.experiences
		WHERE is_published
		ORDER BY sort_order, start_date DESC, id`

	// Links to a draft experience or education row are returned as null, so drafts never leak.
	publishedProjectsFrom = `
		SELECT p.id, p.slug, p.title, p.project_type::text AS project_type,
		       CASE WHEN e.is_published THEN p.experience_id END AS experience_id,
		       CASE WHEN ed.is_published THEN p.education_id END AS education_id,
		       p.summary, p.content, p.repo_url, p.demo_url, p.cover_key, p.start_date, p.end_date, p.is_featured
		FROM portfoliter.projects p
		LEFT JOIN portfoliter.experiences e ON e.id = p.experience_id
		LEFT JOIN portfoliter.education ed ON ed.id = p.education_id
		WHERE p.is_published`

	projectsQuery = publishedProjectsFrom + `
		ORDER BY p.sort_order, p.id`

	projectBySlugQuery = publishedProjectsFrom + `
		AND p.slug = $1`

	skillsOfProjectQuery = `
		SELECT s.name
		FROM portfoliter.project_skills ps
		JOIN portfoliter.skills s ON s.id = ps.skill_id
		WHERE ps.project_id = $1
		ORDER BY s.sort_order, s.name`

	skillsOfExperienceQuery = `
		SELECT s.name
		FROM portfoliter.experience_skills es
		JOIN portfoliter.skills s ON s.id = es.skill_id
		WHERE es.experience_id = $1
		ORDER BY s.sort_order, s.name`

	experienceByIDQuery = `
		SELECT id, company, role, employment_type, location, start_date, end_date, description
		FROM portfoliter.experiences
		WHERE is_published AND id = $1`

	educationByIDQuery = `
		SELECT id, institution, degree, field, start_date, end_date, description
		FROM portfoliter.education
		WHERE is_published AND id = $1`

	skillsQuery = `
		SELECT name, category
		FROM portfoliter.skills
		ORDER BY sort_order, name`

	projectSkillsQuery = `
		SELECT ps.project_id AS owner_id, s.name
		FROM portfoliter.project_skills ps
		JOIN portfoliter.skills s ON s.id = ps.skill_id
		ORDER BY s.sort_order, s.name`

	experienceSkillsQuery = `
		SELECT es.experience_id AS owner_id, s.name
		FROM portfoliter.experience_skills es
		JOIN portfoliter.skills s ON s.id = es.skill_id
		ORDER BY s.sort_order, s.name`

	educationQuery = `
		SELECT id, institution, degree, field, start_date, end_date, description
		FROM portfoliter.education
		WHERE is_published
		ORDER BY sort_order, COALESCE(start_date, end_date) DESC NULLS LAST, id`

	certificationsQuery = `
		SELECT id, name, issuer, issued_date, credential_url
		FROM portfoliter.certifications
		WHERE is_published
		ORDER BY sort_order, issued_date DESC NULLS LAST, id`

	sectionsQuery = `
		SELECT key, title, items
		FROM portfoliter.sections
		WHERE is_published
		ORDER BY sort_order, id`
)

type skillLink struct {
	OwnerID int64  `db:"owner_id"`
	Name    string `db:"name"`
}

// URLSigner turns a private object key into a short-lived download URL.
type URLSigner interface {
	PresignGet(ctx context.Context, key string) (string, error)
}

type Store struct {
	pool   *pgxpool.Pool
	signer URLSigner
}

func NewStore(pool *pgxpool.Pool, signer URLSigner) *Store {
	return &Store{pool: pool, signer: signer}
}

// GetPublished loads every published section in one round trip.
// Returns ErrNotFound when the profile row does not exist yet.
func (s *Store) GetPublished(ctx context.Context) (Portfolio, error) {
	var (
		p                Portfolio
		projectSkills    []skillLink
		experienceSkills []skillLink
	)

	batch := &pgx.Batch{}
	batch.Queue(themeQuery).QueryRow(func(row pgx.Row) error {
		return row.Scan(&p.Theme)
	})
	batch.Queue(profileQuery).Query(func(rows pgx.Rows) error {
		profile, err := pgx.CollectExactlyOneRow(rows, pgx.RowToStructByName[Profile])
		p.Profile = profile
		return err
	})
	queueList(batch, linksQuery, &p.Links)
	queueList(batch, experiencesQuery, &p.Experiences)
	queueList(batch, projectsQuery, &p.Projects)
	queueList(batch, skillsQuery, &p.Skills)
	queueList(batch, projectSkillsQuery, &projectSkills)
	queueList(batch, experienceSkillsQuery, &experienceSkills)
	queueList(batch, educationQuery, &p.Education)
	queueList(batch, certificationsQuery, &p.Certifications)
	queueList(batch, sectionsQuery, &p.Sections)

	err := s.pool.SendBatch(ctx, batch).Close()
	if errors.Is(err, pgx.ErrNoRows) {
		return Portfolio{}, ErrNotFound
	}
	if err != nil {
		return Portfolio{}, fmt.Errorf("load published portfolio: %w", err)
	}

	projectSkillNames := groupNames(projectSkills)
	for i := range p.Projects {
		p.Projects[i].Skills = namesOrEmpty(projectSkillNames[p.Projects[i].ID])
	}
	experienceSkillNames := groupNames(experienceSkills)
	for i := range p.Experiences {
		p.Experiences[i].Skills = namesOrEmpty(experienceSkillNames[p.Experiences[i].ID])
	}

	if err := s.signFiles(ctx, &p); err != nil {
		return Portfolio{}, err
	}
	normalize(&p)
	return p, nil
}

// GetPublishedProject loads one published project by slug in the same shape as an entry of
// Portfolio.Projects: skills plus the embedded published experience or education it links to.
// Drafts and unknown slugs return ErrProjectNotFound.
func (s *Store) GetPublishedProject(ctx context.Context, slug string) (Project, error) {
	rows, err := s.pool.Query(ctx, projectBySlugQuery, slug)
	if err != nil {
		return Project{}, fmt.Errorf("load project %q: %w", slug, err)
	}
	project, err := pgx.CollectExactlyOneRow(rows, pgx.RowToStructByName[Project])
	if errors.Is(err, pgx.ErrNoRows) {
		return Project{}, ErrProjectNotFound
	}
	if err != nil {
		return Project{}, fmt.Errorf("load project %q: %w", slug, err)
	}

	var experienceSkills []string
	batch := &pgx.Batch{}
	queueNames(batch, skillsOfProjectQuery, project.ID, &project.Skills)
	if project.ExperienceID != nil {
		queueOptional(batch, experienceByIDQuery, *project.ExperienceID, &project.Experience)
		queueNames(batch, skillsOfExperienceQuery, *project.ExperienceID, &experienceSkills)
	}
	if project.EducationID != nil {
		queueOptional(batch, educationByIDQuery, *project.EducationID, &project.Education)
	}
	if err := s.pool.SendBatch(ctx, batch).Close(); err != nil {
		return Project{}, fmt.Errorf("load project %q links: %w", slug, err)
	}
	// The id and the embedded row always agree, even if the row was unpublished between the queries.
	if project.Experience == nil {
		project.ExperienceID = nil
	} else {
		project.Experience.Skills = namesOrEmpty(experienceSkills)
	}
	if project.Education == nil {
		project.EducationID = nil
	}

	if project.CoverURL, err = s.sign(ctx, project.CoverKey); err != nil {
		return Project{}, err
	}
	normalizeProject(&project)
	return project, nil
}

// signFiles fills every *URL field from its *Key. Signing is local; no call to R2.
func (s *Store) signFiles(ctx context.Context, p *Portfolio) error {
	var err error
	if p.Profile.AvatarURL, err = s.sign(ctx, p.Profile.AvatarKey); err != nil {
		return err
	}
	if p.Profile.ResumeURL, err = s.sign(ctx, p.Profile.ResumeKey); err != nil {
		return err
	}
	for i := range p.Projects {
		if p.Projects[i].CoverURL, err = s.sign(ctx, p.Projects[i].CoverKey); err != nil {
			return err
		}
	}
	return nil
}

func (s *Store) sign(ctx context.Context, key *string) (*string, error) {
	if key == nil || *key == "" {
		return nil, nil
	}
	url, err := s.signer.PresignGet(ctx, *key)
	if err != nil {
		return nil, err
	}
	return &url, nil
}

func queueList[T any](batch *pgx.Batch, query string, dst *[]T) {
	batch.Queue(query).Query(func(rows pgx.Rows) error {
		items, err := pgx.CollectRows(rows, pgx.RowToStructByName[T])
		*dst = items
		return err
	})
}

func queueNames(batch *pgx.Batch, query string, id int64, dst *[]string) {
	batch.Queue(query, id).Query(func(rows pgx.Rows) error {
		names, err := pgx.CollectRows(rows, pgx.RowTo[string])
		*dst = names
		return err
	})
}

// queueOptional scans at most one row into *dst; no row leaves it nil.
func queueOptional[T any](batch *pgx.Batch, query string, id int64, dst **T) {
	batch.Queue(query, id).Query(func(rows pgx.Rows) error {
		items, err := pgx.CollectRows(rows, pgx.RowToStructByName[T])
		if err != nil || len(items) == 0 {
			return err
		}
		*dst = &items[0]
		return nil
	})
}

func groupNames(links []skillLink) map[int64][]string {
	byOwner := make(map[int64][]string, len(links))
	for _, l := range links {
		byOwner[l.OwnerID] = append(byOwner[l.OwnerID], l.Name)
	}
	return byOwner
}

// namesOrEmpty keeps the JSON as [] instead of null.
func namesOrEmpty(names []string) []string {
	if names == nil {
		return []string{}
	}
	return names
}
