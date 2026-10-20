package portfolio

import (
	"encoding/json"

	"github.com/jackc/pgx/v5/pgtype"
)

// Portfolio is the published view of every section, as served to the frontend.
// Theme is the site design key from site_settings; empty means the frontend's default design.
type Portfolio struct {
	Theme          string          `json:"theme"`
	Profile        Profile         `json:"profile"`
	Links          []Link          `json:"links"`
	Experiences    []Experience    `json:"experiences"`
	Projects       []Project       `json:"projects"`
	Skills         []Skill         `json:"skills"`
	Education      []Education     `json:"education"`
	Certifications []Certification `json:"certifications"`
	Sections       []Section       `json:"sections"`
}

// *Key fields hold R2 object keys; the matching *URL fields are presigned on read.
type Profile struct {
	FullName  string  `db:"full_name" json:"fullName"`
	Headline  string  `db:"headline" json:"headline"`
	Bio       string  `db:"bio" json:"bio"`
	AvatarKey *string `db:"avatar_key" json:"-"`
	AvatarURL *string `db:"-" json:"avatarUrl"`
	Location  *string `db:"location" json:"location"`
	Email     *string `db:"email" json:"email"`
	ResumeKey *string `db:"resume_key" json:"-"`
	ResumeURL *string `db:"-" json:"resumeUrl"`
}

type Link struct {
	Platform string `db:"platform" json:"platform"`
	URL      string `db:"url" json:"url"`
}

type Experience struct {
	ID             int64       `db:"id" json:"id"`
	Company        string      `db:"company" json:"company"`
	Role           string      `db:"role" json:"role"`
	EmploymentType *string     `db:"employment_type" json:"employmentType"`
	Location       *string     `db:"location" json:"location"`
	StartDate      pgtype.Date `db:"start_date" json:"startDate"`
	EndDate        pgtype.Date `db:"end_date" json:"endDate"`
	Description    string      `db:"description" json:"description"`
	Skills         []string    `db:"-" json:"skills"`
}

type Project struct {
	ID           int64       `db:"id" json:"id"`
	Slug         string      `db:"slug" json:"slug"`
	Title        string      `db:"title" json:"title"`
	ProjectType  string      `db:"project_type" json:"projectType"`
	ExperienceID *int64      `db:"experience_id" json:"experienceId"`
	Summary      string      `db:"summary" json:"summary"`
	Content      string      `db:"content" json:"content"`
	RepoURL      *string     `db:"repo_url" json:"repoUrl"`
	DemoURL      *string     `db:"demo_url" json:"demoUrl"`
	CoverKey     *string     `db:"cover_key" json:"-"`
	CoverURL     *string     `db:"-" json:"coverUrl"`
	StartDate    pgtype.Date `db:"start_date" json:"startDate"`
	EndDate      pgtype.Date `db:"end_date" json:"endDate"`
	IsFeatured   bool        `db:"is_featured" json:"isFeatured"`
	Skills       []string    `db:"-" json:"skills"`
}

type Skill struct {
	Name     string  `db:"name" json:"name"`
	Category *string `db:"category" json:"category"`
}

type Education struct {
	Institution string      `db:"institution" json:"institution"`
	Degree      *string     `db:"degree" json:"degree"`
	Field       *string     `db:"field" json:"field"`
	StartDate   pgtype.Date `db:"start_date" json:"startDate"`
	EndDate     pgtype.Date `db:"end_date" json:"endDate"`
	Description string      `db:"description" json:"description"`
}

type Certification struct {
	Name          string      `db:"name" json:"name"`
	Issuer        string      `db:"issuer" json:"issuer"`
	IssuedDate    pgtype.Date `db:"issued_date" json:"issuedDate"`
	CredentialURL *string     `db:"credential_url" json:"credentialUrl"`
}

type Section struct {
	Key   string          `db:"key" json:"key"`
	Title string          `db:"title" json:"title"`
	Items json.RawMessage `db:"items" json:"items"`
}
