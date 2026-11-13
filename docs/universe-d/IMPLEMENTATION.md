# Smallest implementation and review handoff

**Proposed next slice only.** This documentation PR does not contain a simulator
or run an evaluation. The controlling candidate is
[Experiment 001](experiment-001.md); the [track charter](README.md) defines validity
and repository boundaries.

## One local, dependency-free runner

Add an isolated directory in a follow-up implementation PR:

```text
experiments/universe-d/001-target-allocation/
  README.md                 exact replay command and claim limits
  config.json               all reviewed parameters, seeds and versions
  random.mjs                keyed draws and a fixed draw-key registry
  generate.mjs              fictional profiles, assignments, truth and labels
  fit.mjs                   feature projections and conditional softmax fitting
  run.mjs                   orchestration, scoring and manifest creation
  test.mjs                  independent invariants and contamination checks
```

Use the repository's Node 20 environment and Node standard-library modules.
Record the exact Node patch version and platform in the run manifest. No hosted
model, API key, provider, database, npm dependency or Research runtime change is
needed. Keep new commands local to this experiment rather than extending the
custody CLI or configuring an autonomous executor.

The proposed command interface is:

```bash
node --test experiments/universe-d/001-target-allocation/test.mjs
node experiments/universe-d/001-target-allocation/run.mjs --config experiments/universe-d/001-target-allocation/config.json --out /absolute/new/output-directory
```

These commands describe files to build; they are not runnable from this design
packet. The output path must be explicit and empty/nonexistent. Reject unsafe or
existing destinations before creating directories; never overwrite a prior run.
No network operation is part of generation, training or scoring.

## Records the runner must preserve

1. `manifest.json`: synthetic origin, protocol/config/source hashes, exact runtime,
   draw registry and feature encoding, world/split sizes, run command, completed
   phases, failures and claim status. Hash exact UTF-8/LF output bytes; sort keys
   and define final-newline behavior before the run. A manifest is not a sealed
   TIBER Research run or authenticated operator receipt.
2. Common and rich feature JSONL, outcome JSONL and evaluator-only truth JSONL,
   separated by condition/world/split. Preserve every play, not selected examples.
3. Fitted weights and feature allowlists for B0/BR/BC/BRC, plus optimizer diagnostics
   and predictions for U, learned models and the oracle.
4. `metrics.json` with per-world paired scores, counts, denominators, bootstrap
   procedure/results and null condition. `RESULTS.md` explains the supported
   conclusion and limitations without replacing the machine-readable record.

Use exact artifact hashes to bind the eventual result to this protocol and
implementation. Generated run records belong in a separately reviewed result
change or retained artifact, not silently inserted into the design. Do not use
the repository's production contracts or synthetic custody fixture as if this
experiment had passed their lifecycle.

## Small tests that earn their place

| Independent check | Failure it catches |
| --- | --- |
| Hand-calculated active-alternative example; zero target mass for a blocker | Masking and denominator mistakes |
| Explicit cases with three routes in one zone and permuted man assignments | Incorrect responsibility and crowding logic |
| Finite-difference check of the learned objective gradient | Optimizer implementation errors |
| Same config/runtime replay has identical bytes and weights | Hidden state or unrecorded randomness |
| Test stream unchanged after a training-size change | Random-stream/split coupling |
| Inject unknown truth/seed/outcome fields into learner inputs; reject them | Feature contamination |
| Change held-out outcomes/truth; fitted weights stay identical | Test feedback into training |
| Remove or change synthetic origin/version metadata; reject the record | Accidental evidence-status promotion |
| Null `h=0` removes every information pathway | A misleading negative control that leaves signal behind |

These checks verify the implementation, not the NFL. The model/evaluation tests
must compare independently calculated quantities or behavior; reprinting a
generator field is not independent validation. A same-input replay verifies
determinism, not correctness by itself.

## Sequence and completion boundary

1. Review the exact design PR head, especially the observation phase, authored
   mechanisms, feature parity, null condition and honest failure outcomes.
2. Build the isolated runner and tests in a separate implementation PR. Freeze
   config, RNG details, encodings and numerical/runtime choices before evaluation.
3. Complete mechanical checks and dev diagnostics. If a change is needed after
   examining final-test results, retain that result and create a successor with
   new, declared holdout streams; do not reuse it as untouched confirmation.
4. Run the fixed main and null populations and retain all metrics. Independently
   review the exact implementation and result bindings before accepting a
   synthetic recovery claim. Keep merge authority separate from review and CI.

The minimum useful result is a reproducible generator, weaker and richer learned
models, an evaluator-only oracle, main/null measurements and a bounded conclusion.
A failure to recover the signal is useful if its diagnostics are retained.

Only after that result should a successor add observation noise/missingness,
changed coverage policy, unfamiliar actors, sequential adaptation, spatial
routes, catch outcomes or protection detail. Any NFL comparison requires its own
source qualification, timing and external-validity design. No first-experiment
result authorizes production consumers or fills gaps in real football evidence.
