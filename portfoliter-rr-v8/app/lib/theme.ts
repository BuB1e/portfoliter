// Site designs this frontend can render. The owner picks one with the set_theme MCP tool and the
// API returns it as portfolio.theme ("" means the default, which is the first key).
//
// Keys and their order must match themeCatalog in portfoliter-go/internal/admin/theme_catalog.go;
// the Go test TestThemeCatalogMatchesFrontend reads this array and fails when they differ.
// Empty until you build a design, for example: ["minimal"] as const.
export const THEME_KEYS = [] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];
