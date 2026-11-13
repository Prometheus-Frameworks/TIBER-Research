import {
  readFileSync, writeFileSync, mkdirSync, existsSync, lstatSync, realpathSync,
} from 'node:fs';
import { resolve, dirname, isAbsolute, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { PROTOCOL, GENERATOR, DRAW_REGISTRY } from './random.mjs';
import { validateConfig, generateSplit, validateSplit } from './generate.mjs';
import { MODELS, fitTrainingSplit, featureNames, viewKeys } from './fit.mjs';
import { evaluateSplit, summarizeWorlds } from './evaluate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const RELATIVE = 'experiments/universe-d/001-target-allocation/';
export const BENCHMARK_CONFIG_SHA256 = '027dcb83d75074110a8af2ecff42325605bd9f0625374cffcb7a4e4be684b9de';
const SOURCE_FILES = ['README.md', 'config.json', 'random.mjs', 'generate.mjs',
  'fit.mjs', 'evaluate.mjs', 'run.mjs', 'test.mjs'];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function ordered(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return Object.is(value, -0) ? 0 : value;
  if (Array.isArray(value)) return value.map(ordered);
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])]));
  }
  throw new Error('Non-JSON/nonfinite artifact value');
}
export function jsonBytes(value) { return JSON.stringify(ordered(value), null, 2) + '\n'; }

export function checkOutputPath(output) {
  if (typeof output !== 'string' || !isAbsolute(output)) throw new Error('Output must be an explicit absolute path');
  const destination = resolve(output);
  let existing;
  try { existing = lstatSync(destination); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (existing) throw new Error('Output destination already exists; no overwrite');
  const parent = dirname(destination);
  if (!existsSync(parent)) throw new Error('Output parent must already exist');
  let ancestor = parent;
  while (true) {
    if (lstatSync(ancestor).isSymbolicLink()) throw new Error('Output ancestor cannot be a symlink');
    const next = dirname(ancestor);
    if (next === ancestor) break;
    ancestor = next;
  }
  if (!lstatSync(parent).isDirectory()) throw new Error('Output parent must be a directory');
  const canonical = resolve(realpathSync(parent), relative(parent, destination));
  const inside = relative(realpathSync(ROOT), canonical);
  if (inside === '' || (!inside.startsWith('..' + sep) && inside !== '..' && !isAbsolute(inside))) {
    throw new Error('Output must be outside the repository');
  }
  return canonical;
}

function sourceSnapshot() {
  const paths = [...SOURCE_FILES.map(name => RELATIVE + name),
    'docs/universe-d/experiment-001.md', 'docs/universe-d/IMPLEMENTATION.md', '.github/workflows/ci.yml'];
  const files = Object.fromEntries(paths.map(path => {
    const bytes = readFileSync(resolve(ROOT, path));
    return [path, { sha256: sha256(bytes), bytes: bytes.length }];
  }));
  let commit = null, dirty = null;
  try {
    commit = execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    dirty = execFileSync('git', ['-C', ROOT, 'status', '--porcelain', '--untracked-files=all', '--', RELATIVE,
      'docs/universe-d', '.github/workflows/ci.yml'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).length > 0;
  } catch { /* Exact file hashes remain available in an exported source tree. */ }
  return { repository_commit: commit, relevant_worktree_dirty: dirty, files };
}
function meta(condition, seed) {
  return {
    evidence_origin: 'synthetic', world_id: 'ud001:w' + seed, condition,
    protocol_version: PROTOCOL, generator_version: GENERATOR, prediction_phase: 'assignments_known',
  };
}

export function runExperiment({ configPath, output, mode = 'dev' }) {
  if (!['dev', 'evaluate'].includes(mode)) throw new Error('Mode must be dev or evaluate');
  const configBytes = readFileSync(configPath), config = validateConfig(JSON.parse(configBytes));
  if (process.versions.node !== config.runtime.node) throw new Error('Use the pinned Node ' + config.runtime.node + ' runtime');
  const configHash = sha256(configBytes);
  if (mode === 'evaluate' && configHash !== BENCHMARK_CONFIG_SHA256) {
    throw new Error('Final evaluation requires the exact pinned config; changed settings need a successor protocol');
  }
  const destination = checkOutputPath(output);
  const source = sourceSnapshot();
  const scope = mode === 'dev' ? config.development : { world_seeds: config.world_seeds, splits: config.splits };
  const completed = [], artifacts = {}, worlds = [], allIds = new Set();
  const base = {
    evidence_origin: 'synthetic', protocol_version: PROTOCOL, generator_version: GENERATOR,
    prediction_phase: 'assignments_known', mode, world_ids: scope.world_seeds.map(seed => 'ud001:w' + seed),
    population: scope, source, config_sha256: configHash,
    benchmark_config_sha256: BENCHMARK_CONFIG_SHA256,
    runtime: { node: process.versions.node, v8: process.versions.v8, platform: process.platform, arch: process.arch },
    draw_registry: DRAW_REGISTRY,
    feature_encodings: Object.fromEntries(MODELS.map(model => [model, {
      feature_names: featureNames(model), feature_allowlist: viewKeys(model),
      encoding: 'full one-hot indicators; NO_TARGET reference logit 0; all weights L2-penalized',
    }])),
    serialization: 'UTF-8 LF; sorted object keys; array order retained; finite JSON numbers; one final LF',
    replay_command: ['node', RELATIVE + 'run.mjs', '--config', '<exact-config-bytes>',
      '--mode', mode, '--out', '<fresh-absolute-output>'],
    design_head: '0e23bcc84378e20033f337384e930e80f420e23f',
    review_status: 'not asserted by this runner', nfl_validity: 'not established',
  };
  mkdirSync(destination, { mode: 0o700 });
  const write = (path, value, jsonl = false) => {
    const bytes = jsonl ? value.map(row => JSON.stringify(ordered(row))).join('\n') + '\n'
      : typeof value === 'string' ? value : jsonBytes(value);
    const fullPath = resolve(destination, path);
    mkdirSync(dirname(fullPath), { recursive: true, mode: 0o700 });
    writeFileSync(fullPath, bytes, { flag: 'wx', mode: 0o600 });
    artifacts[path] = { sha256: sha256(bytes), bytes: Buffer.byteLength(bytes) };
  };
  try {
    for (const condition of ['main', 'null']) for (const seed of scope.world_seeds) {
      const data = {};
      for (const [split, count] of Object.entries(scope.splits)) {
        data[split] = validateSplit(generateSplit(seed, condition, split, count, config), allIds);
        const folder = condition + '/w' + seed + '/' + split + '/';
        for (const field of ['common', 'rich', 'outcomes', 'truth']) write(folder + field + '.jsonl', data[split][field], true);
        completed.push('generated:' + condition + ':w' + seed + ':' + split);
      }
      const prefix = condition + '/w' + seed + '/';
      write(prefix + 'truth-profile.json', { ...meta(condition, seed), profile: data.train.profile });
      const { common, rich, outcomes } = data.train;
      const fitted = fitTrainingSplit({ common, rich, outcomes }, config.fit);
      write(prefix + 'models.json', { ...meta(condition, seed), training_split: 'train', models: fitted });
      completed.push('fitted:' + condition + ':w' + seed);
      for (const [split, rows] of Object.entries(data)) {
        const { metrics, predictions } = evaluateSplit(rows, fitted, config.evaluation);
        write(prefix + split + '/evaluator-predictions.jsonl', predictions, true);
        const result = { ...meta(condition, seed), split, ...metrics,
          optimizer: Object.fromEntries(MODELS.map(model => [model, fitted[model].diagnostics])) };
        write(prefix + split + '/metrics.json', result);
        if (split === (mode === 'dev' ? 'dev' : 'test')) worlds.push(result);
        completed.push('scored:' + condition + ':w' + seed + ':' + split);
      }
    }
    if (JSON.stringify(source.files) !== JSON.stringify(sourceSnapshot().files)) throw new Error('Source changed during execution');
    const summary = summarizeWorlds(worlds, config, mode);
    write('metrics.json', {
      evidence_origin: 'synthetic', protocol_version: PROTOCOL, generator_version: GENERATOR,
      prediction_phase: 'assignments_known', world_ids: base.world_ids,
      mode, config_sha256: configHash, summary, worlds,
    });
    const lines = [
      '# Universe D experiment 001',
      '', 'Status: ' + summary.claim_status + '.', '',
      'Origin: synthetic. NFL validity is not established.',
      'Mode: ' + mode + '. Prediction phase: assignments known, before target selection.',
      'Config SHA-256: ' + configHash + '.',
      'Source file hashes, runtime, draw keys and completed phases are in manifest.json.',
      'All model and null-condition diagnostics, counts and denominators are retained in metrics.json.',
      '',
      mode === 'dev' ? 'Only development worlds and train/dev splits were generated. No final-test seed or support rule was evaluated.'
        : 'The support rule concerns recovery of authored simulator structure only. Twelve worlds limit uncertainty resolution.',
      '',
      'Mechanical checks and a completed run do not constitute independent review, operator approval or model promotion.',
      '',
    ];
    write('RESULTS.md', lines.join('\n'));
    writeFileSync(resolve(destination, 'manifest.json'), jsonBytes({
      ...base, completed_phases: completed, failures: summary.invalid_reasons,
      claim_status: summary.claim_status, artifacts,
    }), { flag: 'wx', mode: 0o600 });
    return { destination, summary, manifest_sha256: sha256(readFileSync(resolve(destination, 'manifest.json'))) };
  } catch (error) {
    const manifest = resolve(destination, 'manifest.json');
    if (!existsSync(manifest)) writeFileSync(manifest, jsonBytes({
      ...base, completed_phases: completed, failures: [error.message],
      claim_status: 'invalid evaluation', artifacts,
    }), { flag: 'wx', mode: 0o600 });
    throw error;
  }
}

function cli(args) {
  const values = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!['--config', '--out', '--mode'].includes(key) || values[key] !== undefined
      || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Expected --config PATH --out ABSOLUTE_PATH [--mode dev|evaluate]');
    values[key] = args[i + 1];
  }
  if (!values['--config'] || !values['--out']) throw new Error('Both --config and --out are required');
  const result = runExperiment({ configPath: resolve(values['--config']), output: values['--out'], mode: values['--mode'] ?? 'dev' });
  process.stdout.write(jsonBytes({ claim_status: result.summary.claim_status,
    manifest_sha256: result.manifest_sha256, invalid_reasons: result.summary.invalid_reasons }));
  if (result.summary.invalid_reasons.length) process.exitCode = 2;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { cli(process.argv.slice(2)); }
  catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
