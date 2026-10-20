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
| `npm run build` | production build into `build/` |
| `npm start` | serve the production build (`PORT`, default 3000) |

## How the page gets its data

| File | Role |
|---|---|
| `app/routes/home.tsx` | `loader` fetches the portfolio on the server; the component renders it |
| `app/lib/api.server.ts` | `fetchPortfolio()` calls `GET /v1/portfolio` with the read key; returns `null` on 404 (no profile yet) |
| `app/lib/portfolio.ts` | TypeScript types that mirror the API response |
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

## Deploy

`Dockerfile` builds and serves the app on port 3000. See the root README for the Compose setup.
