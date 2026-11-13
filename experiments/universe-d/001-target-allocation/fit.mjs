import { PROTOCOL, GENERATOR, ROUTES, COVERAGES } from './random.mjs';
import { requireKeys, validateCommon, validateRich, validateOutcome, validateMask, softmax } from './generate.mjs';

export const MODELS = Object.freeze(['B0', 'BR', 'BC', 'BRC']);
const BASE_KEYS = ['evidence_origin', 'protocol_version', 'generator_version', 'prediction_phase', 'mask'];
export function viewKeys(model) {
  if (!MODELS.includes(model)) throw new Error('Unknown model');
  return [...BASE_KEYS, ...(['BR', 'BRC'].includes(model) ? ['routes'] : []),
    ...(['BC', 'BRC'].includes(model) ? ['coverage'] : []),
    ...(model === 'BRC' ? ['defender_for', 'crowding'] : [])];
}

export function projectEvidence(model, common, rich) {
  validateCommon(common);
  if (model !== 'B0') validateRich(rich, common);
  else if (rich !== undefined) throw new Error('B0 accepts common evidence only');
  const view = {
    evidence_origin: common.evidence_origin, protocol_version: common.protocol_version,
    generator_version: common.generator_version, prediction_phase: common.prediction_phase,
    mask: [...common.route_mask],
  };
  if (['BR', 'BRC'].includes(model)) view.routes = [...rich.routes];
  if (['BC', 'BRC'].includes(model)) view.coverage = rich.coverage;
  if (model === 'BRC') {
    view.defender_for = [...rich.defender_for];
    view.crowding = rich.defender_for.map(j => j === null || rich.coverage === 'man_3'
      ? 0 : Math.max(rich.zone_occupancy[j] - 1, 0));
  }
  validateView(model, view);
  return view;
}

export function validateView(model, view) {
  requireKeys(view, viewKeys(model), 'learner view');
  if (view.evidence_origin !== 'synthetic' || view.protocol_version !== PROTOCOL
    || view.generator_version !== GENERATOR || view.prediction_phase !== 'assignments_known') {
    throw new Error('Invalid learner origin/version/phase');
  }
  validateMask(view.mask);
  if (['BR', 'BRC'].includes(model)
    && (!Array.isArray(view.routes) || view.routes.length !== 3 || !view.routes.every((r, i) =>
      view.mask[i] ? ROUTES.includes(r) : r === null))) throw new Error('Invalid learner routes');
  if (['BC', 'BRC'].includes(model) && !COVERAGES.includes(view.coverage)) throw new Error('Invalid learner coverage');
  if (model === 'BRC') {
    if (!Array.isArray(view.defender_for) || view.defender_for.length !== 3
      || !view.defender_for.every((d, i) => view.mask[i] ? Number.isInteger(d) && d >= 0 && d < 3 : d === null)
      || !Array.isArray(view.crowding) || view.crowding.length !== 3
      || !view.crowding.every(n => Number.isInteger(n) && n >= 0 && n <= 2)) throw new Error('Invalid learner assignments');
    if (view.coverage === 'man_3') {
      const defenders = view.defender_for.filter(d => d !== null);
      if (new Set(defenders).size !== defenders.length || view.crowding.some(n => n !== 0)) throw new Error('Invalid learner man assignment');
    } else {
      for (let i = 0; i < 3; i++) {
        const expectedDefender = view.mask[i] ? ROUTES.indexOf(view.routes[i]) : null;
        const count = view.routes.filter(r => r !== null && ROUTES.indexOf(r) === expectedDefender).length;
        if (view.defender_for[i] !== expectedDefender || view.crowding[i] !== (view.mask[i] ? count - 1 : 0)) {
          throw new Error('Invalid learner zone assignment');
        }
      }
    }
  }
}

function maskCode(mask) { return mask.reduce((code, active, i) => code | (Number(active) << i), 0); }
export function featureNames(model) {
  viewKeys(model);
  const names = [];
  for (const mask of [7, 6, 5, 3]) for (let i = 0; i < 3; i++) {
    if ((mask & (1 << i)) !== 0) names.push('mask:' + mask + ':receiver:' + i);
  }
  if (['BR', 'BRC'].includes(model)) for (let i = 0; i < 3; i++) {
    for (const route of ROUTES) names.push('receiver:' + i + ':route:' + route);
  }
  if (['BC', 'BRC'].includes(model)) for (let i = 0; i < 3; i++) {
    for (const coverage of COVERAGES) names.push('receiver:' + i + ':coverage:' + coverage);
  }
  if (model === 'BRC') {
    for (const route of ROUTES) for (const coverage of COVERAGES) names.push('route:' + route + ':coverage:' + coverage);
    for (let j = 0; j < 3; j++) names.push('defender:' + j);
    names.push('zone_crowding');
  }
  return names;
}

function compileView(model, view, index) {
  validateView(model, view);
  const features = [[], [], [], []], code = maskCode(view.mask);
  for (let i = 0; i < 3; i++) {
    if (!view.mask[i]) continue;
    const add = (name, value = 1) => features[i + 1].push([index.get(name), value]);
    add('mask:' + code + ':receiver:' + i);
    if (view.routes) add('receiver:' + i + ':route:' + view.routes[i]);
    if (view.coverage) add('receiver:' + i + ':coverage:' + view.coverage);
    if (model === 'BRC') {
      add('route:' + view.routes[i] + ':coverage:' + view.coverage);
      add('defender:' + view.defender_for[i]);
      if (view.crowding[i] !== 0) add('zone_crowding', view.crowding[i]);
    }
  }
  return { mask: [...view.mask], features };
}

export function compileTraining(model, views, labels) {
  if (!Array.isArray(views) || views.length === 0 || !Array.isArray(labels)
    || labels.length !== views.length) throw new Error('Invalid training arrays');
  const names = featureNames(model), index = new Map(names.map((name, i) => [name, i]));
  const cases = views.map((view, i) => {
    const compiled = compileView(model, view, index);
    const target = labels[i];
    if (!Number.isInteger(target) || target < 0 || target > 3
      || (target > 0 && !view.mask[target - 1])) throw new Error('Invalid training target');
    return { ...compiled, target };
  });
  return { names, cases };
}

function logitsFor(weights, row) {
  return row.features.map(features => features.reduce((value, [index, x]) => value + weights[index] * x, 0));
}

export function objectiveGradient(weights, cases, l2) {
  const gradient = new Float64Array(weights.length);
  let loss = 0;
  for (const row of cases) {
    const logits = logitsFor(weights, row), active = [true, ...row.mask];
    const max = Math.max(...logits.filter((_, i) => active[i]));
    const exp = logits.map((x, i) => active[i] ? Math.exp(x - max) : 0);
    const total = exp.reduce((a, b) => a + b, 0);
    loss += max + Math.log(total) - logits[row.target];
    for (let i = 1; i < 4; i++) {
      const residual = exp[i] / total - Number(row.target === i);
      for (const [index, value] of row.features[i]) gradient[index] += residual * value / cases.length;
    }
  }
  loss /= cases.length;
  for (let k = 0; k < weights.length; k++) {
    loss += l2 * weights[k] ** 2 / 2;
    gradient[k] += l2 * weights[k];
  }
  return { loss, gradient };
}

export function fitModel(model, views, labels, options) {
  requireKeys(options, ['l2', 'step', 'max_iterations', 'gradient_tolerance'], 'optimizer');
  if (!(options.l2 > 0 && Number.isFinite(options.l2) && options.step > 0 && Number.isFinite(options.step)
    && Number.isSafeInteger(options.max_iterations) && options.max_iterations > 0
    && options.gradient_tolerance > 0 && Number.isFinite(options.gradient_tolerance))) throw new Error('Invalid optimizer');
  const { names, cases } = compileTraining(model, views, labels);
  const weights = new Float64Array(names.length);
  for (let iterations = 0; iterations <= options.max_iterations; iterations++) {
    const { loss, gradient } = objectiveGradient(weights, cases, options.l2);
    const maximum = Math.max(...gradient.map(Math.abs));
    if (!Number.isFinite(loss) || !Number.isFinite(maximum)) throw new Error('Nonfinite optimizer state');
    const converged = maximum <= options.gradient_tolerance;
    if (converged || iterations === options.max_iterations) {
      return {
        model, feature_names: names, feature_allowlist: viewKeys(model), weights: Array.from(weights),
        diagnostics: { iterations, objective: loss, max_abs_gradient: maximum, converged },
      };
    }
    for (let k = 0; k < weights.length; k++) weights[k] -= options.step * gradient[k];
  }
}

export function predict(fitted, view) {
  const names = featureNames(fitted.model);
  if (JSON.stringify(names) !== JSON.stringify(fitted.feature_names)
    || !Array.isArray(fitted.weights) || fitted.weights.length !== names.length
    || !fitted.weights.every(Number.isFinite)) throw new Error('Invalid fitted model encoding');
  const index = new Map(names.map((name, i) => [name, i]));
  const row = compileView(fitted.model, view, index);
  return softmax(logitsFor(fitted.weights, row), row.mask);
}

// This boundary accepts training labels only. Dev/test records and private truth
// are intentionally absent from the signature.
export function fitTrainingSplit(data, options) {
  requireKeys(data, ['common', 'rich', 'outcomes'], 'training input');
  if (!Array.isArray(data.common) || data.common.length === 0
    || !Array.isArray(data.rich) || data.rich.length !== data.common.length
    || !Array.isArray(data.outcomes) || data.outcomes.length !== data.common.length) throw new Error('Incomplete training input');
  const ids = new Set();
  data.common.forEach((common, i) => {
    validateCommon(common); validateRich(data.rich[i], common); validateOutcome(data.outcomes[i], common);
    if (common.split !== 'train' || ids.has(common.play_id)
      || ['world_id', 'condition'].some(k => common[k] !== data.common[0][k])) throw new Error('Training scope violation');
    ids.add(common.play_id);
  });
  const labels = data.outcomes.map(row => row.target);
  return Object.fromEntries(MODELS.map(model => [
    model, fitModel(model, data.common.map((common, i) =>
      projectEvidence(model, common, model === 'B0' ? undefined : data.rich[i])), labels, options),
  ]));
}
