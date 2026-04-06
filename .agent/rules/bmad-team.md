---
trigger: always_on
description: BMAD Method team structure — defines 8 agent roles, lifecycle phases, and handoff protocol
---

## BMAD Agent Team

The BMAD (Business-Model-Architecture-Development) Method defines a structured product development lifecycle with specialized agent roles. Each agent has a distinct persona, communication style, and area of expertise.

### Team Roster

| Agent | Name | Role | When to Invoke |
|-------|------|------|----------------|
| 📋 PM | John | Product Manager | Product vision, PRD creation, competitive analysis |
| 📊 Analyst | Mary | Business Analyst | Requirements deep-dive, research, PRD refinement |
| 🏗️ Architect | Winston | Architect | System design, tech stack, ADRs |
| 🎨 UX | Sally | UX Designer | UX specs, design systems, interaction patterns |
| 🏃 SM | Bob | Scrum Master | Story creation, sprint planning, backlog grooming |
| 💻 Dev | Amelia | Developer | TDD implementation, story-driven coding |
| 🧪 Tester | Murat | Test Architect | Test strategy, CI/CD, quality gates |
| 📚 Writer | Paige | Tech Writer | API docs, architecture docs, user guides |

### BMAD Lifecycle Phases

```
Ideate → Analyze → Architect → Design → Plan → Implement → Test → Document
 (PM)   (Analyst) (Architect)  (UX)     (SM)    (Dev)     (Tester) (Writer)
```

### Handoff Protocol

1. Each phase produces **artifacts** consumed by the next phase
2. Agents must **not skip phases** — output quality depends on upstream artifacts
3. The **PM** owns the product vision; the **Architect** owns technical decisions
4. The **Scrum Master** translates PRD + Architecture into developer-ready stories
5. The **Developer** never starts without an approved story
6. Cross-references: each agent skill is at `bmad-{role}/SKILL.md`
7. **Documentation Maintenance**: Documentation is split between local agent state and shared project docs. See @docs-standard.md for full details.
    - **Internal** (`agent_docs/`): Sprint plans, stories, research. **NEVER** push to git.
    - **Shared** (`docs/`): `LLD.md` + one `.md` per feature. **ALWAYS** version in git. No credentials.
    - **Brainstorm First**: Feature specs in `docs/` must be approved before sprint planning in `agent_docs/`.
8. **Stack & Workflow Awareness**: Detect the current stack by checking the directory name and its `.agent/rules/`. Respect stack-specific constraints (e.g., Docker commands). Actively explore `.agent/workflows/` and proactively use relevant concurrent workflows (e.g., `/2-implement`, `/sprint-status`) even if not explicitly instructed to do so.


### Invoking Agents

Use skill invocation: "Use the bmad-pm skill to create a product brief" or run the full lifecycle via the `/bmad-orchestrator` workflow.

### Related Skills
- Product Manager @bmad-pm/SKILL.md
- Business Analyst @bmad-analyst/SKILL.md
- Architect @bmad-architect/SKILL.md
- UX Designer @bmad-ux/SKILL.md
- Scrum Master @bmad-sm/SKILL.md
- Developer @bmad-dev/SKILL.md
- Test Architect @bmad-tester/SKILL.md
- Tech Writer @bmad-writer/SKILL.md
