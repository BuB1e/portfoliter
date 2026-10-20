package mcpserver

import (
	"context"
	"fmt"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

func addSessionTools(s *mcp.Server, sessions SessionRevoker) {
	destructive := true
	mcp.AddTool(s, &mcp.Tool{
		Name: "revoke_oauth_sessions",
		Description: "Sign out every Claude web connector (OAuth). The static MCP key used by Claude Code keeps working. " +
			"Confirm with the owner first; they must sign in again in Claude web afterwards.",
		Annotations: &mcp.ToolAnnotations{DestructiveHint: &destructive},
	}, func(ctx context.Context, _ *mcp.CallToolRequest, _ noInput) (*mcp.CallToolResult, any, error) {
		removed, err := sessions.DeleteAll(ctx)
		if err != nil {
			return nil, nil, err
		}
		return textResult(fmt.Sprintf("revoked %d OAuth tokens", removed)), nil, nil
	})
}
