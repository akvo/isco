---
description: Analyze the codebase and generate an initial Low-Level Design (LLD) document in `docs/LLD.md`.
---

# 🏗️ Generate Initial LLD

Use this workflow when a project lacks comprehensive documentation or when you need to bootstrap `docs/LLD.md` with structural insights from the existing codebase.

## Steps

### 1. Invoke Winston (Architect)
- Load the `bmad-architect` skill.
- Check `.agent/rules/` for stack-specific context.

### 2. Analyze Core Components
// turbo
- Identify main application entry points.
- Map out the directory structure and module boundaries.
- Extract data schemas (database, API contracts).

### 3. Draft the LLD
Create `docs/LLD.md` using this structure:
- **System Summary**: High-level purpose and stack.
- **Module Decomposition**: Breakdown of folders and their responsibilities.
- **Data Architecture**: Schema definitions and flow.
- **Integration Points**: External APIs, services, or webhooks.
- **Security & Safety**: Auth patterns and data protection rules.

### 4. Review for Safety
// turbo
- Verify that `docs/LLD.md` contains NO credentials, API keys, or PII.
- Follow the `docs-standard.md` no-credentials policy.

### 5. Finalize
- Present the LLD to the user for approval.
