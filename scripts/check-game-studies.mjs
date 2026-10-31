import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, statSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { decodeUtf8Strict, parseJsonStrict } from '../dist/src/canonical.js';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const prefix = 'docs/game-studies/';
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validators = Object.fromEntries(['index', 'study'].map(name => [name,
  ajv.compile(JSON.parse(readFileSync(resolve(repo, prefix, 'contracts', `${name}-v0.schema.json`), 'utf8')))
]));

function requireThat(condition, message) {
  if (!condition) throw new Error(message);
}

function readBounded(root, path) {
  requireThat(typeof path === 'string' && path.startsWith(prefix) &&
    /^[a-zA-Z0-9_./-]+$/.test(path) && !path.split('/').some(x => !x || x === '.' || x === '..'),
  `noncanonical study path: ${path}`);
  const boundary = realpathSync(resolve(root, prefix));
  const actual = realpathSync(resolve(root, path));
  requireThat(actual.startsWith(boundary + sep), `study path escapes notebook: ${path}`);
  const stat = statSync(actual);
  requireThat(stat.isFile() && stat.size <= 8 * 1024 * 1024, `not a bounded regular file: ${path}`);
  return readFileSync(actual);
}

function readJson(root, path, kind) {
  const value = parseJsonStrict(decodeUtf8Strict(readBounded(root, path)));
  requireThat(validators[kind](value), `${path}: ${ajv.errorsText(validators[kind].errors)}`);
  return value;
}

function unique(values, what) {
  requireThat(new Set(values).size === values.length, `duplicate ${what}`);
}

function checkStudy(root, path, expectedId) {
  const s = readJson(root, path, 'study');
  const g = s.game;
  const week = String(g.week).padStart(2, '0');
  const pair = `${g.away.toLowerCase()}-at-${g.home.toLowerCase()}`;
  const canonicalId = `nfl-${g.season}-${g.phase}-w${week}-${g.away.toLowerCase()}-${g.home.toLowerCase()}`;
  requireThat(s.study_id === expectedId && s.study_id === canonicalId, `study identity mismatch: ${path}`);
  requireThat(g.away !== g.home, 'home and away must differ');
  requireThat(path === `${prefix}${g.season}/${g.phase}/week-${week}/${pair}/study.json`, 'study path/identity mismatch');
  try { new Intl.DateTimeFormat('en', { timeZone: g.timezone }); } catch { throw new Error('invalid game timezone'); }
  const kickoff = Date.parse(g.kickoff_at);
  requireThat(Date.parse(s.origin.pregame_cutoff) < kickoff, 'pregame cutoff must precede kickoff');
  requireThat(Date.parse(s.plan.first_review_at) >= kickoff &&
    Date.parse(s.plan.evidence_deadline) >= Date.parse(s.plan.first_review_at), 'invalid review/deadline order');

  unique(s.records.map(r => r.id), 'record ID');
  unique(s.records.map(r => r.path), 'record path');
  const records = new Map(s.records.map(r => [r.id, r]));
  const record = (id, kinds) => {
    const r = records.get(id);
    requireThat(r && kinds.includes(r.kind), `missing or wrong-kind evidence reference: ${id}`);
    return r;
  };
  record(s.origin.baseline_record_ref, ['pregame']);
  for (const r of s.records) {
    requireThat(r.path.startsWith(`${dirname(path)}/retained/`), `retained record outside its study: ${r.path}`);
    const digest = createHash('sha256').update(readBounded(root, r.path)).digest('hex');
    requireThat(digest === r.sha256, `retained bytes changed: ${r.path}`);
    if (r.kind === 'postgame_evidence') {
      requireThat(Date.parse(r.captured_at) >= kickoff, 'postgame evidence captured before kickoff');
    }
  }
  const final = s.game_final;
  if (final.status === 'final') {
    const witness = record(final.evidence_ref, ['postgame_evidence']);
    requireThat(final.verified_at !== null && Date.parse(final.verified_at) >= kickoff &&
      Date.parse(witness.captured_at) <= Date.parse(final.verified_at), 'invalid game-final witness time');
  } else {
    requireThat(final.verified_at === null && final.evidence_ref === null, 'non-final game has finality fields');
  }

  unique(s.questions.map(q => q.id), 'question ID');
  const questionIds = new Set(s.questions.map(q => q.id));
  for (const q of s.questions) {
    requireThat(q.linked_ids.every(id => questionIds.has(id) && id !== q.id), `invalid linked question: ${q.id}`);
    requireThat(q.baseline_refs.includes(s.origin.baseline_record_ref), `question lacks original baseline: ${q.id}`);
    q.baseline_refs.forEach(id => record(id, ['pregame', 'amendment']));
    q.evidence_refs.forEach(id => record(id, ['postgame_evidence']));
    if (q.assessment === 'pending') {
      requireThat(q.summary === null && q.evidence_refs.length === 0 && q.next_action === null,
        `pending question contains a conclusion: ${q.id}`);
    } else {
      requireThat(final.status === 'final' && s.evaluation_state !== 'pending', 'assessment requires verified final game');
      requireThat(q.summary?.trim() && q.next_action?.trim(), `assessment lacks summary/disposition: ${q.id}`);
      requireThat(q.assessment === 'unresolved' ? q.limitations.length > 0 : q.evidence_refs.length > 0,
        `assessment lacks evidence or unresolved limitation: ${q.id}`);
    }
  }
  if (s.evaluation_state === 'pending') {
    requireThat(s.assessment_cutoff === null, 'pending evaluation has an assessment cutoff');
  } else {
    requireThat(final.status === 'final' && s.assessment_cutoff !== null &&
      Date.parse(s.assessment_cutoff) >= Date.parse(final.verified_at) &&
      Date.parse(s.assessment_cutoff) <= Date.parse(s.plan.evidence_deadline), 'invalid postgame assessment cutoff');
    for (const q of s.questions) for (const id of q.evidence_refs) {
      requireThat(Date.parse(records.get(id).captured_at) <= Date.parse(s.assessment_cutoff), 'evidence captured after assessment cutoff');
    }
  }
  if (s.evaluation_state === 'complete') {
    requireThat(s.questions.every(q => q.assessment !== 'pending'), 'complete evaluation has pending questions');
  }
  if (s.closeout.report_record_ref !== null) record(s.closeout.report_record_ref, ['closeout']);
  if (s.closeout.status === 'ready_for_review') {
    requireThat(s.evaluation_state === 'complete' && s.closeout.report_record_ref !== null && s.closeout.pr_url !== null,
      'review readiness requires completed evaluation, report and PR');
  }
  return { study_id: s.study_id, questions: s.questions.length, evaluation_state: s.evaluation_state };
}

export function checkStudies(root = repo) {
  const index = readJson(root, `${prefix}index.json`, 'index');
  unique(index.studies.map(s => s.study_id), 'registry ID');
  unique(index.studies.map(s => s.manifest_path), 'registry path');
  const manifests = [];
  function walk(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      requireThat(!entry.isSymbolicLink(), `symlink in study notebook: ${entry.name}`);
      const child = resolve(path, entry.name);
      if (entry.isDirectory()) walk(child);
      else if (entry.name === 'study.json') manifests.push(relative(root, child).split(sep).join('/'));
    }
  }
  walk(resolve(root, prefix));
  const registered = index.studies.map(s => s.manifest_path).sort();
  requireThat(JSON.stringify(manifests.sort()) === JSON.stringify(registered), 'unregistered or missing study manifest');
  return index.studies.map(s => checkStudy(root, s.manifest_path, s.study_id));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify({ structural_check: 'passed', studies: checkStudies() }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
