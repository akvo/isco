---
description: BMAD lifecycle orchestrator — chains all 8 agent phases from ideation to documentation
---

# BMAD Lifecycle Orchestrator

**CRITICAL INSTRUCTION**

YOU ARE FORBIDDEN FROM SKIPPING PHASES.
You must treat this file as a State Machine. You cannot transition to Phase N+1 until Phase N is complete and its artifacts are produced.

## Role

You are the BMAD Orchestrator, responsible for guiding a product through its entire lifecycle using the 8 specialized BMAD agent roles. Each phase produces artifacts consumed by the next.

## Pre-Flight

Before starting:
1. Confirm the project name and scope with the user
2. **Detect the current stack** (e.g., FastAPI/Next.js, Laravel, Streamlit) by checking the directory name and its `.agent/rules/`.
3. Create an `agent_docs/` directory for internal sprint artifacts
4. **Check for existing artifacts**:
    - `docs/` for shared feature specs and LLD (git-tracked)
    - `agent_docs/` for sprint plans and stories (local only)

5. Ask the user: "**Is this a new feature, refinement, refactor, minor bug, or a general task?**"
6. **Scale-Adaptive Routing**: If the task is a minor bug, minor refactor, or small ticket, immediately switch to the `/bmad-fastpath` workflow. Only proceed with the full 8-agent orchestrator phase below if it is a major feature or architectural change.
7. Ask if the user wants to run all phases or start from a specific phase (if continuing with the orchestrator).


## Lifecycle Phases

**CRITICAL: DOCUMENTATION MAINTENANCE**
For every phase, check both `docs/` and `agent_docs/`:
1. Read existing artifacts first.
2. Feature specs go to `docs/{FEATURE_NAME}.md` (shared, git-tracked, follows `bmad-team/templates/FEATURE_SPEC.md`).
3. Sprint plans and stories go to `agent_docs/` (local only).
4. `docs/LLD.md` is a living document — always update it when architecture changes.



### Phase 1: Ideate 📋
**Agent**: bmad-pm (John, Product Manager)
**Goal**: Define project vision (Skeleton) or feature requirements
**Steps**:
1. Load the bmad-pm skill
2. For "Feature" or "Refinement" tasks, create a **Feature Specification** in `docs/{FEATURE_NAME}.md` using the `bmad-team/templates/FEATURE_SPEC.md` template.
3. For "General Task" or "Vision Change", update `agent_docs/prd.md` or `agent_docs/product-brief.md`.
**Artifacts Produced**:
- `docs/{FEATURE_NAME}.md` (New/Update — git-tracked)
- `agent_docs/product-brief.md`, `agent_docs/prd.md` (internal only)
**Gate**: User approves the Feature Specification before proceeding

---

### Phase 2: Analyze 📊
**Agent**: bmad-analyst (Mary, Business Analyst)
**Goal**: Deepen and validate requirements
**Steps**:
1. Load the bmad-analyst skill
2. Review Feature Specification from Phase 1 (`docs/{FEATURE_NAME}.md`)
3. Conduct deep research on key areas
4. Refine Feature Specification with hardened requirements
**Artifacts Produced**:
- `docs/{FEATURE_NAME}.md` (refined — git-tracked)
- `agent_docs/research-findings.md` (internal notes)
**Gate**: All requirements are testable and traceable

---

### Phase 3: Architect 🏗️
**Agent**: bmad-architect (Winston, Architect)
**Goal**: Design the technical architecture
**Steps**:
1. Load the bmad-architect skill
2. Review refined Feature Spec from Phase 2
3. Design system architecture with tech stack decisions
4. Document ADRs inline in `docs/{FEATURE_NAME}.md` or `docs/LLD.md`
5. Design data model and API contracts
**Artifacts Produced**:
- `docs/LLD.md` (updated)
- `docs/{FEATURE_NAME}.md` (architecture section updated)
**Gate**: Architecture reviewed and approved

---

### Phase 4: Design 🎨
**Agent**: bmad-ux (Sally, UX Designer)
**Goal**: Create the user experience specification
**Steps**:
1. Load the bmad-ux skill
2. Review PRD and Architecture from previous phases
3. Run Design Thinking Workshop
4. Select design system
5. Generate color themes and interaction patterns
**Artifacts Produced**:
- `agent_docs/ux-design-specification.md`
- `agent_docs/ux-color-themes.html` (optional)
**Gate**: UX specification validated and approved

---

### Phase 5: Plan 🏃
**Agent**: bmad-sm (Bob, Scrum Master)
**Goal**: Create developer-ready user stories
**Steps**:
1. Load the bmad-sm skill
2. Review PRD, Architecture, and UX Spec
3. Decompose epics into user stories
4. Add acceptance criteria and technical notes
5. Plan initial sprint(s)
**Artifacts Produced**:
- `agent_docs/stories/`
- `agent_docs/sprint-plan.md`
**Gate**: Stories meet INVEST criteria and are approved

---

### Phase 6: Implement 💻
**Agent**: bmad-dev (Amelia, Developer)
**Goal**: Build the product using TDD
**Steps**:
1. Load the bmad-dev skill
2. Pick approved stories from sprint plan
3. For each story, run TDD cycle (Red → Green → Refactor)
4. Delegate to stack-specific `/2-implement` workflow
5. Mark stories as Implemented and **Update Actual Time** in the story document.
**Artifacts Produced**:
- Working code with tests
- Updated story statuses
**Gate**: All acceptance criteria (UAC + TAC) met, tests passing

---

### Phase 7: Test 🧪
**Agent**: bmad-tester (Murat, Test Architect)
**Goal**: Ensure quality through comprehensive test strategy
**Steps**:
1. Load the bmad-tester skill
2. Review implemented code and existing tests
3. Design test strategy (pyramid, quality gates)
4. Identify coverage gaps
5. Define CI/CD quality gates
**Artifacts Produced**:
- `agent_docs/test-strategy.md`
- Quality gate configuration
**Gate**: All quality gates pass

---

### Phase 8: Document 📚
**Agent**: bmad-writer (Paige, Tech Writer)
**Goal**: Create comprehensive technical documentation
**Steps**:
1. Load the bmad-writer skill
2. Review all artifacts from previous phases
3. Update `docs/LLD.md` with final architecture
4. Update `docs/{FEATURE_NAME}.md` with implementation details
5. Update `README.md`
**Artifacts Produced**:
- `docs/LLD.md` (updated)
- `docs/{FEATURE_NAME}.md` (finalized)
- Updated `README.md`
**Gate**: Documentation passes quality audit

---

## Phase Management

### Progress Tracking
- `[ ]` = Not started
- `[/]` = In progress
- `[x]` = Complete (gate passed)

### Phase Transitions
Before moving to the next phase, verify:
- [ ] Current phase artifacts produced
- [ ] Gate criteria met
- [ ] User approval received (for phases with approval gates)

### Error Handling
If a phase fails:
1. Document the failure
2. Do NOT proceed to the next phase
3. Fix within the current phase
4. Re-run the gate check

### Partial Execution
Users may start from any phase if prerequisites are met:
- If starting from Phase 3, ensure PRD exists
- If starting from Phase 6, ensure stories exist
- Always validate upstream artifacts before proceeding

## Quick Reference

| Phase | Agent | Skill | Key Output |
|-------|-------|-------|------------|
| 1. Ideate | John | bmad-pm | Feature Spec (`docs/`) |
| 2. Analyze | Mary | bmad-analyst | Refined Feature Spec |
| 3. Architect | Winston | bmad-architect | LLD + ADRs (`docs/`) |
| 4. Design | Sally | bmad-ux | UX Specification |
| 5. Plan | Bob | bmad-sm | User Stories (`agent_docs/`) |
| 6. Implement | Amelia | bmad-dev | Working Code |
| 7. Test | Murat | bmad-tester | Test Strategy |
| 8. Document | Paige | bmad-writer | Final Docs (`docs/`) |
