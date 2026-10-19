package migrations

import (
	"context"
	"database/sql"
	"embed"
	"fmt"

	"github.com/pressly/goose/v3"
)

// Schema owns every app table, including goose's version table.
const Schema = "portfoliter"

//go:embed *.sql
var files embed.FS

// Up creates the app schema if needed and applies all pending migrations.
func Up(ctx context.Context, db *sql.DB) error {
	// goose creates its version table before running migrations, so the schema must exist first.
	if _, err := db.ExecContext(ctx, "CREATE SCHEMA IF NOT EXISTS "+Schema); err != nil {
		return fmt.Errorf("create schema %s: %w", Schema, err)
	}

	provider, err := goose.NewProvider(goose.DialectPostgres, db, files,
		goose.WithTableName(Schema+".goose_db_version"),
	)
	if err != nil {
		return fmt.Errorf("create migration provider: %w", err)
	}
	if _, err := provider.Up(ctx); err != nil {
		return fmt.Errorf("apply migrations: %w", err)
	}
	return nil
}
