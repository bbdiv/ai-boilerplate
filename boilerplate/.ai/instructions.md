# Project operating manual — {{project-name}}

## Mandatory workflow — no exceptions

For **every task**, regardless of size or complexity, you must follow `.ai/workflow/task-validation-review/guide.md` in full:

1. **Validate** — restate the task, list acceptance criteria, confirm out-of-scope and constraints. Wait for explicit user confirmation before writing any code.
2. **Implement** — follow relevant skills from `.ai/skills/`.
3. **PR review** — run `.ai/agents/pr-review/AGENT.md`. Fix all `❌` findings.
4. **QA review** — run `.ai/agents/qa-review/AGENT.md` against the acceptance criteria.
5. **Report** — present the closing summary defined in the workflow, including a **"Flows used"** table that lists every agent, skill, workflow, and rule that was loaded or applied during the task.

> A task that feels too simple to validate is not exempt. The validation step exists precisely for those cases.

## AI config layout

- **`.ai/skills/`** — executable guidance: task recipes to follow when implementing specific types of work.
- **`.ai/workflow/`** — higher-level guides for feature-sized tasks.
- **`.ai/agents/`** — purpose-built agent definitions scoped to specific recurring tasks.
- **`.ai/context/`** — reference knowledge: UI kit docs, API conventions, library guides.

## Project snapshot

- **Stack**: {{e.g. React 18 + TypeScript}}
- **Data fetching**: {{e.g. TanStack Query}}
- **Forms**: {{e.g. TanStack React Form}}
- **Styling**: {{e.g. styled-components / Tailwind}}
- **Entry point**: {{e.g. src/index.tsx}}
- **Routes**: {{e.g. src/routes/}}

## Golden rules (do these by default)

- **Prefer existing patterns** in `src/` and in `.ai/skills/` over inventing new ones.
- **Keep changes small and consistent** with surrounding code style.
- **No secrets**: never add tokens/keys, never commit `.env`-like files.

## Repo map (where things go)

<!--
  Keep this high-level — top-level folders and their purpose only.
  Example:

  - `src/views/`       — page/feature folders (route-level UI)
  - `src/components/`  — reusable UI building blocks shared across views
  - `src/@apis/`       — API client modules grouped by resource/domain
  - `src/@query/`      — data fetching hooks (queries + mutations)
  - `src/@models/`     — shared TypeScript types/interfaces
  - `src/@hook/`       — shared hooks
-->

## "If you're adding X, do Y"

<!--
  Explicit conventions for the most common additions.
  Example:

  - **New page / feature**: create a folder under `src/views/<Feature>/`
  - **New reusable component**: put it under `src/components/`
  - **New backend integration**: API module → query/mutation hook → types
-->

## Dev workflow (commands)

- **Dev**: `{{dev command}}`
- **Build**: `{{build command}}`
- **Lint**: `{{lint command}}`
- **Format**: `{{format command}}`

## Skills index

<!--
  List each skill and when to use it. Agents load skills on demand — only
  when the task matches. Keep descriptions short so the agent can decide
  quickly whether a skill applies.

  Example:

  | Task type                        | Skill                                          |
  |----------------------------------|------------------------------------------------|
  | Any multi-layer feature/change   | `.ai/skills/SKILL.md`                          |
  | Data fetching                    | `.ai/skills/query/queries/SKILL.md`            |
  | Write operations / mutations     | `.ai/skills/query/mutations/SKILL.md`          |
  | Forms                            | `.ai/skills/forms/SKILL.md`                    |
  | New components                   | `.ai/skills/create-components/SKILL.md`        |
  | TypeScript models/types          | `.ai/skills/models/SKILL.md`                   |
  | Import ordering                  | `.ai/skills/import-order/SKILL.md`             |
  | Translations / i18n              | `.ai/skills/translations/SKILL.md`             |
-->

## Workflow guides

<!--
  List higher-level feature workflow guides.
  Example:

  - New list view:        `.ai/workflow/create-list-view/guide.md`
  - New detail/edit view: `.ai/workflow/create-detail-edit-view/guide.md`
-->
