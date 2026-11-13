## Question and cutoff

**Opened October 26, 2026 · America/Toronto. Player: Malik Willis, Miami Dolphins QB.**

**Has Willis developed a repeatable rushing contribution, and how much comes from called quarterback runs versus scrambles, short-yardage keepers and game-ending kneels?**

[Ryan Heath's public Fantasy Points Data thread](https://x.com/RyanJ_Heath/status/2114536259742044372) identifies a Week 5 change in rushing attempts and yards. We independently checked the dated game log, Week 7 official box and play-by-play. This is a public football study, not a projection, league-specific recommendation or model activation.

Related: [Miami receiving audit #56](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/56). QB rushing, passing volume and the Douglas/Bell/Washington/Coleman/Dulcich distribution belong to the same offense; do not treat them as independent causal experiments.

## Reconciled rushing baseline

Source: [ESPN's dated 2026 game log](https://www.espn.com/nfl/player/gamelog/_/id/4242512/malik-willis). Week 7 also matches the [official Jets game box](https://www.newyorkjets.com/game-day/2026/reg-week7/dolphins-at-jets/box-score) and [Dolphins recap](https://www.miamidolphins.com/news/game-recap-dolphins-secure-28-25-victory-over-jets-in-divisional-matchup).

| Week | Opponent | Rush attempts | Rush yards | Rush TD | Sample context |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | at LV | 6 | 39 | 1 | Retained in complete baseline. |
| 2 | at SF | 2 | 6 | 0 | Retained. |
| 3 | vs KC | 9 | 56 | 0 | Earlier high-attempt game is counterevidence to a completely new Week 5 phenomenon. |
| 4 | at MIN | 2 | 11 | 0 | Low-volume result is retained; opponent mechanism not established. |
| 5 | vs CIN | 8 | 74 | 1 | First game in the reported recent window. |
| 6 | BYE | — | — | — | No player-game observation; not zero attempts/yards. |
| 7 | at NYJ | 8 | 37 | 1 | Second game in the recent window. |
| **W1–4** | **4 games** | **19 / 4 = 4.75 per game** | **112 / 4 = 28.0 per game** | **1** | Displayed attempts round to 4.8. |
| **W5–7** | **2 games** | **16 / 2 = 8.0 per game** | **111 / 2 = 55.5 per game** | **2** | Two actual games separated by a bye. |

These count-based rushing averages reproduce Heath's reported change. His fantasy-points averages and positional ranks have **not** been independently reconciled under an identified scoring system and comparison pool; retain them as source-reported context.

The recent yardage window is sensitive to a single **39-yard Week 5 run**, which supplies 35.1% of its 111 rushing yards. That play remains in the result. This is a concentration observation, not grounds to erase his best play, infer a talent level or forecast 55.5 yards every week.

ESPN's general profile search result returned totals inconsistent with its dated game-log sample during discovery. We use the six dated rows above, whose rush totals sum to 35 attempts/223 yards/3 TD, rather than mixing the profile summary into this baseline.

## Week 7 mechanism: eight carries are not eight called runs

We inspected the [complete ESPN play log](https://www.espn.com/nfl/playbyplay/_/gameId/401873015). The classifications below retain the source's wording. They are **play-by-play labels**, not independently charted offensive intent.

| Quarter / clock | Source description class | Rush yards | Notes |
| --- | --- | ---: | --- |
| Q1 4:39 | Labelled scramble | 12 | 3rd-and-9. |
| Q2 11:36 | Labelled scramble | 11 | 3rd-and-13; offensive holding declined, play counts. |
| Q2 3:14 | Labelled scramble | 5 | 4th-and-2 conversion. |
| Q2 2:00 | Labelled scramble | 7 | 2nd-and-6. |
| Q2 0:06 | Labelled scramble | 2 | Rushing TD from second-and-goal. |
| Q4 2:00 | Up-the-middle keeper | 2 | 4th-and-1 conversion; official Dolphins recap also identifies a quarterback keeper. |
| Q4 1:13 | Kneel | -1 | Retained in official rushing totals. |
| Q4 0:39 | Kneel | -1 | Retained in official rushing totals. |
| **Total** | **5 labelled scrambles + 1 keeper + 2 kneels** | **37** | Matches official 8/37/1 rushing line. |

**Derived non-kneel slice:** six attempts for 39 yards. Keep it beside the complete 8/37 result; do not replace official totals. The five labelled scrambles produced 37 yards.

**Initial inference:** Week 7 supports a mobility/scramble contribution and meaningful short-yardage use. It does **not** establish that Miami installed an eight-attempt designed-run package. Whether the play labels capture actual intent, or scrambling reflects pressure, coverage, protection or decisions, requires additional evidence.

The [official Miami recap](https://www.miamidolphins.com/news/game-recap-dolphins-secure-28-25-victory-over-jets-in-divisional-matchup) also verifies **14/21 passing, 208 yards and two passing TD**, plus the rushing TD. Douglas had two catches/70 yards/two TD. Only 21 team pass attempts and one long scoring connection materially affect the interpretation of this fantasy result.

## Competing explanations

1. **Persistent scramble opportunity and willingness:** Willis consistently uses available space and extends possessions, supporting rushing even without a large called-run package.
2. **Called QB-run/keeper expansion:** coaches deliberately add recurring run concepts or short-yardage work. Plausible, but the headline carry count does not prove it.
3. **Opponent/game-state concentration:** a few favorable escapes, third/fourth-down situations or scoring plays inflate a short window.
4. **Broader offensive improvement:** protection, receivers or passing decisions change alongside rushing. This could improve team efficiency, reduce scramble needs, change pass volume or create different scoring chances; effects are not predetermined.

These explanations can coexist. QB rushing is an observed channel, not proof of a single coaching change.

## Prospective next-game and ROS tracking

**First test: Week 8 vs New England, November 1**, identified in the [official Dolphins recap](https://www.miamidolphins.com/news/game-recap-dolphins-secure-28-25-victory-over-jets-in-divisional-matchup). The opponent/date are fixture facts; no defensive-strength or QB rushing projection is established here.

Inspect the next two actual team games, then reassess a multi-game pattern. Keep all outcomes, including a disappointing or curtailed one, and label changed health/role regimes.

| ID | Measure to retain | What would discriminate? |
| --- | --- | --- |
| MW1 — Rushing type | Official attempts/yards/TD; labelled scrambles, keepers, kneels, other designed-run evidence; uncertain events separate. | Non-kneel rushing recurs without requiring repeated exceptional gains. Called-run expansion requires actual design evidence. |
| MW2 — Exposure | Pass attempts, sacks, supported true dropbacks, score/down/distance and scramble opportunities. | Distinguish more passing exposure from greater scramble propensity. Attempts + sacks alone exclude scramble dropbacks. |
| MW3 — Decisions/pressure | Qualified pressure/containment evidence, available lanes and selected escapes/throws. | Representative target and non-target evidence can distinguish pressured escapes from deliberate use of open space. No causal assignment from a box score. |
| MW4 — Valuable situations | Inside-10/inside-5 QB attempts, scrambles and keepers; team scoring possessions. | Continued opportunity supports the rushing channel even if TD conversion changes; no team chances means goal-line preference may be untested. |
| MW5 — Passing tradeoff | Complete passing results and receiving allocation, linked to #56. | Avoid calling a good fantasy day broad passing development, or treating more QB rushing as automatic benefit to receivers. |
| MW6 — Fantasy translation | Explicit QB scoring, turnovers, bonuses and full outcome. | Compare rushing and passing components without treating PPR as a complete QB scoring specification. |

**Strengthen a repeatable rushing-support thesis:** meaningful non-kneel work persists across opponents and ordinary game situations, with stable QB availability and observable opportunities.

**Challenge it:** non-kneel use repeatedly retreats in comparable full games, role changes, or recent output proves dependent on isolated gains/TDs without recurring access.

**Keep unresolved:** health-limited/inactive appearance, changed starter, missing classifications or too little exposure. Do not convert missing measurements into zero.

## Follow-up record

Each dated update should include source/as-of, actual availability, every rush and its class or uncertainty, full and non-kneel totals, passing exposure and receiving context, MW1–MW6 status, strongest counterexplanation, changed ROS interpretation and next discriminating test.

- [x] Verify the four-game versus two-game rushing windows.
- [x] Reconcile all eight Week 7 rushing events.
- [ ] Complete equivalent earlier-game classifications before claiming a causal Week 5 scheme change.
- [ ] Add next-game evidence and the second-game reassessment.
- [ ] Reconcile reported fantasy averages/ranks only with a specified scoring rule, cutoff and eligible QB population.

Dynamic public sources were inspected October 26; no immutable source packet or full film chart is claimed. This issue defines research checkpoints; it does not itself create automated monitoring, a trade/waiver decision or roster action.
