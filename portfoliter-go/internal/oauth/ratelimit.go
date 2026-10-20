package oauth

import (
	"net"
	"net/http"
	"sync"
	"time"
)

const (
	maxFailedSignIns = 5
	failureWindow    = 15 * time.Minute
)

type failures struct {
	count int
	since time.Time
}

// limiter blocks an IP after too many wrong keys within the window.
type limiter struct {
	mu   sync.Mutex
	now  func() time.Time
	byIP map[string]failures
}

func newLimiter(now func() time.Time) *limiter {
	return &limiter{now: now, byIP: map[string]failures{}}
}

func (l *limiter) allowed(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	f, ok := l.byIP[ip]
	if !ok {
		return true
	}
	if l.now().Sub(f.since) >= failureWindow {
		delete(l.byIP, ip)
		return true
	}
	return f.count < maxFailedSignIns
}

func (l *limiter) fail(ip string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	f, ok := l.byIP[ip]
	if !ok || l.now().Sub(f.since) >= failureWindow {
		f = failures{since: l.now()}
	}
	f.count++
	l.byIP[ip] = f
}

func (l *limiter) reset(ip string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.byIP, ip)
}

// clientIP prefers X-Real-IP, which nginx sets from the Cloudflare-restored client address.
func clientIP(r *http.Request) string {
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
