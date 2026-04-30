# Reusable prompt — apply this boilerplate to a repo

Paste the block below into a fresh Claude / Cursor / etc. session, then fill in
the two placeholders at the top: `<TARGET_REPO_PATH>` and `<TARGET_BRANCH>`.

The prompt assumes:
- This boilerplate lives at `C:/Users/bb/Documents/autodoc/ai boilerplate/boilerplate/`.
  If you've moved it (e.g. cloned a public repo), adjust `<BOILERPLATE_PATH>`.
- The target repo already has a `package.json` (so we know how to wire the husky
  scripts).

---

```
You are going to apply our shared AI-config boilerplate to a repo. Be careful,
don't commit anything — just make the file changes and run the validator.

Inputs:
- BOILERPLATE_PATH:  C:/Users/bb/Documents/autodoc/ai boilerplate/boilerplate
- TARGET_REPO_PATH:  <TARGET_REPO_PATH>
- TARGET_BRANCH:     <TARGET_BRANCH>           # usually develop
- PROJECT_NAME:      <leave blank to use the folder name>

What the boilerplate ships (read BOILERPLATE_PATH/README.md for the full intent):
- Entry stubs at repo root + tool-specific paths:
    CLAUDE.md, AGENTS.md, GEMINI.md, .windsurfrules,
    .cursor/rules/project.mdc, .github/copilot-instructions.md
- A .ai/ knowledge base with: instructions.md, scripts/validate-config.mjs,
  skills/, workflow/, agents/, context/react-performance/
- A .husky/pre-commit hook that runs the validator only when .ai/ files are
  staged
- All entry stubs contain the literal placeholder {{project-name}} which must
  be replaced with the actual project name.

Steps:

1. Switch the target repo to the requested branch.
   - `git -C <TARGET_REPO_PATH> fetch origin <TARGET_BRANCH>:<TARGET_BRANCH>`
     if the branch doesn't exist locally.
   - `git -C <TARGET_REPO_PATH> checkout <TARGET_BRANCH>`
   - `git status` MUST be clean before you proceed; if not, stop and ask.

2. Survey what's already there. For each of these paths, decide overwrite vs.
   merge before doing anything:
   - Repo root: CLAUDE.md, AGENTS.md, GEMINI.md, .windsurfrules
   - .cursor/rules/project.mdc
   - .github/copilot-instructions.md
   - .ai/ (full tree — but watch for a pre-existing project-specific .ai/)
   - .husky/pre-commit

   Rules:
   - If the entry stubs don't exist, copy them over and replace
     {{project-name}}.
   - If a stub already exists AND looks like a previous version of this
     boilerplate (same shape, references .ai/instructions.md), overwrite.
   - If a stub looks bespoke / project-authored, ask the user before
     overwriting.
   - If `.ai/` already exists with project-specific skills/workflows, DO NOT
     blow it away. Merge instead — see step 6.
   - If `.husky/pre-commit` already exists with project hooks (lint-staged,
     etc.), DO NOT overwrite. Append the AI-config check at the end:

       # AI config validation — only runs when .ai/ files are staged.
       if git diff --cached --name-only | grep -q '^\.ai/'; then
         echo "[ai-config] .ai/ files staged — running validation..."
         node .ai/scripts/validate-config.mjs || exit 1
       fi

3. Copy the boilerplate into place (for fresh installs):
   - Copy CLAUDE.md, AGENTS.md, GEMINI.md, .windsurfrules to repo root
   - Copy .cursor/rules/project.mdc
   - Copy .github/copilot-instructions.md
   - Copy the entire .ai/ tree
   - Copy .husky/pre-commit (only if no existing pre-commit; otherwise append
     as in step 2)
   - Make .husky/pre-commit executable (chmod +x).

4. Replace the {{project-name}} placeholder in every entry-point file
   (CLAUDE.md, AGENTS.md, GEMINI.md, .windsurfrules,
   .cursor/rules/project.mdc, .github/copilot-instructions.md, and
   .ai/instructions.md). Use sed -i or equivalent. PROJECT_NAME defaults to
   the basename of TARGET_REPO_PATH if not provided.

5. Wire husky and the validator into package.json. Detect the package
   manager:
   - If package.json has a `packageManager` field → use that.
   - Else if pnpm-lock.yaml exists → pnpm.
   - Else if yarn.lock exists → yarn.
   - Else if package-lock.json exists → npm.
   - Else inspect .github/workflows/* for "yarn install" / "npm install" /
     "pnpm install" hints.
   - If still unclear, ask the user.

   Edits to package.json:
   - Add script `"validate:ai-config": "node .ai/scripts/validate-config.mjs"`
     if missing.
   - If `husky` is NOT already in devDependencies:
       - Add `"husky": "^9.1.7"` to devDependencies (sorted).
       - Add `"prepare": "husky"` to scripts (the v9 form is just `husky`,
         not `husky install`).
   - If `husky` IS already in devDependencies (v8 or earlier with
     `prepare: "husky install"`):
       - Don't downgrade or change the version.
       - Don't change the existing prepare script.
       - Just add `validate:ai-config`.
   - DO NOT run any package manager install command. The user installs and
     commits the lockfile change themselves.

6. If the target repo had a pre-existing `.ai/` from an older boilerplate
   version, sync only what's safe:
   - Rename `.ai/project.md` → `.ai/instructions.md` if applicable.
   - Read the boilerplate version from the very first frontmatter block of
     BOILERPLATE_PATH/.ai/instructions.md (key: boilerplate_version). Use
     that exact value when adding the same key to the target's
     instructions.md if missing — do NOT hardcode a version here.
   - Move `.ai/vercel-react-best-practices/` → `.ai/context/react-performance/`
     if the old folder exists.
   - For boilerplate-sourced files (those carrying `source: boilerplate`
     frontmatter in BOILERPLATE_PATH), overwrite the target's copy IF and
     only if the target has a file at the same path. Do NOT add a generic
     boilerplate skill to a target that doesn't already have one — the
     project may have a custom version under a different name. When unsure,
     ask the user before introducing a new generic skill.
   - Add `last_reviewed: <today's date in YYYY-MM-DD>` to every
     project-specific SKILL.md that's missing it (the validator will tell
     you which). Get today's date from `date +%Y-%m-%d` — don't hardcode.
   - If instructions.md doesn't have a "## Skills index" or "## Workflow
     guides" heading but lists skill paths anyway (legacy marker
     "Internal project skills"), the validator still picks them up. Only
     reformat if you're adding new entries.

7. Run the validator and fix anything it flags:
       node .ai/scripts/validate-config.mjs
   It must exit 0 (zero errors). Warnings about old `last_reviewed` are
   acceptable but mention them in the summary.

8. Report back to the user with:
   - Branch you switched to.
   - Files added / modified / preserved (counts are fine for the
     react-performance bundle's 65 rules — just say "react-performance
     bundle (65 rules)" instead of listing them).
   - Validator result (errors / warnings / counts).
   - Whether husky was added fresh or preserved at its existing version.
   - Reminder to run `<package-manager> install` to actually install husky
     and let the prepare script wire up the hook on the user's machine.

Do NOT commit, push, or create a PR. The user will review and commit.
```

---

## Notes for future-me

- The boilerplate's current version is in `boilerplate/.ai/instructions.md`
  frontmatter (`boilerplate_version`). Bump that when shipping new versions.
- The `source: boilerplate` + `source_version: X.Y.Z` markers are the
  contract that tells future syncs what's safe to overwrite.
- Husky v9 changed the prepare script: `husky install` → `husky`. Don't
  downgrade existing v8 setups; just add the validator script next to them.
- The validator (`.ai/scripts/validate-config.mjs`) requires Node ≥ 18 and
  uses ESM. It runs fine on Windows under git bash.
- On Windows, sed -i can leave a backup file with -i'' or be tricky — if
  you hit issues, do read+write via Node instead of sed.
