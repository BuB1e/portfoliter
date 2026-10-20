# portfoliter-go

Read API and MCP server for the portfolio. All tables live in the `portfoliter` schema (see `internal/migrations/`).
Start with the [root README](../README.md) for setup.

## Run

```sh
cp .env.example .env.local    # fill in values
set -a && . ./.env.local && set +a
go run ./cmd/server           # creates schema + applies migrations, then serves on APP_PORT
go test ./...
```

## Endpoints

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/healthz` | none | `{"status":"ok"}` |
| GET | `/v1/portfolio` | `X-API-Key` header | `theme` + profile + every published section; 404 until the profile row exists |

The backend stores only `API_READ_KEY_SHA256`. The frontend sends the raw key; the server hashes it and compares in constant time.

## Data model

- `profile` is a single row (`id = 1`). Links and skills are always shown.
- experiences, projects, education, certifications, sections show only rows with `is_published = true`.
- `projects.project_type` is `PERSONAL` or `WORK`; only `WORK` projects may set `experience_id`.
- `change_log` records before/after of every MCP write (used once the MCP exists).
- `site_settings` is a single row (`id = 1`); `theme` picks which frontend design renders (`''` means the default, the first catalog entry).

## MCP (AI write path)

`/mcp` is a stateless streamable-HTTP MCP endpoint guarded by `Authorization: Bearer <write key>`; the backend stores only `API_WRITE_KEY_SHA256`.

```sh
claude mcp add --transport http portfoliter http://localhost:8080/mcp \
  --header "Authorization: Bearer <write key>"
```

| | Create / update | Read | Delete |
|---|---|---|---|
| profile | `set_profile` | `get_portfolio` | `delete_profile` |
| link, experience, project, skill, education, certification, section | `upsert_*` | `get_portfolio`, `get_item` | `delete_item` |
| visibility / order | `set_published`, `reorder` | | |
| site design | `set_theme` | `list_themes` | |
| files (R2) | `create_upload_url` + `finalize_upload` | `list_files`, `get_file_url` | `delete_file` |
| change_log | written by every write | `list_changes` | none (audit trail) |

- Upserts replace the whole row; omit `id` to create, pass `id` to update.
- New experiences/projects/education/certifications/sections are drafts until `set_published`.
- Editing an already-published row changes the live site immediately (no per-row draft copy).
- Every write is recorded in `change_log` with before/after snapshots in the same transaction.

### Themes

The theme catalog (key, name, description) lives in `internal/admin/theme_catalog.go` and is empty on
`develop`, so `list_themes` returns `[]` and `set_theme` refuses every value until a design exists.
The keys must match `THEME_KEYS` in `portfoliter-rr-v8/app/lib/theme.ts` in the same order (the first
is the default); `TestThemeCatalogMatchesFrontend` reads that file and fails when they differ.
To add a theme: build its page in the frontend, add the key to both lists, run `go test ./...`.
Both apps deploy from the same commit, so the lists ship together.

## Files (Cloudflare R2)

Avatar, project covers and resume live in a private R2 bucket (`internal/storage`). The DB stores object keys (`avatar_key`, `resume_key`, `cover_key`); `GET /v1/portfolio` turns them into presigned download URLs (`R2_GET_URL_TTL`, default 1h) returned as `avatarUrl`, `resumeUrl`, `coverUrl`.

Upload flow via MCP:
1. `create_upload_url {kind, contentType}` returns a staging `key` (`incoming/<kind>/...`) and `uploadUrl`. Kinds: `avatar`/`cover` (png, jpeg, webp, gif), `resume` (pdf), `file` (any of those).
2. `curl -X PUT -H "Content-Type: <contentType>" --data-binary @file "<uploadUrl>"`
3. `finalize_upload {key}` (`internal/uploads` + `internal/imageopt`): sniffs the real type, then for images applies EXIF rotation, strips all metadata and recompresses (JPEG q82 stays JPEG; PNG/WebP/GIF become PNG, GIF loses animation). PDFs are moved unchanged. Limits: 20 MB, 50 megapixels. Returns the final key and deletes the staging object.
4. Save the final key via `set_profile` (`avatarKey`, `resumeKey`) or `upsert_project` (`coverKey`).

Add an R2 lifecycle rule deleting `incoming/` objects after 1 day to clean up uploads that were never finalized.

`list_files` lists objects; `delete_file` refuses keys still referenced by the profile or a project.

## Add data manually

```sql
INSERT INTO portfoliter.profile (full_name, headline) VALUES ('Your Name', 'Backend Engineer');

INSERT INTO portfoliter.experiences (company, role, start_date, is_published)
VALUES ('Acme', 'Software Engineer', '2023-01-01', true);

INSERT INTO portfoliter.projects (slug, title, project_type, experience_id, is_published)
VALUES ('payments-api', 'Payments API', 'WORK', 1, true);
```
