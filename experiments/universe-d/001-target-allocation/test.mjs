import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync, existsSync, symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { uniform, categorical } from './random.mjs';
import {
  validateConfig, generateSplit, validateSplit, validateCommon, validateRich,
  targetProbabilities, softmax, validateProbabilities,
} from './generate.mjs';
import {
  MODELS, projectEvidence, validateView, featureNames, compileTraining,
  objectiveGradient, fitModel, fitTrainingSplit, predict,
} from './fit.mjs';
import { scoreModel, countOutcomes, summarizeWorlds } from './evaluate.mjs';
import { runExperiment, checkOutputPath, jsonBytes, BENCHMARK_CONFIG_SHA256 } from './run.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG = JSON.parse(readFileSync(join(HERE, 'config.json')));
const clone = structuredClone;
const trainInput = data => ({ common: data.common, rich: data.rich, outcomes: data.outcomes });
const near = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) <= tolerance, a + ' != ' + b);
function temp(t) {
  const path = mkdtempSync(join(tmpdir(), 'ud001-test-'));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
}

test('runtime/config pin and closed configuration', () => {
  assert.equal(process.versions.node, '20.19.0');
  validateConfig(clone(CONFIG));
  assert.equal(createHash('sha256').update(readFileSync(join(HERE, 'config.json'))).digest('hex'), BENCHMARK_CONFIG_SHA256);
  for (const mutate of [
    c => { c.secret = 'not a permitted field'; },
    c => { c.rules.shock_sd = -1; },
    c => { c.rules.block_probabilities = [1, 1, 0, 0]; },
    c => { c.development.world_seeds = [101]; },
    c => { c.splits.train = 0; },
    c => { c.conditions.null = 0.5; },
  ]) {
    const c = clone(CONFIG); mutate(c); assert.throws(() => validateConfig(c));
  }
});

test('keyed draws match an independent SHA-256 golden value and valid categorical support', () => {
  near(uniform(1001, 'train', 0, 'target'), 0.1615444624757666, 1e-16);
  assert.notEqual(uniform(1001, 'train', 0, 'target'), uniform(1001, 'dev', 0, 'target'));
  assert.equal(categorical([0, 0.5, 0.5], 0.1), 1);
  assert.equal(categorical([0.5, 0.5, 0], 0.9), 1);
  assert.throws(() => categorical([0.5, 0.5], 1));
  assert.throws(() => categorical([1, -1, 1], 0.4));
});

test('hand-calculated zone crowding, man assignment and masked probabilities', () => {
  const profile = { ability: [0, 0, 0], preference: [0, 0, 0],
    skill: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], defender: [0.5, 0.5, 0.5] };
  const p = targetProbabilities(profile, [true, true, true], ['flat', 'flat', 'flat'],
    'zone_depth_3', [0, 0, 0], [3, 0, 0], false, [0, 0, 0], 1, CONFIG.rules);
  // Each receiver logit = -.10 + .15 - .70*.5 + .20*2 = .10.
  near(p[0], 1 / (1 + 3 * Math.exp(0.5)));
  p.slice(1).forEach(x => near(x, Math.exp(0.5) / (1 + 3 * Math.exp(0.5))));
  const masked = softmax([0, 0, 0, 999], [true, true, false]);
  assert.deepEqual(masked, [1 / 3, 1 / 3, 1 / 3, 0]);
  const manProfile = { ...profile, defender: [0, 0.5, 1] };
  const actual = targetProbabilities(manProfile, [true, true, false], ['flat', 'flat', null],
    'man_3', [2, 0, null], [0, 0, 0], false, [0, 0, 0], 1, CONFIG.rules);
  near(actual[1] / actual[2], Math.exp(-0.7));
  assert.throws(() => validateProbabilities([0.2, 0.3, 0.3, 0.2], [true, true, false]));
  assert.throws(() => validateProbabilities([NaN, 0, 0, 0], [true, true, false]));
});

test('null removes every context pathway, not just the interaction table', () => {
  const profile = { ability: [0.1, 0.2, 0.3], preference: [0, 0, 0],
    skill: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], defender: [0, 0, 0] };
  const baseline = targetProbabilities(profile, [true, true, true], ['flat', 'slant', 'go'],
    'man_3', [0, 1, 2], [0, 0, 0], true, [0, 0, 0], 0, CONFIG.rules);
  const changed = clone(profile);
  changed.skill = [[5, -3, 8], [5, -3, 8], [5, -3, 8]];
  changed.defender = [9, -8, 4];
  const altered = targetProbabilities(changed, [true, true, true], ['go', 'go', 'go'],
    'zone_depth_3', [2, 2, 2], [0, 0, 3], true, [0, 0, 0], 0, CONFIG.rules);
  assert.deepEqual(altered, baseline);
});

test('generated records preserve eligibility, identities and coverage responsibilities', () => {
  const ids = new Set();
  for (const condition of ['main', 'null']) {
    const data = validateSplit(generateSplit(5001, condition, 'dev', 160, CONFIG), ids);
    assert.ok(data.common.some(r => r.route_mask.includes(false)));
    assert.ok(data.rich.some(r => r.coverage === 'man_3'));
    assert.ok(data.rich.some(r => r.coverage === 'zone_depth_3'));
    assert.equal(new Set(data.common.map(r => r.play_id)).size, 160);
    const blocked = data.common.findIndex(row => row.route_mask.includes(false));
    const invalid = clone(data);
    invalid.outcomes[blocked].target = invalid.common[blocked].route_mask.indexOf(false) + 1;
    invalid.outcomes[blocked].no_target_reason = null;
    assert.throws(() => validateSplit(invalid), /blocked/);
    const duplicate = clone(data);
    for (const field of ['common', 'rich', 'outcomes', 'truth']) duplicate[field][1] = clone(duplicate[field][0]);
    assert.throws(() => validateSplit(duplicate), /Duplicate/);
    const zoneIndex = data.rich.findIndex(r => r.coverage === 'zone_depth_3');
    const badZone = clone(data.rich[zoneIndex]);
    badZone.zone_occupancy = [0, 0, 0];
    assert.throws(() => validateRich(badZone, data.common[zoneIndex]), /occupancy/);
    const multiple = clone(data); multiple.outcomes[0].target = [1, 2];
    assert.throws(() => validateSplit(multiple), /target/);
  }
});

test('test stream is unchanged when a training split is generated at a different size', () => {
  const before = generateSplit(5002, 'main', 'test', 12, CONFIG);
  generateSplit(5002, 'main', 'train', 3, CONFIG);
  const c = clone(CONFIG); c.splits.train = 9;
  generateSplit(5002, 'main', 'train', 9, c);
  assert.deepEqual(generateSplit(5002, 'main', 'test', 12, c), before);
});

test('learner projections reject truth/seed/target extras, origin loss and invalid views', () => {
  const data = validateSplit(generateSplit(5003, 'main', 'train', 8, CONFIG));
  const common = data.common[0], rich = data.rich[0];
  const originalCommon = clone(common), originalRich = clone(rich);
  for (const field of ['seed', 'truth', 'target', 'probabilities']) {
    assert.throws(() => validateCommon({ ...common, [field]: 1 }), /fields/);
  }
  assert.throws(() => validateCommon({ ...common, evidence_origin: 'NFL' }), /origin/);
  assert.throws(() => validateCommon({ ...common, generator_version: 'other' }), /version/);
  assert.throws(() => projectEvidence('B0', common, rich), /common evidence only/);
  for (const model of MODELS) {
    const view = projectEvidence(model, common, model === 'B0' ? undefined : rich);
    for (const field of ['seed', 'world_id', 'target', 'truth', 'probabilities']) {
      assert.throws(() => validateView(model, { ...view, [field]: 1 }), /fields/);
    }
    const invalid = clone(view); delete invalid.evidence_origin;
    assert.throws(() => validateView(model, invalid), /fields/);
    const invalidOrigin = clone(view); invalidOrigin.evidence_origin = 'real';
    assert.throws(() => validateView(model, invalidOrigin), /origin/);
    view.mask[0] = !view.mask[0];
    if (view.routes) view.routes[0] = null;
    if (view.defender_for) view.defender_for[0] = null;
    assert.deepEqual(data.common[0], originalCommon);
    assert.deepEqual(data.rich[0], originalRich);
  }
  assert.ok(!('routes' in projectEvidence('BC', common, rich)));
  assert.ok(!('coverage' in projectEvidence('BR', common, rich)));
  assert.deepEqual(MODELS.map(m => featureNames(m).length), [9, 18, 15, 34]);
});

test('analytic training gradient matches finite differences independently', () => {
  const data = generateSplit(5004, 'main', 'train', 7, CONFIG);
  for (const model of MODELS) {
    const views = data.common.map((r, i) => projectEvidence(model, r, model === 'B0' ? undefined : data.rich[i]));
    const { names, cases } = compileTraining(model, views, data.outcomes.map(r => r.target));
    const weights = names.map((_, i) => (i % 5 - 2) * 0.07);
    const analytic = objectiveGradient(weights, cases, 0.001);
    for (let k = 0; k < names.length; k++) {
      const plus = [...weights], minus = [...weights], step = 1e-5;
      plus[k] += step; minus[k] -= step;
      const numeric = (objectiveGradient(plus, cases, 0.001).loss - objectiveGradient(minus, cases, 0.001).loss) / (2 * step);
      near(analytic.gradient[k], numeric, 1e-7);
    }
    const fitted = fitModel(model, views, data.outcomes.map(r => r.target), CONFIG.fit);
    assert.ok(fitted.diagnostics.objective < Math.log(4));
    assert.ok(fitted.diagnostics.converged);
    const capped = fitModel(model, views, data.outcomes.map(r => r.target), { ...CONFIG.fit, max_iterations: 1 });
    assert.equal(capped.diagnostics.converged, false);
    fitted.weights.forEach(w => assert.ok(Number.isFinite(w)));
    const p = predict(fitted, views[0]);
    validateProbabilities(p, views[0].mask);
    const { cases: compiled } = compileTraining(model, views, data.outcomes.map(r => r.target));
    const final = objectiveGradient(fitted.weights, compiled, CONFIG.fit.l2);
    near(final.loss, fitted.diagnostics.objective);
    near(Math.max(...final.gradient.map(Math.abs)), fitted.diagnostics.max_abs_gradient);
  }
});

test('held-out outcome/truth changes cannot affect fitting; wrong-split fitting rejects', () => {
  const train = generateSplit(5005, 'main', 'train', 16, CONFIG);
  const held = generateSplit(5005, 'main', 'test', 8, CONFIG);
  const before = fitTrainingSplit(trainInput(train), CONFIG.fit);
  held.outcomes.forEach(row => { row.target = 0; row.no_target_reason = 'throwaway'; });
  held.truth.forEach(row => { row.pressure = !row.pressure; row.probabilities = [1, 0, 0, 0]; });
  assert.deepEqual(fitTrainingSplit(trainInput(train), CONFIG.fit), before);
  assert.throws(() => fitTrainingSplit(train, CONFIG.fit), /fields/);
  assert.throws(() => fitTrainingSplit(trainInput(held), CONFIG.fit), /Training scope/);
  const wrongLabels = trainInput(clone(train)); wrongLabels.outcomes[0].play_id = 'ud001:main:w5005:train:999';
  assert.throws(() => fitTrainingSplit(wrongLabels, CONFIG.fit), /join/);
});

test('scores, route denominators and undefined target share match hand calculations', () => {
  const data = generateSplit(5006, 'main', 'dev', 2, CONFIG);
  data.common.forEach(row => { row.route_mask = [true, true, false]; });
  data.outcomes[0].target = 1; data.outcomes[0].no_target_reason = null;
  data.outcomes[1].target = 0; data.outcomes[1].no_target_reason = 'throwaway';
  const score = scoreModel(data.common, data.outcomes, [[0.5, 0.25, 0.25, 0], [0.5, 0.25, 0.25, 0]], CONFIG.evaluation);
  near(score.log_loss, (Math.log(4) + Math.log(2)) / 2);
  near(score.brier, (0.875 + 0.375) / 2);
  assert.equal(score.calibration.R3.reduce((s, bin) => s + bin.count, 0), 0);
  const counts = countOutcomes(data.common, data.outcomes);
  assert.deepEqual(counts.receivers.map(r => [r.routes, r.targets]), [[2, 1], [2, 0], [0, 0]]);
  assert.equal(counts.receivers[0].targets_per_route, 0.5);
  assert.equal(counts.receivers[0].target_share, 1);
  assert.equal(counts.receivers[2].targets_per_route, null);
  data.outcomes[0].target = 0; data.outcomes[0].no_target_reason = 'throwaway';
  assert.ok(countOutcomes(data.common, data.outcomes).receivers.every(r => r.target_share === null));
});

test('hand-authored world scores exercise success, null failure and coverage gates', () => {
  const worlds = ['main', 'null'].flatMap(condition => CONFIG.world_seeds.map(seed => ({
    condition, world_id: 'ud001:w' + seed, split: 'test', counts: { dropbacks: 2000 },
    optimizer: Object.fromEntries(MODELS.map(m => [m, { converged: true }])),
    models: { B0: { log_loss: 1.2 }, BR: { log_loss: 1.19 }, BC: { log_loss: 1.195 },
      BRC: { log_loss: condition === 'main' ? 1.18 : 1.205 } },
  })));
  const supported = summarizeWorlds(worlds, CONFIG, 'evaluate');
  assert.equal(supported.claim_status, 'synthetic recovery demonstrated');
  assert.equal(supported.conditions.main.paired_world_bootstrap_95.length, 2);
  const nullGain = clone(worlds);
  nullGain.filter(w => w.condition === 'null').forEach(w => { w.models.BRC.log_loss = 1.18; });
  assert.equal(summarizeWorlds(nullGain, CONFIG, 'evaluate').claim_status, 'invalid evaluation');
  const missing = clone(worlds); missing.pop();
  assert.equal(summarizeWorlds(missing, CONFIG, 'evaluate').claim_status, 'invalid evaluation');
  const notConverged = clone(worlds); notConverged[0].optimizer.BRC.converged = false;
  assert.equal(summarizeWorlds(notConverged, CONFIG, 'evaluate').claim_status, 'invalid evaluation');
  assert.equal(summarizeWorlds(worlds, CONFIG, 'dev').conditions.main.support_rule_met, null);
});

test('output rejection happens before directory creation and never overwrites', t => {
  const parent = temp(t), existing = join(parent, 'existing');
  mkdirSync(existing);
  assert.throws(() => checkOutputPath(existing), /already exists/);
  assert.throws(() => checkOutputPath('relative-output'), /absolute/);
  assert.throws(() => checkOutputPath(join(HERE, 'must-not-exist')), /outside/);
  assert.equal(existsSync(join(HERE, 'must-not-exist')), false);
  const alias = join(parent, 'alias');
  symlinkSync(parent, alias, 'dir');
  assert.throws(() => checkOutputPath(join(alias, 'new')), /symlink/);
  const dangling = join(parent, 'dangling');
  symlinkSync(join(parent, 'missing'), dangling, 'dir');
  assert.throws(() => checkOutputPath(dangling), /already exists/);
  const invalidConfig = join(parent, 'invalid.json');
  writeFileSync(invalidConfig, '{"unexpected":true}\n');
  const out = join(parent, 'must-not-create');
  assert.throws(() => runExperiment({ configPath: invalidConfig, output: out }));
  assert.equal(existsSync(out), false);
});

test('development end-to-end replay preserves exact bytes, scope and artifact hashes', t => {
  const parent = temp(t), configPath = join(parent, 'config.json');
  const c = clone(CONFIG);
  c.development = { world_seeds: [5010], splits: { train: 16, dev: 8 } };
  writeFileSync(configPath, jsonBytes(c));
  const first = runExperiment({ configPath, output: join(parent, 'first') });
  const second = runExperiment({ configPath, output: join(parent, 'second') });
  assert.equal(first.manifest_sha256, second.manifest_sha256);
  const a = JSON.parse(readFileSync(join(parent, 'first', 'manifest.json')));
  const b = JSON.parse(readFileSync(join(parent, 'second', 'manifest.json')));
  assert.deepEqual(a, b);
  assert.deepEqual(a.world_ids, ['ud001:w5010']);
  assert.equal(a.claim_status, 'development validation only');
  assert.equal(a.completed_phases.filter(p => p.startsWith('generated:')).length, 4);
  assert.ok(a.completed_phases.every(p => !p.endsWith(':test')));
  for (const [path, receipt] of Object.entries(a.artifacts)) {
    const bytes = readFileSync(join(parent, 'first', path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), receipt.sha256);
    assert.equal(bytes.length, receipt.bytes);
    assert.deepEqual(bytes, readFileSync(join(parent, 'second', path)));
  }
  const metrics = JSON.parse(readFileSync(join(parent, 'first', 'metrics.json')));
  assert.equal(metrics.summary.conditions.main.paired_world_bootstrap_95, null);
  assert.equal(metrics.summary.conditions.null.support_rule_met, null);
  assert.throws(() => runExperiment({ configPath, output: join(parent, 'first') }), /already exists/);
  const finalOut = join(parent, 'no-final-run');
  assert.throws(() => runExperiment({ configPath, output: finalOut, mode: 'evaluate' }), /exact pinned config/);
  assert.equal(existsSync(finalOut), false);
  const cli = spawnSync(process.execPath, [join(HERE, 'run.mjs'), '--config', configPath, '--out', join(parent, 'cli'), '--unknown', 'x'], { encoding: 'utf8' });
  assert.equal(cli.status, 1);
  assert.equal(existsSync(join(parent, 'cli')), false);
});
