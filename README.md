# Portfoliter

A personal portfolio website that you edit by talking to an AI. You never touch a CMS: you tell
Claude "add my new job" or "publish the payments project", and it writes to your portfolio through an
MCP server. Your own frontend reads the data and renders the site.

```
 Claude (or any MCP client)          Visitors
        |  MCP over HTTP                 |  HTTPS
        v                                v
 +------------------+  GET /v1/portfolio  +---------------------+
 |  portfoliter-go  | <------------------ |  portfoliter-rr-v8  |
 |  Go API + MCP    |   (read key)        |  React Router SSR   |
 +------------------+                     +---------------------+
    |            |
    v            v
 PostgreSQL   Cloudflare R2 (avatar, project covers, resume)
```

This branch (`feature/harit-som`) is the owner's deployment of the template. It differs from `develop`
only in the production host ports in `docker-compose.prod.yml` (backend `127.0.0.1:8082`, frontend
`127.0.0.1:3002`); the owner's data and live design are in the database. To build your own portfolio,
clone `develop`: it is the template, with every design, and everything below applies to it.

## Contents

1. [Use it for your own profile](#use-it-for-your-own-profile)
2. [Repository layout](#repository-layout)
3. [What you need](#what-you-need)
4. [Setup](#setup)
5. [Run it](#run-it)
6. [Connect the MCP to Claude](#connect-the-mcp-to-claude)
7. [Add your content](#add-your-content)
8. [The data every design renders](#the-data-every-design-renders)
9. [Themes: switch designs from the AI](#themes-switch-designs-from-the-ai)
10. [Deploy to production](#deploy-to-production)
11. [Tests](#tests)
12. [Troubleshooting](#troubleshooting)

## Use it for your own profile

Nothing in the code is about one person: your profile, projects and chosen design are rows in your
own database. Every design shows every field you publish, so you can switch designs at any time
without losing anything.

1. **Clone** the template branch:
   `git clone -b develop <repo url> portfoliter && cd portfoliter`
2. **Env**: create a read key and a write key and fill in `portfoliter-go/.env.local` and
   `portfoliter-rr-v8/.env.local` from the `.env.example` files ([Setup](#setup)). You need a
   PostgreSQL database and a private Cloudflare R2 bucket.
3. **Migrate and run**: `docker compose up --build`. The backend creates the `portfoliter` schema and
   applies every migration before it serves; if a migration fails it does not start. The site at
   <http://localhost:3000> says "No portfolio published yet" until you add a profile.
4. **Connect the MCP** to Claude with the write key ([Connect the MCP](#connect-the-mcp-to-claude)).
5. **Write your data through the MCP**, in plain language ([Add your content](#add-your-content)):
   profile, links, skills (with categories), jobs (with employment type, location and skills),
   education, certifications, projects (WORK linked to a job, UNIVERSITY linked to a school, PERSONAL)
   and any free-form sections (awards, talks, languages, anything). Ask Claude to publish the drafts.
6. **Pick a design**: ask "list my themes", then "switch my site to receipt". `set_theme` accepts any
   catalog key: `plain` (the default), `dating`, `field-guide`, `parcel`, `spec-sheet`, `skytrain`,
   `status-page`, `receipt`, `broadsheet`, `quest-log`, `retro-desktop`. The change is live on the next
   page load.
7. **Deploy** with `docker-compose.prod.yml` behind a TLS proxy ([Deploy](#deploy-to-production)).

To make a design of your own, follow "Adding a design" in [the frontend README](portfoliter-rr-v8/README.md#adding-a-design).

## Repository layout

| Path | What it is |
|---|---|
| `portfoliter-go/` | Go backend: read API, MCP server, migrations, R2 file storage. [README](portfoliter-go/README.md) |
| `portfoliter-rr-v8/` | React Router v8 frontend with server-side rendering and eleven designs. [README](portfoliter-rr-v8/README.md) |
| `docker-compose.yml` | Local: runs backend on `:8080` and frontend on `:3000` |
| `docker-compose.prod.yml` | Production: same two services bound to `127.0.0.1`, behind your reverse proxy |

## What you need

- **Docker** with Compose, or Go 1.27+ and Node 24+ to run without Docker.
- **PostgreSQL** 14+ that the backend can reach. It creates its own `portfoliter` schema, so a shared
  database is fine. For a local one:
  `docker run -d --name portfoliter-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:17`
- **Cloudflare R2** bucket (private) for the avatar, project covers and resume PDF. Create an API token
  under R2 > Manage API tokens with Object Read & Write, scoped to the bucket.
- **An MCP client** such as Claude Code or Claude Desktop, to edit content.

## Setup

### 1. Create two keys

The frontend uses a **read key** to call the API. MCP clients use a separate **write key**.
The backend stores only the SHA-256 of each key, never the key itself.

```sh
READ_KEY=$(openssl rand -hex 32);  echo "read key:  $READ_KEY"
printf %s "$READ_KEY"  | shasum -a 256   # -> API_READ_KEY_SHA256

WRITE_KEY=$(openssl rand -hex 32); echo "write key: $WRITE_KEY"
printf %s "$WRITE_KEY" | shasum -a 256   # -> API_WRITE_KEY_SHA256
```

Keep the raw keys somewhere safe (a password manager). You need the raw read key for the frontend and
the raw write key for your MCP client.

### 2. Fill in the env files

```sh
cp portfoliter-go/.env.example    portfoliter-go/.env.local
cp portfoliter-rr-v8/.env.example portfoliter-rr-v8/.env.local
```

`portfoliter-go/.env.local`:

| Key | Value |
|---|---|
| `APP_PORT` | `8080` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | your PostgreSQL connection |
| `DB_SSLMODE` | `require` for a hosted database, `disable` for a local one |
| `API_READ_KEY_SHA256` | hash of the read key from step 1 |
| `API_WRITE_KEY_SHA256` | hash of the write key from step 1 |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | your R2 bucket and token |
| `R2_GET_URL_TTL`, `R2_PUT_URL_TTL` | optional, how long file links stay valid (default `1h` / `15m`) |

`portfoliter-rr-v8/.env.local`:

| Key | Value |
|---|---|
| `API_BASE_URL` | `http://localhost:8080` (Compose overrides this to `http://backend:8080`) |
| `API_READ_KEY` | the raw read key from step 1 |

`.env.local` and `.env.prod` are git-ignored. Only the `.env.example` templates are committed.

## Run it

```sh
docker compose up --build
```

- Backend: <http://localhost:8080/healthz> returns `{"status":"ok"}`.
- Frontend: <http://localhost:3000> shows "No portfolio published yet" until you add a profile.

On every start the backend creates the `portfoliter` schema if needed and applies pending migrations
before it serves requests. If the migrations fail, it does not start.

Without Docker:

```sh
cd portfoliter-go    && set -a && . ./.env.local && set +a && go run ./cmd/server
cd portfoliter-rr-v8 && npm ci && set -a && . ./.env.local && set +a && npm run dev   # serves on :5173
```

## Connect the MCP to Claude

The MCP endpoint is `/mcp` on the backend and needs the raw write key as a bearer token.

Claude Code:

```sh
claude mcp add --transport http portfoliter http://localhost:8080/mcp \
  --header "Authorization: Bearer <write key>"
```

For production, use your public URL instead, for example `https://portfolio.example.com/mcp`.
Any MCP client that supports streamable HTTP with a custom header works the same way.

Check it works by asking Claude: "Show me my portfolio." It should call `get_portfolio`.

## Add your content

Talk to Claude in plain language. Examples:

- "Create my profile: name Jane Doe, headline Backend engineer, location Bangkok, email jane@example.com."
- "Add a link to my GitHub, https://github.com/janedoe."
- "Add my job at Acme as Software Engineer from March 2023, still there. Skills Go, PostgreSQL."
- "Add a personal project called Mango Index with this summary: ... Then publish it."
- "Add my final-year project Tidewatch as a university project under my Porto Polytechnic degree."
- "Upload ~/Pictures/me.jpg as my avatar."
- "What did you change today?"

How the data behaves:

- **Profile, links and skills** are visible as soon as they are saved.
- **Experiences, projects, education, certifications and sections** are created as drafts. They appear
  on the site only after you confirm and Claude calls `set_published`.
- **Upserts replace the whole row.** Claude reads the current row first and sends every field back.
- **Every change is logged** in `change_log` with a before and after copy. Ask "what changed?" to see
  recent edits (`list_changes`), and ask Claude to put a value back if something went wrong.
- **Files** go to R2 through a presigned upload. The backend strips photo metadata (location, camera)
  and recompresses images before they are used.
- **Projects** have a type: `WORK` (may link the job it was built at), `PERSONAL` or `UNIVERSITY`
  (may link the education entry it belongs to). The site groups them in that order. A project's
  `summary` is the short description on its card (plain text, at most 200 characters for new text);
  `content` is markdown shown on its own page at `/projects/<slug>`.
- **Free-form sections** (awards, talks, anything else) are stored as a list of JSON items, so your
  frontend decides what each section looks like.

All MCP tools:

| Area | Tools |
|---|---|
| Read | `get_portfolio`, `get_item`, `list_changes`, `list_themes` |
| Profile | `set_profile`, `delete_profile` |
| Content | `upsert_link`, `upsert_experience`, `upsert_project`, `upsert_skill`, `upsert_education`, `upsert_certification`, `upsert_section` |
| Visibility and order | `set_published`, `reorder`, `delete_item` |
| Site design | `set_theme` |
| Files | `create_upload_url`, `finalize_upload`, `list_files`, `get_file_url`, `delete_file` |

You can also insert rows with SQL; see [the backend README](portfoliter-go/README.md#add-data-manually).

## The data every design renders

The backend serves one normalized view, documented in [docs/portfolio-view.md](docs/portfolio-view.md):

- `GET /v1/portfolio` (read key): only published rows; optional fields are `null` when unset; each
  project embeds the published job or school it belongs to; skills come both as a flat list and as
  `skillGroups` (uncategorized ones last under key `"other"`); every free-form section carries
  `entries`, its items read into `{title, detail, url}`; every list has a stable order.
- `GET /v1/projects/<slug>` (read key): one entry of that `projects` list, same shape; `404` for drafts
  and unknown slugs.

The frontend fetches both in route loaders on the server (`app/lib/api.server.ts`), so the read key
never reaches the browser, types them as `PortfolioView` (`app/lib/portfolio.ts`), and every design
reads them through one shared field layer. See [the frontend README](portfoliter-rr-v8/README.md).

## Themes: switch designs from the AI

The template ships eleven designs and lets the AI switch between them ("switch my site to parcel").
`plain` is the default while no theme is set.

| Key | Look | Page |
|---|---|---|
| `plain` (default) | Neutral single-column page in the system font, light or dark with the OS | `app/themes/plain/PlainPage.tsx` |
| `dating` | Dark dating-app profile; projects are a swipeable card deck | `app/themes/dating/DatingPage.tsx` |
| `field-guide` | Naturalist field guide; projects are pinned specimens | `app/themes/field-guide/FieldGuidePage.tsx` |
| `parcel` | Kraft shipping box with a label, bubble wrap and stickers | `app/themes/parcel/ParcelPage.tsx` |
| `spec-sheet` | Serious and minimal: white page, one sans-serif, label-and-content rows | `app/themes/spec-sheet/SpecSheetPage.tsx` |
| `skytrain` | Bangkok BTS line map; jobs are stations, projects are interchanges | `app/themes/skytrain/SkytrainPage.tsx` |
| `status-page` | Uptime status page; skills are components, past jobs are resolved incidents | `app/themes/status-page/StatusPage.tsx` |
| `receipt` | Thermal mini-mart receipt in monospace; jobs are purchases, projects are line items | `app/themes/receipt/ReceiptPage.tsx` |
| `broadsheet` | Newspaper front page, "The Daily <first name>"; projects are articles, skills are classifieds | `app/themes/broadsheet/BroadsheetPage.tsx` |
| `quest-log` | RPG character sheet in blue pixel menu windows; skills are stats, jobs are quests | `app/themes/quest-log/QuestLogPage.tsx` |
| `retro-desktop` | 1990s desktop: teal background, bevelled grey windows, a taskbar; projects are files | `app/themes/retro-desktop/RetroDesktopPage.tsx` |

Every design shows projects in three sections (Work, Personal, University; empty ones are hidden),
and every card links to `/projects/<slug>`, which renders in the same design:

| Key | Project sections | Project page |
|---|---|---|
| `plain` | Work, Personal and University project cards | Title, dates, cover, markdown and a fact list |
| `dating` | Serious relationships, Weekend flings, College sweethearts (one swipe deck each; tap opens, drag swipes) | The project's dating profile: photo card, pitch, "The long version", interests, where we met |
| `field-guide` | Domesticated, Wild and Lab specimens | A species account: plate, identification marks, field notes |
| `parcel` | Packed at work, at home, on campus | A shipping label for the project, its packing slip and a photo of the contents |
| `spec-sheet` | Work, Personal and University project rows | A spec sheet: one labelled row per fact |
| `skytrain` | Sukhumvit line (work), Gold line (personal), Blue line (university) | A station in its line's colour: platform information, timetable, connecting line, exits |
| `status-page` | Production, Side and Campus services | The service's status entry: banner, components, update log |
| `receipt` | Made at work, Homemade, School supplies (line items with a staff-pick tag) | An item receipt: item lines, "printed on the back" detail, ingredients, barcode; a VOID slip for 404 |
| `broadsheet` | Business, Weekend and Campus sections (ruled columns of stories, an editor's-pick kicker) | The full article: headline, standfirst, byline, photo, two-column text and a fact box; a correction notice for 404 |
| `quest-log` | Main, Side and Academy quests (quest cards with giver, status and rewards; "Epic quest" when featured) | A parchment quest scroll: giver, status, map, objectives, rewards, wax seal; a blank-scroll window for 404 |
| `retro-desktop` | Work, Personal and University project folders (file tiles, "Pinned" when featured), plus desktop shortcuts and a taskbar | The file opened in its own window: toolbar, address field, document, properties and status bar; the close box links back to the folder; a "File not found" error dialog for 404 |

How it works:

- The active design is stored in the `portfoliter.site_settings` table and returned as `theme`.
- The list of designs exists in two places that must match, in the same order:
  - backend: `themeCatalog` in `portfoliter-go/internal/admin/theme_catalog.go` (key, name, description)
  - frontend: `THEME_KEYS` in `portfoliter-rr-v8/app/lib/theme.ts`
- The Go test `TestThemeCatalogMatchesFrontend` reads the frontend file and fails if the lists differ,
  so `set_theme` can never pick a design the frontend cannot render.
- The **first** key is the default, used while `theme` is `""` or unknown.

To add a design:

1. Build its home and project pages under `portfoliter-rr-v8/app/themes/<key>/` on the shared field
   layer and register them in `app/themes/registry.ts` (checklist: "Adding a design" in the
   [frontend README](portfoliter-rr-v8/README.md#adding-a-design)).
2. Add the key to `THEME_KEYS`.
3. Add `{Key: "minimal", Name: "Minimal", Description: "..."}` to `themeCatalog`.
4. Run `cd portfoliter-go && go test ./...` and `cd portfoliter-rr-v8 && npm test`; the coverage
   contract (`app/themes/fields.test.tsx`) fails until the design shows every published field.
5. Deploy both apps together, then ask Claude to list and switch themes.

## Deploy to production

1. Create `portfoliter-go/.env.prod` and `portfoliter-rr-v8/.env.prod` (same keys as `.env.local`;
   point `DB_*` at your production database, use `DB_SSLMODE=require`).
2. On the server:
   ```sh
   docker compose -f docker-compose.prod.yml up -d --build
   ```
   Both services bind to `127.0.0.1` only (`:3000` frontend, `:8080` backend; on this branch
   `:3002` and `:8082`).
3. Put a TLS reverse proxy in front. Example Caddyfile:
   ```
   portfolio.example.com {
       handle /mcp* {
           reverse_proxy 127.0.0.1:8080
       }
       reverse_proxy 127.0.0.1:3000
   }
   ```
   Do not expose `/v1/portfolio` publicly; only the frontend server needs it.
4. In R2, add a lifecycle rule that deletes `incoming/` objects after 1 day (uploads never finalized).
5. Point your MCP client at `https://portfolio.example.com/mcp`.

Migrations run automatically when the backend starts. To update: `git pull`, then run the
`docker compose ... up -d --build` command again.

## Tests

```sh
cd portfoliter-go    && go vet ./... && go test ./...
cd portfoliter-rr-v8 && npm run typecheck && npm test && npm run build
```

Database tests (migrations, the API and MCP writes) start a throwaway `postgres:17-alpine` with
testcontainers, so Docker must be running; they are skipped when it is not. They never read the
`DB_*` env vars, so they cannot touch your real database. The API's full response is pinned by a
golden file built from a fictional profile (`portfoliter-go/internal/httpapi/testdata/`). The frontend's
coverage contract renders every design with a complete fictional profile and fails if any published
field is missing.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Frontend shows "No portfolio published yet" | No profile row yet. Ask Claude to create your profile. |
| Frontend error `portfolio api responded 401` | `API_READ_KEY` does not hash to `API_READ_KEY_SHA256`. Recompute the hash. |
| MCP client gets `401 unauthorized` | Wrong write key in the `Authorization: Bearer` header. |
| New item not on the site | It is a draft. Ask Claude to publish it. |
| `set_theme` says "unknown theme" | Use a key from `list_themes`; it must also be in `THEME_KEYS` (see Themes). |
| `TestThemeCatalogMatchesFrontend` fails | The backend and frontend theme lists differ in content or order. |
| Backend exits on start | Missing env key, unreachable database, or a failed migration. Check `docker compose logs backend`. |
| Images or resume links stop working | Presigned links expire (`R2_GET_URL_TTL`). Reloading the page creates new ones. |
