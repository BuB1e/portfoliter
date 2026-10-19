package portfolio

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("portfolio not found")

const (
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
		ORDER BY sort_order, start_date DESC`

	projectsQuery = `
		SELECT id, slug, title, project_type::text AS project_type, experience_id, summary, content,
		       repo_url, demo_url, cover_key, start_date, end_date, is_featured
		FROM portfoliter.projects
		WHERE is_published
		ORDER BY sort_order, id`

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
		SELECT institution, degree, field, start_date, end_date, description
		FROM portfoliter.education
		WHERE is_published
		ORDER BY sort_order, start_date DESC`

	certificationsQuery = `
		SELECT name, issuer, issued_date, credential_url
		FROM portfoliter.certifications
		WHERE is_published
		ORDER BY sort_order, issued_date DESC`

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
	return p, nil
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
