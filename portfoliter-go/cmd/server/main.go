package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"github.com/modelcontextprotocol/go-sdk/mcp"

	"portfoliter-go/internal/admin"
	"portfoliter-go/internal/config"
	"portfoliter-go/internal/httpapi"
	"portfoliter-go/internal/mcpserver"
	"portfoliter-go/internal/migrations"
	"portfoliter-go/internal/oauth"
	"portfoliter-go/internal/portfolio"
	"portfoliter-go/internal/storage"
	"portfoliter-go/internal/uploads"
)

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped", "err", err)
		os.Exit(1)
	}
}

func run() error {
	// Local dev convenience; real env vars take precedence.
	_ = godotenv.Load(".env.local")

	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("create db pool: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping db: %w", err)
	}

	db := stdlib.OpenDBFromPool(pool)
	defer db.Close()
	if err := migrations.Up(ctx, db); err != nil {
		return err
	}

	files := storage.NewR2(cfg.R2)
	oauthStore := oauth.NewPGStore(pool)
	mcpServer := mcpserver.New(admin.NewStore(pool), files, uploads.NewService(files), oauthStore)
	mcpHandler := mcp.NewStreamableHTTPHandler(func(*http.Request) *mcp.Server { return mcpServer },
		&mcp.StreamableHTTPOptions{
			Stateless: true,
			// /mcp requires the write key or an OAuth token, which already blocks DNS-rebinding callers;
			// keeping the check would reject requests forwarded by a local reverse proxy.
			DisableLocalhostProtection: true,
		})
	mcpAuth := oauth.NewServer(oauth.Config{
		BaseURL:      cfg.PublicBaseURL,
		OwnerKeyHash: cfg.APIWriteKeyHash,
	}, oauthStore, oauth.NewCIMDFetcher(cfg.OAuthAllowedClientHosts, nil))

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           httpapi.NewHandler(portfolio.NewStore(pool, files), mcpHandler, cfg.APIReadKeyHash, mcpAuth),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := srv.Shutdown(shutdownCtx); err != nil {
			slog.Error("shutdown", "err", err)
		}
	}()

	slog.Info("listening", "port", cfg.Port)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("listen: %w", err)
	}
	return nil
}
