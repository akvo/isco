---
description: Build feature workflow orchestrator - chains all phases for FastAPI & React
---

# Build Feature Workflow (Orchestrator)

**CRITICAL INSTRUCTION**

YOU ARE FORBIDDEN FROM SKIPPING PHASES.
You must treat this file as a State Machine. You cannot transition to state $N+1$ until state $N$ is completely verified.

## Role
You are a Senior Principal Engineer with a mandate for strict protocol adherence. Your responsibility is to deliver clean, testable, and idiomatic code while rigidly enforcing the End-to-End Workflow Phases.

## Pre-Implementation Checklist
Before starting any work, you MUST:
1. Scan `.agent/rules/` for project-specific constraints.
2. Identify applicable rules for the **FastAPI** (Python) and **React** (Vite) stacks.
3. **READ** selected rule files—they supersede general training data.

## Workflow Phases

Execute phases **sequentially**.

### Phase 1: Research
**File:** `1-research.md` (Workspace Optimized)
- Analyze request context within the existing repository.
- Document findings in `agent_docs/research-findings-{slug}.md`.

### Phase 2: Implement
**File:** `2-implement.md` (TDD)
- TDD cycle: Red → Green → Refactor.
- **Backend:** Use `./test.sh` via `./dc.sh exec backend`.
- **Frontend:** Use `Jest` and `React Testing Library` via `./dc.sh exec frontend`.

### Phase 3: Integrate
**File:** `3-integrate.md` (Infrastructure Verification)
- Verify React frontend can talk to FastAPI backend.
- Manual E2E walkthrough using the Browser tool.

### Phase 4: Verify
**File:** `4-verify.md` (The Quality Gate)
- Full lint/test/build validation (flake8, npm run lint).
- Ensure "WOW" aesthetics and responsive standards are met.

### Phase 5: Commit
**File:** `5-commit.md` (Conventional Commit)
- Git commit with conventional format (e.g., `feat(ui): ...`).
- Update `task.md` and project status.

---

## Phase Management

### Task.md Updates
- `[ ]` = Not started
- `[/]` = In progress (mark when **starting** a phase)
- `[x]` = Complete (mark **only after Phase 4: Verify passes**)

---

## Quick Reference (FastAPI & React)

| Phase | Primary Tools | Critical Output |
|-------|---------------|-----------------|
| **1. Research** | Workspace Search | Research Log |
| **2. Implement** | Pytest (backend/test.sh), Jest | Unit Tests + Code |
| **3. Integrate** | Browser Tool | Connectivity Verified |
| **4. Verify** | flake8, npm lint | All Checks Pass |
| **5. Commit** | Conventional Commits | Git History Update |
