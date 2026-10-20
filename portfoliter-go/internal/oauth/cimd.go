package oauth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"slices"
	"time"
)

const (
	cimdTimeout  = 5 * time.Second
	cimdMaxBytes = 64 << 10
)

// Client is the part of a client_id metadata document this server uses.
type Client struct {
	ClientID     string   `json:"client_id"`
	ClientName   string   `json:"client_name"`
	RedirectURIs []string `json:"redirect_uris"`
}

type ClientFetcher interface {
	Fetch(ctx context.Context, clientID string) (Client, error)
}

// CIMDFetcher resolves a client_id that is an HTTPS URL to its metadata document.
type CIMDFetcher struct {
	allowedHosts []string
	http         *http.Client
}

func NewCIMDFetcher(allowedHosts []string, httpClient *http.Client) *CIMDFetcher {
	if httpClient == nil {
		httpClient = &http.Client{}
	}
	c := *httpClient
	c.Timeout = cimdTimeout
	// The document must live at exactly the client_id URL.
	c.CheckRedirect = func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }
	return &CIMDFetcher{allowedHosts: allowedHosts, http: &c}
}

func (f *CIMDFetcher) Fetch(ctx context.Context, clientID string) (Client, error) {
	u, err := url.Parse(clientID)
	if err != nil || u.Scheme != "https" || u.Path == "" || u.Path == "/" || u.Fragment != "" {
		return Client{}, errors.New("client_id must be an https URL with a path")
	}
	if !slices.Contains(f.allowedHosts, u.Hostname()) {
		return Client{}, fmt.Errorf("client %s is not allowed", u.Hostname())
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, clientID, nil)
	if err != nil {
		return Client{}, fmt.Errorf("build client metadata request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	resp, err := f.http.Do(req)
	if err != nil {
		return Client{}, fmt.Errorf("fetch client metadata: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return Client{}, fmt.Errorf("fetch client metadata: status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, cimdMaxBytes+1))
	if err != nil {
		return Client{}, fmt.Errorf("read client metadata: %w", err)
	}
	if len(body) > cimdMaxBytes {
		return Client{}, errors.New("client metadata document too large")
	}

	var client Client
	if err := json.Unmarshal(body, &client); err != nil {
		return Client{}, fmt.Errorf("decode client metadata: %w", err)
	}
	if client.ClientID != clientID {
		return Client{}, errors.New("client metadata client_id does not match its URL")
	}
	if len(client.RedirectURIs) == 0 {
		return Client{}, errors.New("client metadata has no redirect_uris")
	}
	return client, nil
}

func (c Client) allowsRedirect(uri string) bool {
	return slices.Contains(c.RedirectURIs, uri)
}

func (c Client) displayName() string {
	if c.ClientName != "" {
		return c.ClientName
	}
	if u, err := url.Parse(c.ClientID); err == nil {
		return u.Hostname()
	}
	return c.ClientID
}
