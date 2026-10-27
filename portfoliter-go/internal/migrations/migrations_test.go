package migrations_test

import (
	"context"
	"errors"
	"testing"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"portfoliter-go/internal/migrations"
	"portfoliter-go/internal/testdb"
)

func TestMain(m *testing.M) { testdb.Main(m) }

const universityVersion = 5

func TestMigrationsApplyFromScratch(t *testing.T) {
	pool := testdb.Migrated(t)

	var version int64
	err := pool.QueryRow(context.Background(),
		`SELECT max(version_id) FROM portfoliter.goose_db_version WHERE is_applied`).Scan(&version)
	if err != nil {
		t.Fatalf("read goose version: %v", err)
	}
	if version < universityVersion {
		t.Fatalf("version = %d, want >= %d", version, universityVersion)
	}
}

func TestUniversityMigrationUpAndDown(t *testing.T) {
	ctx := context.Background()
	pool := testdb.New(t)
	db := testdb.SQLDB(t, pool)
	if _, err := db.ExecContext(ctx, "CREATE SCHEMA IF NOT EXISTS "+migrations.Schema); err != nil {
		t.Fatalf("create schema: %v", err)
	}
	provider, err := migrations.NewProvider(db)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := provider.UpTo(ctx, universityVersion-1); err != nil {
		t.Fatalf("up to %d: %v", universityVersion-1, err)
	}
	mustExec(t, pool, `
		INSERT INTO portfoliter.experiences (id, company, role, start_date) VALUES (1, 'Acme', 'Engineer', '2024-01-01');
		INSERT INTO portfoliter.education (id, institution) VALUES (1, 'Kasetsart University');
		INSERT INTO portfoliter.projects (slug, title, project_type, experience_id) VALUES ('work-one', 'Work', 'WORK', 1);
		INSERT INTO portfoliter.projects (slug, title, project_type) VALUES ('side-one', 'Side', 'PERSONAL')`)

	if _, err := provider.UpTo(ctx, universityVersion); err != nil {
		t.Fatalf("up to %d: %v", universityVersion, err)
	}

	mustExec(t, pool, `
		INSERT INTO portfoliter.projects (slug, title, project_type, education_id)
		VALUES ('senior-project', 'Senior project', 'UNIVERSITY', 1)`)
	mustExec(t, pool, `INSERT INTO portfoliter.projects (slug, title, project_type) VALUES ('uni-no-link', 'Uni', 'UNIVERSITY')`)
	checkViolation(t, pool, "only_university_has_education",
		`INSERT INTO portfoliter.projects (slug, title, project_type, education_id) VALUES ('bad-1', 'Bad', 'PERSONAL', 1)`)
	checkViolation(t, pool, "only_university_has_education",
		`INSERT INTO portfoliter.projects (slug, title, project_type, education_id) VALUES ('bad-2', 'Bad', 'WORK', 1)`)
	checkViolation(t, pool, "only_work_has_experience",
		`INSERT INTO portfoliter.projects (slug, title, project_type, experience_id) VALUES ('bad-3', 'Bad', 'UNIVERSITY', 1)`)

	mustExec(t, pool, `DELETE FROM portfoliter.education WHERE id = 1`)
	var educationID *int64
	if err := pool.QueryRow(ctx, `SELECT education_id FROM portfoliter.projects WHERE slug = 'senior-project'`).Scan(&educationID); err != nil {
		t.Fatal(err)
	}
	if educationID != nil {
		t.Fatalf("education_id = %d after deleting the education row, want NULL", *educationID)
	}

	if _, err := provider.DownTo(ctx, universityVersion-1); err != nil {
		t.Fatalf("down to %d: %v", universityVersion-1, err)
	}

	types := map[string]string{}
	rows, err := pool.Query(ctx, `SELECT slug, project_type::text FROM portfoliter.projects`)
	if err != nil {
		t.Fatal(err)
	}
	for rows.Next() {
		var slug, projectType string
		if err := rows.Scan(&slug, &projectType); err != nil {
			t.Fatal(err)
		}
		types[slug] = projectType
	}
	if err := rows.Err(); err != nil {
		t.Fatal(err)
	}
	want := map[string]string{"work-one": "WORK", "side-one": "PERSONAL", "senior-project": "PERSONAL", "uni-no-link": "PERSONAL"}
	for slug, projectType := range want {
		if types[slug] != projectType {
			t.Errorf("after down, %s type = %q, want %q", slug, types[slug], projectType)
		}
	}

	var labels []string
	if err := pool.QueryRow(ctx, `SELECT array_agg(enumlabel::text ORDER BY enumsortorder) FROM pg_enum e
		JOIN pg_type t ON t.oid = e.enumtypid JOIN pg_namespace n ON n.oid = t.typnamespace
		WHERE n.nspname = 'portfoliter' AND t.typname = 'project_type'`).Scan(&labels); err != nil {
		t.Fatal(err)
	}
	if len(labels) != 2 || labels[0] != "PERSONAL" || labels[1] != "WORK" {
		t.Fatalf("project_type labels after down = %v, want [PERSONAL WORK]", labels)
	}

	var logged int
	if err := pool.QueryRow(ctx, `SELECT count(*) FROM portfoliter.change_log
		WHERE note LIKE 'migration 00005 down%' AND after->>'project_type' = 'PERSONAL'`).Scan(&logged); err != nil {
		t.Fatal(err)
	}
	if logged != 2 {
		t.Fatalf("change_log entries for converted projects = %d, want 2", logged)
	}
	checkViolation(t, pool, "personal_has_no_experience",
		`INSERT INTO portfoliter.projects (slug, title, project_type, experience_id) VALUES ('bad-4', 'Bad', 'PERSONAL', 1)`)

	if _, err := provider.Up(ctx); err != nil {
		t.Fatalf("re-apply after down: %v", err)
	}
}

func mustExec(t *testing.T, pool *pgxpool.Pool, sql string) {
	t.Helper()
	if _, err := pool.Exec(context.Background(), sql); err != nil {
		t.Fatalf("exec %q: %v", sql, err)
	}
}

func checkViolation(t *testing.T, pool *pgxpool.Pool, constraint, sql string) {
	t.Helper()
	_, err := pool.Exec(context.Background(), sql)
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) || pgErr.ConstraintName != constraint {
		t.Fatalf("exec %q: err = %v, want violation of %s", sql, err, constraint)
	}
}
