# Context

This folder holds reference knowledge that AI tools should consult when using specific libraries, APIs, or UI components.

## What goes here

- **UI kit guides** — usage examples and API docs for complex components from your design system.
- **API conventions** — patterns for how your backend API behaves (pagination, filtering, error shapes).
- **Library-specific guides** — anything that helps the AI use a library correctly without hallucinating its API.

## Structure example

```
context/
  ui-kit/
    ComplexComponentA.md
    ComplexComponentB.md
  api-conventions.md
```

## When to add a new guide

Add a guide when:
- A component or library has non-obvious usage patterns.
- The AI consistently gets usage wrong without extra context.
- An internal API has conventions that aren't in public docs.
