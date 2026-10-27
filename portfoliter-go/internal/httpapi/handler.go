package httpapi

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/modelcontextprotocol/go-sdk/auth"

	"portfoliter-go/internal/portfolio"
)

const apiKeyHeader = "X-API-Key"

type PortfolioReader interface {
	GetPublished(ctx context.Context) (portfolio.Portfolio, error)
	GetPublishedProject(ctx context.Context, slug string) (portfolio.ProjectDetail, error)
}

// maxSlugLength bounds the path value before it reaches the database; longer slugs are a 404.
const maxSlugLength = 200

// MCPAuth protects /mcp: it verifies bearer tokens and serves the OAuth endpoints Claude web signs in through.
type MCPAuth interface {
	Verify(ctx context.Context, token string, r *http.Request) (*auth.TokenInfo, error)
	ResourceMetadataURL() string
	Register(mux *http.ServeMux)
}

// readKeyHash is the SHA-256 of the frontend's read key.
func NewHandler(reader PortfolioReader, mcpHandler http.Handler, readKeyHash [32]byte, mcpAuth MCPAuth) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.Handle("GET /v1/portfolio", requireKey(readKeyHash, apiKey, getPortfolio(reader)))
	mux.Handle("GET /v1/projects/{slug}", requireKey(readKeyHash, apiKey, getProject(reader)))

	// A 401 from /mcp carries WWW-Authenticate with resource_metadata, which starts Claude's sign-in.
	requireToken := auth.RequireBearerToken(mcpAuth.Verify,
		&auth.RequireBearerTokenOptions{ResourceMetadataURL: mcpAuth.ResourceMetadataURL()})
	mux.Handle("/mcp", requireToken(mcpHandler))
	mcpAuth.Register(mux)
	return mux
}

func apiKey(r *http.Request) string {
	return r.Header.Get(apiKeyHeader)
}

// requireKey compares the SHA-256 of the extracted key with the expected hash.
func requireKey(expected [32]byte, extract func(*http.Request) string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got := sha256.Sum256([]byte(extract(r)))
		if subtle.ConstantTimeCompare(got[:], expected[:]) != 1 {
			writeJSON(w, http.StatusUnauthorized, errorBody("unauthorized"))
			return
		}
		next.ServeHTTP(w, r)
	})
}

func getPortfolio(reader PortfolioReader) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p, err := reader.GetPublished(r.Context())
		if errors.Is(err, portfolio.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, errorBody("not_found"))
			return
		}
		if err != nil {
			slog.ErrorContext(r.Context(), "get portfolio", "err", err)
			writeJSON(w, http.StatusInternalServerError, errorBody("internal"))
			return
		}
		writeJSON(w, http.StatusOK, p)
	})
}

// getProject serves one published project; drafts and unknown slugs are 404.
func getProject(reader PortfolioReader) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		slug := r.PathValue("slug")
		if slug == "" || len(slug) > maxSlugLength {
			writeJSON(w, http.StatusNotFound, errorBody("not_found"))
			return
		}
		p, err := reader.GetPublishedProject(r.Context(), slug)
		if errors.Is(err, portfolio.ErrProjectNotFound) {
			writeJSON(w, http.StatusNotFound, errorBody("not_found"))
			return
		}
		if err != nil {
			slog.ErrorContext(r.Context(), "get project", "slug", slug, "err", err)
			writeJSON(w, http.StatusInternalServerError, errorBody("internal"))
			return
		}
		writeJSON(w, http.StatusOK, p)
	})
}

func errorBody(code string) map[string]string {
	return map[string]string{"error": code}
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		slog.Error("write response", "err", err)
	}
}
