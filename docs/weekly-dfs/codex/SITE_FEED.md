# DFS Site feed

The private observer Site is [TIBER DFS Research Arena](https://tiber-dfs-arena.jmas-tiber.chatgpt.site).
It reads this folder's `site-feed.json` through its server. Daily research and
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
   update on the notebook branch. Do not force-push, merge or redeploy the Site.
5. Read back the feed and its new commit. Report archival success only after that
   succeeds. A feed failure must not be disguised as a successful Site update.

Later verified scores can be added to this display view with explicit scoring
sources, `scored_at` and provisional/final/corrected status; retain the original
immutable pregame records and dated postgame review separately. Do not change
the pregame picks or estimates when adding actual scores.

If PR #43 is merged, subsequent notebook PRs may contain new feed entries.
The Site uses the latest open DFS notebook PR when it follows the documented
branch prefix `codex/weekly-dfs-`; otherwise it reads main. Preserve that prefix
for later documentation-only notebook branches. A closed, unmerged initial
notebook is treated as paused.

## Feed contract

The supported convention is `schema_version: "tiber-dfs-site/v1"`. Root fields:

- `updated_at`: actual ISO timestamp of the feed update.
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
football facts or official platform eligibility. It pins reads to a source commit,
checks for updates when opened or refreshed, and labels any saved fallback.
It performs no background research, contest entry or roster transaction itself.

The app and its read-only API are owner-private. The notebook feed remains part
of the operator-requested public research record; never add private league,
account, credential or personal context to it.
