import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { checkStudies } from './check-game-studies.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = 'docs/game-studies/2026/reg/week-08/ari-at-dal/study.json';
function fixture(t) {
  const dir = mkdtempSync(resolve(tmpdir(), 'tiber-game-study-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const baselinePath = manifest.replace('study.json', 'retained/synthetic-pregame.md');
  mkdirSync(resolve(dir, baselinePath, '..'), { recursive: true });
  const baseline = 'Invented pregame record for structural tests only.\n';
  writeFileSync(resolve(dir, baselinePath), baseline);
  const id = 'nfl-2026-reg-w08-ari-dal';
  const seed = {
    format_version: 'tiber-game-study/v0', study_id: id, artifact_class: 'manual_research',
    game: { season: 2026, phase: 'reg', week: 8, away: 'ARI', home: 'DAL',
      kickoff_at: '2026-11-01T13:00:00-05:00', timezone: 'America/Toronto',
      schedule_source_url: 'https://example.invalid/synthetic-schedule', provider_game_id: null },
    origin: { issue_url: 'https://example.invalid/synthetic-issue', pregame_cutoff: '2026-10-31T16:00:00Z',
      baseline_record_ref: 'pregame-issue-71', capture_limitations: ['Synthetic fixture; no football authority'] },
    owner: 'Synthetic test actor',
    plan: { observation_endpoint: 'Synthetic final whistle', first_review_at: '2026-11-02T00:00:00Z',
      evidence_deadline: '2026-11-03T15:00:00Z', working_branch: 'synthetic-test-only',
      scope: 'Invented structural fixture', stop_rule: 'Stop at the deadline' },
    records: [{ id: 'pregame-issue-71', kind: 'pregame', source_url: 'https://example.invalid/synthetic-issue',
      captured_at: '2026-10-31T17:00:00Z', path: baselinePath,
      sha256: createHash('sha256').update(baseline).digest('hex') }],
    game_final: { status: 'not_checked', verified_at: null, evidence_ref: null },
    evaluation_state: 'pending', assessment_cutoff: null,
    questions: [{ id: 'Q1', question: 'Invented research question', linked_ids: [],
      baseline_refs: ['pregame-issue-71'], assessment: 'pending', summary: null,
      evidence_refs: [], limitations: [], next_action: null }],
    closeout: { status: 'draft', pr_url: null, report_record_ref: null },
    downstream: { admission: 'not_admitted', proposal_refs: [] }
  };
  writeFileSync(resolve(dir, manifest), JSON.stringify(seed, null, 2) + '\n');
  writeFileSync(resolve(dir, 'docs/game-studies/index.json'), JSON.stringify({
    format_version: 'tiber-game-study-index/v0', coverage_scope: 'registered_studies_only',
    studies: [{ study_id: id, manifest_path: manifest }]
  }, null, 2) + '\n');
  return dir;
}
function mutate(dir, fn, path = manifest) {
  const file = resolve(dir, path);
  const value = JSON.parse(readFileSync(file, 'utf8'));
  fn(value);
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}
function finalWitness(dir, s) {
  const path = manifest.replace('study.json', 'retained/synthetic-postgame.md');
  const text = 'Fictional final-game witness for structural tests only.\n';
  writeFileSync(resolve(dir, path), text);
  s.records.push({ id: 'test-final', kind: 'postgame_evidence', source_url: 'https://example.invalid/final',
    captured_at: '2026-11-02T00:00:00Z', path, sha256: createHash('sha256').update(text).digest('hex') });
  s.game_final = { status: 'final', verified_at: '2026-11-02T00:00:00Z', evidence_ref: 'test-final' };
  s.evaluation_state = 'in_progress';
  s.assessment_cutoff = '2026-11-02T00:01:00Z';
}

test('pilot remains discoverable as assessments evolve', () => {
  assert.equal(checkStudies(root).find(s => s.study_id === 'nfl-2026-reg-w08-ari-dal').questions, 7);
});
test('changed retained baseline bytes fail', t => {
  const dir = fixture(t);
  const s = JSON.parse(readFileSync(resolve(dir, manifest), 'utf8'));
  writeFileSync(resolve(dir, s.records[0].path), 'rewritten pregame view');
  assert.throws(() => checkStudies(dir), /retained bytes changed/);
});
test('duplicate registry entries fail', t => {
  const dir = fixture(t);
  mutate(dir, s => s.studies.push(s.studies[0]), 'docs/game-studies/index.json');
  assert.throws(() => checkStudies(dir), /duplicate registry/);
});
test('game identity and storage path cannot drift', t => {
  const dir = fixture(t);
  mutate(dir, s => { s.game.home = 'BUF'; });
  assert.throws(() => checkStudies(dir), /identity mismatch/);
});
test('missing and escaped evidence paths fail', t => {
  const dir = fixture(t);
  mutate(dir, s => { s.records[0].path = 'docs/game-studies/../../README.md'; });
  assert.throws(() => checkStudies(dir), /outside its study|noncanonical/);
});
test('unknown question links fail', t => {
  const dir = fixture(t);
  mutate(dir, s => s.questions[0].linked_ids.push('Q99'));
  assert.throws(() => checkStudies(dir), /invalid linked question/);
});
test('pregame evidence cannot serve as a postgame observation', t => {
  const dir = fixture(t);
  mutate(dir, s => { s.questions[0].evidence_refs = ['pregame-issue-71']; });
  assert.throws(() => checkStudies(dir), /wrong-kind evidence/);
});
test('an assessment requires final-game verification', t => {
  const dir = fixture(t);
  mutate(dir, s => { s.questions[0].assessment = 'unresolved'; s.questions[0].summary = 'Unknown';
    s.questions[0].limitations = ['No film']; s.questions[0].next_action = 'Defer'; });
  assert.throws(() => checkStudies(dir), /verified final game/);
});
test('supported assessment without postgame evidence fails', t => {
  const dir = fixture(t);
  mutate(dir, s => { finalWitness(dir, s); const q = s.questions[0]; q.assessment = 'supported';
    q.summary = 'Fictional support'; q.next_action = 'Close'; });
  assert.throws(() => checkStudies(dir), /lacks evidence/);
});
test('a complete account may honestly leave every question unresolved', t => {
  const dir = fixture(t);
  mutate(dir, s => { finalWitness(dir, s); s.evaluation_state = 'complete';
    for (const q of s.questions) { q.assessment = 'unresolved'; q.summary = 'Mechanism unassessable';
      q.limitations = ['Required charting inaccessible']; q.next_action = 'Defer to a separately scoped study'; } });
  assert.equal(checkStudies(dir)[0].evaluation_state, 'complete');
});
test('complete account with pending questions fails', t => {
  const dir = fixture(t);
  mutate(dir, s => { finalWitness(dir, s); s.evaluation_state = 'complete'; });
  assert.throws(() => checkStudies(dir), /pending questions/);
});
test('evidence arriving after the assessment cutoff fails', t => {
  const dir = fixture(t);
  mutate(dir, s => { finalWitness(dir, s); s.questions[0].assessment = 'supported';
    s.questions[0].summary = 'Fictional support'; s.questions[0].next_action = 'Close';
    s.questions[0].evidence_refs = ['later-observation'];
    s.records.push({ ...s.records.at(-1), id: 'later-observation',
      path: manifest.replace('study.json', 'retained/later-observation.md'), captured_at: '2026-11-02T00:02:00Z' });
    writeFileSync(resolve(dir, s.records.at(-1).path), readFileSync(resolve(dir, s.records.at(-2).path))); });
  assert.throws(() => checkStudies(dir), /evidence captured after assessment cutoff/);
});
test('a sourced complete report can become ready for review while remaining unadmitted', t => {
  const dir = fixture(t);
  mutate(dir, s => { finalWitness(dir, s); s.evaluation_state = 'complete';
    const q = s.questions[0]; q.assessment = 'supported'; q.summary = 'A scoped synthetic observation';
    q.evidence_refs = ['test-final']; q.next_action = 'Close this bounded synthetic question';
    const report = { ...s.records.at(-1), id: 'test-report', kind: 'closeout',
      path: manifest.replace('study.json', 'retained/synthetic-report.md') };
    writeFileSync(resolve(dir, report.path), readFileSync(resolve(dir, s.records.at(-1).path)));
    s.records.push(report);
    s.closeout = { status: 'ready_for_review', pr_url: 'https://example.invalid/pr', report_record_ref: 'test-report' }; });
  assert.equal(checkStudies(dir)[0].evaluation_state, 'complete');
});
test('ambiguous duplicate JSON keys fail', t => {
  const dir = fixture(t);
  const path = resolve(dir, manifest);
  const raw = readFileSync(path, 'utf8');
  writeFileSync(path, raw.replace('"evaluation_state": "pending",', '"evaluation_state": "pending", "evaluation_state": "complete",'));
  assert.throws(() => checkStudies(dir), /duplicate|Duplicate/);
});
test('closeout readiness requires a report and completed evaluation', t => {
  const dir = fixture(t);
  mutate(dir, s => { s.closeout.status = 'ready_for_review'; });
  assert.throws(() => checkStudies(dir), /review readiness/);
});
test('manual research cannot self-admit downstream', t => {
  const dir = fixture(t);
  mutate(dir, s => { s.downstream.admission = 'admitted'; });
  assert.throws(() => checkStudies(dir), /constant/);
});
test('unknown manifest fields fail instead of silently widening the contract', t => {
  const dir = fixture(t);
  mutate(dir, s => { s.promotable = true; });
  assert.throws(() => checkStudies(dir), /additional properties/);
});
test('orphaned studies are not silently omitted from discovery', t => {
  const dir = fixture(t);
  mutate(dir, s => { s.studies = []; }, 'docs/game-studies/index.json');
  assert.throws(() => checkStudies(dir), /unregistered/);
});
