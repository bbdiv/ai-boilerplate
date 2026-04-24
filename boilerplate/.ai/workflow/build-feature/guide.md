---
source: boilerplate
source_version: 1.5.0
---

# Workflow: Build a feature end-to-end

Use this when adding functionality that touches multiple layers (data shape, API, data fetching, UI, i18n). Skip any step that doesn't apply.

## Steps

### 1. Understand before coding

Read the relevant existing code. Check what already exists — models, API functions, query/mutation hooks, components, translations. Reuse before inventing.

### 2. Models first

Define or update the TypeScript types and interfaces the feature needs. Models are pure data shapes — no logic.

### 3. API layer

Add or update API client functions. Keep them in the project's existing API module structure, grouped by resource/domain.

### 4. Queries & mutations

Wrap API calls in query hooks (reads) and mutation hooks (writes). Keep query keys stable and structured (entity + params). For mutations, choose between invalidation and targeted cache updates.

### 5. Forms (if applicable)

Define form types and default values near the form component. Reuse the project's form utilities and validators rather than building new ones.

### 6. Components & UI

Build the UI. Compose from the project's UI kit first — only write custom components when the kit doesn't cover the need.

- Follow the project's import order — see `.ai/skills/import-order/SKILL.md`.

### 7. Translations

Add every user-facing string through the translation system. Update all locale files and the typed-key definition together.

- See `.ai/skills/translations-typed-i18n/SKILL.md`.

### 8. Verify

- TypeScript compiles without errors.
- Lint passes on all touched files.
- New files follow the project's folder and naming conventions.
- Imports follow the import-order skill.
- No raw user-facing strings were introduced.
- React performance patterns hold — see `.ai/context/react-performance/SKILL.md` for the index and `.ai/context/react-performance/rules/` for individual rule details.
