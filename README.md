# mcp-notify — Cross-Platform Native OS Notifications for AI Agents

An MCP (Model Context Protocol) server that sends native OS notifications. Works on Windows, macOS, and Linux. Designed to be used by AI agents (Kiro, Claude, etc.) to alert users when tasks complete, fail, or need attention.

## How It Works

```
AI Agent (orchestrator)
  → dispatches subNotifier subagent
    → calls mcp-notify MCP tool "notify"
      → node-notifier sends OS-native notification
        → Windows: Toast notification
        → macOS: Notification Center
        → Linux: notify-send (libnotify)
```

## Quick Setup

### 1. Install the MCP server

```bash
cd /path/to/mcp-notify
npm install
npm run build
```

### 2. Register MCP server in Kiro settings

Add to `~/.kiro/settings/mcp.json` inside `"mcpServers"`:

```json
"mcp-notify": {
  "command": "node",
  "args": ["/absolute/path/to/mcp-notify/dist/index.js"],
  "autoApprove": ["notify"]
}
```

> **CRITICAL**: `autoApprove: ["notify"]` is required so the agent doesn't need user confirmation for each notification.

### 3. Install the subNotifier agent

Copy files from `setup/` to your Kiro config:

```bash
# Agent definition
cp setup/agents/subNotifier.json ~/.kiro/agents/

# Agent prompt
cp setup/agent_prompts/subNotifier.md ~/.kiro/agent_prompts/

# Skill (optional — for orchestrator to know when to notify)
cp setup/skills/send_notification.md ~/.kiro/skills/
```

### 4. Fix the agent prompt path

Edit `~/.kiro/agents/subNotifier.json` and replace `{KIRO_HOME}` with your actual path:

```json
"prompt": "file:///home/youruser/.kiro/agent_prompts/subNotifier.md"
```

### 5. Add notification rules to your global rules (optional)

Append the content of `setup/steering/notifications-rules.md` to your global rules file.

## Platform Requirements

| Platform | Requirement |
|----------|-------------|
| Windows  | Works out of the box (uses PowerShell toast via `node-notifier`) |
| macOS    | Works out of the box (uses Notification Center) |
| Linux    | Requires a notification daemon: `sudo apt install libnotify-bin` |
| WSL      | Uses Windows notifications via `powershell.exe` (auto-detected by `node-notifier`) |

### Linux — verify notifications work:
```bash
notify-send "Test" "Hello"
```
If nothing appears, install a notification daemon:
```bash
sudo apt install dunst && dunst &
```

## Architecture

```
mcp-notify/
├── src/index.ts          # MCP server source (node-notifier)
├── dist/index.js         # Compiled server (run this)
├── package.json
├── tsconfig.json
└── setup/                # Config files to copy to ~/.kiro/
    ├── agents/
    │   └── subNotifier.json       # Agent definition (tools + permissions)
    ├── agent_prompts/
    │   └── subNotifier.md         # Agent behavior prompt
    ├── skills/
    │   └── send_notification.md   # Skill trigger definition
    └── steering/
        └── notifications-rules.md # Rules to add to global rules
```

## Key Configuration Details

### Agent permissions (subNotifier.json)

```json
{
  "tools": ["mcp:mcp-notify:notify"],
  "allowedTools": ["mcp:mcp-notify:notify"]
}
```

**Why this matters**: The `tools` array declares what tools the subagent CAN use. The `allowedTools` array grants automatic permission (no user confirmation). Without `allowedTools`, the agent will be blocked waiting for approval.

The tool name format is `mcp:<server-name>:<tool-name>` — so `mcp:mcp-notify:notify` means "the `notify` tool from the `mcp-notify` MCP server".

### MCP server autoApprove

```json
"mcp-notify": {
  "autoApprove": ["notify"]
}
```

This allows the MCP tool to execute without user confirmation at the MCP server level.

### Both are needed!

Without BOTH `allowedTools` in the agent AND `autoApprove` in the MCP config, notifications will silently fail or hang waiting for approval.

## Troubleshooting

### Notifications not appearing

1. **Check MCP server is running**: Look for errors in Kiro's MCP server logs
2. **Check path is correct**: The `args` path in mcp.json must be absolute and point to the compiled `dist/index.js`
3. **Check permissions**: Both `allowedTools` (agent) and `autoApprove` (mcp.json) must include the tool
4. **Linux**: Verify `notify-send "test" "hello"` works from terminal
5. **Windows**: Check Windows Settings → Notifications → ensure notifications are enabled

### subNotifier returns empty

- Verify the prompt file path in `subNotifier.json` is correct and the file exists
- Check that `mcp-notify` server name in agent tools matches the key in `mcp.json`

### Permission denied errors

- The agent needs `"allowedTools": ["mcp:mcp-notify:notify"]` — this is the most common setup issue
- The MCP server needs `"autoApprove": ["notify"]`

## Usage from Orchestrator

The orchestrator dispatches subNotifier like this:

```
subagent(
  role: "subNotifier",
  prompt: "priority: normal\ntitle: Task finished\ndescription: Fixed the bug\nproject: my-project"
)
```

The subNotifier parses the input, formats the title with priority symbol, and calls the MCP tool.

## Development

```bash
npm run build   # Compile TypeScript
npm start       # Run server (for testing)
```

To test the notification manually:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"notify","arguments":{"title":"Test","message":"Hello world"}}}' | node dist/index.js
```
