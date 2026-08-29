# W1 — Historical nflverse injuries contract and the post-2024 break

Provenance: dated agent discovery reference, 2026-08-13, prepared under the
investigation-and-design scope of TIBER-Research issue #5. Read-only fetches;
claims carry cited locators and commit SHAs where available; inference is
marked as such. Mutable locators and unretained sample bytes are not replayable
evidence. The authority and custody boundary in [`README.md`](README.md)
controls this file.

**Headline observation (changes the premise):** The agent's 2026-08-13 checks
supported the anchor claim but found its present-tense form stale. The
historical upstream (NFL Data Exchange at `nfl.info`, authenticated
`media/media`) was reported dead after the 2024 season, and the audited public
record exposed no in-season 2025 publication. However, on **2026-03-18**
maintainer mrcaseb replaced the public NFLDX acquisition call with the
non-public `nflverse/nflapi` package and
**published a retrospective 2025 file** (`injuries_2025.*`) whose observed
ledger contained 6,068 rows, 32 distinct team values, and rows in weeks 1–22
including the Super Bowl—not every team-week pair. Those ledger facts do not
establish completeness or a declared universe, and no authoritative
expected-row census was available. The file was published to the
nflverse-data `injuries`
release — with a
**schema drift** (adds `season_type`, **drops `date_modified`**). The nflreadr
documentation ("no 2025 data") had not been updated and contradicted the
observed release assets. At the 2026-08-13 observation point this reference
found **no qualifying 2026 public asset on the reviewed release surface**, one
observed 2025 retrospective publication, and no exposed row-level
revision-clock field. It does not admit or reject the source or infer pipeline
execution from that bounded non-observation.

## 1. The historical schema

**Data dictionary, pinned:**
`https://raw.githubusercontent.com/nflverse/nflreadr/d072c08/data-raw/dictionary_injuries.csv`
(commit `d072c08492067b578f27e562b6cc9c9e3b8589c3`). This dictionary is
byte-identical on `main` as of 2026-08-13 — i.e. **not updated for the 2025
schema drift**.

| field | dict type | dictionary description |
|---|---|---|
| season | numeric | 4-digit season |
| season_type | numeric* | "REG or POST indicating if the timeframe belongs to regular or post season" |
| team | character | Team of injured player |
| week | numeric | Week that injury occurred |
| gsis_id | numeric* | "Game Stats and Info Service ID: the primary ID for play-by-play data" |
| position | character | Position of injured player |
| full_name / first_name / last_name | character | Player name fields |
| report_primary_injury / report_secondary_injury | character | Primary/secondary injury "listed on official injury report" |
| report_status | character | "Player's status for game on official injury report" |
| practice_primary_injury / practice_secondary_injury | character | Primary/secondary injury "listed on practice injury report" |
| practice_status | character | "Player's participation in practice" |
| date_modified | character | "Date and time that injury information was updated" |

\* dictionary's declared types are sloppy: `season_type` is character;
`gsis_id` is a character ID of form `00-XXXXXXX` (observed in the dated files).

**Dictionary vs. actual files (confirmed by downloading release CSVs):**
Historical files (2009–2024) do **not** contain `season_type`; they contain
**`game_type`** with per-round values `REG | WC | DIV | CON | SB` (checked
2009, 2022, 2024 headers — all identical 16-column:
`season,game_type,team,week,gsis_id,position,full_name,first_name,last_name,report_primary_injury,report_secondary_injury,report_status,practice_primary_injury,practice_secondary_injury,practice_status,date_modified`).
The dictionary's `season_type` row describes the 2025-era schema. Source
files:
`https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries_{YYYY}.csv`.

**Semantics — the two-status model (mirrors the official NFL report):**

- `practice_status` = practice participation: `Full Participation in
  Practice` / `Limited Participation in Practice` / `Did Not Participate In
  Practice` (2024 counts: 3145 / 1496 / 1537, plus 36 whitespace-junk rows and
  1 literal `Note`).
- `report_status` = **game-status designation field**: blank (3386 of 6215 rows
  in 2024; without exact edition context this may mean no designation,
  not-yet-designated, or a dirty/partial row), `Questionable` (1513), `Out`
  (1116), `Doubtful` (194), plus 6 literal `Note` rows. No "Probable" in 2024
  (the league removed that label in 2016; earlier-file presence was not checked
  here).
- "Not injury related - resting player" appears **in the injury-description
  fields**, not status fields (confirmed 2022 & 2025 rows).
- `date_modified` = per-row last-revision UTC timestamp (Zulu ISO-8601).
  **Nearly absent in early seasons** (2009: 4804 of 4821 rows empty), fully
  populated by 2022+ (0 empty in 2022 and 2024). 2024 range:
  `2024-09-04T12:55:19Z` → `2025-02-07T20:32:07Z`.

**Coverage span:** 2009–2024 (historical) per `load_injuries` at the pinned
ref: `https://raw.githubusercontent.com/nflverse/nflreadr/d072c08/R/load_injuries.R`
enforces `seasons >= 2009` and loads from
`https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries_{season}.{ext}`;
roxygen describes the source only as "an API for weekly injury report data."
Pre-2021 seasons: REG weeks 1–17; 2021+: weeks 1–18; postseason renumbered
consecutively (2024/2025: weeks 19–22, `SB` present). Grain: one combined
snapshot row per player × team × week; median ~11 players per team-week in 2024
(max 23).

## 2. The observed public implementation surfaces

**Observed in the dated public record.** The scraper lives in
**`nflverse/nflverse-rosters`** (repo
self-description: "code and workflows for updating nflverse rosters, depth
charts, and practice reports/injuries").

- **Historical scraper, pinned:**
  `https://raw.githubusercontent.com/nflverse/nflverse-rosters/f36b8cb/exec/update-injuries.R`
  (commit `f36b8cb`, "build_rosters maintenance (#89)", 2025-03-24, tanho63 —
  last pre-death revision). Its `scrape_ir()` did HTTP GET against:
  **`https://www.nfl.info/nfldataexchange/dataexchange.asmx/getInjuryData?lseason={year}&lweek={1..18}&lseasontype={REG|POST}`**
  — the **NFL Data Exchange** (NFL's media-facing legacy XML/ASMX service),
  authenticated via env vars `NFLDX_USERNAME`/`NFLDX_PASSWORD` **defaulting to
  `media`/`media`**. XML parsed with `XML::xmlToDataFrame()`; field mapping:
  `Season→season`, `SeasonType→game_type`, `ClubCode→team` (legacy fixes
  ARZ→ARI, BLT→BAL, CLV→CLE, HST→HOU, SL→STL), `GsisID→gsis_id`,
  `Injury1/2→report_*_injury`, `InjuryStatus→report_status`,
  `Practice1/2→practice_*_injury`, `ModifiedDt→date_modified`; upload via
  `nflversedata::nflverse_save(..., release_tag = "injuries")`.
- **Workflow, pinned:**
  `https://raw.githubusercontent.com/nflverse/nflverse-rosters/f36b8cb/.github/workflows/update_injuries.yaml`
  — cron `0 7 * * *` (daily 07:00 UTC), secrets `NFLDX_PASSWORD`/`NFLDX_USERNAME`.
- **Sibling consumer:** `nflverse/nflverse-injurybot` (Bluesky posting bot)
  used `nfldx::nfldx_injuries()`
  (`https://raw.githubusercontent.com/nflverse/nflverse-injurybot/main/R/fetch.R`)
  — the cited `nfldx` wrapper locator returned 404 without authentication; its
  implementation was not publicly inspectable in this audit.
- **Current (post-2026-03) scraper:** commit
  `dbea11aa070f70769d8dd2a7843b45d5f5923cae` ("update injury workflow",
  mrcaseb, 2026-03-18 13:54 +0100; patch:
  `https://github.com/nflverse/nflverse-rosters/commit/dbea11a.patch`)
  **deleted `scrape_ir()` and the NFLDX credentials entirely** and replaced
  them with **`nflapi::nflapi_injuries(season)`**; workflow now installs
  `nflverse/nflapi` (non-public repository locator; installed via
  `GITHUB_PAT`) and crons `0 7 * 1,2,9,10,11,12 *` (daily 07:00 UTC, Sep–Feb
  only). The concrete endpoint and authentication behavior behind `nflapi`
  were **not publicly observable**. `GITHUB_PAT` establishes access to the
  non-public package, not that package's upstream authentication. The old
  NFLDX implementation shipped publicly-known default `media/media`
  credentials in open-source code; no equivalent claim is made about the new
  upstream. Public reachability never supplies admission.

## 3. Reported source death and later replacement publication

| Date (UTC) | Event | Evidence |
|---|---|---|
| 2025-02-07 20:32 | Last `date_modified` in 2024 data (SB LIX week) | injuries_2024.csv max timestamp |
| 2025-02-13 07:16 | **Last observed historical release-asset update** — all `injuries_2024.*` assets carried this update time; the listing alone does not prove an exact execution count | `https://github.com/nflverse/nflverse-data/releases/expanded_assets/injuries` |
| 2025-02-10 | Injurybot cron **commented out** (kept `workflow_dispatch` only) — day after SB LIX | commit `a6ea8d1586012185d1eb79b4b1cb4667a5ed63d0`, `https://github.com/nflverse/nflverse-injurybot/commit/a6ea8d1.patch` |
| 2025-09-05 21:28 +0200 | mrcaseb documents the death in nflreadr vignette, commit `6bdea848b15deebc99fd0a8ab29e6e5b537e30a0`: **"Our data source died after the 2024 season. At the moment, there is no 2025 data"** (+ no ETA) | `https://github.com/nflverse/nflreadr/commit/6bdea84.patch`; text verified at pinned `d072c08` (`vignettes/articles/nflverse_data_schedule.Rmd`) |
| 2025-09-06 | User issue "[BUG] Injuries not loading" opened | `https://github.com/nflverse/nflverse-data/issues/75` (closed 2025-11-13; close rationale not retrievable read-only in this session) |
| 2025-09-29 | "[BUG] 2025 injuries are missing" — **still open** as of 2026-08-13, no maintainer reply visible | `https://github.com/nflverse/nflreadpy/issues/17` |
| **2026-03-18 12:45** | **Replacement publication:** commit `dbea11a` swaps the implementation to `nflapi`; `injuries_2025.*` assets published with 6,068 rows spanning weeks 1–22 and a drifted schema; completeness and execution count are not established | commit patch + expanded_assets timestamps `2026-03-18T12:45:31Z` |
| 2026-08-13 observation | nflreadr `main` vignette said "no 2025 data"; dictionary was unchanged; no 2026 asset was observed; the configured cron window began in September (months 9–12,1–2) | raw `main` vignette fetch; dictionary diff; asset list |

**Dated interpretation:** Maintainer documentation described the source as
having died, and later code replaced the NFLDX call with `nflapi`. This record
cannot distinguish endpoint outage, credential or contract loss, or another
failure, and it does not establish scraper health, a uniquely required fix, or
execution count. No explanation of *why* nfl.info ended was found on the
enumerated nflverse issue surfaces; the vignette sentence was the only public
maintainer explanation observed. The 2025 snapshot's `report_status` counts
were Out 1396 / Questionable 1281 / Doubtful 106 / blank 3285; those counts are
descriptive only and do not validate quality.

## 4. Declared workflow cadence and observed missingness

- **Declared workflow cadence:** GitHub Action cron at **07:00 UTC**
  (historical cron
  `0 7 * * *`, year-round; new cron restricts to Sep–Feb). nflreadr vignette
  (pinned d072c08) lists injuries as updating "every day at 7AM UTC". The
  historical workflow code re-scraped and re-uploaded the whole season file on
  invocation. Assets are replaced in place. A release-asset `updated`
  timestamp is an artifact clock, not a run ledger or execution count.
- **Observed weekday pattern** (from 2024 `date_modified`, UTC weekday
  distribution: Fri 4818, Sat 509, Wed 461, Thu 351, Tue 51, Sun 22, Mon 3):
  the Friday concentration is consistent with the ordinary report schedule,
  while non-Friday values may reflect other game schedules or later touches.
  The counts do not establish exact publication cadence. `date_modified` is a
  last-touch value, not an event log, and the released snapshot exposes no
  intra-week revision history.
- **Offseason boundary:** the documentation describes injury reports as
  game-week artifacts and the later workflow declares a September–February
  schedule. The asset timestamps observed here do not prove no-op executions or
  the exact invocation that produced a final season snapshot.
- **Known gaps/quirks:**
  - Week-1 REG data for 2009–2019 was once missing
    (`https://github.com/nflverse/nflverse-data/issues/5`, opened 2022-07-26);
    all 2009–2020 assets were re-uploaded 2022-07-26T05:22 and the issue
    closed at 05:28 — week 1 was present in the 2009 file observed 2026-08-13
    (**inference:**
    fixed by full re-scrape that morning).
  - `date_modified` effectively absent pre-~2020s (2009: 99.6% empty).
  - Dirty values: literal `Note` in status fields; whitespace-only
    `practice_status` (36 rows in 2024); blank `report_status` is common (~54%
    of rows) but remains unresolved without exact report-edition context.
  - Only players a club lists on its report appear — absence of a player is
    not evidence of health; team-weeks on bye are absent by construction.
  - Pre-2021 REG caps at week 17; postseason weeks renumbered (19–22 in the
    17-game era).

## 5. Historical contract table (2009–2024 released files)

Grain: one combined player × team × week snapshot row; keys
`(season, game_type/week, team, gsis_id)`. The final column reports whether the
field was present in the observed 2025 replacement snapshot.

| field | type | semantics | identity/clock class | present in observed 2025 snapshot? |
|---|---|---|---|---|
| season | int | NFL season year (2009+) | partition key / season clock | yes |
| game_type | chr | `REG,WC,DIV,CON,SB` (per-round; dictionary's "season_type REG/POST" describes the observed 2025 schema) | week-class qualifier | yes; 2025 also adds `season_type` REG/POST |
| week | int | report week; REG 1–17(≤2020)/1–18(2021+); POST renumbered 19–22 | week clock | yes |
| team | chr | club code, normalized (ARZ→ARI etc.) | team identity | yes |
| gsis_id | chr | `00-XXXXXXX` NFL GSIS ID — joins to pbp/rosters; 0% null 2009–2025 | **primary player identity** | yes |
| position, full_name, first_name, last_name | chr | player descriptors as listed by club | secondary identity | yes |
| report_primary_injury / report_secondary_injury | chr | body part/reason on official game-status report; may hold "Not injury related - …" | payload | yes |
| report_status | chr | game-designation field: blank/`Questionable`/`Doubtful`/`Out`; raw blank remains unresolved without exact edition evidence; `Probable` is historically valid but was not checked outside the sampled season | payload (decision-critical) | yes |
| practice_primary_injury / practice_secondary_injury | chr | body part/reason on practice report | payload | yes |
| practice_status | chr | `Full/Limited/Did Not Participate In Practice` | payload (leading indicator) | yes |
| date_modified | chr (ISO-8601 Z) | per-row last-revision UTC timestamp; empty pre-~2020, dense 2022–2024 | **revision clock** | **no — absent from observed 2025 file** |
| *(report type)* | — | no explicit column; report type is encoded by the report vs practice field families | — | — |

**Dated design implications:** (a) this 2026-08-13 reference did not observe a
2026 public asset on the reviewed release surface; the configured cron's first
scheduled window begins in
September, but configuration alone does not establish future behavior; (b) if
a later governed observation establishes a 2026 stream, downstream code would
need to
tolerate `season_type`
appearing and should not assume `date_modified` exists. The release-asset
timestamp / `timestamp.json` (`2026-03-18T12:45:32Z`) was the only public
revision signal observed for the 2025 artifact, not a run ledger; (c) the
observed 2025 artifact is a retrospective
backfill produced by a different non-public acquisition implementation. The
ultimate endpoint, source, and access method remain unknown; the artifact does
not prove how many executions occurred, and this draft keeps it distinct from the
2009–2024 generation; (d) the observed docs and data dictionary conflicted with the
release listing. A future run must freshly observe and digest-bind both rather
than treating either locator as current truth.
