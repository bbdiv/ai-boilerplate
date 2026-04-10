# AGENTS.md — {{project-name}}

Read **`.ai/instructions.md`** — it is the full project operating manual (stack, repo map, conventions, skills index).

## AI config layout

- **`.ai/skills/`** — executable guidance: task recipes to follow when implementing specific types of work.
- **`.ai/workflow/`** — higher-level guides for feature-sized tasks (e.g. building a full list view).
- **`.ai/agents/`** — purpose-built agent definitions scoped to specific recurring tasks.
- **`.ai/context/`** — reference knowledge: UI kit docs, API conventions, library guides.

## How to use skills and workflows

Each skill is a Markdown file with step-by-step instructions. When your task matches one, read and follow it before writing code. The full list of available skills and when to use each one is in `.ai/instructions.md`.

## Note for Antigravity

This project uses **`.ai/skills/`** for AI instruction skills — Markdown files that tell you how to implement specific tasks. These are **not** the same as Antigravity's native executable skills (`.agent/skills/`), which are script-based tool extensions.

When working on a task, read the relevant skill from `.ai/skills/` before writing code. The full index of available skills and when to use each one is in `.ai/instructions.md`.
