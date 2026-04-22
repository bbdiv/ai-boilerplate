# AI Config — Design Decisions & Reasoning

This document captures the key decisions made when designing this AI config structure, and the reasoning behind each one. It exists so that future contributors understand *why* things are the way they are, not just what they are.

---

## 1. Why a shared `.ai/` folder instead of per-tool configs?

**Problem:** Teams use multiple AI tools — Claude Code, Cursor, Windsurf, Antigravity, open-source models. Each has its own entry-point convention. Without a shared structure, every developer gets a different (or no) AI guidance.

**Decision:** Keep all real knowledge in `.ai/`. Each tool gets a thin entry-point file that just points to `.ai/instructions.md`. Knowledge lives in one place; tools are just doors.

**Entry points:**
| File | Tool |
|---|---|
| `CLAUDE.md` | Claude Code |
| `AGENTS.md` | Google Antigravity + cross-tool fallback |
| `GEMINI.md` | Gemini CLI |
| `.cursor/rules/project.mdc` | Cursor |
| `.windsurfrules` | Windsurf |
| `.github/copilot-instructions.md` | GitHub Copilot |

---

## 2. Why `instructions.md` instead of `project.md` or `AGENTS.md`?

**`project.md` was rejected** — vague, doesn't tell you what the file *is*.

**`AGENTS.md` was considered but rejected as the main knowledge file** — it's ambiguous. It could mean "instructions for agents to follow" OR "something about/defining agents". If you later add an `agents/` folder, `AGENTS.md` next to it would be confusing. `AGENTS.md` is kept at the root as a tool entry point (for Antigravity), not as the knowledge file.

**`instructions.md` was chosen** — unambiguous. It's the instructions. Since it already lives inside `.ai/`, the folder provides the "this is for AI" context; the filename just needs to say what kind of file it is.

---

## 3. Why separate `skills/`, `workflow/`, `agents/`, and `context/` folders?

Each folder has a distinct concept with no overlap:

| Folder | What it contains | When to use it |
|---|---|---|
| `skills/` | How to do a specific task (e.g. "how to add a query hook") | Recurring implementation tasks |
| `workflow/` | How to build a full feature, orchestrating multiple skills in order | Feature-sized work touching multiple layers |
| `agents/` | Definitions of purpose-built workers with narrow scope | Recurring jobs that can run autonomously |
| `context/` | Reference knowledge about external things (libraries, UI kits, APIs) | When the AI needs to use something with non-obvious conventions |

The key distinction between `skills/` and `agents/`: skills are instructions *for* the AI during a task. Agents are definitions *of* a worker with a specific job. Mixing them would make it impossible to know whether a file describes how to do something or who to delegate to.

---

## 4. Why did we add a `Note for Antigravity` in `AGENTS.md`?

Google Antigravity has its own native skills system at `.agent/skills/` — executable skill packages with scripts, assets, and references. Our `.ai/skills/` are instruction-based markdown files (a completely different concept).

Without the explicit note, Antigravity would look for skills only in `.agent/skills/` and silently ignore everything in `.ai/skills/`. The note tells it: "these are instruction skills, not executable skills, and here's where to find them."

---

## 5. Why `last_reviewed` in skill frontmatter?

Skills go stale silently. When you rename a folder, switch libraries, or shift a convention, the skill doesn't break — it just starts giving wrong guidance. There's no error, no warning, nothing. `last_reviewed` makes staleness visible. Combined with the validation script, skills older than 90 days surface as warnings.

The `last_reviewed` date must be updated whenever a skill is verified as still accurate, not just when it's written. A skill that hasn't been reviewed after a major refactor is a liability.

---

## 6. Why Husky for the pre-commit hook instead of lint-staged?

lint-staged is well-suited for per-file transforms (ESLint, Prettier). The AI config validation is a *holistic structural check* — it cross-references the index against the disk, which requires seeing the full `.ai/skills/` tree at once. Per-file invocation doesn't make sense here.

Instead, a simple shell guard inside `.husky/pre-commit` checks whether any `.ai/` files are staged before running the validator. This avoids slowing down unrelated commits without introducing lint-staged as a dependency.

---

## 7. Why does the pre-commit hook only fire when `.ai/` files are staged?

The validation script is fast (milliseconds), but it's a matter of principle: commits that don't touch `.ai/` shouldn't pay the cost of AI config validation. Running it on every commit would train developers to associate the hook with noise, leading them to skip it.

---

## 8. Why two types of validation (script + agent)?

The script handles **mechanical checks** that are deterministic:
- Does the file exist? Is the index entry present? Is the frontmatter field there?

The agent handles **semantic checks** that require judgment:
- Is the skill's guidance still accurate after a refactor?
- Which skills need review after a library migration?

No script can read a skill and determine whether its instructions still match the current codebase. That requires reading both the skill and the code and comparing them — which is exactly what an AI agent is good at.

---

## 9. Why does the boilerplate ship READMEs instead of pre-filled skills?

Pre-filling skills would mean writing project-specific content (query hook patterns, component conventions) into a generic template. That content would either be too generic to be useful or too specific to apply to a different project.

Instead, the READMEs explain *how to create* skills, *when to create* them, and *what makes a good skill*. The actual skills grow organically as the team discovers what the AI gets wrong without guidance.

A project with three well-written, accurate skills is more valuable than one with ten half-baked ones copied from a template.

**Future intent:** the boilerplate will eventually ship a set of generic skills based on common development patterns (data fetching, forms, component structure, translations, etc.). These will serve as a starting point that teams can adapt rather than write from scratch — but they won't be added until the patterns are proven stable across multiple projects.

---

## 10. Known limitations

**`last_reviewed` relies on discipline.** There's nothing that verifies the content was actually reviewed — only that someone updated the date. The validation script enforces presence of the field, not accuracy of the review.

**The pre-commit hook can be bypassed** with `git commit --no-verify`. This is intentional — hooks should be a helpful guardrail, not an obstacle in emergencies.

**Weaker open-source models may not follow pointer chains.** The setup of `CLAUDE.md → .ai/instructions.md → load skill` works well for capable models. Weaker models running locally may stop at the first file. For teams heavily using open-source models, inlining critical conventions (folder structure, naming, import order) directly in the entry point is more reliable than pointer chains.

**Boilerplate drift.** Projects initialized from this boilerplate are snapshots. When the boilerplate improves, existing projects won't update automatically. Track which version a project was initialized from (visible in `boilerplate/README.md` changelog) and manually apply relevant changes. Long-term: move the boilerplate to a dedicated git repository.
