---
name: Send Notification
description: >
  MUST USE at the end of every completed task, on errors requiring user attention, or when user interaction is needed.
  Sends a native OS notification directly via mcp-notify tool.
---

# Send Notification

## When to Notify

MANDATORY — after EVERY response. Also on:
- Build/lint/test failures
- When user input is required
- Task/skill completion

## Priority Symbols

| Priority | Symbol |
|----------|--------|
| critical | 🔴 |
| high | 🟠 |
| normal | 🟢 |
| info | 🔵 |
| warning | ⚠️ |

## How

Call the `notify` MCP tool directly with:
- `title`: symbol + space + short title. Example: `🟢 Task finished`
- `message`: description + ` | ` + project. Omit ` | project` if no project. Example: `Fixed the bug | my-project`

Fire-and-forget. Do NOT wait for result.
