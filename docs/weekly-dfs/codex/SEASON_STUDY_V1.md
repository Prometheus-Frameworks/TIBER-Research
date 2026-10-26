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
| S4 | How did the operator's final overrides change the candidate's realized score? | Frozen pre-override candidate versus final |
| S5 | In how many weeks did the full exchange actually happen? | Stage completion per week |

With about ten weeks left, DFS variance swamps point totals. Report counts and
directions ("final beat first draft in X of N weeks"), not significance. The
**disagreement record** is the primary evidence: where participants split, who
was right, and whether a change was justified by evidence available at its cutoff.

## Operator seat (new, optional each week)

- **Blind calls.** Before reading the week's agent picks, the operator may record
  up to three calls (a player to build around, a fade, a game to target) as one
  dated comment. These are qualitative input, not a full lineup. Record the calls
  and which candidate versions were exposed to them; their influence may already
  be present in the agents' later candidate.
- **Final say.** Before the cutoff, the operator may accept the Sunday candidate or
  override slots, one line of reason each. Before applying overrides, Codex
  archives the exact complete legal candidate, its salary-snapshot reference,
  actual decision/cutoff clocks and known operator input. Codex then archives the
  complete legal final and both immutable locators before the existing deadline.
  Score both later under the same slate and rules. **S4 = final points minus
  pre-override candidate points**; it describes the realized override delta.
  If a comparable retained candidate is missing, mark S4 unavailable rather than
  reconstructing it after results. Record no override explicitly; its delta is
  zero only when a supported candidate was retained unchanged.
- **Participation.** Record blind calls, acceptance and overrides separately.
  Blind calls without an override still count as operator input. No operator
  input by cutoff means Codex freezes as today and records `operator_seat: absent`.

S4 measures final overrides only. Blind-call influence remains qualitative;
these comparisons do not isolate the operator's total contribution or establish
that the combined team beats a human-only lineup.

## Claude stage: one round, smaller

The reply round matters more than a second blind v1, so protect it.

- **Window:** Friday to Saturday, after Grok's questions exist.
- **Minimum reply:** for each consequential question ID, give *accept / decline /
  hold* plus one line of reason. Add one complete legal alternative only if
  proposing a change.
- **Direct posting:** when a Claude session has repository access, Claude posts
  its reply directly to the week's PR. The poster is recorded as that Claude
  session, and no paste-back relay is needed.
- **Missing-v1 path:** prefer a separate Claude v1 under Collaboration v1, but
  if it is absent at the Friday–Saturday question handoff, send Grok the retained
  Codex v1, exact current candidate, common-input manifest and separately dated
  delta packet, with `claude_v1: absent`. Do not wait for a second original.
  From Week 8, this exception supersedes the two-original prerequisite in
  Collaboration v1's handoff table and Grok instructions. Give both authors the
  resulting question IDs and exact candidate for their replies and actual
  exchange. Keep the missing v1 and its score unavailable; never reconstruct a
  blind draft after exposure. Questions, replies and exchange can complete on
  their actual evidence while the separate v1 remains absent. Existing shared,
  jointly endorsed and fallback requirements still apply.

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
3. Operator inputs received; overrides and S4 delta (`none`, `absent` or
   `unavailable` where applicable), with blind calls assessed qualitatively.
4. Stages completed: v1s, questions, reply, exchange, freeze.
5. One disagreement worth remembering, and who was right.

At season end, these lines answer S1–S5 directly.
