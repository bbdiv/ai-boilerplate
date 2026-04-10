# Workflow guides

Workflow guides are higher-level than skills. A skill covers one layer (e.g. "how to add a query hook"). A workflow guide covers a full feature from start to finish (e.g. "how to build a list view"), orchestrating multiple skills in the right order.

## When to create a workflow guide

Create a workflow guide when:
- A feature type recurs and always touches multiple layers in the same sequence.
- The correct order of steps is non-obvious (e.g. models before API before query before UI).
- You want to ensure nothing is forgotten (route registration, translations, empty states, etc.).

## Workflow guide format

Each guide lives in its own folder:

```
.ai/workflow/
  <guide-name>/
    guide.md
```

Structure a guide like this:

```markdown
# Workflow: {{Feature type name}}

Brief description of when to use this guide.

## Steps

### 1. {{First step}}
What to do and why. Link to the relevant skill if one exists.

### 2. {{Second step}}
...

## Verify
Checklist of things to confirm before calling the task done.
```

## Tips

- **Reference skills, don't duplicate them.** If step 3 is "add a query hook", link to `.ai/skills/query/queries/SKILL.md` rather than re-explaining it.
- **Include a verify checklist** at the end — it's where edge cases (translations, empty states, TypeScript errors) get caught.
- **Keep it sequential.** The value of a workflow guide is the order, not the detail. Detail lives in skills.

## Example structure

```
.ai/workflow/
  create-list-view/guide.md
  create-detail-edit-view/guide.md
```
