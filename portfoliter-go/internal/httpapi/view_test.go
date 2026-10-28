package httpapi_test

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"flag"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfoliter-go/internal/httpapi"
	"portfoliter-go/internal/portfolio"
	"portfoliter-go/internal/testdb"
)

var update = flag.Bool("update", false, "rewrite testdata/*.golden.json from the current responses")

// seedFull is a complete profile of a fictional person with every field set somewhere, plus the
// awkward cases: blank optional text, uncategorized skills, a certification with no date or link, an
// education row with no start date, a project with no cover or content, a custom section with an
// unknown key, every common employment type, and a draft of every publishable kind.
func seedFull(t *testing.T, pool *pgxpool.Pool) {
	t.Helper()
	_, err := pool.Exec(context.Background(), `
		INSERT INTO portfoliter.site_settings (id, theme) VALUES (1, 'parcel')
		ON CONFLICT (id) DO UPDATE SET theme = EXCLUDED.theme;
		INSERT INTO portfoliter.profile (full_name, headline, bio, avatar_key, location, email, resume_key)
		VALUES ('Mira Castellanos', 'Platform engineer', 'Builds quiet infrastructure.', 'avatar/mira.jpg',
			'Porto, Portugal', '', 'resume/mira.pdf');
		INSERT INTO portfoliter.links (platform, url, sort_order) VALUES
			('linkedin', 'https://linkedin.example/mira', 1),
			('github', 'https://github.example/mira', 0);

		INSERT INTO portfoliter.experiences (id, company, role, employment_type, location, start_date, end_date,
			description, sort_order, is_published) VALUES
			(1, 'Lumen Freight', 'Staff Engineer', 'full-time', 'Porto, Portugal', '2024-03-01', NULL, 'Runs the platform team.', 0, true),
			(2, 'Kitebird Labs', 'Backend Contractor', 'contract', '', '2023-01-01', '2024-02-29', '', 0, true),
			(3, 'Orchard Health', 'Data Engineer', ' ', NULL, '2023-01-01', '2023-12-31', 'Same start as Kitebird.', 0, true),
			(4, 'Secret Startup', 'CTO', 'full-time', NULL, '2025-01-01', NULL, 'Draft.', 0, false);

		INSERT INTO portfoliter.education (id, institution, degree, field, start_date, end_date, description, is_published) VALUES
			(1, 'Porto Polytechnic', 'B.Sc.', 'Software Engineering', NULL, '2022-07-31', 'Final grade 17/20', true),
			(2, 'Open Night School', '', NULL, '2019-09-01', '2020-06-30', '', true),
			(3, 'Draft Academy', 'M.Sc.', 'Drafts', '2024-01-01', NULL, '', false);

		INSERT INTO portfoliter.skills (id, name, category, sort_order) VALUES
			(1, 'Go', 'Language', 0),
			(2, 'PostgreSQL', 'database', 1),
			(3, 'Terraform', NULL, 2),
			(4, 'TypeScript', 'language', 3),
			(5, 'Figma', '', 4);
		INSERT INTO portfoliter.experience_skills (experience_id, skill_id) VALUES (1, 2), (1, 1), (2, 4), (4, 3);

		INSERT INTO portfoliter.projects (id, slug, title, project_type, experience_id, education_id, summary, content,
			repo_url, demo_url, cover_key, start_date, end_date, is_featured, sort_order, is_published) VALUES
			(1, 'freight-router', 'Freight Router', 'WORK', 1, NULL, 'Routes parcels.', '## How it works',
				'https://github.example/mira/router', 'https://router.example', 'cover/router.png', '2024-05-01', NULL, true, 0, true),
			(2, 'night-notes', 'Night Notes', 'PERSONAL', NULL, NULL, 'Notes app.', '', '', NULL, NULL, NULL, NULL, false, 1, true),
			(3, 'thesis-viz', 'Thesis Viz', 'UNIVERSITY', NULL, 1, 'Final-year project.', 'Charts.', NULL, NULL, NULL,
				'2021-09-01', '2022-06-30', false, 2, true),
			(4, 'stealth', 'Stealth', 'WORK', 4, NULL, 'Linked to a draft job.', '', NULL, NULL, NULL, NULL, NULL, false, 3, true),
			(5, 'draft-project', 'Draft Project', 'PERSONAL', NULL, NULL, '', '', NULL, NULL, NULL, NULL, NULL, false, 4, false);
		INSERT INTO portfoliter.project_skills (project_id, skill_id) VALUES (1, 1), (1, 2), (3, 4);

		INSERT INTO portfoliter.certifications (id, name, issuer, issued_date, credential_url, is_published) VALUES
			(1, 'Language test', 'Exam Board', NULL, NULL, true),
			(2, 'Cloud Architect', 'Cloud Co', '2024-06-15', 'https://certs.example/mira', true),
			(3, 'Draft Cert', 'Nobody', '2025-01-01', '', false);

		INSERT INTO portfoliter.sections (key, title, items, sort_order, is_published) VALUES
			('awards', 'Awards', '[{"name": "Open-source award", "note": "2023"}]', 0, true),
			('talks', 'Talks', '[{"event": "PyCon Lisbon", "role": "Speaker", "url": "https://talks.example/1"}, "Lightning talk", {}]', 1, true),
			('secret', 'Secret', '["hidden"]', 2, false)`)
	if err != nil {
		t.Fatalf("seed full fixture: %v", err)
	}
}

func newFullServer(t *testing.T) *httptest.Server {
	t.Helper()
	pool := testdb.Migrated(t)
	seedFull(t, pool)
	handler := httpapi.NewHandler(portfolio.NewStore(pool, fakeSigner{}), http.NotFoundHandler(),
		sha256.Sum256([]byte(readKey)), noMCPAuth{})
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)
	return srv
}

func getBody(t *testing.T, srv *httptest.Server, path string) []byte {
	t.Helper()
	req, _ := http.NewRequest(http.MethodGet, srv.URL+path, nil)
	req.Header.Set("X-API-Key", readKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("GET %s: %v", path, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("GET %s: status %d", path, resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read %s: %v", path, err)
	}
	return body
}

// assertGolden compares the response with testdata/<name>.golden.json (indented). Run
// `go test ./internal/httpapi -run View -update` to rewrite it, then review the diff.
func assertGolden(t *testing.T, name string, body []byte) {
	t.Helper()
	var pretty bytes.Buffer
	if err := json.Indent(&pretty, body, "", "  "); err != nil {
		t.Fatalf("indent %s: %v", name, err)
	}
	pretty.WriteByte('\n')
	path := filepath.Join("testdata", name+".golden.json")
	if *update {
		if err := os.MkdirAll("testdata", 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, pretty.Bytes(), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	want, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read golden %s: %v", path, err)
	}
	if !bytes.Equal(pretty.Bytes(), want) {
		t.Errorf("%s differs from %s; got:\n%s", name, path, pretty.String())
	}
}

// The whole public view is pinned by a golden file; the checks below name the rules it encodes.
func TestPortfolioViewFullFixture(t *testing.T) {
	srv := newFullServer(t)
	body := getBody(t, srv, "/v1/portfolio")
	assertGolden(t, "portfolio_view", body)

	var got portfolio.Portfolio
	if err := json.Unmarshal(body, &got); err != nil {
		t.Fatalf("decode: %v", err)
	}

	t.Run("only published rows", func(t *testing.T) {
		if len(got.Experiences) != 3 || len(got.Education) != 2 || len(got.Certifications) != 2 ||
			len(got.Sections) != 2 || len(got.Projects) != 4 {
			t.Fatalf("counts: experiences %d, education %d, certifications %d, sections %d, projects %d",
				len(got.Experiences), len(got.Education), len(got.Certifications), len(got.Sections), len(got.Projects))
		}
	})

	t.Run("stable order", func(t *testing.T) {
		var companies []string
		for _, e := range got.Experiences {
			companies = append(companies, e.Company)
		}
		if want := []string{"Lumen Freight", "Kitebird Labs", "Orchard Health"}; !equal(companies, want) {
			t.Errorf("experiences = %v, want %v (start date desc, then id)", companies, want)
		}
		if got.Certifications[0].Name != "Cloud Architect" {
			t.Errorf("first certification = %q, want the dated one before the undated one", got.Certifications[0].Name)
		}
		if got.Links[0].Platform != "github" {
			t.Errorf("first link = %q, want github (sort_order 0)", got.Links[0].Platform)
		}
	})

	t.Run("blank optional text is null", func(t *testing.T) {
		kitebird, orchard := got.Experiences[1], got.Experiences[2]
		if got.Profile.Email != nil || kitebird.Location != nil || orchard.EmploymentType != nil {
			t.Errorf("email %v, kitebird location %v, orchard employmentType %v; want null",
				got.Profile.Email, kitebird.Location, orchard.EmploymentType)
		}
		if got.Education[1].Degree != nil {
			t.Errorf("education degree = %v, want null", *got.Education[1].Degree)
		}
	})

	t.Run("projects embed their published links", func(t *testing.T) {
		router, thesis, stealth := got.Projects[0], got.Projects[2], got.Projects[3]
		if router.Experience == nil || router.Experience.Company != "Lumen Freight" || !equal(router.Experience.Skills, []string{"Go", "PostgreSQL"}) {
			t.Errorf("freight-router experience = %+v", router.Experience)
		}
		if thesis.Education == nil || thesis.Education.Description != "Final grade 17/20" {
			t.Errorf("thesis-viz education = %+v", thesis.Education)
		}
		if stealth.ExperienceID != nil || stealth.Experience != nil {
			t.Errorf("stealth leaks a draft job: %v %+v", stealth.ExperienceID, stealth.Experience)
		}
	})

	t.Run("skill groups", func(t *testing.T) {
		var keys []string
		for _, g := range got.SkillGroups {
			keys = append(keys, g.Key)
		}
		if !equal(keys, []string{"language", "database", "other"}) {
			t.Errorf("skill group keys = %v", keys)
		}
		if !equal(got.SkillGroups[0].Skills, []string{"Go", "TypeScript"}) || !equal(got.SkillGroups[2].Skills, []string{"Terraform", "Figma"}) {
			t.Errorf("skill groups = %+v", got.SkillGroups)
		}
	})

	t.Run("section entries", func(t *testing.T) {
		talks := got.Sections[1].Entries
		if len(talks) != 2 || talks[0].Title != "PyCon Lisbon" || talks[0].URL == nil || talks[1].Title != "Lightning talk" {
			t.Errorf("talks entries = %+v", talks)
		}
	})
}

// GET /v1/projects/{slug} returns exactly the project's entry in the portfolio view.
func TestProjectViewMatchesPortfolioEntry(t *testing.T) {
	srv := newFullServer(t)
	var view struct {
		Projects []json.RawMessage `json:"projects"`
	}
	if err := json.Unmarshal(getBody(t, srv, "/v1/portfolio"), &view); err != nil {
		t.Fatal(err)
	}

	for i, slug := range []string{"freight-router", "night-notes", "thesis-viz", "stealth"} {
		t.Run(slug, func(t *testing.T) {
			got := getBody(t, srv, "/v1/projects/"+slug)

			if !jsonEqual(t, got, view.Projects[i]) {
				t.Errorf("project %s:\n%s\nportfolio entry:\n%s", slug, got, view.Projects[i])
			}
		})
	}
}

func jsonEqual(t *testing.T, a, b []byte) bool {
	t.Helper()
	var x, y any
	if err := json.Unmarshal(a, &x); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(b, &y); err != nil {
		t.Fatal(err)
	}
	ax, _ := json.Marshal(x)
	by, _ := json.Marshal(y)
	return bytes.Equal(ax, by)
}

func equal(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
