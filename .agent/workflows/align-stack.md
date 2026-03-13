---
description: Align the project with the copied .agent knowledge and project-specific requirements.
---

# Align Project Stack

## Purpose
When setting up a new project or importing generic `.agent` structures, the `.agent` conventions might assume specific scripts (like `./dc.sh`) or configurations that do not perfectly align with the destination project's reality.

This workflow ensures the copied `.agent` configuration is properly aligned and tailored to your running project.

## Steps

### 1. Identify Assumptions
1. Read the current project's `README.md` and `package.json`.
2. Scan the current project's root for execution entry points (e.g., `dc.sh`, `docker-compose.yml`).

### 2. Identify Discrepancies
Compare the discovered reality with the expectations inside `.agent/rules/` and `.agent/workflows/`. Example checks:
- Do the `.agent` files assume the project runs inside `./dc.sh`?
- Do the `.agent` files mandate Vitest, but the project uses another runner?

### 3. Update the `.agent` Configurations
1. **Modify Rules:** Update any rules inside `.agent/rules/` (such as `docker-commands.md`) so they perfectly describe the project's actual commands.
2. **Modify Workflows:** Update the workflows in `.agent/workflows/` (like `/2-implement.md`, `/4-verify.md`) to substitute placeholder commands with the project's true commands.

## Completion Criteria
- [ ] Adjusted `.agent/rules/` to fit the real architecture.
- [ ] Adjusted `.agent/workflows/` to fit the real commands.
- [ ] Confirmed alignment with the user.
