## Research question and cutoff

**Player:** KC Concepcion (Cleveland Browns rookie WR; operator shorthand: KCC). Rookies identity: `wr-kc-concepcion`.  
**Opened:** October 26, 2026, America/Toronto.  
**Baseline:** 2026 regular-season Weeks 1–6; breakout observation: Week 7 at Tennessee, October 25.  
**Next test:** Week 8 at Pittsburgh, November 1.  
**Horizon:** Week 8 preparation and postgame review, then rest-of-season tracking through Week 17.

**Did Week 7 reveal a repeatable fantasy role for Concepcion, or mainly a favorable efficiency outcome within an existing role?** Separate target/route access, what he creates with the ball, quarterback/play design/opponent effects, and fantasy points.

Joe identified the breakout and requested this investigation. Our working hypothesis is that sustained target involvement plus separation/after-catch capability could support a regular PPR starter. That is a hypothesis to test, not a frozen operator prediction that he will become a particular WR tier.

## What TIBER-Rookies already contributes

Read-only snapshot: main at [`19a4fc606203`](https://github.com/Prometheus-Frameworks/TIBER-Rookies/commit/19a4fc6062035ab9edda53422685d172e4cab3c8).

- The [promoted postdraft-v0 export](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/19a4fc6062035ab9edda53422685d172e4cab3c8/exports/promoted/rookie-alpha/2026_rookie_alpha_postdraft_v0.json) records Cleveland, Round 1, pick 24; **strong short-term fantasy runway** and **strong opportunity insulation**. Its tags include `elite_separator_signal`, `yac_return_value_profile`, and `landing_spot_volatility`.
- That artifact stores a **77.9 postdraft score**, using its frozen **71.9** baseline and a **+6.0** translator adjustment. These are the stored values in this specific postdraft artifact, not an NFL weekly grade, calibrated probability, or a Week 7 model update.
- Its remaining risks explicitly include offensive volatility and the need to revisit team context. The useful prospective connection is whether the tagged skills are translating into stable NFL opportunity despite that environment.
- The [2025 player-stat record](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/19a4fc6062035ab9edda53422685d172e4cab3c8/data/processed/2026_player_stats.json) contains **61 receptions, 919 receiving yards and nine receiving TDs at Texas A&M**, also corroborated by the [official Browns biography](https://www.clevelandbrowns.com/team/players-roster/kc-concepcion/).
- The [college route-profile artifact](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/19a4fc6062035ab9edda53422685d172e4cab3c8/data/processed/wr_route_profiles/wr-kc-concepcion_2025.json) explicitly estimates targets from receptions; screen/deep target rates and depth-tag coverage are unavailable. It therefore cannot establish actual college route deployment, an observed target-earning rate, or NFL separation ability.
- The [Rookies provenance audit](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/19a4fc6062035ab9edda53422685d172e4cab3c8/docs/2026-evidence-summary-provenance-audit.md) cautions against presenting informal all-time/dominator superlatives as verified. We do not use those claims here.

**Interpretation:** Rookies supplies a documented prospect prior and specific questions to test. Its scouting/model tags are not measured NFL separation, proof that Week 7 was predictable, or independent validation of the breakout.

## First six games, then Week 7

Sources: [ESPN individual game rows](https://www.espn.com/nfl/player/gamelog/_/id/4870653/kc-concepcion), cross-checked against the [official Browns game log](https://www.clevelandbrowns.com/team/players-roster/kc-concepcion/). All seven games below had **zero receiving and zero rushing touchdowns**.

| Week | Opponent | Targets | Receptions | Receiving yards | Rushes–yards | PPR points* |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | at JAX | 5 | 4 | 43 | 3–15 | 7.8 |
| 2 | at TB | 6 | 6 | 28 | 1–(-6) | 8.2 |
| 3 | vs CAR | 9 | 2 | 9 | 0–0 | 2.9 |
| 4 | vs PIT | 8 | 5 | 64 | 0–0 | 11.4 |
| 5 | at NYJ | 1 | 1 | 5 | 0–0 | 1.5 |
| 6 | vs BAL | 6 | 4 | 37 | 2–2 | 7.9 |
| **1–6 total** | **6 appearances** | **35** | **22** | **186** | **6–11** | **39.7** |
| **7** | **at TEN** | **10** | **8** | **129** | **3–23** | **23.2** |

*Calculated for this research: one point per reception, 0.1 per rushing/receiving yard, six per rushing/receiving TD and -2 per fumble lost; no bonuses or return scoring. Week 1 includes one lost fumble. These are illustrative PPR scores, not any private league's scoring.

**Baseline interpretation:**

- Weeks 1–6: **5.83 targets, 3.67 catches and 31 receiving yards per appearance**; **5.31 receiving yards per target**. The volume was already present at times: Week 3 brought nine targets, and Week 4 against Pittsburgh produced 5/64 on eight.
- **Week 5 was curtailed by a first-quarter concussion**, per the [October 11 injury report](https://www.nbcsports.com/fantasy/football/player-news/2026-10-11/kc-concepcion-concussion-ruled-out-vs-jets). Retain it in the complete result, but do not interpret one target as an ordinary full-game role collapse. As a labeled sensitivity check, excluding only Week 5 gives 34 targets, 21 receptions and 181 receiving yards in five appearances; this does not establish five unrestricted workloads.
- Week 7 was a modest increase over earlier target highs combined with a much larger efficiency/output jump: **12.9 receiving yards per target** and **152 scrimmage yards**. We have not yet established a step change in routes or target rate per route.
- Through Week 7, the individual rows sum to **30 receptions, 315 receiving yards and 9 rushes for 34 yards**, matching the official Browns totals. ESPN's fetched season-total row still showed the first-six-game subtotal; calculations above use the individual game rows and the official cross-check.

## Week 7 breakout: verified outcome and reported process metrics

Cleveland won **27–24 at Tennessee**. The [official box score](https://www.clevelandbrowns.com/game-day/2026/reg-week7/browns-at-titans/box-score) confirms 8/129 receiving and 3/23 rushing; [NBC's October 25 recap](https://www.nbcsports.com/fantasy/football/player-news/2026-10-25/kc-concepcion-goes-off-in-week-7-win) confirms ten targets.

[Jacob Gibbs's original public post](https://x.com/jagibbs_23/status/2114483884515614763), published October 25 at 6:26 p.m. Toronto time, reports:

| Metric | Week 7 | Evidence qualification |
| --- | ---: | --- |
| Target share | 29% | Gibbs-reported; denominator/method not independently reconciled |
| Avoided tackles | 3 | Gibbs-reported; play-type scope/definition not established here |
| First downs | 7 | Gibbs-reported; receiving-only versus combined scope to confirm |
| Air yards | 110 | Gibbs-reported; targeted air yards, not completed receiving yards |
| Yards after catch | 82 | Gibbs-reported; YAC, not yards after contact or YAC over expected |

Preserve the reported definitions. The official box lists **36 Watson pass attempts**; 10/36 is 27.8%, so we must not label 29% as share of all attempts or reverse-engineer an undocumented denominator. Exclusions/provider conventions may explain the difference, but that remains unresolved.

Do not add 110 air yards and 82 YAC to estimate receiving yards: air yards include incompletions. Raw YAC can reflect open space, blocking and play design as well as individual creation. The three avoided tackles are not enough to claim an elite tackle-breaking rate without a defined opportunity denominator and comparison sample.

The official box also lists **Fannin 6/91, Jeudy 4/21 and Denzel Boston 3/27**. Those players participated; do not assume the breakout required every competing receiver to be absent. Their routes and target shares remain to be collected.

NBC describes slot usage and designed short throws from Deshaun Watson, reports a top-10 neutral pass rate, and offers a weekly top-36 PPR outlook. Treat those as **one analyst's report and projection**, not independent TIBER charting, a recomputed pass-rate measurement or expert consensus. The 23.2 PPR result was achieved without a touchdown.

## Week 8 at Pittsburgh: questions to answer prospectively

The [official schedule](https://www.clevelandbrowns.com/schedule/) lists **November 1 at Pittsburgh**. Week 4's 5/64 on eight targets is a useful same-opponent reference; personnel, health, venue and coverage can still differ.

| ID | Question | Evidence needed / what changes the outlook |
| --- | --- | --- |
| Q1 — Role access | Did Week 7 change his access, and does it persist in Week 8? | Snap counts, routes and team dropbacks with consistent definitions; slot/wide alignment and two-receiver participation. Compare Weeks 1–6, Week 7 and Week 8. More points alone do not establish more access. |
| Q2 — Target earning | Is he a sustained focal point rather than a one-week concentration? | Targets, target share with explicit denominator, targets per route, third-down/red-zone work and target distribution among active teammates. Distinguish more routes from more targets per route. |
| Q3 — Role breadth | Does he earn conventional/intermediate/downfield opportunities as well as designed touches? | Screens, motion, first-read/designed targets, other progressions and target depth where observable. Neither 110 air yards nor short-pass reporting alone resolves this. |
| Q4 — Creation | How much production comes from beating defenders versus favorable access? | Full gain distribution, consistently defined receiving avoided tackles/YAC, blocking, catch location and first available defender. Preserve mixed/uncertain attribution; no independent film charting has occurred for this issue. |
| Q5 — Environment and competition | Can the role survive different coverage, pressure and teammate availability? | Recheck Watson and receiver availability, actual Fannin/Jeudy/Boston involvement, Cleveland pass volume and game state, and Pittsburgh's observed coverage/pressure response. Do not assign an unverified shadow matchup or make a causal claim from one game. |
| Q6 — Fantasy translation | Does opportunity support a usable weekly floor when efficiency normalizes? | Report full PPR/half-PPR results with scoring assumptions, separate TDs/explosives from volume, then revisit Week 8 and ROS tier with confidence and the strongest counterexplanation. |

**Initial judgment, not a point projection:** Concepcion merits a sustained PPR breakout watch and consideration in the WR3/flex conversation. A stable weekly starter case requires repeatable opportunity; a ten-target/129-yard performance by itself does not establish the ROS floor. Actual start/sit, trade and waiver choices still depend on league format, price and alternatives.

## Rest-of-season tracking and decision rules

[Official schedule as read October 26](https://www.clevelandbrowns.com/schedule/):

| Week | Opponent |
| --- | --- |
| 8 | at PIT |
| 9 | at NO |
| 10 | vs HOU |
| 11 | BYE |
| 12 | vs LV |
| 13 | vs CIN |
| 14 | vs ATL |
| 15 | at NYG |
| 16 | at BAL |
| 17 | vs IND |
| 18 | at CIN — outside the initial Week 17 tracking horizon |

Schedule alone is not a strength-of-matchup ranking. Recheck dates, injuries and coverage as each game approaches.

- **Upgrade the repeatable-role thesis:** routes and target earning persist across subsequent games and different opponents, including ordinary passing situations with other receivers available. Repeat high yardage is helpful but not required if the underlying role holds.
- **Hold the thesis open:** opportunity remains strong while catches/YAC/TDs regress. A worse fantasy score can coexist with a healthier role.
- **Downgrade or narrow it:** routes or target earning materially retreat, usage remains dependent on a few manufactured touches, or offensive/availability changes reduce usable volume. State which mechanism changed.
- **Keep inconclusive evidence inconclusive:** unavailable routes, missing advanced metrics, a bye or curtailed participation cannot be scored as a failed role test. One follow-up game is provisional; reassess the rolling multi-game pattern.

Append dated updates; preserve this October 26 baseline and the Week 8 questions. Each update should give the latest actual game/week, Q1–Q6 answers or explicit unknowns, consistent denominators, complete results, thesis change (supported/challenged/unresolved), confidence, alternative explanation and next test. Revisit ROS role/tier rather than extrapolating Week 7's efficiency unchanged.

## Follow-up checklist

- [x] Establish the Rookies prior with pinned source paths and limitations.
- [x] Record every Week 1–6 result, Week 5 injury context and the Week 7 breakout.
- [x] Locate and attribute the original Gibbs post.
- [x] Verify Week 8 opponent and ROS schedule.
- [ ] Add public snap/route/target-quality evidence for Weeks 1–7 when available.
- [ ] Resolve the advanced-metric scopes and target-share denominator where supported.
- [ ] Append Week 8 preparation, availability changes and final postgame comparison.
- [ ] Reassess weekly through Week 17, including a labeled Week 11 bye update.

This issue is an observational research record. It does not change Rookie Alpha, Forecast or any roster.
