# AI Config Boilerplate

**Version: 1.8.0** — last updated 2026-05-04

A ready-to-copy template for wiring up a consistent AI configuration across any project — regardless of which tool your team uses.

## The problem it solves

Teams rarely use a single AI tool. Some people use Claude Code, others use Cursor, Windsurf, or open-source models. Each tool has its own entry-point convention, so without a shared setup, every developer gets a different quality of AI assistance — or none at all.

This boilerplate solves that by separating two things:

- **Tool entry points** — thin files each tool knows to look for, one per tool.
- **Shared knowledge** — the actual conventions, skills, and guides that live in `.ai/` and are pointed to by every entry point.

The knowledge lives in one place. Every tool reads it.

---

## Structure

```
.
├── CLAUDE.md                        # Claude Code entry point
├── AGENTS.md                        # Google Antigravity + cross-tool fallback
├── GEMINI.md                        # Gemini CLI entry point
├── .cursor/rules/project.mdc        # Cursor entry point
├── .windsurfrules                   # Windsurf entry point
├── .github/copilot-instructions.md  # GitHub Copilot entry point
├── .husky/
│   └── pre-commit                   # Git hook — runs validation when .ai/ files change
│
└── .ai/
    ├── instructions.md              # The operating manual (fill this in)
    ├── scripts/
    │   └── validate-config.mjs      # Validation script — checks skills index integrity
    ├── skills/
    │   ├── README.md                # What skills are and how to write them
    │   ├── import-order/SKILL.md    # Generic: import grouping + ordering
    │   ├── translations-typed-i18n/SKILL.md  # Generic: typed i18n key management
    │   ├── write-a-skill/SKILL.md   # Meta: how to author a new skill
    │   ├── grill-me/SKILL.md        # Process: stress-test a plan before coding
    │   └── commit-messages/SKILL.md # Generic: Conventional Commits format
    ├── workflow/
    │   ├── README.md                # What workflow guides are and how to write them
    │   └── build-feature/guide.md   # Generic: end-to-end feature workflow
    ├── agents/
    │   ├── README.md                # What agents are and how to define them
    │   ├── pr-review/AGENT.md       # Reviews PRs against project conventions
    │   └── ai-config-audit/AGENT.md # Audits skills for staleness and semantic drift
    └── context/
        ├── README.md                        # What reference docs go here and why
        └── react-performance/               # Vercel's React perf skill (MIT, verbatim)
            ├── SKILL.md                     # Index of 65 rules by category
            ├── AGENTS.md                    # Full compiled guide (one file)
            ├── README.md                    # Vercel's own README
            └── rules/                       # 65 individual rule files
```

### Entry points

Each file is a thin stub — it identifies the project, lists the `.ai/` folder layout, and tells the AI to read `.ai/instructions.md` for the full picture. They are intentionally short so the real knowledge stays in one place and never gets out of sync.

| File | Tool |
|---|---|
| `CLAUDE.md` | Claude Code |
| `AGENTS.md` | Google Antigravity (also picked up by Claude Code and others as a cross-tool fallback) |
| `GEMINI.md` | Gemini CLI |
| `.cursor/rules/project.mdc` | Cursor |
| `.windsurfrules` | Windsurf |
| `.github/copilot-instructions.md` | GitHub Copilot |

### `.ai/` — the knowledge base

| Path | Purpose |
|---|---|
| `instructions.md` | Project operating manual: stack, repo map, conventions, dev commands, and the skills index. This is the main file to fill in. |
| `skills/` | Task recipes — step-by-step instructions for recurring implementation tasks (e.g. "how to add a query hook"). One skill per folder, each named `SKILL.md`. |
| `workflow/` | Feature-level guides that orchestrate multiple skills in order (e.g. "how to build a list view end to end"). |
| `agents/` | Definitions for purpose-built agents scoped to specific recurring jobs (e.g. a PR reviewer, a migration checker). |
| `context/` | Reference knowledge for specific libraries, UI kits, or APIs — consulted when the AI needs to use something with non-obvious conventions. |

---

## How to use

> **Want to skip the manual steps?** Hand off this whole workflow to an AI session using [`APPLY_PROMPT.md`](APPLY_PROMPT.md) — a reusable prompt that copies the boilerplate into a target repo, replaces placeholders, wires husky, and runs the validator. Useful for onboarding a new repo without remembering the steps below.

### 1. Copy into your project root

```bash
cp -r boilerplate/. your-project/
```

### 2. Replace `{{project-name}}`

Find and replace all occurrences of `{{project-name}}` across the entry-point files with your actual project name.

### 3. Fill in `.ai/instructions.md`

This is the only file with real content to write. Fill in:
- Project stack and entry points
- Repo map (top-level folders and what goes where)
- Key conventions ("if you're adding X, do Y")
- Dev commands
- Skills index (add rows as you create skills)

Everything else starts empty — the READMEs explain what to add and when.

### 4. Add skills as you go

Don't try to write all your skills upfront. Add a skill when you notice the AI getting a recurring task wrong, or when a pattern in your codebase is non-obvious enough to warrant guidance. Each skill lives in its own folder:

```
.ai/skills/
  <skill-name>/
    SKILL.md
```

Then add a row to the skills index in `.ai/instructions.md`.

### 5. Set up commit hooks

The boilerplate ships a validation script at `.ai/scripts/validate-config.mjs` that catches mechanical drift automatically:

- A `SKILL.md` file exists with no entry in the skills index
- The skills index references a path that doesn't exist
- A `SKILL.md` is missing the `last_reviewed` frontmatter field
- A skill's `last_reviewed` is older than 90 days (warning only — doesn't block)

The boilerplate already ships `.husky/pre-commit` and `.ai/scripts/validate-config.mjs`. You just need to install Husky and add two entries to `package.json`.

**Install Husky** (pick your package manager):

```bash
# pnpm
pnpm add -D husky

# npm
npm install --save-dev husky

# yarn
yarn add --dev husky
```

**Add to `package.json`:**

```json
"scripts": {
  "validate:ai-config": "node .ai/scripts/validate-config.mjs",
  "prepare": "husky"
}
```

The `prepare` script is the key part — it runs automatically on `install`, so every teammate gets the hooks wired up as soon as they run `pnpm install` (or npm/yarn equivalent). No manual hook setup needed after the initial configuration.

You can also run the validator manually at any time:

```bash
pnpm validate:ai-config
# or: node .ai/scripts/validate-config.mjs
```

---

## Design principles

**One source of truth.** All real knowledge lives in `.ai/`. Entry points are just doors — they don't contain conventions, they point to them.

**Tool-agnostic content.** Everything in `.ai/` is plain Markdown. No proprietary syntax, no tool-specific features. Any AI tool that can read files benefits from it.

**No ambiguity between concepts.** The folder names are intentional:
- `skills/` = how to do a task
- `workflow/` = how to build a feature (orchestrates skills)
- `agents/` = definitions of purpose-built workers (not instructions for workers)
- `context/` = reference knowledge about external things (libraries, APIs)

**Grow it incrementally.** The boilerplate ships with READMEs, not pre-filled content. A project with three well-written skills is more useful than one with ten half-baked ones.

---

## Keeping projects in sync

Each project initialized from this boilerplate is a snapshot. When the boilerplate improves, existing projects won't automatically get the update.

**Tooling:**

- `consumers.json` at the repo root lists every consumer with stack tags, instructions-index format, and per-repo opt-outs (`skip`).
- `pnpm drift` (or `node scripts/check-drift.mjs`) walks every consumer and reports each sourced file as `ok` / `skipped` / `missing` / `behind` / `edited` / `ahead` / `detached`. Read-only.
- [`MAINTAINING.md`](MAINTAINING.md) is the maintainer runbook for shipping a change end-to-end (drift → branch `chore/ai-boilerplate` → copy → bump version + index row → validate → commit → push). Read it before each propagation.

**Conventions:**

- Standing branch on every consumer for syncs is `chore/ai-boilerplate`.
- `skip` is a contract: a consumer that intentionally doesn't carry a sourced file must declare it. "Missing" is never silent.
- A consumer that forks a sourced file must remove the `source: boilerplate` marker AND add the path to `skip`, so drift stops flagging it.

## Claude Code plugin distribution

Generic skills also ship as a Claude Code plugin under `plugins/autodoc-ai/`, distributed via the `autodoc` marketplace declared at `.claude-plugin/marketplace.json`. Devs install it once and get every skill in every Claude Code session — no per-repo copy needed.

```
/plugin marketplace add bbdiv/ai-boilerplate
/plugin install autodoc-ai@autodoc
```

The plugin and the project boilerplate are complementary, not redundant:

- **Plugin** ships skills at the user level — apply everywhere a dev works.
- **Boilerplate** ships skills at the project level via copy — paired with project-specific `instructions.md`, agents, workflows, and context bundles that don't make sense at the user level.

Project-side skills override plugin skills in any repo where both are present. See [`plugins/autodoc-ai/README.md`](plugins/autodoc-ai/README.md) for what's in the bundle and how updates flow.

## Changelog

### 1.8.0 — 2026-05-04
- Added `.ai/skills/commit-messages/SKILL.md` — Conventional Commits format reference (type list, subject rules, examples, anti-patterns, project-specific scopes).
- Indexed in `.ai/instructions.md` so agents pick it up when authoring any commit.
- Marked `source: boilerplate` + `source_version: 1.8.0` for upstream sync tracking.

### 1.7.0 — 2026-05-04
- Added `.ai/skills/grill-me/SKILL.md` — process skill for stress-testing a plan or design before implementation. Walk the decision tree one question at a time, recommend an answer per question, prefer reading the codebase over asking when the answer is derivable. Adapted from Matt Pocock's `grill-me` skill (`github.com/mattpocock/skills`).
- Indexed in `.ai/instructions.md` so agents pick it up on triggers like "grill me" or when a non-trivial feature has open decisions.
- Linked from `.ai/workflow/build-feature/guide.md` step 1 as an optional pre-step when scope/data shape/edge cases are not yet aligned.
- Marked `source: boilerplate` + `source_version: 1.7.0` for upstream sync tracking.

### 1.6.0 — 2026-04-30
- Added `.ai/skills/write-a-skill/SKILL.md` — meta-skill that walks an agent through authoring a new skill (gather → draft → index → review). Complements `.ai/skills/README.md`: README is the static format spec for humans browsing the folder; the new skill is the prescriptive, agent-loadable process.
- Indexed in `.ai/instructions.md` so agents pick it up when the user asks to "create a skill" or "scaffold a skill".
- Slimmed `.ai/skills/README.md`: removed prescriptive "Tips for writing good skills" section (now lives in `write-a-skill/SKILL.md` as the description-writing guide and split-files heuristics). README now sits as static reference (what is a skill, format, done checklist, example structure) and points to the skill for the authoring process.
- Marked `source: boilerplate` + `source_version: 1.6.0` for upstream sync tracking.

### 1.5.0 — 2026-04-24
- Shipped the full Vercel React Best Practices bundle under `.ai/context/react-performance/` — previously only the category index was copied. Now includes:
  - `SKILL.md` — the 65-rule index (Vercel's entry point).
  - `AGENTS.md` — Vercel's compiled full guide.
  - `README.md` — Vercel's own README covering rule structure and tooling.
  - `rules/` — 65 individual rule files (plus `_sections.md` + `_template.md`).
- Agents can now load a specific rule on demand (e.g. `rules/bundle-barrel-imports.md`) instead of being stuck with just the index. All content is MIT-licensed and attributed to Vercel in the original frontmatter.
- `source: boilerplate` + `source_version: 1.5.0` marker added to `SKILL.md` (treated as the entry point of the bundled artifact — update the whole folder together on upstream bumps).
- `build-feature/guide.md` updated to point at the bundle's `SKILL.md` and `rules/` instead of the removed `index.md`.

### 1.4.0 — 2026-04-23
- Added `source: boilerplate` + `source_version: <version>` frontmatter markers on every file shipped by the boilerplate (skills, agents, workflow guides, context docs). Purpose: on an upstream bump, teams can grep/filter for sourced files and decide what to replace without touching project-local additions.
- Extended `validate-config.mjs` to print a "Boilerplate-sourced files" inventory at the end of its report.
- Convention: project-local files (team-written skills/agents/workflows) **omit** the `source` field. Only files intended to stay in sync with the upstream carry it.

### 1.3.0 — 2026-04-22
- Shipped first batch of generic skills (realizing the "future intent" noted in `DECISIONS.md` #9):
  - `.ai/skills/import-order/SKILL.md` — 5-group import ordering rule.
  - `.ai/skills/translations-typed-i18n/SKILL.md` — typed i18n key management pattern.
  - `.ai/workflow/build-feature/guide.md` — end-to-end feature workflow (models → API → queries → forms → UI → i18n → verify).
  - `.ai/context/react-performance/index.md` — Vercel's React performance rules index (MIT-licensed, credited).
- Removed `.ai/skills/_example/` — replaced by the real skills above, which now serve as the copy-and-adapt starting point.
- Updated `.ai/instructions.md` with real index entries for the new skills and workflow; left a commented list of stack-specific skills teams commonly add on top (queries, mutations, forms, components, models, icons).

### 1.2.0 — 2026-04-22
- Added `GEMINI.md` entry point for Gemini CLI.
- Added `boilerplate_version` frontmatter in `.ai/instructions.md` for machine-readable version tracking — the validator now reports which boilerplate version a project was initialized from.
- Shipped `.husky/pre-commit` (previously described in docs but missing from the template).
- Shipped `.ai/skills/_example/SKILL.md` so validation passes on a fresh checkout and teams have a copy-paste starting point.
- Validator: rejects invalid `last_reviewed` dates (was silently treated as "stale"), checks `AGENT.md` frontmatter (`name`, `description`), cross-checks `workflow/*/guide.md` against the Workflow guides section, strips HTML comments before parsing so commented example rows are no longer treated as real index entries.

### 1.1.0 — 2026-04-10
- Added `last_reviewed` to skill frontmatter template to surface stale skills.
- Added `agents/` folder and PR review agent template.
- Added skills index reminder: a skill with no index entry is invisible to the agent.
- Standardized wording across all entry-point files.

### 1.0.0 — 2026-04-10
- Initial release: entry points for Claude Code, Antigravity, Cursor, Windsurf, Copilot.
- `.ai/` knowledge base with `instructions.md`, `skills/`, `workflow/`, `agents/`, `context/`.
