package oauth

import (
	"encoding/json"
	"net/http"
)

// authServerMetadata is RFC 8414 metadata plus the MCP client_id metadata document flag.
type authServerMetadata struct {
	Issuer                            string   `json:"issuer"`
	AuthorizationEndpoint             string   `json:"authorization_endpoint"`
	TokenEndpoint                     string   `json:"token_endpoint"`
	ResponseTypesSupported            []string `json:"response_types_supported"`
	GrantTypesSupported               []string `json:"grant_types_supported"`
	CodeChallengeMethodsSupported     []string `json:"code_challenge_methods_supported"`
	TokenEndpointAuthMethodsSupported []string `json:"token_endpoint_auth_methods_supported"`
	ScopesSupported                   []string `json:"scopes_supported"`
	ClientIDMetadataDocumentSupported bool     `json:"client_id_metadata_document_supported"`
	AuthorizationResponseIssParameter bool     `json:"authorization_response_iss_parameter_supported"`
}

func (s *Server) handleAuthServerMetadata(w http.ResponseWriter, r *http.Request) {
	allowAnyOrigin(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	writeJSON(w, http.StatusOK, authServerMetadata{
		Issuer:                            s.cfg.BaseURL,
		AuthorizationEndpoint:             s.cfg.BaseURL + authorizePath,
		TokenEndpoint:                     s.cfg.BaseURL + tokenPath,
		ResponseTypesSupported:            []string{"code"},
		GrantTypesSupported:               []string{"authorization_code", "refresh_token"},
		CodeChallengeMethodsSupported:     []string{"S256"},
		TokenEndpointAuthMethodsSupported: []string{"none"},
		ScopesSupported:                   []string{scopeMCP},
		ClientIDMetadataDocumentSupported: true,
		AuthorizationResponseIssParameter: true,
	})
}

// allowAnyOrigin is safe here: discovery and token endpoints use no cookies or ambient credentials.
func allowAnyOrigin(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
