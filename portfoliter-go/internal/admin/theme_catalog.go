package admin

// themeCatalog lists the site designs set_theme accepts. The first entry is the default.
// Keys and their order must match THEME_KEYS in portfoliter-rr-v8/app/lib/theme.ts;
// TestThemeCatalogMatchesFrontend fails when they differ.
//
// Empty until you build a design, for example:
//
//	{Key: "minimal", Name: "Minimal", Description: "Single-column page with large type."},
var themeCatalog = []Theme{}
