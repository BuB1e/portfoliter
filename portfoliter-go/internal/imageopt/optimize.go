package imageopt

import (
	"bytes"
	"fmt"
	"image"
	_ "image/gif" // register decoder
	"image/jpeg"
	"image/png"

	"github.com/disintegration/imaging"
	_ "golang.org/x/image/webp" // register decoder
)

const (
	jpegQuality = 82
	maxPixels   = 50_000_000
)

type Result struct {
	Data        []byte
	ContentType string
	Extension   string
}

// Optimize re-encodes an image, which drops all metadata (EXIF, XMP, comments).
// EXIF orientation is applied first. JPEG stays JPEG; everything else becomes PNG.
func Optimize(data []byte) (Result, error) {
	cfg, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return Result{}, fmt.Errorf("read image header: %w", err)
	}
	if cfg.Width*cfg.Height > maxPixels {
		return Result{}, fmt.Errorf("image is %dx%d; max %d pixels", cfg.Width, cfg.Height, maxPixels)
	}

	img, err := imaging.Decode(bytes.NewReader(data), imaging.AutoOrientation(true))
	if err != nil {
		return Result{}, fmt.Errorf("decode image: %w", err)
	}

	var buf bytes.Buffer
	if format == "jpeg" {
		if err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: jpegQuality}); err != nil {
			return Result{}, fmt.Errorf("encode jpeg: %w", err)
		}
		return Result{Data: buf.Bytes(), ContentType: "image/jpeg", Extension: "jpg"}, nil
	}

	encoder := png.Encoder{CompressionLevel: png.BestCompression}
	if err := encoder.Encode(&buf, img); err != nil {
		return Result{}, fmt.Errorf("encode png: %w", err)
	}
	return Result{Data: buf.Bytes(), ContentType: "image/png", Extension: "png"}, nil
}
