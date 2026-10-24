# TIBER weekly DFS notebook

**Start each pass with [Claude + Codex collaboration v1](COLLABORATION_V1.md), [Arena v1](ARENA_V1.md), and the source and scoring boundaries in [EXPERIMENT.md](EXPERIMENT.md).**

From October 22, 2026, the standing workflow is **separate Claude and Codex v1s → third-model questions → joint revision → one shared Sunday submission**. Codex remains the final editor and executor of the existing scheduled tasks. Claude contributions currently arrive through the operator; the third model is still to be selected. The [collaboration protocol](COLLABORATION_V1.md) records attribution, missing-input behavior and the distinction between this workflow and automated provider execution.

Codex chooses useful football questions and alternatives within the standing assignment; no new operator shortlist or per-pick approval is needed. No quotas for questions, revisions or lessons.

**From the October 25, 2026 slate:** freeze by Sunday **12:30 p.m. America/Toronto**, or before the first included kickoff if earlier. The existing Sunday run remains around 10:30 a.m. and must finish before the deadline. Historical Week 6 noon and early Week 7 fields remain unchanged.

Read [the journal convention](SITE_FEED.md#research-journal-extension) and the relevant [retained journal](journal/) before choosing research priorities. Carry applicable unresolved questions and provisional findings forward. Preserve expectations before freeze, then review opportunity, conditions, score causes and cutoff-grounded judgment separately.

A public notebook for the [DFS Research Arena](EXPERIMENT.md): observe agents
researching a changing football environment under a salary budget and deadline.
Preserve the daily choices, evidence, revisions, final freeze and later outcomes.
The operator's objective is to study agent behavior; profit and contest entry
are outside the experiment.

## Weekly index

| Season / week | Slate | Pregame record | Lineup data | Results |
|---|---|---|---|---|
| 2026 / Week 6 | DraftKings Sunday main, October 18 | [Draft, self-review and final lineup](2026/week-06.md) | [JSON](2026/week-06.json) | [Provisional October19 comparison](2026/week-06/reviews/2026-10-19.md) |

## A weekly entry

1. Establish the platform, exact slate, scoring rules, salary cap and information
   cutoff. State which of those were directly verified.
2. Preserve Claude's and Codex's separate v1s with actual authorship, source
   clocks and any known exposure to the other draft. For future slates, save
   each v1 before inspecting the other's picks.
3. Retain the named third model's material questions and exact input references.
   If that contribution is absent, record the missing stage; self-review remains
   self-review.
4. Preserve the actual Claude/Codex responses, useful investigations, whole-lineup
   alternatives, decisions and unresolved disagreements.
5. Codex archives one supported Sunday final before the deadline, with its exact
   contribution history and truthful shared or fallback label. Keep every
   original draft and revision.
6. After the games, compare the starting drafts and final using verified
   DraftKings scoring and original salaries. Assess role assumptions and
   cutoff-grounded judgment separately from points.
7. Carry a specific, qualified lesson or tool limitation into the next entry.

The October 17 follow-up requests daily research, a fixed final freeze and a
score record. Two scheduled task configurations now support the cadence in
[EXPERIMENT.md](EXPERIMENT.md). Future runs must establish their own successful
source access, research and archival publication; scheduling alone is not a
successful research run.

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

Track both authors' starting drafts and the final selection's actual points,
points per $1,000 of salary, and the point difference attributable to each revision. Those comparisons describe this
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
| 4 | One coherent, versioned projection baseline | An attributed comparison for the agent's own selections and departures |
| 5 | Accumulated decision/error log | Evidence for which research habits or tools improve the work |

The first useful additions are the salary pool, constraint checker and results
scorer. Reliable snapshots and outcome capture support the research arena while
source gaps and tool changes remain visible.

## Repository boundary

These are conversational research notes in `docs/`, not activated or sealed
governed Research runs. They do not establish independent review, admitted
evidence, a forecasting edge, or authority for downstream action. Repository
contracts and the existing Ops/Research ownership remain in force. Publication
of the Week 6 notebook and the subsequent daily observational experiment was
requested by the operator.

## Daily snapshots

- [2026 Week 6 — October 18 morning candidate](2026/week-06/daily/2026-10-18.md): Likely replaces Allgeier; $49,700, official salary export verified. [JSON](2026/week-06/daily/2026-10-18.json)

## Final freezes

- [2026 Week 6 — October 18 final freeze](2026/week-06/freeze/20261018T151704Z.md): morning nine retained; $49,700, $300 remaining. [JSON](2026/week-06/freeze/20261018T151704Z.json)

## Current trajectory and research journal

- [Week 7 Tuesday daily draft](2026/week-07/daily/2026-10-20.md): $49,400, $600 remaining; estimates unavailable. [Monday complete baseline](2026/week-07/daily/20261019T113232Z.md) remains operator-prompted.
- [Journal setup annotation](journal/20261020T131310Z.md): later summaries of already archived work, not a new football pass or reconstructed pregame record.
- New runs append `journal/<actual-UTC-timestamp>.md` and companion JSON, linked to immutable lineup records. Read current journal entries and applicable earlier outcome reviews; don't rely solely on this index being manually updated.
- The private [observer Site](https://tiber-dfs-arena.jmas-tiber.chatgpt.site) reads the stable feed and shows the selected lineup's linked investigations, expectations and reviews. It does not research continuously.
