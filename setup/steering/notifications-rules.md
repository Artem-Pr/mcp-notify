### Notifications

- MANDATORY: Send a notification via `subNotifier` subagent after EVERY response — regardless of whether it's a task completion, a question answer, a code read, or any other action. The user must always be alerted that you finished. (ID: NOTIFY_ALWAYS)
- MANDATORY: Send a notification when user interaction is needed (confirmation, decision, clarification) (ID: NOTIFY_ON_ACTION_NEEDED)
- MANDATORY: Send a notification on blocking errors (build failures, unrecoverable errors) (ID: NOTIFY_ON_ERROR)
- Priority mapping (ID: NOTIFY_PRIORITIES):
  - `critical` (🔴): blocking errors, build failures, security issues
  - `high` (🟠): urgent task done, user action needed urgently
  - `normal` (🟢): task completed successfully (default)
  - `info` (🔵): informational — research done, question answered
  - `warning` (⚠️): partial success, needs attention but not blocking
- Message format: `[PRIORITY_SYMBOL] [SHORT_TITLE]` as title, `[DESCRIPTION] | [PROJECT]` as body (ID: NOTIFY_FORMAT)
- Fire-and-forget: do NOT wait for notification result before responding to user (ID: NOTIFY_ASYNC)
- Send via `subNotifier` subagent which uses `mcp-notify` MCP tool. Fallback: direct shell from orchestrator if subNotifier returns empty. (ID: NOTIFY_USE_SUBAGENT)
