package oauth

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/modelcontextprotocol/go-sdk/auth"
	"github.com/modelcontextprotocol/go-sdk/mcp"
)

const (
	testOwnerKey    = "owner-key"
	testClientID    = "https://claude.ai/oauth/client.json"
	testRedirectURI = "https://claude.ai/api/mcp/auth_callback"
	testVerifier    = "verifier-verifier-verifier-verifier-verifier-1234"
)

type staticClients struct{}

func (staticClients) Fetch(_ context.Context, clientID string) (Client, error) {
	if clientID != testClientID {
		return Client{}, io.ErrUnexpectedEOF
	}
	return Client{ClientID: testClientID, ClientName: "Claude", RedirectURIs: []string{testRedirectURI}}, nil
}

// newTestSite mounts the OAuth endpoints and a real MCP handler behind the bearer middleware, like httpapi does.
func newTestSite(t *testing.T) (*httptest.Server, *memStore) {
	t.Helper()
	store := newMemStore()
	var site *httptest.Server
	mux := http.NewServeMux()
	site = httptest.NewServer(mux)
	t.Cleanup(site.Close)

	oauthSrv := NewServer(Config{BaseURL: site.URL, OwnerKeyHash: sha256.Sum256([]byte(testOwnerKey))}, store, staticClients{})
	mcpServer := mcp.NewServer(&mcp.Implementation{Name: "test"}, nil)
	mcp.AddTool(mcpServer, &mcp.Tool{Name: "ping"}, func(context.Context, *mcp.CallToolRequest, struct{}) (*mcp.CallToolResult, any, error) {
		return &mcp.CallToolResult{}, nil, nil
	})
	mcpHandler := mcp.NewStreamableHTTPHandler(func(*http.Request) *mcp.Server { return mcpServer },
		&mcp.StreamableHTTPOptions{Stateless: true, DisableLocalhostProtection: true})
	requireToken := auth.RequireBearerToken(oauthSrv.Verify,
		&auth.RequireBearerTokenOptions{ResourceMetadataURL: oauthSrv.ResourceMetadataURL()})
	mux.Handle("/mcp", requireToken(mcpHandler))
	oauthSrv.Register(mux)
	return site, store
}

func listTools(t *testing.T, site *httptest.Server, token string) *http.Response {
	t.Helper()
	req, _ := http.NewRequest(http.MethodPost, site.URL+"/mcp",
		strings.NewReader(`{"jsonrpc":"2.0","id":1,"method":"tools/list"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json, text/event-stream")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("POST /mcp: %v", err)
	}
	t.Cleanup(func() { resp.Body.Close() })
	return resp
}

func authorizeParams(site *httptest.Server) url.Values {
	return url.Values{
		"response_type":         {"code"},
		"client_id":             {testClientID},
		"redirect_uri":          {testRedirectURI},
		"state":                 {"xyz"},
		"code_challenge":        {challengeFor(testVerifier)},
		"code_challenge_method": {"S256"},
		"resource":              {site.URL + "/mcp"},
	}
}

// noRedirect returns the 302 itself so the test can read the code.
var noRedirect = &http.Client{CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}

func signIn(t *testing.T, site *httptest.Server, key string) *http.Response {
	t.Helper()
	form := authorizeParams(site)
	form.Set("key", key)
	resp, err := noRedirect.PostForm(site.URL+authorizePath, form)
	if err != nil {
		t.Fatalf("POST authorize: %v", err)
	}
	resp.Body.Close()
	return resp
}

func postToken(t *testing.T, site *httptest.Server, form url.Values) (int, tokenResponse) {
	t.Helper()
	resp, err := http.PostForm(site.URL+tokenPath, form)
	if err != nil {
		t.Fatalf("POST token: %v", err)
	}
	defer resp.Body.Close()
	var body tokenResponse
	_ = json.NewDecoder(resp.Body).Decode(&body)
	return resp.StatusCode, body
}

func TestFullSignInFlow(t *testing.T) {
	site, store := newTestSite(t)

	resp := listTools(t, site, "")
	if resp.StatusCode != http.StatusUnauthorized ||
		!strings.Contains(resp.Header.Get("WWW-Authenticate"), "resource_metadata=") {
		t.Fatalf("unauthenticated /mcp = %d %q, want 401 with resource_metadata", resp.StatusCode, resp.Header.Get("WWW-Authenticate"))
	}

	for _, path := range []string{protectedResourcePath + "/mcp", authServerMetaPath} {
		r, err := http.Get(site.URL + path)
		if err != nil || r.StatusCode != http.StatusOK {
			t.Fatalf("GET %s = %v, %v", path, r, err)
		}
		r.Body.Close()
	}

	page, err := http.Get(site.URL + authorizePath + "?" + authorizeParams(site).Encode())
	if err != nil || page.StatusCode != http.StatusOK {
		t.Fatalf("GET authorize page = %v, %v", page, err)
	}
	page.Body.Close()

	if r := signIn(t, site, "wrong-key"); r.StatusCode != http.StatusUnauthorized {
		t.Fatalf("wrong key = %d, want 401", r.StatusCode)
	}

	r := signIn(t, site, testOwnerKey)
	location, _ := url.Parse(r.Header.Get("Location"))
	code := location.Query().Get("code")
	if r.StatusCode != http.StatusFound || code == "" || location.Query().Get("state") != "xyz" {
		t.Fatalf("right key = %d %q, want 302 with code and state", r.StatusCode, location)
	}

	status, tokens := postToken(t, site, url.Values{
		"grant_type":    {"authorization_code"},
		"code":          {code},
		"client_id":     {testClientID},
		"redirect_uri":  {testRedirectURI},
		"code_verifier": {testVerifier},
		"resource":      {site.URL + "/mcp"},
	})
	if status != http.StatusOK || tokens.AccessToken == "" || tokens.RefreshToken == "" {
		t.Fatalf("code exchange = %d %+v", status, tokens)
	}

	if r := listTools(t, site, tokens.AccessToken); r.StatusCode != http.StatusOK {
		t.Fatalf("tools/list with access token = %d, want 200", r.StatusCode)
	}

	refreshForm := url.Values{"grant_type": {"refresh_token"}, "refresh_token": {tokens.RefreshToken}, "client_id": {testClientID}}
	status, rotated := postToken(t, site, refreshForm)
	if status != http.StatusOK || rotated.AccessToken == "" {
		t.Fatalf("refresh = %d %+v", status, rotated)
	}
	if status, _ := postToken(t, site, refreshForm); status != http.StatusBadRequest {
		t.Fatalf("reused refresh token = %d, want 400", status)
	}

	if _, err := store.DeleteAll(context.Background()); err != nil {
		t.Fatalf("revoke: %v", err)
	}
	if r := listTools(t, site, rotated.AccessToken); r.StatusCode != http.StatusUnauthorized {
		t.Fatalf("access token after revoke = %d, want 401", r.StatusCode)
	}
	if r := listTools(t, site, testOwnerKey); r.StatusCode != http.StatusOK {
		t.Fatalf("static key after revoke = %d, want 200", r.StatusCode)
	}
}

func TestCodeCannotBeExchangedTwiceOrWithWrongVerifier(t *testing.T) {
	site, _ := newTestSite(t)
	exchange := func(code, verifier string) int {
		status, _ := postToken(t, site, url.Values{
			"grant_type": {"authorization_code"}, "code": {code}, "client_id": {testClientID},
			"redirect_uri": {testRedirectURI}, "code_verifier": {verifier},
		})
		return status
	}
	codeFrom := func() string {
		loc, _ := url.Parse(signIn(t, site, testOwnerKey).Header.Get("Location"))
		return loc.Query().Get("code")
	}

	if status := exchange(codeFrom(), strings.Repeat("x", 43)); status != http.StatusBadRequest {
		t.Fatalf("wrong verifier = %d, want 400", status)
	}
	code := codeFrom()
	if status := exchange(code, testVerifier); status != http.StatusOK {
		t.Fatalf("first exchange = %d, want 200", status)
	}
	if status := exchange(code, testVerifier); status != http.StatusBadRequest {
		t.Fatalf("second exchange = %d, want 400", status)
	}
}

func TestAuthorizeRejectsUnknownClientAndRedirect(t *testing.T) {
	site, _ := newTestSite(t)
	cases := map[string]func(url.Values){
		"unknown client":        func(v url.Values) { v.Set("client_id", "https://evil.example/c.json") },
		"unregistered redirect": func(v url.Values) { v.Set("redirect_uri", "https://evil.example/cb") },
		"plain PKCE":            func(v url.Values) { v.Set("code_challenge_method", "plain") },
		"wrong resource":        func(v url.Values) { v.Set("resource", "https://other.example/mcp") },
	}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			params := authorizeParams(site)
			mutate(params)

			resp, err := noRedirect.Get(site.URL + authorizePath + "?" + params.Encode())

			if err != nil {
				t.Fatalf("GET authorize: %v", err)
			}
			resp.Body.Close()
			if resp.StatusCode != http.StatusBadRequest || resp.Header.Get("Location") != "" {
				t.Fatalf("status = %d location = %q, want 400 with no redirect", resp.StatusCode, resp.Header.Get("Location"))
			}
		})
	}
}

func TestSignInLockedAfterTooManyWrongKeys(t *testing.T) {
	site, _ := newTestSite(t)
	for i := 0; i < maxFailedSignIns; i++ {
		signIn(t, site, "wrong")
	}

	if r := signIn(t, site, testOwnerKey); r.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("right key while locked = %d, want 429", r.StatusCode)
	}
}
