#!/usr/bin/env node
// .ai/scripts/validate-config.mjs
// Validates AI config consistency. No external dependencies.
// Exit 0 = clean or warnings only. Exit 1 = blocking errors found.

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root is two levels up from .ai/scripts/
const PROJECT_ROOT = resolve(__dirname, '../../');
const AI_DIR = join(PROJECT_ROOT, '.ai');
const INSTRUCTIONS_PATH = join(AI_DIR, 'instructions.md');

// Adjust to match your team's review cadence.
const STALE_THRESHOLD_DAYS = 90;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtmlComments(content) {
  // Index examples live inside <!-- --> blocks; strip them so they are not
  // treated as real index entries.
  return content.replace(/<!--[\s\S]*?-->/g, '');
}

function readFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  if (lines[0].trim() !== '---') return null;
  const fields = {};
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') return fields;
    const match = lines[i].match(/^(\w+):\s*(\S.*)?$/);
    if (match) fields[match[1]] = match[2] ? match[2].trim() : '';
  }
  return null; // no closing delimiter
}

function readIndexedSkillPaths(content) {
  // Supports heading-based (## Skills index) and legacy marker-based sections.
  const lines = content.split(/\r?\n/);
  const paths = new Set();

  const sectionStartMarkers = [
    'Internal project skills',
    'IMPORTANT: every new skill must have a row here',
  ];
  const sectionHeadingRe = /^##\s+skills index/i;
  const nextHeadingRe = /^##\s+/;

  let inSection = false;
  for (const line of lines) {
    if (!inSection) {
      if (
        sectionStartMarkers.some((m) => line.includes(m)) ||
        sectionHeadingRe.test(line)
      ) {
        inSection = true;
      }
      continue;
    }
    if (nextHeadingRe.test(line)) break;
    const re = /`(\.ai\/skills\/[^`]+)`/g;
    let m;
    while ((m = re.exec(line)) !== null) paths.add(m[1]);
  }
  return paths;
}

function readIndexedWorkflowPaths(content) {
  const lines = content.split(/\r?\n/);
  const paths = new Set();
  const sectionHeadingRe = /^##\s+workflow guides/i;
  const nextHeadingRe = /^##\s+/;

  let inSection = false;
  for (const line of lines) {
    if (!inSection) {
      if (sectionHeadingRe.test(line)) inSection = true;
      continue;
    }
    if (nextHeadingRe.test(line)) break;
    const re = /`(\.ai\/workflow\/[^`]+)`/g;
    let m;
    while ((m = re.exec(line)) !== null) paths.add(m[1]);
  }
  return paths;
}

function discoverFilesByName(dir, fileName) {
  // Returns paths relative to project root with forward slashes.
  const results = [];
  function walk(d) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name === fileName) {
        results.push(relative(PROJECT_ROOT, full).replace(/\\/g, '/'));
      }
    }
  }
  if (existsSync(dir)) walk(dir);
  return results;
}

function collectSourcedFiles() {
  // Returns the list of .ai/ files that carry a `source` frontmatter marker.
  // Used to give teams a per-file inventory of what's tracked upstream.
  const sourced = [];

  const frontmatterTargets = [
    { dir: join(AI_DIR, 'skills'), fileName: 'SKILL.md' },
    { dir: join(AI_DIR, 'agents'), fileName: 'AGENT.md' },
    { dir: join(AI_DIR, 'workflow'), fileName: 'guide.md' },
  ];

  for (const { dir, fileName } of frontmatterTargets) {
    for (const diskPath of discoverFilesByName(dir, fileName)) {
      const fm = readFrontmatter(readFileSync(join(PROJECT_ROOT, diskPath), 'utf8'));
      if (fm && fm.source) {
        sourced.push({
          path: diskPath,
          source: fm.source,
          version: fm.source_version || '(unversioned)',
        });
      }
    }
  }

  // Context docs can have arbitrary filenames; walk the whole tree.
  const contextDir = join(AI_DIR, 'context');
  if (existsSync(contextDir)) {
    const walk = (d) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const full = join(d, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const rel = relative(PROJECT_ROOT, full).replace(/\\/g, '/');
          const fm = readFrontmatter(readFileSync(full, 'utf8'));
          if (fm && fm.source) {
            sourced.push({
              path: rel,
              source: fm.source,
              version: fm.source_version || '(unversioned)',
            });
          }
        }
      }
    };
    walk(contextDir);
  }

  return sourced;
}

function daysSince(dateStr) {
  const then = new Date(dateStr);
  if (isNaN(then.getTime())) return Infinity;
  return Math.floor((Date.now() - then.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Checks ────────────────────────────────────────────────────────────────────

function runChecks() {
  const errors = [];
  const warnings = [];

  if (!existsSync(INSTRUCTIONS_PATH)) {
    errors.push({
      code: 'missing-instructions',
      message: '.ai/instructions.md not found',
      hint: 'Ensure the project has a .ai/instructions.md with a skills index section.',
    });
    report(errors, warnings, { skills: 0, agents: 0, workflows: 0 }, null);
    return;
  }

  const raw = readFileSync(INSTRUCTIONS_PATH, 'utf8');
  const instructionsFm = readFrontmatter(raw) || {};
  const version = instructionsFm.boilerplate_version || null;
  const content = stripHtmlComments(raw);

  // ── Skills ─────────────────────────────────────────────────────────────────
  const indexedSkillPaths = readIndexedSkillPaths(content);
  const diskSkillPaths = discoverFilesByName(join(AI_DIR, 'skills'), 'SKILL.md');

  for (const diskPath of diskSkillPaths) {
    if (!indexedSkillPaths.has(diskPath)) {
      errors.push({
        code: 'missing-index',
        message: `${diskPath} exists but has no entry in .ai/instructions.md`,
        hint: 'Add a row to the skills index in .ai/instructions.md',
      });
    }
  }

  for (const indexedPath of indexedSkillPaths) {
    if (!existsSync(join(PROJECT_ROOT, indexedPath))) {
      errors.push({
        code: 'missing-file',
        message: `.ai/instructions.md indexes ${indexedPath} but the file does not exist`,
        hint: 'Create the skill file or remove the dead index entry.',
      });
    }
  }

  for (const diskPath of diskSkillPaths) {
    const abs = join(PROJECT_ROOT, diskPath);
    const fm = readFrontmatter(readFileSync(abs, 'utf8')) || {};
    const lastReviewed = fm.last_reviewed;

    if (!lastReviewed) {
      errors.push({
        code: 'missing-frontmatter',
        message: `${diskPath} is missing the 'last_reviewed' frontmatter field`,
        hint: `Add: last_reviewed: ${new Date().toISOString().slice(0, 10)} to the frontmatter.`,
      });
      continue;
    }

    if (!ISO_DATE_RE.test(lastReviewed) || isNaN(new Date(lastReviewed).getTime())) {
      errors.push({
        code: 'invalid-date',
        message: `${diskPath} has invalid last_reviewed: '${lastReviewed}' (expected YYYY-MM-DD)`,
        hint: `Use an ISO date, e.g. ${new Date().toISOString().slice(0, 10)}.`,
      });
      continue;
    }

    const age = daysSince(lastReviewed);
    if (age > STALE_THRESHOLD_DAYS) {
      warnings.push({
        code: 'stale-skill',
        message: `${diskPath} last_reviewed ${lastReviewed} is ${age} days ago (threshold: ${STALE_THRESHOLD_DAYS})`,
        hint: 'Review and update the skill, then set last_reviewed to today.',
      });
    }
  }

  // ── Agents ─────────────────────────────────────────────────────────────────
  const diskAgentPaths = discoverFilesByName(join(AI_DIR, 'agents'), 'AGENT.md');

  for (const diskPath of diskAgentPaths) {
    const abs = join(PROJECT_ROOT, diskPath);
    const fm = readFrontmatter(readFileSync(abs, 'utf8'));

    if (!fm) {
      errors.push({
        code: 'agent-missing-frontmatter',
        message: `${diskPath} has no frontmatter block`,
        hint: 'Add a YAML frontmatter block with name and description fields.',
      });
      continue;
    }
    if (!fm.name) {
      errors.push({
        code: 'agent-missing-field',
        message: `${diskPath} frontmatter is missing 'name'`,
        hint: 'Add: name: <agent-name> to the frontmatter.',
      });
    }
    if (!fm.description) {
      errors.push({
        code: 'agent-missing-field',
        message: `${diskPath} frontmatter is missing 'description'`,
        hint: 'Add a short description so the agent knows when to run.',
      });
    }
  }

  // ── Workflows ──────────────────────────────────────────────────────────────
  const indexedWorkflowPaths = readIndexedWorkflowPaths(content);
  const diskWorkflowPaths = discoverFilesByName(join(AI_DIR, 'workflow'), 'guide.md');

  for (const diskPath of diskWorkflowPaths) {
    if (!indexedWorkflowPaths.has(diskPath)) {
      errors.push({
        code: 'workflow-missing-index',
        message: `${diskPath} exists but has no entry in .ai/instructions.md`,
        hint: 'Add a row under "Workflow guides" in .ai/instructions.md',
      });
    }
  }

  for (const indexedPath of indexedWorkflowPaths) {
    if (!existsSync(join(PROJECT_ROOT, indexedPath))) {
      errors.push({
        code: 'workflow-missing-file',
        message: `.ai/instructions.md indexes ${indexedPath} but the file does not exist`,
        hint: 'Create the workflow guide or remove the dead index entry.',
      });
    }
  }

  const sourced = collectSourcedFiles();

  report(
    errors,
    warnings,
    {
      skills: diskSkillPaths.length,
      agents: diskAgentPaths.length,
      workflows: diskWorkflowPaths.length,
    },
    version,
    sourced
  );
}

function report(errors, warnings, counts, version, sourced) {
  console.log('[ai-config] Validating .ai/ configuration...\n');
  if (version) {
    console.log(`[ai-config] Initialized from boilerplate v${version}\n`);
  }

  if (sourced && sourced.length > 0) {
    console.log(`[ai-config] Boilerplate-sourced files (${sourced.length}):`);
    for (const s of sourced) {
      console.log(`  - ${s.path} (v${s.version})`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    console.log('ERRORS (block commit):');
    for (const e of errors) {
      console.log(`  [${e.code}] ${e.message}`);
      console.log(`    → ${e.hint}`);
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('WARNINGS (review recommended):');
    for (const w of warnings) {
      console.log(`  [${w.code}] ${w.message}`);
      console.log(`    → ${w.hint}`);
    }
    console.log('');
  }

  const summary = `${counts.skills} skill(s), ${counts.agents} agent(s), ${counts.workflows} workflow(s) checked`;

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`[ai-config] Validation passed — ${summary}, 0 error(s), 0 warning(s).`);
    process.exit(0);
  }

  if (errors.length > 0) {
    console.log(
      `Validation failed with ${errors.length} error(s), ${warnings.length} warning(s).`
    );
    process.exit(1);
  }

  console.log(
    `[ai-config] Validation passed with ${warnings.length} warning(s). ${summary}. No blocking errors.`
  );
  process.exit(0);
}

runChecks();
