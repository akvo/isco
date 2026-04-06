---
trigger: always_on
---

## Repository Structure

This is a **multi-stack agent skeleton repository**. Each subdirectory represents a different fullstack tech stack with its own `.agent/` configuration.

### Directory Convention

├── .agent/           # Local agent config (Rules, Skills, Workflows) — NOT in git
├── agent_docs/       # Local agent state (Sprint plans, Stories) — NOT in git
├── docs/             # Shared documentation (LLD.md + feature specs) — IN git
└── ...

See @docs-standard.md for the full documentation standard.

### Rules for This Repo

1. **Each stack is self-contained** — its `.agent/` must work independently when copied to another project
2. **Use two-tier trigger system** — `always_on` for universal rules, `model_decision` for contextual rules
3. **Skills need frontmatter** — every `SKILL.md` must have `name` and `description` in YAML frontmatter
4. **All commands must use Docker** — never reference bare `python`, `node`, `yarn`, etc. without the stack's Docker wrapper
5. **Cross-reference between files** — rules, skills, and workflows should link to related files using `@filename.md`
6. **Adapt, don't copy** — when sourcing from external repos, adapt content for the specific stack (rename commands, adjust paths, localize examples)
7. **Standardized Traceability** — All commits must be prefixed with `[#issue_number]`. Refer to root @git-workflow.md for the full specification.
8. **Agent-as-Code (BMAD 6)** — Treat AI agents as deterministic runtimes. Agents must NEVER write code without an approved, specific architectural footprint and user story. The Plan -> Build -> Verify pipeline is immutable.
