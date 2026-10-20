package config

import (
	"encoding/hex"
	"fmt"
	"net"
	"net/url"
	"os"
	"strings"
	"time"

	"portfoliter-go/internal/storage"
)

const (
	defaultGetURLTTL           = time.Hour
	defaultPutURLTTL           = 15 * time.Minute
	defaultOAuthAllowedClients = "claude.ai,claude.com"
)

type Config struct {
	Port            string
	DatabaseURL     string
	APIReadKeyHash  [32]byte
	APIWriteKeyHash [32]byte
	R2              storage.R2Config
	// PublicBaseURL is the site origin clients see, e.g. https://portfolio.haritsom.com (no trailing slash).
	PublicBaseURL string
	// OAuthAllowedClientHosts are the only hosts whose client_id metadata documents may sign in.
	OAuthAllowedClientHosts []string
}

// Load reads config from the process environment and fails on missing keys.
func Load() (Config, error) {
	var missing []string
	get := func(key string) string {
		v := os.Getenv(key)
		if v == "" {
			missing = append(missing, key)
		}
		return v
	}

	port := get("APP_PORT")
	host := get("DB_HOST")
	dbPort := get("DB_PORT")
	user := get("DB_USER")
	password := get("DB_PASSWORD")
	name := get("DB_NAME")
	sslMode := get("DB_SSLMODE")
	readKeyHex := get("API_READ_KEY_SHA256")
	writeKeyHex := get("API_WRITE_KEY_SHA256")
	r2 := storage.R2Config{
		AccountID:       get("R2_ACCOUNT_ID"),
		AccessKeyID:     get("R2_ACCESS_KEY_ID"),
		SecretAccessKey: get("R2_SECRET_ACCESS_KEY"),
		Bucket:          get("R2_BUCKET"),
	}
	publicBaseURL := get("PUBLIC_BASE_URL")
	if len(missing) > 0 {
		return Config{}, fmt.Errorf("missing env vars: %v", missing)
	}

	readKeyHash, err := decodeHash("API_READ_KEY_SHA256", readKeyHex)
	if err != nil {
		return Config{}, err
	}
	writeKeyHash, err := decodeHash("API_WRITE_KEY_SHA256", writeKeyHex)
	if err != nil {
		return Config{}, err
	}
	if readKeyHash == writeKeyHash {
		return Config{}, fmt.Errorf("read and write keys must differ")
	}
	if r2.GetURLTTL, err = optionalDuration("R2_GET_URL_TTL", defaultGetURLTTL); err != nil {
		return Config{}, err
	}
	if r2.PutURLTTL, err = optionalDuration("R2_PUT_URL_TTL", defaultPutURLTTL); err != nil {
		return Config{}, err
	}
	if publicBaseURL, err = parseBaseURL(publicBaseURL); err != nil {
		return Config{}, err
	}

	dsn := url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(user, password),
		Host:     net.JoinHostPort(host, dbPort),
		Path:     name,
		RawQuery: url.Values{"sslmode": {sslMode}}.Encode(),
	}

	return Config{
		Port:            port,
		DatabaseURL:     dsn.String(),
		APIReadKeyHash:  readKeyHash,
		APIWriteKeyHash: writeKeyHash,
		R2:              r2,
		PublicBaseURL:   publicBaseURL,
		OAuthAllowedClientHosts: splitList(
			optionalString("OAUTH_ALLOWED_CLIENT_HOSTS", defaultOAuthAllowedClients)),
	}, nil
}

// parseBaseURL accepts an absolute http(s) origin and strips any trailing slash.
func parseBaseURL(raw string) (string, error) {
	u, err := url.Parse(raw)
	if err != nil || (u.Scheme != "https" && u.Scheme != "http") || u.Host == "" {
		return "", fmt.Errorf("PUBLIC_BASE_URL must be an absolute URL like https://example.com")
	}
	return strings.TrimRight(raw, "/"), nil
}

func optionalString(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitList(csv string) []string {
	var out []string
	for _, part := range strings.Split(csv, ",") {
		if part = strings.TrimSpace(part); part != "" {
			out = append(out, part)
		}
	}
	return out
}

func optionalDuration(key string, fallback time.Duration) (time.Duration, error) {
	v := os.Getenv(key)
	if v == "" {
		return fallback, nil
	}
	d, err := time.ParseDuration(v)
	if err != nil || d <= 0 {
		return 0, fmt.Errorf("%s must be a positive duration like 1h or 15m", key)
	}
	return d, nil
}

func decodeHash(key, value string) ([32]byte, error) {
	b, err := hex.DecodeString(value)
	if err != nil || len(b) != 32 {
		return [32]byte{}, fmt.Errorf("%s must be 64 hex chars", key)
	}
	return [32]byte(b), nil
}
