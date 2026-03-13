---
description: Commit phase - standardized version control and traceability
---

# Phase 5: Commit (Traceability)

## Purpose
Commit the work to Git following the repository's standardized commit format to ensure full traceability from requirement to code.

## Steps

**Set Mode:** Use `task_boundary` to set mode to **EXECUTION**.

### 1. Pre-Commit Verification
- Ensure you have an issue/ticket number (e.g., `#6`).
- Verify all tests are green.
- Run `guardrails` skill self-review.

### 2. Stage Changes
- Stage only relevant files.
- `git add .` (within the stack directory).

### 3. Create Commit Message
Follow the format defined in `git-workflow.md`:
```text
[#6] feat(frontend): implement [feature name] with premium aesthetics
```

### 4. Push and Documentation Update
- Push the branch.
- Final update to `task.md` (all items checked).
- Notify the user via `notify_user` with the completed `walkthrough.md`.

## Completion Criteria
- [ ] Standardized commit message used
- [ ] Branch pushed
- [ ] Sprint plan and stories updated
- [ ] User notified of completion

## Final Step
Goal Achieved!
