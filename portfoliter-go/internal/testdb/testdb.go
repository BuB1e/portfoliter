// Package testdb gives tests a throwaway PostgreSQL in Docker (testcontainers).
// It never reads DB_* env vars, so tests cannot reach a shared or production database.
package testdb

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"sync"
	"sync/atomic"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/testcontainers/testcontainers-go"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"

	"portfoliter-go/internal/migrations"
)

const image = "postgres:17-alpine"

var (
	startOnce sync.Once
	container *tcpostgres.PostgresContainer
	adminURL  string
	startErr  error
	dbCounter atomic.Int64
)

// Main runs the package's tests, then stops the shared container. Call it from TestMain.
func Main(m *testing.M) {
	code := m.Run()
	if container != nil {
		_ = testcontainers.TerminateContainer(container)
	}
	os.Exit(code)
}

// New returns a pool on a fresh, empty database. Tests are skipped when Docker is not available.
func New(t *testing.T) *pgxpool.Pool {
	t.Helper()
	testcontainers.SkipIfProviderIsNotHealthy(t)
	ctx := context.Background()

	startOnce.Do(func() {
		container, startErr = tcpostgres.Run(ctx, image,
			tcpostgres.WithDatabase("postgres"),
			tcpostgres.BasicWaitStrategies(),
		)
		if startErr == nil {
			adminURL, startErr = container.ConnectionString(ctx, "sslmode=disable")
		}
	})
	if startErr != nil {
		t.Fatalf("start postgres container: %v", startErr)
	}

	name := fmt.Sprintf("test_%d", dbCounter.Add(1))
	admin, err := pgx.Connect(ctx, adminURL)
	if err != nil {
		t.Fatalf("connect to test postgres: %v", err)
	}
	defer admin.Close(ctx)
	if _, err := admin.Exec(ctx, "CREATE DATABASE "+name); err != nil {
		t.Fatalf("create test database: %v", err)
	}

	cfg, err := pgxpool.ParseConfig(adminURL)
	if err != nil {
		t.Fatalf("parse test db url: %v", err)
	}
	cfg.ConnConfig.Database = name
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		t.Fatalf("open test database: %v", err)
	}
	t.Cleanup(pool.Close)
	return pool
}

// SQLDB wraps the pool for database/sql users such as goose. Closed when the test ends.
func SQLDB(t *testing.T, pool *pgxpool.Pool) *sql.DB {
	t.Helper()
	db := stdlib.OpenDBFromPool(pool)
	t.Cleanup(func() { db.Close() })
	return db
}

// Migrated returns a pool on a fresh database with every migration applied.
func Migrated(t *testing.T) *pgxpool.Pool {
	t.Helper()
	pool := New(t)
	if err := migrations.Up(context.Background(), SQLDB(t, pool)); err != nil {
		t.Fatalf("apply migrations: %v", err)
	}
	return pool
}
