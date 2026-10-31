## Research question

With Emeka Egbuka out and Baker Mayfield expected back for Tampa Bay at Carolina in 2026 Week 7, does Ted Hurst earn a broader, repeatable receiving role—and does that role offer something we can use after Egbuka returns?

We want to investigate our early-season observation that a Mayfield–Hurst connection was forming. The Mike Evans comparison is a hypothesis about the outside X role, size, catch radius and quarterback trust. It is not a forecast that Hurst will reproduce Evans' ability or production.

**Status:** Initial pregame research report and open questions, prepared October 24, 2026. This is an issue-based investigation, not a formally activated, frozen or independently reviewed Research run. Findings below distinguish public observations, existing TIBER records and our interpretation.

## Verified Week 7 context

- Egbuka is **out** with concussion/foot issues. Mayfield practiced fully all three days but remains officially **questionable**. The team's October 23 update says he is expected to start; confirm game-day availability before treating the return as settled. Chris Godwin finished Friday's practice fully and has no game designation. Sources: [official injury report, October 23](https://www.buccaneers.com/news/buccaneers-panthers-injury-report-oct-23-week-7-2026); [team update, October 23 section](https://www.buccaneers.com/news/october-2026-updates).
- Mayfield has missed three games with a dislocated throwing-hand thumb and is expected to wear a protective glove. His return is an important condition, not proof that his passing performance immediately returns to baseline. [Team update](https://www.buccaneers.com/news/october-2026-updates)
- The supplied RotoWire screenshot matches [this October 23 syndicated report](https://www.thefantasyfootballers.com/news/643963/ted-hurst-bigger-role-for-week-7-on-tap/): Hurst has **22 targets, 11 receptions, 168 yards and one touchdown through six games**. It attributes Egbuka's workload to **43% of Tampa Bay WR targets and 31% of WR receiving yards**. Those are receiver-room shares, not shares of the entire passing offense, and they cannot simply be allocated to Hurst.
- Godwin and Tez Johnson are competing beneficiaries. Jalen McMillan's IR absence and David Sills' availability also belong in the personnel context; the October team updates document McMillan's September 30 IR placement. Verify the active receiver group on game day. [Team updates](https://www.buccaneers.com/news/october-2026-updates)

## What already exists in TIBER

Organization-wide default-branch file searches for Hurst, plus issue searches for Hurst and Ted Hurst, found substantial prospect coverage. We did **not locate a dedicated Hurst player-research issue** in that search. Issue-search hits included an unrelated Devy coverage discussion; that is not a Hurst scouting report. This is a scoped search result, not proof that no historical branch or attachment mentions him.

The following TIBER-Rookies records were inspected; links pin the version surfaced by the file search:

| Existing record | Useful content | Qualification |
| --- | --- | --- |
| [2026 player stats](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/b9c2d871e69f3c2230fe5c1447d9242f27f7c79a/data/processed/2026_player_stats.json) | Georgia State 2025: 71 catches, 1,004 yards, 6 TD | Basic production matches the Buccaneers' public biography. |
| [College production](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/b9c2d871e69f3c2230fe5c1447d9242f27f7c79a/data/processed/2026_college_production.json) | A stored normalized production score | A model input/output, not a direct scouting observation. |
| [Combine results](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/b9c2d871e69f3c2230fe5c1447d9242f27f7c79a/data/raw/2026_combine_results.json) | Stored 6-foot-4/206-pound profile, 4.42 forty, 36.5-inch vertical, 135-inch broad jump | Measurements require source reconciliation before treating every field as current fact. |
| [Prospect context](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/b9c2d871e69f3c2230fe5c1447d9242f27f7c79a/data/processed/2026_prospect_context.json) | Outside-receiver, contested-catch, production and developmental-athlete tags; provider-attributed advanced receiving fields | The entry explicitly retains low-confidence seed / pending-verification flags. Provider-derived fields are not independently verified by this report and are not reproduced here. |
| [2025 WR route profile](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/b9c2d871e69f3c2230fe5c1447d9242f27f7c79a/data/processed/wr_route_profiles/wr-ted-hurst_2025.json) | Season production and an estimated target count | Targets are estimated using receptions divided by a 70% catch-rate assumption. Route/screen/deep-target descriptors are missing. This cannot establish his route tree or measured targets per route. A screen-target count of zero does not establish zero screen usage. |
| [Draft results](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/b9c2d871e69f3c2230fe5c1447d9242f27f7c79a/data/processed/2026_draft_results.json) | Tampa Bay, Round 3, pick 84 | Separately supported by Tampa Bay's draft announcement. |
| [Promoted transition profile](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/b9c2d871e69f3c2230fe5c1447d9242f27f7c79a/exports/promoted/rookie-transition-profile/2026_rookie_transition_profile_v0.json) | Prospect context, athletic composite, age and official draft outcome | Keeps the old market-derived draft proxy separate from the real pick. Its athletic score is an in-house composite, not an official RAS percentile. |

TIBER-Fantasy also contains Hurst entries in its college/combine/rookie-grade files. Those are additional records, not independent confirmation.

**Measurement discrepancy to retain:** TIBER's combine record lists 6-foot-4/206; Tampa Bay's [April draft article](https://www.buccaneers.com/news/ted-hurst-nfl-bucs-draft-wr-georgia-state-rd-3-no-84-2026) describes 6-foot-4/210, while its [current roster page](https://www.buccaneers.com/team/players-roster/ted-hurst/) displays 6-foot-3/195. Do not silently select or average these listings. Resolve against dated combine measurements if exact dimensions become central to the comparison.

### October 24 follow-up: target qualification merged

We followed the estimated-target finding into [TIBER-Rookies #303](https://github.com/Prometheus-Frameworks/TIBER-Rookies/issues/303). Its first implementation, [PR #304](https://github.com/Prometheus-Frameworks/TIBER-Rookies/pull/304), is now merged as [a3178f0](https://github.com/Prometheus-Frameworks/TIBER-Rookies/commit/a3178f085a0f70fc57d5542ce34ca9ab05843382), after [independent Codex review of a33fc38](https://github.com/Prometheus-Frameworks/TIBER-Rookies/pull/304#pullrequestreview-5638999007) verified all three initial findings were repaired.

The new [qualification reader](https://github.com/Prometheus-Frameworks/TIBER-Rookies/blob/a3178f085a0f70fc57d5542ce34ca9ab05843382/scripts/target_evidence.py) makes the distinctions below available when we read Hurst's existing college file:

| Existing value | Qualified interpretation |
| --- | --- |
| 101 targets | Estimated from receptions / 0.70; not an observed target count. |
| 9.9 yards per target | Derived using an estimated denominator. |
| 0 screen targets | Unsupported scheme evidence; not an observed absence of screens. |

The producer now emits qualified evidence blocks, and YoY generation preserves and validates per-season status. Legacy files are interpreted through the reader; Hurst's raw file was not rewritten.

Verification: 30 focused tests passed locally; [exact-head CI](https://github.com/Prometheus-Frameworks/TIBER-Rookies/actions/runs/40111731542) recorded 696 passing tests and all three validators passed. All 19 existing season-pair numerical comparisons and the 66-file qualification inventory remained unchanged.

The first qualification slice is merged. It supplies no new measured targets or route observations and does not change Hurst's football evaluation or current rookie scores. #303 remains open for the documented null/zero model-policy, numerical migration, regeneration and manifest follow-ups.

**Post-merge review addendum (October 24):** the merge was completed before the review triggered by marking the draft ready had finished. That later review raised [one further P2](https://github.com/Prometheus-Frameworks/TIBER-Rookies/pull/304#discussion_r4367769984): array/object values in stored status fields can raise a TypeError before conservative degradation. Codex reproduced all eight affected field/type cases and posted a [bounded follow-up handoff for Claude](https://github.com/Prometheus-Frameworks/TIBER-Rookies/pull/304#issuecomment-6386859071). The original three findings are repaired, but this additional hardening fix remains outstanding under #303. No existing committed profile or numeric output was changed by these checks.

## Player profile: why the X-receiver idea is grounded

Tampa Bay selected Hurst 84th overall. Its April 25 draft explanation explicitly connected his size/speed profile to the outside X role vacated by Evans, while describing route refinement as a development need. That is stronger support for the positional comparison than visual resemblance alone. [Draft-day report](https://www.buccaneers.com/news/ted-hurst-nfl-bucs-draft-wr-georgia-state-rd-3-no-84-2026)

His production also spans two Georgia State seasons: **56/961/9 in 2024** followed by **71/1,004/6 in 2025**, after two years at Valdosta State. That gives us a sustained college production base, with a level-of-competition and NFL-transition question still to investigate. [Team biography](https://www.buccaneers.com/team/players-roster/ted-hurst/)

Mayfield's June 17 assessment praised Hurst's hands, body control and ability to cover ground, while identifying learning formations and the offense as rookie work still ahead. These are attributed offseason evaluations, not evidence that NFL separation or dependable target volume has already arrived. [Mayfield evaluation](https://www.buccaneers.com/news/baker-mayfield-impressed-offensive-additions-ted-hurst-kenneth-gainwell)

**Our interpretation:** the interesting possibility is a developing boundary receiver who can win downfield and earn throws in tighter windows. We still need to establish how often he separates, how complete his route menu is, and whether Baker trusts him on ordinary downs rather than only selected shots.

## Early Mayfield connection: evidence and limits

| Period / game | Observed receiving opportunity and production | Interpretation limit |
| --- | --- | --- |
| Week 1, at Cincinnati | 3 targets, 3 catches, 36 yards; RotoWire reported 30 routes on 36 Mayfield dropbacks | Substantial route access with only three targets. |
| Week 2, vs. Cleveland | 7 targets, 2 catches, 27 yards; reported 48 of 65 offensive snaps | A meaningful target-volume signal, with low conversion requiring film/context. |
| Week 3, vs. Minnesota | 3 targets, 1 catch, 40 yards and a TD; the touchdown came from Mayfield | One explosive play is not proof of a stable weekly role. Mayfield exited late with the thumb injury. |
| Weeks 1–3 combined | 13 targets, 6 catches, 103 yards, 1 TD | These are game-window totals; do not call them a pure Mayfield-only split without checking every target. |
| Weeks 4–6 combined | 9 targets, 5 catches, 65 yards, 0 TD | Calculated from six-game totals minus Weeks 1–3; Daniels started these games. Personnel, opponent and game script also changed. |
| Week 6, vs. Pittsburgh | 6 targets, 3 catches, 40 yards | Recent opportunity exists even before the expected QB return. |

Sources: [dated RotoWire entries carried by FOX Sports](https://www.foxsports.com/nfl/ted-hurst-player), [official game log](https://www.buccaneers.com/team/players-roster/ted-hurst/), [official Week 3 touchdown description](https://www.buccaneers.com/video/mayfield-hurst-td-vikings-bucs-nfl-season-week-3-big-play-2026), and [October 23 cumulative line](https://www.thefantasyfootballers.com/news/643963/ted-hurst-bigger-role-for-week-7-on-tap/). Blank Week 5 receiving cells on the roster page should not be used to invent routes, snaps or targets.

**Initial assessment:** our connection hypothesis has evidence worth testing, especially the Week 2 target count and Week 3 score. The sample does not establish a growing trend or a causal quarterback effect.

## Questions we want Week 7 to answer

1. **Access:** Does Hurst run a route on most passing plays, including two-receiver sets and obvious passing downs? Was he already near his route ceiling, making target earning more important than extra snaps?
2. **Role:** Is he primarily the outside X? Do we see slants, digs, curls/comebacks and intermediate work alongside vertical routes, or mainly clear-outs and occasional shots?
3. **Target earning:** Are targets distributed across drives and game situations? Does he receive early scripted looks, third-down opportunities, first reads or progression throws? Mark first-read/progression claims unknown when the available angle cannot establish them.
4. **Baker trust:** Does Mayfield throw before the break or into contested windows, return to Hurst after an incompletion, and use him in the red zone? Separate catchable misses, contested chances, drops and coverage wins.
5. **Redistribution:** Which opportunities actually move from Egbuka to Hurst, Godwin, Johnson, the tight ends and backs? Extra vacated targets do not imply a one-for-one role transfer.
6. **Matchup and QB condition:** What coverage, leverage, pressure and protection conditions shape Hurst's opportunities? Does Mayfield's thumb affect depth or placement? Carolina's aggregate yards/TD rankings alone do not establish a favorable individual matchup.
7. **Persistence:** Which parts of the role could survive Egbuka's return and McMillan's eventual return? Distinguish an injury-window start from earned developmental progress.

## Evidence plan and postgame readout

- Record the final active receiver group, starting QB and any in-game QB changes.
- Collect snaps, routes/team dropbacks, targets/routes, team target share, air-yard/depth information and red-zone/end-zone chances **only where a source supplies the relevant denominators**. Keep missing measures unknown.
- Review every Hurst target and a sample of untargeted routes. Log quarter/time, formation/alignment, route where visible, coverage evidence, throw quality and outcome.
- Start the film queue with the [Week 3 touchdown](https://www.buccaneers.com/video/mayfield-hurst-td-vikings-bucs-nfl-season-week-3-big-play-2026) and [Rondé Barber's breakdown](https://www.buccaneers.com/video/ronde-barber-breaks-down-ted-hurst-iii-first-career-touchdown-film-session). These are located review sources; this initial report has not watched or charted them.
- Compare Week 7 with Weeks 1–3 and 4–6 while retaining the small-sample and personnel confounders. Do not use estimated college targets as NFL route evidence.
- Report both fantasy output and underlying role: a TD can accompany limited involvement; a quiet box score can accompany improved opportunity.
- Close the first review with: **what changed, what persisted, what remains unknown, and what we need to observe with Egbuka active.**

**Evidence that would strengthen the hypothesis:** sustained route access, targets across multiple drives, a broader route menu, and meaningful high-leverage opportunities.

**Evidence that would weaken it:** low route participation, a narrow decoy/shot role, or most redistributed opportunity going elsewhere. Mayfield's absence or an early setback would make the proposed QB-connection test inconclusive.

No game result, fantasy point projection, waiver bid or automatic follow-up is assumed in this opening report.
