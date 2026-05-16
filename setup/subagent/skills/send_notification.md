---
name: Send Notification
description: >
  MUST USE at the end of every completed task, on errors requiring user attention, or when user interaction is needed.
  Sends a native OS notification via subNotifier subagent.
---

# Send Notification

## When to Notify

MANDATORY — after EVERY response. Also on:
- Build/lint/test failures
- When user input is required
- Task/skill completion

## How

Dispatch `subNotifier` subagent with:

```
priority: [critical|high|normal|info|warning]
title: [short title]
description: [what happened, max 60 chars]
project: [project name or "none"]
```

Fire-and-forget. Do NOT wait for result.
