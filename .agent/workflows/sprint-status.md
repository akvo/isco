---
description: Check the current sprint status, progress, and remaining tasks
---

# Check Sprint Status

## Purpose
This workflow provides a clear overview of the current sprint's progress by reading agent documentation.

## Steps

### 1. Read Current Sprint Plan
- Review `agent_docs/sprint-plan.md` to understand goals and committed stories.

### 2. Read All Active Stories
- Read all files inside `agent_docs/stories/` part of the current sprint.
- Extract **Status**, **Points**, **Actual Time**, and **UAC/TAC** checklists.

### 3. Calculate Progress
- Summarize total points vs completed points.
- Compare Estimated vs Actual time.

### 4. Output Status Report
Generate a concise status report for the user.

## Completion Criteria
- [ ] Presented the Sprint Status Overview to the user based on `agent_docs/`.
