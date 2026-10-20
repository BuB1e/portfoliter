// Site designs this frontend can render. The owner picks one with the set_theme MCP tool and the
// API returns it as portfolio.theme ("" means the default, which is the first key).
//
// Keys and their order must match themeCatalog in portfoliter-go/internal/admin/theme_catalog.go;
// the Go test TestThemeCatalogMatchesFrontend reads this array and fails when they differ.
export const THEME_KEYS = ["dating", "field-guide", "parcel"] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];

const DEFAULT_THEME: ThemeKey = THEME_KEYS[0];

function isThemeKey(value: string): value is ThemeKey {
  return (THEME_KEYS as readonly string[]).includes(value);
}

// Unknown or missing keys fall back to the default so a bad value never breaks the page.
export function themeKey(value: string | null | undefined): ThemeKey {
  return value && isThemeKey(value) ? value : DEFAULT_THEME;
}
