# Agents

This folder stores agent definitions — purpose-built AI agents scoped to specific, recurring tasks in this project.

## What is an agent

An agent is a focused AI worker given a narrow job, a specific set of tools, and instructions tailored to that job. Unlike general-purpose AI sessions that handle anything, agents are predictable and repeatable because their scope is fixed.

## When to create an agent

Create an agent when:
- A task recurs frequently and always follows the same process (e.g. reviewing PRs, running a migration check, auditing translations).
- A task benefits from a narrower context than a full coding session (fewer tools = fewer mistakes).
- You want the task to run autonomously or on a schedule without manual prompting.

## File format

Each agent lives in its own folder with a `AGENT.md` file:

```
.ai/agents/
  <agent-name>/
    AGENT.md
```

Structure an agent definition like this:

```markdown
---
name: agent-name
description: >-
  One sentence. What does this agent do and when should it be invoked?
---

# Agent: {{Agent Name}}

## Purpose
What problem does this agent solve? What is its output?

## Trigger
When should this agent run? (e.g. on PR open, on demand, scheduled)

## Instructions
Step-by-step instructions the agent follows. Be specific — ambiguity
leads to inconsistent results.

## Tools / scope
What files, APIs, or systems is this agent allowed to touch?
What is explicitly out of scope?

## Output
What does the agent produce? (e.g. a comment, a file, a report)
```

## Tips

- **Narrow scope wins.** An agent that does one thing well is more useful than one that tries to do everything.
- **Explicit out-of-scope** matters as much as in-scope — tell the agent what NOT to do.
- **Reference skills when relevant.** If an agent's steps overlap with a skill, link to `.ai/skills/` rather than duplicating instructions.
