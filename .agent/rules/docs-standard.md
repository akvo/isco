---
trigger: always_on
description: Standardizes the split between local agent_docs/ and git-tracked docs/ directories.
---

## Documentation Standard

Documentation is split into two directories with distinct purposes:

### `agent_docs/` — Local Agent State (NOT in git)

Sprint-level coordination artifacts. High-velocity, frequently changing.

- `sprint-plan.md` — Current sprint tracking
- `stories/` — User stories and acceptance criteria
- `research-findings.md` — Raw research and brainstorming notes
- `prd.md`, `product-brief.md` — Internal product requirements

### `docs/` — Shared Project Documentation (IN git)

The source of truth for all developers and stakeholders. Flat structure — one `.md` per topic.

```
docs/
├── LLD.md                    # Living low-level design (always updated)
├── STORAGE_SYSTEM.md         # Feature specification
└── USER_REGISTRATION.md      # Feature specification
```

### Feature Specification Format

Every new feature MUST have a dedicated `docs/{FEATURE_NAME}.md` following the template in `bmad-team/templates/FEATURE_SPEC.md`. This document is the **approved brainstorming contract** — it must be reviewed and approved by the user before any sprint planning or implementation begins.

### LLD (Low-Level Design)

`docs/LLD.md` is a **living document** that gets updated as the system evolves. It describes:
- System architecture and module decomposition
- Data models and schemas
- Integration points and API contracts
- Security patterns

### No Credentials Policy

> [!CAUTION]
> Files in `docs/` are pushed to the repository. NEVER include:
> - API keys, passwords, or database credentials
> - Private tokens or secrets
> - Personally Identifiable Information (PII)
>
> Use placeholders like `YOUR_API_KEY` or `dbuser_example` in examples.
