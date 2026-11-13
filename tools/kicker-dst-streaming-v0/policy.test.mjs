import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assess } from './policy.mjs';

const examples = JSON.parse(readFileSync(new URL('./synthetic.json', import.meta.url), 'utf8'));
const fixture = (position = 'DST') => structuredClone(examples.find(p => p.position === position));
const obs = (value, day = 10, extras = {}) => ({ game_id: `GAME_${day}`, value,
  event_end: `2026-10-${day}T20:00:00Z`, available_at: `2026-10-${day}T21:00:00Z`,
  source_ref: `synthetic:game-${day}`, ...extras });

test('DST hand calculation: the three-feature candidate can differ from both baselines', () => {
  const r = assess(fixture());
  assert.deepEqual(r.eligible_ids, ['DST_A', 'DST_B', 'DST_C']);
  assert.deepEqual(r.candidate.rankings.map(x => [x.id, x.rank_score]), [
    ['DST_B', 2 / 3], ['DST_C', 0.5], ['DST_A', 1 / 3],
  ]);
  assert.equal(r.baselines.recent_points.selected_id, 'DST_C');
  assert.equal(r.baselines.simple_matchup.selected_id, 'DST_A');
  assert.equal(r.forecast_status, 'uncalibrated_rank_only');
  assert.equal(r.candidate.rankings[0].projected_points, undefined);
});

test('kicker opportunity ranking uses FG and PAT attempts separately', () => {
  const r = assess(fixture('K'));
  assert.deepEqual(r.candidate.rankings.map(x => [x.id, x.rank_score]), [
    ['K_B', 0.75], ['K_A', 0.5], ['K_C', 0.25],
  ]);
  assert.equal(r.baselines.simple_matchup.selected_id, 'K_A');
  assert.equal(r.baselines.recent_points.selected_id, 'K_C');
});

test('feature ties use average percentile ranks and final ID tie-break', () => {
  const p = fixture();
  for (const c of p.pool) c.history = structuredClone(p.pool[0].history);
  const r = assess(p);
  assert.deepEqual(r.candidate.rankings.map(x => x.rank_score), [0.5, 0.5, 0.5]);
  assert.equal(r.candidate.selected_id, 'DST_A');
});

test('singleton and empty pools are explicit', () => {
  const p = fixture(); p.pool = p.pool.slice(0, 1);
  assert.equal(assess(p).candidate.rankings[0].rank_score, 0.5);
  p.pool = [];
  const r = assess(p);
  assert.equal(r.candidate.status, 'empty_pool');
  assert.equal(r.candidate.selected_id, null);
  assert.equal(r.baselines.recent_points.status, 'unavailable');
});

test('one missing feature abstains on the unchanged pool; baselines remain intact', () => {
  const p = fixture(); delete p.pool[0].history.defense_sacks;
  const r = assess(p);
  assert.equal(r.candidate.status, 'abstained');
  assert.equal(r.candidate.selected_id, null);
  assert.deepEqual(r.candidate.feature_coverage, { supported: 2, total: 3 });
  assert.equal(r.baselines.recent_points.selected_id, 'DST_C');
  assert.equal(r.baselines.recent_points.order.length, 3);
  assert.equal(r.baselines.simple_matchup.selected_id, 'DST_A');
});

test('zero events are observed evidence; null history means unknown', () => {
  const p = fixture();
  p.pool[0].history.defense_sacks = [obs(0)];
  assert.equal(assess(p).candidate.status, 'ranked');
  p.pool[0].history.defense_sacks = null;
  assert.equal(assess(p).candidate.status, 'abstained');
});

test('negative recent scores outrank unsupported history; sparse counts stay visible', () => {
  const p = fixture();
  for (const c of p.pool) c.history.recent_points = [];
  p.pool[1].history.recent_points = [obs(-4, 10, { scoring_profile_id: p.scoring_profile_id })];
  const r = assess(p);
  assert.equal(r.baselines.recent_points.selected_id, 'DST_B');
  assert.deepEqual(r.baselines.recent_points.unsupported_ids, ['DST_A', 'DST_C']);
  assert.equal(r.inputs[1].features.recent_points.sparse, true);
  assert.equal(r.inputs[1].features.recent_points.games, 1);
  assert.equal(r.candidate.status, 'ranked');
});

test('latest-four lookback excludes an older extreme; order does not affect results', () => {
  const p = fixture();
  p.pool[0].history.defense_sacks = [obs(1000, 10), obs(1, 11), obs(1, 12), obs(1, 13), obs(1, 14)];
  const a = assess(p);
  assert.equal(a.inputs[0].features.defense_sacks.mean, 1);
  assert.equal(a.inputs[0].features.defense_sacks.games, 4);
  p.pool.reverse();
  for (const c of p.pool) for (const rows of Object.values(c.history)) rows.reverse();
  assert.deepEqual(assess(p), a);
});

test('late revisions, current/future observations, and impossible chronology fail closed', () => {
  for (const change of [
    { available_at: '2026-10-28T00:00:00Z' },
    { event_end: '2026-10-28T00:00:00Z', available_at: '2026-10-28T01:00:00Z' },
    { available_at: '2026-10-09T00:00:00Z' },
  ]) {
    const p = fixture(); Object.assign(p.pool[0].history.defense_sacks[0], change);
    assert.throws(() => assess(p), /cutoff violation/);
  }
});

test('invalid calendar dates, local times, and submillisecond clocks are rejected', () => {
  for (const time of ['2026-02-30T00:00:00Z', '2026-10-27T20:00:00', '2026-10-27T20:00:00.0001Z']) {
    const p = fixture(); p.cutoff_at = time;
    assert.throws(() => assess(p), /instant/);
  }
});

test('started games cannot enter; declared held/locked/bye options stay excluded', () => {
  const p = fixture(); p.pool[0].kickoff_at = p.cutoff_at;
  assert.throws(() => assess(p), /already started/);
  for (const state of ['held', 'locked', 'bye']) {
    p.pool[0].eligibility = state;
    const r = assess(p);
    assert.deepEqual(r.eligible_ids, ['DST_B', 'DST_C']);
    assert.deepEqual(r.excluded, [{ id: 'DST_A', reason: state }]);
  }
});

test('duplicate entities or duplicated games cannot inflate the evidence', () => {
  const p = fixture(); p.pool[1].id = p.pool[0].id;
  assert.throws(() => assess(p), /duplicate candidate/);
  const q = fixture(); q.pool[0].history.defense_sacks.push(q.pool[0].history.defense_sacks[0]);
  assert.throws(() => assess(q), /duplicate game/);
});

test('wrong scoring target is not a compatible recent-points baseline', () => {
  const p = fixture(); p.pool[0].history.recent_points[0].scoring_profile_id = 'different-profile';
  assert.throws(() => assess(p), /profile mismatch/);
});

test('kicker identity/job support is required across the original eligible pool', () => {
  const p = fixture('K'); p.pool[0].job_verified = false;
  assert.equal(assess(p).candidate.status, 'abstained');
  assert.equal(assess(p).baselines.simple_matchup.selected_id, 'K_A');
  delete p.pool[0].job_verified;
  assert.throws(() => assess(p), /job status/);
});

test('malformed and nonfinite values cannot masquerade as zero observations', () => {
  for (const value of [null, '3', true, -1, Infinity, NaN, {}, []]) {
    const p = fixture(); p.pool[0].history.defense_sacks[0].value = value;
    assert.throws(() => assess(p), /invalid number/);
  }
  const p = fixture();
  p.pool[0].history.defense_sacks = [obs(Number.MAX_VALUE, 10), obs(Number.MAX_VALUE, 11)];
  assert.throws(() => assess(p), /nonfinite mean/);
});

test('real-data mode, unknown positions, and undeclared eligibility are rejected', () => {
  const p = fixture(); p.synthetic = false;
  assert.throws(() => assess(p), /synthetic fixtures only/);
  p.synthetic = true; p.position = 'QB';
  assert.throws(() => assess(p), /position/);
  p.position = 'DST'; delete p.pool[0].eligibility;
  assert.throws(() => assess(p), /eligibility/);
});

test('CLI runs only the shipped fictional demo; no arbitrary data path', () => {
  const script = new URL('./policy.mjs', import.meta.url);
  const demo = spawnSync(process.execPath, [fileURLToPath(script), '--demo'], { encoding: 'utf8' });
  assert.equal(demo.status, 0, demo.stderr);
  assert.equal(JSON.parse(demo.stdout).length, 2);
  assert.ok(JSON.parse(demo.stdout).every(r => r.synthetic === true));
  const invalid = spawnSync(process.execPath, [fileURLToPath(script), 'real-league.json'], { encoding: 'utf8' });
  assert.notEqual(invalid.status, 0);
});
