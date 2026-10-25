# DFS collaboration handoff template

Use from Week 8 with [COLLABORATION_V1.md](COLLABORATION_V1.md). Copy only the
applicable sections into the existing
`YYYY/week-NN/collaboration/<actual-UTC-timestamp>-<author>-<stage>.md` record;
use companion JSON when structured data is retained. This blank template is
not a receipt, completed stage, provider dispatch or new schedule.

Replace placeholders with observed facts or explicit `unknown`/`not received`.
Append later receipts and outputs with their actual clocks; preserve the packet,
original drafts and verbatim external contributions. Immutable references mean
full commit SHA plus path, or retained bytes and verified digest. Archive mutable
comment content before relying on it as an exact input.

## Common inputs (prepare once; reference by exact version)

- Manifest ID/version and immutable locator: `<...>`
- Season/week, platform, exact slate/pool and scoring/roster rules: `<...>`
- Salary snapshot: `<immutable file, source, retrieved-at, verified coverage>`
- Budget: `$50,000`; roster: `QB, RB, RB, WR, WR, WR, TE, FLEX, DST`.
- Applicable prior lessons and their limits: `<links or none>`
- Evidence cutoff: `<actual timestamp with offset; source-specific exceptions>`
- Freeze: **before Sunday 12:30 p.m. America/Toronto, or before the first
  included kickoff if earlier**. This slate's actual date/cutoff: `<...>`.
- Missing/unverified inputs: `<...>`

## Request packet (one ID per intended recipient)

| Field | Value |
|---|---|
| Handoff ID | `<season-week-round-stage-recipient>` |
| Completed input stage | `<stage name and immutable readiness receipt, or initial request>` |
| Requested output stage | `<codex_v1_ready / claude_v1_ready / grok_questions_ready / collaboration_ready / final_frozen>` |
| Content author; provider/model | `<attributed author; exact runtime or unknown>` |
| Actual sender/poster; relay/channel | `<actor and destination; distinct from content author>` |
| Intended recipient | `<Claude / Codex / Grok Bot / archive-display destination>` |
| Prepared-at; original generation time | `<actual clocks separately, or unknown>` |
| Exact input manifest | `<immutable locator>` |
| Exact drafts/questions/current candidate | `<IDs and immutable locators; omit other author's picks until own v1 is saved where feasible>` |
| Separate current delta | `<dated locator and cutoff, resolved assumptions, newly retrieved evidence; or none>` |
| Requested work / expected output | `<e.g. Claude: respond to Q IDs and exact candidate, propose a legal alternative or justify a hold>` |
| Requested return target | `<prefer Saturday for substantive replies; working target within existing cadence>` |
| Next action and responsible actor | `<who relays/checks/answers what, using which packet>` |

## Delivery and output receipts (append; never infer)

| Fact | Evidence / actual clock |
|---|---|
| Packet archived | `<immutable request locator>` |
| Posted/sent | `<destination permalink, actual posting time, readback/delivery evidence; or not sent>` |
| Recipient acknowledgment | `<attributable reply naming handoff ID and exact inputs, clock; or not received>` |
| Recipient output | `<author, original/cutoff clocks or unknown, verbatim immutable output and inspected input versions; or not received>` |
| Requested output stage status | `<ready / partial / blocked; required output present and missing>` |
| Next action and actor | `<remaining handoff; next existing run/relay check; fallback at cutoff if needed>` |

Receipt evidence is distinct from output completion. An output may also provide
the acknowledgment when it identifies the request and inputs. Acknowledgment
alone is not substantive work. A missing acknowledgment remains unknown, not
proof of failure. Retry an unchanged request by its existing ID; changed inputs
or requested work require a new round/version and acknowledgment. Record known
exposure to other drafts; never reconstruct a blind v1.

## Grok question pass (attach actual output, without a quota)

State actual inspected versions and research scope first, including whether any
fresh sources were read. Rank consequential questions by their possible effect
on the current lineup. Preserve the original wording; record later clarifications
separately. Use the protocol's [Grok review instructions](COLLABORATION_V1.md#grok-bot-review-instructions).

| Question ID / priority | Intended author(s); exact claim/version | Football assumption or evidence gap | Decision/package at risk; salary consequence | Observation/evidence that would resolve it |
|---|---|---|---|---|
| `<Q1 / priority reason>` | `<Claude, Codex or both; immutable claim>` | `<availability, role, QB, matchup, game script, stale/missing evidence>` | `<hold or change which picks; verified funding/budget effect or explicitly unverified>` | `<specific source/observation and decision trigger>` |

Separate any **opinion/interpretation** from a **new evidence finding**. For a new
finding include source/receipt, publication or update time when known, retrieval
time, applicable window and what it establishes. Put it in a dated delta; never
insert it into an original draft. If the current delta already resolves a claim,
identify that rather than presenting it as an unresolved current assumption.

## Author reply and revision exchange (each author supplies its own)

- Author, request ID, actual reply/cutoff clocks and inspected candidate/version: `<...>`
- Original contribution / known exposure / exact runtime if observed: `<...>`

| Question/proposal ID and author | Accept / decline / hold / unresolved | Reason; new evidence versus interpretation | Whole-lineup effect / immutable resulting candidate | Other author's actual reply / remaining action |
|---|---|---|---|---|
| `<...>` | `<...>` | `<source/delta links; explicit limits>` | `<legal nine and verified salary total/remainder, or justified hold>` | `<attributed reply locator or not received; responsible actor>` |

Codex integrates the actual exchange and retains disagreements. Two isolated
answers or adopting an initial draft do not establish joint revision.

## Candidate endorsement and freeze handoff

- Exact integrated candidate: `<immutable locator, salary manifest, expectation IDs>`
- Exchange basis: `<both authors' contributions and responses, or missing-stage flags>`
- Claude endorsement: `<explicit own statement + exact candidate + clock, or not received>`
- Codex endorsement: `<explicit own statement + exact candidate + clock, or not received>`
- Authorship label: `<shared / Codex revision informed by Claude / Codex-authored fallback, supported by actual work>`
- Use **jointly endorsed** only for two explicit endorsements of this exact version.
  A later material change requires new version-bound endorsements.
- Final editor / next action: `Codex: archive the supported final before the existing cutoff; bind candidate, original salaries, expectations, actual time and missing stages, then verify display publication separately.`
- If exchange is missing: `Freeze a supported Codex-authored fallback on time; otherwise use the existing partial/missed-freeze procedure.`

Retain late replies at their actual times for later review; they cannot alter a
valid freeze or retroactively supply participation. Existing daily research around
6 a.m. and Sunday final selection around 10:30 a.m. Toronto remain flexible
windows. This template configures no delivery service, subscription or automation.
