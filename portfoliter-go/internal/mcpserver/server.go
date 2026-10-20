package mcpserver

import (
	"context"
	"fmt"

	"github.com/modelcontextprotocol/go-sdk/mcp"

	"portfoliter-go/internal/admin"
	"portfoliter-go/internal/storage"
	"portfoliter-go/internal/uploads"
)

const instructions = `Edits the owner's personal portfolio.
Always call get_portfolio first to see current rows and their ids.
Upsert tools replace the whole row: send every field you want to keep. Omit id to create, pass id to update.
New experiences, projects, education, certifications and sections are created as drafts (not visible on the site);
call set_published after the owner confirms. Profile, links and skills are always visible.
Every write is recorded; list_changes shows recent edits.
list_themes shows every site design and which one is live. set_theme switches the whole design
and is live immediately; confirm with the owner first.
Files (avatar, project cover, resume) live in a private R2 bucket:
1. call create_upload_url;
2. upload with an HTTP PUT to uploadUrl sending the exact Content-Type returned
   (e.g. curl -X PUT -H "Content-Type: <type>" --data-binary @file "<uploadUrl>");
3. call finalize_upload with the returned staging key (strips image metadata, recompresses);
4. save the FINAL key from finalize_upload in avatarKey, coverKey or resumeKey.`

const defaultChangeLimit = 20

type entityRef struct {
	EntityType string `json:"entityType" jsonschema:"one of: link, experience, project, skill, education, certification, section"`
	ID         int64  `json:"id"`
}

type publishInput struct {
	EntityType string `json:"entityType" jsonschema:"one of: experience, project, education, certification, section"`
	ID         int64  `json:"id"`
	Published  bool   `json:"published" jsonschema:"true to show on the site, false to hide"`
}

type reorderInput struct {
	EntityType string  `json:"entityType" jsonschema:"one of: link, experience, project, skill, education, certification, section"`
	IDs        []int64 `json:"ids" jsonschema:"ids in the desired display order"`
}

type listChangesInput struct {
	Limit int `json:"limit,omitempty" jsonschema:"max entries, default 20"`
}

type noInput struct{}

// SessionRevoker signs out every OAuth client (Claude web connectors).
type SessionRevoker interface {
	DeleteAll(ctx context.Context) (int64, error)
}

// New builds the MCP server whose tools write through the admin store and R2.
func New(store *admin.Store, files *storage.R2, finalizer *uploads.Service, sessions SessionRevoker) *mcp.Server {
	s := mcp.NewServer(&mcp.Implementation{Name: "portfoliter", Version: "0.1.0"},
		&mcp.ServerOptions{Instructions: instructions})
	addFileTools(s, store, files, finalizer)
	addSessionTools(s, sessions)

	readOnly := &mcp.ToolAnnotations{ReadOnlyHint: true}
	destructive := true
	mcp.AddTool(s, &mcp.Tool{
		Name:        "get_portfolio",
		Description: "All portfolio rows including drafts, with ids, is_published and skills.",
		Annotations: readOnly,
	}, func(ctx context.Context, _ *mcp.CallToolRequest, _ noInput) (*mcp.CallToolResult, any, error) {
		out, err := store.GetAll(ctx)
		return textResult(out), nil, err
	})
	mcp.AddTool(s, &mcp.Tool{
		Name:        "get_item",
		Description: "One row by entity type and id, drafts included (projects and experiences include skills).",
		Annotations: readOnly,
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in entityRef) (*mcp.CallToolResult, any, error) {
		out, err := store.GetItem(ctx, in.EntityType, in.ID)
		if err != nil {
			return nil, nil, err
		}
		return textResult(out), nil, nil
	})
	mcp.AddTool(s, &mcp.Tool{
		Name:        "list_changes",
		Description: "Recent edits with before/after snapshots, newest first.",
		Annotations: readOnly,
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in listChangesInput) (*mcp.CallToolResult, any, error) {
		limit := in.Limit
		if limit <= 0 {
			limit = defaultChangeLimit
		}
		out, err := store.ListChanges(ctx, limit)
		return textResult(out), nil, err
	})

	addSave(s, "set_profile", "Create or replace the single profile row (always visible).", store.SetProfile)
	mcp.AddTool(s, &mcp.Tool{
		Name:        "delete_profile",
		Description: "Delete the profile row; the site shows 'No portfolio published yet' until set_profile runs again. Confirm with the owner first.",
		Annotations: &mcp.ToolAnnotations{DestructiveHint: &destructive},
	}, func(ctx context.Context, _ *mcp.CallToolRequest, _ noInput) (*mcp.CallToolResult, any, error) {
		if err := store.DeleteProfile(ctx); err != nil {
			return nil, nil, err
		}
		return textResult("deleted profile"), nil, nil
	})
	mcp.AddTool(s, &mcp.Tool{
		Name:        "list_themes",
		Description: "Every site design (key, name, description) with isActive marking the live one.",
		Annotations: readOnly,
	}, func(ctx context.Context, _ *mcp.CallToolRequest, _ noInput) (*mcp.CallToolResult, any, error) {
		out, err := store.ListThemes(ctx)
		return textResult(out), nil, err
	})
	addSave(s, "set_theme", "Switch the whole site design to a key from list_themes. Live on the next page load. Confirm with the owner first.", store.SetTheme)
	addSave(s, "upsert_link", "Create or replace a social/contact link (always visible).", store.UpsertLink)
	addSave(s, "upsert_experience", "Create (as draft) or replace a work experience.", store.UpsertExperience)
	addSave(s, "upsert_project", "Create (as draft) or replace a project. WORK projects may link an experienceId.", store.UpsertProject)
	addSave(s, "upsert_skill", "Create or rename/recategorize a skill (always visible).", store.UpsertSkill)
	addSave(s, "upsert_education", "Create (as draft) or replace an education entry.", store.UpsertEducation)
	addSave(s, "upsert_certification", "Create (as draft) or replace a certification.", store.UpsertCertification)
	addSave(s, "upsert_section", "Create (as draft) or replace a free-form section such as awards or talks.", store.UpsertSection)

	mcp.AddTool(s, &mcp.Tool{
		Name:        "set_published",
		Description: "Show or hide an item on the site. Confirm with the owner before publishing.",
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in publishInput) (*mcp.CallToolResult, any, error) {
		if err := store.SetPublished(ctx, in.EntityType, in.ID, in.Published); err != nil {
			return nil, nil, err
		}
		return textResult(fmt.Sprintf("%s %d published=%t", in.EntityType, in.ID, in.Published)), nil, nil
	})
	mcp.AddTool(s, &mcp.Tool{
		Name:        "reorder",
		Description: "Set the display order of items of one type.",
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in reorderInput) (*mcp.CallToolResult, any, error) {
		if err := store.Reorder(ctx, in.EntityType, in.IDs); err != nil {
			return nil, nil, err
		}
		return textResult(fmt.Sprintf("reordered %d %s items", len(in.IDs), in.EntityType)), nil, nil
	})
	mcp.AddTool(s, &mcp.Tool{
		Name:        "delete_item",
		Description: "Permanently delete an item. Prefer set_published false to hide. Confirm with the owner first.",
		Annotations: &mcp.ToolAnnotations{DestructiveHint: &destructive},
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in entityRef) (*mcp.CallToolResult, any, error) {
		if err := store.Delete(ctx, in.EntityType, in.ID); err != nil {
			return nil, nil, err
		}
		return textResult(fmt.Sprintf("deleted %s %d", in.EntityType, in.ID)), nil, nil
	})
	return s
}

func addSave[In any](s *mcp.Server, name, description string, save func(context.Context, In) (int64, error)) {
	mcp.AddTool(s, &mcp.Tool{Name: name, Description: description},
		func(ctx context.Context, _ *mcp.CallToolRequest, in In) (*mcp.CallToolResult, any, error) {
			id, err := save(ctx, in)
			if err != nil {
				return nil, nil, err
			}
			return textResult(fmt.Sprintf("saved id=%d", id)), nil, nil
		})
}

func textResult(text string) *mcp.CallToolResult {
	return &mcp.CallToolResult{Content: []mcp.Content{&mcp.TextContent{Text: text}}}
}
