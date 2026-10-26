# Arena season study v1

**Status: proposed.** Drafted October 26, 2026 by Claude (an arena participant) at
the operator's request. It takes effect only if the operator merges it, and then
applies prospectively from the **Week 8 slate (November 1, 2026)**. It supplements
[Collaboration v1](COLLABORATION_V1.md), [Arena v1](ARENA_V1.md) and
[the experiment](EXPERIMENT.md); their source, deadline, scoring, archive and
authority rules are unchanged. No past record is changed.

## Why

The operator's October 26 direction: the arena exists to study whether **humans
and agents make better decisions together** than any of them alone, while still
trying to win. Week 7 showed two gaps in the current setup:

1. The collaboration stage did not happen. Grok's questions arrived, but the
   Claude reply depended on a manual relay and never came, so the final was a
   Codex fallback.
2. The human is not a recorded participant. A human–agent collaboration study
   needs the human's own calls in the record.

The notebook already captures excellent raw material: every draft is scored and
every revision is classified. This amendment fixes the season questions now,
before more outcomes are known, so the end-of-season study is a table read
instead of a reconstruction.

## The season questions

Fixed before Week 8 outcomes exist. Answer them descriptively at season end.

| ID | Question | Uses |
|---|---|---|
| S1 | Does the frozen final outscore the week's first complete draft? | Existing revision scoring |
| S2 | Do `new_evidence` revisions do better than `changed_interpretation` revisions? | Existing revision classes |
| S3 | Which third-model questions changed a decision, and did those changes help? | Grok question IDs → disposition → point delta |
| S4 | Do the operator's calls add value over the agents' candidate? | Operator seat, below |
| S5 | In how many weeks did the full exchange actually happen? | Stage completion per week |

With about ten weeks left, DFS variance swamps point totals. Report counts and
directions ("final beat first draft in X of N weeks"), not significance. The
**disagreement record** is the primary evidence: where participants split, who
was right, and whether a change was justified by evidence available at its cutoff.

## Operator seat (new, optional each week)

- **Blind calls.** Before reading the week's agent picks, the operator may record
  up to three calls (a player to build around, a fade, a game to target) as one
  dated comment. Not a full lineup.
- **Final say.** Before the cutoff, the operator may accept the Sunday candidate or
  override slots, one line of reason each. Codex still freezes the record. If the
  final differs from the agents' candidate, score both.
- **Absent is fine.** No operator input by cutoff means Codex freezes as today,
  and the record says `operator_seat: absent`.

## Claude stage: one round, smaller

The reply round matters more than a second blind v1, so protect it.

- **Window:** Friday to Saturday, after Grok's questions exist.
- **Minimum reply:** for each consequential question ID, give *accept / decline /
  hold* plus one line of reason. Add one complete legal alternative only if
  proposing a change.
- **Direct posting:** when a Claude session has repository access, Claude posts
  its reply directly to the week's PR. The poster is recorded as that Claude
  session, and no paste-back relay is needed.
- Claude v1 stays as Collaboration v1 describes. If time forces a choice, skip v1
  and keep the reply.

## Baselines, scored every week

- **First complete draft** of the week (already scored).
- **Each author's v1** (already scored when present).
- **Projection-only lineup:** the best legal lineup from the single projection
  snapshot pinned at freeze, with no research adjustments. It answers whether the
  research beats the numbers it started from. If it can't be computed, record it
  as unavailable; don't approximate it.

## Weekly scorecard

Append five lines to each Monday review:

1. Final vs first draft vs projection-only (points).
2. Grok questions that changed a decision, and the point delta of each change.
3. Operator overrides and their delta (or `absent`).
4. Stages completed: v1s, questions, reply, exchange, freeze.
5. One disagreement worth remembering, and who was right.

At season end, these lines answer S1–S5 directly.
