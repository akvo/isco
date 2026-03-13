---
description: Utility workflow to bundle the bmad-team directory into a single text artifact for external LLMs (e.g. Custom GPTs).
---

# Compile Agents Workflow 📦

## Role
You are executing the compilation step to bundle BMAD capabilities for external use.

## Steps

### Step 1: Read Configuration
1. Crawl all files in `bmad-team/rules/`, `bmad-team/skills/`, and `bmad-team/workflows/`.
2. Extract the YAML frontmatter and core instructions from each file.

### Step 2: Bundle
Concatenate the extracted components into a single markdown file named `bmad-bundle.md` (or JSON if requested).

### Step 3: Format Outputs
Group them logically:
- Section 1: Global Rules
- Section 2: Agent Personas and Capabilities
- Section 3: Workflows

### Step 4: Finalize
Save the bundled file in the root directory and notify the user of its location.
