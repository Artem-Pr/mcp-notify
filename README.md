# mcp-notify — Cross-Platform Native OS Notifications for AI Agents

An MCP server that sends native OS notifications. Works on Windows, macOS, Linux, and WSL. Designed for AI agents (Kiro, Claude, etc.) to alert users when tasks complete, fail, or need attention.

## Platform Support

| Platform | Method | Duration |
|----------|--------|----------|
| Windows / WSL | PowerShell Toast API | ~25s (long) |
| macOS | osascript notification | system default |
| Linux | notify-send (libnotify) | system default |

## Quick Install

```bash
git clone <repo-url> mcp-notify
cd mcp-notify
npm install
npm run build
```

## Register MCP Server

Add to your Kiro MCP settings (`~/.kiro/settings/mcp.json`) inside `"mcpServers"`:

```json
"mcp-notify": {
  "command": "node",
  "args": ["/absolute/path/to/mcp-notify/dist/index.js"],
  "autoApprove": ["notify"]
}
```

> `autoApprove` is required so notifications don't need user confirmation each time.

## Choose Your Approach

Two ways to integrate notifications into your agent workflow:

### Option A: Direct MCP (Recommended)

The orchestrator calls the `notify` tool directly. Simpler, faster, consistent formatting.

**Pros:** ~30 tokens/notification, no formatting errors, no latency
**Cons:** Formatting rules live in orchestrator context (~130 tokens)

**Setup:**

1. Add `@mcp-notify` to your orchestrator agent's `tools` and `allowedTools` arrays:
```json
// ~/.kiro/agents/default.json (or your orchestrator agent)
{
  "tools": [..., "@mcp-notify"],
  "allowedTools": [..., "@mcp-notify"]
}
```

2. Copy the skill:
```bash
cp setup/direct-mcp/skills/send_notification.md ~/.kiro/skills/
```

3. Append rules to your global rules (optional):
```bash
cat setup/direct-mcp/steering/notifications-rules.md >> ~/.kiro/steering/your-rules.md
```

4. Restart your agent.

---

### Option B: Subagent

A dedicated subagent handles formatting and sending. The orchestrator just passes raw data.

**Pros:** Formatting isolated from orchestrator, smaller orchestrator context
**Cons:** ~550 tokens/notification (cheap model), occasional formatting quirks, extra latency

**Setup:**

1. Copy agent files:
```bash
cp setup/subagent/agents/subNotifier.json ~/.kiro/agents/
cp setup/subagent/agent_prompts/subNotifier.md ~/.kiro/agent_prompts/
cp setup/subagent/skills/send_notification.md ~/.kiro/skills/
```

2. Edit `~/.kiro/agents/subNotifier.json` — fix the prompt path:
```json
"prompt": "file:///home/youruser/.kiro/agent_prompts/subNotifier.md"
```

3. Add `subNotifier` to your orchestrator's available subagents:
```json
// ~/.kiro/agents/default.json
{
  "toolsSettings": {
    "subagent": {
      "availableAgents": [..., "subNotifier"],
      "trustedAgents": [..., "subNotifier"]
    }
  }
}
```

4. Append rules to your global rules (optional):
```bash
cat setup/subagent/steering/notifications-rules.md >> ~/.kiro/steering/your-rules.md
```

5. Restart your agent.

---

## Comparison

| | Direct MCP | Subagent |
|---|---|---|
| Tokens per notification | ~30 | ~550 (cheap model) |
| Formatting consistency | Perfect | Occasional errors |
| Latency | Instant | +1-2s spawn overhead |
| Orchestrator context cost | ~130 tokens (skill) | ~100 tokens (skill) |
| Formatting logic location | Orchestrator | Subagent prompt |
| Setup complexity | Simple | More files |

## Usage

### Direct MCP (Option A)

The orchestrator calls `notify` with pre-formatted strings:

```
notify(title: "🟢 Task finished", message: "Fixed the bug | my-project")
```

### Subagent (Option B)

The orchestrator dispatches the subagent with raw data:

```
subNotifier(query: "priority: normal\ntitle: Task finished\ndescription: Fixed the bug\nproject: my-project")
```

## Priority Symbols

| Priority | Symbol | When |
|----------|--------|------|
| critical | 🔴 | blocking errors, build failures |
| high | 🟠 | urgent task done, user action needed |
| normal | 🟢 | task completed (default) |
| info | 🔵 | research done, question answered |
| warning | ⚠️ | partial success, needs attention |

## Architecture

```
mcp-notify/
├── src/index.ts              # MCP server (cross-platform)
├── dist/index.js             # Compiled (run this)
├── package.json
├── tsconfig.json
├── .gitignore
└── setup/
    ├── direct-mcp/           # Option A files
    │   ├── skills/
    │   │   └── send_notification.md
    │   └── steering/
    │       └── notifications-rules.md
    └── subagent/             # Option B files
        ├── agents/
        │   └── subNotifier.json
        ├── agent_prompts/
        │   └── subNotifier.md
        ├── skills/
        │   └── send_notification.md
        └── steering/
            └── notifications-rules.md
```

## Troubleshooting

### Notifications not appearing
- **Windows**: Settings → System → Notifications → ensure Chrome/app is enabled
- **Linux**: Verify `notify-send "test" "hello"` works. Install `libnotify-bin` if not.
- **macOS**: System Preferences → Notifications → allow from terminal

### MCP tool not available to orchestrator
- Ensure `@mcp-notify` is in both `tools` AND `allowedTools` in your agent config
- Ensure `autoApprove: ["notify"]` is in the MCP server config
- Restart after config changes

### Subagent returns "No result"
- Restart the agent — config changes require restart
- Check the model is available (try `claude-sonnet-4.6` if `minimax-m2.5` fails)

## Development

```bash
npm run build   # Compile TypeScript
npm start       # Run server (for testing)
```

## Important Notes

- **Always restart** your agent after changing any config files (agent JSON, MCP settings)
- Both `autoApprove` (mcp.json) AND `tools`/`allowedTools` (agent config) are needed
- The `notify` tool accepts `title` (string) and `message` (string)
