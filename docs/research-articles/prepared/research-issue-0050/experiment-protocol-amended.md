---
format: "tiber-research-update/v0"
record_id: "research-issue-0050-experiment-protocol-amended"
record_kind: "experiment design"
subject: "Experiment 001: route and coverage information in generated target allocation"
study_window: "Synthetic design and separate development validation; no final benchmark result"
evidence_cutoff: null
timezone: "unknown"
latest_observation_covered: "Source edition only; exact game/event coverage retained below"
authored_at: "2026-10-31T19:30:11.552299Z"
record_origin: "historical format copy"
original_record: "https://github.com/Prometheus-Frameworks/TIBER-Research/blob/bb24b06980e9a575235fca5e707778e820770fd2/docs/universe-d/experiment-001.md"
game_manifest: null
research_state: "Historical source state retained; no new assessment"
review_state: "Format self-check only; independent format review pending; historical receipts retained separately"
owner: "unknown"
admission_granted_by_record: false
external_acceptance_refs: []
source_record_authored_at: "unknown (source describes October 23)"
---

# Experiment 001: route and coverage information in generated target allocation — historical format preparation

- Update type: format preparation of the distinct dated source update.
- Original article: [experiment-protocol-original.md](experiment-protocol-original.md).
- Affected IDs, original/new cutoffs and source author: as preserved below; absent values remain unknown.
- Preparation author: Dot; actual preparation time 2026-10-31T19:30:11.552299Z (UTC).
- Admission granted by this update: none.

## 1. Summary

This is a historical-format copy of the source edition, not fresh research. No football evidence was refreshed and no independent research review was performed. Original observations, reports, calculations, hypotheses, contrary evidence and limits remain source-authored below.

### Experiment 001: route and coverage information in generated target allocation

**Protocol: `ud-targets-v0`; design candidate, not executed or independently
reviewed.** Parameter values below are authored test settings, not estimates
from NFL data. Freeze the reviewed design, implementation and configuration
before generating evaluation labels.



## 2. Question and scope

### Preserved study context (navigation, not a new evidence cut)

Synthetic assignments-known-before-target experiment with shared eligibility mask: B0 versus BRC, BR/BC ablations, U sanity and evaluator-only oracle. Original and amended protocol remain separate; development is not benchmark. The original and this edition retain their own cutoffs; no later result is imported backward.

#### Bounded question and falsifiable claim

In a reduced passing subgame, does access to simulated route types and coverage
responsibilities improve predictions of generated targets relative to a model
that knows the same receivers and which ones run routes?

**Primary comparison:** `BRC` versus `B0` on held-out per-play log loss. The
generator intentionally includes route/coverage signal. A positive result
establishes recovery of useful information in this generator, not discovery of
its relevance to the NFL. A negative result remains reportable.

The forecast occurs **after synthetic assignments are known, before target
selection**. This is not a pregame NFL forecast. Exact simulated coverage labels
are a deliberately favorable observation condition, not a claim that TIBER can
observe them live.



#### Entities, rules and omissions

Each world has one quarterback preference profile, three receivers `D-R1..3`
and three defenders `D-C1..3`. These are stable fictional slots within that
world. No NFL names, GSIS/Sleeper identities, teams or seasons are used.

- This is a three-eligible-receiver subgame, not a legal full 11-on-11 engine.
  The line, rush and other players are abstracted away.
- Each play is an independent synthetic dropback. All three receivers are
  present; either all run routes or exactly one is assigned to block.
- A blocker cannot receive a credited target and is excluded from route counts.
  Every other receiver runs exactly one route and counts once even if untargeted.
- Coverage is either `man_3` or `zone_depth_3`. These are toy policies, not
  implementations of NFL Cover 1/2/3, match coverage or a named coordinator.
- There is exactly one outcome in `{NO_TARGET, R1, R2, R3}`. At most one receiver
  gets a credited target. `NO_TARGET` is always available.
- A no-target reason can be sack, scramble or throwaway. Those plays contribute
  one dropback and zero credited targets; dropbacks and targeted passes differ.
- No completions, yards, touchdowns, fantasy points, penalties, injuries,
  score/clock adaptation, spatial trajectories, blocking physics or actual QB
  read progression are modeled. The selection utility abstracts a QB decision.

This deliberately narrow scope tests target allocation and evidence access.
It cannot establish route-running quality or a coverage scheme's football realism.



## 3. Baseline and alternatives

#### Models and the fair comparison

Fit separate models within each world, using the same training plays, labels,
mask, optimizer and regularization. These models test new plays involving the
same fictional actors; they do not test unseen-player transfer.

All learned models use a **masked conditional softmax** over the three receivers
and NO_TARGET. NO_TARGET has a fixed reference logit of zero. Feature weights
are learned from training targets, not copied from the generator.

| Model | Allowed predictive features | Purpose |
| --- | --- | --- |
| U | Uniform probability over active receivers and NO_TARGET | Arithmetic sanity baseline; no fitting |
| B0 | Receiver-slot × eligibility-mask intercepts; common mask | Learns historical target preference within each participation pattern, without route types or coverage |
| BR | B0 plus receiver-slot × route categorical features | Route-only ablation |
| BC | B0 plus receiver-slot × coverage-regime categorical features | Regime-only ablation; no responsibilities that would reveal route depth |
| BRC | BR plus slot × regime, route × regime, responsible-defender ID and zone crowding count | Full route/coverage information comparison |
| Oracle | The generator's exact per-play probability vector | Evaluator-only reference conditional on hidden truth; not a competing learned model |

For BRC, defender-ID coefficients are shared over target alternatives; the
crowding feature is `I(zone)*max(n_j-1,0)`. Other features are 0/1 indicators.
Reference category encodings and feature order must be committed with the
implementation. BC intentionally receives only the regime: zone responsibilities
alone would disclose depth-band information and contaminate that ablation.

There are four mask patterns (all active, or each one blocked); B0 can learn a
separate active-receiver bias within each pattern. Every richer model retains
those same features. This avoids granting only the richer model a way to capture
the mask's protection relationship. The target data also cannot separately
identify `a_i` and `q_i`, which enter as a sum; no latent-ability or preference
recovery claim is part of this experiment.

Minimize mean training negative log likelihood plus
`0.001 * sum(weight^2) / 2`, penalizing all learned weights. Start at zero;
use deterministic full-batch gradient descent, step `0.10`, at most `10000`
iterations, stopping at maximum absolute gradient `<= 0.001`. Record the final
objective, gradient and iteration count. Nonconvergence blocks the support claim;
do not confuse a weak optimizer with evidence that information is useless.

**Pre-freeze implementation amendment, October 23:** the initial design cap was
2,000 iterations. Implementation diagnostics on separate development worlds
1001/1002 found that world 1001 reached that cap above the declared gradient
tolerance. The implementation candidate raises only the cap to 10,000; the
objective, step, tolerance, information sets and final-test population are
unchanged. The initial diagnostics are retained in the implementation handoff.
No benchmark test labels were generated or inspected to choose this amendment.

Dev data diagnose numerical/convergence and gross feature problems. No
hyperparameter search is part of v0. If the protocol needs revision, preserve
the failed attempt and make a successor before viewing new final-test results.



## 4. Evidence by question

### Retrospective question-to-evidence mapping

These are format-preparation navigation cards, not new observations, tests or assessments. Original IDs are retained; `retro-` labels are newly assigned organizational mappings only. Every row keeps observation/report/calculation/interpretation distinct as labelled in the source blocks; missing metrics, publication/retrieval clocks and observation coverage remain unknown rather than reconstructed.

| Question / ID | Evidence to locate in this edition and original | Type / scope / contrary evidence and limit |
| --- | --- | --- |
| `BRC versus B0` | Richer-information recovery test; [source edition](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/bb24b06980e9a575235fca5e707778e820770fd2/docs/universe-d/experiment-001.md), exact retained text and section map linked in §8 | Authored synthetic mechanism only; no benchmark/NFL-validity result. |
| `BR / BC` | Route-only and regime-only ablations; [source edition](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/bb24b06980e9a575235fca5e707778e820770fd2/docs/universe-d/experiment-001.md), exact retained text and section map linked in §8 | Shared mask and explicit feature restrictions; no causal attribution from ablations. |
| `h=0` | Null information control; [source edition](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/bb24b06980e9a575235fca5e707778e820770fd2/docs/universe-d/experiment-001.md), exact retained text and section map linked in §8 | All richer pathways must be removed; development tests not final benchmark. |
| `U / Oracle` | Sanity/reference bounds; [source edition](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/bb24b06980e9a575235fca5e707778e820770fd2/docs/universe-d/experiment-001.md), exact retained text and section map linked in §8 | Uniform unlearned; oracle private-truth evaluator-only, not attainable learner evidence. |

Source provider/lineage, metric numerator/denominator, exclusions, personnel, actual observation window, supporting passages, confidence and observability remain attached to the corresponding original blocks. These cards grant no independent-source status or final adjudication.

#### Generative specification

All categorical draws use the stated ordering. Draw receiver route proposals
for all three slots before applying the block mask, so the draw schedule is fixed.
All independent draws are independent conditional on the world profile; the
dependencies introduced below remain explicit.

| Variable | Distribution / rule | Persistence and learner access |
| --- | --- | --- |
| Receiver ability `a_i` | independent `Uniform(-0.75, 0.75)` | World-fixed; latent |
| QB preference `q_i` | independent `Uniform(-0.35, 0.35)` | World-fixed per receiver; latent |
| Receiver/route skill `v_ir` | independent `Uniform(-0.25, 0.25)` for each pair | World-fixed; latent |
| Defender suppression `d_j` | independent `Uniform(0, 1)` | World-fixed; latent; not a real grade |
| Blocking assignment | none with probability `0.75`; each of R1/R2/R3 with probability `1/12` | Per play; mask visible to every model |
| Route `r_i` | uniform over `[flat, slant, go]` | Per play; visible only to route-enabled models |
| Coverage `c` | uniform over `[man_3, zone_depth_3]` | Per play; visible only to coverage-enabled models |
| Man responsibility | uniform permutation of the three defenders over receiver slots | Per play; assignment visible to BRC; a blocked slot's defender stays idle |
| Zone responsibility | C1 covers depth `[0,6)`, C2 `[6,14)`, C3 `[14,infinity)` | Fixed policy; route depth determines responsible defender |
| Pressure `P` | `Bernoulli(0.30 - 0.10 * number_of_blockers)` | Per play; latent abstract protection outcome |
| Choice shock `eta_i` | independent `Normal(0, 0.30^2)` | Per play/receiver; latent |
| Information strength `h` | main condition `1`; null condition `0` | Fixed per condition; evaluator metadata |

Route depths are fixed proxies: flat `3`, slant `8`, go `20` synthetic yards.
They are not tracked endpoints. Route intercepts are
`beta = {flat: -0.10, slant: 0.10, go: 0.00}`.

The authored interaction table `gamma[r,c]` is:

| Route | `man_3` | `zone_depth_3` |
| --- | ---: | ---: |
| flat | 0.00 | 0.15 |
| slant | 0.35 | -0.20 |
| go | -0.25 | 0.30 |

For an active receiver, let `j(i)` be the responsible defender. In zone, let
`n_j` count active routes in that defender's depth band; in man, set the crowding
term to zero. Several receivers can share a zone defender. This capacity rule
is an explicit toy assumption.

```text
context_i = v_i,r + beta_r + gamma_r,c - 0.70*d_j(i)
            + 0.20 * I(zone) * max(n_j(i) - 1, 0)
            - 0.35 * P * depth_r / 10

u_i    = a_i + q_i + h*context_i + eta_i
u_none = -0.40 + 1.20*P

p = softmax([u_none, u_i for active receivers])
Y ~ Categorical(p)
```

Blocked receivers have probability exactly zero, not a finite negative logit.
The available alternatives' probabilities sum to one. Target draws are
independent across plays given their world and per-play variables.

If `Y=NO_TARGET`, draw a reason in order `[sack, scramble, throwaway]` with
probabilities `[0.45,0.30,0.25]` when pressured and `[0,0.25,0.75]` otherwise.
Reason is an outcome-only annotation, never a feature. These probabilities are
convenient inventions, not empirically calibrated rates.

`h=0` removes **all** route/coverage/defender pathways, including route skill,
depth and crowding. Merely zeroing `gamma` would not be a valid no-information
control because other context pathways would remain. The pressure/block-mask
relationship remains; it is equally unobserved by B0 and BRC given their shared
mask. Thus richer labels carry no added population signal in the null condition.



#### Evidence and truth separation

| Record | Contents | Permitted use |
| --- | --- | --- |
| Common evidence | world/play/split identity, three receiver IDs, route-eligibility mask, phase `assignments_known` | Every learner; identities are metadata except receiver slots |
| Rich evidence | routes, coverage regime, declared responsibilities, zone occupancy | Restricted by model feature allowlist |
| Outcome | categorical target and later no-target reason | Train labels for fitting; dev labels for diagnostics; test labels for scoring only |
| Private simulator truth | profiles, pressure, shocks, exact generating probabilities and seed internals | Generator/evaluator only; never learner features |

Learners cannot use world number, play number, seed, split label, truth
probabilities, target counts from dev/test, outcomes of the same play, or derived
post-target fields as predictors. A projection check rejects extra fields
rather than relying on learners to ignore them. This is a software interface
boundary, not a claim of operating-system or adversarial-agent containment.

Every export carries `evidence_origin=synthetic`, `world_id`, `protocol_version`,
`generator_version` and `prediction_phase`. Keep labels separate from feature
records. IDs use an `ud001:` namespace including condition/world/split/play.
Main/null pairs share random-draw keys, not record identities. No generated
object is emitted into Data, ROP, Teamstate, Forecast or production schemas.

For each receiver, `TPRR^D = credited targets / routes run` within the declared
synthetic window. It is an outcome summary, not an input from that same test
window. Preserve numerator and denominator. Route participation is
`routes / dropbacks`; target share is `targets / team credited targets`, with an
undefined share when the team denominator is zero. These are different quantities.
Any later masked/missing route labels must remain unknown; they are not blockers.



#### Reproducible population and evaluation

Use world seeds `[101,102,103,104,105,106,107,108,109,110,111,112]`. Each world
draws one new profile and has independent split streams: `4000` training,
`1000` dev and `2000` test plays. Totals per condition are 48,000/12,000/24,000.
Run both `h=1` and `h=0`; paired seeds allow direct diagnosis but are not two
independent replications of the same result.

The implementation must pin runtime and keyed random-draw procedure before
evaluation. A small deterministic choice is SHA-256-derived uniforms over
`[protocol,world_seed,split,play_index,field,draw_index]`, serialized as a JSON
array in that exact order. Use split `profile` and play index `-1` for fixed
profiles. Decode the digest's first 52 bits as big-endian integer `x`, then
`U=(x+0.5)/2^52`, which stays strictly between zero and one in binary64.
Use `floor(k*U)` for uniform categories; cumulative thresholds
for other categories; Fisher-Yates for man permutations; Box-Muller cosine
form `sqrt(-2*ln(U1))*cos(2*pi*U2)` for Normal shocks. Give every field/draw a
unique key. Main/null conditions reuse these draws; `h` changes only the equation.

Freeze the literal field-key registry, feature order, runtime version, source
commit, configuration, split sizes and output-byte serialization in the
implementation PR. Separate streams prevent a change in training length or a
control condition from advancing the test random stream. Distinct play IDs,
not merely different row positions, establish split membership.

**Primary score:** categorical log loss, mean `-ln(p[Y])`, in nats per play.
Use stable softmax; a documented `1e-12` log floor is numerical protection only.
Report each world's paired difference
`Delta_w = loss(B0,w) - loss(BRC,w)`; positive favors richer evidence.

**Predeclared synthetic support rule:** mean Delta at least `0.01` nats/play,
a paired world-bootstrap percentile 95% interval entirely above zero, and
positive Delta in at least 9/12 worlds. The `0.01` threshold is a chosen recovery
criterion, not an NFL usefulness threshold. Bootstrap 2,000 resamples of the
12 complete world differences, using a separate evaluation-only seed `9001`.
Resample worlds, not independent receiver rows; targets compete within plays.
Twelve worlds offer limited uncertainty resolution, which must be disclosed.

Also report class-summed multiclass Brier score, per-world sample counts,
NO_TARGET frequency, target counts and route denominators. Show 10 equal-width
probability-bin calibration summaries by class with counts; bins below 50
observations are marked insufficient. Exclude blocked receiver entries from
receiver calibration summaries so structural zeros do not flatter calibration.
Calibration and ablation comparisons are descriptive secondary checks, not
additional confirmatory discoveries.

The null condition must not meet the primary support rule. An apparent null gain
requires investigation of leakage, fitting, chance and scoring before any claim.
Report BRC versus BR and BC to expose whether a gain depends on route, coverage
or their combination. Do not claim that a larger feature set has isolated a
causal mechanism, or that the unobserved oracle is an attainable evidence baseline.



## 5. Interpretation and assessment

No final synthetic recovery or NFL-validity result. Development conformance and replay are separate from independent substantive design acceptance and authorization. See the edition’s original opening and individual cards for its exact dated assessment; this orientation grants no new verdict.

## 6. Unknowns and revision triggers

Source-specific limitations remain attached to their original blocks. Missing exact clocks, definitions, ownership, endpoints or independent review remain unknown; the original investigator would need to supply them before stronger claims.

## 7. Next checkpoint and closeout

#### Required negative cases and reporting

Before final evaluation, require checks for targeted blockers, multiple targets,
negative/non-finite probabilities, invalid sums, duplicate/overlapping play IDs,
misassigned zone defenders, invalid route denominators, test-label leakage,
truth/seed feature leakage, unrecognized fields and synthetic-origin loss.
Changing held-out labels/truth must not change fitted weights. Changing the
training size must not change the generated test split. Include a null-world
control and a deterministic same-input replay.

Return one of **synthetic recovery demonstrated**, **not demonstrated**, or
**invalid evaluation**. Include exact versions/hashes, convergence, every world
and baseline, uncertainty, failed checks, null results and all exclusions.
There are currently no executed results. No success value, review, operator
approval, NFL inference or production readiness is implied by this design.


## 8. Sources, review and amendment history

### Format-preparation provenance

- [Original source](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/bb24b06980e9a575235fca5e707778e820770fd2/docs/universe-d/experiment-001.md); [exact captured text](retained/experiment-protocol-amended.md).
- Source record created: `unknown (source describes October 23)`; source record updated: `immutable Git bb24b06980e9a575235fca5e707778e820770fd2`. These are record clocks, not evidence cutoffs.
- Retrieved: `2026-10-31T19:26:50Z to 2026-10-31T19:27:05Z (retrieval call window; exact per-file clock not retained)`; prepared: `2026-10-31T19:30:11.552299Z`.
- SHA-256 of UTF-8 source body: `607110b6e0f1b68656767df27b47cdc98556664fdc3c41bda6087bab62c17c6b`. This authenticates the captured API string only, not original-publication bytes or external source pages.
- [Source/version and section mapping](source-map.json). Organization is retrospective; original question IDs remain unchanged.
- External source links are retained locators, not fresh content verification. No private PDFs, datasets or correspondence were copied.
- Format preparation is separate from research completion, independent review, merge and downstream acceptance.
