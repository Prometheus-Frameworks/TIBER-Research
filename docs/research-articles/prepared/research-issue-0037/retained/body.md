## Status and authority

**OPERATOR-APPROVED ISSUE INTAKE — STUDY DESIGN / READINESS DIRECTION ONLY; NO STUDY EXECUTION OR SOURCE ADMISSION ACTIVATED.**

Joe approved posting the paired Research and Strategy issues on October 13, 2026. This records the proposed investigation and its boundaries. It does not authorize a live Research run, external acquisition, backfill, paid access, branch/code work, producer execution, promotion, merge, deployment or downstream activation. No assignee, agent command or automation label is requested.

**Strategy companion:** [TIBER-Strategy #12 — 2026 draft-cost lessons v0](https://github.com/Prometheus-Frameworks/TIBER-Strategy/issues/12).

## Research question

> What did a player's draft price require to go right, what actually happened in Weeks 1–4, what did Week 5 add, and which explanations survive the counterexamples?

The objective is more than a hits/busts list: distinguish acquisition cost, delivered production, availability, observed opportunity, conversion and the quality of reasoning available before the draft. A good outcome is not automatically a good ex-ante decision or a repeatable edge.

## Operator-nominated seed cases

The operator nominated Christian Watson, Kenneth Walker III and Matthew Golden as possible major outperformers, and Omarion Hampton and Travis Etienne Jr. as possible underperformers relative to draft price.

These are **hypothesis-generating nominations, not verified study labels or the validation population**. The preceding conversational statistics and comparisons are leads, not admitted Research inputs. Do not import exact totals, player joins or hit/bust grades without source and scoring reconciliation. Names are display context, never canonical cross-provider identity.

## Proposed scope and clocks

- Season: **2026 regular season**.
- Q1: **Weeks 1–4**, fixed as its own window.
- Extension: **Week 5**, reported separately; also show a clearly labeled cumulative W1–5 view where coverage supports it.
- Initial target market: **12-team, full-PPR, one-QB redraft**. The selected source's actual population must be established rather than assumed to match this target. Mock, managed-redraft, best-ball, superflex and consensus products remain distinct.
- Proposed universe: all QB/RB/WR/TE players with source ADP **at or before pick 180** in one eligible frozen snapshot. Exclude kicker and defense. Preserve injured players, nonparticipants and unresolved identities in the population/coverage ledger; do not make the sample look better by dropping them.
- Preserve actual games, byes and availability separately from calendar-week windows. Missing observations are not zero.

The protocol is formulated after Week 5: W1–4 and W5 are both retrospective. Week 5 is not an out-of-sample validation period. Any Week 6-or-later prospective check needs its own recorded hypothesis, eligibility, measures and cutoff frozen before the relevant events; merely writing this issue does not preregister a live test.

## Draft-price evidence and existing work

An earlier read located a retained **early-August prototype** at:

[`TIBER-Fantasy/data/adp/adp_snapshot_2026_ppr_12tm_2026-08-07.json`, pinned commit `c4adf6effdeff0c6a68f92aece759b03fe575b29`](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/blob/c4adf6effdeff0c6a68f92aece759b03fe575b29/data/adp/adp_snapshot_2026_ppr_12tm_2026-08-07.json).

Treat it as a candidate reference requiring qualification, not a promoted market artifact or closing ADP. First determine whether a later eligible retained preseason snapshot exists. Freeze the baseline-selection rule without choosing whichever snapshot best supports the outcomes. A late-preseason snapshot and the early-August snapshot may be separate sensitivity lanes, not a silently spliced history. No current-season price may be substituted for a preseason observation.

Reuse the existing source/contract work rather than open a duplicate market pipeline:

- [Data #235 — dated redraft ADP snapshot contract](https://github.com/Prometheus-Frameworks/TIBER-Data/issues/235).
- [Data #251 — FFC source qualification](https://github.com/Prometheus-Frameworks/TIBER-Data/issues/251).
- [FFC permission addendum, August 19, 2026](https://github.com/Prometheus-Frameworks/TIBER-Data/blob/main/docs/audits/dated-redraft-adp-ffc-permission-addendum-2026-08-19.md).

The addendum distinguishes permitted storage/display from unresolved automated-access and public-redistribution dimensions. Reconcile the current record for the exact intended use; neither repeat a superseded blanket permission blocker nor convert display permission into an ingestion/public-repository grant.

Record source/product, market definition, season, scoring, league size, draft type, calculation window, source/as-of and availability clocks, retrieval time, sample size if supplied, source-native IDs, identity mapping, immutable references/digests where permitted, correction status and rights/purpose eligibility. Unknown fields stay unknown. An expert rank is not ADP; a provider rank is not a points forecast.

## Measurement plan

### Delivered outcomes

Before calculation, bind a complete scoring contract. Proposed generic reference: one point per reception; 0.1 per rushing/receiving yard; six per rushing/receiving touchdown; 0.04 per passing yard; four per passing touchdown; minus two per interception and fumble lost; two per applicable credited two-point conversion; no yardage bonuses or return-yard scoring. Resolve all other scoring categories explicitly before execution. Label this generic-policy scoring, not any specific Sleeper league's official result.

For each player and observation window show:

- component fantasy points and total delivered points;
- actual appearances and points per appearance, with the appearance rule declared;
- per-week production and concentration in the largest week;
- byes, verified nonappearance/availability and unresolved evidence;
- carries, credited targets, receptions and eligible team/opportunity shares.

No appearance means PPG is undefined, not zero. A verified nonappearance can support zero delivered player points, while an unknown/missing stat record cannot. An early injury appearance remains visible rather than silently excluded. Do not use only PPG and erase availability losses.

Report shares as summed eligible numerators divided by summed eligible denominators, not an unweighted mean of weekly percentages. Credited team targets and pass attempts remain different quantities. Aggregate only compatible, sufficiently covered records; label partial windows and do not extrapolate them into full Q1.

### Relative-to-price comparison

Keep absolute performance beside a same-position, similar-cost benchmark. Proposed deep-dive peer rule: the three same-position players immediately above and three below each anchor in the same eligible snapshot/population, excluding the anchor. Resolve ADP ties deterministically with the source-native ID; disclose edge cases and insufficient coverage. Freeze the selector before inspecting comparative outcomes. If an anchor is outside the defined universe, put it in a separately labeled case appendix rather than silently expanding the cohort.

Show peer total-points and PPG distributions with contributing counts and availability. Peer-relative differences are **descriptive comparisons**, not ADP-implied expected points or a causal estimate. Do not subtract an overall ADP rank from a positional finish or divide points by pick number as a value score.

Report continuous differences before choosing categorical labels. Any later hit/bust thresholds must be versioned, declared and sensitivity-tested; do not optimize a threshold until the seed cases receive the desired labels.

## Explanatory hypotheses and counterexamples

1. **Improvement already priced in:** did a costly acquisition require an optimistic role/development outcome while a cheaper acquisition could return value under more ordinary improvement? ADP alone cannot establish what managers believed. Require dated preseason expectations or leave the explanation hypothetical.
2. **Opportunity realization versus conversion:** separate changes in useful work from yards, reception conversion and touchdowns. Strong efficiency may be real, but persistence is not established by a short sample. Touchdown removal is an accounting sensitivity, not an xFP model or forecast.
3. **Performance versus availability:** explain delivered shortfalls without treating injury absence as proof of a bad pre-draft process. Do not erase injuries from the full-population outcome audit.

Include failed cheap developmental candidates, expensive candidates that justified their cost, stable performers and contradictory cases—not just famous successes and disappointments. Separate retrospective explanation from evidence that a preseason selection method could have identified the opportunity. Alternative explanations and insufficient evidence are valid findings; do not infer causality from short-window association.

A full-population cost/outcome screen may precede deeper evidence work for the five seeds and their deterministically selected peers. That does not authorize expanded producer cohorts. Single-player results do not validate roster-construction strategies: those need complete realistic draft paths, lineup requirements, replacement options and separate scope.

## Evidence ownership and partial coverage

Use [Research #31 — Q1 checkpoint](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/31) as an existing reconciliation reference, not proof of complete W1–4 player coverage. Build a player × week coverage matrix with source, exact identity, custody, review, purpose and missing-witness status. Preserve successful prior runs and their limits.

**Week 3 remains paused under the operator's existing direction.** This issue does not restart private-access repair, rerun ROP/Teamstate, reactivate the nightly queue or dispatch another producer. Route concrete missing evidence to its existing owner for a later decision. Public-source research may only be used under a separately eligible scope and must not be called qualified ROP output.

The descriptive first pass does not require a finished xFP model. A later qualified xFP method may improve opportunity/conversion separation; no undocumented proxy, archived FORGE component or Forecast mutation is required here. Routes, snaps, first reads, air yards and scoring-area usage remain unavailable unless independently supported for the exact period and purpose.

Research retains the analytical packet and provenance. Strategy #12 receives only a separately reviewed, visibility-eligible lesson handoff; no player tables, source rows or private league details are copied into Strategy. Source admission, research review and downstream promotion remain separate decisions.

## Proposed deliverables after separate activation

1. Source/rights/identity/scoring readiness matrix with the chosen preseason baseline and exact gaps.
2. Full-population coverage and cost/outcome table, distinguishing Q1, W5 and cumulative W1–5.
3. Seed-case and fixed-peer comparisons with opportunity, conversion and availability decomposition.
4. Hypothesis/counterexample ledger, including unsupported and unchanged findings.
5. Player-free candidate lesson handoff to Strategy #12 and a genuinely future test proposal where useful.
6. Reproducible calculation references, limitations and independent exact-output review.

Do not publicly commit raw market observations, private evidence, credentials or restricted output bytes merely because this issue is public.

## Acceptance criteria

- [ ] Exact market, snapshot, population, clock and scoring contract are bound.
- [ ] Preseason baseline is not represented as closing ADP unless supported.
- [ ] Every eligible player is retained in the coverage denominator, including injuries and unresolved records.
- [ ] W1–4 and W5 remain distinct retrospective windows; future-test claims are cutoff-safe.
- [ ] Identity, source rights, purpose and output visibility are qualified.
- [ ] Delivered points, PPG, appearances, byes and missingness reconcile.
- [ ] Peer selection is reproducible and all contributing counts are visible.
- [ ] Price, opportunity, conversion, availability and ex-ante process remain separate.
- [ ] Negative cases and alternative explanations are retained; no universal principle is claimed from the seeds.
- [ ] No xFP validity, ROP coverage, producer execution or roster-strategy proof is implied.
- [ ] Independent review binds the exact eventual output; a null finding can be a completed study.
- [ ] Strategy handoff is separately reviewed and creates no automatic ontology/consumer activation.

**Current stop: paired issue intake recorded; study not executed.**

Smallest proposed next slice: a bounded retained-source and coverage readiness packet that selects the exact preseason reference and scoring scope, identifies reusable weekly evidence, and lists the minimum unresolved decisions. Execution, source calls, new artifacts and repository files require a later explicit activation; this issue does not dispatch them.