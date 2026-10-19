package mcpserver

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/modelcontextprotocol/go-sdk/mcp"

	"portfoliter-go/internal/admin"
	"portfoliter-go/internal/storage"
	"portfoliter-go/internal/uploads"
)

type uploadInput struct {
	Kind        string `json:"kind" jsonschema:"avatar, cover, resume or file"`
	ContentType string `json:"contentType" jsonschema:"image/png, image/jpeg, image/webp, image/gif (avatar/cover/file) or application/pdf (resume/file)"`
}

type listFilesInput struct {
	Prefix string `json:"prefix,omitempty" jsonschema:"e.g. cover/ to list only covers; omit for all"`
}

type fileKeyInput struct {
	Key string `json:"key" jsonschema:"R2 object key, e.g. cover/3f2a....png"`
}

func addFileTools(s *mcp.Server, store *admin.Store, files *storage.R2, finalizer *uploads.Service) {
	mcp.AddTool(s, &mcp.Tool{
		Name:        "create_upload_url",
		Description: "Get a short-lived presigned PUT URL and a staging key (incoming/...). Call finalize_upload after the PUT.",
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in uploadInput) (*mcp.CallToolResult, any, error) {
		upload, err := files.PresignUpload(ctx, in.Kind, in.ContentType)
		if err != nil {
			return nil, nil, err
		}
		return jsonResult(upload)
	})
	mcp.AddTool(s, &mcp.Tool{
		Name: "finalize_upload",
		Description: "Process an uploaded staging key: images get metadata stripped and are recompressed " +
			"(JPEG stays JPEG, others become PNG); PDFs are kept as-is. Returns the final key to save.",
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in fileKeyInput) (*mcp.CallToolResult, any, error) {
		result, err := finalizer.Finalize(ctx, in.Key)
		if err != nil {
			return nil, nil, err
		}
		return jsonResult(result)
	})
	mcp.AddTool(s, &mcp.Tool{
		Name:        "list_files",
		Description: "List uploaded files in the bucket.",
		Annotations: &mcp.ToolAnnotations{ReadOnlyHint: true},
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in listFilesInput) (*mcp.CallToolResult, any, error) {
		objects, err := files.List(ctx, in.Prefix)
		if err != nil {
			return nil, nil, err
		}
		return jsonResult(objects)
	})
	mcp.AddTool(s, &mcp.Tool{
		Name:        "get_file_url",
		Description: "Short-lived download URL to view a stored file.",
		Annotations: &mcp.ToolAnnotations{ReadOnlyHint: true},
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in fileKeyInput) (*mcp.CallToolResult, any, error) {
		url, err := files.PresignGet(ctx, in.Key)
		if err != nil {
			return nil, nil, err
		}
		return textResult(url), nil, nil
	})
	destructive := true
	mcp.AddTool(s, &mcp.Tool{
		Name:        "delete_file",
		Description: "Permanently delete a file. Refused while a profile or project still uses it. Confirm with the owner first.",
		Annotations: &mcp.ToolAnnotations{DestructiveHint: &destructive},
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in fileKeyInput) (*mcp.CallToolResult, any, error) {
		referenced, err := store.IsFileReferenced(ctx, in.Key)
		if err != nil {
			return nil, nil, err
		}
		if referenced {
			return nil, nil, fmt.Errorf("%s is still used by the profile or a project; clear that field first", in.Key)
		}
		if err := files.Delete(ctx, in.Key); err != nil {
			return nil, nil, err
		}
		return textResult("deleted " + in.Key), nil, nil
	})
}

func jsonResult(v any) (*mcp.CallToolResult, any, error) {
	b, err := json.Marshal(v)
	if err != nil {
		return nil, nil, fmt.Errorf("encode result: %w", err)
	}
	return textResult(string(b)), nil, nil
}
