# Maintaining the boilerplate

How to ship a change made in `boilerplate/.ai/` out to every consumer repo. Read this before each propagation.

## Defaults

Don't ask the user for these unless the runbook explicitly tells you to:

- **Boilerplate** = this repo (`ai-boilerplate`). It is the only upstream.
- **Consumers** = every entry in `consumers.json`. Don't ask which repos to target — the registry is the source of truth.
- **Target branch on each consumer** = `chore/ai-boilerplate`. Standing branch, never propagate to `main` directly.
- **What changed?** = run `pnpm drift`. Every file listed as `missing` or `behind` is in scope. Don't try to infer from `git log` or file mtimes — drift already answers this.
- **Which propagation format?** = `consumers.json` declares `instructions_format` per consumer (`table-narrow` / `table-wide` / `bullet`). Pull the format from there; don't re-detect.
- **Stop conditions** = an `edited` / `ahead` / `detached` flag in drift means investigate before propagating. Do not silently overwrite. See Pitfalls below.

If the operator gives a non-default scope (e.g. "only mf-login this round"), respect it and note the deviation in the commit body.

## Inputs

- **`consumers.json`** — registry of every consumer repo, with `path`, `stack` tags, `instructions_format` (`table-narrow` / `table-wide` / `bullet`), `skip` list, optional `notes`.
- **`scripts/check-drift.mjs`** — read-only walker that reports per-consumer drift. Run via `pnpm drift`.

## Steps

### 1. Confirm the upstream change is committed

`git status` in `ai-boilerplate` must be clean on the change. The drift script compares working-tree files; uncommitted upstream content will look like drift to consumers.

### 2. Run drift report

```
pnpm drift
# or: node scripts/check-drift.mjs
```

Each sourced file falls into one of:

- `ok` — same version, byte-equal. Nothing to do.
- `skipped` — declared in consumer's `skip` list. Nothing to do.
- `missing` — upstream file does not exist in consumer. **Decide: should this consumer carry it?** If yes → propagate. If no → add the path to that consumer's `skip` and re-run.
- `behind` — consumer has older `source_version`. Propagate.
- `edited` — same version, content differs. Consumer modified it without bumping. Investigate before overwriting; do not blindly clobber.
- `ahead` — consumer's version is newer than upstream. Bug or out-of-band edit. Investigate.
- `detached` — consumer file lost its `source: boilerplate` marker. Either restore tracking or add to `skip`.
- `[version]` line — `boilerplate_version` mismatch in `instructions.md`. Will be fixed by the propagation commit.

### 3. Cut a sync branch in each affected consumer

```
git -C <consumer-path> checkout chore/ai-boilerplate
git -C <consumer-path> pull
```

Branch convention: `chore/ai-boilerplate`. Create if missing. Never propagate directly to `main`.

**Branch guard — verify before any edit:**

```
git -C <consumer-path> rev-parse --abbrev-ref HEAD
# must print: chore/ai-boilerplate
```

If a consumer is on a different branch (e.g. an in-progress feature), stop. Either switch the consumer to `chore/ai-boilerplate` or skip it this round. A misrouted propagation is harder to clean up than skipping.

A one-shot check across every consumer (exits non-zero if any consumer is on the wrong branch — fail-fast, do not proceed):

```
node -e "const r=require('./consumers.json');const {execSync}=require('child_process');let bad=0;for(const c of r.consumers){const b=execSync('git -C '+c.path+' rev-parse --abbrev-ref HEAD').toString().trim();const ok=b==='chore/ai-boilerplate';if(!ok)bad++;console.log((ok?'OK ':'!! ')+c.name+'  '+b)}if(bad){console.error('\\n'+bad+' consumer(s) not on chore/ai-boilerplate. Stop.');process.exit(1)}"
```

If this command exits non-zero, do not move on to step 4. Either switch the offending consumers to `chore/ai-boilerplate` (after committing or stashing their current work), or scope this round to skip them and note the deviation.

### 4. Apply the change

For each consumer flagged as `missing` or `behind`:

1. Copy the upstream file verbatim:
   `cp boilerplate/.ai/<rel-path> <consumer>/.ai/<rel-path>` (create dir first).
2. Update `instructions.md`:
   - Bump `boilerplate_version` to match upstream.
   - Add/update the skills-index row, **matching the consumer's `instructions_format`**. See the row templates below.
3. If the change touches `workflow/build-feature/guide.md`, update step 1 wording to match upstream.
4. **Diff preview** — spot-check formatting before moving on:
   ```
   git -C <consumer-path> diff -- .ai/instructions.md
   ```
   Look for: pipe alignment (table rows must align with neighbours), no extra blank line, no missing trailing pipe.
5. Run consumer-side validator:
   `node <consumer>/.ai/scripts/validate-config.mjs` — must exit 0. The validator catches column-width breaks (the regex parser silently drops malformed rows, leaving them effectively un-indexed).

#### Skills-index row templates

**Anchor row.** Insert the new row immediately after the `Authoring a new skill` row. That row is present in every consumer since v1.6.0 and is the most stable universal anchor. If a consumer is missing the `Authoring a new skill` row, that consumer is behind on an earlier sync — stop and resolve that sync first.

**`table-narrow`** (used by `mf-login`, `mf-projetos`, `mf-rdo`, `mf-suite`, `mf-platform-utility-module`, `mf-root-config`):

```
| <task — pad to 44 chars after leading space>| `.ai/skills/<name>/SKILL.md` <pad to 53 chars after leading space>|
```

Concrete example:

```
| Writing a git commit message                | `.ai/skills/commit-messages/SKILL.md`                |
```

**`table-wide`** (used by `autodoc-ui`):

```
| <task — pad to 49 chars after leading space>     | `.ai/skills/<name>/SKILL.md` <pad to 59 chars after leading space>      |
```

Concrete example:

```
| Writing a git commit message                     | `.ai/skills/commit-messages/SKILL.md`                      |
```

**`bullet`** (used by `mf-workforce`):

```
- <Task>: `.ai/skills/<name>/SKILL.md`
```

Concrete example:

```
- Writing a git commit message: `.ai/skills/commit-messages/SKILL.md`
```

If `consumers.json` grows a new format variant, document its template here before the first propagation that uses it.

### 5. Commit per consumer

One commit per consumer (clearer audit trail than a multi-repo squash). Use Conventional Commits, scoped to `ai-config`. Example:

```
chore(ai-config): sync grill-me skill from boilerplate v1.7.0
```

Body should name the file(s) added/changed and link back to the boilerplate version.

**Batch helper** — only run after the diff preview in step 4 looked clean for every consumer:

```
node -e "const r=require('./consumers.json');const {execSync}=require('child_process');const msg=process.argv[1];for(const c of r.consumers){try{execSync('git -C '+c.path+' diff --quiet --cached');continue}catch(_){};try{execSync('git -C '+c.path+' add .ai && git -C '+c.path+' commit -m '+JSON.stringify(msg),{stdio:'inherit'})}catch(e){console.error('failed for '+c.name)}}" "chore(ai-config): sync <skill> from boilerplate v<X.Y.Z>"
```

Skip the helper for any consumer where you intentionally added extra changes (unrelated edits, bigger refactor) — commit those by hand.

### 6. Push + open PRs

**Push first.** Per consumer:

```
git -C <consumer-path> push -u origin chore/ai-boilerplate
```

Or batch:

```
node -e "const r=require('./consumers.json');const {execSync}=require('child_process');for(const c of r.consumers){try{execSync('git -C '+c.path+' push -u origin chore/ai-boilerplate',{stdio:'inherit'})}catch(_){console.error('push failed: '+c.name)}}"
```

**Then open PRs.** Each consumer gets one PR against its default branch. Title mirrors the commit subject; body links the upstream changelog entry in `ai-boilerplate/README.md`. Use `gh` (must be installed and authed against `autodocdev`):

```
gh pr create \
  --repo autodocdev/<consumer-name> \
  --base <default-branch> \
  --head chore/ai-boilerplate \
  --title "chore(ai-config): sync <skill> from boilerplate v<X.Y.Z>" \
  --body "Sync \`<skill>\` from boilerplate v<X.Y.Z>. See changelog: https://github.com/bbdiv/ai-boilerplate/blob/main/README.md#<X-Y-0>--<YYYY-MM-DD>."
```

Batch helper — opens one PR per consumer, skipping any that already have an open PR for the head branch:

```
node -e "const r=require('./consumers.json');const {execSync}=require('child_process');const skill=process.argv[1];const ver=process.argv[2];const link=process.argv[3];for(const c of r.consumers){const repo='autodocdev/'+c.name;try{const existing=execSync('gh pr list --repo '+repo+' --head chore/ai-boilerplate --json number --jq length').toString().trim();if(existing!=='0'){console.log('skip (PR exists): '+c.name);continue}}catch(_){console.error('gh pr list failed: '+c.name);continue}try{execSync('gh pr create --repo '+repo+' --head chore/ai-boilerplate --title '+JSON.stringify('chore(ai-config): sync '+skill+' from boilerplate v'+ver)+' --body '+JSON.stringify('Sync \`'+skill+'\` from boilerplate v'+ver+'. Changelog: '+link),{stdio:'inherit'})}catch(_){console.error('pr create failed: '+c.name)}}" "<skill>" "<X.Y.Z>" "<changelog-url>"
```

Default branch detection isn't automated — pass it explicitly per consumer if it's not the conventional `main`. To inspect: `gh repo view autodocdev/<consumer> --json defaultBranchRef --jq .defaultBranchRef.name`.

After all PRs are open, paste the URLs into the boilerplate-side tracking issue (or the PR description on the upstream `feat/...` branch) so reviewers can sweep them in one pass.

### 7. Re-run drift to confirm

```
pnpm drift
```

Every affected consumer should now show `ok` for the propagated file (or the row should disappear from the report).

## Conventions

- **`chore/ai-boilerplate`** is the standing branch on every consumer for these syncs. Reuse it; do not create per-feature branches for each propagation unless the change is large.
- **`skip` is a contract.** If a consumer doesn't carry a sourced file, it must say so in `consumers.json`. "Missing" should never be silent.
- **`detached` is a flag, not a bug.** When a consumer intentionally forks a sourced file, add the path to `skip` so drift stops nagging.
- **Never edit a sourced file inside a consumer without bumping its `source_version` and removing the `source: boilerplate` marker.** Otherwise drift can't tell legitimate forks from accidental edits.

## Pitfalls

Things that have actually gone wrong (or come close to going wrong) during real propagations. Read once; refer back when something feels off.

- **Anchor row missing in a consumer.** If you can't find the `Authoring a new skill` row in a consumer's `instructions.md`, that consumer is behind on an earlier sync. Stop. Resolve the older sync first — chaining a new row onto a stale index just compounds the drift.
- **Wrong branch.** A consumer might already be on a feature branch when you arrive. Always run the branch-guard check in step 3 before any edit. Worst case the propagation lands on the feature branch and ships with unrelated work.
- **Column width drift in `instructions.md`.** Each consumer was hand-formatted; widths can vary even within the same `instructions_format` bucket. Always diff-preview (step 4.4) before validating. The validator parses the table with a regex — a row with one space too many is silently dropped from the index, looks fine on disk, fails to register as a valid skill row.
- **Format variant not in `consumers.json`.** If a consumer's index uses a layout that doesn't match `table-narrow` / `table-wide` / `bullet`, document it in this file's row templates first, then add the variant to `consumers.json`. Don't guess at the format mid-propagation.
- **Consumer file edited without bumping `source_version`.** Drift will flag this as `edited` (same version, different content). Resolve before propagating: either fold the local change upstream and bump, or remove the `source: boilerplate` marker downstream and add the path to that consumer's `skip`.
- **`detached` after a manual edit.** If you find a sourced file in a consumer that no longer has the `source: boilerplate` marker, the consumer has effectively forked it. Don't silently re-attach the marker — that erases the fork. Decide first: re-sync (overwrite local edits) or accept the fork (add to `skip`).
- **Skipped propagation that should have happened.** When marking a consumer's `missing` as a `skip` entry, double-check the `notes` field actually justifies it. A `skip` should have a structural reason (no React, utility module) — not "we'll get to it later." If it's just deferred, leave it as `missing` and propagate next round.

## When this doesn't apply

- Single-repo change with no upstream component — work directly in the consumer.
- Authoring a new skill — use `boilerplate/.ai/skills/write-a-skill/SKILL.md` first, commit upstream, then return here to propagate.
