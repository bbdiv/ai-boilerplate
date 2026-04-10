# CLAUDE.md — {{project-name}}

Read **`.ai/instructions.md`** — it is the full project operating manual (stack, repo map, conventions, skills index).

## AI config layout

- **`.ai/skills/`** — executable guidance: task recipes to follow when implementing specific types of work.
- **`.ai/workflow/`** — higher-level guides for feature-sized tasks (e.g. building a full list view).
- **`.ai/agents/`** — purpose-built agent definitions scoped to specific recurring tasks.
- **`.ai/context/`** — reference knowledge: UI kit docs, API conventions, library guides.

## How to use skills and workflows

Each skill is a Markdown file with step-by-step instructions. When your task matches one, read and follow it before writing code. The full list of available skills and when to use each one is in `.ai/instructions.md`.
