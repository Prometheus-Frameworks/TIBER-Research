# Claude + Codex DFS collaboration v1

> **Week 8 handoff update — October 25, 2026:** Apply the [completed pilot review](2026/week-07/collaboration/20261025T132034Z-pilot-handoff-review.md) through the explicit handoffs and [reusable template](HANDOFF_TEMPLATE.md) below. The [Week 7 freeze receipt](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/43#issuecomment-6399077833) records a Codex-authored fallback: Grok completed its question pass; the substantive Claude/Codex revision exchange was absent. This update applies prospectively from Week 8; historical records, schedules and the Sunday freeze rule remain intact.

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

| Stage | Producer → intended recipient | Retained result / next action |
|---|---|---|
| `codex_v1_ready` | Codex → Claude through the current relay | Archive Codex v1; give Claude the versioned common inputs to prepare its own v1, withholding Codex picks until Claude v1 is saved where feasible. |
| `claude_v1_ready` | Claude → Codex / actual relay, then Grok Bot | Archive Claude v1 with exposure disclosed. Once both originals exist, send Grok their immutable references plus separately dated current context. |
| `grok_questions_ready` | Grok Bot → Claude and Codex | Archive Grok's actual prioritized questions; hand each author the same question IDs and exact current candidate for substantive replies. |
| `collaboration_ready` | Claude ↔ Codex; Codex integrates | Retain each author's actual reply and the response to the other's material proposals, decisions and resulting exact candidate. A justified hold is valid. |
| `final_frozen` | Codex → canonical notebook, then display | Archive one supported final before cutoff with truthful authorship, stage status, missing contributions and contribution references. |

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

## A verifiable handoff

Use [HANDOFF_TEMPLATE.md](HANDOFF_TEMPLATE.md) inside the existing dated
collaboration records. A packet may reference an earlier common-input manifest
rather than copy it. Give every request a unique week/round/stage/recipient ID.
Retain the content author separately from the actual sender/poster and relay;
record the intended recipient, exact inputs, actual clocks, expected output and
next action. Use full commit/path locators or retained content with a verified
digest; a branch name or mutable comment alone is not an exact input version.

Keep these facts separate, with evidence or explicit `unknown`/`not received`:

- **Prepared:** the packet and its exact inputs are archived.
- **Posted/sent:** a destination, actual posting time and readback or delivery
  receipt establish what was posted or sent. This establishes neither recipient
  receipt nor execution.
- **Acknowledged:** an attributable recipient reply identifies the handoff ID
  and input versions it received. A relay's own notice is not that reply.
- **Completed:** the recipient's substantive output is archived, attributable
  and bound to the request and inspected inputs. An output can itself acknowledge
  receipt; a separate acknowledgment is unnecessary when those facts are present.

Track receipt and output separately for Claude and Codex when both are addressed.
Keep stage `ready`/`partial`/`blocked` tied to the required work above, not a
notification. A missing acknowledgment stays unknown; it neither proves failed
delivery nor invalidates an otherwise attributable completed output. Keep the
original request and append receipts, replies or corrections with actual clocks.
Retry the same request ID by linking existing records; changed inputs or scope
require a new round/version and a new acknowledgment. Do not replace originals.

Use the existing daily runs/relay to surface the next missing contribution early.
Aim for Grok's questions and both authors' substantive replies by Saturday,
leaving time for an actual exchange before Sunday's final window. This is a
working target, not a schedule change or an extension of the freeze deadline.
If work is absent, record who needs which exact packet and the next relay/check
action; never infer work from a notification or silently wait past cutoff.

## Separate starting drafts

Use the same slate, roster rules and salary cap. Share a verified salary/pool
snapshot when available and record any differences in source coverage or
cutoff. A common-input manifest binds the slate/pool, salary snapshot, scoring
rules, applicable lessons, source cutoff and actual freeze deadline. Unknown
inputs stay explicit. Each author retains its own reasoning and candidate discovery.

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

### Grok Bot review instructions

Give Grok both immutable originals, the common-input manifest and a separately
dated delta packet identifying the current candidate, resolved assumptions,
new evidence and its cutoff. Record exactly which inputs Grok actually inspected;
later candidates are outside that pass unless explicitly included. Preserve the
original drafts and questions verbatim, with attribution and actual/unknown clocks.

Ask Grok to rank only questions with a plausible decision consequence; there is
no count target. Prioritize consequential football assumptions (availability,
role, QB, matchup or game script), missing or stale evidence, shared blind spots,
and salary/package tradeoffs. For each question use the template's question ID,
intended author(s), exact draft claim/version, evidence gap, decision that could
change, and observation that would resolve it. Explain why it matters now and
check whether the delta packet already resolves it; mark a still-useful historical
clarification as such rather than implying the current candidate shares the flaw.

When suggesting a replacement, use verified slate salaries and identify the
funding move, net salary effect and remaining budget. A complete alternative
requires nine eligible, unique selections; label an unverified price or incomplete
package as a question, not an executable lineup. Spending all $50,000 is not a
goal by itself. Compare projections only from one coherent snapshot, or state
that a numerical comparison is unavailable.

Separate **questions**, **opinions/interpretations** and **newly retrieved
evidence**. Draft claims and premises embedded in questions are not verified
facts. A new finding needs its source, publication/update time when available,
retrieval time, applicable window and retained receipt; state what was actually
learned. Out-of-packet evidence gets its own dated delta, never a retroactive
addition to v1. If no fresh sources were inspected, say so. Grok supplies questions,
not a third lineup or final endorsement by default; do not manufacture disagreement.

Another Codex subagent is not evidence that a distinct third model participated.
Codex self-review may still help, but must be called self-review.

### Authors' replies and integration

Claude and Codex can answer through the current relay process. Preserve their
actual responses; do not write either author's agreement on its behalf.
Each names the handoff, inspected candidate/version and material question or
proposal IDs; records accept, decline, hold or unresolved with a reason; and
links any new evidence separately from interpretation. A proposal includes its
whole-lineup salary effect and a complete legal candidate if changing picks.
The other author then responds to material proposals, including a reasoned hold.
Codex retains the disposition and resulting immutable candidate, the source of
each change (new evidence, changed interpretation or constraint correction), and
the next unresolved action. Two isolated replies without an exchange do not
establish joint revision.

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
- Grok Bot's actual questions or an explicit missing-stage note; exact runtime
  identity remains unknown unless observed.
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

Claude contributions currently arrive through the operator's relay; Grok Bot is
the selected third-model questioner. Use the actual available relay and record
its delivery evidence. No verified autonomous cross-provider delivery or provider
subscription is established by this protocol. The documents and Codex task
instructions do not dispatch external models. Completed work requires the actual
contribution; no new schedule or provider integration is established here.

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
