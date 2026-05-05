---
name: write-a-skill
description: >-
  Author a new skill in `.ai/skills/` following project conventions. Use when
  the user wants to create, write, or scaffold a new skill, or when a recurring
  task in this codebase needs a reusable recipe.
last_reviewed: 2026-04-30
source: boilerplate
source_version: 1.6.0
---

# Write a skill

A skill is a task recipe agents load on demand. See [`.ai/skills/README.md`](../README.md) for the full format spec, frontmatter fields, and folder conventions. This skill is the **process** for authoring one.

## Process

1. **Gather requirements** — ask the user:
   - What recurring task does the skill cover?
   - What goes wrong without it (which step does the agent currently miss)?
   - Is there a template, file, or existing implementation to anchor on?
   - Stack-specific or generic enough to keep in the boilerplate?

2. **Draft `SKILL.md`** in `.ai/skills/<skill-name>/SKILL.md`:
   - Frontmatter: `name`, `description: >-` (multi-line), `last_reviewed: <today>`. Add `source: boilerplate` + `source_version: <current>` only if shipping upstream.
   - Body: be **prescriptive** — tell the agent what to do, not what exists. Numbered steps. Checklist at the end.
   - Include a concrete code/template snippet when structure matters.
   - **Link to related skills** when a step depends on another skill (e.g. a "create feature" skill links to `models/SKILL.md` and `query/queries/SKILL.md`). Use relative Markdown links so the agent can chain-load them.

3. **Add index entry** to `.ai/instructions.md` skills table. **A skill with no index row is invisible to the agent.**

4. **Review with user** — show draft, ask:
   - Covers the trigger cases?
   - Anything missing or over-specified?
   - Description includes the right keywords for the agent to match on?

## Description writing

The description is the only thing the agent sees when picking skills. It must:

- Lead with **what task** the skill applies to (1 sentence).
- End with **when to load it** — concrete triggers, file types, keywords.
- Stay under ~280 chars.

Good: `Enforce grouped and ordered imports in all code files. Apply whenever creating or editing any file that contains imports.`

Bad: `Helps with imports.` (no trigger, no scope)

## When to split into multiple files

Keep `SKILL.md` under ~100 lines. Split when:

- Content has distinct domains (queries vs mutations).
- Reference material is large and rarely needed (move to `REFERENCE.md` next to `SKILL.md`).
- You have deterministic logic worth scripting — put it under `.ai/scripts/` (not inside the skill folder) and reference it from `SKILL.md`.

## Validation

Run `pnpm validate:ai-config` (or `node .ai/scripts/validate-config.mjs`) before committing. Catches:

- Skill folder with no index entry.
- Index row pointing at a missing path.
- Missing or invalid `last_reviewed`.

## Checklist

1. Folder created at `.ai/skills/<skill-name>/SKILL.md`.
2. Frontmatter has `name`, `description`, `last_reviewed: <today>`.
3. Body is prescriptive, numbered, with a closing checklist.
4. Description includes "Use when…" / explicit triggers.
5. Index row added to `.ai/instructions.md`.
6. `pnpm validate:ai-config` passes.
