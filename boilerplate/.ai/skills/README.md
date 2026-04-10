# Skills

Skills are task recipes — Markdown files that tell an AI agent exactly how to implement a specific type of work in this project. They encode your team's conventions so the agent doesn't have to guess.

## When to create a skill

Create a skill when:
- The same type of task recurs (e.g. "add a query hook", "create a new component").
- There's a non-obvious convention the AI keeps getting wrong without guidance.
- A task involves multiple steps that must happen in a specific order.

## Skill file format

Each skill lives in its own folder and is named `SKILL.md`:

```
.ai/skills/
  <skill-name>/
    SKILL.md
```

Use this frontmatter at the top:

```markdown
---
name: skill-name
description: >-
  One or two sentences. What task does this skill apply to?
  This is what the agent reads to decide whether to load the skill.
last_reviewed: YYYY-MM-DD
---

# Skill title

Step-by-step instructions...
```

> **`last_reviewed` is required.** Update it whenever you verify the skill still reflects current conventions. A skill that hasn't been reviewed after a major refactor is a liability — it gives the agent wrong guidance silently.

## Definition of done for a skill

A skill is only "done" when:
- [ ] The `SKILL.md` file is written with a clear frontmatter description.
- [ ] `last_reviewed` is set to today's date.
- [ ] A row has been added to the skills index in `.ai/instructions.md`. **A skill with no index entry is invisible to the agent.**

## Tips for writing good skills

- **Be prescriptive, not descriptive.** Tell the agent what to do, not just what exists.
- **Short descriptions in the frontmatter** — the agent scans these to decide if the skill applies.
- **Link to related skills** when steps depend on another skill (e.g. a "create feature" skill can reference a "models" skill).
- **Include a template or example** for tasks where structure matters (e.g. component files, query hooks).

## Example structure

```
.ai/skills/
  SKILL.md                        ← top-level feature workflow (orchestrates others)
  models/SKILL.md                 ← how to define TypeScript types
  create-components/SKILL.md      ← how to build new UI components
  import-order/SKILL.md           ← import grouping rules
  query/
    queries/SKILL.md              ← how to add a query hook
    mutations/SKILL.md            ← how to add a mutation hook
  forms/SKILL.md                  ← how to build forms
  translations/SKILL.md           ← how to add i18n strings
```
