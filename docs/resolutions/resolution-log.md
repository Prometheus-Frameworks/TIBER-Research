# Resolution log — v0

**Status:** draft convention, seeded November 4, 2026 from records already on
`main`. Not a governed Research artifact, a scoring model or a ranking. It
grants no source admission, promotion or downstream authority.

## Why this file exists

The repository is good at freezing a thesis with a cutoff, a condition and a
numeric test. It is not yet in the habit of going back when the test date passes
and writing down what happened. This file is that habit. One row per frozen
thesis: what was claimed, what would weaken it, when it can be judged, and the
outcome once someone judges it.

An agent entering a session reads this file before anything else and surfaces
every `pending` row whose **Due** date has passed. That is the smallest useful
form of persistent memory for a domain that changes every week.

## Rules

1. **A row is created when a thesis is frozen, not when it resolves.** Copy the
   claim and the weakening condition from the originating record as written. Do
   not sharpen them after the fact.
2. **Due** is the date after which the thesis can be judged: the last game in a
   fixed window, a declared evidence deadline, or a transaction date. A proposed
   checkpoint is a proposed due date; say so.
3. **Outcome** uses the vocabulary already in the game-study guide, plus one
   state for tests whose condition never occurred:
   - `pending` — not yet assessed. A pending row past its due date is overdue.
   - `supported` — the frozen test passed under its declared condition.
   - `challenged` — the frozen test failed under its declared condition.
   - `mixed` — the record's own in-between band, or parts went each way.
   - `unresolved` — assessed, but the evidence cannot discriminate; say what is missing.
   - `untestable` — the condition did not occur (bye, inactive, a returning
     player, a quarterback change). Not a failure. Do not extend the window.
4. **Resolved by** names the dated record that supplied the judgement, and who
   read it. A backfilled outcome is a reading of an existing dated update by the
   person named, not a new football assessment; the origin record governs.
5. **One eligible game cannot certify a two-game window.** Record partial results
   in the notes and leave the outcome `pending` until the window closes or the
   condition fails.
6. Keep opportunity separate from fantasy points. Rows describe role and
   mechanism tests; a modest score with the role intact is not `challenged`.
7. Do not add theses that have no falsifier. Descriptive studies such as the
   [MHJ career study](../studies/mhj-career-2026w4/README.md) are not rows; they
   can be origins for future rows.
8. Private league, roster or lineup context never enters this file. Rows are
   about players and mechanisms, not about what anyone started.

Thesis IDs reuse the originating record's IDs where they exist. IDs marked
`retro` are retrospective organizational labels assigned during the October 31
format preparation or in this seeding; they are not original pregame IDs.

## Summary as of 2026-11-04

| State | Rows |
| --- | ---: |
| pending, due date passed (overdue) | 19 |
| pending, not yet due | 6 |
| supported | 2 |
| challenged | 3 |
| mixed | 2 |
| unresolved | 2 |
| untestable | 0 |

Overdue rows are concentrated in the November 1 games. None of the November 1
results are on `main` yet; the prepared-article snapshot stops October 31.

---

## Issue #44 — Week 6 → Week 7 utilization, eight role-persistence cases

Origin: [prepared copy](../research-articles/prepared/research-issue-0044/body.md)
of [issue #44](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/44).
Frozen 2026-10-19 21:02 America/Toronto. Each card is a two-team-game window;
target share is credited targets over credited team targets; carry share is over
all-team carries. "Top two" allows ties. Absence or bye is not zero.

| Thesis | Frozen | Claim as frozen | Weakens if | Due | Outcome | Resolved by / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `UTIL-2026-W06-BERNARD` | 2026-10-19 | Bernard keeps ≥20% target share and a top-two target rank in W7 at NO and W8 vs CLE, with Wilson and Pittman absent and Rodgers primary. | Below 15% with declared personnel and ordinary team volume. 15–20% is mixed. | 2026-11-01 | pending | No dated update on `main`. Overdue. |
| `UTIL-2026-W06-COKER` | 2026-10-19 | Coker stays a top-two Carolina target with ≥25% share in W7 vs TB and W8 at GB, Young primary, McMillan present. | Below 15% with no limitation while another healthy receiver absorbs priority. 15–25% is mixed. | 2026-10-29 | pending | No dated update on `main`. Overdue. |
| `UTIL-2026-W06-MARKS` | 2026-10-19 | Marks keeps ≥50% of all-team carries in W7 vs NYG and W9 at LAC while Montgomery is absent. Receiving extension tracked separately: ≥2 targets strengthens it. | Below 40% with Montgomery still absent and Marks healthy. 40–50% is mixed. Montgomery's return makes the test untestable, not failed. | 2026-11-08 | pending | Game 1 of 2 read on 2026-10-26 in [update 6417385863](../research-articles/prepared/research-issue-0044/update-6417385863.md): rushing 19/25 = 76.0%, meets criterion; receiving 1 target, weakens the extension. Brief in-game absence not adjudicated. Window closes after W9. |
| `UTIL-2026-W06-ALLEN` | 2026-10-19 | Allen keeps ≥55% of all-team carries in W7 vs MIA and W8 vs LV with Hall inactive and Geno Smith primary. ≥1 target keeps ancillary receiving involvement. | Below 45% with Hall still absent and Allen healthy, especially with Davis gaining work. 45–55% is mixed. Hall's return is a separate assessment. | 2026-11-01 | pending | No dated update on `main`. Overdue. |
| `UTIL-2026-W06-PWASHINGTON` | 2026-10-19 | Washington keeps a top-two target rank and ≥20% full-game share in W8 vs IND and W9 at BAL, with Lawrence primary, plus ≥1 target and top-two rank inside the frozen competitive split. | Below 15% full-game share when the competitive condition occurred. Full-game pass with competitive rank outside top two or zero competitive targets is mixed, never support. | 2026-11-05 | pending | Not yet due. Fewer than ten eligible competitive team targets leaves the split unassessable but not the full-game result. |
| `UTIL-2026-W06-DSMITH` | 2026-10-19 | Smith keeps ≥25% of receiver-credited targets and a top-two rank in W7 vs DAL and W8 at WAS with McKee primary. | Below 20% with Smith healthy and McKee primary. 20–25% is mixed. A quarterback change is a new condition reported separately. | 2026-11-01 | pending | No dated update on `main`. Overdue. |
| `UTIL-2026-W06-FLOWERS` | 2026-10-19 | Flowers stays a top-two target with ≥25% share in W7 vs CIN and W8 at BUF regardless of whether Huntley or Jackson is primary. | Below 20% with Flowers healthy and sufficient volume while another receiver gains recurring priority. 20–25% is mixed. Mixed-QB games are not clean tests. | 2026-11-01 | pending | No dated update on `main`. Overdue. |
| `UTIL-2026-W06-KINCAID` | 2026-10-19 | Kincaid keeps ≥15% credited target share in W8 vs BAL and W9 at MIN after the bye, with Josh Allen primary and no documented restriction. | Below 10% with Kincaid adequately available and ordinary team opportunity. 10–15% is mixed. | 2026-11-09 | pending | Not yet due. An unverified restriction is recorded as uncertainty and does not erase a low-share result. |

## Issue #49 — Week 7 Colts at Vikings, Murray rebound conditions

Origin: [prepared copy](../research-articles/prepared/research-issue-0049/body.md)
of [issue #49](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/49).
Source record 2026-10-23; the prepared copy labels these `retro-RQ1` to
`retro-RQ5`. The operator's stated position was exploratory, not asserted. Game
played 2026-10-25, final MIN 16, IND 10. Read on 2026-10-26 in
[update 6417324742](../research-articles/prepared/research-issue-0049/update-6417324742.md).

| Thesis | Frozen | Claim as frozen | Weakens if | Due | Outcome | Resolved by / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `retro-RQ1` (#49) | 2026-10-23 | Healthy Jefferson, Addison and Hockenson improve Murray's passing; a broad passing breakout is possible if volume is sufficient. | Low volume or efficiency with the weapons available. | 2026-10-25 | challenged | Update 6417324742: Murray 14/24, 150 yards, 1 TD; "a broad passing breakout did not occur." Backfill reading by Claude, 2026-11-04. |
| `retro-RQ2` (#49) | 2026-10-23 | Rushing supports Murray's fantasy floor. | Negligible designed-run or scramble yardage. | 2026-10-25 | supported | Same update: 5 attempts, 39 yards, concentrated in one 35-yard gain; designed runs, scrambles and kneels not separated. Backfill reading by Claude, 2026-11-04. |
| `retro-RQ3` (#49) | 2026-10-23 | Indianapolis can preserve passing volume and keep the game competitive. | Sustained low passing output or a game that stops being competitive. | 2026-10-25 | challenged | Same update: Jones 13/22, 108 gross, 64 net passing yards, 4 sacks, 1 INT; Jones exited with a knee injury, so the full-game test is partly untestable. Game stayed within one score. Backfill reading by Claude, 2026-11-04. |
| `retro-RQ4` (#49) | 2026-10-23 | Flores forces short, ineffective throws from Jones. | Jones sustains efficient intermediate passing against the blitz. | 2026-10-25 | unresolved | Same update: result "compatible with our Flores concern" but blitz rate, pressure frequency, depth of target and hot-read mechanism were not measured. Outcome consistent; mechanism not observed. Backfill reading by Claude, 2026-11-04. |
| `retro-RQ5` (#49) | 2026-10-23 | A comfortable Minnesota lead limits second-half passing opportunity. | Minnesota passes at a similar rate in both halves, or never holds a comfortable lead. | 2026-10-25 | unresolved | Same update: final margin was one score and possession-level game state was not reconstructed; the record declines to attribute the passing result to lead protection. Backfill reading by Claude, 2026-11-04. |

## Issue #56 — Miami receivers after the bye

Origin: [prepared copy](../research-articles/prepared/research-issue-0056/body.md)
of [issue #56](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/56).
Pregame snapshot 2026-10-24; game 2026-10-25, MIA 28, NYJ 25. Read on
2026-10-31 in [update 6546709227](../research-articles/prepared/research-issue-0056/update-6546709227.md).
Share denominators: targets over 21 attempts; snaps over 65.

| Thesis | Frozen | Claim as frozen | Weakens if | Due | Outcome | Resolved by / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `retro-DOUGLAS` (#56) | 2026-10-24 | Douglas returns to substantial receiving access beyond vertical plays. | Token or package-only participation. | 2026-10-25 | supported | Update 6546709227: 44/65 snaps, 20–21 routes, 3 targets, 2–70–2. Target takeover not established. Backfill reading by Claude, 2026-11-04. |
| `retro-BELL` (#56) | 2026-10-24 | Bell's separation, YAC and targets are repeatable with Douglas back. | Bell loses targets when Douglas returns. | 2026-10-25 | mixed | Same update: snaps fell 71% to 48%; targets rose to 4/21 with three third-down targets. "Douglas returned, therefore Bell stopped getting opportunities" fails; film incomplete. Backfill reading by Claude, 2026-11-04. |
| `retro-WASHINGTON` (#56) | 2026-10-24 | Washington's reception role persists after the bye. | Loss of playing time or route priority. | 2026-10-25 | mixed | Same update: snaps 80% and most routes retained; target rate fell 29.6% to 14.3%. Playing time persisted, target rate did not. Backfill reading by Claude, 2026-11-04. |
| `retro-COLEMAN` (#56) | 2026-10-24 | Coleman's Week 5 involvement is a lasting role. | Return to a small rotational role. | 2026-10-25 | challenged | Same update: 10/65 snaps, 2 routes, 1 target, down from 63.6% snaps and 7 targets. Displacement specifically by Douglas not isolated. Backfill reading by Claude, 2026-11-04. |
| `retro-COLEMAN-W8` (#56) | 2026-10-31 | Prospective: repeated minimal Coleman access in W8 vs NE strengthens displacement; restored access challenges permanence. | Restored route access in W8. | 2026-11-01 | pending | Frozen in update 6546709227 §7. No W8 result on `main`. Overdue. |

## Game study `nfl-2026-reg-w08-ari-dal` — Arizona at Dallas, Week 8

Origin: [study manifest](../game-studies/2026/reg/week-08/ari-at-dal/study.json)
from [issue #71](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/71).
Pregame cutoff 2026-10-31 12:00 America/Toronto; kickoff 2026-11-01; declared
evidence deadline 2026-11-03 10:00. Manifest shows `game_final: not_checked` and
`evaluation_state: pending`. The manifest is the authoritative assessment record;
these rows mirror it so the overdue state is visible here.

| Thesis | Frozen | Claim as frozen | Weakens if | Due | Outcome | Resolved by / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `nfl-2026-reg-w08-ari-dal/Q1` | 2026-10-31 | Arizona's replacement line can protect Brissett against Dallas's front. | See retained pregame record; sacks and pressure with definitions. | 2026-11-03 | pending | Evidence deadline passed; closeout not on `main`. Overdue. |
| `nfl-2026-reg-w08-ari-dal/Q2a` | 2026-10-31 | Wilson retains or expands usable route participation after Brooks's injury while managing ribs. | Reduced routes with Wilson active. | 2026-11-03 | pending | As above. Overdue. Links to #47 H1/H2 below. |
| `nfl-2026-reg-w08-ari-dal/Q2b` | 2026-10-31 | Identified recipient of Brooks's targets if deployment changes. | See retained pregame record. | 2026-11-03 | pending | As above. Overdue. |
| `nfl-2026-reg-w08-ari-dal/Q3` | 2026-10-31 | Love returns as a genuine receiving and early-down contributor rather than a split, constrained role. | Split or constrained usage with Love active. | 2026-11-03 | pending | As above. Overdue. |
| `nfl-2026-reg-w08-ari-dal/Q4` | 2026-10-31 | Dallas repeats useful early-down rushing against Arizona without Nolen. | See retained pregame record. | 2026-11-03 | pending | As above. Overdue. |
| `nfl-2026-reg-w08-ari-dal/Q5a` | 2026-10-31 | Pickens has his normal receiving role alongside Lamb. | Reduced role with Pickens active. | 2026-11-03 | pending | As above. Overdue. |
| `nfl-2026-reg-w08-ari-dal/Q5b` | 2026-10-31 | Dak handles Arizona's disguised pressure on long passing downs. Apply the separately dated correction retained in the manifest. | See retained pregame record and amendment. | 2026-11-03 | pending | As above. Overdue. |

## Issue #61 — RB carry leaders versus receiving and goal-line work

Origin: [prepared copy](../research-articles/prepared/research-issue-0061/article.md)
of [issue #61](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/61).
Week 7 baseline; first cross-case checkpoint after Week 8, second after each
team's next game. Research owner not stated in the record. Due dates below are
the first checkpoint and are proposed, not scheduled.

| Thesis | Frozen | Claim as frozen | Weakens if | Due | Outcome | Resolved by / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `retro-WARREN` (#61) | 2026-10-26 | Warren's clear rushing lead persists with Dowdle active, with meaningful routes and targets on ordinary possessions. | Sustained receiving or close-range displacement, or a broader carry rotation, with both backs available. | 2026-11-02 | pending | PIT W8 vs CLE 2026-11-01 not on `main`. Overdue for the first checkpoint. Contingency thesis lives in [#66](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/66). |
| `retro-JACOBS` (#61) | 2026-10-26 | Jacobs's receiving and close-range access recur with Lloyd participating. | Targets, routes or scoring-position work shift to Lloyd or others. | 2026-11-02 | pending | No W8 result on `main`. Overdue for the first checkpoint. |
| `retro-IRVING` (#61) | 2026-10-26 | Irving keeps meaningful close-range and receiving access in a more competitive game with Mayfield and the other backs available. | Those channels shift despite comparable health and opportunity. One-target game in an 11-attempt offense is not a collapse. | 2026-11-02 | pending | No W8 result on `main`. Overdue for the first checkpoint. |
| `retro-COLEMAN-RB` (#61) | 2026-10-26 | Coleman sustains useful participation with Dobbins and Harvey active and earns additional receiving or close-range work. | Returns to a small rotational role or stays restricted to low-value situations. | 2026-11-02 | pending | No W8 result on `main`. Overdue for the first checkpoint. |

## Issue #67 — Seth McGowan contingency stash

Origin: [prepared copy](../research-articles/prepared/research-issue-0067/article.md)
of [issue #67](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/67).
Horizon: Week 8, the November 10 trade deadline, then the first two games of any
new backfield regime. The record states no universal bid and no private-league
availability.

| Thesis | Frozen | Claim as frozen | Weakens if | Due | Outcome | Resolved by / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `retro-STASH` (#67) | 2026-10-26 | McGowan's rising role and proximity to a starting opportunity make him a worthwhile speculative stash where bench cost is reasonable; a Taylor trade is not assumed. | Taylor stays healthy and the Week 7 touch share does not repeat across scripts; or a replacement is added and McGowan's share stays small. | 2026-11-10 | pending | Not yet due. Record the actual Colts deadline decision and game-day backfield distributions either side of it. |

## Issue #47 — Michael Wilson, Z role and target share

Origin: [prepared copy](../research-articles/prepared/research-issue-0047/body.md)
of [issue #47](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/47),
latest state in [update 6441040381](../research-articles/prepared/research-issue-0047/update-6441040381.md)
of 2026-10-27. Three-game reassessment declared for November 10. The Week 8 game
is the `ari-dal` study above.

| Thesis | Frozen | Claim as frozen | Weakens if | Due | Outcome | Resolved by / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `H1` (#47) | 2026-10-22 | Wilson sustains high target concentration after Harrison's departure and Brooks's absence. | Committee distribution across the replacement receivers. Brooks's absence is a new test, not confirming evidence. | 2026-11-10 | pending | Three-game reassessment not yet due. W8 result not on `main`. |
| `H2` (#47) | 2026-10-22 | Wilson is the leading wide receiver within a McBride-led distribution. | McBride or another receiver outranks him in a healthy game. | 2026-11-10 | pending | As above. Update 6441040381 calls H2 "compatible with Week 7's distribution." |

## Issue #45 — Travis Hunter integration, Jacksonville receiving roles

Origin: [prepared copy](../research-articles/prepared/research-issue-0045/body.md)
of [issue #45](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/45),
prospective checkpoint in [update 6522498036](../research-articles/prepared/research-issue-0045/update-6522498036.md)
of 2026-10-30, test game W8 vs IND 2026-11-01.

| Thesis | Frozen | Claim as frozen | Weakens if | Due | Outcome | Resolved by / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `H1` (#45) | 2026-10-30 | Hunter's offensive integration broadens: more route access and repeated ordinary passing participation across possessions, including untargeted work. | A touchdown or selected-touch spike alone, without route breadth, is counterevidence to calling it established. | 2026-11-01 | pending | No W8 result on `main`. Overdue. Working expectation in the record was incremental allocation, not a full-time role. |
| `H2` (#45) | 2026-10-30 | Hunter remains a selective offensive specialist alongside heavy defensive snaps. | Meaningful receiving breadth expands beyond selected calls at comparable defensive demands. | 2026-11-01 | pending | No W8 result on `main`. Overdue. Meyers's status makes any expansion conditional. |

---

## Adding rows

Create the row in the same change that freezes the thesis. Use the article
template's resolution block to carry the same fields in the article, and the
dated-update template's `resolution` update type when the outcome is recorded.
Edit a row's outcome only with a dated record to point at. Never delete a row;
a superseded thesis gets `untestable` or `unresolved` and a note.
