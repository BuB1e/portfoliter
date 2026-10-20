package oauth

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"log/slog"
	"net/http"
)

type tokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
}

// errInvalidGrant covers every bad code, verifier or refresh token; the reason is not revealed.
var errInvalidGrant = errors.New("invalid_grant")

func (s *Server) handleToken(w http.ResponseWriter, r *http.Request) {
	allowAnyOrigin(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxFormBytes)
	if err := r.ParseForm(); err != nil {
		tokenError(w, http.StatusBadRequest, "invalid_request")
		return
	}

	var resp tokenResponse
	var err error
	switch r.PostForm.Get("grant_type") {
	case "authorization_code":
		resp, err = s.exchangeCode(r)
	case "refresh_token":
		resp, err = s.refresh(r)
	default:
		tokenError(w, http.StatusBadRequest, "unsupported_grant_type")
		return
	}
	if errors.Is(err, errInvalidGrant) {
		tokenError(w, http.StatusBadRequest, "invalid_grant")
		return
	}
	if err != nil {
		slog.ErrorContext(r.Context(), "oauth token", "err", err)
		tokenError(w, http.StatusInternalServerError, "server_error")
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (s *Server) exchangeCode(r *http.Request) (tokenResponse, error) {
	form := r.PostForm
	g, ok := s.codes.take(form.Get("code"))
	if !ok ||
		form.Get("client_id") != g.clientID ||
		form.Get("redirect_uri") != g.redirectURI ||
		(form.Get("resource") != "" && form.Get("resource") != s.resourceURL()) ||
		!verifyPKCE(form.Get("code_verifier"), g.codeChallenge) {
		return tokenResponse{}, errInvalidGrant
	}
	return s.issue(r.Context(), g.clientID)
}

// refresh swaps a refresh token for a new pair; the old refresh token stops working.
func (s *Server) refresh(r *http.Request) (tokenResponse, error) {
	hash := sha256.Sum256([]byte(r.PostForm.Get("refresh_token")))
	stored, err := s.store.Lookup(r.Context(), hash)
	if errors.Is(err, ErrTokenNotFound) {
		return tokenResponse{}, errInvalidGrant
	}
	if err != nil {
		return tokenResponse{}, err
	}
	clientID := r.PostForm.Get("client_id")
	if stored.Kind != kindRefresh || !stored.ExpiresAt.After(s.now()) || (clientID != "" && clientID != stored.ClientID) {
		return tokenResponse{}, errInvalidGrant
	}
	deleted, err := s.store.Delete(r.Context(), hash)
	if err != nil {
		return tokenResponse{}, err
	}
	if !deleted {
		return tokenResponse{}, errInvalidGrant // already used by a concurrent request
	}
	return s.issue(r.Context(), stored.ClientID)
}

func (s *Server) issue(ctx context.Context, clientID string) (tokenResponse, error) {
	access, accessHash, err := randomToken()
	if err != nil {
		return tokenResponse{}, err
	}
	refresh, refreshHash, err := randomToken()
	if err != nil {
		return tokenResponse{}, err
	}
	now := s.now()
	err = s.store.Insert(ctx,
		Token{Hash: accessHash, Kind: kindAccess, ClientID: clientID, ExpiresAt: now.Add(accessTokenTTL)},
		Token{Hash: refreshHash, Kind: kindRefresh, ClientID: clientID, ExpiresAt: now.Add(refreshTokenTTL)},
	)
	if err != nil {
		return tokenResponse{}, err
	}
	return tokenResponse{
		AccessToken:  access,
		TokenType:    "Bearer",
		ExpiresIn:    int(accessTokenTTL.Seconds()),
		RefreshToken: refresh,
		Scope:        scopeMCP,
	}, nil
}

// verifyPKCE checks an RFC 7636 S256 code_verifier against the stored challenge.
func verifyPKCE(verifier, challenge string) bool {
	if len(verifier) < 43 || len(verifier) > 128 || challenge == "" {
		return false
	}
	sum := sha256.Sum256([]byte(verifier))
	computed := base64.RawURLEncoding.EncodeToString(sum[:])
	return subtle.ConstantTimeCompare([]byte(computed), []byte(challenge)) == 1
}

func tokenError(w http.ResponseWriter, status int, code string) {
	writeJSON(w, status, map[string]string{"error": code})
}
