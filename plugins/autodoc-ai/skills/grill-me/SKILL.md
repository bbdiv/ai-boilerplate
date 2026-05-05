---
description: >-
  Stress-test a plan or design via relentless interview before implementation. Walk the decision tree, ask one question at a time, recommend an answer for each. Use when the user wants their plan grilled, says "grill me", or kicks off a non-trivial feature without an aligned plan.
---

# Grill Me

Interview the user relentlessly about every aspect of the plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

## Rules

1. **One question at a time.** No multi-question batches. Wait for the answer before the next branch.
2. **Recommend, don't just ask.** Every question carries your suggested answer plus the tradeoff in one line.
3. **Codebase first.** If a question can be answered by reading the code, read the code instead of asking.
4. **Resolve dependencies before leaves.** Pick the question that unblocks the most other questions next.
5. **Stop when the tree is resolved.** Once every branch has an answer, summarize the plan and hand back to implementation (e.g. `.ai/workflow/build-feature/guide.md`).

## When to use

- User says "grill me", "stress-test this", "poke holes in my plan".
- User describes a non-trivial feature with hidden decisions still open.
- Ambiguity in scope, data shape, edge cases, or integration points.

## When to skip

- Task is mechanical (rename, single-file fix, obvious bug).
- Plan is already aligned and documented.
- User explicitly asks to just implement.

## Origin

Adapted from Matt Pocock's `grill-me` skill (`github.com/mattpocock/skills`).
