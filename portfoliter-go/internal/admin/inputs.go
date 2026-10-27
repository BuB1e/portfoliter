package admin

// Inputs double as MCP tool arguments, so the jsonschema tags are what the AI reads.
// Upserts replace the whole row: omit id to create (as a draft), pass id to update.

type ProfileInput struct {
	FullName  string  `json:"fullName"`
	Headline  string  `json:"headline,omitempty"`
	Bio       string  `json:"bio,omitempty"`
	AvatarKey *string `json:"avatarKey,omitempty" jsonschema:"R2 key from create_upload_url (kind avatar)"`
	Location  *string `json:"location,omitempty"`
	Email     *string `json:"email,omitempty"`
	ResumeKey *string `json:"resumeKey,omitempty" jsonschema:"R2 key from create_upload_url (kind resume)"`
}

type LinkInput struct {
	ID       int64  `json:"id,omitempty" jsonschema:"omit to create, set to update"`
	Platform string `json:"platform" jsonschema:"e.g. github, linkedin"`
	URL      string `json:"url"`
}

type ExperienceInput struct {
	ID             int64    `json:"id,omitempty" jsonschema:"omit to create, set to update"`
	Company        string   `json:"company"`
	Role           string   `json:"role"`
	EmploymentType *string  `json:"employmentType,omitempty" jsonschema:"e.g. full-time, contract, freelance"`
	Location       *string  `json:"location,omitempty"`
	StartDate      string   `json:"startDate" jsonschema:"YYYY-MM-DD"`
	EndDate        *string  `json:"endDate,omitempty" jsonschema:"YYYY-MM-DD; omit if current job"`
	Description    string   `json:"description,omitempty"`
	Skills         []string `json:"skills,omitempty" jsonschema:"full list of skill names; replaces existing; unknown names are created"`
}

type ProjectInput struct {
	ID           int64    `json:"id,omitempty" jsonschema:"omit to create, set to update"`
	Slug         string   `json:"slug" jsonschema:"unique, url-safe, e.g. payments-api"`
	Title        string   `json:"title"`
	ProjectType  string   `json:"projectType" jsonschema:"WORK (built at a job), PERSONAL (side project) or UNIVERSITY (coursework, senior project, thesis)"`
	ExperienceID *int64   `json:"experienceId,omitempty" jsonschema:"experience id; only allowed when projectType is WORK"`
	EducationID  *int64   `json:"educationId,omitempty" jsonschema:"education id (the degree/school it belongs to); only allowed when projectType is UNIVERSITY"`
	Summary      string   `json:"summary,omitempty" jsonschema:"short description shown on the project card, plain text, at most 200 characters; an existing longer summary may be re-sent unchanged"`
	Content      string   `json:"content,omitempty" jsonschema:"full detail shown on the project page, markdown"`
	RepoURL      *string  `json:"repoUrl,omitempty"`
	DemoURL      *string  `json:"demoUrl,omitempty"`
	CoverKey     *string  `json:"coverKey,omitempty" jsonschema:"R2 key from create_upload_url (kind cover)"`
	StartDate    *string  `json:"startDate,omitempty" jsonschema:"YYYY-MM-DD"`
	EndDate      *string  `json:"endDate,omitempty" jsonschema:"YYYY-MM-DD"`
	IsFeatured   bool     `json:"isFeatured,omitempty"`
	Skills       []string `json:"skills,omitempty" jsonschema:"full list of skill names; replaces existing; unknown names are created"`
}

type SkillInput struct {
	ID       int64   `json:"id,omitempty" jsonschema:"omit to create, set to update"`
	Name     string  `json:"name"`
	Category *string `json:"category,omitempty" jsonschema:"e.g. language, framework, cloud"`
}

type EducationInput struct {
	ID          int64   `json:"id,omitempty" jsonschema:"omit to create, set to update"`
	Institution string  `json:"institution"`
	Degree      *string `json:"degree,omitempty"`
	Field       *string `json:"field,omitempty"`
	StartDate   *string `json:"startDate,omitempty" jsonschema:"YYYY-MM-DD"`
	EndDate     *string `json:"endDate,omitempty" jsonschema:"YYYY-MM-DD"`
	Description string  `json:"description,omitempty"`
}

type CertificationInput struct {
	ID            int64   `json:"id,omitempty" jsonschema:"omit to create, set to update"`
	Name          string  `json:"name"`
	Issuer        string  `json:"issuer"`
	IssuedDate    *string `json:"issuedDate,omitempty" jsonschema:"YYYY-MM-DD"`
	CredentialURL *string `json:"credentialUrl,omitempty"`
}

type ThemeInput struct {
	Theme string `json:"theme" jsonschema:"theme key from list_themes"`
}

type SectionInput struct {
	ID    int64  `json:"id,omitempty" jsonschema:"omit to create, set to update"`
	Key   string `json:"key" jsonschema:"unique, e.g. awards, talks"`
	Title string `json:"title"`
	Items []any  `json:"items" jsonschema:"free-form items for this section"`
}
