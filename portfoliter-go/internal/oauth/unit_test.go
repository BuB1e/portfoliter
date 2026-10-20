package oauth

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/modelcontextprotocol/go-sdk/auth"
)

// memStore is an in-memory TokenStore for hermetic tests.
type memStore struct {
	mu     sync.Mutex
	tokens map[[32]byte]Token
}

func newMemStore() *memStore { return &memStore{tokens: map[[32]byte]Token{}} }

func (m *memStore) Insert(_ context.Context, tokens ...Token) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, t := range tokens {
		m.tokens[t.Hash] = t
	}
	return nil
}

func (m *memStore) Lookup(_ context.Context, hash [32]byte) (Token, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	t, ok := m.tokens[hash]
	if !ok {
		return Token{}, ErrTokenNotFound
	}
	return t, nil
}

func (m *memStore) Delete(_ context.Context, hash [32]byte) (bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	_, ok := m.tokens[hash]
	delete(m.tokens, hash)
	return ok, nil
}

func (m *memStore) DeleteAll(context.Context) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	n := int64(len(m.tokens))
	m.tokens = map[[32]byte]Token{}
	return n, nil
}

// fakeClock is a settable clock shared by codes, limiter and server.
type fakeClock struct{ t time.Time }

func (c *fakeClock) now() time.Time          { return c.t }
func (c *fakeClock) advance(d time.Duration) { c.t = c.t.Add(d) }

func challengeFor(verifier string) string {
	sum := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

func TestVerifyPKCE(t *testing.T) {
	verifier := strings.Repeat("a", 43)
	challenge := challengeFor(verifier)

	cases := []struct {
		name      string
		verifier  string
		challenge string
		want      bool
	}{
		{"correct verifier", verifier, challenge, true},
		{"wrong verifier", strings.Repeat("b", 43), challenge, false},
		{"missing verifier", "", challenge, false},
		{"too short", "abc", challengeFor("abc"), false},
		{"plain method value is not accepted", verifier, verifier, false},
		{"missing challenge", verifier, "", false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := verifyPKCE(tc.verifier, tc.challenge); got != tc.want {
				t.Fatalf("verifyPKCE() = %v, want %v", got, tc.want)
			}
		})
	}
}

func TestCIMDFetch(t *testing.T) {
	var body string
	var status int
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(status)
		fmt.Fprint(w, body)
	}))
	defer srv.Close()
	clientID := srv.URL + "/client.json"
	fetcher := NewCIMDFetcher([]string{"127.0.0.1"}, srv.Client())
	valid := fmt.Sprintf(`{"client_id":%q,"client_name":"Claude","redirect_uris":["https://claude.ai/cb"]}`, clientID)

	cases := []struct {
		name     string
		clientID string
		status   int
		body     string
		wantErr  bool
	}{
		{"valid document", clientID, 200, valid, false},
		{"http URL rejected", strings.Replace(clientID, "https", "http", 1), 200, valid, true},
		{"host not allowed", "https://evil.example/client.json", 200, valid, true},
		{"root path rejected", srv.URL + "/", 200, valid, true},
		{"oversize body", clientID, 200, `{"x":"` + strings.Repeat("a", cimdMaxBytes) + `"}`, true},
		{"client_id mismatch", clientID, 200, `{"client_id":"https://other/x","redirect_uris":["https://claude.ai/cb"]}`, true},
		{"no redirect uris", clientID, 200, fmt.Sprintf(`{"client_id":%q}`, clientID), true},
		{"non-200 status", clientID, 404, valid, true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			status, body = tc.status, tc.body

			client, err := fetcher.Fetch(context.Background(), tc.clientID)

			if tc.wantErr {
				if err == nil {
					t.Fatalf("Fetch() = %+v, want error", client)
				}
				return
			}
			if err != nil {
				t.Fatalf("Fetch() error = %v", err)
			}
			if !client.allowsRedirect("https://claude.ai/cb") || client.allowsRedirect("https://claude.ai/other") {
				t.Fatalf("redirect check wrong for %+v", client)
			}
		})
	}
}

func TestCodesAreSingleUseAndExpire(t *testing.T) {
	clock := &fakeClock{t: time.Unix(1_000, 0)}
	codes := newCodeStore(clock.now)

	codes.put("one", grant{clientID: "c"})
	if _, ok := codes.take("one"); !ok {
		t.Fatal("first take failed")
	}
	if _, ok := codes.take("one"); ok {
		t.Fatal("second take succeeded, want single use")
	}

	codes.put("two", grant{clientID: "c"})
	clock.advance(codeTTL)
	if _, ok := codes.take("two"); ok {
		t.Fatal("expired code accepted")
	}
}

func TestLimiterBlocksAfterFiveFailures(t *testing.T) {
	clock := &fakeClock{t: time.Unix(1_000, 0)}
	l := newLimiter(clock.now)

	for i := 0; i < maxFailedSignIns; i++ {
		if !l.allowed("1.2.3.4") {
			t.Fatalf("blocked after %d failures, want %d allowed", i, maxFailedSignIns)
		}
		l.fail("1.2.3.4")
	}
	if l.allowed("1.2.3.4") {
		t.Fatal("6th attempt allowed")
	}
	if !l.allowed("5.6.7.8") {
		t.Fatal("other IP blocked")
	}

	clock.advance(failureWindow)
	if !l.allowed("1.2.3.4") {
		t.Fatal("still blocked after the window")
	}

	for i := 0; i < maxFailedSignIns-1; i++ {
		l.fail("9.9.9.9")
	}
	l.reset("9.9.9.9")
	l.fail("9.9.9.9")
	if !l.allowed("9.9.9.9") {
		t.Fatal("a successful sign-in should clear earlier failures")
	}
}

func TestVerify(t *testing.T) {
	clock := &fakeClock{t: time.Unix(1_000_000, 0)}
	store := newMemStore()
	srv := NewServer(Config{BaseURL: "https://site.test", OwnerKeyHash: sha256.Sum256([]byte("owner-key"))}, store, nil)
	srv.now = clock.now

	add := func(raw, kind string, expires time.Time) {
		_ = store.Insert(context.Background(), Token{Hash: sha256.Sum256([]byte(raw)), Kind: kind, ClientID: "c", ExpiresAt: expires})
	}
	add("live-access", kindAccess, clock.t.Add(time.Hour))
	add("old-access", kindAccess, clock.t.Add(-time.Second))
	add("a-refresh", kindRefresh, clock.t.Add(time.Hour))

	cases := []struct {
		name    string
		token   string
		wantErr bool
	}{
		{"static owner key", "owner-key", false},
		{"live access token", "live-access", false},
		{"expired access token", "old-access", true},
		{"refresh token is not an access token", "a-refresh", true},
		{"unknown token", "nope", true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			info, err := srv.Verify(context.Background(), tc.token, nil)

			if tc.wantErr {
				if !errors.Is(err, auth.ErrInvalidToken) {
					t.Fatalf("Verify() = %v, %v; want ErrInvalidToken", info, err)
				}
				return
			}
			if err != nil || info.Expiration.IsZero() {
				t.Fatalf("Verify() = %v, %v; want token info with expiration", info, err)
			}
		})
	}
}
