# W3 — Candidate-source matrix for 2025+ NFL availability evidence

Provenance: fresh-context research agent report, 2026-08-13, operator-directed
discovery under TIBER-Research issue #5.

**Method note:** all observations are from 1–2 polite sample requests per
endpoint made on 2026-08-13, read-only, no credentials, no pagination sweeps,
no gate bypass. robots.txt / ToS revision dates are as observed that day. Raw
sample payloads were retained only in ephemeral session scratch space for
shape documentation and are **not** committed to this repository.

---

## Candidate 1a — NFL official communications (nflcommunications.com → media.nfl.com)

- **Source owner:** NFL Enterprises LLC.
- **Identity / access:** `nflcommunications.com` **301-redirects to
  `media.nfl.com`** (Adobe AEM Cloud). Weekly injury-report PDFs exist at
  paths like `…/content/dam/communications/media/injury-reports/2025/Week 17
  Injury Report - Wednesday.pdf`.
- **Auth/gating:** **HTTP 401 on the PDF path** (observed). Registration is
  offered only "for members of news organizations covering the NFL on-site
  regularly." Publicly visible sections do not include the weekly injury
  reports.
- **robots.txt:** `nflcommunications.com/robots.txt` 302 →
  `mediaarchive.nfl.net/robots.txt` → **403**; `media.nfl.com/robots.txt` →
  **500** at check time. No robots policy retrievable.
- **ToS:** NFL Terms of Service (same instrument as 1b).
- **Coverage:** the gated PDFs are the canonical league-distributed per-day
  (Wed/Thu/Fri) practice reports and game-status reports — the richest
  official artifact class.
- **Identity quality:** PDFs; names only, no machine IDs.
- **Clocks:** filed per league policy ("clubs must file Practice Reports by
  4:00 p.m. New York time"); per-day editions are themselves the clock.
- **Failure modes:** platform migration already happened once; AEM
  instability observed.
- **Verdict:** **BLOCKER — credentialed-media gate.** Nothing may be retained
  or redistributed. Evaluated and excluded.

## Candidate 1b — NFL.com public injuries pages (`www.nfl.com/injuries/…`, `/inactives/`)

- **Source owner:** NFL Enterprises LLC.
- **Identity / access:** server-rendered public HTML, no auth:
  - Current week: `https://www.nfl.com/injuries/` (200; "Week 1 of the 2026
    Season"; empty tables in preseason).
  - Historical weeks: `…/injuries/league/{season}/{TYPE}{week}` — sampled
    `/injuries/league/2025/REG18` → 200, 415 table rows, columns
    **Player | Position | Injury (body parts) | Practice status | Game
    status**. ⚠ Routing anomaly: the REG18 URL served a page titled "Week 1
    of the 2025 Season" — the week parameter may be partially ignored or the
    title stale; verify before any use.
  - Gameday inactives: `https://www.nfl.com/inactives/` (200; empty outside
    gamedays) — NFL.com publishes **official gameday inactives**, a class no
    other evaluated open source carries.
  - Backing API: no visible public JSON endpoint in served HTML; the known
    `api.nfl.com` requires an OAuth client token — treated as gated, not
    probed.
- **robots.txt** (observed 2026-08-13): `User-agent: *` disallows only
  `/_ctv/, /_fantasy-app/, /_libraries/, /_mobile-app/, /_mobileview/, /_phs/,
  /_sponsors/, /account/, /nfl-films-beta/, /search/`. **`/injuries/` and
  `/inactives/` are not disallowed; no AI-agent blocks.**
- **ToS** (`https://www.nfl.com/legal/terms`, "Last Updated: May 16, 2024"):
  - §1.3: *"Systematic retrieval of data or other content from the Services,
    whether to create or compile, directly or indirectly, a collection,
    compilation, database, or directory, is prohibited absent our express
    prior written consent."*
  - §1.3: *"You may use the Services solely for your own individual
    non-commercial and informational purposes only."*
  - §11: prohibits *"any engine, software, tool, agent or other device or
    mechanism (including, browsers, spiders, robots, avatars or intelligent
    agents) to navigate or search the Services to harvest or otherwise
    collect information from the Services to be used for any commercial
    purpose."*
- **Coverage:** practice status (weekly aggregate on the HTML page, not
  per-day) ✔; official game designation ✔; gameday inactives ✔ (separate
  page); IR/PUP as such ✖ (transactions, not on the report page).
- **Identity:** display names + team only; no gsis in markup; name→gsis
  resolution needed (nflverse rosters make it tractable; injury-report name
  collisions are a known failure mode).
- **Clocks:** none in the served HTML.
- **Backfill:** 2025 week pages live and complete-looking; archive depth not
  exhaustively probed (by design).
- **Schema stability:** plain HTML table; page redesigned before; the routing
  anomaly is itself a stability warning.
- **Verdict:** canonical official content; underlying facts uncopyrightable;
  but the ToS systematic-retrieval clause is an explicit contractual
  prohibition on exactly what a pipeline does. Raw HTML: no. Normalized
  facts: legally arguable (facts doctrine + browsewrap enforceability) but
  **recorded as BLOCKER pending counsel** — public reachability ≠ permission.

## Candidate 2 — First-party club sites (sampled: Philadelphia Eagles)

- **Owner:** Philadelphia Eagles, LLC; platform is the league-wide NFL club
  CMS — posture generalizes across all 32 clubs.
- **Identity:** `…/team/injury-report/` — 200, public. Empty legend-only
  shell in preseason; in-season renders the club's official table.
- **robots.txt:** disallows only `/search/`, `/_libraries/`, `/_mobileview/`.
- **ToS** (`…/footer/terms-conditions`, "Last Updated: June 1, 2026"):
  **verbatim the same NFL-platform boilerplate** — systematic-retrieval
  prohibition, personal non-commercial use, identical spider/robot clause.
  Confirms TIBER's prior audits (NFL Enterprises, Arizona Cardinals): the
  prohibition is platform-wide; 32 separate club contracts would apply.
- **Verdict:** **BLOCKER, same as 1b, multiplied by 32 counterparties.**
  Strictly dominated by the NFL.com league page. Excluded.

## Candidate 3 — ESPN site API (`site.api.espn.com`)

- **Owner:** ESPN Inc. / The Walt Disney Company.
- **Sample:** `GET …/apis/site/v2/sports/football/nfl/injuries` → 200, JSON,
  **8.94 MB**, no auth. One request returns **all 32 teams** (politeness-
  friendly). Team-scoped variants exist.
- **Shape (observed):** top level `{timestamp, status, season, injuries[32]}`;
  `timestamp: "2026-08-13T03:09:18Z"`; per item: `id, longComment,
  shortComment, status, date, athlete, source, type{…}, details{fantasyStatus,
  type, location, detail, side, returnDate}`.
  - `status` domain observed: `Active, Questionable, Out, Injured Reserve,
    Suspension`.
  - `details.fantasyStatus` domain observed: `QUESTIONABLE, OUT, IR, PUP-P,
    NFI-R, NFI-A, RESERVE-SUS` — **carries IR/PUP/NFI reserve-list classes**,
    which NFL.com's report page does not.
  - `details.type` = 30 body-part values incl. `Knee - ACL`, `Concussion`.
  - Per-item `date` to the minute plus `details.returnDate`.
- **Load-bearing caveat:** `longComment`/`shortComment` are **editorial
  fantasy-news prose with reporter attribution** — classic copyrightable
  expression, categorically different from the status facts. No official
  per-day practice participation; no gameday inactives; `status` is ESPN's
  synthesis (fresher than official reports in preseason, but not the official
  record).
- **Auth/robots/ToS:** no auth. `site.api.espn.com/robots.txt` → **403 (none
  served)**. The endpoint is **undocumented and unlicensed** (ESPN's public
  developer program shut down in the mid-2010s). Governing instrument is the
  Disney Terms of Use (`disneytermsofuse.com/english/`, "Last Updated: May
  24, 2024"): prohibits *"access, monitor, copy or extract the Disney
  Products using a robot, spider, script, or other automated means"*, any
  *"creating or developing any AI Tool, data mining or web scraping"*, any
  *"use, creation, development, modification, prompting, fine-tuning,
  training… of any artificial intelligence or machine learning tool"*, any
  *"commercial or business-related use"*, and redistribution. The
  automated-access exception applies only where *"not disallowed by Disney,
  including through the applicable robots.txt"* — and `www.espn.com/robots.txt`
  (observed 2026-08-13) explicitly blocks AI agents (`anthropic-ai`, GPTBot,
  Google-Extended, CCBot, Bytespider, ChatGPT-User…). The API hosts serve no
  robots at all, so the exception cannot be affirmatively claimed there.
- **Identity:** ESPN athlete id; crosswalk to gsis via nflverse
  `ff_playerids` — feasible, good coverage for rostered skill players.
- **Backfill:** none — current-state snapshot; history only by archiving it
  yourself (which is precisely the systematic collection the ToU prohibits).
- **Stability:** informally stable for years per community usage; zero
  contract; known intermittent 403s/shape drift reports.
- **Verdict:** technically the **best open-reachability signal with real
  clocks**, but the rights posture is the worst evaluated. **Raw content
  (especially comments): never. Normalized facts: contractually prohibited as
  read; BLOCKER pending counsel.**

## Candidate 4 — ESPN core API (`sports.core.api.espn.com`)

- **Samples (2):** team injuries collection (paginated `$ref` list;
  `count: 80` for team 22 — includes shallow in-season history) + one item
  deref → **identical payload to the site-API item**, with `athlete`/`team`
  as `$ref` URLs.
- **Differences vs #3:** N+1 fetch pattern — strictly **worse politeness
  economics** (hundreds of requests per league snapshot vs one); slight plus:
  per-athlete per-season history. robots → 403 (none served).
- **Verdict:** same owner, same ToU, same BLOCKER; dominated by #3 on every
  axis except per-athlete history. Use only as a schema cross-check.

## Candidate 5 — Sleeper players dump (`api.sleeper.app/v1/players/nfl`)

- **Owner:** Sleeper (Blitz Studios, Inc.).
- **Sample:** one GET → 200, **14.64 MB**, 12,218 players, no auth/key.
- **Docs** (`docs.sleeper.com`, observed 2026-08-13): free, read-only, no
  token. *"stay under 1000 API calls per minute, otherwise, you risk being
  IP-blocked."* Players endpoint: *"use this call sparingly, as it is
  intended only to be used once per day at most"*. Licensing: free *"for
  non-commercial purposes"*; *"for commercial use, please reach out to us
  directly to discuss licensing"*; attribution requested for trending data.
- **robots.txt:** `api.sleeper.app` → permissive placeholder; `sleeper.com` →
  `Allow: /`.
- **ToS** (`support.sleeper.com/…/terms-of-use`, "Last Updated: July 24,
  2026"): §9.2 grants a *"limited, personal, revocable, non-transferable and
  non-exclusive right… for your personal and non-commercial use"*; no
  rent/lease/sell/redistribute/sublicense/copy; §2.9: no transfer of any
  right, title, or interest in *"any data, content, or intellectual property
  therein."* No explicit anti-scraping clause for data extraction.
- **Injury fields observed (2026-08-13 dump):**
  - `injury_status` domain + counts: `Questionable 359, NA 91, IR 73, PUP 56,
    Out 7, Sus 6, COV 2, DNR 2` (596 flagged). No `Doubtful` observed in this
    preseason snapshot; Sleeper collapses to its own vocabulary.
  - `injury_body_part`: 43 values — same taxonomy family as ESPN's.
  - `practice_participation`/`practice_description`: **effectively
    unpopulated** (only `Out` / `Out (Definitely Will Not Play)` observed).
    Not a practice-report witness, at least in preseason.
  - `injury_start_date`: **0 of 596 populated.** `injury_notes`: 89 short
    editorial strings.
  - Roster `status`: `Active, Inactive, Injured Reserve, Physically Unable to
    Perform, Non Football Injury, Practice Squad` — **carries reserve-list
    classes directly.**
  - **Clock:** `news_updated` epoch-ms per player; newest observed
    `2026-08-13T02:50:13Z` — same-night freshness. No per-field injury
    timestamp.
- **Identity (rostered QB/RB/WR/TE, n=954):** `sportradar_id` 98.5%,
  `rotowire_id` 97.6%, **`gsis_id` 16.0%**, `espn_id` 21.5%, `yahoo_id`
  22.4%. Practical crosswalk: sleeper `player_id` → nflverse `ff_playerids` →
  gsis (well-established; TIBER already integrates Sleeper and holds an
  eligibility-audit precedent).
- **Coverage vs the load-bearing distinction:** injury designation
  (Sleeper-normalized) ✔; reserve lists ✔; practice status ✖; gameday
  inactives ✖; official Wed/Thu/Fri detail ✖.
- **Backfill:** none — current-state dump.
- **Failure modes:** vocabulary drift; silent field deprecation
  (`practice_participation` looks vestigial); no changelog; `NA`/`DNR`/`COV`
  under-documented.
- **Verdict:** the **only candidate whose owner affirmatively documents free
  automated access with an explicit rate budget.** Tension: docs say "free
  for non-commercial," ToU says "personal and non-commercial" and no
  redistribution. **Normalized facts retained inside TIBER for a free,
  no-paywall product: plausibly consistent with the documented free-API
  intent but not clearly licensed; raw-dump redistribution: not licensed;
  upstream contribution: not licensed.** Best-available for TIBER-internal
  use, with a written-clarification blocker on redistribution.

## Candidate 6 — Commercial comparison rows (recorded, excluded from the open question)

- **MySportsFeeds**: keyed API, injuries included; *"Affordable and FREE
  options for API access for personal/private use"* — non-commercial access
  is registration/patronage-gated, commercial requires a paid license → fails
  "free/open, redistributable" on the commercial-license and no-redistribution
  axes.
- **SportsDataIO**: enterprise sales model — free trial only (historically
  scrambled/delayed data), no public pricing, redistribution strictly
  license-bound → fails "free/open" outright.

## Discovered candidate (evaluated) — nflverse `injuries` release

- **Identity:**
  `https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries_2025.csv`
  (+ `.parquet`), 200, public, no auth. **`injuries_2026.*` → 404** (not yet
  started/restored).
- **Observed content (2025):** 6,068 rows; **full coverage REG weeks 1–18
  plus WC/DIV/CON/SB**; 16 columns (`season, season_type, game_type, team,
  week, gsis_id, position, full_name, first_name, last_name,
  report_primary_injury, report_secondary_injury, report_status,
  practice_primary_injury, practice_secondary_injury, practice_status`).
  `report_status ∈ {Out, Doubtful, Questionable, ∅}`; `practice_status ∈
  {DNP, Limited, Full, ∅}`. **This is the official-report content, keyed by
  gsis_id — exactly the witness issue #5 wants.**
- **Material caveats:** historical `date_modified` **absent** from the 2025
  schema (no revision clock — one final state per player-week, not the
  Wed/Thu/Fri progression); no `LICENSE` file exists in `nflverse-data`
  covering the data's upstream chain; 2026 automation not yet live — the
  restoration risk motivating this issue is real, but **2025 is not actually
  missing upstream**.
- **Verdict:** open, free, gsis-keyed, backfilled — **the best admissible
  witness for 2025**, with its own unresolved chain-of-rights question (TIBER
  would inherit whatever ambiguity exists, with strong ecosystem precedent).

**Deferred (named, not evaluated):** Pro-Football-Reference/Sports-Reference
(known strict anti-bot + no-redistribution ToS), FantasyPros (API key = gated
commercial), RotoWire (commercial licensor — visibly the editorial source
behind ESPN/Sleeper notes), Yahoo injuries endpoints, Ourlads depth charts,
ESPN team-page `?enable=injuries` variants (shape-identical to #3).

---

## Comparison matrix

| Dimension | media.nfl.com PDFs | NFL.com injuries/inactives | Club sites | ESPN site API | ESPN core API | Sleeper dump | nflverse injuries release | MSF / SportsDataIO |
|---|---|---|---|---|---|---|---|---|
| Access | **401 media gate** | Public HTML | Public HTML | Public JSON | Public JSON | Public JSON | Public CSV/parquet | Keyed / paid |
| robots posture | 403/500 (none) | Injury paths allowed | Allowed | No robots (403); www blocks `anthropic-ai` | Same | Permissive | GitHub | n/a |
| ToS posture | NFL ToS | **"Systematic retrieval… prohibited"** (2024-05-16) | Identical boilerplate ×32 (2026-06-01) | **Disney ToU: no automation/AI/commercial/redistribution** (2024-05-24) | Same | **Free API, non-commercial; no redistribution** (2026-07-24) | No data license file | Paid license |
| Practice status (per-day) | ✔ per-day PDFs | ✔ weekly aggregate | ✔ weekly | ✖ | ✖ | ✖ (vestigial) | ✔ weekly aggregate | ✔ (paid) |
| Official game designation | ✔ | ✔ | ✔ | ~ (ESPN synthesis) | ~ | ~ (Sleeper vocab) | ✔ | ✔ |
| Gameday inactives | ✔ | ✔ (`/inactives/`) | ~ | ✖ | ✖ | ✖ | ✖ | ✔ |
| IR/PUP/NFI reserve lists | ~ | ✖ | ~ | ✔ (`fantasyStatus`) | ✔ | ✔ (roster `status`) | ✖ | ✔ |
| Player IDs | names only | names only | names only | ESPN id → gsis via ff_playerids | ESPN id | sleeper id (gsis native 16%) | **gsis native** | varies |
| Clocks in payload | per-day editions | **none** | none | ✔ top-level + per-item ISO minute | ✔ per-item | `news_updated` epoch-ms | **none** (`date_modified` gone in 2025) | ✔ |
| 2025 backfill | gated | ✔ week pages | partial | ✖ | ✖ | ✖ | **✔ full incl. playoffs** | ✔ (paid) |
| Rate guidance | n/a | none | none | none (1 call = league) | none (N+1) | **stated: <1000/min; players 1×/day** | GitHub CDN | contractual |
| Retain/redistribute verdict | neither | facts arguable, **BLOCKER** | neither (dominated) | **neither as read; BLOCKER** | same | facts internal: plausible; redistribution: **BLOCKER** | open in practice; chain-of-rights unresolved | per contract only |

## Preliminary ranking (frank)

### (a) TIBER-only governed admission

1. **nflverse injuries release** — gsis-keyed, free, full 2025 backfill of
   exactly the official practice/designation content; dominant blocker is
   *inherited* rights ambiguity plus 2026 continuity and the lost revision
   clock.
2. **Sleeper players dump** — the only owner-documented free automated feed;
   good for in-season live designation + reserve-list state with a real
   freshness clock; blockers: "personal/non-commercial" ToU vs TIBER's free
   public product, no practice status, no history, weak native gsis.
3. **NFL.com injuries + inactives pages** — canonical content, uniquely
   covers gameday inactives, robots-permitted; dominant blocker is the
   express systematic-retrieval ToS clause; also no timestamps and a live
   routing anomaly.
4. **ESPN site API** — best clocks and reserve-list detail, one-call league
   snapshot; dominant blocker is the harshest posture evaluated; editorial
   comment fields are radioactive and must never be stored.
5. **ESPN core API** — same rights blocker, worse politeness economics.
6. **media.nfl.com PDFs / club sites** — excluded.

### (b) Upstream / nflverse contribution potential

1. **Fixing/maintaining the existing nflverse injuries pipeline** is the only
   real contribution path: the 2025 asset already exists; the contribution is
   **2026 automation restoration/continuity + reinstating a
   `date_modified`/per-day observation clock**. Dominant blocker: nflverse's
   own unstated data-license/chain-of-rights, which a contribution inherits
   rather than cures.
2. **NFL.com pages as the pipeline's source** — content-canonical,
   robots-permitted, but the ToS clause means the pipeline operator carries
   the risk; that is the ecosystem status quo, not a new grant.
3. **ESPN and Sleeper: unsuitable upstream.** ESPN's ToU prohibits
   redistribution outright; Sleeper's free API is non-commercial/
   no-redistribution and its vocabulary is non-official; both are keyed to
   non-gsis IDs.

## Unresolved questions only rights counsel or the source owner can answer

1. **NFL ToS scope:** does extraction of *unprotectable facts* survive the
   §1.3 systematic-retrieval clause (browsewrap enforceability;
   hiQ/Van Buren-line reasoning)? The text as written prohibits it.
2. **Sleeper's "non-commercial":** does a free, open-source, no-paywall
   analytics product qualify? Does "reach out… to discuss licensing" apply to
   normalized facts as well as raw payloads? Only Sleeper can say (contact
   not authorized in this discovery).
3. **ESPN undocumented endpoints:** any implied license from a decade of
   serving unauthenticated JSON, against the Disney ToU and absent robots on
   the API hosts? Counsel question; owner position never stated publicly.
4. **nflverse chain of rights:** under what theory does nflverse-data
   redistribute official injury-report content, and does TIBER's governed
   admission inherit protection or exposure? Counsel and/or maintainers
   (outreach not authorized).
5. **media.nfl.com credentials:** would NFL grant non-newsroom research
   access to the per-day PDFs? Only NFL Communications can answer.
6. **AI-use clauses:** are agent-mediated sample reads of Disney properties
   distinguishable from the prohibited class going forward? A counsel
   determination should precede any repeat sampling of Disney properties.
