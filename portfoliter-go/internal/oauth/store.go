package oauth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"time"
)

const (
	kindAccess  = "access"
	kindRefresh = "refresh"
)

var ErrTokenNotFound = errors.New("token not found")

// Token is a stored token; the raw value is never persisted, only its SHA-256.
type Token struct {
	Hash      [32]byte
	Kind      string
	ClientID  string
	ExpiresAt time.Time
}

type TokenStore interface {
	// Insert saves tokens and drops expired ones.
	Insert(ctx context.Context, tokens ...Token) error
	Lookup(ctx context.Context, hash [32]byte) (Token, error)
	// Delete reports whether the token existed, so a refresh token can only be used once.
	Delete(ctx context.Context, hash [32]byte) (bool, error)
	// DeleteAll signs every OAuth client out and returns how many tokens were removed.
	DeleteAll(ctx context.Context) (int64, error)
}

// randomToken returns a URL-safe random string and its SHA-256.
func randomToken() (string, [32]byte, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", [32]byte{}, fmt.Errorf("generate token: %w", err)
	}
	raw := base64.RawURLEncoding.EncodeToString(b)
	return raw, sha256.Sum256([]byte(raw)), nil
}
