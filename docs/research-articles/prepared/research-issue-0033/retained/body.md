## Status and authority
Operator-requested research proposal, posted October 10, 2026. Authorization covers posting this proposal and a linked Rookies coverage issue only. This issue does not authorize data acquisition, code/model changes, experiment execution, promotion, deployment or roster actions.

## Question
What can explain the gap between Marvin Harrison Jr.'s elite prospect expectations and his NFL results through 2026 REG Week 4, and which explanations can TIBER actually distinguish with available evidence?

This is a proposed descriptive, retrospective case study, not a causal experiment or prediction of a trade-driven rebound. The trade report motivates the timing; it does not establish the cause of his performance.

## Verified starting point
Read-only inspection of TIBER-Rookies at `e78df9df32adb6568ccfbe8ff2b7210d9d99e8a6` found:
- MHJ absent from the 15-player 2024 seed, prospect-context and college-production inputs, and published Rookie Alpha export.
- A historical athletic record exists, with SPORQ `DNQ` and testing fields missing. Missing testing is not evidence of poor athleticism.
- A 2024 NFL fantasy-outcome row exists; it does not supply a complete current career record.
- `data/processed/2024_draft_results.json` is empty.
- No original TIBER MHJ prospect grade was established.

Anchors:
- [2024 seed](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/e78df9df32adb6568ccfbe8ff2b7210d9d99e8a6/data/raw/2024_real_seed_pool.json)
- [2024 Alpha export](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/e78df9df32adb6568ccfbe8ff2b7210d9d99e8a6/exports/promoted/rookie-alpha/2024_rookie_alpha_predraft_v0.json)
- [Athletic record](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/e78df9df32adb6568ccfbe8ff2b7210d9d99e8a6/data/historical/sporq_raw_wr.tsv)
- [Official Cardinals biography](https://www.azcardinals.com/team/players-roster/marvin-harrison-jr/) establishes selection at No. 4 in **2024**, not 2023.
- [October 10 trade reporting](https://www.thescore.com/nfl/news/3619927/report-cardinals-finalizing-deal-to-trade-harrison): reported trade being finalized and Sunday inactivity; destination/terms not established in the inspected report. Reverify before any later study.

## Proposed design
1. **Qualify sources and coverage first.** Inventory eligible college and NFL evidence, identities, season/week boundaries, source rights, retrieval dates, correction status and missing operands. Separate original contemporaneous expectations from present-day reconstruction.
2. **Reconstruct the prospect baseline.** College production and team shares, age/declaration context, documented deployment and draft capital; testing remains unknown where unavailable. Separate pre-draft evidence from post-draft facts and NFL outcomes. Any newly computed grade is retrospective under a pinned model, never an original 2024 TIBER forecast.
3. **Build the career timeline.** Full 2024 and 2025 regular seasons, then 2026 Weeks 1–4. Track games/availability, snaps, routes, targets, team target share, receptions, yards, touchdowns and fantasy output where qualified. State scoring rules and denominators. Do not equate targets with routes or team dropbacks.
4. **Decompose opportunity and conversion.** Where evidence allows, inspect routes per team dropback, targets per route, catch rate, yards per target/route and touchdown dependence. Compare active-game rates as well as season totals.
5. **Inspect context.** QB availability/performance, team passing volume, competing target earners, deployment, coaching/scheme and opponent context. Use game logs, qualified play-level evidence and bounded film notes; distinguish observed changes from explanations.
6. **Use a defined comparison cohort.** Pre-specify eligible 2024 WR peers and, if justified, a separately defined historical high-capital WR group. Disclose missingness, sample size and selection bias; do not select peers based on NFL success.
7. **Freeze the pre-trade checkpoint.** Any later destination analysis is a separate extension with a new cutoff. A before/after comparison cannot by itself isolate the trade's effect.

## Competing explanations to test
- Opportunity contraction or deployment mismatch.
- Conversion/efficiency limitations despite opportunity.
- Availability and surrounding offense changes.
- Prospect expectations or model compression omitted relevant translation factors.
- Multiple interacting causes, or insufficient evidence to separate them.

Each explanation needs supporting observations, counterevidence and unresolved confounders. No unsupported claims about effort, character, injury causation or coaching intent.

## Proposed deliverables and acceptance
- Source/coverage ledger and explicit blockers.
- Separate prospect baseline and season/weekly career tables.
- Evidence-versus-interpretation matrix for competing explanations.
- Peer comparison with reproducible definitions.
- A conclusion that answers what is established, what remains ambiguous and the smallest justified next investigation.
- Independent review of calculations, cutoff discipline and conclusions before treating the study as complete.

Rookies owns prospect inputs/grades; Data owns canonical evidence qualification; Research owns synthesis. ROP/Teamstate/Unit State may inform later interpretation only where eligible outputs already exist or separate execution authorization is granted. No Forecast training, source-rights expansion or automated start/sit/trade action is proposed.

## Dependency
[Rookies #301](https://github.com/Prometheus-Frameworks/TIBER-Rookies/issues/301) tracks the 2024 class census, missing profiles and retrospective grading needs. Existing [Rookies #242](https://github.com/Prometheus-Frameworks/TIBER-Rookies/issues/242) covers missing historical post-draft grades; avoid duplicating its implementation lane.

**Smallest proposed next step:** read-only source/coverage qualification and a bounded execution proposal, with ownership checked before any implementation.
