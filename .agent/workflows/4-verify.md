---
description: Verify phase - quality assurance and rule compliance check
---

# Phase 4: Verify (QA & Compliance)

## Purpose
Run the full test suite and audit the implementation against all project rules and aesthetics standards.

## Steps

**Set Mode:** Use `task_boundary` to set mode to **VERIFICATION**.

### 1. Run Full Test Suite
- **Backend:** `./dc.sh exec backend ./test.sh`
- **Frontend:** `./dc.sh exec frontend yarn test --watchAll=false`

### 3. ESLint & Flake8 (Static Analysis)
- **Backend:** Inline in `./test.sh` (or `./dc.sh exec backend flake8`)
- **Frontend:** `./dc.sh exec frontend yarn lint`
- Ensure no warnings or errors.

### 3. Rule Compliance Audit
Review the code against:
- **Security Mandate**: No exposed secrets, proper input validation.
- **Aesthetics**: Do the components look premium? (Gradients, animations, typography).
- **Responsive**: Does it work on mobile viewports?

### 4. Create Walkthrough
Prepare a `walkthrough.md` in the artifacts directory:
- Include screenshots/recordings of the UI.
- List all tests that passed.
- Document any architectural decisions or "gotchas" found.

## Completion Criteria
- [ ] All tests passing
- [ ] Zero linting/formatting errors
- [ ] Rule compliance verified
- [ ] Walkthrough artifact created

## Next Phase
Proceed to **Phase 5: Commit** (`/5-commit`)
