# Separate kicker and DST study designs

## Status and estimand

This is a **candidate preregistration**, prepared before any empirical evaluation in this task. It is not yet frozen or activated. Carolina was selected after its result was known and is excluded from validation of an edge. Familiar historical seasons cannot be described as unseen simply because this executor did not download them. The eventual freeze must record every investigator's known outcome exposure and all deviations.

Two studies, two result sets: `dst-streaming-v1` and `kicker-streaming-v1`. The primary question is the value of selecting **one** option from an eligible pre-decision pool, under a frozen scoring profile, compared with simple policies selecting from exactly the same pool. Do not conflate rank, expected points, downside, and useful-score probability. A one-week bad result does not alone invalidate a good decision; a surprise winner among many options does not demonstrate it was identifiable.

## Common protocol

### Unit, inclusion and windows

- Decision unit: league or explicitly simulated pool × position × regular-season week × cutoff. One selected team DST or individual kicker per method. Paired method differences use the identical unit.
- No postseason; no games already started at that unit's cutoff; no bye teams. Separate zero-eligible-option units and report them, never manufacture a choice.
- Candidate historical development window: 2022–2024 REG W1–18; candidate historical test window: 2025 REG W1–18. These windows are **proposals conditional on source and era audits**, not claims of retained coverage or valid untouched holdout. If investigator exposure or as-of evidence is inadequate, historical results are exploratory only.
- Preferred confirmatory alternative: prospectively freeze a protocol before the first separately authorized future decision week, then evaluate every remaining regular-season week in that season. No schedule, source collection or future run is started by this document. Pin the actual first/last weeks and UTC cutoff list in the later job; do not silently shorten the window after bad results.
- Early-season W1–3 and later W4–18 are prespecified reporting strata. No in-season features exist at W1; use only qualified prior-season information or mark the corresponding policy ineligible. Separate era-sensitive rules (including kickoffs/scoring rules) and kicker job changes; do not pool across changes without a declared sensitivity analysis.

### Cutoffs and source versions

Evaluate three distinct policies, not one merged information set:

1. **Waiver decision:** Tuesday 20:00 America/New_York in the relevant game week, converted to a pinned UTC instant using the IANA zone. A supplied actual league deadline replaces this only in its separately declared league study.
2. **Late-week refresh:** Thursday 12:00 America/New_York. This remains before a normal Thursday game but actual schedule/lock evidence controls eligibility; never assume all Thursday games start in the evening.
3. **Pre-kickoff:** a single Sunday 12:00 America/New_York cutoff, excluding every game already started. Do not use different candidate-specific news horizons in a purported simultaneous selection decision. Games starting earlier, rescheduled games and international games require explicit handling through the verified kickoff/lock manifest.

**Primary cutoff: Tuesday 20:00 America/New_York.** Only this cutoff enters the primary paired difference, coverage gate and confirmatory claim for each position. Thursday and Sunday are separately reported descriptive sensitivities, with no superiority claim, best-cutoff selection, pooled estimate or replacement of the primary result. The multiplicity plan below therefore covers exactly the two Tuesday position-level claims. A later confirmatory cutoff expansion requires a new pre-outcome freeze and a revised multiplicity family.

These are proposed research cutoffs, not known dates of Joe's decisions. Tuesday selection and Sunday refresh are evaluated separately; the latter cannot repair the former in hindsight. A sequential replacement policy requires a separate frozen transition rule and transaction/lock witness; it is outside the minimum study.

For each input retain entity/game identity, event window, source revision/content hash, source publication time, independently supported `available_at`, retrieval time, correction/version history, Research observation time and cutoff. A published date alone may not identify the exact bytes available then. Current pages, final-season tables, later injury reports and later-acquired/corrected boxes cannot prove as-of availability. Missing availability evidence means retrospective-only or excluded from replay; receipt/commit clocks are never substitutes. Use existing Research source metadata and availability-evidence receipt contracts, not an alternate clock standard.

All candidates and baselines share the same source vintage and cutoff. Outcomes are joined only after selections and prediction files are frozen/hash-bound. Preserve evaluation outcomes separately from feature inputs. New corrections create a versioned sensitivity result, never silently overwrite a frozen run.

### Candidate availability and costs

- Preferred pool: a dated, permitted league snapshot proving identity, unrostered status, waiver/free-agent status, claim deadline, lock state and applicable roster rules. Unrostered does not mean immediately addable or certain to be won on waivers. The estimand is conditional on successful acquisition unless a separate acquisition model is explicitly frozen.
- If these snapshots are absent, use **simulated pools** only. Proposed deterministic proxy: remove the top N options by the frozen prior-only baseline at the same cutoff, where N is 10, 12 or 14; rank ties by canonical identity. Include only verified active-game entities and exclude a separately declared reserve of zero or one additional held option per simulated manager. For the reserve sensitivity, remove the next N baseline-ranked options as well. Report resulting pool sizes and empty pools. This does not reproduce real managers or actual waivers.
- **Primary simulated pool: N = 12, zero reserve per manager.** The N10/N14 and one-reserve variants are separately reported descriptive sensitivities, never pooled or weighted into the primary estimate, coverage denominator or claim gate. Do not choose the best variant after outcomes. At job freeze, select either this simulated primary study or one explicitly identified actual-league primary study based on the availability-witness audit, before viewing evaluation outcomes. Actual and simulated studies cannot substitute for or aggregate with one another; multiple actual leagues need a separately frozen selection/weighting rule before any confirmatory claim. If the chosen primary pool is not evaluable, report it blocked/inconclusive rather than switch to a successful sensitivity.
- Do not use current roster percentages as historical ownership, that week's final score/rank to define the pool, or infer roster ownership from a hypothetical example.
- Public examples use fictional league IDs and synthetic manager context. This packet publishes no private roster/scoring packet.
- Base comparison assumes one free roster slot, no acquisition cost and no next-week holding value. State that limitation prominently. Report one-slot versus two-slot feasibility separately; FAAB, dropped-player value and stash-next-week policies require explicit inputs and a separate expansion. No invented zero-cost claim about a real league.

### Scoring profiles

Freeze a machine-readable profile before outcome reconstruction. Proposed synthetic primary profile (not claimed as Joe's league): DST sack +1; interception +2; credited fumble recovery +2; safety +2; credited blocked kick +2; defensive/special-teams return TD +6, counted once per event. Points-allowed brackets: 0→+10, 1–6→+7, 7–13→+4, 14–20→+1, 21–27→0, 28–34→−1, 35+→−4. The profile must explicitly specify which points count against DST, overtime and return/PAT attribution using event-level rules. Until these attribution rules are bound to an eligible scoring source, a complete DST target is unavailable. Do not simply use opponent final team score as points allowed.

Kicker primary profile: made FG 0–39 yards +3, 40–49 +4, 50+ +5; made PAT +1; missed FG −1; missed PAT −1. Record the rule for blocked versus missed kicks and double counting. Distance unknown means this target cannot be reconstructed from made totals alone. Prespecified sensitivities: flat +3 FG; no miss penalty; DST points-allowed component removed; actual separately permitted league profile. Different profiles are separate targets, not pooled PPR labels.

### Common baselines and comparison discipline

1. **Uniform pool:** exact mean of eligible options' realized scores, the expected score of uniform random selection. For downside/threshold metrics use the pool mean of event indicators. No Monte Carlo seed is needed for this baseline.
2. **Prior-only recent performance:** rank by mean scored outcome over the last four eligible completed games before cutoff; no current-week or future game. Use qualified prior-season games to fill at season start, explicitly mark offseason boundary. If insufficient eligible history exists, use the available count, report it and flag sparse (<4); zero-history entities rank below supported entities with identity tie-break. Missing outcome reconstruction is not a zero.
3. **Simple matchup:** DST ranks opponent prior-four-game sacks suffered per game descending; K ranks own-team prior-four-game FG attempts per game descending. These intentionally simple heuristics use no unverifiable pressure or market fields. Zero-history remains unsupported.
4. **Market-only:** DST ranks lowest contemporaneous opponent implied team total; K ranks highest contemporaneous own-team implied total. Use the same declared book/provider and snapshot policy for all options. Derive home/away implied totals as total/2 minus/plus the home spread/2 (home spread negative means favored); verify sign convention. These are market summaries, not calibrated expected fantasy points. Missing lines yield a coverage-restricted paired comparison, never a filled consensus. Do not replace Tuesday lines with closing lines. Odds/probability features, if later used, require explicit margin removal; lines alone do not establish outcome probabilities.
5. **External expert:** latest permitted ranking published by cutoff from one preregistered provider/version, retaining ties and omissions. No current ranking substituted for a historical one. No provider is qualified here.
6. **Candidate mechanism policy:** the separate DST and K rank-only policies below, frozen before scoring outcomes. No predicted decimal points or probability estimates are produced by an uncalibrated rank formula.

Report the primary supported-input comparison population and each optional baseline's common-support subset, coverage and selection bias. Do not improve the candidate's apparent result by silently excluding its losing weeks where a richer optional comparator is missing. Every method gets the same pool within a reported comparison; unsupported methods may be unavailable rather than imputing evidence. Tie-break all internally generated ranks by canonical ID ascending. Expert ties use the same declared tie-break.

## DST study

Hypothesis D1: opponent passing exposure and sack vulnerability, plus a defense's supported sack events, contain incremental information beyond recent fantasy points. D2: opponent context matters independently of the prior game's final points conceded. D3: rare return scores/recoveries explain some large outcomes without a repeatable selectable edge. These are competing testable ideas, not accepted TTS features.

Proposed minimal candidate rank = mean of three percentile ranks within the eligible pool: (a) opponent prior-four-game passing attempts per game, (b) opponent prior-four-game sacks suffered per game, (c) defense prior-four-game supported sacks credited per game. Higher is favored; average ranks for feature ties, normalized as `(rank − 1)/(n − 1)`, singleton feature percentile 0.5. Features must have at least one eligible prior game; if any is missing, policy abstains for that entity and reports this. Paired performance must then use the resulting common candidate pool for all compared policies, with the excluded original-pool share disclosed. No tuning of weights in this first candidate. Passing attempts are exposure, not complete dropbacks; sacks suffered must not be mislabeled as pressure. Reciprocal opponent rows alone require attribution qualification before (c) is supported.

QB identity, offensive-line availability, score state, drives/possessions, special-teams context, pressure and turnover-worthy events are an **extension set**, each needing its own source/availability witness. They are not filled from names, current depth charts or the legacy constants. Do not put an extension into the primary model because it explains Carolina after the fact.

Actual total fantasy score remains the primary target including rare events. Secondary decomposition reports sacks/turnovers, points-allowed, and defensive/ST TD components separately. Removing TDs is a declared sensitivity, not deletion of inconvenient observations. Do not infer that interceptions or recovered fumbles are wholly skill or wholly luck.

## Kicker study

Hypothesis K1: opportunity to attempt kicks is separable from conversion skill. K2: offensive scoring-range access can produce either FG attempts or PATs, depending on drive endings and coaching decisions. K3: distance mix, weather/roof and job security can affect downside independently of team quality.

Minimal candidate rank = mean of within-pool percentile ranks of own-team prior-four-game FG attempts and PAT attempts per game, using the same tie/sparse/missing rules as DST. This is an opportunity heuristic, not expected points. Candidate entity is the kicker, not an interchangeable team slot: current kicker job/identity must be proven at cutoff. Team opportunity follows the team; individual conversion history must not silently transfer between kickers. A newly appointed kicker may qualify for the team-opportunity policy with a proved job, while the individual recent-points baseline stays sparse/unsupported.

Distance-distributed attempts, fourth-down choices, scoring-range drives, roof/weather as-of forecasts, injury/job-change news and distance-dependent conversion are extension features requiring new qualified witnesses. Final observed weather cannot replace pregame forecasts. No pressure/TTS proxy supplies kicker attempts. No new fitted model or Forecast run is part of preparation or the minimal empirical proposal.

## Evaluation and interpretation

- Primary: paired mean selected-option fantasy points difference against the prior-only baseline under the primary scoring profile, **Tuesday cutoff and frozen primary pool only**. Give each eligible week equal weight within each position; do not multiply its weight by the number of sensitivity pools. Uniform and simple matchup are required descriptive comparators where fields permit. Keep DST and K separate.
- Secondary: negative-score probability; useful-score probability at prespecified 8 points for DST and 8 for K; top-three shortlist includes at least one ≥8 outcome; realized regret versus the available-pool oracle. The oracle is an unattainable hindsight ceiling. Report shortlist size, coverage and pool size to avoid credit for simply naming many candidates.
- Uncertainty: paired resampling of whole week blocks, keeping all games, teams and simulated league variants together (2,000 replicates, fixed seed 25 in a later implementation). Season-stratify where more than one season exists. Never treat thousands of overlapping simulated pools as independent observations. Report number of independent weeks/games, interval method and small-sample limitations. Carolina alone gets no inferential interval or edge claim.
- Proposed claim gate: at least 30 eligible decision weeks spanning two seasons, ≥80% predeclared unit coverage, and the 95% paired interval lower bound above zero for the primary difference. Compute all three conditions on the frozen primary cutoff/pool population only. Otherwise label inconclusive/no reliable edge; a positive point estimate alone is insufficient. This gate is a design choice, not validated power. Report a sensitivity to season removal and avoid promising that 30 weeks is enough.
- Freeze a single primary comparison per position; any additional feature search is exploratory with a complete search/deviation ledger. If testing both position-level superiority claims, control the two primary tests by Holm adjustment at familywise 0.05; interval/claim reporting must agree with the adjusted tests. No leaderboard selection on the held-out window.
- Historical development may tune later variants only within development years with rolling-origin validation. Lock all parameters before test outcomes; revised variants need a fresh test period and separate approval. Rule-era changes and prior investigator exposure may require a wholly prospective confirmation instead.
- Report nulls, abstentions, failed identity joins, excluded versions, sparse windows and rights/cutoff failures. Publish no fabricated confidence, calibrated probability or expected points. Negative findings, weak tiers, source-limited manual shortlists and fully blocked studies are valid outcomes.

## Proposed report row

`position | entity ID | opponent | decision cutoff | availability (actual/simulated/unknown) | rank or unavailable | descriptive reason and input references | counterevidence | missing fields | source vintage | uncertainty | next-week context (if supported) | scoring profile | study status`

Keep observed inputs, deterministic ranks/calculations, external rankings, researcher interpretation and any future calibrated forecast in distinct fields. Next-week context is descriptive and does not authorize a stash recommendation. The user or reading agent makes the final decision.
