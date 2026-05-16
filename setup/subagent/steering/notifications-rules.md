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
- Message format: orchestrator sends raw priority/title/description/project, subagent formats (ID: NOTIFY_FORMAT)
- Fire-and-forget: do NOT wait for notification result before responding to user (ID: NOTIFY_ASYNC)
- Send via `subNotifier` subagent. See `send_notification.md` skill for format. (ID: NOTIFY_USE_SUBAGENT)
