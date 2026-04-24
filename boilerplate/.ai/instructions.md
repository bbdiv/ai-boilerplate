---
boilerplate_version: 1.5.0
---

# Project operating manual — {{project-name}}

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

| Task type                                   | Skill                                                |
|---------------------------------------------|------------------------------------------------------|
| Any file with imports                       | `.ai/skills/import-order/SKILL.md`                   |
| Adding/editing i18n keys                    | `.ai/skills/translations-typed-i18n/SKILL.md`        |

<!--
  Add rows above as you create more skills. Keep descriptions short —
  agents scan this table to decide whether to load a skill.

  Recommended skills to add when the stack calls for them (not shipped
  generically because they're framework/library-specific):

  | Task type                        | Skill                                          |
  |----------------------------------|------------------------------------------------|
  | Data fetching (queries)          | `.ai/skills/query/queries/SKILL.md`            |
  | Write operations (mutations)     | `.ai/skills/query/mutations/SKILL.md`          |
  | Forms                            | `.ai/skills/forms/SKILL.md`                    |
  | New components                   | `.ai/skills/create-components/SKILL.md`        |
  | TypeScript models/types          | `.ai/skills/models/SKILL.md`                   |
  | Icons                            | `.ai/skills/icons/SKILL.md`                    |
-->

## Workflow guides

- Any multi-layer feature / change: `.ai/workflow/build-feature/guide.md`

<!--
  Additional workflow guides teams commonly add on top of the generic one:

  - New list view:        `.ai/workflow/create-list-view/guide.md`
  - New detail/edit view: `.ai/workflow/create-detail-edit-view/guide.md`
-->
