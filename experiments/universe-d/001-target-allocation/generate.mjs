import {
  PROTOCOL, GENERATOR, ROUTES, COVERAGES, REASONS,
  uniform, categorical, normal, permutation,
} from './random.mjs';

export function requireKeys(object, keys, name = 'record') {
  if (!object || Object.getPrototypeOf(object) !== Object.prototype
    || Object.keys(object).sort().join('|') !== [...keys].sort().join('|')) {
    throw new Error('Unexpected/missing fields in ' + name);
  }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
function finite(x) { return typeof x === 'number' && Number.isFinite(x); }
function vector(x, n, predicate = finite) {
  return Array.isArray(x) && x.length === n && x.every(predicate);
}
function distribution(x, n) {
  return vector(x, n, p => finite(p) && p >= 0 && p <= 1)
    && Math.abs(x.reduce((a, b) => a + b, 0) - 1) < 1e-12;
}
function seeds(values) {
  return Array.isArray(values) && values.length > 0
    && values.every(Number.isSafeInteger) && new Set(values).size === values.length;
}

export function validateConfig(c) {
  requireKeys(c, ['protocol_version', 'generator_version', 'runtime', 'world_seeds',
    'splits', 'development', 'conditions', 'rules', 'fit', 'evaluation'], 'config');
  assert(c.protocol_version === PROTOCOL && c.generator_version === GENERATOR, 'Version mismatch');
  requireKeys(c.runtime, ['node'], 'runtime');
  assert(c.runtime.node === '20.19.0', 'This implementation pins Node 20.19.0');
  assert(seeds(c.world_seeds), 'Invalid world seeds');
  requireKeys(c.splits, ['train', 'dev', 'test'], 'splits');
  requireKeys(c.development, ['world_seeds', 'splits'], 'development');
  requireKeys(c.development.splits, ['train', 'dev'], 'development splits');
  assert(seeds(c.development.world_seeds)
    && !c.development.world_seeds.some(s => c.world_seeds.includes(s)), 'Development seeds must be disjoint');
  for (const n of [...Object.values(c.splits), ...Object.values(c.development.splits)]) {
    assert(Number.isSafeInteger(n) && n > 0, 'Invalid split size');
  }
  requireKeys(c.conditions, ['main', 'null'], 'conditions');
  assert(c.conditions.main === 1 && c.conditions.null === 0, 'Main/null controls changed');
  const r = c.rules;
  const ranges = ['ability', 'qb_preference', 'route_skill', 'defender_suppression'];
  const scalars = ['defender_coefficient', 'crowding_coefficient', 'pressure_depth_coefficient',
    'pressure_probability', 'block_pressure_reduction', 'shock_sd',
    'no_target_intercept', 'pressure_no_target'];
  requireKeys(r, [...ranges, ...scalars, 'block_probabilities', 'route_depths',
    'route_intercepts', 'coverage_interactions', 'pressured_reasons', 'unpressured_reasons'], 'rules');
  for (const name of ranges) assert(vector(r[name], 2) && r[name][0] <= r[name][1], 'Invalid ' + name);
  for (const name of scalars) assert(finite(r[name]), 'Invalid ' + name);
  assert(distribution(r.block_probabilities, 4)
    && distribution(r.pressured_reasons, 3) && distribution(r.unpressured_reasons, 3), 'Invalid rule probabilities');
  assert(vector(r.route_depths, 3) && r.route_depths[0] >= 0 && r.route_depths[0] < 6
    && r.route_depths[1] >= 6 && r.route_depths[1] < 14 && r.route_depths[2] >= 14, 'Route depth bands changed');
  assert(vector(r.route_intercepts, 3)
    && vector(r.coverage_interactions, 3, row => vector(row, 2)), 'Invalid route coefficients');
  assert(r.shock_sd >= 0 && r.pressure_probability >= 0 && r.pressure_probability <= 1
    && r.pressure_probability - r.block_pressure_reduction >= 0
    && r.pressure_probability - r.block_pressure_reduction <= 1, 'Invalid pressure/shock settings');
  requireKeys(c.fit, ['l2', 'step', 'max_iterations', 'gradient_tolerance'], 'fit');
  assert(finite(c.fit.l2) && c.fit.l2 > 0 && finite(c.fit.step) && c.fit.step > 0
    && Number.isSafeInteger(c.fit.max_iterations) && c.fit.max_iterations > 0
    && finite(c.fit.gradient_tolerance) && c.fit.gradient_tolerance > 0, 'Invalid optimizer settings');
  requireKeys(c.evaluation, ['bootstrap_seed', 'bootstrap_resamples', 'minimum_gain',
    'minimum_positive_worlds', 'log_floor', 'calibration_bins', 'minimum_bin_count'], 'evaluation');
  const e = c.evaluation;
  assert(Number.isSafeInteger(e.bootstrap_seed) && Number.isSafeInteger(e.bootstrap_resamples)
    && e.bootstrap_resamples >= 2 && finite(e.minimum_gain) && e.minimum_gain > 0
    && Number.isSafeInteger(e.minimum_positive_worlds) && e.minimum_positive_worlds > 0
    && finite(e.log_floor) && e.log_floor > 0 && e.log_floor < 1
    && e.calibration_bins === 10 && e.minimum_bin_count === 50, 'Invalid evaluation settings');
  return c;
}

const HEADER = ['evidence_origin', 'world_id', 'play_id', 'condition', 'split',
  'protocol_version', 'generator_version', 'prediction_phase'];
function header(seed, condition, split, index) {
  const world = 'ud001:w' + seed;
  return {
    evidence_origin: 'synthetic', world_id: world,
    play_id: 'ud001:' + condition + ':w' + seed + ':' + split + ':' + index,
    condition, split, protocol_version: PROTOCOL, generator_version: GENERATOR,
    prediction_phase: 'assignments_known',
  };
}
function validateHeader(row) {
  assert(row.evidence_origin === 'synthetic' && row.protocol_version === PROTOCOL
    && row.generator_version === GENERATOR && row.prediction_phase === 'assignments_known', 'Invalid synthetic origin/version/phase');
  assert(['main', 'null'].includes(row.condition) && ['train', 'dev', 'test'].includes(row.split), 'Invalid condition/split');
  assert(/^ud001:w-?\d+$/.test(row.world_id), 'Invalid world identity');
  const prefix = 'ud001:' + row.condition + ':' + row.world_id.slice(6) + ':' + row.split + ':';
  assert(typeof row.play_id === 'string' && row.play_id.startsWith(prefix)
    && /^(0|[1-9]\d*)$/.test(row.play_id.slice(prefix.length)), 'Invalid play identity');
}
export function validateMask(mask) {
  assert(vector(mask, 3, x => typeof x === 'boolean')
    && mask.filter(Boolean).length >= 2, 'Invalid route mask');
}
export function validateCommon(row) {
  requireKeys(row, [...HEADER, 'receiver_ids', 'route_mask'], 'common evidence');
  validateHeader(row); validateMask(row.route_mask);
  assert(vector(row.receiver_ids, 3, (x) => typeof x === 'string')
    && row.receiver_ids.every((x, i) => x === row.world_id + ':D-R' + (i + 1)), 'Invalid receiver identity');
}
export function validateRich(row, common) {
  requireKeys(row, [...HEADER, 'routes', 'coverage', 'defender_for', 'zone_occupancy'], 'rich evidence');
  validateHeader(row);
  assert(HEADER.every(k => row[k] === common[k]), 'Evidence join mismatch');
  assert(COVERAGES.includes(row.coverage)
    && vector(row.routes, 3, (r, i) => common.route_mask[i] ? ROUTES.includes(r) : r === null)
    && vector(row.defender_for, 3, (d, i) => common.route_mask[i]
      ? Number.isInteger(d) && d >= 0 && d < 3 : d === null)
    && vector(row.zone_occupancy, 3, n => Number.isInteger(n) && n >= 0 && n <= 3), 'Invalid rich evidence');
  if (row.coverage === 'man_3') {
    const assigned = row.defender_for.filter(d => d !== null);
    assert(new Set(assigned).size === assigned.length && row.zone_occupancy.every(n => n === 0), 'Invalid man responsibilities');
  } else {
    const expected = [0, 0, 0];
    row.routes.forEach((r, i) => {
      if (r !== null) {
        const band = ROUTES.indexOf(r);
        assert(row.defender_for[i] === band, 'Invalid zone responsibility');
        expected[band]++;
      }
    });
    assert(expected.every((n, j) => n === row.zone_occupancy[j]), 'Invalid zone occupancy');
  }
}

export function validateOutcome(outcome, common) {
  requireKeys(outcome, [...HEADER, 'target', 'no_target_reason'], 'outcome');
  validateHeader(outcome);
  assert(HEADER.every(k => outcome[k] === common[k]), 'Label join mismatch');
  assert(Number.isInteger(outcome.target) && outcome.target >= 0 && outcome.target <= 3
    && (outcome.target === 0 || common.route_mask[outcome.target - 1]), 'Invalid or blocked target');
  assert(outcome.target === 0 ? REASONS.includes(outcome.no_target_reason)
    : outcome.no_target_reason === null, 'Invalid no-target reason');
}

export function validateSplit(data, allIds = new Set()) {
  requireKeys(data, ['profile', 'common', 'rich', 'outcomes', 'truth'], 'generated split');
  requireKeys(data.profile, ['ability', 'preference', 'skill', 'defender'], 'profile');
  assert(vector(data.profile.ability, 3) && vector(data.profile.preference, 3)
    && vector(data.profile.defender, 3) && vector(data.profile.skill, 3, r => vector(r, 3)), 'Invalid profile');
  const n = data.common.length;
  assert(n > 0 && ['rich', 'outcomes', 'truth'].every(k => data[k].length === n), 'Incomplete split');
  for (let i = 0; i < n; i++) {
    const common = data.common[i], rich = data.rich[i], outcome = data.outcomes[i], truth = data.truth[i];
    validateCommon(common); validateRich(rich, common);
    assert(['world_id', 'condition', 'split'].every(k => common[k] === data.common[0][k]), 'Mixed split scope');
    assert(!allIds.has(common.play_id), 'Duplicate/overlapping play identity');
    allIds.add(common.play_id);
    validateOutcome(outcome, common);
    requireKeys(truth, [...HEADER, 'pressure', 'shocks', 'probabilities'], 'truth');
    for (const row of [outcome, truth]) {
      validateHeader(row);
      assert(HEADER.every(k => row[k] === common[k]), 'Label/truth join mismatch');
    }
    assert(typeof truth.pressure === 'boolean' && vector(truth.shocks, 3), 'Invalid private truth');
    validateProbabilities(truth.probabilities, common.route_mask);
    assert(truth.probabilities[outcome.target] > 0, 'Impossible generated outcome');
  }
  return data;
}

export function softmax(logits, mask) {
  validateMask(mask);
  const active = [true, ...mask];
  assert(vector(logits, 4, finite), 'Invalid logits');
  const maximum = Math.max(...logits.filter((_, i) => active[i]));
  const exp = logits.map((x, i) => active[i] ? Math.exp(x - maximum) : 0);
  const total = exp.reduce((a, b) => a + b, 0);
  return exp.map(x => x / total);
}

export function validateProbabilities(p, mask) {
  validateMask(mask);
  assert(distribution(p, 4) && mask.every((active, i) => active || p[i + 1] === 0), 'Invalid probabilities/masked target mass');
}

function ranged(seed, field, range) {
  return range[0] + (range[1] - range[0]) * uniform(seed, 'profile', -1, field);
}
export function generateProfile(seed, config) {
  const r = config.rules;
  return {
    ability: [0, 1, 2].map(i => ranged(seed, 'ability:' + i, r.ability)),
    preference: [0, 1, 2].map(i => ranged(seed, 'preference:' + i, r.qb_preference)),
    skill: [0, 1, 2].map(i => [0, 1, 2].map(j => ranged(seed, 'skill:' + i + ':' + j, r.route_skill))),
    defender: [0, 1, 2].map(i => ranged(seed, 'defender:' + i, r.defender_suppression)),
  };
}

// Pure structural equation: no outcomes or observed target summaries are inputs.
export function targetProbabilities(profile, mask, routes, coverage, defenders, occupancy, pressure, shocks, h, rules) {
  const logits = [rules.no_target_intercept + rules.pressure_no_target * Number(pressure), 0, 0, 0];
  for (let i = 0; i < 3; i++) {
    if (!mask[i]) continue;
    const r = ROUTES.indexOf(routes[i]);
    const j = defenders[i];
    const crowding = coverage === 'zone_depth_3' ? Math.max(occupancy[j] - 1, 0) : 0;
    const context = profile.skill[i][r] + rules.route_intercepts[r]
      + rules.coverage_interactions[r][COVERAGES.indexOf(coverage)]
      + rules.defender_coefficient * profile.defender[j] + rules.crowding_coefficient * crowding
      + rules.pressure_depth_coefficient * Number(pressure) * rules.route_depths[r] / 10;
    logits[i + 1] = profile.ability[i] + profile.preference[i] + h * context + shocks[i];
  }
  return softmax(logits, mask);
}

export function generateSplit(seed, condition, split, count, config) {
  assert(['main', 'null'].includes(condition) && ['train', 'dev', 'test'].includes(split)
    && Number.isSafeInteger(count) && count > 0, 'Invalid generator scope');
  const profile = generateProfile(seed, config);
  const common = [], rich = [], outcomes = [], truth = [];
  const r = config.rules;
  for (let index = 0; index < count; index++) {
    const meta = header(seed, condition, split, index);
    const block = categorical(r.block_probabilities, uniform(seed, split, index, 'block')) - 1;
    const mask = [0, 1, 2].map(i => i !== block);
    const proposals = [0, 1, 2].map(i => ROUTES[Math.floor(3 * uniform(seed, split, index, 'route:' + i))]);
    const routes = proposals.map((route, i) => mask[i] ? route : null);
    const coverage = COVERAGES[Math.floor(2 * uniform(seed, split, index, 'coverage'))];
    const man = permutation(seed, split, index);
    const defenders = routes.map((route, i) => !mask[i] ? null
      : coverage === 'man_3' ? man[i] : ROUTES.indexOf(route));
    const occupancy = [0, 0, 0];
    if (coverage === 'zone_depth_3') for (const j of defenders) if (j !== null) occupancy[j]++;
    const pressure = uniform(seed, split, index, 'pressure') < r.pressure_probability - r.block_pressure_reduction * Number(block >= 0);
    const shocks = [0, 1, 2].map(i => r.shock_sd * normal(seed, split, index, 'shock:' + i));
    const probabilities = targetProbabilities(profile, mask, routes, coverage, defenders, occupancy, pressure, shocks, config.conditions[condition], r);
    const target = categorical(probabilities, uniform(seed, split, index, 'target'));
    const reason = target === 0 ? REASONS[categorical(pressure ? r.pressured_reasons : r.unpressured_reasons,
      uniform(seed, split, index, 'no_target_reason'))] : null;
    common.push({ ...meta, receiver_ids: [1, 2, 3].map(i => meta.world_id + ':D-R' + i), route_mask: mask });
    rich.push({ ...meta, routes, coverage, defender_for: defenders, zone_occupancy: occupancy });
    outcomes.push({ ...meta, target, no_target_reason: reason });
    truth.push({ ...meta, pressure, shocks, probabilities });
  }
  return { profile, common, rich, outcomes, truth };
}
