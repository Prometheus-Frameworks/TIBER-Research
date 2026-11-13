import { CLASSES, uniform } from './random.mjs';
import { validateCommon, validateOutcome, validateProbabilities, validateSplit } from './generate.mjs';
import { MODELS, projectEvidence, predict } from './fit.mjs';

export function scoreModel(common, outcomes, probabilities, settings) {
  if (!common.length || outcomes.length !== common.length || probabilities.length !== common.length) {
    throw new Error('Incomplete scoring population');
  }
  let logLoss = 0, brier = 0;
  const ids = new Set();
  const bins = CLASSES.map(() => Array.from({ length: settings.calibration_bins },
    () => ({ count: 0, predicted_sum: 0, positives: 0 })));
  for (let i = 0; i < common.length; i++) {
    const row = common[i], target = outcomes[i].target, p = probabilities[i];
    validateCommon(row); validateOutcome(outcomes[i], row); validateProbabilities(p, row.route_mask);
    if (ids.has(row.play_id)) throw new Error('Duplicate scoring play');
    ids.add(row.play_id);
    logLoss -= Math.log(Math.max(settings.log_floor, p[target]));
    for (let k = 0; k < 4; k++) {
      brier += (p[k] - Number(target === k)) ** 2;
      if (k > 0 && !row.route_mask[k - 1]) continue;
      const bin = bins[k][Math.min(settings.calibration_bins - 1, Math.floor(p[k] * settings.calibration_bins))];
      bin.count++; bin.predicted_sum += p[k]; bin.positives += Number(target === k);
    }
  }
  return {
    plays: common.length, log_loss: logLoss / common.length, brier: brier / common.length,
    calibration: Object.fromEntries(CLASSES.map((name, k) => [name, bins[k].map((bin, b) => ({
      lower: b / settings.calibration_bins, upper: (b + 1) / settings.calibration_bins,
      count: bin.count, predicted_mean: bin.count ? bin.predicted_sum / bin.count : null,
      observed_rate: bin.count ? bin.positives / bin.count : null,
      status: bin.count < settings.minimum_bin_count ? 'insufficient' : 'descriptive_summary',
    }))])),
  };
}

export function countOutcomes(common, outcomes) {
  const targets = [0, 0, 0, 0], routes = [0, 0, 0];
  common.forEach((row, i) => {
    validateCommon(row); validateOutcome(outcomes[i], row);
    targets[outcomes[i].target]++;
    row.route_mask.forEach((active, j) => { routes[j] += Number(active); });
  });
  const teamTargets = targets.slice(1).reduce((a, b) => a + b, 0);
  return {
    dropbacks: common.length, no_target: targets[0], no_target_rate: targets[0] / common.length,
    team_credited_targets: teamTargets,
    receivers: routes.map((n, i) => ({
      slot: 'R' + (i + 1), routes: n, targets: targets[i + 1],
      targets_per_route: n ? targets[i + 1] / n : null,
      route_participation: n / common.length,
      target_share: teamTargets ? targets[i + 1] / teamTargets : null,
    })),
  };
}

export function evaluateSplit(data, fitted, settings) {
  validateSplit(data);
  const arrays = Object.fromEntries(['U', ...MODELS, 'Oracle'].map(name => [name, []]));
  const predictions = data.common.map((common, i) => {
    const active = common.route_mask.filter(Boolean).length + 1;
    const probabilities = { U: [1 / active, ...common.route_mask.map(x => x ? 1 / active : 0)] };
    for (const model of MODELS) {
      probabilities[model] = predict(fitted[model], projectEvidence(model, common, model === 'B0' ? undefined : data.rich[i]));
    }
    probabilities.Oracle = [...data.truth[i].probabilities];
    for (const name of Object.keys(arrays)) arrays[name].push(probabilities[name]);
    const { receiver_ids, route_mask, ...meta } = common;
    return { ...meta, probabilities };
  });
  return {
    predictions,
    metrics: {
      counts: countOutcomes(data.common, data.outcomes),
      models: Object.fromEntries(Object.entries(arrays).map(([name, p]) => [
        name, scoreModel(data.common, data.outcomes, p, settings),
      ])),
    },
  };
}

function percentile(sorted, fraction) {
  const position = (sorted.length - 1) * fraction, left = Math.floor(position), right = Math.ceil(position);
  return sorted[left] + (sorted[right] - sorted[left]) * (position - left);
}

export function summarizeWorlds(worlds, config, mode) {
  const summary = {};
  for (const condition of ['main', 'null']) {
    const rows = worlds.filter(w => w.condition === condition);
    const deltas = rows.map(w => w.models.B0.log_loss - w.models.BRC.log_loss);
    if (!deltas.length || !deltas.every(Number.isFinite)) throw new Error('Missing/invalid world comparisons');
    const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    let interval = null;
    if (mode === 'evaluate') {
      const bootstrap = Array.from({ length: config.evaluation.bootstrap_resamples }, (_, b) => {
        let sum = 0;
        for (let j = 0; j < deltas.length; j++) {
          const k = Math.floor(deltas.length * uniform(config.evaluation.bootstrap_seed,
            'evaluation:' + condition, b, 'bootstrap_world', j));
          sum += deltas[k];
        }
        return sum / deltas.length;
      }).sort((a, b) => a - b);
      interval = [percentile(bootstrap, 0.025), percentile(bootstrap, 0.975)];
    }
    const positive = deltas.filter(x => x > 0).length;
    summary[condition] = {
      worlds: rows.length, mean_gain_nats: mean, positive_worlds: positive,
      paired_world_bootstrap_95: interval,
      support_rule_met: mode === 'evaluate' ? mean >= config.evaluation.minimum_gain
        && interval[0] > 0 && positive >= config.evaluation.minimum_positive_worlds : null,
      ablations: {
        mean_BRC_gain_over_BR: rows.reduce((s, w) => s + w.models.BR.log_loss - w.models.BRC.log_loss, 0) / rows.length,
        mean_BRC_gain_over_BC: rows.reduce((s, w) => s + w.models.BC.log_loss - w.models.BRC.log_loss, 0) / rows.length,
      },
      world_gains: rows.map((row, i) => ({ world_id: row.world_id, gain_nats: deltas[i] })),
    };
  }
  const invalid = [];
  if (worlds.some(w => Object.values(w.optimizer).some(d => !d.converged))) invalid.push('optimizer_nonconvergence');
  if (mode === 'evaluate') {
    const expected = [...config.world_seeds].sort((a, b) => a - b);
    for (const condition of ['main', 'null']) {
      const rows = worlds.filter(w => w.condition === condition);
      const found = rows.map(w => Number(w.world_id.slice(7))).sort((a, b) => a - b);
      if (JSON.stringify(found) !== JSON.stringify(expected) || rows.some(w => w.split !== 'test'
        || w.counts.dropbacks !== config.splits.test)) invalid.push('world_or_holdout_coverage:' + condition);
    }
    if (summary.null.support_rule_met) invalid.push('unexpected_null_gain');
  }
  return {
    conditions: summary, invalid_reasons: invalid,
    claim_status: mode === 'dev' ? 'development validation only'
      : invalid.length ? 'invalid evaluation'
        : summary.main.support_rule_met ? 'synthetic recovery demonstrated' : 'not demonstrated',
    nfl_validity: 'not established',
  };
}
