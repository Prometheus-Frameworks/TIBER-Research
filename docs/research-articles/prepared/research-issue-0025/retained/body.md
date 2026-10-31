## Operator request · October 1, 2026
Requested by Joseph; framed and posted by Codex under his authority.

Joseph wants to study the art of streaming kickers and DST, eventually informing a useful weekly streamers ranking. His motivating observation is that one or two unclaimed defenses often score well, while selecting a good defense against a weak offense or following market lines can disappoint.

This is a manager observation and research motivation, not an established frequency or finding. Test it rather than universalize it.

## Bounded task and lifecycle
Launch the research workstream with a **research-design and source-readiness phase**: reconcile existing work, specify hypotheses and evaluation, inventory available evidence, and return an execution-ready proposal. Read relevant TIBER repositories and existing evidence read-only. Any preparation writes belong only to a dedicated Research branch, following current repository conventions.

Issue creation is not an activated Research run. The README assigns run activation to Ops; before empirical execution, materialize the exact job, inputs, cutoff, source envelope, cost/write boundaries and review requirements for an Ops activation decision. Do not claim a run started or empirical findings exist merely because this issue was posted.

No scheduled report, production ranking, source promotion, provider acquisition, paid access, model/API spending, merge, deployment, downstream code or roster transaction is authorized here.

## Primary question
**Within a defensible pre-kickoff waiver pool, can a repeatable selection method improve streaming decisions over simple baselines—and which parts of the weekly surprises remain irreducible uncertainty?**

Study kickers and DST separately. Distinguish:
- relative rank, expected score, downside risk and chance of a useful outcome;
- pregame decision quality from realized one-week score;
- repeatable sack/opportunity mechanisms from rare scoring events;
- selecting one option from a shortlist versus retrospectively finding the week's winner.

A surprise winner somewhere among roughly 20 available teams does not prove it was identifiable beforehand. More candidates create more opportunities for an extreme result.

## Reconcile before building
Inspect the current exact-head evidence for:
- Fantasy `server/modules/dstStreamer.ts`, RankingsHub presentation and mounted routes: fixed team/opponent tables, source clocks, defaults, generic score-to-points conversion and missing roster percentages.
- Older DST Streamer and Waiver Wisdom handoffs; classify proposal, legacy implementation and validated capability separately.
- [Data #270](https://github.com/Prometheus-Frameworks/TIBER-Data/issues/270): special-teams game-impact direction, not streaming implementation authority.
- Relevant Data, Teamstate, Forecast, Strategy and Ops scope/serving boundaries.

Reconcile existing producer work before proposing a new implementation lane. The old DST tool is not a validated 2026 baseline simply because it returns rankings.

## Candidate mechanisms—not accepted features
**DST:** opponent dropback exposure, sacks allowed, defensive sack generation, quarterback identity/availability, offensive-line availability, likely game script and opponent scoring environment. Pressure and turnover-worthy rates require real permitted sources. Separate defensive/special-teams touchdowns, return scores, blocked kicks and fumble recovery variance from repeatable opportunities.

**K:** field-goal attempts and distance distribution, PAT opportunities, offensive ability to reach scoring range, fourth-down/kicking decisions, game script, kicker identity/job security, weather/roof and distance-dependent conversion. “Good offense” does not necessarily mean many field goals; touchdown conversion may substitute PATs for attempts.

**Markets:** test spreads, totals, implied points and genuinely relevant props as separate candidate baselines/features. Preserve sportsbook/provider attribution, timestamp, availability and margin treatment. Do not confuse a median prop line with expected fantasy points; never substitute closing lines for earlier waiver-decision information.

## Availability and decision cutoffs
- Prefer actual dated league availability snapshots where explicitly supplied and permitted.
- Current roster percentages are not historical availability, and unrostered is not always immediately addable.
- If historical waiver snapshots are absent, label simulated pools explicitly; test sensitivity to plausible league sizes and availability assumptions.
- Do not define “bottom 20” using that week's realized performance or final-season rank.
- Separate Tuesday/Wednesday waiver selection from a late-week refresh and pre-kickoff choice. Information available Sunday cannot improve a Tuesday replay.
- Handle Thursday locks, already-started games, bye weeks, roster costs and holding next week's streamer.
- Use synthetic league fixtures in public deliverables unless separate permission covers actual league context. Do not copy Joseph's private roster packet into this issue.

## Baselines and evaluation design
Preregister scoring, sample, windows, pools, cutoffs, tie-breaks and success criteria before outcome inspection.
Compare under the same available pool and information boundary:
1. Uniform/random available option as a variance reference.
2. Prior-only recent performance or declared historical baseline.
3. Simple matchup heuristic.
4. Market-only baseline where contemporaneous evidence exists.
5. Timestamped external expert ranking where permitted.
6. Candidate combined mechanism-based method.

Use chronological held-out evaluation, training-only tuning and appropriate season/rule-era separation. Include early-season sparse data. Avoid selecting thresholds after seeing winners.

Primary metrics: selected-option mean fantasy points and incremental value over baselines, with uncertainty intervals. Secondary: downside/negative-score rate, probability of reaching preregistered useful-score thresholds, shortlist hit rate, and regret against the available-pool oracle. The oracle is hindsight ceiling only, never an achievable baseline. Separate touchdown-heavy outliers from ordinary scoring without deleting them from the actual fantasy target.

Group uncertainty by week/game and account for correlated team outcomes, multiple feature searches and repeated tuning. Report coverage, missingness and sample size. Evaluate scoring variants, including points-allowed brackets, sacks/turnovers, field-goal distance and miss penalties; “PPR” does not specify K/DST rules.

“No reliable edge,” weak tiers, partial coverage or a manual external-evidence shortlist are valid conclusions. No unsupported decimal projections or confidence guarantees.

## Case study 01 — Carolina Week 1 → Week 2 (added October 1, 2026)

**Observed historical results:** The [Panthers’ official 2026 schedule](https://www.panthers.com/schedule/2026/) lists a 37–59 loss to Chicago in Week 1 and a 34–3 win at Atlanta in Week 2. These final scores establish the case’s contrast; they do not establish Carolina’s fantasy DST points, waiver availability, or a predictable improvement.

**Manager motivation:** Joseph asks whether Week 1 contained any indication that Carolina could be a useful Week 2 DST streaming option despite allowing 59 points. This is an outcome-selected diagnostic case, not a held-out validation case or evidence that such a signal existed.

### Research question and evidence reconstruction

Could information available before the Week 2 decision cutoff have justified considering Carolina DST relative to the eligible alternatives and the simple streaming baselines?

- Reconstruct Carolina–Chicago Week 1 and Atlanta–Pittsburgh Week 1 from qualified team/game artifacts. Preserve reciprocal direction: Carolina’s own offensive sacks suffered describe its offensive vulnerability; Chicago’s offensive sacks suffered describe events against Carolina only where the source supports that attribution. Atlanta’s Week 1 offense provides next-opponent context.
- Inventory the latest qualified TTS reports and their source pins, review/admission status, acquisition clocks and observation windows. Reconcile these with provisional adapter documentation; an adapter or schema alone does not prove that an admitted report exists.
- The inspected [provisional Week 1 binding](https://github.com/Prometheus-Frameworks/TIBER-Teamstate/blob/main/src/provisional/week1Binding.ts) contains attempts, completions, passing yards/TDs/interceptions, sacks suffered, carries, rushing yards/TDs and total fumbles lost. These are a starting inventory, not a certification of complete defensive evidence. Retain missing values as unknown; do not infer pressure from sacks or attribute every offensive fumble lost to the opposing DST without event support.
- Identify additional evidence needed for exposure and game context, defensive scoring events, injuries/personnel, weather and dated market expectations. Kicker-specific fields remain a separate research lane.

### Separate diagnostic analysis from an as-of replay

Produce two clearly labeled views:

1. **Retrospective diagnostic:** Describe what Week 1 and Week 2 records show, separating raw observations, deterministic calculations and researcher interpretation.
2. **Verified pregame replay:** Use only inputs demonstrably available by a declared Week 2 cutoff, with the same cutoff applied to every candidate and baseline. Later-acquired or corrected records cannot establish historical availability and must be labeled accordingly. Week 2 observations are evaluation outcomes only, never Week 2 predictive features.

Evaluate three competing explanations: a signal obscured by the Week 1 final score; a favorable Week 2 opponent/context change; and outcome variance without a defensible pregame edge. Report supporting evidence, counterevidence and missing evidence for each. An inconclusive result is acceptable.

### Scoring, availability and generalization

- Reconstruct DST outcomes only under an explicitly declared scoring profile and supported scoring-event attribution. Final team scores alone do not provide a complete fantasy DST score. If required events are missing, leave the fantasy result unavailable.
- Carolina’s historical waiver availability remains unverified until supported by a dated league snapshot. Any proxy candidate pool must be explicitly labeled simulated; this case does not establish ownership or authorize a transaction.
- Compare the pregame decision with the issue’s existing baselines. Do not tune a rule to this one successful outcome. Subsequent validation should include comparable failures and successes across other teams/weeks, with chronological separation and the same availability constraints.
- Deliver a compact case packet containing verified results, inspected fields and denominators, provenance/cutoff evidence, gaps, competing explanations, baseline comparisons and a supported disposition. Preserve the distinction between manager judgment, historical evidence, derivations, unavailable forecasts and researcher reasoning.

This addition stays within the issue’s existing design/readiness scope. It does not activate an empirical run, acquire new sources, or authorize a weekly ranking.

## Deliverables and stopping point
- Exact-head existing-work reconciliation and source/field readiness matrix.
- Preregistered separate K/DST study design, including waiver-pool sensitivity and cutoff controls.
- Dependency/ownership map: Data evidence, Research study custody, Strategy interpretation principles, separately gated Forecast experiments, Fantasy/TEAM presentation.
- Proposed report showing rank/tier, actual availability status, reason, counterevidence, freshness, uncertainty and next-week context.
- Concrete next execution scope and missing inputs; distinguish existing permitted evidence from sources requiring separate admission.
- State whether the evidence supports preparation of an empirical study, a narrower study or a blocked result.

Stop with a reviewable design/readiness packet. Preserve observations, deterministic derivations, model inference, external consensus, manager judgment and agent reasoning separately. Research results do not themselves activate weekly rankings or recommendations.