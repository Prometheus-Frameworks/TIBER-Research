# Kicker / DST streaming policy prototype

**Status: offline synthetic-only implementation candidate.** This implements a
small part of the merged [Research #25 study design](../../docs/preparation/kicker-dst-streaming-2026-10-01/study-design.md)
([preparation PR #26](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/26)).
It does not establish a streaming edge or produce current-week recommendations.

## What is implemented

Separate deterministic candidate policies and prior-performance/simple-matchup
baselines, using the unchanged original eligible pool:

| Position | Candidate: equally weighted within-pool percentile ranks | Simple matchup baseline |
| --- | --- | --- |
| DST | Opponent prior-four-game passing attempts, opponent sacks suffered, defense supported sacks credited | Opponent prior-four-game sacks suffered |
| K | Own-team prior-four-game FG attempts and PAT attempts | Own-team prior-four-game FG attempts |

Higher feature values rank higher. Tied feature values receive average ranks,
normalized as `(rank - 1) / (pool_size - 1)`; a singleton receives 0.5. Final
policy ties break by canonical ID using JavaScript code-unit order. There are no
fitted weights, projected fantasy points, probabilities, or risk tiers. A rank
score of 0.75 is an ordinal heuristic, never 75% confidence or 0.75 expected points.

The recent-performance baseline uses the mean of the most recent four supported
individual-kicker or team-DST fantasy results under the declared scoring profile.
Supported negative scores rank above no-history options. Unsupported options
remain in the ordering; the baseline is unavailable if nobody has support.
The matchup baseline likewise ranks supported histories above unsupported ones
and is unavailable if all its histories are missing. These are explicit
prototype choices for all-unsupported units, not invented observations.

The engine selects at most the latest four completed games **per feature** from
the supplied history. One to three games are retained and flagged sparse; no
history stays unknown, not zero. If any original-pool option lacks a required
candidate feature or a kicker lacks declared job support, the candidate abstains
for the whole unit. Both baselines retain the original pool. This implements the
study's protection against improving results by dropping inconvenient candidates.

Declared held, locked and bye entries are excluded before defining that pool.
An entry declared eligible whose game has already started is rejected. Duplicate
candidate identities and duplicate games within a feature are rejected.

## Run locally

Node.js 20 or newer; no new packages, secrets, network, model calls or database.

```bash
node --test tools/kicker-dst-streaming-v0/policy.test.mjs
node tools/kicker-dst-streaming-v0/policy.mjs --demo
```

The CLI accepts only `--demo`, reading the two fictional examples in
`synthetic.json`. They deliberately make the candidate and simple baselines
disagree. None of the identities, histories, scores or eligibility assertions
describe a real league, team, player or historical result. A single historical
observation per feature keeps the hand calculation readable and exercises sparse
history; it is not enough data to validate football performance.

`assess(packet)` is also exported for offline contract tests. It rejects packets
unless `synthetic: true` is declared. This is a misuse guard, **not** proof that a
caller told the truth, a source admission check, or an activation mechanism.
Do not relabel real records as synthetic to bypass it.

## Input and output boundary

Packets explicitly declare position, cutoff, scoring-profile identity, candidate
pool, eligibility, kickoff times and per-feature histories. Each observation
requires a game ID, value, source reference, completed-game time and availability
time. Recent fantasy results also identify their scoring profile. Kicker
opportunity observations belong to the current kicker's team, while individual
fantasy history belongs to that kicker. An adapter must qualify these identities;
the arithmetic engine cannot infer them from a display name.

UTC clocks must round-trip as real calendar instants with second or millisecond
precision. Observations require `event_end < cutoff` and
`event_end <= available_at <= cutoff`. All supplied feature observations are
checked, including older rows outside the final four-game lookback. Future or
late-revised observations cause a hard failure, not a silent fallback. Outcome
data must never be passed in as current-week feature history.

These are **synthetic structural checks**, not historical availability proof.
Source strings, `available_at`, eligibility and job flags are caller declarations.
This module does not authenticate exact source bytes/revisions, event attribution,
team/opponent direction, actual waiver eligibility, admission, rights or complete
history. A scoring-profile ID comparison is not validation of its scoring rules.
No generic `available_at` string replaces the existing Research source metadata
and availability-evidence receipt contracts.

Outputs keep the candidate rank score, individual feature percentiles, evidence
counts, selected game/source references, sparse flags, exclusions, missingness,
abstention and baseline choices inspectable. All outputs explicitly say
`synthetic_unverified_declarations` and `uncalibrated_rank_only`.

## What this step does not implement

- Live or historical data acquisition, a real-data adapter, league availability
  snapshots, outcomes, model training, empirical evaluation or weekly rankings.
- Full scoring reconstruction (credited DST events and points-allowed attribution;
  kicker distances, misses and PAT rules).
- Uniform, market and expert comparators; outcomes and qualified sources are
  required for those. No optional comparator is silently replaced with constants.
- The study's bootstrap, confirmatory claim gates or future-season campaign.
- Weather, roof, QB/OL context, pressure, turnover-worthy plays, expected points,
  confidence ranges, shortlist quality, next-week stash value or FAAB decisions.
- Changes to the legacy Fantasy DST service, Forecast, existing governed runs,
  source admission, runtime activation, scheduled jobs or transactions.

No claim is made that this prototype would have changed any past lineup result.
The old Fantasy streamer remains unchanged and is not used as numerical evidence.

## Smallest next football step

Prepare a bounded **prospective exploratory pilot** against the existing study,
with a first possible decision at Week 8 only if the necessary evidence is ready
before its declared cutoff. This is a proposal, not an activated run or a promise
to recover Tuesday availability from Sunday information.

1. Select the exact weeks/cutoffs, scoring profile and one original eligible pool
   per position. A real league study needs separate permission before publishing
   private roster/scoring/availability data; public examples stay fictional.
2. Qualify existing permitted prior-game inputs. TTS's team-activity fields do not
   establish credited defensive sacks by themselves or supply FG/PAT attempts.
   Preserve those gaps instead of deriving pressure from sacks or filling kicker
   opportunity from offensive points. No new provider or paid acquisition is
   selected by this prototype.
3. Add a separately reviewed adapter to the existing source/availability
   contracts and versioned league scoring/lock snapshots. Unrostered status from
   the current connector does not establish claim eligibility or winning a bid.
4. Freeze policy selections and baselines before outcomes; join only independently
   supported scored outcomes afterward. Retain failures, abstentions and every
   original pool. Report mean score, paired baseline difference, negative-score
   frequency and useful-score frequency with denominators. Separate DST and K.
5. Compare the candidate with the study's prior-only, simple-matchup and uniform
   baselines before claiming improvement. Markets/experts require separately
   qualified contemporaneous sources. A remaining-2026 pilot is exploratory and
   cannot satisfy the two-future-season confirmation design.

The current operator request motivates this executable fixture-only step. It does
not thaw old jobs or manufacture a new Ops activation. Any real-data run needs its
concrete input, purpose, cutoff and write boundaries resolved first. The prior
Carolina witness-recovery problem does not need to be misrepresented as solved
to prepare a distinct prospective pilot.

## Validation receipt

Local Node.js v24.22.1: **17 focused tests pass**. Tests cover independently
hand-calculated ranks, baseline disagreement, ties/singletons/empty pools,
ordering invariance, sparse and zero evidence, whole-pool abstention, negative
scores versus missing history, last-four selection, future/late-revised inputs,
calendar validation, identity duplication, eligibility/locks/byes, scoring-target
mismatch, kicker job support, malformed/nonfinite values and CLI restrictions.
The existing Node 20 CI job runs this test file after the repository contract
checks. Full-repository CI and independent review must be reported separately;
this local receipt establishes neither. No empirical football test was run.
