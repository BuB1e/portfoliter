package portfolio

import (
	"encoding/json"

	"github.com/jackc/pgx/v5/pgtype"
)

// Portfolio is the public, normalized view served by GET /v1/portfolio (documented in
// docs/portfolio-view.md). Every design renders this one shape, so grouping, linking and empty-value
// rules live here and nowhere else:
//   - only published rows (profile, links and skills are always public);
//   - optional fields are null when unset, never ""; required text is always a string; lists are never null;
//   - each project embeds the published experience or education it links to (null for drafts or unset);
//   - SkillGroups holds the skills grouped by category in catalog order, uncategorized last under key "other";
//   - each section carries Entries, its items read into one generic shape.
//
// Theme is the site design key from site_settings; empty means the frontend's default design.
type Portfolio struct {
	Theme          string          `json:"theme"`
	Profile        Profile         `json:"profile"`
	Links          []Link          `json:"links"`
	Experiences    []Experience    `json:"experiences"`
	Projects       []Project       `json:"projects"`
	Skills         []Skill         `json:"skills"`
	SkillGroups    []SkillGroup    `json:"skillGroups"`
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

// Experience.EmploymentType is free text as written by the owner (e.g. "full-time", "internship");
// the frontend turns it into a label.
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

// Project.ProjectType is WORK, PERSONAL or UNIVERSITY. Summary is the card's short description;
// Content is the markdown detail. ExperienceID/EducationID and the embedded Experience/Education are
// null when unset or when the linked row is a draft. GET /v1/projects/{slug} returns this same shape.
type Project struct {
	ID           int64       `db:"id" json:"id"`
	Slug         string      `db:"slug" json:"slug"`
	Title        string      `db:"title" json:"title"`
	ProjectType  string      `db:"project_type" json:"projectType"`
	ExperienceID *int64      `db:"experience_id" json:"experienceId"`
	EducationID  *int64      `db:"education_id" json:"educationId"`
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
	Experience   *Experience `db:"-" json:"experience"`
	Education    *Education  `db:"-" json:"education"`
}

type Skill struct {
	Name     string  `db:"name" json:"name"`
	Category *string `db:"category" json:"category"`
}

// OtherSkillsKey is the SkillGroup key for skills without a category. The frontend owns its label.
const OtherSkillsKey = "other"

// SkillGroup is one category of skills. Key is the lower-cased category (OtherSkillsKey for none);
// Category is the category as first written, or null for the "other" group.
type SkillGroup struct {
	Key      string   `json:"key"`
	Category *string  `json:"category"`
	Skills   []string `json:"skills"`
}

type Education struct {
	ID          int64       `db:"id" json:"id"`
	Institution string      `db:"institution" json:"institution"`
	Degree      *string     `db:"degree" json:"degree"`
	Field       *string     `db:"field" json:"field"`
	StartDate   pgtype.Date `db:"start_date" json:"startDate"`
	EndDate     pgtype.Date `db:"end_date" json:"endDate"`
	Description string      `db:"description" json:"description"`
}

type Certification struct {
	ID            int64       `db:"id" json:"id"`
	Name          string      `db:"name" json:"name"`
	Issuer        string      `db:"issuer" json:"issuer"`
	IssuedDate    pgtype.Date `db:"issued_date" json:"issuedDate"`
	CredentialURL *string     `db:"credential_url" json:"credentialUrl"`
}

// Section is a free-form section. Items is the raw JSON as stored; Entries is every readable item in
// one generic shape, which is what designs render.
type Section struct {
	Key     string          `db:"key" json:"key"`
	Title   string          `db:"title" json:"title"`
	Items   json.RawMessage `db:"items" json:"items"`
	Entries []SectionEntry  `db:"-" json:"entries"`
}

// SectionEntry is one section item: a title, an optional detail line and an optional http(s) link.
type SectionEntry struct {
	Title  string  `json:"title"`
	Detail *string `json:"detail"`
	URL    *string `json:"url"`
}
