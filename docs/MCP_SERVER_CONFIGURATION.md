# MCP Server Configuration Guide

This document describes the Model Context Protocol (MCP) servers configured for the NAMC NorCal Member Portal project.

## Overview

MCP servers enhance Claude Code's capabilities by providing specialized functionality for different development tasks. This project has configured 4 MCP servers to support development, testing, and documentation workflows.

## Configured Servers

### 1. Sequential Thinking Server (`sequential`)
- **Package**: `@modelcontextprotocol/server-sequential-thinking`
- **Purpose**: Complex problem solving and architectural analysis
- **Use Cases**:
  - Root cause analysis for bugs
  - System architecture design
  - Multi-step debugging workflows
  - Performance optimization planning
- **Activation**: Use `--seq` or `--sequential` flags
- **Auto-activates**: When detecting complex debugging scenarios or architectural questions

### 2. Filesystem Server (`filesystem`)
- **Package**: `@modelcontextprotocol/server-filesystem`
- **Purpose**: Secure file operations with configurable access controls
- **Use Cases**:
  - Advanced file manipulation
  - Batch file operations
  - Directory structure analysis
  - File permission management
- **Configuration**: Currently set to access current directory (`.`)
- **Security**: Respects file system permissions and access controls

### 3. Memory Server (`memory`)
- **Package**: `@modelcontextprotocol/server-memory`
- **Purpose**: Knowledge graph-based persistent memory system
- **Use Cases**:
  - Maintaining context across sessions
  - Building knowledge graphs of the codebase
  - Tracking architectural decisions
  - Remembering project-specific patterns
- **Benefits**: Helps Claude remember important project details and decisions

### 4. Magic UI Builder (`magic`)
- **Package**: `@21st-dev/magic`
- **Purpose**: Modern UI component generation from 21st.dev
- **Use Cases**:
  - Creating React components
  - Implementing responsive designs
  - Building accessible UI patterns
  - Generating Tailwind CSS components
- **Activation**: Use `--magic` flag
- **Auto-activates**: When detecting UI component requests or frontend persona

### 5. Figma Dev Mode Server (`figma-dev-mode-mcp-server`)
- **Type**: SSE (Server-Sent Events) transport
- **URL**: `http://127.0.0.1:3845/sse`
- **Purpose**: Integration with Figma Dev Mode for design-to-code workflows
- **Use Cases**:
  - Extract design tokens from Figma
  - Generate code from Figma designs
  - Sync component specifications
  - Maintain design-code consistency
- **Requirements**: 
  - Figma Desktop App (not browser version)
  - Figma Pro Plan (Dev or Full seat on Professional, Organization, or Enterprise plans)
  - Manual activation in Figma preferences
- **Benefits**: Direct integration between design and development workflows
- **Status**: Currently in open beta (July 2025)

## Installation Status

All servers are installed at the user level, making them available across all your projects:

```bash
# List installed servers
claude mcp list

# Output:
sequential: npx -y @modelcontextprotocol/server-sequential-thinking
filesystem: npx -y @modelcontextprotocol/server-filesystem -- .
memory: npx -y @modelcontextprotocol/server-memory
magic: npx -y @21st-dev/magic
figma-dev-mode-mcp-server: http://127.0.0.1:3845/sse (SSE)
```

## Project Configuration

The project includes a `.mcp.json` file that documents the MCP server configuration. This allows team members to understand and replicate the setup.

## Using MCP Servers

### Manual Activation
You can manually activate servers using flags:
- `--seq` or `--sequential` - Activate Sequential Thinking
- `--magic` - Activate Magic UI Builder
- `--all-mcp` - Activate all available servers

### Auto-Activation
Servers automatically activate based on context:
- **Sequential**: Complex debugging, architectural analysis, multi-step problems
- **Magic**: UI component creation, frontend development tasks
- **Filesystem**: Advanced file operations beyond standard tools
- **Memory**: Automatically maintains context across sessions

### Examples

```bash
# Use sequential thinking for complex analysis
# Command: /analyze --seq

# Create a UI component with Magic
# Command: /build Button --magic

# Use all servers for comprehensive tasks
# Command: /implement feature --all-mcp
```

## Benefits for NAMC Portal

1. **Enhanced Testing**: Sequential thinking helps plan comprehensive test strategies
2. **UI Development**: Magic accelerates component creation with Tailwind CSS
3. **File Management**: Filesystem server enables advanced project operations
4. **Context Retention**: Memory server maintains architectural decisions and patterns

## Troubleshooting

### Server Not Responding
```bash
# Check server status
claude mcp get <server-name>

# Remove and re-add if needed
claude mcp remove <server-name> -s user
claude mcp add <server-name> -s user -- <command>
```

### Figma Dev Mode MCP Server Issues

#### Problem: "fetch failed" or connection refused on port 3845
**Root Cause**: The Figma Dev Mode MCP Server is not running

**Solution Steps**:
1. **Verify Figma Plan**: Ensure you have a Dev or Full seat on Professional, Organization, or Enterprise plans
2. **Use Desktop App**: Open Figma Desktop App (not browser version)
3. **Enable Server**: 
   - Click Figma menu → Preferences
   - Check "Enable Dev Mode MCP Server"
   - Confirm server is running message appears
4. **Test Connection**: 
   ```bash
   curl http://127.0.0.1:3845/sse
   # Should return connection instead of "Connection refused"
   ```
5. **Restart if Needed**: Toggle server off/on in Figma preferences

#### Configuration Validation
The `.mcp.json` configuration should be:
```json
"figma-dev-mode-mcp-server": {
  "url": "http://127.0.0.1:3845/sse",
  "transport": "sse",
  "description": "Figma Dev Mode integration for design-to-code workflows"
}
```

#### Alternative Solutions
If the official server doesn't work, consider these third-party options:
- `figma-developer-mcp` - Requires Figma API key
- `claude-talk-to-figma-mcp` - Socket-based architecture
- Manual design-to-code workflow without MCP integration

### Performance Issues
- Use `--no-mcp` flag to disable all servers temporarily
- Use `--no-<server>` to disable specific servers (e.g., `--no-magic`)
- Use `--no-figma` to disable Figma server specifically if causing issues

## Future Enhancements

Consider adding these servers as they become available:
- **Puppeteer/Playwright**: For E2E testing automation
- **GitHub**: For PR management and issue tracking
- **Database**: For direct database interactions
- **API Testing**: For comprehensive API testing workflows

## References

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Code MCP Guide](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)