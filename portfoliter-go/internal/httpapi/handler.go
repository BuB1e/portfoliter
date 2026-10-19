package httpapi

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"portfoliter-go/internal/portfolio"
)

const apiKeyHeader = "X-API-Key"

type PortfolioReader interface {
	GetPublished(ctx context.Context) (portfolio.Portfolio, error)
}

// KeyHashes are SHA-256 digests of the read key (frontend) and write key (MCP clients).
type KeyHashes struct {
	Read  [32]byte
	Write [32]byte
}

func NewHandler(reader PortfolioReader, mcpHandler http.Handler, keys KeyHashes) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.Handle("GET /v1/portfolio", requireKey(keys.Read, apiKey, getPortfolio(reader)))
	mux.Handle("/mcp", requireKey(keys.Write, bearerToken, mcpHandler))
	return mux
}

func apiKey(r *http.Request) string {
	return r.Header.Get(apiKeyHeader)
}

func bearerToken(r *http.Request) string {
	token, _ := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
	return token
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
