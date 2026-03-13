---
name: debugging-protocol
description: Systematic protocol for debugging complex issues. Use when facing bugs, test failures, unexpected behavior, or performance problems. Provides a structured hypothesis-driven approach to find root causes.
---

# Debugging Protocol

## Overview

This skill provides a rigorous framework for debugging complex software issues in the `fastapi-react` stack. It moves beyond ad-hoc troubleshooting to a structured process of hypothesis generation and validation.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## Protocol Workflow

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings.
   - Read stack traces completely.
   - Note line numbers, file paths, and error codes.

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - Check backend logs: `./dc.sh logs backend`
   - Check frontend logs: `./dc.sh logs frontend` (Vite overlay)

3. **Check Recent Changes**
   - What changed? `git diff`, recent commits.
   - New dependencies, config changes?

4. **Gather Evidence in Multi-Component Systems**
   ```
   For EACH component boundary (Frontend → Backend → Database):
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
   ```

5. **Trace Data Flow**
   - Where does the bad value originate?
   - Keep tracing up until you find the source.
   - Fix at source, not at symptom.

### Phase 2: Pattern Analysis

1. **Find Working Examples** — Locate similar working code in the codebase.
2. **Compare Against References** — Read reference implementations COMPLETELY.
3. **Identify Differences** — List every difference, however small.

### Phase 3: Hypothesis and Testing

1. **Form Single Hypothesis** — "I think X is the root cause because Y".
2. **Test Minimally** — Make the SMALLEST possible change.
3. **Verify Before Continuing** — Worked? → Phase 4. Didn't? → New hypothesis.
4. **Don't stack fixes** — If it didn't work, revert and try a new approach.

### Phase 4: Implementation

1. **Create Failing Test Case**
   - Backend: `./dc.sh exec backend pytest -k "test_name"`
   - Frontend: `./dc.sh exec frontend npm run test -- -t "test name"`
   - MUST exist before fixing.

2. **Implement Single Fix** — ONE change at a time.

3. **Verify Fix** — Test passes? No regressions?

## Rule Compliance

This skill enforces:
- Error Handling @error-handling.md
- Testing Strategy @testing-strategy.md
- Docker Commands @docker-commands.md
