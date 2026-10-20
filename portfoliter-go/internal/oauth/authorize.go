package oauth

import (
	"context"
	"errors"
	"fmt"
	"html/template"
	"log/slog"
	"net/http"
	"net/url"
)

const maxFormBytes = 16 << 10

// authRequest holds the authorization request parameters, carried through the sign-in form.
type authRequest struct {
	ResponseType  string
	ClientID      string
	RedirectURI   string
	State         string
	CodeChallenge string
	Method        string
	Resource      string
	Scope         string
}

func readAuthRequest(v url.Values) authRequest {
	return authRequest{
		ResponseType:  v.Get("response_type"),
		ClientID:      v.Get("client_id"),
		RedirectURI:   v.Get("redirect_uri"),
		State:         v.Get("state"),
		CodeChallenge: v.Get("code_challenge"),
		Method:        v.Get("code_challenge_method"),
		Resource:      v.Get("resource"),
		Scope:         v.Get("scope"),
	}
}

// checkAuthRequest validates the client and parameters. Any failure shows an error page and never redirects.
func (s *Server) checkAuthRequest(ctx context.Context, req authRequest) (Client, error) {
	client, err := s.clients.Fetch(ctx, req.ClientID)
	if err != nil {
		return Client{}, fmt.Errorf("unknown client: %w", err)
	}
	if !client.allowsRedirect(req.RedirectURI) {
		return Client{}, errors.New("redirect_uri is not registered for this client")
	}
	if req.ResponseType != "code" {
		return Client{}, errors.New("response_type must be code")
	}
	if req.Method != "S256" || req.CodeChallenge == "" {
		return Client{}, errors.New("PKCE with S256 is required")
	}
	if req.Resource != "" && req.Resource != s.resourceURL() {
		return Client{}, errors.New("resource does not match this server")
	}
	return client, nil
}

func (s *Server) handleAuthorizeForm(w http.ResponseWriter, r *http.Request) {
	req := readAuthRequest(r.URL.Query())
	client, err := s.checkAuthRequest(r.Context(), req)
	if err != nil {
		s.renderError(w, http.StatusBadRequest, err)
		return
	}
	s.renderSignIn(w, http.StatusOK, req, client, "")
}

func (s *Server) handleAuthorizeSubmit(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxFormBytes)
	if err := r.ParseForm(); err != nil {
		s.renderError(w, http.StatusBadRequest, errors.New("could not read the form"))
		return
	}
	req := readAuthRequest(r.PostForm)
	client, err := s.checkAuthRequest(r.Context(), req)
	if err != nil {
		s.renderError(w, http.StatusBadRequest, err)
		return
	}

	ip := clientIP(r)
	if !s.limiter.allowed(ip) {
		s.renderSignIn(w, http.StatusTooManyRequests, req, client, "Too many wrong keys. Try again in 15 minutes.")
		return
	}
	if !s.ownerKeyMatches(r.PostFormValue("key")) {
		s.limiter.fail(ip)
		slog.WarnContext(r.Context(), "oauth sign-in rejected", "ip", ip)
		s.renderSignIn(w, http.StatusUnauthorized, req, client, "That key is not right.")
		return
	}
	s.limiter.reset(ip)

	code, _, err := randomToken()
	if err != nil {
		s.renderError(w, http.StatusInternalServerError, errors.New("could not create a sign-in code"))
		return
	}
	s.codes.put(code, grant{clientID: req.ClientID, redirectURI: req.RedirectURI, codeChallenge: req.CodeChallenge})

	target, _ := url.Parse(req.RedirectURI) // already matched against the client's registered URIs
	q := target.Query()
	q.Set("code", code)
	q.Set("iss", s.cfg.BaseURL)
	if req.State != "" {
		q.Set("state", req.State)
	}
	target.RawQuery = q.Encode()
	http.Redirect(w, r, target.String(), http.StatusFound)
}

var pageTemplate = template.Must(template.New("signin").Parse(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in to portfoliter</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f4f5f7; color: #1c2024;
         font: 16px/1.5 system-ui, sans-serif; }
  main { width: min(100% - 32px, 420px); background: #fff; border: 1px solid #e3e5e8; border-radius: 12px; padding: 28px; }
  h1 { font-size: 1.35rem; margin: 0 0 8px; }
  p { margin: 0 0 20px; color: #4b5259; }
  label { display: block; font-weight: 600; margin-bottom: 6px; }
  input { width: 100%; box-sizing: border-box; font: inherit; padding: 10px 12px; border: 1px solid #c8ccd1; border-radius: 8px; }
  button { margin-top: 16px; width: 100%; font: inherit; font-weight: 600; padding: 11px; border: 0; border-radius: 8px;
           background: #1c2024; color: #fff; cursor: pointer; }
  .error { color: #b42318; font-weight: 600; }
  :focus-visible { outline: 2px solid #0d74ce; outline-offset: 2px; }
</style>
</head>
<body>
<main>
{{if .Fatal}}
  <h1>Can't sign in</h1>
  <p class="error">{{.Fatal}}</p>
{{else}}
  <h1>Allow {{.ClientName}} to edit your portfolio?</h1>
  <p>Enter your MCP key to connect. Only the portfolio owner has it.</p>
  {{if .Message}}<p class="error" role="alert">{{.Message}}</p>{{end}}
  <form method="post" action="{{.Action}}">
    {{range $name, $value := .Hidden}}<input type="hidden" name="{{$name}}" value="{{$value}}">{{end}}
    <label for="key">MCP key</label>
    <input id="key" name="key" type="password" autocomplete="current-password" required autofocus>
    <button type="submit">Allow access</button>
  </form>
{{end}}
</main>
</body>
</html>`))

type pageData struct {
	Fatal      string
	ClientName string
	Message    string
	Action     string
	Hidden     map[string]string
}

func (s *Server) renderSignIn(w http.ResponseWriter, status int, req authRequest, client Client, message string) {
	formAction := "'self'"
	if u, err := url.Parse(req.RedirectURI); err == nil {
		// Browsers apply form-action to the redirect after submit, so the client's origin must be listed.
		formAction += " " + u.Scheme + "://" + u.Host
	}
	s.writePage(w, status, formAction, pageData{
		ClientName: client.displayName(),
		Message:    message,
		Action:     authorizePath,
		Hidden: map[string]string{
			"response_type":         req.ResponseType,
			"client_id":             req.ClientID,
			"redirect_uri":          req.RedirectURI,
			"state":                 req.State,
			"code_challenge":        req.CodeChallenge,
			"code_challenge_method": req.Method,
			"resource":              req.Resource,
			"scope":                 req.Scope,
		},
	})
}

func (s *Server) renderError(w http.ResponseWriter, status int, err error) {
	s.writePage(w, status, "'none'", pageData{Fatal: err.Error()})
}

func (s *Server) writePage(w http.ResponseWriter, status int, formAction string, data pageData) {
	h := w.Header()
	h.Set("Content-Type", "text/html; charset=utf-8")
	h.Set("Cache-Control", "no-store")
	h.Set("X-Frame-Options", "DENY")
	h.Set("Referrer-Policy", "no-referrer")
	h.Set("Content-Security-Policy",
		"default-src 'none'; style-src 'unsafe-inline'; form-action "+formAction+"; frame-ancestors 'none'; base-uri 'none'")
	w.WriteHeader(status)
	if err := pageTemplate.Execute(w, data); err != nil {
		slog.Error("render oauth page", "err", err)
	}
}
