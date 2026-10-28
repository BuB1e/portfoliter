package admin_test

import (
	"context"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfoliter-go/internal/admin"
	"portfoliter-go/internal/testdb"
)

func TestMain(m *testing.M) { testdb.Main(m) }

func int64Ptr(v int64) *int64 { return &v }

// A nil pool would panic if the store reached the database, so these prove validation runs first.
func TestUpsertProjectValidationWithoutDB(t *testing.T) {
	store := admin.NewStore(nil)
	cases := []struct {
		name    string
		in      admin.ProjectInput
		wantErr string
	}{
		{"unknown type", admin.ProjectInput{Slug: "a", Title: "A", ProjectType: "SCHOOL"}, "projectType must be"},
		{"lowercase type", admin.ProjectInput{Slug: "a", Title: "A", ProjectType: "university"}, "projectType must be"},
		{"experience on personal", admin.ProjectInput{Slug: "a", Title: "A", ProjectType: "PERSONAL", ExperienceID: int64Ptr(1)}, "experienceId is only allowed"},
		{"experience on university", admin.ProjectInput{Slug: "a", Title: "A", ProjectType: "UNIVERSITY", ExperienceID: int64Ptr(1)}, "experienceId is only allowed"},
		{"education on work", admin.ProjectInput{Slug: "a", Title: "A", ProjectType: "WORK", EducationID: int64Ptr(1)}, "educationId is only allowed"},
		{"education on personal", admin.ProjectInput{Slug: "a", Title: "A", ProjectType: "PERSONAL", EducationID: int64Ptr(1)}, "educationId is only allowed"},
		{"new summary too long", admin.ProjectInput{Slug: "a", Title: "A", ProjectType: "UNIVERSITY", Summary: strings.Repeat("x", admin.SummaryMaxChars+1)}, "at most 200"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			_, err := store.UpsertProject(context.Background(), tc.in)

			if err == nil || !strings.Contains(err.Error(), tc.wantErr) {
				t.Fatalf("err = %v, want it to contain %q", err, tc.wantErr)
			}
		})
	}
}

func TestUpsertUniversityProjectWithEducation(t *testing.T) {
	ctx := context.Background()
	pool := testdb.Migrated(t)
	store := admin.NewStore(pool)
	educationID, err := store.UpsertEducation(ctx, admin.EducationInput{Institution: "Porto Polytechnic"})
	if err != nil {
		t.Fatal(err)
	}

	id, err := store.UpsertProject(ctx, admin.ProjectInput{
		Slug: "tidewatch", Title: "Tidewatch", ProjectType: "UNIVERSITY",
		EducationID: &educationID, Summary: strings.Repeat("é", admin.SummaryMaxChars), Skills: []string{"LSTM"},
	})

	if err != nil {
		t.Fatalf("upsert UNIVERSITY project: %v", err)
	}
	var projectType string
	var gotEducation *int64
	var published bool
	err = pool.QueryRow(ctx, `SELECT project_type::text, education_id, is_published FROM portfoliter.projects WHERE id = $1`, id).
		Scan(&projectType, &gotEducation, &published)
	if err != nil {
		t.Fatal(err)
	}
	if projectType != "UNIVERSITY" || gotEducation == nil || *gotEducation != educationID || published {
		t.Fatalf("row = (%s, %v, published=%t), want (UNIVERSITY, %d, draft)", projectType, gotEducation, published, educationID)
	}
}

func TestSummaryLimitAppliesToNewTextOnly(t *testing.T) {
	ctx := context.Background()
	pool := testdb.Migrated(t)
	store := admin.NewStore(pool)
	legacy := strings.Repeat("y", admin.SummaryMaxChars+40)
	id := insertLegacyProject(t, pool, legacy)

	_, err := store.UpsertProject(ctx, admin.ProjectInput{
		ID: id, Slug: "legacy", Title: "Legacy (renamed)", ProjectType: "WORK", Summary: legacy,
	})
	if err != nil {
		t.Fatalf("re-saving an unchanged long summary: %v", err)
	}

	_, err = store.UpsertProject(ctx, admin.ProjectInput{
		ID: id, Slug: "legacy", Title: "Legacy", ProjectType: "WORK", Summary: legacy + " more",
	})
	if err == nil || !strings.Contains(err.Error(), "at most 200") {
		t.Fatalf("changing to another long summary: err = %v, want limit error", err)
	}

	_, err = store.UpsertProject(ctx, admin.ProjectInput{
		ID: id, Slug: "legacy", Title: "Legacy", ProjectType: "WORK", Summary: "Short now.",
	})
	if err != nil {
		t.Fatalf("shortening the summary: %v", err)
	}
}

// insertLegacyProject writes a summary longer than the limit directly, like rows saved before it existed.
func insertLegacyProject(t *testing.T, pool *pgxpool.Pool, summary string) int64 {
	t.Helper()
	var id int64
	err := pool.QueryRow(context.Background(), `
		INSERT INTO portfoliter.projects (slug, title, project_type, summary)
		VALUES ('legacy', 'Legacy', 'WORK', $1) RETURNING id`, summary).Scan(&id)
	if err != nil {
		t.Fatal(err)
	}
	return id
}
