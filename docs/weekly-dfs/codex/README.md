# Codex weekly DFS notebook

A public notebook of operator-requested, hypothetical NFL DFS lineups authored by
Codex. The goal is to make the research inspectable: preserve the initial choices,
the reasons for changing them, the final pregame lineup, and the later outcome.

## Weekly index

| Season / week | Slate | Pregame record | Lineup data | Results |
|---|---|---|---|---|
| 2026 / Week 6 | DraftKings Sunday main, October 18 | [Draft, self-review and final lineup](2026/week-06.md) | [JSON](2026/week-06.json) | Pending |

## A weekly entry

1. Establish the platform, exact slate, scoring rules, salary cap and information
   cutoff. State which of those were directly verified.
2. Build v1 from current public evidence. Keep source observations, attributed
   projections and Codex's own judgment distinguishable.
3. Review salary allocation, role assumptions, injuries, slate eligibility and
   concentration. This is a **self-review** unless a separately identified
   reviewer actually reviews the entry.
4. Preserve both drafts and every replacement with its reason. Check the roster,
   arithmetic and available alternatives before recording v2.
5. After the games, append dated results using verified DraftKings scoring.
   Compare the same frozen players in v1 and v2. Explain role and opportunity
   changes as well as points, and preserve misses.
6. Carry a specific lesson or tool limitation into the next requested entry.

A directory is a place to accumulate weekly work; this change does not create a
recurring task or unattended execution. Future entries and any schedule follow
the operator's instructions.

## File conventions

- `YYYY/week-NN.md`: readable pregame record, source register and appended
  postgame review.
- `YYYY/week-NN.json`: the same lineup identities, published salaries, source
  IDs, arithmetic and explicit pending result fields. The format is a notebook
  convention, not a new validated Research contract.
- Record date-only timestamps as date-only. Never reconstruct a precise historical
  cutoff, retrieval instant or source digest from memory.
- Keep original v1/v2 selections and reasoning intact. A correction or later
  Sunday update gets a dated amendment; an alternative is not silently substituted
  after its outcome is known.
- Leave actual scores and unavailable IDs null until verified. Do not add
  projections from different providers into a purported common-model forecast.

## How to evaluate the work

Track both versions' actual points, points per $1,000 of salary, and the point
difference attributable to each revision. Those comparisons describe this
experiment; they do not establish predictive skill after one week.

For each important assumption, ask whether the expected role materialized, whether
the evidence available before the game supported it, and what changed after the
snapshot. Separate a reasonable process with a poor outcome from an unsupported
claim that happened to score well.

A hindsight optimal-lineup comparison would additionally require the complete
original slate pool, its original salaries and verified actual scoring. Without
those inputs, do not claim an optimality gap, contest percentile or return.

## Workspace and tool priorities

These are proposed improvements, not implemented capabilities:

| Priority | Capability | What it would improve |
|---|---|---|
| 1 | Complete official slate and salary import with stable player IDs and retrieval time | Exact eligibility, salary validation, and a reproducible starting pool |
| 2 | Source-linked injury/status snapshots plus qualified, read-only ROP/TTS context where useful | Better role assumptions and a visible information cutoff; descriptive evidence remains descriptive |
| 3 | Verified scoring/results importer | Honest v1/v2 scoring and an append-only outcome review |
| 4 | One coherent projection baseline and a salary-cap optimizer | A measurable baseline against which Codex's departures can be explained |
| 5 | Accumulated decision/error log | Evidence for which research habits or tools improve the work |

The first useful additions are the salary pool and results scorer. A more
elaborate optimizer cannot repair an incorrect player pool or unverified scores.

## Repository boundary

These are conversational research notes in `docs/`, not activated or sealed
governed Research runs. They do not establish independent review, admitted
evidence, a forecasting edge, or authority for downstream action. Repository
contracts and the existing Ops/Research ownership remain in force. Publication
of the Week 6 notebook was requested by the operator.
