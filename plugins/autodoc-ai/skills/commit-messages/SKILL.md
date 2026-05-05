---
description: >-
  Write git commit messages in Conventional Commits format. Apply whenever authoring a commit (interactive or automated). Keeps history scannable and enables tooling on top (changelog, release-please, semantic version bumps).
---

# Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org). The format is mechanical; the discipline is in keeping the subject focused and explaining *why* in the body when "what" isn't enough.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **`<type>`** — one of: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `style`, `build`, `ci`, `revert`.
- **`<scope>`** — optional but encouraged. The module, feature area, or sub-system touched (e.g. `auth`, `api`, `ai-config`, `i18n`).
- **`<subject>`** — imperative present tense ("add", "fix", "update" — not "added", "fixed"). Lowercase. ≤72 characters. No trailing period.
- **`<body>`** — optional. Wrap at 72 columns. Explain *why* the change was made. Skip when the subject is self-explanatory.
- **`<footer>`** — optional. `BREAKING CHANGE: …`, issue refs (`Closes #123`), `Co-Authored-By:` lines.

## Type reference

| Type      | When to use                                                |
|-----------|------------------------------------------------------------|
| `feat`    | New end-user feature or capability.                        |
| `fix`     | Bug fix that changes runtime behavior.                     |
| `chore`   | Tooling, config, dependencies, no end-user impact.         |
| `docs`    | Documentation only — README, comments, JSDoc.              |
| `refactor`| Restructure code without changing behavior.                |
| `test`    | Add or update tests; no production code change.            |
| `perf`    | Performance improvement.                                   |
| `style`   | Formatting, whitespace, lint fixes (no logic change).      |
| `build`   | Build system, bundler, packaging.                          |
| `ci`      | CI configuration (GitHub Actions, husky, hooks).           |
| `revert`  | Revert a previous commit. Reference the SHA in the body.   |

## Scopes used in this project

Pick the most specific scope that fits. If unsure, omit the scope rather than inventing one.

- `ai-config` — anything inside `.ai/` (skills, agents, workflows, instructions, scripts).
- *(add project-specific scopes here)*

## Examples

```
feat(auth): allow login with corporate AD account

The legacy /login endpoint already supports AD; expose it from the UI so
domain users stop falling back to the manual form.
```

```
fix(api): retry POST /orders on 502 from upstream

The gateway intermittently returns 502 during deploys. Retry once before
surfacing the error to the user.

Closes #482
```

```
chore(ai-config): sync grill-me skill from boilerplate v1.7.0
```

```
refactor(query): extract pagination logic into useTablePagination
```

## Anti-patterns

- ❌ `update files` — meaningless subject.
- ❌ `WIP` — never on `main`. Squash before merge.
- ❌ `fix bug` — say *which* bug.
- ❌ `Added X` — wrong tense; use imperative `add X`.
- ❌ Mixing two unrelated changes in one commit. Split them.
- ❌ Subject longer than 72 chars. Move detail to the body.

## Checklist before committing

1. Type matches the actual change category (not always `feat`/`fix`).
2. Subject is imperative, lowercase, ≤72 chars.
3. Body added if *why* isn't obvious from the subject.
4. No unrelated changes bundled in.
5. Footer references issues or breaking changes when applicable.
