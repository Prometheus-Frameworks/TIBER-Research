# W2 — nflverse upstream ownership, automation state, contribution norms, precedent

Provenance: dated agent discovery reference, 2026-08-13, prepared under the
investigation-and-design scope of TIBER-Research issue #5. Read-only; no
maintainer contact and no issues/PRs opened elsewhere. The authority and
custody boundary in [`README.md`](README.md) controls this file.

**Method/limitations note:** the research environment's GitHub API access was
restricted to session-bound repositories, so per-commit SHAs and Actions run
logs for some nflverse surfaces were not retrievable. Claims cite (a)
`raw.githubusercontent.com` branch-head file URLs retrieved 2026-08-13, (b)
release-asset `timestamp.json` contents retrieved 2026-08-13, (c) rendered
pkgdown/CRAN pages, and (d) issue/PR pages. Branch-head and rendered-page
locators are mutable and were not retained with governed receipts. Everything
marked **[inference]** is a reading, not an observed statement.

## 1. Repository map — who owns which availability-adjacent surface

Primary mapping source for this dated audit: the nflverse "Data Update and Availability
Schedule" vignette (`https://nflreadr.nflverse.com/articles/nflverse_data_schedule.html`;
source `https://raw.githubusercontent.com/nflverse/nflreadr/main/vignettes/articles/nflverse_data_schedule.Rmd`).
All datasets below publish to GitHub Releases on **nflverse/nflverse-data** and
are read by **nflreadr** (CRAN 1.5.1) and **nflreadpy**.

| Surface | Automation repo / workflow | Schedule (observed cron) | Output artifact | Public timestamp/status label observed 2026-08-13 |
|---|---|---|---|---|
| Rosters (season + weekly) | `nflverse/nflverse-rosters` → `update_rosters.yaml` | `0 7 * * *` daily, year-round | tags `rosters`, `weekly_rosters` | `2026-08-12 04:12:57 EDT` |
| Depth charts | `nflverse-rosters` → `update_depth_charts.yaml` → `exec/update-depth-charts.R` | `0 7 * * *` daily | tag `depth_charts`, cumulative `depth_charts_{season}` keyed by ISO8601 `dt` | `2026-08-12 04:11:49 EDT` |
| Injuries | `nflverse-rosters` → `update_injuries.yaml` → `exec/update-injuries.R` calling `nflapi::nflapi_injuries()` | `0 7 * 1,2,9,10,11,12 *` (Sep–Feb only) | tag `injuries`, `injuries_{season}` | `2026-03-18 08:45:29 EDT` — see §6: **2025 data exists despite docs saying otherwise** |
| Players / IDs | `nflverse/nflverse-players` → `update_players.yaml`; builders `players_espn_release()`, `players_pfr_release()`, `players_otc_release()`; manual overrides JSON | daily | tag `players` (v2 as of nflreadr 1.5.0) | status-table label `active` (not execution evidence) |
| Release/distribution | `nflverse/nflverse-data` — release buckets only, no scraping code; repository-level **CC-BY 4.0** file observed, scope over upstream material unresolved | n/a | ~24 release tags, each with `timestamp.json` | — |
| ESPN QBR | `nflverse/espnscrapeR-data` → `update_qbr.yaml` (cron `0 9 * 1,2,9-12 *`) using `jthomasmock/espnscrapeR` | daily 09:00 UTC in-season | tag `espn_data` | `2026-02-28 04:17:38 EST` |
| NGS (context) | `nflverse/ngs-data` → `update_ngs.yaml`, cron `0 7 * 1,2,9-12 *` | in-season nightly | tag `nextgen_stats` | status-table label `active` (not execution evidence) |
| PFR snap counts (context) | `nflverse/pfr_scrapR` → `update_snap_counts.yaml`, in-season 4×/day | in-season | tag `snap_counts` | status-table label `active` (not execution evidence) |

**Public/non-public split (observed 2026-08-13):** the
reviewed *automation orchestration* repos are public (`nflverse-rosters`,
`nflverse-players`, `pfr_scrapR`, `ngs-data`, `espnscrapeR-data`,
`nflverse-pbp`), while three reviewed endpoint-touching packages were not
publicly accessible at their cited organization locators:
`nflverse/nflapi` (injuries and rosters),
`nflverse/ngsscrapR` (NGS), and `nflverse/nflverse-espn` (the ESPN scraper,
imported as `nflverse.espn`; existence proven by
`nflverse-rosters/DESCRIPTION` `Remotes: nflverse.espn=nflverse/nflverse-espn`).
**[Inference]** the non-public placement may be deliberate; no maintainer
statement was observed explaining it.

## 2. Depth-chart precedent — observed, with corrections

The claim is **true in substance**: the 2025+ depth-chart pipeline is
ESPN-derived, adopted after the prior source died. Precise record:

- **Old source (through 2024): "NFL Data Exchange"**, not ESPN. Stated in
  nflreadr 1.5.0 NEWS: "the data source had to be changed from NFL Data
  Exchange to ESPN. (#275, #277)". Residue observed: `update_depth_charts.yaml`
  still declares dead `NFLDX_*` secrets.
- **Current pipeline** (branch head of `exec/update-depth-charts.R`,
  retrieved 2026-08-13): calls `nflverse.espn::espn_depth_charts(season)`,
  joins `espn_id → gsis_id` via `nflverse.players::players_download("full")`,
  appends to the release file keyed by ISO8601 `dt`. The scraper lives in
  **non-public `nflverse/nflverse-espn`**, so the exact ESPN endpoint is not
  observable; **[inference]** field names match ESPN's public depth-chart API
  shape as used by espnscrapeR's `get_depth_chart()`.
- **Schema break was real and breaking:** new columns
  `['dt','team','player_name','espn_id','gsis_id','pos_grp_id','pos_grp','pos_id','pos_name','pos_abb','pos_slot','pos_rank']`,
  replacing the old week-keyed schema — documented in nflverse-data issue #76
  (opened 2025-09-22, closed completed 2025-10-13). Maintainers did **not**
  back-fit the old schema; they documented the new one and changed semantics
  from week-stamped to timestamp-stamped snapshots.
- **When:** loader + dictionary changes landed mid-August 2025 (nflreadr PR
  #275 merged 2025-08-16; PR #277 merged 2025-08-18), shipped on CRAN in
  1.5.0 on **2025-09-02**.

**Precedent shape (observed):** prior NFL Data Exchange source dies →
maintainers stand up an ESPN-derived replacement in a *non-public* scraper
package → orchestrated from the existing public automation repo → released
under the *same release tag* with a *new schema* and a dictionary note →
loader defaults and docs updated → schema complaints closed "completed," not
reverted.

## 3. Other ESPN-derived precedent

- **ESPN Total QBR was distributed by nflverse at the observation point** via GitHub-Actions
  automation from ESPN endpoints: `nflreadr::load_espn_qbr()` labels the data
  "QBR (via ESPN/espnscrapeR)"; automation is `espnscrapeR-data` installing
  **`jthomasmock/espnscrapeR`** — a community package under a personal
  account, distributed through the nflverse r-universe. Last release update
  observed: 2026-02-28.
- The same repo's `update-fpi-pbwr.yaml` (ESPN FPI and pass-block/pass-rush
  win rates via `rvest`) is **manual-dispatch only** and commits CSVs to the
  repository rather than the reviewed QBR release tag.
- `espn_id` is a first-class identifier in the players dataset; ESPN is
  in-scope in `nflverse-players` CONTRIBUTING.
- **Recorded maintainer position on ESPN rights/takedown risk: none found on
  the enumerated reviewed surfaces.** No maintainer statement on ESPN ToS,
  redistribution rights, or takedown exposure was observed there; nflverse-data has no GitHub
  Discussions. The observable placement was: ESPN-touching scraper code was
  referenced in a non-public repo while ESPN-derived *data* shipped publicly
  from a repository containing a CC-BY file whose application to upstream
  material this audit did not resolve. Contrast: explicitly negotiated sources
  state their terms (FTN
  participation/charting: "graciously offered/provided," CC-BY-SA 4.0, credit
  "FTN Data via nflverse"). **[Inference]** the observed record shows use of
  public endpoints without a documented permission statement; it does not
  establish the legal status of that use.

## 4. Contribution norms

- **Formal docs:** `nflreadr/.github/CONTRIBUTING.md`: issue-first ("file an
  issue and make sure someone from the team agrees that it's needed"), reprex
  for bugs, tidyverse style, roxygen2 docs, testthat tests, Code of Conduct.
  `nflverse-players/.github/CONTRIBUTING.md` defines an explicit **source
  scope** (in-scope: GSIS, PFR, PFF, OTC, ESB, ESPN; out-of-scope: Sleeper,
  Yahoo, DraftKings → pointed to ffverse/dynastyprocess) and a JSON-file PR
  mechanism for ID corrections.
- **Design discussion:** GitHub issues plus **Discord**
  (`discord.com/invite/5Er2FBnnQa`), cited in CONTRIBUTING and the schedule
  vignette. No GitHub Discussions on the data repos.
- **How datasets historically entered (observed cases):**
  - *Partnership/donation:* FTN charting (nflreadr 1.4.0, "graciously
    provided by FTN Data") and FTN participation post-NGS-death (1.5.0):
    provider grants data → dedicated automation repo → release tag → loader +
    dictionary.
  - *Community package adopted into distribution:* espnscrapeR → nflverse
    runs `espnscrapeR-data` in-org, serves via `espn_data`.
  - *Maintainer-built replacement:* ESPN depth charts (§2).
  - *Outside-contributor units smaller than a dataset are common* and
    credited by handle in NEWS (dictionaries, loader fixes, field additions).
    **No outside contributor landing an entirely new scraped dataset
    end-to-end was found in the reviewed examples**; those examples introduced
    new sources through maintainers or provider partnerships.
- **Schema/dictionary pattern on reviewed surfaces:** distributed datasets had
  corresponding `dictionary_*` entries in nflreadr, and the reviewed source
  change had a dictionary note. Artifacts
  ship rds/csv/parquet with per-tag `timestamp.json`; saves route through
  `nflversedata::nflverse_save()`.
- **Versioning pattern on reviewed tags:** assets were updated in place (append
  or overwrite per dataset), not under per-asset semver. Reviewed breaking
  data changes coincided with loader CRAN releases (1.4.0 → Sep 2023; 1.5.0 →
  Sep 2025) and were documented in NEWS.

## 5. Limits of the observed record

1. **No ESPN permission record for the evaluated use was observed.** The
   existence of ESPN-derived depth charts and QBR in nflverse is ecosystem
   precedent, not evidence resolving permission for TIBER.
2. **The repository-level CC-BY 4.0 file did not resolve the upstream
   chain.** This audit makes no conclusion about its legal scope. Where
   nflverse documented negotiated FTN terms, it stated CC-BY-SA and
   attribution; no analogous statement was observed for ESPN-derived data.
3. **Maintainer acceptance is not TIBER admission evidence.** The non-public
   acquisition implementation supplies no observed source authorization or
   rights determination that TIBER can rely on; the ultimate source/access and
   rights questions remain open.
4. **No continuity commitment was observed.** Maintainer documentation reported
   losses of the NFL Data Exchange depth-chart and NGS-participation sources;
   the injuries vignette said "no ETA," and a later injuries artifact appeared
   while that documentation remained stale.
5. **The depth-chart precedent does not establish schema stability or
   drop-in replacement.** The observed ESPN replacement shipped a breaking
   schema and changed semantics.
6. **No org endorsement statement was observed for r-universe distribution
   of community tooling (espnscrapeR).** Distribution alone is not used as a
   substitute for such a statement.

## 6. Upstream reliability model — source death and breakage handling

**Documented source deaths (schedule vignette, retrieved 2026-08-13):**

- **Participation/NGS:** "The data source died during the 2023 season."
  Handling: dataset went dark, later restored via FTN as a *post-season-only*
  drop ("It does not update during the season!") with new licensing terms —
  degrade honestly, restore at lower cadence when a licensed donor appears.
- **Depth charts / NFL Data Exchange:** died after 2024; replaced within
  months by the ESPN pipeline with breaking schema and a dictionary note.
- **Injuries:** vignette states "Our data source died after the 2024 season.
  At the moment, there is no 2025 data" — and bug report nflverse-data #75
  was closed without a public replacement plan. **However — key observed fact
  for issue #5:** the `injuries` release contained `injuries_2025.csv`
  (downloaded and inspected 2026-08-13: 6,068 rows, 32 distinct team values,
  rows in REG 1–18 + POST 19–22, all observed `gsis_id`s populated; ledger
  span does not establish completeness or a declared universe; legacy schema
  plus `season_type`, minus `date_modified`), and `injuries/timestamp.json`
  reads `2026-03-18 08:45:29 EDT`. The public 2025 artifact appeared after the
  season around the implementation change while docs still said "no 2025
  data." The script calls non-public `nflapi::nflapi_injuries()`; the workflow
  declares a Sep–Feb cron. Whether 2026 updates *in-season* is **unknown**. The
  March publication fell outside that declared window; manual dispatch is a
  possible explanation, not an observed execution fact. The open gap is
  *in-season 2026 public-publication latency*, not 2025 artifact existence.
- **qs format death (infrastructure analog):** dependency removed from CRAN
  2026-01-17 → nflreadr 1.5.1 hard-deprecated the format with an error and
  migration note — breakage surfaced loudly rather than silently.

**Fail-closed / alerting behavior in automation (observed in code):**

- `exec/update-depth-charts.R` is fail-closed at three gates: abort (no
  upload) if the new pull errors/returns 0 rows, if the existing release file
  can't be downloaded (protects the cumulative artifact), or if the gsis map
  is unavailable. Stale-but-intact beats fresh-but-wrong.
- `exec/update_roster.R` aborts on empty season rosters but only
  warns-and-skips on empty weekly rosters — partial-publish tolerance for the
  secondary artifact.
- Per-tag `timestamp.json` + shields.io badge tables were the status surfaces
  observed; no paging/webhook mechanism was found on the reviewed surfaces.
  The separate `nflverse/status` repository was archived in March 2022.
- `heartbeat.yml` workflow comments describe monthly no-op commits intended to
  prevent GitHub from auto-disabling scheduled workflows.
- A season-scoped cron is schedule context, not an execution ledger. A later
  monitoring design should bind exact asset/window receipts and calendar
  policy rather than infer runs from recency.

**Bounded reliability synthesis [inference]:** the reviewed update code includes
artifact-level abort gates, and the reviewed history contains source changes,
dark windows, stale documentation, badges, NEWS, and dictionary updates. This
is a description of the enumerated examples, not an organization-wide
continuity or communication contract.

## Primary sources

`https://nflreadr.nflverse.com/articles/nflverse_data_schedule.html` (+ Rmd
source), `raw.githubusercontent.com/nflverse/nflverse-rosters/master/{DESCRIPTION,README.md,.github/workflows/*,exec/*}`,
`nflverse/nflreadr@main {NEWS.md,R/load_espn_qbr.R,.github/CONTRIBUTING.md}`,
`nflverse/nflverse-data@master {README.md,LICENSE.md}`,
`nflverse/nflverse-players@master {README.md,.github/CONTRIBUTING.md}`,
`nflverse/espnscrapeR-data@master .github/workflows/*`,
`nflverse/ngs-data` and `nflverse/pfr_scrapR` workflow files, nflverse-data
issues #75/#76, nflreadr PRs #275/#277, CRAN archive for nflreadr,
`nflverse.r-universe.dev/api/packages`, and release assets
`{depth_charts,injuries,rosters,espn_data}/timestamp.json` +
`injuries/injuries_2025.csv` (all retrieved 2026-08-13).
