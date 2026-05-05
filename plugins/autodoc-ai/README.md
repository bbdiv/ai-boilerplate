# `autodoc-ai` — Claude Code plugin

Bundles Autodoc engineering skills so any Claude Code user on the team gets the same conventions without per-repo setup. Skills auto-surface and are also invocable as `/autodoc-ai:<skill-name>`.

## What's in it

- `commit-messages` — Conventional Commits format reference (type list, subject rules, project scopes, anti-patterns).
- `grill-me` — Stress-test a plan or design via relentless one-question-at-a-time interview before implementation.
- `write-a-skill` — Author a new skill (gather → draft → index → review).
- `import-order` — 5-group import ordering rule for any file with imports.
- `translations-typed-i18n` — Manage typed i18n keys across locale files and the typed-key definition.

The last two are stack-specific (React + i18n). They will surface in unrelated projects too — turn them off in the plugin settings if they're noise.

## Install

This plugin lives inside the [`autodoc` marketplace](../../.claude-plugin/marketplace.json) at the repo root.

```
/plugin marketplace add bbdiv/ai-boilerplate
/plugin install autodoc-ai@autodoc
```

For background auto-updates, set `GITHUB_TOKEN` in your shell environment (the marketplace lives in a private repo; non-interactive auth is required for unattended updates).

## Updates

The plugin omits its `version` field, so the version is derived from the git commit SHA. Every push to the default branch produces a new version. Devs receive updates automatically the next time Claude Code refreshes the plugin.

## Relationship to the project boilerplate

The `boilerplate/` directory at the repo root is a separate concern — it's the file template projects copy into themselves, with a `.ai/` config that lives per repo. This plugin ships the **same skills** but at the user level, so devs get them in every Claude Code session regardless of which repo they're in.

If a repo also carries a project copy of one of these skills via the boilerplate template, the project copy wins for that repo (project skills override user/plugin skills in Claude Code).

## Drift between plugin and boilerplate

Skill content is currently duplicated: each skill lives both in `boilerplate/.ai/skills/<name>/SKILL.md` (project-side, with `last_reviewed` / `source` frontmatter) and in `plugins/autodoc-ai/skills/<name>/SKILL.md` (plugin-side, with only `description`).

Update both when changing a skill. A future improvement would be to render the plugin copy from the boilerplate copy at commit time.
