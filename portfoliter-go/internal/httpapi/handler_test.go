package httpapi_test

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/modelcontextprotocol/go-sdk/auth"

	"portfoliter-go/internal/httpapi"
	"portfoliter-go/internal/portfolio"
	"portfoliter-go/internal/testdb"
)

func TestMain(m *testing.M) { testdb.Main(m) }

const readKey = "read-key"

type fakeSigner struct{}

func (fakeSigner) PresignGet(_ context.Context, key string) (string, error) {
	return "https://files.example/" + key, nil
}

type noMCPAuth struct{}

func (noMCPAuth) Verify(context.Context, string, *http.Request) (*auth.TokenInfo, error) {
	return nil, auth.ErrInvalidToken
}
func (noMCPAuth) ResourceMetadataURL() string { return "" }
func (noMCPAuth) Register(*http.ServeMux)     {}

// seed: a published UNIVERSITY project linked to published education, a WORK project linked to a draft
// experience, and a draft UNIVERSITY project.
func seed(t *testing.T, pool *pgxpool.Pool) {
	t.Helper()
	_, err := pool.Exec(context.Background(), `
		INSERT INTO portfoliter.profile (full_name) VALUES ('Owner');
		INSERT INTO portfoliter.education (id, institution, degree, field, end_date, is_published)
		VALUES (7, 'Kasetsart University', 'B.Sc.', 'Computer Science', '2026-04-30', true);
		INSERT INTO portfoliter.experiences (id, company, role, start_date, is_published)
		VALUES (3, 'Hidden Co', 'Engineer', '2026-04-01', false);
		INSERT INTO portfoliter.projects (id, slug, title, project_type, education_id, summary, content,
			cover_key, repo_url, start_date, end_date, is_published)
		VALUES (1, 'growthcheck', 'GrowthCheck', 'UNIVERSITY', 7, 'Senior project.', '## Detail',
			'cover/a.jpg', 'https://github.com/x/y', '2025-09-01', '2026-04-30', true);
		INSERT INTO portfoliter.projects (id, slug, title, project_type, experience_id, is_published)
		VALUES (2, 'work-thing', 'Work thing', 'WORK', 3, true);
		INSERT INTO portfoliter.projects (id, slug, title, project_type, is_published)
		VALUES (3, 'draft-thesis', 'Draft thesis', 'UNIVERSITY', false);
		INSERT INTO portfoliter.skills (id, name) VALUES (1, 'LSTM');
		INSERT INTO portfoliter.project_skills (project_id, skill_id) VALUES (1, 1)`)
	if err != nil {
		t.Fatalf("seed: %v", err)
	}
}

func newServer(t *testing.T) *httptest.Server {
	t.Helper()
	pool := testdb.Migrated(t)
	seed(t, pool)
	handler := httpapi.NewHandler(portfolio.NewStore(pool, fakeSigner{}), http.NotFoundHandler(),
		sha256.Sum256([]byte(readKey)), noMCPAuth{})
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	return srv
}

func get(t *testing.T, srv *httptest.Server, path, key string, out any) int {
	t.Helper()
	req, _ := http.NewRequest(http.MethodGet, srv.URL+path, nil)
	if key != "" {
		req.Header.Set("X-API-Key", key)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("GET %s: %v", path, err)
	}
	defer resp.Body.Close()
	if out != nil && resp.StatusCode == http.StatusOK {
		if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
			t.Fatalf("decode %s: %v", path, err)
		}
	}
	return resp.StatusCode
}

func TestGetPublishedProjectBySlug(t *testing.T) {
	srv := newServer(t)
	var got map[string]any

	status := get(t, srv, "/v1/projects/growthcheck", readKey, &got)

	if status != http.StatusOK {
		t.Fatalf("status = %d, want 200", status)
	}
	checks := map[string]any{
		"slug": "growthcheck", "projectType": "UNIVERSITY", "summary": "Senior project.", "content": "## Detail",
		"coverUrl": "https://files.example/cover/a.jpg", "repoUrl": "https://github.com/x/y",
		"startDate": "2025-09-01", "endDate": "2026-04-30", "educationId": float64(7), "experience": nil,
	}
	for field, want := range checks {
		if got[field] != want {
			t.Errorf("%s = %v, want %v", field, got[field], want)
		}
	}
	education, _ := got["education"].(map[string]any)
	if education["institution"] != "Kasetsart University" || education["degree"] != "B.Sc." {
		t.Errorf("education = %v, want the linked Kasetsart University row", got["education"])
	}
	if skills, _ := got["skills"].([]any); len(skills) != 1 || skills[0] != "LSTM" {
		t.Errorf("skills = %v, want [LSTM]", got["skills"])
	}
}

func TestGetProjectHidesDraftLinks(t *testing.T) {
	srv := newServer(t)
	var got map[string]any

	status := get(t, srv, "/v1/projects/work-thing", readKey, &got)

	if status != http.StatusOK {
		t.Fatalf("status = %d, want 200", status)
	}
	if got["experienceId"] != nil || got["experience"] != nil {
		t.Fatalf("draft experience leaked: experienceId=%v experience=%v", got["experienceId"], got["experience"])
	}
	if skills, ok := got["skills"].([]any); !ok || len(skills) != 0 {
		t.Fatalf("skills = %v, want []", got["skills"])
	}
}

func TestGetProjectNotFound(t *testing.T) {
	srv := newServer(t)
	for _, path := range []string{"/v1/projects/draft-thesis", "/v1/projects/no-such-project", "/v1/projects/GrowthCheck"} {
		t.Run(path, func(t *testing.T) {
			if status := get(t, srv, path, readKey, nil); status != http.StatusNotFound {
				t.Fatalf("status = %d, want 404", status)
			}
		})
	}
}

func TestGetProjectRequiresReadKey(t *testing.T) {
	srv := newServer(t)

	if status := get(t, srv, "/v1/projects/growthcheck", "wrong", nil); status != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", status)
	}
}

func TestPortfolioListsUniversityProjects(t *testing.T) {
	srv := newServer(t)
	var got portfolio.Portfolio

	status := get(t, srv, "/v1/portfolio", readKey, &got)

	if status != http.StatusOK {
		t.Fatalf("status = %d, want 200", status)
	}
	if len(got.Projects) != 2 {
		t.Fatalf("projects = %d, want 2 published", len(got.Projects))
	}
	byslug := map[string]portfolio.Project{}
	for _, p := range got.Projects {
		byslug[p.Slug] = p
	}
	uni := byslug["growthcheck"]
	if uni.ProjectType != "UNIVERSITY" || uni.EducationID == nil || *uni.EducationID != 7 || uni.Summary != "Senior project." {
		t.Errorf("growthcheck = %+v, want UNIVERSITY linked to education 7", uni)
	}
	if byslug["work-thing"].ExperienceID != nil {
		t.Errorf("work-thing experienceId = %v, want null for a draft experience", *byslug["work-thing"].ExperienceID)
	}
	if len(got.Education) != 1 || got.Education[0].ID != 7 {
		t.Errorf("education = %+v, want id 7", got.Education)
	}
}
