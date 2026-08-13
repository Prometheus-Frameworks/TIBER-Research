# Open availability witness — W1–W3 discovery packet (draft)

Status: **DISCOVERY DRAFT — W1–W3 ONLY, OPERATOR REVIEW PENDING**

Prepared 2026-08-13 for [TIBER-Research issue #5](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/5)
(Lane 2 of the availability/event-shock project). This packet covers discovery
workstreams W1 (historical contract reconstruction), W2 (upstream ownership and
precedent), and W3 (candidate-source qualification). W4–W6 (source-neutral
contract, dual-layer architecture, upstream feasibility packet) and the
**terminal decision are deliberately deferred** until the operator reviews
these findings.

Method compliance: read-only research; no scraping beyond 1–2 polite sample
requests per candidate endpoint; no credentials; no gate bypass; no contact
with any maintainer or source owner; robots/terms pages read as manual
references and quoted with observed revision dates. Full workstream reports
with pinned evidence are in this directory:

- [`w1-historical-contract.md`](w1-historical-contract.md)
- [`w2-upstream-ownership.md`](w2-upstream-ownership.md)
- [`w3-candidate-matrix.md`](w3-candidate-matrix.md)

---

## Headline findings (these change the issue's premise)

1. **The witness was quietly resurrected.** The nflverse injuries source
   (NFL Data Exchange at `nfl.info`) did die after the 2024 season, exactly as
   the pinned vignette says — but on **2026-03-18** the maintainer replaced the
   scraper's upstream with the **private `nflverse/nflapi`** package and
   **retroactively backfilled a complete `injuries_2025` file** (6,068 rows,
   REG weeks 1–18 + full postseason, all 32 teams, `gsis_id` fully populated)
   to the public nflverse-data release. The nflreadr vignette and data
   dictionary still say "no 2025 data" — the documentation now contradicts the
   release assets. Independently confirmed by W1 (commit `dbea11a`, patch
   inspected) and W2 (release `timestamp.json` = `2026-03-18 08:45:29 EDT`;
   file downloaded and verified).
2. **The 2025 file carries a schema drift with a governance cost**: it adds
   `season_type` and **drops `date_modified`** — the per-row revision clock is
   gone. The only remaining staleness signal is the release-asset timestamp.
   The 2025 backfill is also a **distinct provenance class** from 2009–2024:
   one retrospective pull from a different, private, credentialed upstream,
   not an in-season observation stream.
3. **Whether a 2026 in-season witness exists is genuinely unknown.** The
   restored cron runs daily 07:00 UTC, September–February only; the March
   backfill ran outside that window (inference: manual dispatch). The first
   scheduled in-season evidence arrives **September 2026**. TIBER's rejection
   of nflverse injuries for current-2026 lanes therefore remains correct
   today, and the open gap is **in-season 2026 latency and continuity**, not
   2025 existence.
4. **Every non-nflverse open candidate is rights-blocked as read.** NFL.com's
   pages are robots-permitted but its ToS expressly prohibits systematic
   retrieval; all 32 club sites carry the identical platform boilerplate;
   ESPN's undocumented endpoints sit under the Disney ToU (no automation, no
   AI use, no commercial use, no redistribution, plus an explicit
   `anthropic-ai` robots block on the parent property); the official
   media.nfl.com injury-report PDFs are behind a media-credential gate.
   Sleeper is the only owner-documented free API, but its license is
   personal/non-commercial with no redistribution, and it carries no practice
   status. Unknown or adverse rights state is recorded as a blocker
   throughout — nothing in this packet infers permission from reachability.

## W1 — historical contract (summary)

The historical dataset (2009–2024) is player × team × week × report grain,
keyed by `gsis_id`, with the official two-status model: `practice_status`
(Full/Limited/DNP) and `report_status` (game designation: blank/Questionable/
Doubtful/Out; blank ≈ no designation, ~54% of 2024 rows). `date_modified` is
the per-row revision clock (dense 2022+, ~absent pre-2020). Upstream was the
authenticated NFL Data Exchange XML service (publicly-known default
`media/media` credentials in the open-source scraper — reachability ≠
permission). Cadence: daily 07:00 UTC re-scrape of the whole season file;
practice reports accrue Wed–Fri with game designations landing Friday.
Death timeline is fully pinned (last successful run 2025-02-13; vignette
death notice 2025-09-05; resurrection commit 2026-03-18). The full field →
semantics → clock-class → survived-the-drift table is in
[`w1-historical-contract.md`](w1-historical-contract.md) §5.

## W2 — upstream ownership and precedent (summary)

All availability-adjacent automation lives in `nflverse/nflverse-rosters`
(rosters, depth charts, injuries), publishing to `nflverse/nflverse-data`
releases (CC-BY 4.0 `LICENSE.md`) consumed by nflreadr/nflreadpy. The
load-bearing structural fact: **orchestration repos are public, but every
scraper package that touches an upstream endpoint is private** (`nflapi`,
`ngsscrapR`, `nflverse-espn`).

The closest precedent for source resurrection is depth charts: NFL Data
Exchange died after 2024 → maintainers stood up an ESPN-derived replacement in
a private scraper → same release tag, **breaking schema**, dictionary note,
loader defaults updated — users' schema complaints closed "completed," not
reverted. ESPN QBR is likewise distributed today via a community package.
Critically, W2 found **no maintainer statement anywhere on ESPN rights,
redistribution, or takedown risk** — where nflverse has negotiated terms
(FTN), it says so explicitly (CC-BY-SA, attribution); ESPN data carries no
such statement.

What precedent does **not** establish (full list in the report): ESPN-derived
data existing in nflverse is not an ESPN grant to anyone; CC-BY on releases
cannot cleanse upstream rights; maintainer acceptance is not transferable to
TIBER; availability is not a commitment (two source deaths and a silent
resurrection prove it); accepted replacements may be schema-breaking.

Contribution norms: issue-first, tests expected, Discord for design
discussion; new *sources* have historically entered via maintainers or
provider partnerships — **no observed case of an outside contributor landing
an entirely new scraped dataset end-to-end**. Reliability model: fail-closed
at the artifact level (abort-don't-truncate), staleness surfaced via
per-release `timestamp.json` + badge tables, multi-month dark windows
tolerated, docs sometimes lag reality (the current injuries case).

## W3 — candidate matrix (summary)

Full per-candidate qualification, comparison matrix, and quoted terms in
[`w3-candidate-matrix.md`](w3-candidate-matrix.md). Ranking as found:

**For TIBER-only governed admission:**

1. **nflverse `injuries` release** — open, free, gsis-keyed, full 2025
   backfill of exactly the official practice/designation content. Blockers:
   inherited chain-of-rights ambiguity (no data-license statement covering
   this scrape of NFL property), the lost revision clock, and unproven 2026
   in-season continuity.
2. **Sleeper players dump** — the only owner-documented free automated feed
   (<1000 calls/min; players endpoint 1×/day), real freshness clock
   (`news_updated`), carries reserve-list states (IR/PUP/NFI). Blockers:
   personal/non-commercial license vs. redistribution, Sleeper-normalized
   vocabulary (not the official record), no practice status (fields exist but
   are vestigial), native `gsis_id` coverage only ~16% (crosswalk via
   `ff_playerids` required).
3. **NFL.com injuries + inactives pages** — canonical content, uniquely
   carries gameday inactives, robots-permitted paths; blocked by the express
   systematic-retrieval ToS clause; no timestamps in markup; a live routing
   anomaly (`REG18` URL serving a week-1-titled page) is its own stability
   warning.
4. **ESPN site API** — best clocks and reserve-list detail, one call returns
   the league; **worst rights posture evaluated** (Disney ToU automation/AI/
   commercial/redistribution bans; `anthropic-ai` explicitly disallowed on
   the parent property; editorial comment fields are copyrightable expression
   and must never be stored). ESPN core API: same posture, worse politeness
   economics.
5. **media.nfl.com PDFs / club sites** — excluded (credential gate; 32×
   identical contractual prohibition).

Commercial comparison rows (excluded from the open question): MySportsFeeds
(registration/patronage-gated non-commercial tier, paid commercial license) and
SportsDataIO (enterprise sales) both fail free/open/redistributable.

**For upstream contribution:** the only realistic path is
**helping maintain/harden the existing nflverse injuries pipeline** — the
2025 asset already exists; the valuable contribution is 2026 in-season
continuity plus reinstating a revision/observation clock. ESPN and Sleeper
are unsuitable upstream donors (rights posture; non-official vocabulary).

## Implications for W4–W6 (preliminary, for operator discussion)

- The W4 source-neutral record should treat `date_modified`-class revision
  clocks as first-class but optional-by-source, and must represent the
  practice-status / game-designation / gameday-inactive / reserve-list
  distinction the issue names — no single evaluated source carries all four
  classes (NFL.com comes closest; nflverse carries the first two).
- The W5 dual-layer architecture holds, with a sharpened upstream question:
  the upstream layer already exists (nflverse release) — the question is not
  "build an upstream dataset" but "harden an existing one whose provenance
  just became opaque (private `nflapi`)." TIBER's admission layer must treat
  the 2025 backfill and any 2026 in-season stream as distinct provenance
  classes and must key staleness off `timestamp.json` + calendar (in-season
  crons make "no recent run" normal out of season).
- A September 2026 observation window will answer the continuity question
  empirically without any outreach: if the restored cron produces in-season
  `injuries_2026` updates, the witness exists; if not, the W6 upstream packet
  becomes the vehicle.

## Owner-routed open questions

| # | Question | Owner |
|---|---|---|
| 1 | Does fact-extraction from NFL.com survive the §1.3 systematic-retrieval clause (browsewrap enforceability, facts doctrine)? | Rights counsel |
| 2 | Does TIBER's free/no-paywall product fall inside Sleeper's "personal and non-commercial" license, and does normalized-fact retention count as redistribution? | Sleeper (via operator outreach, if later authorized) |
| 3 | Under what theory does nflverse-data redistribute official injury-report content, and does TIBER's consumption inherit protection or exposure? | Rights counsel; nflverse maintainers (outreach not authorized) |
| 4 | Will the restored injuries cron produce in-season 2026 data? | Empirical — observe September 2026; no outreach needed |
| 5 | Would NFL grant non-newsroom research access to the per-day injury-report PDFs? | NFL Communications (outreach not authorized) |
| 6 | Are agent-mediated sample reads of Disney properties distinguishable from the prohibited class under the AI-tool clauses? | Rights counsel — should precede any repeat ESPN sampling |

## Explicitly not decided here

No terminal decision is emitted in this draft. The candidate decisions remain
`open_availability_source_upstream_candidate` /
`open_availability_source_tiber_only_candidate` /
`open_availability_source_rights_or_reliability_blocked`, to be bound in the
full packet after operator review of W1–W3 and completion of W4–W6. Nothing in
this packet authorizes acquisition, collection, outreach, or implementation.
