# Marvin Harrison Jr.: prospect-to-NFL translation through 2026 Week 4

**MHJ's 2025 season-total decline is largely a played-game-count story; the early 2026 decline is substantially sharper even on a per-game basis.** That establishes a disappointing trajectory relative to his college/draft credentials, but the available evidence cannot isolate receiver ability, route/deployment choices, quarterback behavior or their interaction. No original TIBER MHJ grade exists in the inspected Rookies baseline, so this is not a demonstrated TIBER prediction failure.

This is a manual, descriptive candidate for [Research #33](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/33), prepared after Joe authorized execution on October 10, 2026. Independent review is pending. It is **not** a governed Research attempt, activation, independent review, terminal seal or promoted claim. No Stage 1 researcher, downstream producer, Forecast model or roster action is activated.

## Checkpoint and source qualification

The NFL observation window is **2024 REG**, **2025 REG**, and **2026 REG Weeks 1–4**, ending October 4, 2026. Postseason and preseason are excluded. Trade reporting motivates the timing; destination, terms and any subsequent performance are outside this study. The supplied draft-year premise is corrected: MHJ was selected fourth overall in **2024**.

The [evidence ledger](evidence_v0.json) retains factual observations, source URLs, current retrieval times, publisher-byte hashes where captured, qualification states and missingness. Sources are official school, NFL and Cardinals records, with one separately disclosed basic-stat secondary corroboration. No proprietary grades, paywalled analysis, licensed route charts or inferred film judgments enter the evidence or Rookies model.

These are current retrievals of historical facts, not immutable contemporaneous 2024 forecast receipts. The observations are frozen locally for offline calculation; a future re-fetch may encounter corrections. Public factual candidate status does not establish canonical Data admission or independent review.

## Prospect baseline

| College season | Games | Receptions | Receiving yards | Receiving TDs |
|---|---:|---:|---:|---:|
| 2021 | 13 | 11 | 139 | 3 |
| 2022 | 13 | 77 | 1,263 | 14 |
| 2023 | 12 | 67 | 1,211 | 14 |

The [Ohio State record](https://ohiostatebuckeyes.com/sports/football/roster/marvin-harrison-jr-/5684) documents consecutive unanimous All-American seasons and the 2023 Biletnikoff Award. The [Cardinals biography](https://www.azcardinals.com/team/players-roster/marvin-harrison-jr/) supplies the college season/game reconciliation. These facts support a strong college-production baseline. Selection at No. 4 is a separate draft-day investment fact; it is not substituted for a pre-draft expected-capital operand.

At Rookies base `e78df9df32adb6568ccfbe8ff2b7210d9d99e8a6`, MHJ is absent from the 15-player seed, prospect context, college production and Alpha export. His partial historical athletic row is `DNQ`, with no timed/jump operands. Missing testing is not evidence of poor athleticism. No qualified team-share, route/alignment or separation sample is admitted here, and no original TIBER expectation record is recovered.

[Rookies #301](https://github.com/Prometheus-Frameworks/TIBER-Rookies/issues/301) now has an isolated 78-subject census/coverage candidate and a sourced MHJ college card, with draft-day facts separated. It flags raw-production contradictions in 12 of the original 15 subjects. Qualified retrospective grades remain unavailable until inputs and normalization lineage are repaired. A newly reconstructed grade would never become evidence of what TIBER predicted in 2024.

## Career timeline and matched windows

| REG window | Games played | Rec | Yards | TD | Yards/game | Receiving PPR proxy/game |
|---|---:|---:|---:|---:|---:|---:|
| 2024 full season | 17 | 62 | 885 | 8 | 52.1 | 11.68 |
| 2025 full season | 12 | 41 | 608 | 4 | 50.7 | 10.48 |
| 2026 Weeks 1–4 | 4 | 5 | 85 | 1 | 21.3 | 4.88 |

The [NFL career record](https://www.nfl.com/players/marvin-harrison-jr/stats/career) and receiving game logs are the factual source. Games means **games played**, including zero-catch and partial-snap appearances, rather than healthy full-game exposure or games with a fantasy-stat row. All played-game receiving totals reconcile to the weekly observations: 17, 12 and 4.

The proxy is `receptions + 0.1 × receiving yards + 6 × receiving TDs`. It excludes rushing, two-point conversions, fumble penalties and returns, and is **not complete fantasy PPR scoring**. This keeps the comparison reproducible from the admitted receiving facts; rushing usage makes it an especially incomplete fantasy measure for some peers.

The existing Rookies historical 2024 outcome uses 16 games for MHJ. The official career and receiving logs show 17, including a zero-catch Week 6 appearance. Its denominator is not adopted. The study does not edit the old outcome artifact.

A matched first-four-week comparison avoids treating a partial season as a full season:

| Weeks 1–4 | Rec | Yards | TD | Yards/game |
|---|---:|---:|---:|---:|
| 2024 | 15 | 243 | 4 | 60.8 |
| 2025 | 16 | 208 | 2 | 52.0 |
| 2026 | 5 | 85 | 1 | 21.3 |

The 2026 weekly receiving lines are 1/33/0, 0/0/0, 3/40/0 and 1/12/1. Four games are a small sample, with different opponents and offense context each year. They establish realized early-season contraction, not a stable estimate of receiver talent or the effect of a future trade.

Full season and weekly tables: [seasons CSV](mhj_seasons_v0.csv), [weekly CSV](mhj_weekly_v0.csv). Blank 2025 log rows are retained as unavailable receiving observations and are not inferred as played; the biography documents absences and partial appearances. No claim about medical causation or healthy route exposure is derived from the game count.

## Decomposing totals and conversion

From 2024 to 2025, receiving yards fall **277** (885 to 608). A symmetric two-factor accounting decomposition of `played games × yards per played game` gives:

| Accounting component | Yard change |
|---|---:|
| Played-game count: 17 to 12 | −256.81 |
| Yards per played game: 52.06 to 50.67 | −20.19 |
| Total | −277.00 |

The game-count component is about **92.7% of the arithmetic decline**. This averages both replacement orders and is an accounting identity, not a causal estimate of injuries' effect. Played-game rates still mix full and limited appearances; routes/snaps could change beneath nearly equal yards/game.

The qualified aggregate target observations add a useful distinction:

| REG window | Targets | Targets/played game | Catch rate | Yards/target |
|---|---:|---:|---:|---:|
| 2024 | 116 | 6.82 | 53.4% | 7.63 |
| 2025 | 73 | 6.08 | 56.2% | 8.33 |
| 2026 Weeks 1–4, provisional | 13 | 3.25 | 38.5% | 6.54 |

Sources for 2024/2025 are [Cardinals aggregate target reporting](https://www.azcardinals.com/news/trey-mcbride-can-lead-cardinals-passing-game-tight-end-marvin-harrison-michael-wilson) and the [retained NFL 2025 receiving table](https://www.nfl.com/stats/player-stats/category/receiving/2025/REG/all/receivingyards/ASC?aftercursor=AAAB2QAAAdlAgvgAAAAAADFleUp6WldGeVkyaEJablJsY2lJNld6WXdOeXdpTXpJd01EVXdORGt0TlRReU1pMDRNRFV3TFdFNFpqZ3RaalV5TVRBeE16VmhOR0l6SWl3eU1ESTFYWDA9). Fewer targets per played game coexist with modestly better target-level conversion in 2025. That does not support a simple story of across-the-board conversion deterioration that season. Aggregate catch rate and yards/target depend on target quality and route depth; neither measures separation or quarterback accuracy by itself.

**The 2026 target receipt remains provisional.** The indexed primary NFL row reports 5 catches, 85 yards and 13 targets, and [public basic stats](https://www.statmuse.com/nfl/ask/how-many-targets-has-marvin-harrison-jr.-dropped) corroborate 13. Direct paginated NFL requests returned adjacent/repeated pages rather than a matching retained row. The ledger records that limitation and does not claim a direct publisher-byte hash for the indexed observation. The exploratory target decomposition in `results_v0.json` is labeled provisional and cannot support a promoted claim. Removing this value leaves the season/weekly receiving findings and peer comparison unchanged, while making 2026 target conversion and opportunity decomposition unavailable.

Without qualified routes and team dropbacks, the study cannot compute targets/route, routes/dropback, yards/route or exact team target share. Targets are not routes or snaps. Even if 13 is independently confirmed, the study cannot distinguish fewer routes, fewer throws on similar routes, lower-quality throws, or receiver-level limitations.

## Comparison cohort

The cohort is **all seven 2024 round-one WRs**, defined from draft facts before the comparative calculations: MHJ, Nabers, Odunze, Brian Thomas Jr., Worthy, Pearsall and Legette. This is retrospective cohort specification, not prospective preregistration. Players are not selected by NFL success.

| Subject (draft pick) | 2024 yards/game (G) | 2025 yards/game (G) | 2026 W1–4 yards/game (G) |
|---|---:|---:|---:|
| MHJ (4) | 52.1 (17) | 50.7 (12) | 21.3 (4) |
| Nabers (6) | 80.3 (15) | 67.8 (4) | 52.0 (4) |
| Odunze (9) | 43.2 (17) | 55.1 (12) | 58.3 (4) |
| Brian Thomas Jr. (23) | 75.4 (17) | 50.5 (14) | 26.3 (4) |
| Worthy (28) | 37.5 (17) | 38.0 (14) | 33.3 (4) |
| Pearsall (31) | 36.4 (11) | 58.7 (9) | Unavailable |
| Legette (32) | 31.1 (16) | 24.2 (15) | 32.0 (2) |

Official player career sources are individually bound in the ledger and [peer CSV](peer_seasons_v0.csv). Pearsall's retained source has no 2026 row; it is not converted to zero or silently dropped from membership. MHJ ranks third of seven in 2024 receiving yards/game, fourth of seven in 2025, and sixth among the six observed 2026 rows. Nabers' four-game 2025 denominator and Legette's two-game 2026 denominator particularly limit comparisons.

This small cohort has different quarterbacks, roles, injuries and surrounding offenses. It provides context for realized receiving volume, not a controlled counterfactual or calibrated expectation for a No. 4 prospect. No broader historical high-capital comparison is claimed without separately defining and acquiring it.

## Evidence versus explanations

| Explanation | Supporting observation | Counterevidence or limit | Current assessment |
|---|---|---|---|
| Availability/limited exposure | 17 to 12 played games; season yards/game nearly unchanged in 2025 | Played games conceal snap/route differences; does not explain the matched-window 2026 decline alone | Strong arithmetic relevance in 2025; causal share unresolved |
| Opportunity/deployment contraction | 2025 targets/game lower; provisional 2026 count suggests a further drop | No routes or dropbacks; target count cannot locate the cause of the reduction | Plausible, not isolated |
| Conversion limitations | Provisional 2026 catch rate and yards/target lower | Both aggregate rates improve in 2025; 2026 has only 13 provisional targets and unknown throw difficulty | Mixed across seasons; ability claim unsupported |
| Surrounding offense and target competition | Cardinals reporting documents Brissett/LaFleur context in early 2026; McBride had 147 targets versus MHJ's 116 in 2024 | No QB-conditioned exposure, team-volume denominator or opponent adjustment | Relevant context, not a measured causal explanation |
| Prospect/model omitted translation factors | Strong college production has not become consistently elite realized NFL volume | No original MHJ TIBER grade; missing licensed/qualified route evidence; selective legacy class | Model miss cannot be tested; coverage/input integrity failure is established |

[Cardinals early-2026 reporting](https://www.azcardinals.com/news/marvin-harrison-jr-knows-noise-expectations-but-sticks-to-process) provides attributed coaching/offense context, not independently reviewed film evidence. Its route-chart counts and commentary are not imported as model features. No finding asserts deficient effort, character, deliberate coaching intent or injury causation.

## What follows from this candidate

The justified conclusion is narrower than “elite prospect became a bad receiver”: production fell short of an elite investment narrative, 2025 totals overstate the deterioration in played-game receiving rate, and the first four 2026 games show a larger realized decline. Available aggregates leave both opportunity and conversion explanations open. A trade rebound cannot be inferred from these observations.

The next investigation should independently retain the 2026 target row/gamebook reconciliation, qualify public or licensed snap/route/dropback denominators, and review a declared film sample covering both targeted and untargeted routes. Stratify by quarterback, alignment and route depth only when those operands are sourced. Rookies should first repair production/normalization provenance and recover contemporaneous expectations if any exist. A post-trade extension needs a new cutoff and explicit confounders; before/after performance alone would not identify the trade's effect.

## Reproduction and review

```bash
python3 docs/studies/mhj-career-2026w4/calculate.py
python3 docs/studies/mhj-career-2026w4/calculate.py --check --self-test
```

The standard-library calculator performs no network access and writes only this study directory. It rejects duplicate observations, imputed unavailable rows and future-cutoff leaks; reconciles weekly receiving counts with official season totals; computes matched windows; and checks accounting components sum to the observed change. Inputs and results are hash bound in [results](results_v0.json).

Independent review is still required for source authenticity/rights, extracted facts, cutoff discipline, cohort/missingness, calculations and conclusions. Research #33 remains open. No independent reviewer or completed governed lifecycle is invented for this manual candidate.
