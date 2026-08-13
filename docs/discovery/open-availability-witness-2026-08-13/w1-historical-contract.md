# W1 — Historical nflverse injuries contract and the post-2024 break

Provenance: fresh-context research agent report, 2026-08-13, operator-directed
discovery under TIBER-Research issue #5. Read-only fetches; every claim pinned
to a URL (+ commit SHA where applicable); inference marked as such. No sample
payload bytes are committed to this repository.

**Headline finding (changes the premise):** The anchor claim is verified — but
it is now stale. The historical upstream (NFL Data Exchange at `nfl.info`,
authenticated `media/media`) did die after the 2024 season, and no in-season
2025 data was ever published. However, on **2026-03-18** maintainer mrcaseb
replaced the scraper's source with the private `nflverse/nflapi` package and
**retroactively backfilled a complete 2025 season file** (`injuries_2025.*`,
weeks 1–22 incl. Super Bowl) to the nflverse-data `injuries` release — with a
**schema drift** (adds `season_type`, **drops `date_modified`**). The nflreadr
documentation ("no 2025 data") has not been updated and now contradicts the
release assets. TIBER's rejection of nflverse injuries for current-2026 lanes
remains correct as of today: there is **no 2026 in-season data yet**, the new
pipeline has produced exactly one (backfill) run, and the revision-clock field
is gone.

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
`gsis_id` is a character ID of form `00-XXXXXXX` (confirmed in data).

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
- `report_status` = **game-status designation**, present only when a
  designation was issued: blank (3386 of 6215 rows in 2024 — listed on
  practice report but no game designation), `Questionable` (1513), `Out`
  (1116), `Doubtful` (194), plus 6 literal `Note` rows. No "Probable" in 2024
  (NFL dropped it in 2016; earlier seasons would contain it — not verified
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
consecutively (2024/2025: weeks 19–22, `SB` present). Grain: one row per
player × team × week × report; median ~11 players per team-week in 2024
(max 23).

## 2. The actual upstream source

**Confirmed.** The scraper lives in **`nflverse/nflverse-rosters`** (repo
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
  — `nfldx` is a private nflverse wrapper for the same Data Exchange (repo
  404s unauthenticated; **inference**: private).
- **Current (post-2026-03) scraper:** commit
  `dbea11aa070f70769d8dd2a7843b45d5f5923cae` ("update injury workflow",
  mrcaseb, 2026-03-18 13:54 +0100; patch:
  `https://github.com/nflverse/nflverse-rosters/commit/dbea11a.patch`)
  **deleted `scrape_ir()` and the NFLDX credentials entirely** and replaced
  them with **`nflapi::nflapi_injuries(season)`**; workflow now installs
  `nflverse/nflapi` (private repo — 404 unauthenticated, installed via
  `GITHUB_PAT`) and crons `0 7 * 1,2,9,10,11,12 *` (daily 07:00 UTC, Sep–Feb
  only). The concrete endpoint behind `nflapi` is **not publicly pinnable**;
  inference (unverified): NFL's current official API. Rights posture as
  observed: both old and new upstreams are credentialed NFL services; the old
  one shipped publicly-known default `media/media` credentials in open-source
  code — public reachability ≠ permission, and TIBER should not call either
  endpoint directly.

## 3. What died and when — source death, then quiet resurrection

| Date (UTC) | Event | Evidence |
|---|---|---|
| 2025-02-07 20:32 | Last `date_modified` in 2024 data (SB LIX week) | injuries_2024.csv max timestamp |
| 2025-02-13 07:16 | **Last successful historical pipeline run** — all `injuries_2024.*` assets updated | `https://github.com/nflverse/nflverse-data/releases/expanded_assets/injuries` |
| 2025-02-10 | Injurybot cron **commented out** (kept `workflow_dispatch` only) — day after SB LIX | commit `a6ea8d1586012185d1eb79b4b1cb4667a5ed63d0`, `https://github.com/nflverse/nflverse-injurybot/commit/a6ea8d1.patch` |
| 2025-09-05 21:28 +0200 | mrcaseb documents the death in nflreadr vignette, commit `6bdea848b15deebc99fd0a8ab29e6e5b537e30a0`: **"Our data source died after the 2024 season. At the moment, there is no 2025 data"** (+ no ETA) | `https://github.com/nflverse/nflreadr/commit/6bdea84.patch`; text verified at pinned `d072c08` (`vignettes/articles/nflverse_data_schedule.Rmd`) |
| 2025-09-06 | User issue "[BUG] Injuries not loading" opened | `https://github.com/nflverse/nflverse-data/issues/75` (closed 2025-11-13; close rationale not retrievable read-only in this session) |
| 2025-09-29 | "[BUG] 2025 injuries are missing" — **still open** as of 2026-08-13, no maintainer reply visible | `https://github.com/nflverse/nflreadpy/issues/17` |
| **2026-03-18 12:45** | **Resurrection:** commit `dbea11a` swaps source to `nflapi`; full-season `injuries_2025.*` assets published (weeks 1–22 incl. postseason, 6,068 rows) with drifted schema | commit patch + expanded_assets timestamps `2026-03-18T12:45:31Z` |
| 2026-08-13 (today) | nflreadr `main` vignette **still** says "no 2025 data"; dictionary unchanged; no 2026 data; next scheduled run Sep 2026 (cron months 9–12,1–2) | raw `main` vignette fetch; dictionary diff; asset list |

**Verdict:** This was a **source death** (NFL Data Exchange stopped serving
post-2024), not a pipeline bug — the scraper code was healthy at `f36b8cb` and
the fix required a wholesale source replacement, not a patch. The bot cron
being manually disabled the day after the Super Bowl, plus removal of NFLDX
credentials in `dbea11a`, corroborates deliberate decommissioning of the
nfl.info dependency. No public maintainer discussion of *why* nfl.info died
was found in nflverse issue trackers (searched nflverse-data, nflreadr,
nflreadpy); the vignette sentence is the canonical statement. Whether 2025's
backfill quality matches in-season scraping is unknowable from the data alone,
but its `report_status` distribution (Out 1396 / Questionable 1281 / Doubtful
106; 3285 blank) is season-plausible.

## 4. Expected cadence and missingness (historical dataset)

- **Publish cadence:** GitHub Action daily at **07:00 UTC** (historical cron
  `0 7 * * *`, year-round; new cron restricts to Sep–Feb). nflreadr vignette
  (pinned d072c08) lists injuries as updating "every day at 7AM UTC". The
  whole current season file was re-scraped and re-uploaded each run (assets
  replaced in place; release-asset `updated` timestamp = last run).
- **Within-week rhythm** (from 2024 `date_modified`, UTC weekday
  distribution: Fri 4818, Sat 509, Wed 461, Thu 351, Tue 51, Sun 22, Mon 3):
  practice reports accrue Wed–Fri (Thu–Sat games shift this); the
  **game-status designation lands Friday** for Sunday games — hence the heavy
  Friday mass; Saturday entries are late designations/Sat games; Tue/Wed
  entries are short-week (Thu games). Rows revise in place — `date_modified`
  is last-touch, not an event log; intra-week intermediate states are not
  preserved in the released file.
- **Offseason:** no report exists (NFL injury reports are game-week
  documents); daily runs outside Sep–Feb were effectively no-ops for new
  content. Final season state frozen at the first post-SB run (2024: Feb 13).
- **Known gaps/quirks:**
  - Week-1 REG data for 2009–2019 was once missing
    (`https://github.com/nflverse/nflverse-data/issues/5`, opened 2022-07-26);
    all 2009–2020 assets were re-uploaded 2022-07-26T05:22 and the issue
    closed at 05:28 — week 1 present in today's 2009 file (**inference:**
    fixed by full re-scrape that morning).
  - `date_modified` effectively absent pre-~2020s (2009: 99.6% empty).
  - Dirty values: literal `Note` in status fields; whitespace-only
    `practice_status` (36 rows in 2024); blank `report_status` is *normal*
    (~54% of rows = no game designation).
  - Only players a club lists on its report appear — absence of a player is
    not evidence of health; team-weeks on bye are absent by construction.
  - Pre-2021 REG caps at week 17; postseason weeks renumbered (19–22 in the
    17-game era).

## 5. Historical contract table (2009–2024 released files)

Grain: player × team × week × report-type snapshot; keys
`(season, game_type/week, team, gsis_id)`. "Died-with-source" = whether the
March-2026 `nflapi`-based replacement still supplies the field (per the 2025
file).

| field | type | semantics | identity/clock class | died-with-source |
|---|---|---|---|---|
| season | int | NFL season year (2009+) | partition key / season clock | no |
| game_type | chr | `REG,WC,DIV,CON,SB` (per-round; dictionary's "season_type REG/POST" describes 2025+ schema) | week-class qualifier | no (2025 keeps it, **adds** `season_type` REG/POST) |
| week | int | report week; REG 1–17(≤2020)/1–18(2021+); POST renumbered 19–22 | week clock | no |
| team | chr | club code, normalized (ARZ→ARI etc.) | team identity | no |
| gsis_id | chr | `00-XXXXXXX` NFL GSIS ID — joins to pbp/rosters; 0% null 2009–2025 | **primary player identity** | no |
| position, full_name, first_name, last_name | chr | player descriptors as listed by club | secondary identity | no |
| report_primary_injury / report_secondary_injury | chr | body part/reason on official game-status report; may hold "Not injury related - …" | payload | no |
| report_status | chr | game designation: blank/`Questionable`/`Doubtful`/`Out` (blank ≈ no designation; `Probable` only pre-2016) | payload (decision-critical) | no |
| practice_primary_injury / practice_secondary_injury | chr | body part/reason on practice report | payload | no |
| practice_status | chr | `Full/Limited/Did Not Participate In Practice` | payload (leading indicator) | no |
| date_modified | chr (ISO-8601 Z) | per-row last-revision UTC timestamp; empty pre-~2020, dense 2022–2024 | **revision clock** | **YES — absent from 2025 file** |
| *(report type)* | — | no explicit column; report type is encoded by the report vs practice field families | — | — |

**Operational implications for TIBER:** (a) the 2026-lane rejection stands —
no in-season witness exists yet and none can before Sep 2026; (b) if the new
pipeline holds in Sep 2026, downstream code must tolerate `season_type`
appearing and must not depend on `date_modified` (the only staleness/revision
clock is now the release-asset timestamp / `timestamp.json`, updated
`2026-03-18T12:45:32Z`); (c) the 2025 file is a one-shot retrospective
backfill from a different (private, credentialed) upstream — treat as a
distinct provenance class from 2009–2024; (d) nflreadr/nflreadpy docs and the
data dictionary currently misstate availability; do not use documentation text
as the availability witness — use the `expanded_assets` listing.
