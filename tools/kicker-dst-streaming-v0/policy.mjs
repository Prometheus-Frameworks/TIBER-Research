/** Offline, synthetic-only implementation of Research #25's minimal policies.
 * Structural checks do not authenticate sources, admission, or availability.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FEATURES = {
  DST: ['opponent_pass_attempts', 'opponent_sacks_allowed', 'defense_sacks'],
  K: ['team_fg_attempts', 'team_pat_attempts'],
};
const own = (o, k) => Object.hasOwn(o, k);
const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
function requireThat(ok, message) { if (!ok) throw new Error(message); }
function object(x, label) {
  requireThat(x !== null && typeof x === 'object' && !Array.isArray(x), `${label}: object required`);
}
function text(x, label) {
  requireThat(typeof x === 'string' && x.trim().length > 0, `${label}: nonempty string required`);
}
function instant(x, label) {
  requireThat(typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(x), `${label}: UTC instant required`);
  const n = Date.parse(x);
  const normalized = x.includes('.') ? x : x.replace('Z', '.000Z');
  requireThat(Number.isFinite(n) && new Date(n).toISOString() === normalized, `${label}: invalid instant`);
  return n;
}
function finite(x, label, nonnegative = false) {
  requireThat(typeof x === 'number' && Number.isFinite(x) && (!nonnegative || x >= 0), `${label}: invalid number`);
}

// Only declared pre-cutoff completed observations may enter features. The raw
// arrays may contain >4 games; this function selects the latest four per feature.
function summarize(rows, feature, cutoff, profile) {
  if (rows === undefined || rows === null) return { mean: null, games: 0, sparse: true };
  requireThat(Array.isArray(rows), `${feature}: history must be an array`);
  const seen = new Set();
  const checked = rows.map(row => {
    object(row, feature);
    text(row.game_id, 'game_id');
    text(row.source_ref, 'source_ref');
    requireThat(!seen.has(row.game_id), `${feature}: duplicate game`);
    seen.add(row.game_id);
    const ended = instant(row.event_end, 'event_end');
    const available = instant(row.available_at, 'available_at');
    requireThat(ended < cutoff && ended <= available && available <= cutoff, `${feature}: cutoff violation`);
    if (feature === 'recent_points') {
      requireThat(row.scoring_profile_id === profile, 'recent_points: scoring profile mismatch');
    }
    finite(row.value, feature, feature !== 'recent_points');
    return { ...row, ended };
  }).sort((a, b) => b.ended - a.ended || cmp(a.game_id, b.game_id)).slice(0, 4);
  const mean = checked.length ? checked.reduce((sum, row) => sum + row.value, 0) / checked.length : null;
  requireThat(mean === null || Number.isFinite(mean), `${feature}: nonfinite mean`);
  return { mean, games: checked.length, sparse: checked.length < 4,
    source_refs: checked.map(row => row.source_ref), game_ids: checked.map(row => row.game_id) };
}

function sortedBy(rows, feature) {
  return [...rows].sort((a, b) => {
    const av = a.features[feature].mean, bv = b.features[feature].mean;
    if (av === null && bv !== null) return 1;
    if (bv === null && av !== null) return -1;
    return (av === null ? 0 : bv - av) || cmp(a.id, b.id);
  });
}

// Average ranks for tied values, ascending feature values; a singleton is 0.5.
function percentiles(rows, feature) {
  const sorted = [...rows].sort((a, b) => a.features[feature].mean - b.features[feature].mean || cmp(a.id, b.id));
  const result = new Map();
  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].features[feature].mean === sorted[i].features[feature].mean) j++;
    const p = sorted.length === 1 ? 0.5 : ((i + j - 1) / 2) / (sorted.length - 1);
    for (let k = i; k < j; k++) result.set(sorted[k].id, p);
    i = j;
  }
  return result;
}

export function assess(packet) {
  object(packet, 'packet');
  requireThat(packet.schema_version === 'kdst-policy-prototype/v0', 'schema version mismatch');
  requireThat(packet.synthetic === true, 'synthetic fixtures only; real-data adapter is not activated');
  requireThat(own(FEATURES, packet.position), 'position must be K or DST');
  text(packet.scoring_profile_id, 'scoring_profile_id');
  const cutoff = instant(packet.cutoff_at, 'cutoff_at');
  requireThat(Array.isArray(packet.pool), 'pool must be an array');
  const features = FEATURES[packet.position];
  const seen = new Set(), eligible = [], excluded = [];
  for (const c of packet.pool) {
    object(c, 'candidate');
    text(c.id, 'id');
    requireThat(!seen.has(c.id), 'duplicate candidate identity');
    seen.add(c.id);
    requireThat(['eligible', 'held', 'locked', 'bye'].includes(c.eligibility), 'explicit eligibility required');
    if (c.eligibility !== 'eligible') {
      excluded.push({ id: c.id, reason: c.eligibility });
      continue;
    }
    requireThat(instant(c.kickoff_at, 'kickoff_at') > cutoff, 'eligible game has already started');
    object(c.history, 'history');
    if (packet.position === 'K') requireThat(typeof c.job_verified === 'boolean', 'explicit kicker job status required');
    const summaries = {};
    for (const f of [...features, 'recent_points']) {
      summaries[f] = summarize(c.history[f], f, cutoff, packet.scoring_profile_id);
    }
    eligible.push({ id: c.id, features: summaries, job_supported: packet.position === 'DST' || c.job_verified });
  }
  eligible.sort((a, b) => cmp(a.id, b.id));
  const missing = eligible.flatMap(c => [
    ...features.filter(f => c.features[f].mean === null).map(f => ({ id: c.id, feature: f })),
    ...(c.job_supported ? [] : [{ id: c.id, feature: 'kicker_job' }]),
  ]);
  const supported = eligible.filter(c => c.job_supported && features.every(f => c.features[f].mean !== null)).length;
  const prior = sortedBy(eligible, 'recent_points');
  const matchupFeature = packet.position === 'DST' ? 'opponent_sacks_allowed' : 'team_fg_attempts';
  const matchup = sortedBy(eligible, matchupFeature);
  const baseline = (rows, feature) => ({
    status: rows.some(c => c.features[feature].mean !== null) ? 'available' : 'unavailable',
    selected_id: rows.find(c => c.features[feature].mean !== null)?.id ?? null,
    order: rows.map(c => c.id), unsupported_ids: rows.filter(c => c.features[feature].mean === null).map(c => c.id),
  });
  let rankings = [];
  if (eligible.length && !missing.length) {
    const p = features.map(f => percentiles(eligible, f));
    rankings = eligible.map(c => ({
      id: c.id, rank_score: p.reduce((sum, values) => sum + values.get(c.id), 0) / features.length,
      feature_percentiles: Object.fromEntries(features.map((f, i) => [f, p[i].get(c.id)])),
    })).sort((a, b) => b.rank_score - a.rank_score || cmp(a.id, b.id));
  }
  return {
    schema_version: 'kdst-policy-assessment/v0', synthetic: true, position: packet.position,
    cutoff_at: packet.cutoff_at, scoring_profile_id: packet.scoring_profile_id,
    evidence_status: 'synthetic_unverified_declarations',
    forecast_status: 'uncalibrated_rank_only',
    eligible_ids: eligible.map(c => c.id), excluded,
    candidate: { status: !eligible.length ? 'empty_pool' : missing.length ? 'abstained' : 'ranked',
      selected_id: rankings[0]?.id ?? null, rankings, missing,
      feature_coverage: { supported, total: eligible.length } },
    baselines: { recent_points: baseline(prior, 'recent_points'), simple_matchup: baseline(matchup, matchupFeature) },
    inputs: eligible,
  };
}

// This executable intentionally accepts no real input path or outcome argument.
// The library's assess() also fails closed unless a packet declares synthetic.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  requireThat(process.argv.length === 3 && process.argv[2] === '--demo', 'usage: node tools/kicker-dst-streaming-v0/policy.mjs --demo');
  const packets = JSON.parse(readFileSync(new URL('./synthetic.json', import.meta.url), 'utf8'));
  console.log(JSON.stringify(packets.map(assess), null, 2));
}
