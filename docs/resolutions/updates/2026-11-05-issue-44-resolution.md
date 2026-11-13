---
format: "tiber-research-update/v0"
record_id: "resolution-2026-11-05-issue-44"
record_kind: "player/team study"
subject: "Resolution of the five overdue UTIL-2026-W06 cards: Bernard, Coker, Allen, Smith, Flowers"
study_window: "2026 Weeks 7–8, the two fixed team games per card frozen October 19"
evidence_cutoff: "2026-11-05T00:25:00Z"
timezone: "UTC"
latest_observation_covered: "2026-11-01 games (PIT vs CLE, NYJ vs LV, WAS vs PHI, BUF vs BAL) and 2026-10-30 GB vs CAR"
authored_at: "2026-11-05T00:30:00Z"
record_origin: "dated update"
original_record: "https://github.com/Prometheus-Frameworks/TIBER-Research/issues/44"
game_manifest: null
research_state: "Resolution of frozen tests; manual, not a governed Research attempt"
review_state: "Author checks only; independent review pending"
owner: "Joseph (@Prometheus-Frameworks); prepared by Claude"
admission_granted_by_record: false
external_acceptance_refs: []
---

# Resolution — issue #44 Week 6 → Week 7 utilization cards, five overdue rows

- Update type: resolution.
- Original article: [prepared copy](../../research-articles/prepared/research-issue-0044/body.md) of issue #44, frozen 2026-10-19 21:02 America/Toronto.
- Affected IDs: `UTIL-2026-W06-BERNARD`, `UTIL-2026-W06-COKER`, `UTIL-2026-W06-ALLEN`, `UTIL-2026-W06-DSMITH`, `UTIL-2026-W06-FLOWERS`. Marks, P. Washington and Kincaid are not yet due and are untouched.
- Resolution log rows updated in the same change: [resolution-log.md](../resolution-log.md).
- Admission granted by this update: none.

## 1. Summary

Five two-game windows closed on November 1. Read against each card's own frozen threshold and condition, with denominators from the same provider: Allen is **supported**, Coker is **challenged**, Bernard is **mixed**, Smith is **untestable** (inactive both games), and Flowers is **unresolved** (one supported game, one game outside the frozen quarterback condition). Fantasy points are kept separate from the role tests throughout.

## 2. Question and scope

Each card asked whether a Week 6 role change persisted across the next two scheduled team games under a declared availability condition, with a numeric support/weaken band on credited target share or all-team carry share. This update records only those tests. It does not extend any window, re-freeze a threshold, or add new hypotheses.

## 3. Baseline and alternatives

The baseline is the card itself: leading explanation, strongest alternative, condition, thresholds and the two named games. Those are not restated here; the prepared copy retains them verbatim.

## 4. Evidence by question

Denominators: credited receiver targets and all-team rushing attempts from the ESPN box score for each game, read on 2026-11-05 through the ESPN summary endpoint (`site.api.espn.com/.../summary?event=<id>`), which exposes the same TGTS and CAR columns as the public box page. Target share is player targets over the team's credited targets; carry share is player carries over all team carries including quarterback runs, as the cards specify. "Top two" allows ties. Availability facts cite the dated report used.

### `UTIL-2026-W06-BERNARD` — Germie Bernard, PIT

- **Condition check.** Rodgers was primary passer both games (30 and 25 attempts). Michael Pittman Jr. was placed on injured reserve October 10 ([Yardbarker, Oct 24](https://www.yardbarker.com/nfl/articles/steelers_make_wr_moves_amid_michael_pittman_development/s1_17615_44469089)). Roman Wilson was placed on injured reserve after a Week 5 finger injury, a minimum four-game absence ([TSN](https://www.tsn.ca/nfl/article/steelers-place-wr-wilson-on-ir-with-finger-injury-n1-50203338/)). Neither appears in either box. Skowronek was inactive in Week 7 ([steelers.com inactives](https://steelers.com/news/steelers-inactives-for-week-7-at-saints)) and absent from the Week 8 box; his Week 8 inactive status was not independently confirmed. Condition met.
- **W7 at NO, 2026-10-25, PIT 16–10** ([box 401873011](https://www.espn.com/nfl/boxscore/_/gameId/401873011)). Regulation only, four periods. Bernard 5 of 28 credited targets = **17.9%**, 3 receptions, 27 yards. Rank **3rd**: Dowdle 6, Metcalf 6, Bernard 5. Band: 15–20% is mixed; top-two criterion not met.
- **W8 vs CLE, 2026-11-01, PIT 27–6** ([box 401873027](https://www.espn.com/nfl/boxscore/_/gameId/401873027)). Bernard 5 of 22 = **22.7%**, 5 receptions, 30 yards. Rank **tied 2nd**: Metcalf 6, Bernard 5, D. Washington 5. Meets ≥20% and top-two. Team volume was low (25 attempts) in a blowout; the card's "ordinary team volume" qualifier is a judgment, not a threshold.
- **Limits.** No routes, snaps or alignment. Catch-up or score-state attribution not reconstructed.

### `UTIL-2026-W06-COKER` — Jalen Coker, CAR

- **Condition check.** Young primary both games (27 and 41 attempts); McMillan present both games. Pickett threw 4 passes late in a 43–13 Week 7 loss. No injury limitation for Coker was found in dated reporting; an official Panthers injury designation was not retrieved, so "no reported limitation" is as far as this update can go.
- **W7 vs TB, 2026-10-25, CAR 13–43** ([box 401873018](https://www.espn.com/nfl/boxscore/_/gameId/401873018)). Coker 4 of 29 = **13.8%**, 1 reception, 9 yards. Rank tied 3rd–4th: McMillan 6, Hubbard 5, Metchie 4, Coker 4.
- **W8 at GB, 2026-10-29, GB 27–19** ([box 401873023](https://www.espn.com/nfl/boxscore/_/gameId/401873023)). Coker 5 of 35 = **14.3%**, 2 receptions, 36 yards, one 26-yard touchdown. Rank **3rd**: McMillan 11, Hubbard 8, Coker 5.
- **Reading.** Both games below the 15% weaken line with McMillan and Hubbard absorbing recurring priority. The touchdown is production, not priority.

### `UTIL-2026-W06-ALLEN` — Braelon Allen, NYJ

- **Condition check.** Hall inactive Week 7, quadriceps ([The Fantasy Footballers, Oct 25](https://www.thefantasyfootballers.com/news/644218/breece-hall-out-again-in-week-7/)) and officially inactive Week 8, a fifth straight absence ([NBC Sports, Nov 1](https://www.nbcsports.com/fantasy/football/player-news/2026-11-01/breece-hall-quad-officially-inactive-vs-raiders)). Geno Smith primary both games (30 and 32 attempts). Condition met.
- **W7 vs MIA, 2026-10-25, MIA 28–25** ([box 401873015](https://www.espn.com/nfl/boxscore/_/gameId/401873015)). Allen 17 of 21 all-team carries = **81.0%**, 104 yards; 7 targets, 6 receptions. Davis 1 carry.
- **W8 vs LV, 2026-11-01, LV 38–33** ([box 401873029](https://www.espn.com/nfl/boxscore/_/gameId/401873029)). Allen 21 of 27 = **77.8%**, 147 yards, 1 touchdown; 2 targets, 2 receptions. Davis 5 carries.
- **Reading.** Both games above the 55% support line with at least one target. The absence-limited thesis held for its window. A healthy-Hall allocation remains untested; Reich's November 3 remark that Hall is "our guy" ([NBC Sports](https://www.nbcsports.com/fantasy/football/player-news/2026-11-03/reich-im-assuming-breece-is-our-guy)) opens a separate regime.

### `UTIL-2026-W06-DSMITH` — DeVonta Smith, PHI

- **W7 vs DAL, 2026-10-26.** The ESPN game story states "The Eagles also played without wideout DeVonta Smith"; the box has no Smith line ([box 401873009](https://www.espn.com/nfl/boxscore/_/gameId/401873009)). Multiple October 25–26 reports attribute the absence to the hamstring.
- **W8 at WAS, 2026-11-01.** Ruled out October 30 for the hamstring, per Dave Zangaro of NBC Sports Philadelphia ([RotoBaller, Oct 30](https://www.rotoballer.com/?p=1979698)); no Smith line in the box ([box 401873035](https://www.espn.com/nfl/boxscore/_/gameId/401873035)).
- **Reading.** The card's untestable clause applies: inactive both games. No denominator is invented. McKee was primary both games, so the quarterback condition would have been met had Smith played.

### `UTIL-2026-W06-FLOWERS` — Zay Flowers, BAL

- **W7 vs CIN, 2026-10-25, CIN 35–13** ([box 401873012](https://www.espn.com/nfl/boxscore/_/gameId/401873012)). Huntley primary (34 attempts). Flowers 11 of 34 = **32.4%**, 8 receptions, 137 yards, 1 touchdown. Rank 1st. Meets ≥25% and top-two under the Huntley condition.
- **W8 at BUF, 2026-11-01, BUF 36–10** ([box 401873026](https://www.espn.com/nfl/boxscore/_/gameId/401873026)). Per the ESPN game story, Jackson injured his right thumb on Baltimore's first snap and will go on injured reserve; Huntley left in the second quarter with a toe injury; undrafted rookie Joe Fagnano finished, 10 of 21 for 91 yards. Box: Fagnano 21 attempts, Huntley 4, Jackson 1. Flowers 5 of 26 = **19.2%**, 0 receptions. Rank 2nd (Hill 8).
- **Reading.** The frozen condition names Huntley or Jackson as primary passer and treats mixed-quarterback games as not clean tests. Week 8 had three passers and a third-string primary. The card's untestable clause ("unresolved mixed-QB attribution") applies to that game. The 19.2% figure is recorded but not graded against the band.

## 5. Interpretation and assessment

- `UTIL-2026-W06-BERNARD` / **mixed** / W7 17.9% and 3rd (mixed band, not top two); W8 22.7% and tied 2nd (support) / cannot establish persistence across both games; no route or alignment evidence.
- `UTIL-2026-W06-COKER` / **challenged** / 13.8% and 14.3%, both below the 15% weaken line, rank 3rd–4th and 3rd with Young primary and McMillan present / does not establish why; no injury designation retrieved.
- `UTIL-2026-W06-ALLEN` / **supported** / 81.0% and 77.8% all-team carry share with Hall inactive both games, ≥1 target each / says nothing about a healthy-Hall backfield.
- `UTIL-2026-W06-DSMITH` / **untestable** / inactive both games, hamstring / no role evidence exists; condition did not occur.
- `UTIL-2026-W06-FLOWERS` / **unresolved** / W7 32.4% and 1st under Huntley (support); W8 outside the frozen quarterback condition after two in-game quarterback injuries / one eligible game cannot certify the two-game window; what is missing is a second eligible game.

Opportunity and fantasy points are separate. Allen's 147 yards, Coker's touchdown and Flowers' zero catches are outcomes, not the tests.

## 6. Unknowns and revision triggers

- Routes, snaps, alignment and first reads were not available for any of the five; shares are credited-target and all-team-carry measures only.
- Skowronek's Week 8 inactive status and Coker's official injury designation were not independently retrieved.
- Hall's return opens a new Jets backfield regime; it does not reopen this window.
- A Ravens quarterback regime with Fagnano or a healthy Huntley is a new condition; it does not reopen Flowers' window.

## 7. Next checkpoint and closeout

These five rows are closed. No window is extended. Marks (due 2026-11-08), P. Washington (2026-11-05) and Kincaid (2026-11-09) remain pending in the log on their own dates.

## 8. Sources, review and amendment history

- ESPN summary endpoint and public box pages for games 401873011, 401873027, 401873018, 401873023, 401873015, 401873029, 401873009, 401873035, 401873012, 401873026, retrieved 2026-11-05 00:10–00:20 UTC. The game stories quoted are the AP recaps embedded in the same responses.
- Availability: links inline above. ESPN's per-game `injuries` field was found to reflect the current report, not game-day status, and was not used.
- Author checks: shares recomputed from the parsed box columns; team totals matched the box totals row in every game.
- Independent review: pending. Resolution recorded in the log by Claude on 2026-11-05; the origin record and its thresholds govern.
