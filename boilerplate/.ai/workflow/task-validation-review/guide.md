# Workflow: Task Validation and Review

Use this workflow for any task before writing code. It ensures the scope is agreed upfront, and that the result is verified against conventions and acceptance criteria before closing.

## Steps

### 1. Validate the task with the user

Before doing anything, surface and confirm:

- **What** needs to be done (restate the task in your own words).
- **Acceptance criteria** — list the specific conditions that define "done". Be concrete: not "it works" but "clicking X does Y" or "field Z is not present in the response".
- **Out of scope** — anything adjacent that will NOT be touched.
- **Constraints** — files, systems, or behaviors that must not change.

Present this summary to the user and wait for explicit confirmation before proceeding. If the user corrects anything, update the summary and confirm again.

> Do not skip this step. A task started without agreed criteria cannot be reviewed against them.

### 2. Execute the task

Implement the work following `.ai/instructions.md` and any relevant skills from `.ai/skills/`. Load and follow skills before writing code.

### 3. Run the PR Reviewer agent

Invoke `.ai/agents/pr-review/AGENT.md` on the changes.

Fix any convention violations before moving to step 4. Do not proceed with open `❌` findings.

### 4. Run the QA Reviewer agent

Invoke `.ai/agents/qa-review/AGENT.md`, passing the acceptance criteria captured in step 1 as input.

Fix any failing criteria or regressions before closing the task.

### 5. Report to the user

Present a single closing summary:

```
## Done

### What was done
One sentence.

### PR Review
PASS / FAIL — link to findings if any.

### QA Review
PASS / FAIL — link to findings if any.

### Acceptance criteria
| # | Criterion | Status |
|---|-----------|--------|
| 1 | ...       | ✅ / ❌ |

### Flows used
| Type     | Name / path |
|----------|-------------|
| Workflow | `.ai/workflow/task-validation-review/guide.md` |
| Agent    | `.ai/agents/pr-review/AGENT.md` |
| Agent    | `.ai/agents/qa-review/AGENT.md` |
| Skill    | `.ai/skills/...` (list each one loaded) |
| Rule     | (list any explicit rules from instructions.md that guided decisions) |
```

Omit rows that were not used. Add rows for every agent, skill, workflow, or rule that was actually loaded or applied during the task.

Only mark the task as done when both reviews pass and all criteria are met.

## Verify

- [ ] User confirmed the acceptance criteria before implementation started.
- [ ] PR Reviewer returned no open `❌` findings.
- [ ] QA Reviewer returned PASS.
- [ ] Closing summary was presented to the user.
- [ ] "Flows used" table lists every agent, skill, workflow, and rule that was applied.
