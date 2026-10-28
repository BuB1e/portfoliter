# portfoliter-rr-v8

The frontend: a React Router v8 app with server-side rendering. On `develop` it is a placeholder that
loads your portfolio and prints it as JSON, ready for you to replace with your own design.
Start with the [root README](../README.md) for setup.

## Run

```sh
cp .env.example .env.local      # API_BASE_URL and the raw API_READ_KEY
npm ci
set -a && . ./.env.local && set +a
npm run dev                     # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | dev server with hot reload |
| `npm run typecheck` | generate route types and run `tsc` |
| `npm test` | unit tests with Vitest (`vitest.config.ts`) |
| `npm run build` | production build into `build/` |
| `npm start` | serve the production build (`PORT`, default 3000) |

## How the page gets its data

| File | Role |
|---|---|
| `app/routes/home.tsx` | `loader` fetches the portfolio on the server; the component renders it |
| `app/lib/api.server.ts` | `fetchPortfolio()` calls `GET /v1/portfolio` with the read key; returns `null` on 404 (no profile yet) |
| `app/lib/portfolio.ts` | TypeScript types that mirror the API response |
| `app/routes/project.tsx` | `/projects/:slug`: `loader` fetches the portfolio and `fetchProject()` (`GET /v1/projects/:slug`) in parallel; unknown or draft slugs render "Project not found" with status 404 |
| `app/lib/projects.ts` | `groupProjects()` (Work, Personal, University; empty groups dropped), `projectPath()`, `shortDescription()` for cards |
| `app/components/ProjectCard.tsx`, `ProjectGroups.tsx` | the home page's project groups; each card is one `<Link>` to its project page |
| `app/components/Markdown.tsx` | safe markdown for project `content` (react-markdown, raw HTML dropped, unsafe URLs stripped) |
| `app/lib/theme.ts` | `THEME_KEYS`, the designs this frontend can render (empty on `develop`) |
| `app/root.tsx` | HTML shell, fonts, error boundary |
| `app/app.css` | Tailwind CSS v4 entry; put your colors and fonts in `@theme` |

Rules that keep it working:

- Fetch only in the `loader`. The `.server.ts` suffix keeps the read key out of the browser bundle.
- `API_BASE_URL` and `API_READ_KEY` have no `VITE_` prefix on purpose, so they never reach the client.
- Only published items are returned. Drafts never reach the frontend.
- File URLs (`avatarUrl`, `coverUrl`, `resumeUrl`) are presigned and expire; do not cache pages longer
  than `R2_GET_URL_TTL` on the backend.
- Format dates from the `YYYY-MM-DD` string yourself instead of `toLocaleDateString`, so the server and
  the browser render the same text and hydration does not fail.
- `sections[].items` is free-form JSON. Check each item's shape before rendering it.

## Build your design

1. Replace the JSON dump in `app/routes/home.tsx` with your layout. Split it into components under
   `app/components/`.
2. Update `meta()` for the page title and description.
3. Add your fonts in `links` in `app/root.tsx` and your tokens in `app/app.css`.
4. Handle the empty state: `portfolio` is `null` until a profile exists.

## Several designs switchable from the AI

If you build more than one design and want Claude to switch between them with `set_theme`:

1. Add each design's key to `THEME_KEYS` in `app/lib/theme.ts`, e.g. `["minimal", "bold"] as const`.
   The first key is the default.
2. Add the same keys, in the same order, to `themeCatalog` in
   `portfoliter-go/internal/admin/theme_catalog.go`. `go test ./...` in `portfoliter-go` fails if the
   two lists differ.
3. In `home.tsx`, pick the page from `portfolio.theme`; use the first key when it is `""` or unknown.
   A map such as `Record<ThemeKey, ComponentType<{ portfolio: Portfolio | null }>>` keeps TypeScript
   checking that every key has a page.
4. Optional: set `<html data-theme={key}>` in `root.tsx` (read the home loader data with
   `useRouteLoaderData("routes/home")`) so each design can style `html` and `body` without a flash.

## Designs on this branch (`feature/harit-som`)

This branch replaces the placeholder with nine designs. `routes/home.tsx` renders
`themePages[themeKey(portfolio.theme)]` from `app/themes/registry.ts`, and `root.tsx` sets
`<html data-theme>` during SSR so each design's page colors in `app.css` apply before hydration.

| Key | Page | Components |
|---|---|---|
| `dating` (default) | `app/themes/dating/DatingPage.tsx` | `app/components/dating/` |
| `field-guide` | `app/themes/field-guide/FieldGuidePage.tsx` | `app/components/field-guide/` |
| `parcel` | `app/themes/parcel/ParcelPage.tsx` | `app/components/parcel/` |
| `spec-sheet` | `app/themes/spec-sheet/SpecSheetPage.tsx` | `app/components/spec-sheet/` |
| `skytrain` | `app/themes/skytrain/SkytrainPage.tsx` | `app/components/skytrain/` |
| `status-page` | `app/themes/status-page/StatusPage.tsx` | `app/components/status-page/` |
| `receipt` | `app/themes/receipt/ReceiptPage.tsx` | `app/components/receipt/` |
| `broadsheet` | `app/themes/broadsheet/BroadsheetPage.tsx` | `app/components/broadsheet/` |
| `quest-log` | `app/themes/quest-log/QuestLogPage.tsx` | `app/components/quest-log/` |

`routes/project.tsx` renders `themeProjectPages[themeKey(portfolio.theme)]` (`app/themes/<key>/*ProjectPage.tsx`)
for `/projects/:slug`, and `root.tsx` reads the theme from either route, so project pages keep the
active design. Each design groups projects with `groupProjects()` and links every card to its page.

Each page loads its own Google Fonts with `<link precedence>`; tokens are prefixed per design in
`app.css` (`fg-*`, `parcel-*`, `ss-*`, `sky-*`, `st-*`, `rc-*`, `bs-*`, `ql-*`). Newer designs list a Thai fallback
font after their Latin face, so Thai text never drops to a system font. The status page's uptime bars are
decorative and generated from each skill name, so the server and the browser render the same bars. `npm test` runs the Vitest checks: theme key fallback, project grouping, the project loader's 404,
and, for every design, the three sections, card links with clamped short descriptions, the project
page and its not-found state (`app/themes/themes.test.tsx`). `app/themes/fields.test.tsx` renders the
newer designs with live-shaped data (`app/test-utils/livePortfolio.ts`) and fails if any published
field is dropped: profile, links, every skill (uncategorized ones under "Other"), custom sections
(read through `app/lib/sectionItems.ts`), education, experience, certifications, and each project's
cover, dates, skills, featured marker and linked job or school.

## Deploy

`Dockerfile` builds and serves the app on port 3000. See the root README for the Compose setup.
