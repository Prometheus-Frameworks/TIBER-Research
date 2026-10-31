import { createHash } from 'node:crypto';

export const PROTOCOL = 'ud-targets-v0';
export const GENERATOR = 'ud001-generator-v0';
export const ROUTES = Object.freeze(['flat', 'slant', 'go']);
export const COVERAGES = Object.freeze(['man_3', 'zone_depth_3']);
export const CLASSES = Object.freeze(['NO_TARGET', 'R1', 'R2', 'R3']);
export const REASONS = Object.freeze(['sack', 'scramble', 'throwaway']);

// Literal keys/order are part of the generator version. No mutable PRNG state.
export const DRAW_REGISTRY = Object.freeze({
  tuple: ['protocol', 'world_seed', 'split', 'play_index', 'field', 'draw_index'],
  profile: ['ability:0..2', 'preference:0..2', 'skill:0..2:0..2', 'defender:0..2'],
  play: ['block', 'route:0..2', 'coverage', 'man_permutation', 'pressure',
    'shock:0..2', 'target', 'no_target_reason'],
  evaluation: ['bootstrap_world'],
  profile_location: { split: 'profile', play_index: -1 },
  man_draw_indices: [2, 1],
  normal_draw_indices: [0, 1],
  other_draw_index: 0,
  bootstrap_location: 'split=evaluation:<condition>, play_index=resample, draw_index=world_position',
  uniform: 'first 52 SHA-256 bits big endian; (x+0.5)/2^52',
  normal: 'sqrt(-2*ln(U0))*cos(2*pi*U1)',
});

export function uniform(seed, split, play, field, draw = 0) {
  const key = JSON.stringify([PROTOCOL, seed, split, play, field, draw]);
  const hex = createHash('sha256').update(key, 'utf8').digest('hex');
  return (Number.parseInt(hex.slice(0, 13), 16) + 0.5) / 2 ** 52;
}

export function categorical(probabilities, u) {
  if (!(u > 0 && u < 1) || probabilities.some(p => !Number.isFinite(p) || p < 0)
    || Math.abs(probabilities.reduce((a, b) => a + b, 0) - 1) > 1e-12) {
    throw new Error('Invalid categorical distribution or uniform');
  }
  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (u < cumulative) return i;
  }
  // Only a floating-point cumulative-sum discrepancy can reach this branch.
  return probabilities.findLastIndex(p => p > 0);
}

export function normal(seed, split, play, field) {
  return Math.sqrt(-2 * Math.log(uniform(seed, split, play, field, 0)))
    * Math.cos(2 * Math.PI * uniform(seed, split, play, field, 1));
}

export function permutation(seed, split, play) {
  const values = [0, 1, 2];
  for (let i = 2; i > 0; i--) {
    const j = Math.floor((i + 1) * uniform(seed, split, play, 'man_permutation', i));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
