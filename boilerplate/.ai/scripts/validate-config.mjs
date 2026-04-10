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

// ── Helpers ───────────────────────────────────────────────────────────────────

function readIndexedSkillPaths() {
  const content = readFileSync(INSTRUCTIONS_PATH, 'utf8');
  const lines = content.split('\n');

  let inSection = false;
  const paths = new Set();

  // Supports both heading-based (## Skills index) and marker-based index sections.
  const sectionStartMarkers = [
    'Internal project skills',
    '<!-- IMPORTANT: every new skill must have a row here',
  ];
  const sectionHeadingRe = /^##\s+skills index/i;
  const nextHeadingRe = /^##\s+/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

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

    // Extract all backtick-quoted .ai/skills/ paths on this line.
    // Handles both list format and table format.
    const re = /`(\.ai\/skills\/[^`]+)`/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      paths.add(m[1]);
    }
  }

  return paths;
}

function discoverSkillFiles() {
  // Only scans files named SKILL.md — ignores README.md and other markdown files.
  // Returns paths relative to project root with forward slashes.
  const results = [];

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name === 'SKILL.md') {
        results.push(relative(PROJECT_ROOT, full).replace(/\\/g, '/'));
      }
    }
  }

  const skillsDir = join(AI_DIR, 'skills');
  if (existsSync(skillsDir)) walk(skillsDir);
  return results;
}

function parseFrontmatterField(filePath, field) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  if (lines[0].trim() !== '---') return null;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') break;
    const match = lines[i].match(new RegExp(`^${field}:\\s*(\\S.*)`));
    if (match) return match[1].trim();
  }
  return null;
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
    report(errors, warnings, 0);
    return;
  }

  const indexedPaths = readIndexedSkillPaths();
  const diskPaths = discoverSkillFiles();

  // Check 1: skill file on disk has no index entry
  for (const diskPath of diskPaths) {
    if (!indexedPaths.has(diskPath)) {
      errors.push({
        code: 'missing-index',
        message: `${diskPath} exists but has no entry in .ai/instructions.md`,
        hint: 'Add a row to the skills index in .ai/instructions.md',
      });
    }
  }

  // Check 2: index entry references a non-existent file
  for (const indexedPath of indexedPaths) {
    if (!existsSync(join(PROJECT_ROOT, indexedPath))) {
      errors.push({
        code: 'missing-file',
        message: `.ai/instructions.md indexes ${indexedPath} but the file does not exist`,
        hint: 'Create the skill file or remove the dead index entry.',
      });
    }
  }

  // Checks 3 & 4: frontmatter on every disk skill file
  for (const diskPath of diskPaths) {
    const abs = join(PROJECT_ROOT, diskPath);
    const lastReviewed = parseFrontmatterField(abs, 'last_reviewed');

    if (lastReviewed === null) {
      errors.push({
        code: 'missing-frontmatter',
        message: `${diskPath} is missing the 'last_reviewed' frontmatter field`,
        hint: `Add: last_reviewed: ${new Date().toISOString().slice(0, 10)} to the frontmatter.`,
      });
    } else {
      const age = daysSince(lastReviewed);
      if (age > STALE_THRESHOLD_DAYS) {
        warnings.push({
          code: 'stale-skill',
          message: `${diskPath} last_reviewed ${lastReviewed} is ${age} days ago (threshold: ${STALE_THRESHOLD_DAYS})`,
          hint: 'Review and update the skill, then set last_reviewed to today.',
        });
      }
    }
  }

  report(errors, warnings, diskPaths.length);
}

function report(errors, warnings, skillCount) {
  console.log('[ai-config] Validating .ai/ configuration...\n');

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

  if (errors.length === 0 && warnings.length === 0) {
    console.log(
      `[ai-config] Validation passed — ${skillCount} skill(s) checked, 0 error(s), 0 warning(s).`
    );
    process.exit(0);
  }

  if (errors.length > 0) {
    console.log(
      `Validation failed with ${errors.length} error(s), ${warnings.length} warning(s).`
    );
    process.exit(1);
  }

  console.log(
    `[ai-config] Validation passed with ${warnings.length} warning(s). No blocking errors.`
  );
  process.exit(0);
}

runChecks();
