# Universe D 001: target-allocation runner

Implements the candidate [Experiment 001](../../../docs/universe-d/experiment-001.md)
in an isolated, dependency-free Node program. It generates fictional receivers,
routes and coverage, fits four masked conditional-softmax models, and retains
feature records, outcomes, evaluator truth, predictions, weights and metrics.

This implementation is stacked on design PR #51. Both design and implementation
require substantive review. No NFL data, API, production contract, Research CLI,
consumer or hosted service is used.

## Run the implementation checks

Use exactly Node 20.19.0, the runtime pinned by config.json and this experiment's
CI job. From the repository root:

~~~bash
node --test experiments/universe-d/001-target-allocation/test.mjs
node experiments/universe-d/001-target-allocation/run.mjs --config experiments/universe-d/001-target-allocation/config.json --out /tmp/ud001-dev-001
~~~

The default dev mode generates only worlds 1001/1002 with 128 training and 64
development plays per condition. These seeds are disjoint from the planned
benchmark. It emits no final-test split, bootstrap interval or support decision.
Development scores diagnose the implementation; they are not the final study.
An exit code of 2 reports optimizer/evaluation diagnostics requiring attention.

The output must be a new absolute directory outside the repository, with an
existing parent and no symlink ancestors. Existing directories, including empty
ones, are rejected before creating output. Prior runs are never overwritten.
Same source/config/runtime/mode replays are byte-identical, including the
manifest; timestamps and destination paths are deliberately excluded.

## Interface and observation boundaries

- B0 receives receiver-slot and eligibility-mask features.
- BR adds receiver-slot/route indicators.
- BC adds receiver-slot/coverage-regime indicators, without route responsibilities.
- BRC adds route/coverage interactions, assigned defender and zone crowding.
- Learner views reject extra fields, changed synthetic origin, seed/truth/label
  fields and inconsistent assignments. Metadata identities do not become predictors.
- Fitting accepts a closed training-only object. Dev/test records and private
  truth are not fitting inputs. The evaluator separately uses exact generating
  probabilities as an oracle reference.

The fixed feature order is exported by featureNames and retained in every model
and manifest. Full categorical indicators are used with L2 on every weight;
NO_TARGET has reference logit zero. These conventions resolve the implementation
details left open by the design without changing its information sets.

Development diagnostics also exposed a numerical budget issue in the candidate
design. The proposed maximum iteration count is now 10,000 rather than 2,000;
the step, gradient tolerance and penalized objective are unchanged. This
pre-freeze amendment is explicit in the protocol and [validation receipt](VALIDATION.md).

random.mjs records the literal draw-key registry. Its keyed SHA-256 uniforms
follow the design's 52-bit procedure; Normal shocks use the cosine Box-Muller
branch. Main/null conditions share draws while retaining distinct record IDs.
The null coefficient removes every route/coverage/defender effect.

## Retained output

Each condition/world contains a truth-profile.json and models.json. Each generated
split contains common, rich, outcomes and truth JSONL files, evaluator predictions
and metrics. Root metrics.json retains all scored worlds and the aggregate
diagnostics; RESULTS.md states their scope; manifest.json binds exact source,
configuration, runtime, feature encodings, draw keys, completed phases and each
artifact's SHA-256 and byte count.

Artifact JSON sorts object keys, preserves arrays, uses finite binary64 numbers
and UTF-8/LF, and ends with one LF. JSONL uses the same key order with compact
rows. The manifest excludes its own hash; the CLI returns that hash separately.
These are experiment records, not governed Research attempts, seals or approvals.
The source Git commit and dirty state are disclosed alongside exact file hashes;
an uncommitted working tree is never represented as the committed tree.

## Final evaluation remains separate

After review and freezing the exact implementation, use the same command with
an additional --mode evaluate argument. That mode requires the exact shipped
config bytes, SHA-256
027dcb83d75074110a8af2ecff42325605bd9f0625374cffcb7a4e4be684b9de.
It generates the specified 12 worlds and 4000/1000/2000 train/dev/test plays per
condition, then applies the preregistered main/null support rule and paired
world bootstrap. Changed settings need a successor protocol rather than an
unlabeled modification of the benchmark.

The implementation checks use small, separate development populations and
hand-authored scoring examples. They do not execute that final population.
No positive recovery result is claimed by implementing or testing this runner.

The assignment-known prediction phase is more informative than an NFL pregame
setting. Even a successful final experiment would establish recovery of the
authored simulator's structure only. It would not validate NFL route effects,
coverage realism, latent ability estimates or transfer to production consumers.
