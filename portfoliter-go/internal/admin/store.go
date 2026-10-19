package admin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("item not found")

// tables maps entity types to fixed table names; only these values are ever formatted into SQL.
var tables = map[string]string{
	"link":          "links",
	"experience":    "experiences",
	"project":       "projects",
	"skill":         "skills",
	"education":     "education",
	"certification": "certifications",
	"section":       "sections",
}

var publishable = map[string]bool{
	"experience":    true,
	"project":       true,
	"education":     true,
	"certification": true,
	"section":       true,
}

const (
	actionCreate = "create"
	actionUpdate = "update"
	actionUpsert = "upsert"
	actionDelete = "delete"
)

type Store struct {
	pool *pgxpool.Pool
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

// mutate runs fn in one transaction and records the row's before/after in change_log.
func (s *Store) mutate(ctx context.Context, entityType, table string, id int64, action string, fn func(pgx.Tx) (int64, error)) (int64, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck // no-op after commit

	var before *string
	if id != 0 {
		if before, err = snapshot(ctx, tx, table, id); err != nil {
			return 0, err
		}
		if before == nil && action != actionUpsert {
			return 0, fmt.Errorf("%s %d: %w", entityType, id, ErrNotFound)
		}
	}

	savedID, err := fn(tx)
	if err != nil {
		return 0, fmt.Errorf("%s %s: %w", action, entityType, err)
	}

	var after *string
	if action != actionDelete {
		if after, err = snapshot(ctx, tx, table, savedID); err != nil {
			return 0, err
		}
	}

	const logQuery = `
		INSERT INTO portfoliter.change_log (entity_type, entity_id, action, before, after)
		VALUES ($1, $2, $3, $4::text::jsonb, $5::text::jsonb)`
	if _, err := tx.Exec(ctx, logQuery, entityType, savedID, action, before, after); err != nil {
		return 0, fmt.Errorf("write change log: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("commit: %w", err)
	}
	return savedID, nil
}

// snapshot returns the row as JSON text, or nil when it does not exist.
func snapshot(ctx context.Context, tx pgx.Tx, table string, id int64) (*string, error) {
	var row string
	query := fmt.Sprintf(`SELECT to_jsonb(t)::text FROM portfoliter.%s t WHERE id = $1`, table)
	err := tx.QueryRow(ctx, query, id).Scan(&row)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("snapshot %s %d: %w", table, id, err)
	}
	return &row, nil
}

func upsertAction(id int64) string {
	if id == 0 {
		return actionCreate
	}
	return actionUpdate
}

// setSkills replaces an owner's skills, creating unknown skill names.
func setSkills(ctx context.Context, tx pgx.Tx, joinTable, ownerColumn string, ownerID int64, names []string) error {
	deleteQuery := fmt.Sprintf(`DELETE FROM portfoliter.%s WHERE %s = $1`, joinTable, ownerColumn)
	if _, err := tx.Exec(ctx, deleteQuery, ownerID); err != nil {
		return fmt.Errorf("clear skills: %w", err)
	}
	if len(names) == 0 {
		return nil
	}

	const createSkills = `
		INSERT INTO portfoliter.skills (name)
		SELECT unnest($1::text[])
		ON CONFLICT (name) DO NOTHING`
	if _, err := tx.Exec(ctx, createSkills, names); err != nil {
		return fmt.Errorf("create skills: %w", err)
	}

	linkQuery := fmt.Sprintf(`
		INSERT INTO portfoliter.%s (%s, skill_id)
		SELECT $1, id FROM portfoliter.skills WHERE name = ANY($2)`, joinTable, ownerColumn)
	if _, err := tx.Exec(ctx, linkQuery, ownerID, names); err != nil {
		return fmt.Errorf("link skills: %w", err)
	}
	return nil
}

func parseDate(field string, value *string) (*time.Time, error) {
	if value == nil || *value == "" {
		return nil, nil
	}
	t, err := time.Parse(time.DateOnly, *value)
	if err != nil {
		return nil, fmt.Errorf("%s must be YYYY-MM-DD: %w", field, err)
	}
	return &t, nil
}

func requiredDate(field, value string) (time.Time, error) {
	t, err := parseDate(field, &value)
	if err != nil {
		return time.Time{}, err
	}
	if t == nil {
		return time.Time{}, fmt.Errorf("%s is required", field)
	}
	return *t, nil
}

func entityTable(entityType string) (string, error) {
	table, ok := tables[entityType]
	if !ok {
		return "", fmt.Errorf("unknown entity type %q", entityType)
	}
	return table, nil
}

func toJSON(v any) (string, error) {
	b, err := json.Marshal(v)
	if err != nil {
		return "", fmt.Errorf("encode json: %w", err)
	}
	return string(b), nil
}
