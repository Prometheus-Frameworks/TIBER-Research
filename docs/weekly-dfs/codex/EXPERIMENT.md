# DFS Research Arena v0

## Purpose

Study how an agent uses evidence, maintains continuity and revises decisions in a
real environment that changes over time. NFL DFS supplies a finite player pool,
a salary budget, roster constraints, a deadline and outcomes that have not yet
occurred when the predictions are recorded.

The operator's October 17, 2026 direction establishes this purpose. Profit and
contest participation are outside the experiment. The agent performs research and
selects hypothetical lineups; the operator observes the record and may provide
feedback. Record any material operator input so its influence remains visible.

This protocol is a conversational notebook experiment. It does not activate the
repository's separately governed Research-run machinery or certify general agent
safety, intelligence or forecasting skill.

## Research questions

- Can the agent retain the relevant evidence, uncertainty and previous decisions
  across separate daily runs?
- Does new information lead to a supported revision, a supported decision to hold,
  or an explicit unresolved question?
- Does the final lineup respect the same budget, roster and slate constraints
  used throughout the week?
- After the games, can the agent distinguish the outcome from whether its stated
  assumptions were supported?
- Which missing sources, calculations or workspace capabilities most limit the
  quality of the work?

## Scope and cadence

| Item | Initial protocol |
|---|---|
| Platform | DraftKings NFL Classic |
| Weekly target | One verified upcoming Sunday main slate, shared across the week's daily drafts |
| Budget | $50,000 |
| Roster | QB, 2 RB, 3 WR, TE, FLEX, DST |
| Daily research | Flexible early-morning window around 6 a.m., America/Toronto |
| Final selection run | Flexible Sunday window around 10:30 a.m., America/Toronto |
| Final deadline | Sunday noon Toronto time, or before the first included kickoff if earlier |
| Results review | Daily task checks completed slates; normally first available after Sunday, with corrections appended later |
| First scheduled daily run | October 18, 2026 |
| Seed | Existing October 17 Week 6 v1/v2 records; retain them unchanged |
| First full daily trajectory | The next upcoming slate after Week 6, when sources permit |

The two enabled task configurations are titled **TIBER DFS Research Arena** and
**Freeze TIBER DFS Lineup**. Creation confirms scheduling configuration; successful
scheduled research, archive access and publication are established only by actual
future runs.

Resolve the upcoming Sunday's actual season/week and included games from current
sources. A Monday's live NFL-state week can still refer to the preceding slate.
Keep the selected slate consistent across daily drafts. If the platform changes
the pool or rules, preserve both versions and explain the effect on comparability.

The initial times are operator-adjustable defaults chosen during setup. A
protocol change gets a dated prospective version; do not revise the experiment's
past deadline after seeing its outcome.

## Each daily run

1. Read the current protocol, latest daily snapshot, any freeze and earlier
   results for this slate.
2. Gather current evidence with an actual decision cutoff and source retrieval
   times. Preserve source publication/update times separately where known.
3. Reassess the available pool and the previous lineup. Research the weakest
   assumptions and relevant new information.
4. Select a hypothetical lineup, self-review it and check the budget and roster.
   A complete official salary export is preferred. Until one is available,
   verified published prices may support a clearly labelled provisional entry.
5. Record changed and important unchanged decisions, the strongest counterargument,
   the unknowns and what would change the current view.
6. Append the snapshot, verify the saved record and deliver the actual research
   result with its archive link.

If the slate is unpublished or enough eligible prices cannot be verified, record
a partial research board with explicit unknowns. Do not invent prices, official
player IDs, pool completeness or a complete legal lineup.

No change is a valid outcome. Fresh wording, extra revisions and spending every
salary dollar are not objectives.

## Record shape

Use append-only records under these paths:

- `YYYY/week-NN/daily/<date>.md` and companion JSON
- `YYYY/week-NN/freeze/<actual-UTC-timestamp>.md` and companion JSON
- `YYYY/week-NN/reviews/<actual-UTC-timestamp>.md` and companion JSON

The original flat `2026/week-06.md` and `week-06.json` remain the seed record.
The path convention is not a new validated Research schema.

Each new snapshot records:

- actual UTC and Toronto decision time, selected slate and evidence cutoff;
- predecessor locator and exact source/salary-snapshot references when available;
- players, roster positions, original salaries, total and remaining budget;
- what was directly observed, an attributed outside estimate, or agent judgment;
- revisions classified as `new_evidence`, `changed_interpretation`,
  `constraint_or_source_correction` or `unchanged`;
- concise public decision rationale, alternatives, uncertainty and revision triggers;
- material human input, known model/tool changes, and observed resource use where
  available; unavailable runtime/model/cost details stay unknown;
- actual scores left null before the games.

Publish actual file/commit locators and hashes only when genuinely established.
A Git timestamp records the notebook publication, not an external source's
historical availability. Preserve precise source limitations. Self-review is
labelled as self-review; an independent reviewer exists only when separately
identified work actually occurred.

## Final freeze and temporal integrity

The final run chooses and records one complete hypothetical lineup before the
deadline. It binds the exact selected record and original salary snapshot through
an immutable file/commit locator or verified byte identity. It records the actual
freeze time and stated deadline.

A later kickoff status or injury observation is appended as context. It does not
replace the scored final lineup. This makes the chosen information deadline a
real constraint of the experiment.

If the final run is late, target games have started, or no complete verifiable
candidate exists, record a missed or partial freeze. Preserve any genuine earlier
draft; do not backdate it or silently relabel it as a timely final selection.
Already-frozen selections survive retries unchanged.

Pregame records can use results from earlier games available at their actual
cutoff. They cannot contain results from target games that had not started.
Postgame evaluations stay in separate dated records.

## Measurement

Initial measurement is descriptive. Establish a multiweek baseline before setting
a performance target or claiming improvement.

| Measure | Definition and use | Limitation |
|---|---|---|
| Realized lineup score | Sum verified DraftKings points for the exact nine selections in each archived complete draft and the freeze | One outcome is noisy; invalid or incomparable snapshots remain visible and labelled |
| Revision contribution | Final score minus the first comparable daily draft; also score each replacement and each daily version against the same slate | A positive difference can arise from luck and does not by itself establish better reasoning |
| Evidence and assumption record | Report sourced selections out of nine, explicit missing fields, and stated assumptions supported / contradicted / unassessable after the game | More documentation is not automatically better judgment; coverage and substantive support remain distinct |

Two operational guardrails accompany those measures:

- report roster/budget/slate validation failures and any missed freeze rather
  than hiding the entry;
- preserve the pregame record: no scored-selection rewrites after the deadline
  and no real-world entries or transactions.

Where comparable, report points per $1,000 using each draft's original salary
total. Do not aggregate incomparable platforms or slates into one performance
claim. A hindsight optimality gap requires the complete original pool and
verified scoring; contest rank and financial return require additional evidence.

Use verified platform scoring or a documented reproducible calculation under
the exact rules, including relevant bonuses and DST events. Missing inputs stay
pending. Label provisional scores and append stat corrections.

The review asks both what scored and whether the anticipated opportunity,
availability and game mechanism occurred. It preserves misses, uncertainty and
unassessable cases. Confidence labels, if used, are the agent's declarations;
numeric calibration requires explicit predictions and enough resolved observations.

## Tools and extension boundaries

The arena can begin with ordinary current public-source research and the existing
GitHub notebook. The proposed official slate importer, lineup validator, qualified
ROP/TTS reader and verified scorer can improve the environment as separately
implemented capabilities.

Use eligible retained ROP/TTS evidence only within its qualified scope. The
currently installed league MCP's capability response withholds ROP/TTS/Forecast;
do not assume they became exposed because a tool was proposed. Preserve the
difference between inaccessible evidence and evidence that does not exist.

Scheduled publication is limited to `docs/weekly-dfs/codex/` through
documentation branches/PRs. It does not permit automatic merges, coding jobs,
producer runs, bulk data admission, new paid services, credentials, deployments,
roster transactions or contest entry. Other agents can later participate under
separate declared tracks with known shared information and model/tool changes;
this protocol does not dispatch them.

No continuous monitoring is implied. A failed archive write is reported as
unsaved research, not a durable update. The first scheduled execution must prove
its own access and successful work.
