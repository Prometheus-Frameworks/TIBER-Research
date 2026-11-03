# First published matchup preview: methodological evaluation

**Review date:** October 31, 2026, America/Toronto. **Reviewer:** Codex in a
separate evaluation conversation, not the preview's authoring session. This is
an independent retrospective document/source audit. It did not observe original
execution or review the preview before publication. The reviewer also authors
the proposed workflow changes, which require separate verification. This is
manual research outside the governed run lifecycle.

## Inputs and original boundary

- [Merged skill](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/835b54231545b5decbed30f6be644cdec41d6d7c/.agents/skills/tiber-matchup-preview/SKILL.md)
  and all five references, including the retained Buffalo–Baltimore snapshot.
- [PR #70](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/70), head
  `7bf4399041668fd7d6b3e093d7608942a39d0a0d`, merged at
  `835b54231545b5decbed30f6be644cdec41d6d7c`, also this change's actual base.
  CI run `41211543874` succeeded. The PR reports 413 Node 20 tests; those checks
  concern implementation, not automatic selection or football forecasting.
- [Complete issue #71](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/71),
  all seven cards, selection/source logs and limitations. No comments existed at
  inspection. Original body creation/update: `2026-10-31T16:31:08Z`.
- Relevant #47 comments, especially the [October 26 target ledger](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/47#issuecomment-6417265640)
  and [October 27 participation update](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/47#issuecomment-6441040381).

**The original evidence cutoff remains October 31, 2026, 12:00:28 p.m. EDT /
16:00:28 UTC.** The selection log declares 11:58:59 a.m. EDT / 15:58:59 UTC.
SHA-256 of the inspected API-returned body's UTF-8 bytes, without adding a newline:
`39bd14ada9387e132d2193f41a7ce7b72fc07d6fa8772770d6b8dd2ffa47164a`
(30,067 bytes). This identifies the body inspected now, not the private original,
publisher bytes or the truth of its asserted earlier chronology.

## Conformance findings

| Requirement | Assessment |
| --- | --- |
| Assignment and scope | Game, home/away, venue, regular-season week, kickoff and timezone are explicit. General fantasy context has no assumed points format, personal roster choice or transaction. |
| Both-team scan | Both offenses and defenses are represented. Season baselines and recent/personnel windows are distinct; missing pace, coverage, film and designed-run splits are named. |
| Selected questions | Five themes/seven IDs fit the grouping rule. Protection, route access, target allocation, Love's return, rushing repeatability, Pickens's role and disguised pressure change consequential scenarios. Both offenses have meaningful interactions. |
| Priority rationale | A/B consequences, exposure, planned evidence and links are present. Q5b's medium priority reflects its narrow sample. Repeated high-priority wording weakens comparative reasoning; next time specify each question's evidence feasibility and distinct contribution. No numerical weighting is required. |
| Deferrals | D1/D5 keep consequential red-zone/possession uncertainty visible despite missing data; D2 avoids invented assignments, D3 rejects history without continuity, D4 is outside the request. These are reasonable deferrals, not findings that the topics do not matter. |
| Distinct linked questions | Q2a availability/snaps cannot answer Q2b target allocation; Q5a receiver status cannot answer Q5b pressure response. Separate cards, alternatives and limits improve on the pilot's combined fourth card. |
| Competing explanations | Quick outlets versus disruption, committee versus Wilson concentration, Love versus replacement rotation, repeatable rushing versus one-game efficiency, and successful versus failed disguise receive substantive treatment. Vacated opportunity is not allocated fully to every beneficiary. |
| Confidence | Observations, reports, inference and scenarios are distinguished in prose. High confidence in status is separate from uncertain workload/consequence. No qualitative confidence becomes a calibrated probability, causal estimate or points projection. |
| Source handling | Failed boxes lead to explicitly retained counts, not a claim of fresh verification. Snippet incompleteness, common reporting origins, injury-detail conflict and a source week-label error are disclosed. |
| Preservation | Operator-authorized public copy and dated amendment convention are explicit. Affected IDs, source time, previous/revised interpretation and uncertainty must be retained. Original no-review status remains historically true. The private original's locator/version is absent. |

The selection-log timestamp is a declaration, without a separately versioned
pre-retrieval log or ordered original trace. The 89 seconds between declared log
and cutoff do not prove or disprove ordering. Late bounded Teamstate discovery
and source exclusions are disclosed; complete compliance with earlier-context
read order cannot be independently established. Do not reconstruct chronology.

## Numerical audit

| Claim | Recalculation and sample judgment |
| --- | --- |
| Run allowance | `884/190 = 4.6526` and `1020/216 = 4.7222`: correctly 4.65 and 4.72. All official rush attempts, descriptive mixed-personnel season samples, not opponent-adjusted RB-handoff efficiency. |
| Wilson snaps | `73/81 = 90.1235%`: correctly 90.1%. One Week 7 offensive-snap sample cannot establish routes, target earning or post-Brooks deployment. |
| Wilson targets | `22/124 = 17.7419%` versus `30/85 = 35.2941%`: correctly 17.7% and 35.3%. Retained credited-target counts, not attempts/routes/first reads; unequal two-/three-game windows do not identify a trade effect. |
| Week 7 targets | McBride 13, Wilson 8, Brooks 6 and Bourne 6 against 44 faithfully reproduce #47. Underlying boxes were not independently reverified in this audit. |
| Williams rushing | `110-25 = 85`, `472-155 = 317`, `317/85 = 3.7294` versus `155/25 = 6.2`: correct. Weekly rows also sum to the operands. No unequal weekly-rate averaging or success-rate substitution. |
| Red-zone finishing | One TD / ten possessions over two games is a team result, not a player opportunity count. Causal diagnosis is correctly deferred. |
| Passing/pressure | Attributed 66.4% called passes and 38 official rushes measure different things. Prescott 16/27 and Arizona 31.4% concern third-and-long. The latter count and full definitions remain unavailable; no matchup probability is justified. |

Used baseline player totals match official stats at audit time. That does not
prove which bytes were available at the original cutoff. No new film, route,
pressure or opponent-adjusted dataset was generated.

## Meaningful defects and smallest remedies

**F1 — Q5b scope error.** Its selection-log B branch refers to weak season
aggregate pressure results, while the cited [Dallas analysis](https://www.dallascowboys.com/news/here-we-goooo-3-things-the-cowboys-must-do-to-beat-the-cardinals)
provides a third-and-long rate. Its evidence card is more careful than the log.
Append a dated issue correction: Arizona may produce negative plays despite its
reported low third-and-long pressure rate; aggregate pressure generation remains
unestablished. This narrows support without reversing scenarios or refreshing
the forecast. Add a final population-scope check across log/card/synthesis.

**F2 — execution provenance is insufficient for an invocation claim.** #71 states
the merged skill was read and labels the result manual. This supports declared
direct methodology use. It supplies no original runtime selection/file-read trace
for all required references or separately saved original question log. Earlier
acceptance-conversation recall reports a fresh CLI listing the skill enabled;
the raw receipt was not inspected, and that check was separate from this preview.
Discovery, loading, application and automatic selection remain distinct. The gap
does not prove the skill was never used. Add a compact execution record pointing
to actual events; a self-authored receipt or later probe cannot prove past use.

**F3 — source-attempt retention is incomplete.** #71 names ESPN/FootballDB URLs
and the latter's 403, but lacks the exact failed year-specific Dallas URL, all
observed errors and attempt clocks. Per-page retrieval seconds and frozen external
captures are explicitly absent. Unknown times are permitted; honest missingness
is not fabrication. Retain exact attempted URLs, observed failures, a known time
interval or unknown, and brief claim-bearing passages/calculations next time.
Never infer the missing Dallas URL from convention or backfill attempt times.

Unavailable route/coverage/first-read data, roof status, neutral pace and player
red-zone opportunities are ordinary data limits, generally handled correctly.
The independent reviewer was conditional in the skill, so the disclosed absence
before publication is not an automatic violation. This later audit cannot change
that history. Refining repetitive priority reasons is useful, but no broader
rewrite or new football investigation is warranted.

## Audit-time sources and limits

These reads completed October 31 **after** the original cutoff. Times below are
UTC audit completion times, not original retrieval clocks. All returned HTTP 200;
current access cannot reproduce or disprove earlier failures or page contents.

| Source | Read UTC | Checked evidence |
| --- | --- | --- |
| [Game details](https://www.dallascowboys.com/news/cowboys-cardinals-how-to-watch-listen-stream-in-week-8) | 17:18:18 | November 1, noon CT, Arlington; 1 p.m. EST Toronto |
| [Arizona injury report](https://www.azcardinals.com/news/injury-report-week-8-vs-cowboys) | 17:16:17 | Friday statuses; Love/Quinnen full; Gaines ankle |
| [Dallas updates](https://www.dallascowboys.com/news/updates-october-2026) | 17:16:20 | Pickens/Clark questionable; coach's expectation |
| [Friday notebook](https://www.azcardinals.com/news/love-ing-the-running-game-and-friday-before-the-cowboys) | 17:16:17 | OL contingency; red-zone 1/10; NGS 66.4%; Gaines-detail conflict |
| [Dallas analysis](https://www.dallascowboys.com/news/here-we-goooo-3-things-the-cowboys-must-do-to-beat-the-cardinals) | 17:16:18 | 16/27; 31.4%; situational scope; Packers week-label error |
| [Dallas stats](https://www.dallascowboys.com/team/stats/) / [Arizona stats](https://www.azcardinals.com/team/stats/2026/) | 17:16:56 / 17:16:54 | Used passing/receiving totals and opponent rush operands |
| [Williams log](https://www.dallascowboys.com/team/players-roster/javonte-williams/) | 17:16:54 | Season/Week 7 rushing operands and Week 6 Packers label |
| [Snap report](https://www.azcardinals.com/news/defensive-lineman-l-j-collier-still-a-cardinal-still-getting-more-snaps) | 17:16:54 | Team 81; Wilson 73; McBride 75; Brooks 52; Knight 43; Allgeier 38 |
| [Love plan](https://www.azcardinals.com/news/jeremiyah-love-ruled-out-against-rams) | 17:16:52 | Earlier health-contingent intent; inconsistent side/date wording |
| [Brooks report](https://www.azcardinals.com/news/jalen-brooks-season-ending-injury-creates-another-challenge-for-cardinals) | 17:16:52 | Played through injury; committee replacement plan |
| [Arizona Sports status](https://arizonasports.com/arizona-cardinals-injury-report/cardinals-cowboys-week-8-injury-report-jeremiyah-will-play) | 17:18:18 | Wilson expectation/designation, not health or workload |

Schedule pages, depth chart and Teamstate artifact were not separately re-read;
game details and Williams's log check identity and the Packers Week 6 label.
ESPN/FootballDB failures were not reattempted. No original trace, complete source
archive or private pregame-file identity was established. Conversation recall is
a lead, not an independent source witness. Required-reference and source-order
checks are limited accordingly.

## What this validates and next case

The first published record supports **practical manual use**: explicit agenda,
distinct cards, coherent alternatives, arithmetic discipline, disclosed gaps and
preserved pregame interpretation. It does not validate automatic selection in
the preview session, execution order, fixed-outline superiority, research-time
savings, cross-agent repeatability, calibration or causal accuracy. A game result
cannot supply those missing evaluations.

**Ready for another experimental contrasting matchup:** choose stable personnel
to contrast with both lineup-change examples. Preserve the pilot and this issue.
Capture actual entry/read events and a separately saved pre-retrieval log. If
comparing methods, use fresh contexts with the same cutoff, available sources and
time budget, record carryover and request a fresh reviewer without supplying a
preferred football answer. Limited/conflicting-evidence remains a useful separate
case; incidental failed pages do not complete that controlled comparison.

The proposed change is confined to execution/source record guidance, metric scope
and this evaluation. Independent verification of its exact candidate is requested
through the PR workflow; this author's checks are not that verification. Keep it
unmerged until that separate review is assessed.
