package admin

import (
	"context"
	"os"
	"regexp"
	"slices"
	"testing"
)

// frontendThemeFile holds THEME_KEYS, the designs the frontend can actually render.
const frontendThemeFile = "../../../portfoliter-rr-v8/app/lib/theme.ts"

// Works for any catalog: every listed key is accepted, anything else is rejected.
func TestValidateTheme(t *testing.T) {
	for _, theme := range themeCatalog {
		t.Run(theme.Key, func(t *testing.T) {
			if err := validateTheme(theme.Key); err != nil {
				t.Fatalf("validateTheme(%q) = %v, want nil", theme.Key, err)
			}
		})
	}
	for _, key := range []string{"", "no-such-theme", " "} {
		t.Run("invalid "+key, func(t *testing.T) {
			if err := validateTheme(key); err == nil {
				t.Fatalf("validateTheme(%q) = nil, want error", key)
			}
		})
	}
}

// A nil pool would panic if SetTheme reached the database, so an error here proves it never did.
func TestSetThemeRejectsUnknownWithoutDB(t *testing.T) {
	store := NewStore(nil)

	_, err := store.SetTheme(context.Background(), ThemeInput{Theme: "no-such-theme"})

	if err == nil {
		t.Fatal("SetTheme with unknown theme returned nil error")
	}
}

// Fails when a theme is added on one side only, so set_theme can never pick a design the frontend lacks.
// Order matters: the first key is the default on both sides.
func TestThemeCatalogMatchesFrontend(t *testing.T) {
	source, err := os.ReadFile(frontendThemeFile)
	if err != nil {
		t.Fatalf("read frontend theme keys: %v", err)
	}
	list := regexp.MustCompile(`THEME_KEYS = \[([^\]]*)\]`).FindSubmatch(source)
	if list == nil {
		t.Fatalf("THEME_KEYS array not found in %s", frontendThemeFile)
	}
	var frontend []string
	for _, match := range regexp.MustCompile(`"([^"]+)"`).FindAllSubmatch(list[1], -1) {
		frontend = append(frontend, string(match[1]))
	}
	var backend []string
	for _, theme := range themeCatalog {
		backend = append(backend, theme.Key)
	}

	if !slices.Equal(frontend, backend) {
		t.Fatalf("theme keys differ: frontend %v, backend %v", frontend, backend)
	}
}
