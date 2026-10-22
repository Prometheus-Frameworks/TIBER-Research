# DFS Site feed

The private observer Site is [TIBER DFS Research Arena](https://tiber-dfs-arena.jmas-tiber.chatgpt.site).
It reads `docs/weekly-dfs/codex/site-feed.json` on the stable
`codex/weekly-dfs-feed` branch in `Prometheus-Frameworks/TIBER-Research` through
its server. Daily research and
Sunday-freeze tasks maintain that materialized view alongside their immutable
notebook records. Updating the data does not require republishing the Site.

## Existing records

The two October 17 seed entries preserve the original Week 6 selections and
reported salary totals. Their projection fields were added for the Site from
one Splash Play / SPAGS snapshot dated October 17, 11:30 a.m. ET. The later
annotation time is recorded explicitly. The original `2026/week-06.md` and
`2026/week-06.json` remain unchanged.

## Update transaction

1. Re-read the active notebook PR or default-branch state, this document and the
   complete current `site-feed.json` with its blob SHA.
2. Archive the daily/freeze research snapshot first. Preserve its immutable
   locator and actual decision timestamp.
3. Append a corresponding entry to `snapshots`. Keep every existing entry, ID,
   date, selection, salary, projection snapshot and rationale intact. A correction
   creates a new entry with a new ID and a documented predecessor.
4. Update `updated_at` and the next scheduled date where known. Publish a guarded
   update on the notebook branch and read it back. Record that immutable archive
   commit as `archive_commit` in the display copy.
5. Re-read the head and complete feed on `codex/weekly-dfs-feed`, preserve all
   existing snapshots, and publish the display copy there using its observed head
   as an expected-SHA lease. Do not force-push, merge or redeploy the Site. If the
   lease fails, re-read and reconcile before retrying; do not discard other runs.
6. Read back both writes and their commits. Report research archival and Site-feed
   publication separately. A display-feed failure must not be disguised as a
   successful Site update; an archived research result still remains valid.

Later verified scores can be added to this display view with explicit scoring
sources, `scored_at` and provisional/final/corrected status; retain the original
immutable pregame records and dated postgame review separately. Do not change
the pregame picks or estimates when adding actual scores.

The stable feed branch is a display-only materialized view. Research continues
through documentation notebook PRs, including successors after PR #43 is merged.
The Site never depends on PR discovery or merging a notebook. A missing stable
branch is an update failure to report, not permission to recreate research history.

## Feed contract

The supported convention is `schema_version: "tiber-dfs-site/v1"`. Root fields:

- `updated_at`: actual ISO timestamp of the feed update.
- `archive_commit`: optional immutable research archive commit represented by the display copy.
- `timezone`: `America/Toronto`.
- `research_url`, `protocol_url`: HTTPS links.
- `next_scheduled_date`: optional real ISO calendar day.
- `snapshots`: all saved display entries, each with a unique ID.

Each snapshot has:

| Field | Meaning |
|---|---|
| `id` | Unique stable snapshot identity; never reuse for changed pregame content |
| `date` | Actual Toronto decision day, YYYY-MM-DD |
| `recorded_at` | Actual ISO decision time, or null for the existing date-only seed |
| `time_precision` | `date_only` for the seed; use a precise observed time for new runs |
| `order` | Increasing integer within that day, used to order editions |
| `label`, `kind` | Short edition label; `daily`, `freeze` or existing `seed` |
| `status` | `complete` or `partial` |
| `season`, `week`, `slate_date`, `slate_label` | The selected real NFL slate |
| `platform`, `salary_cap` | `DraftKings`, 50000 |
| `salary_total`, `salary_remaining` | Recomputed from the recorded picks |
| `projected_total` | Sum only when all nine estimates share the declared model snapshot; otherwise null |
| `actual_total` | Verified scoring total when complete; otherwise null |
| `frozen` | Boolean; only a complete genuine final selection can be true |
| `official_pool_verified` | Boolean reflecting actual source verification |
| `projection` | One declared provider/model snapshot, or null |
| `picks` | Array of selected players, in roster order |
| `summary`, `counterargument` | Brief public rationale and strongest uncertainty |
| `revisions` | Replacements, their cost deltas and reasons |
| `archive_url` | Immutable HTTPS link to the archived research record |

Each pick records `slot`, `position`, `player`, `team`, `opponent`, boolean
`home`, integer `salary`, `projected_points`, `actual_points`, `rationale`
and an optional HTTPS `projection_source_url`. FLEX eligibility is RB/WR/TE;
other positions match their slot. Team codes use the notebook's displayed NFL
abbreviations. Missing point values are null, never a fake zero.

A complete roster is QB, 2 RB, 3 WR, TE, FLEX, DST. Partial boards may contain
fewer selections, must say `status: "partial"`, and cannot be frozen. Keep
unknown prices out of the priced selections rather than assigning zero.

Projection metadata needs `provider`, `model`, ISO `as_of`, `source_url`,
and the actual observation/annotation time where known. Use a single coherent
external model and scoring basis per snapshot. If one cannot be retrieved, use
`projection: null`, player `projected_points: null` and
`projected_total: null`; the page will display the gap. Do not average or add
incompatible providers, invent Codex forecasts, backfill an earlier decision
with a later model snapshot, or change estimates after games begin.

Each revision has `from`, `to`, numeric `salary_delta`, `reason` and, when
applicable, the protocol's `classification`. A justified hold uses an empty
revision list and a clear summary.

## Display and limits

The Site validates roster structure, duplicates, budget arithmetic, declared
projection totals and source URL schemes. These checks do not certify the
football facts or official platform eligibility. It reads the stable display branch,
checks for updates when opened or refreshed, and labels any saved fallback.
It performs no background research, contest entry or roster transaction itself.

The app and its read-only API are owner-private. The notebook feed remains part
of the operator-requested public research record; never add private league,
account, credential or personal context to it.

## Research journal extension

Effective October20, 2026; additive to `tiber-dfs-site/v1`. Older feeds without these fields remain valid and display explicit absence. Do not add journal fields to original snapshots to invent history.

Optional root fields:

- `arena`: `protocol_url`, `effective_slate_date` (2026-10-25), `deadline_timezone` (America/Toronto), `sunday_deadline` (12:30), `deadline_rule` and `historical_deadline_note`. These govern prospective work; do not rewrite historical deadline fields.
- `journal`: append-only array of independently timestamped entries. The selected lineup displays entries whose `snapshot_ids` include its exact ID. Additional same-day research uses a new ID and actual UTC filename. Never replace a prior entry to change its conclusion.
- `research_checks`: optional actual publication-check timestamps only when observed. Not required and not a claim of continuous monitoring.

Archive first as `journal/<actual-UTC-timestamp>.md` plus JSON with `schema_version: "tiber-dfs-journal/v1"` and `entries`. A file may hold related entries from one pass. Only after verified notebook readback, append those entries to the full feed with immutable `archive_url` and `lineup_records` links. Guard notebook/feed and stable-branch writes independently. Preserve concurrent entries as well as all prior snapshots; ID collisions with different content require reconciliation, never overwrite. Copy the complete journal history on both branches.

### Entry fields

| Field | Convention |
|---|---|
| `id`, `snapshot_ids` | Stable unique ID and nonempty list of exact existing lineup IDs; no dangling links |
| `kind` | `scheduled_research`, `interactive_research`, `later_annotation`, `outcome_review` |
| `recorded_at`, `recorded_at_toronto` | Actual UTC and Toronto clocks for this entry; `research_at` is the actual investigation time or null |
| `origin` | `agent_chosen`, `operator_prompted`, `mixed`, `unknown`; concise `origin_note` records material influence without private details |
| `original_work_origin` | Optional attribution of earlier summarized work; distinct from why the annotation exists |
| `title`, `question`, `why_it_matters` | What was investigated and why; annotation titles/questions explicitly say later summary |
| `findings`, `interpretation` | Array of concise evidence observations; separate public agent interpretation |
| `alternatives`, `uncertainty` | Competing explanations/choices and limits |
| `lineup_effect` | Changes, whole-lineup salary/concentration consequences or justified hold |
| `change_triggers`, `carry_forward` | Observable reasons to revisit and applicable questions/provisional lessons; no quotas |
| `sources` | Array of `id`, `label`, HTTPS `url`, actual `retrieved_at`, nullable `publication_at`, and `scope`; retrieval is not publication |
| `lineup_records`, `archive_url` | Array of `snapshot_id`/immutable HTTPS `url`; immutable journal notebook URL |
| `annotation_of`, `original_evidence_cutoff` | For later explanations, original source record and its actual cutoff or null |
| `expectations`, `outcomes` | Optional arrays below; empty/missing means absent, not zero or success |
| `supersedes_entry_id` | Optional prior journal ID for a new correction; retain both entries |

### Pregame expectations

In the actual pregame research/freeze entry, use stable expectation IDs; record `id`, `subject`, `statement`, `support`, `uncertainty`, `challenge`, `observe`, `source_urls`, and `recorded_at`. The expectation is a role/condition claim, not necessarily a point prediction. `observe` names the available postgame measure or marks it unassessable; use numerical thresholds only when evidence supports them. Missing routes/snaps stay missing.

Freeze references exact expectation IDs and their immutable notebook locator, as well as exact selected lineup and original salary snapshot. This binding must be retained before the applicable deadline. An older draft's later annotation cannot masquerade as its original pregame expectations. A setup annotation has no new football expectations.

### Outcome review

Append new `outcome_review` entries after games, linked to every relevant original snapshot and exact expectation IDs. Each `outcomes` item records `id`, nullable `expectation_id`, `expectation`, `opportunity_assessment`, `conditions_assessment`, `score_explanation`, `cutoff_judgment`, `status` (`provisional`, `final`, `corrected`, `unassessable`) and `source_urls`. Compare anticipated opportunity, whether supporting conditions held, what produced the score and whether the judgment was reasonable on its actual pregame evidence. Use supported/contradicted/unassessable distinctions; preserve failures and unknowns. A legacy assessment may have null expectation ID and must be labeled as such, never reconstructed into a prior expectation.

Scoring still uses the existing exact-rule source/bonus/DST convention; keep scores and estimates distinct. Append material corrections with a predecessor, correction reason and original scoring state intact in the dated notebook. Carry provisional lessons forward with sources, limits and applicability; no universal rule from one result.

The initial 20261020T131310Z journal is a later setup annotation of retained Tuesday/Monday decisions and the existing Week6 review. Its own clock does not alter their cutoffs or claim a new investigation.

The one-time October20 Site implementation does not expand scheduled authority: future runs only maintain documentation, dated journal records and the guarded display feed. No app code/deployment, Claude dispatch, new schedule or integration.

## Collaboration display

From October 22, 2026, [Claude + Codex collaboration v1](COLLABORATION_V1.md)
governs prospective participation and final ownership. Preserve historical
snapshot authorship and dates. The existing feed schema can represent the
new workflow through its current text fields:

| Field | Use |
|---|---|
| `label` | Use `Shared final — Claude + Codex` only after an actual revision exchange; otherwise identify the Codex-authored candidate or fallback. |
| `kind` | Keep `freeze` for the final selection; do not introduce a new enum. |
| `status` | Describes roster completeness. A complete nine does not prove completed collaboration. |
| `summary` | Name actual contributors and final editor, and state any missing question pass or other stage. |
| `counterargument` | Preserve the strongest unresolved assumption or disagreement. |
| `revisions` | Describe the actual version-to-version changes under the existing schema; compare with both starting drafts in the linked canonical record. |
| `archive_url` | Immutable final notebook with the exact input references, contributions, stage status and chosen lineup. |

Keep `frozen` true only for a valid final recorded before the applicable
deadline. A shared final without third-model review must say that the review
is missing. A fallback must not be presented as completed joint work.

Use the existing journal fields for questions, responses and integration:
`origin` remains one of the documented values, with `origin_note` naming
the actual authors and material influence. Use `mixed` where the work
combines operator and agent direction; it is not a new model-identity field.
Choose `kind` from the existing enums according to how the work occurred.
Include the exact final `snapshot_id` in a relevant entry's `snapshot_ids`
so it appears with that selected lineup.

The canonical notebook may hold more detailed contribution metadata; do not
assume arbitrary new fields are rendered by the Site. Snapshot labels,
summaries and linked journal entries convey shared authorship without changing
the renderer. This does not establish that every static Site heading supports
new author names.

Archive first, verify immutable readback, then append to the complete feed and
publish through the existing independently guarded branches. The collaboration
workflow does not change feed publication scope or create model dispatch.
