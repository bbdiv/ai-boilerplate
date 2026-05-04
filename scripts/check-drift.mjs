#!/usr/bin/env node
// scripts/check-drift.mjs
// Reports drift between this boilerplate's sourced files and each consumer
// repo listed in consumers.json. Read-only — does not modify any file.
//
// Usage:
//   node scripts/check-drift.mjs                 # all consumers
//   node scripts/check-drift.mjs <name> [<name>] # subset by name
//
// Exit 0 always (informational). Pipe through grep if you want to assert.

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, relative, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, '..');
const UPSTREAM_AI = join(REPO_ROOT, 'boilerplate', '.ai');
const CONSUMERS_PATH = join(REPO_ROOT, 'consumers.json');

// ── helpers ──────────────────────────────────────────────────────────────────

function readFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  if ((lines[0] || '').trim() !== '---') return null;
  const fields = {};
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') return fields;
    const m = lines[i].match(/^(\w+):\s*(\S.*)?$/);
    if (m) fields[m[1]] = m[2] ? m[2].trim() : '';
  }
  return null;
}

function walkMd(dir) {
  // Returns absolute paths to all .md files under dir.
  if (!existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.isFile() && e.name.endsWith('.md')) out.push(full);
    }
  }
  return out;
}

function collectUpstreamSourced() {
  // Every .md under boilerplate/.ai with `source: boilerplate` frontmatter.
  const records = [];
  for (const abs of walkMd(UPSTREAM_AI)) {
    const fm = readFrontmatter(readFileSync(abs, 'utf8'));
    if (!fm || fm.source !== 'boilerplate') continue;
    const relPath = relative(UPSTREAM_AI, abs).replace(/\\/g, '/'); // e.g. "skills/grill-me/SKILL.md"
    records.push({
      relPath,
      version: fm.source_version || '(unversioned)',
      absPath: abs,
    });
  }
  return records;
}

function compareVersions(a, b) {
  // Returns -1/0/1. Treats "(unversioned)" as equal to itself, less than any real version.
  if (a === b) return 0;
  if (a === '(unversioned)') return -1;
  if (b === '(unversioned)') return 1;
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

function isSkipped(relPath, skipList) {
  // skip values are path prefixes relative to .ai/, e.g. "context/react-performance".
  return skipList.some((p) => relPath === p || relPath.startsWith(`${p}/`));
}

// ── checks per consumer ──────────────────────────────────────────────────────

function checkConsumer(consumer, upstreamFiles) {
  const consumerRoot = resolve(REPO_ROOT, consumer.path);
  const consumerAi = join(consumerRoot, '.ai');
  const lines = [];

  if (!existsSync(consumerAi)) {
    lines.push(`  [missing] .ai/ not found at ${consumerAi}`);
    return { name: consumer.name, lines, counts: { missing: 1 } };
  }

  const counts = { ok: 0, skipped: 0, missing: 0, behind: 0, edited: 0, ahead: 0, detached: 0 };

  // Boilerplate version delta
  const instrPath = join(consumerAi, 'instructions.md');
  let consumerVersion = null;
  if (existsSync(instrPath)) {
    const fm = readFrontmatter(readFileSync(instrPath, 'utf8')) || {};
    consumerVersion = fm.boilerplate_version || null;
  }
  const upstreamInstr = readFrontmatter(
    readFileSync(join(UPSTREAM_AI, 'instructions.md'), 'utf8')
  ) || {};
  const upstreamVersion = upstreamInstr.boilerplate_version || null;

  if (upstreamVersion && consumerVersion && upstreamVersion !== consumerVersion) {
    lines.push(
      `  [version] boilerplate_version: consumer=${consumerVersion} upstream=${upstreamVersion}`
    );
  }

  // Per-file drift
  for (const u of upstreamFiles) {
    if (isSkipped(u.relPath, consumer.skip || [])) {
      counts.skipped++;
      continue;
    }
    const consumerAbs = join(consumerAi, u.relPath);
    if (!existsSync(consumerAbs)) {
      lines.push(`  [missing] ${u.relPath} (upstream v${u.version})`);
      counts.missing++;
      continue;
    }

    const consumerContent = readFileSync(consumerAbs, 'utf8');
    const consumerFm = readFrontmatter(consumerContent) || {};
    if (consumerFm.source !== 'boilerplate') {
      lines.push(`  [detached] ${u.relPath} (no source marker downstream)`);
      counts.detached++;
      continue;
    }
    const consumerVer = consumerFm.source_version || '(unversioned)';
    const cmp = compareVersions(consumerVer, u.version);

    if (cmp < 0) {
      lines.push(`  [behind] ${u.relPath} (consumer v${consumerVer} → upstream v${u.version})`);
      counts.behind++;
      continue;
    }
    if (cmp > 0) {
      lines.push(`  [ahead] ${u.relPath} (consumer v${consumerVer} > upstream v${u.version})`);
      counts.ahead++;
      continue;
    }

    // Same version — compare bytes (ignoring CRLF/LF).
    const upstreamContent = readFileSync(u.absPath, 'utf8');
    if (normalizeEol(upstreamContent) !== normalizeEol(consumerContent)) {
      lines.push(`  [edited] ${u.relPath} (same v${u.version}, content differs)`);
      counts.edited++;
      continue;
    }
    counts.ok++;
  }

  return { name: consumer.name, path: consumer.path, lines, counts };
}

function normalizeEol(s) {
  return s.replace(/\r\n/g, '\n');
}

// ── main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(CONSUMERS_PATH)) {
    console.error(`consumers.json not found at ${CONSUMERS_PATH}`);
    process.exit(2);
  }

  const registry = JSON.parse(readFileSync(CONSUMERS_PATH, 'utf8'));
  const requested = process.argv.slice(2);
  const consumers = requested.length
    ? registry.consumers.filter((c) => requested.includes(c.name))
    : registry.consumers;

  if (requested.length && consumers.length === 0) {
    console.error(`No consumers matched: ${requested.join(', ')}`);
    process.exit(2);
  }

  const upstreamFiles = collectUpstreamSourced();
  console.log(
    `[check-drift] Upstream sourced files: ${upstreamFiles.length} | Consumers: ${consumers.length}\n`
  );

  let totalIssues = 0;
  for (const c of consumers) {
    const result = checkConsumer(c, upstreamFiles);
    const issues =
      result.counts.missing +
      result.counts.behind +
      result.counts.edited +
      result.counts.ahead +
      result.counts.detached +
      (result.lines.some((l) => l.startsWith('  [version]')) ? 1 : 0);
    totalIssues += issues;

    const summary =
      `ok=${result.counts.ok} skipped=${result.counts.skipped} ` +
      `missing=${result.counts.missing} behind=${result.counts.behind} ` +
      `edited=${result.counts.edited} ahead=${result.counts.ahead} ` +
      `detached=${result.counts.detached}`;

    console.log(`▸ ${c.name}  (${summary})`);
    if (result.lines.length === 0) {
      console.log('  in sync\n');
    } else {
      for (const line of result.lines) console.log(line);
      console.log('');
    }
  }

  console.log(
    `[check-drift] Done. ${totalIssues} drift signal(s) across ${consumers.length} consumer(s).`
  );
}

main();
