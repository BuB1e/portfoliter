# portfoliter-rr-v8

The frontend: a React Router v8 app with server-side rendering. It ships eleven designs (a neutral
`plain` page plus ten themed ones) that all render the same data; the owner picks one with the
`set_theme` MCP tool. Start with the [root README](../README.md) for setup.

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
| `app/routes/home.tsx` | `loader` fetches the portfolio on the server; renders the active design's page |
| `app/routes/project.tsx` | `/projects/:slug`: `loader` fetches the portfolio and the project in parallel; unknown or draft slugs render the design's not-found page with status 404 |
| `app/lib/api.server.ts` | `fetchPortfolio()` (`GET /v1/portfolio`) and `fetchProject()` (`GET /v1/projects/:slug`) with the read key; `null` on 404 |
| `app/lib/portfolio.ts` | `PortfolioView` and its row types, mirroring the backend view ([docs/portfolio-view.md](../docs/portfolio-view.md)) |
| `app/lib/theme.ts` | `THEME_KEYS`, the designs this frontend can render; the first (`plain`) is the default |
| `app/themes/registry.ts` | each key's home page, project page and page title |
| `app/root.tsx` | HTML shell, `<html data-theme>` during SSR, error boundary |
| `app/app.css` | Tailwind CSS v4 entry; tokens per design, prefixed (`fg-*`, `parcel-*`, `ss-*`, `sky-*`, `st-*`, `rc-*`, `bs-*`, `ql-*`, `rd-*`) |

Rules that keep it working:

- Fetch only in the `loader`. The `.server.ts` suffix keeps the read key out of the browser bundle.
- `API_BASE_URL` and `API_READ_KEY` have no `VITE_` prefix on purpose, so they never reach the client.
- Only published items are returned. Drafts never reach the frontend.
- File URLs (`avatarUrl`, `coverUrl`, `resumeUrl`) are presigned and expire; do not cache pages longer
  than `R2_GET_URL_TTL` on the backend.
- Format dates through `app/lib/format.ts`, never `toLocaleDateString`, so the server and the browser
  render the same text and hydration does not fail.

## The shared field layer

The backend decides grouping, linking and empty values once; designs are thin renderers. Every design
reads data through these helpers, so a field added here reaches every design and none can silently
drop one:

| File | What it gives a design |
|---|---|
| `app/lib/fields.ts` | `experienceLine()` (role, company, employment type, location, dates, description, skills, plus a ready `meta` line), `educationLine()` (qualification, institution, dates, description), `certificationLine()` (date and link are `null` when unset: render nothing), `linkedLine()` / `linkedName()` (a project's job or school with its dates, from the embedded row), `customSections()` (every free-form section with entries, minus the keys a design renders itself) |
| `app/lib/labels.ts` | the one source of shared wording: `LABELS.otherSkills` ("Other"), `LABELS.featured`, `LABELS.present`, `employmentTypeLabel()`, `skillGroupLabel()` |
| `app/lib/projects.ts` | `groupProjects()` (Work, Personal, University; empty groups dropped), `projectPath()`, `projectGroupId()`, `projectGroupHref()`, `shortDescription()` for cards |
| `app/lib/sections.ts` | `getPrompts()` and `getAwards()` for designs that give those two keys a look of their own |
| `app/lib/format.ts` | `formatMonth()`, `formatRange()`, `platformName()`, `firstName()`, `initials()` |
| `app/components/shared/Avatar.tsx` | the profile photo, or initials when there is none |
| `app/components/shared/Cover.tsx` | a project cover with alt text, or the design's fallback |
| `app/components/shared/SectionEntries.tsx` | the generic renderer for any section's entries, styled through `classNames` |
| `app/components/Markdown.tsx` | safe markdown for project `content` (raw HTML dropped, unsafe URLs stripped) |

Designs still own their look and their own wording (headings, jokes, the featured marker's name).

## Designs

`routes/home.tsx` renders `themePages[themeKey(portfolio.theme)]` and `routes/project.tsx` renders
`themeProjectPages[...]`, both from `app/themes/registry.ts`; `root.tsx` sets `<html data-theme>` during
SSR so each design's page colours apply before hydration.

| Key | Pages | Components | Featured marker |
|---|---|---|---|
| `plain` (default) | `app/themes/plain/` | `app/components/ProjectCard.tsx`, `ProjectGroups.tsx` | Featured |
| `dating` | `app/themes/dating/` | `app/components/dating/` | Featured |
| `field-guide` | `app/themes/field-guide/` | `app/components/field-guide/` | Rare find |
| `parcel` | `app/themes/parcel/` | `app/components/parcel/` | Priority |
| `spec-sheet` | `app/themes/spec-sheet/` | `app/components/spec-sheet/` | Selected work |
| `skytrain` | `app/themes/skytrain/` | `app/components/skytrain/` | Express service |
| `status-page` | `app/themes/status-page/` | `app/components/status-page/` | Key service |
| `receipt` | `app/themes/receipt/` | `app/components/receipt/` | Staff pick |
| `broadsheet` | `app/themes/broadsheet/` | `app/components/broadsheet/` | Editor's pick |
| `quest-log` | `app/themes/quest-log/` | `app/components/quest-log/` | Epic quest |
| `retro-desktop` | `app/themes/retro-desktop/` | `app/components/retro-desktop/` | Pinned |

Each page loads its own Google Fonts with `<link precedence>`. Newer designs list a Thai fallback font
after their Latin face, so Thai text never drops to a system font. The retro desktop's windows are page
sections styled as windows, not draggable. The status page's uptime bars are decorative and generated
from each skill name, so the server and the browser render the same bars.

## Tests

`npm test` runs Vitest:

- `app/themes/fields.test.tsx` is the **coverage contract**. It renders every design's home and project
  page with a complete fictional profile (`app/test-utils/sampleView.ts`: every employment type,
  uncategorized skills, a certification with no date, education with no start date, projects with no
  cover or content, custom sections with unknown keys) and fails if any published field is missing, or
  if an empty value renders as `undefined`, `null`, `NaN` or a broken image or link.
- `app/themes/themes.test.tsx`: every design's three project sections, card links, clamped short
  descriptions, project page and not-found page.
- `app/lib/*.test.ts`: the field layer, labels, project grouping and theme fallback;
  `app/routes/project.test.ts`: the project loader's 404.

## Adding a design

1. Pick a key and build `app/themes/<key>/<Name>Page.tsx` and `<Name>ProjectPage.tsx`
   (`ThemePageProps` / `ThemeProjectPageProps` from `app/themes/types.ts`), with components under
   `app/components/<key>/`. `app/themes/plain/` is the smallest complete example.
2. Render only from `PortfolioView`, through the shared field layer above: `experienceLine()` for jobs,
   `educationLine()`, `certificationLine()`, `linkedLine()` for a project's job or school,
   `portfolio.skillGroups` with `skillGroupLabel()`, and `customSections()` for every free-form
   section. Do not look rows up by id or regroup data yourself.
3. Handle the empty states: `portfolio` is `null` until a profile exists; `project` is `null` on the
   project page for unknown or draft slugs.
4. Register the pages and a page title in `app/themes/registry.ts`, add the key to `THEME_KEYS` in
   `app/lib/theme.ts` and to `themeCatalog` in `portfoliter-go/internal/admin/theme_catalog.go`, in the
   same order (`go test ./...` checks they match).
5. Add the design's featured marker to `FEATURED_LABELS` in `app/themes/fields.test.tsx` (typecheck
   fails until you do), then run `npm test`. The design is done when the coverage contract passes.
6. Add page colours under `[data-theme="<key>"]` in `app/app.css`, with prefixed tokens.

## Deploy

`Dockerfile` builds and serves the app on port 3000. See the root README for the Compose setup.
