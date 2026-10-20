# Plan: owner-only OAuth sign-in for the MCP (Claude web connectors)

Goal: connect `https://portfolio.haritsom.com/mcp` as a custom connector in Claude on the web
(free plan, no "Request headers" option) while keeping the MCP private.
Claude opens a sign-in page on the portfolio domain; only the owner can pass it.
Claude Code keeps working with the existing static Bearer key.

## Decisions

- **Connector settings in Claude**: Authentication = "Sign in now",
  OAuth client = "Use Claude's published identity" (CIMD). No client ID or secret to type.
- **Owner secret**: the sign-in page asks for the existing MCP write key
  (checked against `API_WRITE_KEY_SHA256`, constant-time). No new password to manage.
- **Client check (CIMD)**: `client_id` is an HTTPS URL. The server fetches it
  (HTTPS only, 5 s timeout, 64 KB cap, no redirects), requires its `client_id` field to equal the URL,
  and requires `redirect_uri` to be listed in its `redirect_uris`.
  Only hosts in `OAUTH_ALLOWED_CLIENT_HOSTS` (default `claude.ai,claude.com`) are accepted,
  so no other app can even reach the sign-in page.
- **PKCE S256 required**; the `resource` parameter must equal `<PUBLIC_BASE_URL>/mcp`.
- **Tokens**: opaque random 32-byte values, only their SHA-256 stored in Postgres.
  Access token 1 h. Refresh token 30 days, rotated on every use (old one revoked).
  Authorization codes: in memory, 60 s, single use (one backend instance, so no table needed).
- **Revocation**: new MCP tool `revoke_oauth_sessions` deletes all OAuth tokens.
  Rotating the write key does not revoke OAuth tokens (they are separate), so the tool is the off switch.
- **Brute force**: 5 failed sign-ins per client IP (`X-Real-IP` from nginx) per 15 min, then 429 until the window ends.
- **No dynamic client registration (DCR)**: not needed with CIMD. Fewer endpoints, nothing to clean up.
- **Library**: the MCP Go SDK's `auth.RequireBearerToken` (adds the `WWW-Authenticate: Bearer resource_metadata=...`
  header Claude needs to discover sign-in) and `auth.ProtectedResourceMetadataHandler`.
  The authorization server (`/oauth/*`) is written in this repo: about 300 lines, standard library only.

## Phase 1 - Migration

`portfoliter-go/internal/migrations/00004_oauth_tokens.sql`

```sql
-- +goose Up
CREATE TABLE portfoliter.oauth_tokens (
    token_hash  BYTEA PRIMARY KEY,           -- SHA-256 of the token
    kind        TEXT NOT NULL CHECK (kind IN ('access', 'refresh')),
    client_id   TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE portfoliter.oauth_tokens;
```

No index besides the primary key: every lookup is by `token_hash`. Expired rows are deleted on each token issue.

## Phase 2 - Config

`internal/config/config.go`, plus `.env.example`, `.env.local`, `.env.prod`:

| Key | Example | Required |
|---|---|---|
| `PUBLIC_BASE_URL` | `https://portfolio.haritsom.com` (local `http://localhost:8080`) | yes |
| `OAUTH_ALLOWED_CLIENT_HOSTS` | `claude.ai,claude.com` | no (that default) |

## Phase 3 - Go: `internal/oauth` package

| File | Contents |
|---|---|
| `metadata.go` | `GET /.well-known/oauth-authorization-server` (issuer, authorize/token endpoints, `code_challenge_methods_supported: [S256]`, `client_id_metadata_document_supported: true`, `token_endpoint_auth_methods_supported: [none]`). Protected-resource metadata served at `/.well-known/oauth-protected-resource` and `/.well-known/oauth-protected-resource/mcp` via the SDK handler. |
| `cimd.go` | `FetchClient(ctx, clientID) (Client, error)` with the HTTPS/host/size/timeout rules above. |
| `authorize.go` | `GET /oauth/authorize`: validates params and client, renders a minimal sign-in page (no external assets, strict CSP, `X-Frame-Options: DENY`). `POST /oauth/authorize`: checks the key and rate limit, issues a code, redirects to `redirect_uri?code=...&state=...`. |
| `token.go` | `POST /oauth/token`: `authorization_code` (code + PKCE verifier + redirect_uri + resource) and `refresh_token` grants. |
| `store.go` | Token insert / lookup / rotate / delete-all, using pgx. |
| `codes.go` | In-memory single-use code map with 60 s expiry. |
| `ratelimit.go` | Per-IP failure counter. |

## Phase 4 - Wire `/mcp`

`internal/httpapi/handler.go`:
- `/mcp` uses `auth.RequireBearerToken` with one verifier that accepts either the static write key
  (Claude Code, unchanged) or a valid OAuth access token.
- Mount `/.well-known/oauth-*` and `/oauth/*`.

`internal/mcpserver`: add the `revoke_oauth_sessions` tool (destructive, logged in `change_log`).

## Phase 5 - Deploy (owner)

nginx `portfoliter.conf`: send these to the backend (port 8083), like `/mcp` today:

```nginx
location /.well-known/oauth- { proxy_pass http://127.0.0.1:8083; ... }
location /oauth/            { proxy_pass http://127.0.0.1:8083; ... }
```

Then add `PUBLIC_BASE_URL` to `.env.prod`, rebuild the backend, and add the connector in Claude.

## Test plan (needs your approval)

Unit, Go `testing` with hermetic fakes (no network, no DB):
1. PKCE: correct verifier passes, wrong or missing verifier fails, `plain` method rejected.
2. CIMD: rejects http URLs, disallowed hosts, oversize bodies, mismatched `client_id`, unlisted `redirect_uri`
   (fake HTTPS server via `httptest.NewTLSServer`).
3. Codes: single use, expire after 60 s (injected clock).
4. Rate limit: 6th failure in 15 min returns 429; window resets.
5. Verifier: static key passes, valid access token passes, expired / refresh / unknown token fails.

Integration, `httptest` server plus a fake token store:
6. Full flow: 401 with `WWW-Authenticate` resource_metadata, then metadata, authorize page, sign-in with the wrong key (rejected),
   sign-in with the right key, code exchange, `/mcp` `tools/list` with the access token, refresh rotation (old refresh fails),
   `revoke_oauth_sessions`, then the access token fails.

Manual, after deploy:
7. Add the connector in Claude web, sign in, ask "get my portfolio".

## Out of scope

- Dynamic client registration, multiple users, scopes beyond a single `mcp` scope.
- A logout or session list UI (the revoke tool covers it).
