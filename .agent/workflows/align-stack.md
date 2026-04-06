---
description: Align the project with the copied .agent knowledge and project-specific requirements.
---

# Align Project Stack

## Purpose
When setting up a new project or importing generic `.agent` structures (e.g., using `setup.sh`), the `.agent` conventions might assume specific scripts (like `./dc.sh`) or configurations that do not perfectly align with the destination project's reality.

This workflow ensures the copied `.agent` configuration is properly aligned and tailored to your running project.

## Steps

### 1. Identify Assumptions
1. Read the current project's `README.md` and `package.json` (or `composer.json`, `requirements.txt`, etc.).
2. Scan the current project's root for execution entry points (e.g., `dc.sh`, `docker-compose.yml`, `Makefile`).

### 2. Identify Discrepancies
Compare the discovered reality with the expectations inside `.agent/rules/` and `.agent/workflows/`. Example checks:
- Do the `.agent` files assume the project runs inside `./dc.sh`, but the project actually uses raw `docker compose` or direct `npm`?
- Do the `.agent` files mandate Tailwind CSS version X, but the project uses version Y or another UI library?

### 3. Ask for Clarification (If needed)
If the project's setup is ambiguous, notify the user.
- *Example:* "I notice the generic `.agent` configuration expects `./dc.sh` for all Docker commands, but you only have `docker-compose.yml`. Should I create a `./dc.sh` wrapper, or should I update the `.agent` rules to use raw `docker compose exec`?"

### 4. Update the `.agent` Configurations
1. **Modify Rules:** Update any rules inside `.agent/rules/` (such as `docker-commands.md` or `repo-structure.md`) so they perfectly describe the project's actual commands and environments.
2. **Modify Workflows:** Update the workflows in `.agent/workflows/` (like `/2-implement.md`, `/4-verify.md`) to substitute the placeholder commands with the project's true commands.

### 5. Validate Alignment
- Run a dummy status check or listing using the newly corrected assumed commands to verify they work on the current repository.

## Completion Criteria
- [ ] Read the project root files (README, package definitions).
- [ ] Adjusted `.agent/rules/` to fit the real architecture.
- [ ] Adjusted `.agent/workflows/` to fit the real commands.
- [ ] Confirmed alignment with the user.
