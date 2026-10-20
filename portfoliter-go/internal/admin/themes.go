package admin

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
)

// Theme is one site design the frontend can render; the catalog lives in theme_catalog.go.
type Theme struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IsActive    bool   `json:"isActive"`
}

func validateTheme(key string) error {
	if len(themeCatalog) == 0 {
		return fmt.Errorf("no themes defined; add one to themeCatalog in internal/admin/theme_catalog.go")
	}
	keys := make([]string, 0, len(themeCatalog))
	for _, theme := range themeCatalog {
		if theme.Key == key {
			return nil
		}
		keys = append(keys, theme.Key)
	}
	return fmt.Errorf("unknown theme %q; valid: %s", key, strings.Join(keys, ", "))
}

// ListThemes returns every design with the live one marked, as JSON.
// An empty stored theme means the default, which is the first catalog entry.
func (s *Store) ListThemes(ctx context.Context) (string, error) {
	const query = `SELECT COALESCE((SELECT theme FROM portfoliter.site_settings WHERE id = 1), '')`

	var active string
	if err := s.pool.QueryRow(ctx, query).Scan(&active); err != nil {
		return "", fmt.Errorf("get active theme: %w", err)
	}
	if active == "" && len(themeCatalog) > 0 {
		active = themeCatalog[0].Key
	}
	themes := make([]Theme, len(themeCatalog))
	for i, theme := range themeCatalog {
		theme.IsActive = theme.Key == active
		themes[i] = theme
	}
	return toJSON(themes)
}

// SetTheme switches the site design; the frontend picks it up on the next page load.
func (s *Store) SetTheme(ctx context.Context, in ThemeInput) (int64, error) {
	if err := validateTheme(in.Theme); err != nil {
		return 0, err
	}
	const query = `
		INSERT INTO portfoliter.site_settings (id, theme)
		VALUES (1, $1)
		ON CONFLICT (id) DO UPDATE SET theme = EXCLUDED.theme, updated_at = now()
		RETURNING id`
	return s.mutate(ctx, "site_settings", "site_settings", 1, actionUpsert, func(tx pgx.Tx) (int64, error) {
		var id int64
		err := tx.QueryRow(ctx, query, in.Theme).Scan(&id)
		return id, err
	})
}
