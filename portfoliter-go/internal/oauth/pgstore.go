package oauth

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PGStore struct {
	pool *pgxpool.Pool
}

func NewPGStore(pool *pgxpool.Pool) *PGStore {
	return &PGStore{pool: pool}
}

func (s *PGStore) Insert(ctx context.Context, tokens ...Token) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck // no-op after commit

	if _, err := tx.Exec(ctx, `DELETE FROM portfoliter.oauth_tokens WHERE expires_at < now()`); err != nil {
		return fmt.Errorf("delete expired tokens: %w", err)
	}
	const insert = `
		INSERT INTO portfoliter.oauth_tokens (token_hash, kind, client_id, expires_at)
		VALUES ($1, $2, $3, $4)`
	for _, t := range tokens {
		if _, err := tx.Exec(ctx, insert, t.Hash[:], t.Kind, t.ClientID, t.ExpiresAt); err != nil {
			return fmt.Errorf("insert %s token: %w", t.Kind, err)
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	return nil
}

func (s *PGStore) Lookup(ctx context.Context, hash [32]byte) (Token, error) {
	const query = `
		SELECT kind, client_id, expires_at
		FROM portfoliter.oauth_tokens
		WHERE token_hash = $1`
	t := Token{Hash: hash}
	err := s.pool.QueryRow(ctx, query, hash[:]).Scan(&t.Kind, &t.ClientID, &t.ExpiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Token{}, ErrTokenNotFound
	}
	if err != nil {
		return Token{}, fmt.Errorf("lookup token: %w", err)
	}
	return t, nil
}

func (s *PGStore) Delete(ctx context.Context, hash [32]byte) (bool, error) {
	tag, err := s.pool.Exec(ctx, `DELETE FROM portfoliter.oauth_tokens WHERE token_hash = $1`, hash[:])
	if err != nil {
		return false, fmt.Errorf("delete token: %w", err)
	}
	return tag.RowsAffected() == 1, nil
}

// DeleteAll removes every OAuth token and records it in change_log in the same transaction.
func (s *PGStore) DeleteAll(ctx context.Context) (int64, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck // no-op after commit

	tag, err := tx.Exec(ctx, `DELETE FROM portfoliter.oauth_tokens`)
	if err != nil {
		return 0, fmt.Errorf("delete tokens: %w", err)
	}
	const logQuery = `
		INSERT INTO portfoliter.change_log (entity_type, action, after)
		VALUES ('oauth_session', 'revoke_all', jsonb_build_object('tokensRemoved', $1::bigint))`
	if _, err := tx.Exec(ctx, logQuery, tag.RowsAffected()); err != nil {
		return 0, fmt.Errorf("write change log: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("commit: %w", err)
	}
	return tag.RowsAffected(), nil
}
