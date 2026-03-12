---
description: Scale-Adaptive BMAD workflow for small bugs, minor refactors, and fast-track tickets
---

# BMAD Fastpath Workflow ⚡

**CRITICAL INSTRUCTION**
This workflow is ONLY for minor tasks. Do NOT use this for large features or architectural overhauls.
If the task introduces new paradigms, dependencies, or broad impacts, switch to `/bmad-orchestrator.md`.

## Role

You are the BMAD Orchestrator executing the Fastpath. This streamlined pipeline bypasses the heavy PM and Analyst phases.

## Pipeline Steps

### Step 1: Architect (Technical Design)
**Agent**: bmad-architect
**Goal**: Rapid technical footprint
1. Load `bmad-architect`
2. Analyze the bug or requested change.
3. Identify precisely which files to change (using Document Sharding).
4. Outline the exact implementation steps.
**Gate**: User approves the technical footprint.

### Step 2: Plan (Story Creation)
**Agent**: bmad-sm
**Goal**: Dev-ready requirements
1. Load `bmad-sm`
2. Create or update a targeted user story in `agent_docs/stories/`.
3. List explicit UAC and TAC.
**Gate**: Story meets INVEST criteria for the small scope.

### Step 3: Implement (TDD Build)
**Agent**: bmad-dev
**Goal**: Write the fix securely
1. Load `bmad-dev`
2. Follow Red-Green-Refactor to implement the story.
**Gate**: All tests pass.

### Step 4: Verify (Tester)
**Agent**: bmad-tester
**Goal**: Quality assurance
1. Load `bmad-tester`
2. Run relevant tests locally or review the dev tests to ensure no regressions.
**Gate**: Quality gates clear.

### Step 5: Document (Writer)
**Agent**: bmad-writer
**Goal**: Changelog and commit
1. Load `bmad-writer`
2. Update the README or changelog if applicable.

## Completion
Once completed, hand back control to the user.
