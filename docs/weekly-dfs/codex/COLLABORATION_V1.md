# Claude + Codex DFS collaboration v1

Recorded October 22, 2026 at 09:59:52 America/Toronto
(`2026-10-22T13:59:52Z`). Applies prospectively, beginning with the
October 25 Week 7 slate.

The operator's adopted workflow is: **Claude and Codex each complete a v1; a
third model asks questions; Claude and Codex work toward one shared Sunday
submission.** Preserve the separate starting views and the evidence behind
the final integration.

This supplements [Arena v1](ARENA_V1.md) and [the experiment](EXPERIMENT.md).
It supersedes their Codex-only participation and single-author final-selection
language for subsequent work. Their source, scoring, archive, public-record and
deadline rules continue to apply. Earlier dated decisions remain unchanged.
These are hypothetical research submissions.

## Roles and handoffs

| Stage | Work | Retained result |
|---|---|---|
| Separate v1s | Claude and Codex each build a complete lineup and explain the important assumptions, alternatives and uncertainty. | Two attributed drafts with their original selections, evidence cutoffs and source references. |
| Third-model questions | A separately identified model reads both drafts and challenges material assumptions, missing evidence and overlooked alternatives. | Its actual questions, the draft versions inspected, and any supporting evidence. |
| Joint revision | Claude and Codex respond to the consequential questions, investigate where useful and compare complete lineup alternatives. | Their actual contributions, accepted or declined proposals, unresolved disagreements and a shared candidate. |
| Sunday submission | Codex acts as final editor and archives one supported lineup with its contribution history. | One final freeze before the deadline, with truthful authorship and stage-completion status. |

The third model's role is to ask useful questions. A central prompt is:
**What are both drafts assuming that could be wrong, and what evidence would
change the lineup?** It may also examine why the drafts differ, identify an
alternative both missed, or question the source quality behind an apparent
agreement. Ask only consequential questions; there is no quota or requirement
to manufacture disagreement. A question should explain its possible effect on
a player role, salary allocation, correlation or the complete lineup.

The third model is not automatically the final selector or a tie-breaker.
Agreement by several models is not new football evidence. Codex remains
responsible for the final record and deadline; the operator need not approve
routine hypothetical picks.

## Separate starting drafts

Use the same slate, roster rules and salary cap. Share a verified salary/pool
snapshot when available and record any differences in source coverage or
cutoff. Each author retains its own reasoning and candidate discovery.

For future slates, each author should save its first complete v1 before reading
the other's current-week picks. Shared rules and factual source material can
be read first. If exposure occurred, record it; do not regenerate a draft and
call it blind. Subsequent drafts receive new versions rather than replacing
v1. A partial board remains partial until enough information supports a
complete lineup.

For each contribution, retain:

- Author, role, and actual provider/model identity when known; otherwise unknown.
- Original generation/decision time and evidence cutoff when known, separately
  from the time a relayed contribution was received or archived.
- Exact slate and salary-source references; the nine selections, salaries and
  arithmetic for a complete draft.
- Inspected source links, key assumptions, uncertainty, strongest counterargument
  and observations that would change the view.
- Known exposure to other drafts and material operator input.

A provider's rough estimate stays an attributed estimate. Do not compare it
as if it were another provider's calibrated forecast or combine incompatible
projections into a team total.

## Questions, responses and final integration

Retain each third-model question with its actual author, time and the exact
drafts it inspected. Another Codex subagent is not evidence that a distinct
third model participated. Codex self-review may still help, but must be called
self-review.

Claude and Codex can answer through the current relay process. Preserve their
actual responses; do not write either author's agreement on its behalf.
Record whether a material proposal was accepted, declined or remains
unresolved, why, and what it changes in the whole lineup. New evidence and a
changed interpretation remain distinguishable. A justified hold is valid.

**Shared** means that both authors contributed to a substantive revision
exchange and the final record explains how their work informed the integrated
candidate. It does not require unanimity on every pick. Codex may make the
final editorial choice while preserving a disagreement. Use **jointly
endorsed** only when both authors explicitly endorse that exact final version;
a material later change does not inherit an earlier endorsement.

Reading Claude's initial v1 and revising a Codex lineup without an actual
exchange is **Codex revision informed by Claude**, not completed joint work.

## Deadline and missing contributions

From the October 25, 2026 slate, finish and archive the final selection
**before Sunday 12:30 p.m. America/Toronto, or before the first included kickoff
if earlier**. The existing Sunday run remains around 10:30 a.m.; that is a
flexible execution window, not a guarantee. Collaboration does not extend the
deadline.

| State before the cutoff | Action and label |
|---|---|
| Actual Claude/Codex exchange and a supported complete candidate | Freeze one shared final, retaining unresolved questions. |
| Shared candidate exists but the third-model pass is absent | Freeze as shared, explicitly stating that third-model review is missing. |
| No substantive Claude/Codex revision exchange | Use a supported complete Codex-authored fallback if available; identify any Claude influence and mark collaboration incomplete. |
| No supported complete candidate, or the freeze is missed | Follow the existing partial/missed-freeze procedure; do not reconstruct a timely final. |

A missing model response is a missing stage, not permission to fabricate
participation or wait past the cutoff. Later contributions receive their actual
new timestamps and may inform outcome review or future research. They cannot
alter an already valid frozen selection or retrofit participation into it.

## Record and display conventions

Keep records in the existing `docs/weekly-dfs/codex/` notebook. Its folder
name is a retained storage path, not a claim that every future contribution is
Codex-authored. Separate authorship from the account or agent that posts a
relayed contribution.

Use the existing dated daily, journal, freeze and review files, with companion
JSON where applicable. If preserving an external contribution verbatim needs
a separate receipt, use
`YYYY/week-NN/collaboration/<actual-UTC-timestamp>-<author>-<stage>.md`
and a companion JSON when structured data is retained. Label receipt time
separately from unknown original time. A receipt or setup note is not a fresh
football investigation.

The weekly collaboration record can be a lightweight dated notebook/journal
entry. Include:

- Immutable references to both starting drafts and later input versions.
- Actual third-model identity or `to be selected`, its questions or an explicit
  missing-stage note.
- Attributed responses, material decisions and unresolved questions.
- The current candidate and completion status of each stage.
- For the freeze, the exact chosen lineup, final editor, contribution references,
  relevant expectation IDs, salary snapshot, actual cutoff and any fallback.
- The next useful handoff if another participant's contribution is still needed.

Archive inputs and the final decision before publishing their display copies.
Do not depend on a mutable comment alone for the exact input to a final freeze:
retain its supplied content in a dated receipt or identify an immutable source.
Do not invent missing source clocks.

Use existing [Site feed fields](SITE_FEED.md#collaboration-display) for truthful
display attribution. A shared final uses `kind: "freeze"`; `label`,
`summary`, `counterargument` and the linked journal can describe contributors
and missing stages. Roster `status` and collaboration completion are different
facts. No new feed enum or Site deployment is required for this textual
representation. The full canonical notebook remains authoritative.

## Execution now

The existing Codex daily and Sunday tasks perform Codex's research, respond to
available contributions, preserve the next handoff, and archive/display the
result. Their schedules and bounded research scope remain unchanged.

Claude contributions currently arrive through the operator's relay. The
**third model is to be selected** and its contribution channel is not yet
configured. This document and the Codex task instructions establish the
workflow; they do not create autonomous cross-provider execution. Do not claim
an external model was dispatched, or a stage completed, without the actual
contribution. No new schedule or provider integration is established here.

Future scheduled writes continue to be documentation/data through the existing
guarded notebook and stable-feed branches. Existing limits on production code,
deployment, purchases, credentials and real contest/roster actions remain.

## Week 7 adoption record

This is a record of the starting state at adoption, not a claim that the new
workflow has already completed.

- **Codex:** preserve the earlier Week 7 trajectory. The
  [October 22 daily](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/5df4415a62789b6300694bbc5d7febe981b658d8/docs/weekly-dfs/codex/2026/week-07/daily/2026-10-22.md)
  is the current pre-collaboration baseline; it is not being relabeled as the
  week's original v1.
- **Claude:** preserve its supplied v1 and attribution in the
  [participation/intake comment](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/43#issuecomment-6342360263).
  Claude read PR #43 before drafting, so this is not a blind comparison.
  Its original generation time and evidence cutoff are unknown. The comment
  was posted at `2026-10-22T13:47:43Z`; that is a publication time.
- **Third-model questions:** pending; no model selected or question pass
  completed under this protocol.
- **Joint revision and Sunday shared final:** pending. The previously identified
  Noel/Dell, CMC/Kittle/Kirk and Marks/Braelon questions can inform the next
  research pass; they do not count as a completed third-model contribution.

This dated adoption supersedes the earlier comment's statement that the
shared-team arrangement was still undecided.

## Learning after the slate

Score the two starting drafts, retained intermediate lineups and final freeze
using the same verified scoring rules and original salaries. Preserve unknowns
and stat corrections. Examine which assumptions survived, which questions
changed a decision and whether each change was justified by evidence available
at its actual cutoff.

A higher-scoring final does not by itself establish that collaboration improved
reasoning: it also had later information and more opportunities to revise.
Keep outcome comparisons, evidence quality and participation completeness
separate. Retain supported holds and unresolved disagreements as well as
successful changes.
