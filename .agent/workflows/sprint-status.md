---
description: Check the current sprint status, progress, and remaining tasks
---

# Check Sprint Status

## Purpose
This workflow provides a clear overview of the current sprint's progress. It reads the agent documentation related to the sprint to determine what has been completed, what is in progress, and what remains.

## Steps

### 1. Read Current Sprint Plan
- Review `agent_docs/sprint-plan.md` to understand the overall sprint timeline, goals, and committed stories.

### 2. Read All Active Stories
- Read all files inside `agent_docs/stories/` that are part of the current sprint.
- Extract the following information from each story:
  - **Status** (e.g., Todo, In Progress, Implemented)
  - **Estimated Time / Effort Points**
  - **Actual Time** spent (if populated)
  - Completion status of **UAC/TAC** checklists

### 3. Calculate Progress
- Summarize the total number of points/tickets in the sprint.
- Summarize the points/tickets completed.
- Compare Total Estimated Time vs Total Actual Time spent so far.

### 4. Output Status Report
Generate a concise status report for the user:

```markdown
## Sprint Status Overview
- **Sprint Name**: [Sprint Name]
- **Progress**: [X]% Completed ([Y]/[Z] Points)
- **Time Tracking**: [Total Actual Time] spent vs [Total Estimated Time] estimated

### Completed Stories
- [Story Title] ([Points])

### In Progress
- [Story Title] ([Points]) - [Actual Time] spent so far

### Remaining
- [Story Title] ([Points])

### Blockers / Notes
[Any missing UAC/TAC, lack of updates, or potential risks based on time tracking]
```

## Completion Criteria
- [ ] Read `sprint-plan.md` and `stories/`.
- [ ] Presented the Sprint Status Overview to the user.
