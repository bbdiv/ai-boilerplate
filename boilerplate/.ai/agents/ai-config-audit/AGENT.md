---
name: ai-config-audit
description: >-
  Audits the .ai/ config for stale skills and semantic drift after refactors.
  Use when onboarding, after a major refactor, or when skills may be out of date.
source: boilerplate
source_version: 1.4.0
---

# Agent: AI Config Auditor

## Purpose

Performs semantic validation of the `.ai/skills/` folder that mechanical scripts cannot do: checks whether skill content still reflects current codebase conventions, and identifies which skills are overdue for human review.

This agent does not block commits — it produces a structured audit report for the developer to act on.

## Trigger

On demand. Invoke in any of these situations:
- "audit ai config"
- "which skills are stale?"
- "after this refactor, are any skills out of date?"
- After a major change to `src/` patterns (new library, major component refactor, API changes)

## Instructions

### Step 1 — Run the mechanical check first

```
node .ai/scripts/validate-config.mjs
```

If there are blocking errors (exit code 1), report them and stop. Structural issues must be fixed before a meaningful semantic audit can be done.

### Step 2 — Check last_reviewed dates

Read all `.ai/skills/**/SKILL.md` files. For each, extract `last_reviewed` from frontmatter. Flag any skill where `last_reviewed` is more than 90 days ago.

Report the full list sorted by age (oldest first) with:
- Skill path
- `last_reviewed` date
- Age in days
- Suggested action

### Step 3 — Contextual refactor impact (only when triggered by a refactor)

If the user mentions a refactor, migration, or new pattern:
1. Ask: "Which area of the codebase changed?" (or read the diff if a branch/PR is provided)
2. Map changed files to skill domains using the skills index in `.ai/instructions.md`
3. For each affected skill: read its content and compare against current patterns in `src/`
4. Report whether the skill's guidance still matches the code, with specific discrepancies noted

### Step 4 — Output the audit report

## Output format

```
## AI Config Audit — <date>

### Structural check
PASSED / FAILED (list errors if failed)

### Stale skills (last_reviewed > 90 days)

| Skill | last_reviewed | Age | Action |
|-------|---------------|-----|--------|
| .ai/skills/example/SKILL.md | 2025-01-01 | 99 days | Review required |

### Refactor impact (if applicable)
List each skill that may be affected by the described refactor, with specific
guidance on what to check and update.

### Recommended actions
Numbered list of concrete next steps, most urgent first.
```

## Tools / scope

- **Allowed**: read `.ai/` folder, read `src/` files, run `node .ai/scripts/validate-config.mjs`, run `git diff` or `gh pr diff` when a refactor context is given.
- **Not allowed**: edit skill files directly (suggest changes for the human to apply), push changes, modify `package.json`.

This agent produces a report — it never modifies files.
