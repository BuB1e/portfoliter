// Package oauth is a single-owner OAuth 2.1 authorization server for the MCP endpoint.
// Claude web connectors sign in through it; only someone holding the MCP write key can approve.
package oauth

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/modelcontextprotocol/go-sdk/auth"
	"github.com/modelcontextprotocol/go-sdk/oauthex"
)

const (
	accessTokenTTL  = time.Hour
	refreshTokenTTL = 30 * 24 * time.Hour
	scopeMCP        = "mcp"

	// staticKeyTTL is only what the bearer middleware sees for the static key; the key itself never expires.
	staticKeyTTL = time.Hour

	protectedResourcePath = "/.well-known/oauth-protected-resource"
	authServerMetaPath    = "/.well-known/oauth-authorization-server"
	authorizePath         = "/oauth/authorize"
	tokenPath             = "/oauth/token"
)

type Config struct {
	// BaseURL is the public origin, e.g. https://portfolio.haritsom.com.
	BaseURL string
	// OwnerKeyHash is the SHA-256 of the MCP write key; it is the sign-in secret.
	OwnerKeyHash [32]byte
}

type Server struct {
	cfg     Config
	store   TokenStore
	clients ClientFetcher
	codes   *codeStore
	limiter *limiter
	now     func() time.Time
}

func NewServer(cfg Config, store TokenStore, clients ClientFetcher) *Server {
	now := time.Now
	return &Server{
		cfg:     cfg,
		store:   store,
		clients: clients,
		codes:   newCodeStore(now),
		limiter: newLimiter(now),
		now:     now,
	}
}

func (s *Server) resourceURL() string { return s.cfg.BaseURL + "/mcp" }

// ResourceMetadataURL is advertised in the WWW-Authenticate header of a 401 from /mcp.
func (s *Server) ResourceMetadataURL() string {
	return s.cfg.BaseURL + protectedResourcePath + "/mcp"
}

// Register mounts the discovery documents and the /oauth endpoints.
func (s *Server) Register(mux *http.ServeMux) {
	prm := auth.ProtectedResourceMetadataHandler(&oauthex.ProtectedResourceMetadata{
		Resource:               s.resourceURL(),
		AuthorizationServers:   []string{s.cfg.BaseURL},
		ScopesSupported:        []string{scopeMCP},
		BearerMethodsSupported: []string{"header"},
		ResourceName:           "portfoliter MCP",
	})
	mux.Handle(protectedResourcePath, prm)
	mux.Handle(protectedResourcePath+"/mcp", prm)
	mux.HandleFunc(authServerMetaPath, s.handleAuthServerMetadata)
	mux.HandleFunc("GET "+authorizePath, s.handleAuthorizeForm)
	mux.HandleFunc("POST "+authorizePath, s.handleAuthorizeSubmit)
	mux.HandleFunc(tokenPath, s.handleToken)
}

// Verify accepts the static write key (Claude Code) or a live OAuth access token (Claude web).
func (s *Server) Verify(ctx context.Context, token string, _ *http.Request) (*auth.TokenInfo, error) {
	hash := sha256.Sum256([]byte(token))
	if subtle.ConstantTimeCompare(hash[:], s.cfg.OwnerKeyHash[:]) == 1 {
		return &auth.TokenInfo{Scopes: []string{scopeMCP}, Expiration: s.now().Add(staticKeyTTL)}, nil
	}

	stored, err := s.store.Lookup(ctx, hash)
	if errors.Is(err, ErrTokenNotFound) {
		return nil, auth.ErrInvalidToken
	}
	if err != nil {
		return nil, fmt.Errorf("look up token: %w", err)
	}
	if stored.Kind != kindAccess || !stored.ExpiresAt.After(s.now()) {
		return nil, auth.ErrInvalidToken
	}
	return &auth.TokenInfo{Scopes: []string{scopeMCP}, Expiration: stored.ExpiresAt}, nil
}

func (s *Server) ownerKeyMatches(key string) bool {
	hash := sha256.Sum256([]byte(key))
	return subtle.ConstantTimeCompare(hash[:], s.cfg.OwnerKeyHash[:]) == 1
}
