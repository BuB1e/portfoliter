package storage

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// IncomingPrefix holds raw uploads until they are finalized (optimized and moved to kind/...).
const IncomingPrefix = "incoming/"

// File kinds and the content types each accepts. The extension is derived from the content type.
var (
	extensions = map[string]string{
		"image/png":       "png",
		"image/jpeg":      "jpg",
		"image/webp":      "webp",
		"image/gif":       "gif",
		"application/pdf": "pdf",
	}
	imageTypes = []string{"image/png", "image/jpeg", "image/webp", "image/gif"}
	kindTypes  = map[string][]string{
		"avatar": imageTypes,
		"cover":  imageTypes,
		"resume": {"application/pdf"},
		"file":   append(append([]string{}, imageTypes...), "application/pdf"),
	}
)

type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	GetURLTTL       time.Duration
	PutURLTTL       time.Duration
}

type Upload struct {
	Key         string    `json:"key"`
	Method      string    `json:"method"`
	URL         string    `json:"uploadUrl"`
	ContentType string    `json:"contentType"`
	ExpiresAt   time.Time `json:"expiresAt"`
}

type Object struct {
	Key          string    `json:"key"`
	Size         int64     `json:"size"`
	LastModified time.Time `json:"lastModified"`
}

// R2 talks to a private Cloudflare R2 bucket through its S3-compatible API.
type R2 struct {
	client  *s3.Client
	presign *s3.PresignClient
	bucket  string
	getTTL  time.Duration
	putTTL  time.Duration
}

func NewR2(cfg R2Config) *R2 {
	client := s3.New(s3.Options{
		Region:       "auto",
		BaseEndpoint: aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID)),
		Credentials:  credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		// Default checksums would be signed into presigned PUT URLs, which plain curl uploads cannot satisfy.
		RequestChecksumCalculation: aws.RequestChecksumCalculationWhenRequired,
		ResponseChecksumValidation: aws.ResponseChecksumValidationWhenRequired,
	})
	return &R2{
		client:  client,
		presign: s3.NewPresignClient(client),
		bucket:  cfg.Bucket,
		getTTL:  cfg.GetURLTTL,
		putTTL:  cfg.PutURLTTL,
	}
}

// PresignGet returns a short-lived download URL for key.
func (r *R2) PresignGet(ctx context.Context, key string) (string, error) {
	req, err := r.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(r.getTTL))
	if err != nil {
		return "", fmt.Errorf("presign get %s: %w", key, err)
	}
	return req.URL, nil
}

// PresignUpload creates a staging key (IncomingPrefix/kind/id.ext) and a PUT URL that only accepts contentType.
func (r *R2) PresignUpload(ctx context.Context, kind, contentType string) (Upload, error) {
	ext, err := ValidateType(kind, contentType)
	if err != nil {
		return Upload{}, err
	}
	id, err := randomID()
	if err != nil {
		return Upload{}, err
	}
	key := fmt.Sprintf("%s%s/%s.%s", IncomingPrefix, kind, id, ext)

	req, err := r.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(r.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(r.putTTL))
	if err != nil {
		return Upload{}, fmt.Errorf("presign put %s: %w", key, err)
	}
	return Upload{
		Key:         key,
		Method:      req.Method,
		URL:         req.URL,
		ContentType: contentType,
		ExpiresAt:   time.Now().Add(r.putTTL),
	}, nil
}

// Get reads a whole object, refusing objects larger than maxBytes.
func (r *R2) Get(ctx context.Context, key string, maxBytes int64) ([]byte, error) {
	out, err := r.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, fmt.Errorf("get %s: %w", key, err)
	}
	defer out.Body.Close()

	if aws.ToInt64(out.ContentLength) > maxBytes {
		return nil, fmt.Errorf("%s is larger than %d bytes", key, maxBytes)
	}
	data, err := io.ReadAll(io.LimitReader(out.Body, maxBytes+1))
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", key, err)
	}
	if int64(len(data)) > maxBytes {
		return nil, fmt.Errorf("%s is larger than %d bytes", key, maxBytes)
	}
	return data, nil
}

func (r *R2) Put(ctx context.Context, key, contentType string, data []byte) error {
	_, err := r.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(r.bucket),
		Key:           aws.String(key),
		Body:          bytes.NewReader(data),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(int64(len(data))),
	})
	if err != nil {
		return fmt.Errorf("put %s: %w", key, err)
	}
	return nil
}

func (r *R2) List(ctx context.Context, prefix string) ([]Object, error) {
	objects := []Object{}
	paginator := s3.NewListObjectsV2Paginator(r.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(r.bucket),
		Prefix: aws.String(prefix),
	})
	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, fmt.Errorf("list objects: %w", err)
		}
		for _, o := range page.Contents {
			objects = append(objects, Object{
				Key:          aws.ToString(o.Key),
				Size:         aws.ToInt64(o.Size),
				LastModified: aws.ToTime(o.LastModified),
			})
		}
	}
	return objects, nil
}

func (r *R2) Delete(ctx context.Context, key string) error {
	_, err := r.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("delete %s: %w", key, err)
	}
	return nil
}

// ValidateType checks contentType is allowed for kind and returns its file extension.
func ValidateType(kind, contentType string) (string, error) {
	allowed, ok := kindTypes[kind]
	if !ok {
		return "", errors.New("kind must be one of: avatar, cover, resume, file")
	}
	for _, t := range allowed {
		if t == contentType {
			return extensions[contentType], nil
		}
	}
	return "", fmt.Errorf("content type %q not allowed for %s; allowed: %v", contentType, kind, allowed)
}

func randomID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("generate key: %w", err)
	}
	return hex.EncodeToString(b), nil
}
