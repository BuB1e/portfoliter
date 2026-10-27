package mcpserver_test

import (
	"context"
	"strings"
	"testing"

	"github.com/modelcontextprotocol/go-sdk/mcp"

	"portfoliter-go/internal/admin"
	"portfoliter-go/internal/mcpserver"
	"portfoliter-go/internal/testdb"
)

func TestMain(m *testing.M) { testdb.Main(m) }

// connect runs the real tool set over an in-memory transport; file and session tools are unused here.
func connect(t *testing.T, store *admin.Store) *mcp.ClientSession {
	t.Helper()
	ctx := context.Background()
	server := mcpserver.New(store, nil, nil, nil)
	clientTransport, serverTransport := mcp.NewInMemoryTransports()
	if _, err := server.Connect(ctx, serverTransport, nil); err != nil {
		t.Fatalf("server connect: %v", err)
	}
	client := mcp.NewClient(&mcp.Implementation{Name: "test"}, nil)
	session, err := client.Connect(ctx, clientTransport, nil)
	if err != nil {
		t.Fatalf("client connect: %v", err)
	}
	t.Cleanup(func() { session.Close() })
	return session
}

func callTool(t *testing.T, session *mcp.ClientSession, name string, args map[string]any) *mcp.CallToolResult {
	t.Helper()
	res, err := session.CallTool(context.Background(), &mcp.CallToolParams{Name: name, Arguments: args})
	if err != nil {
		t.Fatalf("call %s: %v", name, err)
	}
	return res
}

func resultText(res *mcp.CallToolResult) string {
	var parts []string
	for _, c := range res.Content {
		if text, ok := c.(*mcp.TextContent); ok {
			parts = append(parts, text.Text)
		}
	}
	return strings.Join(parts, "\n")
}

func TestUpsertProjectToolDescribesUniversity(t *testing.T) {
	session := connect(t, admin.NewStore(nil))

	tools, err := session.ListTools(context.Background(), nil)
	if err != nil {
		t.Fatal(err)
	}

	for _, tool := range tools.Tools {
		if tool.Name != "upsert_project" {
			continue
		}
		schema, _ := tool.InputSchema.(map[string]any)
		props, _ := schema["properties"].(map[string]any)
		if _, ok := props["educationId"]; !ok {
			t.Fatalf("upsert_project schema has no educationId: %v", props)
		}
		if !strings.Contains(tool.Description, "UNIVERSITY") || !strings.Contains(tool.Description, "200") {
			t.Fatalf("upsert_project description does not mention UNIVERSITY and the summary limit: %q", tool.Description)
		}
		return
	}
	t.Fatal("upsert_project tool not registered")
}

func TestUpsertUniversityProjectThroughMCP(t *testing.T) {
	ctx := context.Background()
	pool := testdb.Migrated(t)
	store := admin.NewStore(pool)
	session := connect(t, store)
	educationID, err := store.UpsertEducation(ctx, admin.EducationInput{Institution: "Kasetsart University"})
	if err != nil {
		t.Fatal(err)
	}

	res := callTool(t, session, "upsert_project", map[string]any{
		"slug": "growthcheck", "title": "GrowthCheck", "projectType": "UNIVERSITY",
		"educationId": educationID, "summary": "Senior project.", "content": "## Detail\n\n- LSTM growth risk",
		"skills": []string{"LSTM", "TypeScript"},
	})

	if res.IsError {
		t.Fatalf("upsert_project failed: %s", resultText(res))
	}
	var projectType string
	var linked int64
	err = pool.QueryRow(ctx, `SELECT project_type::text, education_id FROM portfoliter.projects WHERE slug = 'growthcheck'`).
		Scan(&projectType, &linked)
	if err != nil {
		t.Fatal(err)
	}
	if projectType != "UNIVERSITY" || linked != educationID {
		t.Fatalf("saved (%s, %d), want (UNIVERSITY, %d)", projectType, linked, educationID)
	}
	var logged int
	err = pool.QueryRow(ctx, `SELECT count(*) FROM portfoliter.change_log
		WHERE entity_type = 'project' AND action = 'create'
		  AND after->>'project_type' = 'UNIVERSITY' AND (after->>'education_id')::bigint = $1`, educationID).Scan(&logged)
	if err != nil {
		t.Fatal(err)
	}
	if logged != 1 {
		t.Fatalf("change_log create entries = %d, want 1", logged)
	}
	if text := resultText(callTool(t, session, "get_portfolio", nil)); !strings.Contains(text, `"education_id": `) {
		t.Fatalf("get_portfolio does not show education_id: %s", text)
	}
}

func TestUpsertProjectThroughMCPRejectsWrongLinks(t *testing.T) {
	session := connect(t, admin.NewStore(nil))

	res := callTool(t, session, "upsert_project", map[string]any{
		"slug": "x", "title": "X", "projectType": "PERSONAL", "educationId": 1,
	})

	if !res.IsError || !strings.Contains(resultText(res), "educationId is only allowed") {
		t.Fatalf("result = %+v (%s), want an educationId error", res, resultText(res))
	}
}
