# Arizona at Dallas — Week 8 closeout pilot

Study ID: `nfl-2026-reg-w08-ari-dal`.
State at setup: pregame preserved; seven assessments pending; closeout draft;
downstream not admitted. Read [study.json](study.json) for the current candidate
state and [the workflow](../../../../README.md) for review/merge requirements.

## Assignment and custody

Joe authorized this bounded pilot on October 31, 2026. Codex prepares the records
and postgame research; Joe retains the acceptance and merge decisions. The scope
is the seven questions in [Research #71](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/71),
not every Week 8 game or a perpetual player monitor.

The [official game notice](https://www.dallascowboys.com/news/cowboys-cardinals-how-to-watch-listen-stream-in-week-8)
was re-read during setup: Sunday November 1, 2026, noon Central / 1 p.m. EST in
Toronto, at AT&T Stadium. A provider-native game ID has not been verified and is
null. Recheck identity and actual finality before postgame evaluation.

The [captured issue body](retained/issue-71-body.md) retains its declared October 31,
12:00:28 p.m. EDT cutoff. This capture was made later during setup, not at original
publication. Its digest binds these captured bytes; it does not authenticate the
original external pages or retroactively establish their availability.

The [separate methodological amendment](retained/issuecomment-6546713994.md) is
retained too. It narrows Q5b's pressure statement to third-and-long situations;
aggregate pressure generation remains unestablished. Keep the original wording
and evaluate the amended interpretation. [PR #72](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/72)
audits methodology and execution provenance; it is separate from this game-outcome
pilot, and this setup neither merges it nor presumes its proposal is adopted.

This evaluation plan is a new pregame addition written after #71 was published.
It is not the original selection log. No new numerical success threshold is
retroactively attributed to the preview. Missing source clocks and unverified
runtime skill invocation remain unknown.

## Question-specific postgame plan

Retain seven separate assessments. For each, distinguish personnel/exposure,
interaction, opportunity, execution/outcome and usefulness of the research question.

| ID | Distinguishing evidence to seek | Important limit |
| --- | --- | --- |
| Q1 | Actual Arizona OL/Dallas front availability; play-level disruption and functional passing; protection help where observable. | Sacks and final passing yards cannot establish protection responsibility or all pressure. |
| Q2a | Wilson availability, restrictions, passing rotations and routes with a stated denominator if available. | Offensive snaps are not routes; health cannot be inferred from active status. |
| Q2b | Same-provider credited targets for Wilson, McBride, RBs and secondary receivers; team denominator and deployment context. | Targets are not first reads; Brooks's absence alone does not establish redistribution or cause. |
| Q3 | Love/Knight/Allgeier snaps, carries, targets and passing-down participation; routes versus protection if charted. | A reception or touchdown alone does not establish a sustained receiving role. |
| Q4 | Williams carries/yards and early-down situations from scoped play-by-play where accessible; down-and-distance consequences. | Yards per carry is not success rate; one game does not establish repeatability. |
| Q5a | Pickens confirmed participation, normal/limited route workload, receiver rotation and target allocation alongside Lamb. | Active status and touchdowns cannot establish a normal route role or fixed target transfer. |
| Q5b | Dallas third-and-long opportunities and actual pressure/protection outcomes, with explicit thresholds and charting definitions. | Preserve the dated situational correction; box scores do not reveal disguised pressure or defender assignments. |

Start with official final-game records, gamebook, inactives, participation and
play-by-play when accessible. Use attributed reporting or transparent charting for
their own scoped claims. Log URL, publisher/provider, publication time if available,
event/sample window, retrieval clock, definitions and failures. Unknown clocks
remain null or explicitly unknown in retained evidence notes. A mirrored report
does not add an independent witness. Read current linked player research before
duplicating work, including the Wilson study linked by #71.

Do not fetch indefinitely to fill a charting gap. After checking an appropriate
primary route and an accessible alternative, record the observed failure and
continue with narrower claims. No invented metrics, new producer runs, paid data
acquisition or provider/source admission is authorized by this pilot.

## Finite checkpoints

- Observation endpoint: this game's verified final whistle. If not final,
  postponed or abandoned, report pending and explain the changed condition.
- First assessment: Sunday November 1 evening, a flexible window around 7 p.m.
  Toronto time. Verify actual completion before collecting postgame conclusions.
- Closeout pass: Tuesday November 3 morning, a flexible window around 8 a.m.
  Toronto time. Evidence deadline for this iteration: November 3 at 10 a.m. EST.
- At the deadline: retain supported/challenged/mixed/unresolved assessments and
  concrete closure, deferral or successor actions. Report a blocked closeout if
  access prevents a faithful account. No automatic extension or recurring monitor.

Schedules are separate operational receipts. Their creation does not prove a run
occurred or that future source/GitHub access will succeed. The issue's setup comment
links actual schedule receipts once created; an unscheduled plan must not be
reported as active monitoring.

## Write and review path

Use branch `codex/game-study-lifecycle-pilot-20261031` and its linked draft PR.
Read that PR, branch head, issue and all current comments before writing. If another
actor is updating the branch, compare changes; never force-push or overwrite their
work. Scope writes to this notebook and its registry. Code/schema/workflow changes
needed by a later run are a separate proposed engineering handoff.

Create dated postgame evidence notes and a closeout report under `retained/`; add
their hashes and IDs to the manifest. Update `assessment_cutoff`, finality witness,
per-question summary, evidence references, limitations and next action. The cutoff
must include all cited captures and final verification and stay within the declared
deadline. Complete means every original question has a disposition; unresolved is
allowed when its evidence gap and next step are explicit. Schema checks certify
neither the source nor the interpretation.

Run `npm ci` as needed and `npm run game-studies:check`, then read back GitHub
records after a successful write. Append one sourced issue checkpoint and keep the
draft PR current; do not duplicate another worker's completed checkpoint. A later
checkpoint appends its own dated report, retaining earlier reports and original
snapshot hashes. Do not edit the original issue body, close #71, merge, enable
auto-merge, admit a claim/source or change a downstream model/service.

When the report is internally complete, record `ready_for_review`, request an
independent substantive review of the exact candidate, and report its actual
status. A request is not a completed review. Review and merge state are established
by external GitHub receipts and Joe's decision, not self-attesting manifest flags.
If independent review is unavailable, leave that explicit and keep the PR draft.

## Pilot acceptance questions

Did the preserved baseline survive? Can a fresh reader trace each assessment to
evidence and the original question? Did missingness stay visible? Can the bounded
study finish without forcing positive findings? Can a potential downstream reader
identify a specific statement, scope and revision while seeing that admission is
still pending? These are workflow questions, not a forecast-accuracy claim.
