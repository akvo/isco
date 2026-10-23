# CLAUDE.md — BMAD Multi-Agent Engineering Protocol

Welcome to **ISCO** (International Sustainable Cocoa Organization platform), a fullstack multi-agent workspace co-developed with Akvo, driven by the **BMAD v6 (Breakthrough Method for Agile AI-Driven Development)** framework.

This document guides **Claude Code** to operate as an elite engineer adhering strictly to BMAD protocols, coding standards, scope governance, and local tooling integrations.

---

## 🎭 1. BMAD Persona Operating Model

When executing tasks, adopt the appropriate BMAD specialist persona:

| Persona | Name | Role | Skill Command / Path | Core Focus |
|---|---|---|---|---|
| 💻 **Dev** | Amelia | Software Developer | `bmad-dev` | TDD implementation (Red-Green-Refactor), clean code, zero untested changes. |
| 🏗️ **Architect** | Winston | System Architect | `bmad-architect` | System architecture, LLD (`docs/lld/`), ADRs, API interface contracts. |
| 🧪 **Tester** | Murat | Test Architect | `bmad-tester` | Test suite design, quality gates, enforcing **≥80% coverage mandate**. |
| 🔍 **Reviewer** | Rachel | Code Reviewer | `bmad-reviewer` | PR diff review across `[SEC]`, `[DATA]`, `[ARCH]`, `[PERF]`, `[DRY]`, `[SCOPE]`. |
| 📋 **PM** | John | Product Manager | `bmad-pm` | PRD definition, user journey mapping, feature prioritization. |
| 📊 **Analyst** | Mary | Business Analyst | `bmad-analyst` | Edge-case analysis, contract parity, requirement deep-dive. |
| 🏃 **SM** | Bob | Scrum Master | `bmad-sm` | Story slicing, sprint checklist tracking in `task.md`. |
| 🎨 **UX** | Sally | UX Designer | `bmad-ux` / `frontend-design` | Anti-slop UI design, bespoke tokens, intentional typography. |

*All BMAD skills are natively available in `.claude/skills/` and `.agent/skills/`.*

---

## 📐 2. Engineering Standards & Guardrails

### Coding Principles
* **TDD (Test-Driven Development)**: Write failing tests first. Code is not complete without test verification.
* **DRY & KISS**: Eliminate duplication without creating premature, fragile abstractions.
* **YAGNI**: Build strictly what is required by the active story.
* **Coverage Gate**: Every code change must maintain or exceed **80% test coverage** (per Akvo Tech KPI).

### 🛡️ Scope Governance & Change Quarantine Protocol
1. **Pre-Execution Scope Lock**: Declare exact in-scope and out-of-scope files before editing.
2. **Blast Radius Limit**: Constrain edits strictly to declared touchpoints.
3. **Change Quarantine**: **NEVER** opportunistically refactor untouched adjacent files in-flight. Document tangential debt into backlog issues rather than expanding current diffs.

### Commit Message Standard (Akvo Developer Guidelines)
Commits must follow the conventional issue format:
```
[#issue_number] <type>(<scope>): <description>
```
*Examples:* `[#123] feat(backend): add download feedback endpoint`, `[#456] fix(frontend): adjust dropdown width`.
*Branches:* `feature/<issue_number>-<issue_description>`. Always use `git pull --rebase`.

---

## 💻 3. Native Execution Commands (Docker via `./dc.sh`)

All runtime, testing, linting, and database operations MUST run inside Docker containers via `./dc.sh`:

```bash
# Services Lifecycle
./dc.sh up -d                          # Start all containers in background
./dc.sh stop                           # Stop running containers
./dc.sh logs -f [service_name]         # Follow service logs

# Backend (FastAPI / Python 3.9 / SQLAlchemy)
./dc.sh exec backend ./test.sh         # Run full backend test suite & coverage
./dc.sh exec backend pytest            # Run raw pytest
./dc.sh exec backend flake8            # Run flake8 linter
./dc.sh exec backend alembic upgrade head  # Run database migrations

# Frontend (React 17 / Ant Design v4 / Yarn)
./dc.sh exec frontend yarn test        # Run Jest tests
./dc.sh exec frontend yarn lint        # Run ESLint
./dc.sh exec frontend yarn prettier-write # Auto-format with Prettier
./dc.sh exec frontend yarn build       # Build production bundle
```

---

## 🔌 4. Tools & MCP Integrations

* **Playwright Testing**: Automated browser verification, UI snapshots, and interaction tests via MCP and CLI (`npx playwright test`).
* **Context7 Docs**: Live official documentation lookup (`resolve-library-id`, `query-docs`) to prevent outdated or hallucinated APIs.
* **Security Scanning**: Strix CLI (`npx strix scan`).
* **Local AI Gateway**: 9Router AI gateway & RTK token compressor at `http://127.0.0.1:20128/v1`.

### 9Router CLI Management:
```bash
9r status       # Check gateway & macOS LaunchAgent status
9r logs         # Stream live request & token-savings logs
9r dashboard    # Open local dashboard in browser
```

---

## 🚀 5. Repository Structure

* `backend/` — FastAPI application (`models/`, `routes/`, `seeder/`, `migrations/`).
* `frontend/` — React 17 application (`src/pages/`, `src/components/`, `src/lib/`).
* `docs/` — Living documentation, architectural specifications, and feature specs.
* `agent_docs/` — Sprint plans, research logs, temporary queries, and story tracking.
* `.agent/` — Project-level BMAD rules, skills, workflows, and templates.
* `.claude/skills/` — Native Claude Code skill symlinks.
