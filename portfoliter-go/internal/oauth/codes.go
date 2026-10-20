package oauth

import (
	"sync"
	"time"
)

const codeTTL = 60 * time.Second

// grant is what an authorization code stands for until it is exchanged.
type grant struct {
	clientID      string
	redirectURI   string
	codeChallenge string
	expiresAt     time.Time
}

// codeStore keeps authorization codes in memory: short-lived, single use, one backend instance.
type codeStore struct {
	mu    sync.Mutex
	now   func() time.Time
	items map[string]grant
}

func newCodeStore(now func() time.Time) *codeStore {
	return &codeStore{now: now, items: map[string]grant{}}
}

func (c *codeStore) put(code string, g grant) {
	c.mu.Lock()
	defer c.mu.Unlock()
	now := c.now()
	for k, v := range c.items {
		if !v.expiresAt.After(now) {
			delete(c.items, k)
		}
	}
	g.expiresAt = now.Add(codeTTL)
	c.items[code] = g
}

// take returns the grant and removes it, so a code works at most once.
func (c *codeStore) take(code string) (grant, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	g, ok := c.items[code]
	delete(c.items, code)
	if !ok || !g.expiresAt.After(c.now()) {
		return grant{}, false
	}
	return g, true
}
