---
name: Send Notification
description: >
  MUST USE at the end of every completed task, on errors requiring user attention, or when user interaction is needed.
  Sends a native OS notification via subNotifier subagent.
---

# Send Notification

## Purpose

Send a structured native OS notification to alert the user when a task finishes, fails, or needs interaction.

## When to Notify

MANDATORY — send a notification at the end of:
- Any skill execution (orchestrate_frontend_task, orchestrate_pr_review, etc.)
- subDev completion (success or failure)
- Build/lint/test failures that stop progress
- When user input is required (confirmation, decision, clarification)
- Research/investigation completion

## Language

Notification content is always in English.

## Instructions

### Step 1: Determine parameters

Based on the outcome, select:

**Priority** (maps to symbol):
- `critical` (🔴) — blocking errors, build failures, security issues
- `high` (🟠) — urgent task done, user action needed urgently
- `normal` (🟢) — task completed successfully (default)
- `info` (🔵) — informational: research done, question answered
- `warning` (⚠️) — partial success, needs attention but not blocking

**Title type** (use exactly one):
- `Task finished` — task/implementation completed
- `Action needed` — user interaction required
- `Build failed` — build/lint/test failure
- `Review done` — code review completed
- `Research done` — investigation/research completed
- `Tests passed` — test suite passed
- `Tests failed` — test suite failed
- `Commit ready` — commit created
- `PR created` — pull request created
- `Error` — unrecoverable error

**Description**: 1 short sentence (max 60 chars) of what was done.

**Project**: repo/project name if known from context (branch, cwd, task).

### Step 2: Send via subNotifier

Dispatch `subNotifier` subagent with query:

```
priority: [priority]
title: [title_type]
description: [description]
project: [project or "none"]
```

### Step 3: Continue

Do NOT wait for notification result. Fire-and-forget.
