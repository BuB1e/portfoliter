package uploads

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"path"
	"strings"

	"portfoliter-go/internal/imageopt"
	"portfoliter-go/internal/storage"
)

const maxUploadBytes = 20 << 20 // 20 MB

type Result struct {
	Key          string `json:"key"`
	ContentType  string `json:"contentType"`
	Size         int    `json:"size"`
	OriginalSize int    `json:"originalSize"`
}

type Service struct {
	files *storage.R2
}

func NewService(files *storage.R2) *Service {
	return &Service{files: files}
}

// Finalize moves a staged upload to its final key. Images are optimized (metadata stripped,
// recompressed); PDFs are moved unchanged. The staged object is deleted either way.
func (s *Service) Finalize(ctx context.Context, incomingKey string) (Result, error) {
	rest, ok := strings.CutPrefix(incomingKey, storage.IncomingPrefix)
	kind, name, hasKind := strings.Cut(rest, "/")
	if !ok || !hasKind || name == "" {
		return Result{}, fmt.Errorf("key must look like %s<kind>/<name>", storage.IncomingPrefix)
	}

	data, err := s.files.Get(ctx, incomingKey, maxUploadBytes)
	if err != nil {
		return Result{}, err
	}

	out, err := process(kind, data)
	if err != nil {
		s.discard(ctx, incomingKey)
		return Result{}, err
	}

	finalKey := fmt.Sprintf("%s/%s.%s", kind, strings.TrimSuffix(name, path.Ext(name)), out.Extension)
	if err := s.files.Put(ctx, finalKey, out.ContentType, out.Data); err != nil {
		return Result{}, err
	}
	s.discard(ctx, incomingKey)

	return Result{
		Key:          finalKey,
		ContentType:  out.ContentType,
		Size:         len(out.Data),
		OriginalSize: len(data),
	}, nil
}

// process checks the real (sniffed) type against the kind, then optimizes images.
func process(kind string, data []byte) (imageopt.Result, error) {
	sniffed := http.DetectContentType(data)
	ext, err := storage.ValidateType(kind, sniffed)
	if err != nil {
		return imageopt.Result{}, fmt.Errorf("uploaded file: %w", err)
	}
	if !strings.HasPrefix(sniffed, "image/") {
		return imageopt.Result{Data: data, ContentType: sniffed, Extension: ext}, nil
	}
	return imageopt.Optimize(data)
}

// discard deletes a staged upload; a leftover is harmless, so failures are only logged.
func (s *Service) discard(ctx context.Context, key string) {
	if err := s.files.Delete(ctx, key); err != nil {
		slog.WarnContext(ctx, "delete staged upload", "key", key, "err", err)
	}
}
