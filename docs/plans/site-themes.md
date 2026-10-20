# Plan: switch the whole site design via MCP

Goal: the owner says "switch my site to parcel" in Claude, an MCP tool saves the choice,
and the next page load renders a completely different design (layout, fonts, colors, components).
Three designs: `dating` (live today), `field-guide` and `parcel` (static mockups in `designs/`, ported to React).

## Decisions

- **Storage**: new single-row table `portfoliter.site_settings` (same `id = 1` pattern as `profile`).
  A theme is a React component set, so the list of themes lives in code, not in a table.
  Go validates the key against a fixed list; the frontend falls back to `dating` for anything unknown.
- **API**: `GET /v1/portfolio` gains a top-level `"theme": "dating"`. One request still renders the page.
- **MCP**: new `set_theme` tool (change is live immediately, logged in `change_log`);
  `get_portfolio` also returns `site_settings`.
- **Frontend**: `home.tsx` keeps the loader and picks the page component from a registry.
  `<html data-theme="...">` is set during SSR, so there is no flash of the wrong design.
  Each design loads its own Google Fonts via React 19 `<link precedence>` (hoisted into `<head>`).

### Added during implementation

- `list_themes` MCP tool: every theme (key, name, description) with `isActive`.
- Sync (option 1): Go `themeCatalog` in `internal/admin/theme_catalog.go` + frontend `THEME_KEYS`;
  `TestThemeCatalogMatchesFrontend` fails when they differ in content or order. `get_portfolio` also returns `siteSettings`.
- Branch split: `develop` ships the theme API with an empty catalog and the placeholder frontend;
  `feature/harit-som` adds the three designs on top. The stored theme defaults to `''`, meaning the
  first catalog key, so the migration is the same on both branches (the SQL below shows the first draft).

## Phase 1 - Migration

`portfoliter-go/internal/migrations/00003_site_settings.sql`

```sql
-- +goose Up
-- site-wide settings, single row like profile
CREATE TABLE portfoliter.site_settings (
    id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    theme      TEXT NOT NULL DEFAULT 'dating',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO portfoliter.site_settings (id) VALUES (1);

-- +goose Down
DROP TABLE portfoliter.site_settings;
```

No index needed (single row, PK lookup).

## Phase 2 - Go backend

`internal/portfolio/model.go`
- `Portfolio` gains `Theme string \`json:"theme"\``.

`internal/portfolio/store.go`
- `themeQuery = SELECT COALESCE((SELECT theme FROM portfoliter.site_settings WHERE id = 1), 'dating')`
- queued in the existing `GetPublished` batch (still one round trip), scanned into `p.Theme`.

`internal/admin/inputs.go`
- `type ThemeInput struct { Theme string \`json:"theme" jsonschema:"one of: dating, field-guide, parcel"\` }`

`internal/admin/writes.go`
- `var themes = map[string]bool{"dating": true, "field-guide": true, "parcel": true}`
- `func (s *Store) SetTheme(ctx context.Context, in ThemeInput) (int64, error)`
  - unknown key -> error listing valid keys (no DB call)
  - `s.mutate(ctx, "site_settings", "site_settings", 1, actionUpsert, ...)` running
    `INSERT ... (id, theme) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET theme = EXCLUDED.theme, updated_at = now() RETURNING id`
  - change_log gets before/after automatically through `mutate`.

`internal/admin/reads.go`
- `GetAll` adds `'siteSettings', (SELECT to_jsonb(t) FROM portfoliter.site_settings t)`.

`internal/mcpserver/server.go`
- `addSave(s, "set_theme", "Switch the whole site design (dating, field-guide, parcel). Live on the next page load. Confirm with the owner first.", store.SetTheme)`
- instructions: add one line about `set_theme`.

## Phase 3 - Frontend wiring (dating keeps working, nothing visual changes)

`app/lib/portfolio.ts`
- `export type ThemeKey = "dating" | "field-guide" | "parcel";`
- `Portfolio.theme: string` (raw from API; normalized below).

`app/themes/registry.ts`
- `export interface ThemePageProps { portfolio: Portfolio | null }` (null = "no profile yet" state, each design styles it)
- `export const themePages: Record<ThemeKey, ComponentType<ThemePageProps>>`
- `export function themeKey(value: string | undefined): ThemeKey` (unknown -> `"dating"`)

`app/themes/dating/DatingPage.tsx`
- current `home.tsx` body + `TopBar` moved here unchanged; renders its Bricolage Grotesque `<link>`.

`app/routes/home.tsx`
- loader unchanged; component: `const Page = themePages[themeKey(portfolio?.theme)]; return <Page portfolio={portfolio} />`.
- `meta` title per theme stays generic ("<name> - portfolio") or per-theme via a `title` in the registry.

`app/root.tsx`
- `Layout` reads `useRouteLoaderData<typeof homeLoader>("routes/home")` and renders `<html data-theme={key}>`.
- remove the global Bricolage `<link>` (moved into DatingPage).

`app/app.css`
- `@theme` gains prefixed tokens for the new designs (`--color-fg-*`, `--color-parcel-*`, fonts `--font-fg-serif`, `--font-parcel-stencil`, ...) so names never clash (`ink` exists in both dating and parcel).
- `html, body` background/color/color-scheme moved under `[data-theme="dating"]`, `[data-theme="field-guide"]`, `[data-theme="parcel"]`.

## Phase 4 - Port field-guide (frontend-design skill)

`app/components/field-guide/`: `GuideBar`, `SpecimenPlate` (profile), `SpecimenGrid` + `SpecimenCard` (projects, filter all/domesticated/wild),
`MigrationRecord` (experiences), `Diet` (skills by category), `BandingRecords` (education + certifications), `Sightings` (awards), `ReportSighting` (footer/contact).
`app/themes/field-guide/FieldGuidePage.tsx` composes them.
Shared hook `app/hooks/useProjectFilter.ts` (`filter`, `setFilter`, `visible`) - PERSONAL/WORK filter used by field-guide and parcel.

## Phase 5 - Port parcel (frontend-design skill)

`app/components/parcel/`: `Tape` (marquee), `ShippingLabel` (profile), `BubbleWrap` (+ `app/hooks/useBubbleWrap.ts`, pop count),
`PackingList` + `Box` (projects, filter), `TrackingHistory` (experiences), `ContentsChecklist` (skills), `CustomsDeclaration` (education + certs),
`Stickers` (awards), `ReturnToSender` (footer).
`app/themes/parcel/ParcelPage.tsx` composes them.
Tracking number year comes from data (latest experience start) instead of `new Date()` to avoid hydration mismatch.

Copy, markup and visuals follow the mockups in `designs/`; existing `lib/format.ts`, `lib/sections.ts`, `lib/experience.ts` helpers are reused.

## Phase 6 - Verify and docs

- `go vet ./...`, `go build ./...`, `npm run typecheck`, `npm run build`
- run locally (docker compose), call `set_theme` for each key via MCP, screenshot each design at 390px and 1280px
- `list_changes` shows the theme change with before/after
- update `portfoliter-go/README.md` (new tool + table) and `portfoliter-rr-v8/README.md` (how to add a theme)

## Test plan (needs your approval)

The repo has no tests yet. Proposed, kept small for a personal project:

1. Go unit test `internal/admin/theme_test.go`: `SetTheme` with an unknown key returns an error and never touches the DB
   (validation split into `validateTheme(key string) error`, table-driven: 3 valid keys, empty, `"Dating"`, `"neon"`).
2. Frontend: unit test for `themeKey()` (known keys pass through; `undefined`, `""`, `"neon"` -> `dating`) - adds Vitest as a dev dependency.
3. Manual/E2E check with the Playwright MCP: each of the 3 designs renders with real data, project filter works,
   bubble wrap pops, no console/hydration errors, no horizontal scroll at 390px.

Not included: testcontainers integration tests (no DB test infra exists yet; could be a separate task).

## Out of scope

- Per-theme color customization through MCP.
- Light/dark toggle for visitors.
- Committing `designs/` mockups (stay as reference, untracked).
