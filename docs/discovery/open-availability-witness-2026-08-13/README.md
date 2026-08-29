# Open availability witness — consolidated discovery reference

Status: **AUTHORITY-INERT DISCOVERY REFERENCE — NOT ADMITTED EVIDENCE**

Prepared 2026-08-13 for [TIBER-Research issue #5](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/5)
(Lane 2 of the availability/event-shock project). This directory consolidates
W1–W3 discovery notes, the W4/W5 design drafts, a W6 template, and a dated
candidate disposition for operator decision.

## Custody and authority boundary

This is a **reference-only documentation checkpoint**, not a Stage 0/Stage 1
Research run, admitted source package, submission, independent `review.json`,
or seal. The 2026-08-13 probes did not retain the complete bytes, observation
receipts, trust-boundary records, or hash-bound inputs required to replay or
admit their conclusions. Those missing custody records cannot be reconstructed
retroactively from prose or URLs.

Accordingly, every observation here is dated, non-promotable, and carries no
source-admission, rights, acquisition, outreach, implementation, publication,
or downstream authority. A later run may use this directory to orient fresh
work, but must re-observe and admit every load-bearing source under the current
Research contracts. Pull-request review of this documentation does not convert
it into governed Research evidence.

Recorded method: read-only discovery; no scraping beyond 1–2 polite sample
requests per candidate endpoint; no credentials; no gate bypass; no contact
with any maintainer or source owner; robots/terms pages read as manual
references and quoted with observed revision dates. Where a commit SHA is
present it identifies an immutable revision; branch-head URLs and dated page
reads are locators, not replayable pins. The consolidated documents are:

- [`w1-historical-contract.md`](w1-historical-contract.md)
- [`w2-upstream-ownership.md`](w2-upstream-ownership.md)
- [`w3-candidate-matrix.md`](w3-candidate-matrix.md)
- [`w4-availability-contract-design.md`](w4-availability-contract-design.md)
- [`w5-dual-layer-architecture.md`](w5-dual-layer-architecture.md)
- [`w6-contribution-packet-template.md`](w6-contribution-packet-template.md)
- [`witness-terminology.md`](witness-terminology.md)

**Rights and admission vocabulary.** This packet is a discovery audit, not a
legal opinion, and no authorized legal determination exists behind any
statement in it. It separates (a) **empirical rights observations** — cited
terms/robots/license text with observed revision dates; (b) the current
Research shape for a non-admitted source — `admitted: false` plus
`admissibility.state` of
`inadmissible` or `unresolved` and an exact `rights_disposition_ref`; and (c)
**counsel questions** — enforceability, protectability, and inherited-rights
questions adjudicated nowhere here. This reference creates no admission
object. Unknown or facially adverse terms remain unresolved and fail closed;
that is TIBER's posture, not a claim about what the law permits.

---

## Headline findings (these change the issue's premise)

1. **A replacement artifact appeared after the source was reported dead.** The
   pinned nflreadr vignette says the NFL Data Exchange source at `nfl.info`
   died after the 2024 season. On **2026-03-18** the maintainer replaced the
   public NFLDX acquisition call with the **non-public `nflverse/nflapi`**
   package and
   **published an `injuries_2025` file** to the public nflverse-data release.
   Its observed ledger contained 6,068 rows, 32 distinct team values, and rows
   in REG weeks 1–18 plus WC/DIV/CON/SB—not every team-week pair—while
   `gsis_id` was populated in every row. Those ledger facts do not establish
   completeness or a declared universe; no authoritative expected-row census
   was available. At the observation point, the nflreadr vignette still said
   "no 2025 data"; the dictionary remained unchanged and did not match the
   observed 2025 schema. Cross-checked in W1 (commit
   `dbea11a`, patch inspected) and
   W2 (release `timestamp.json` = `2026-03-18 08:45:29 EDT`; file downloaded
   and inspected) using different source surfaces in the same discovery lane.
2. **The 2025 file carries a schema drift with a governance cost**: it adds
   `season_type` and **drops `date_modified`** — the per-row revision clock is
   gone. On the reviewed public surfaces, the only remaining revision signal
   observed was the release-asset timestamp; it is not an execution ledger.
   The 2025 artifact should also be treated as a **distinct candidate
   generation** from 2009–2024: it is one observed retrospective publication
   produced through a different, non-public acquisition implementation, not
   evidence of an in-season stream. The ultimate endpoint, source, and access
   method were not observable.
3. **Whether a 2026 in-season witness exists is genuinely unknown.** The
   workflow file observed 2026-08-13 declares a 07:00 UTC
   September–February cron. The March publication occurred outside that
   window; a manual dispatch is one possible explanation, not an observed
   fact. The first configured post-observation invocation would fall in
   **September 2026**, but configuration alone is not evidence of execution. At
   the 2026-08-13 observation point this reference therefore did not establish
   a 2026 in-season stream; the open empirical gap was **in-season 2026 latency
   and continuity**, not 2025 artifact existence.
4. **No admission record exists for any evaluated candidate.**
   The empirical record: NFL.com's injury paths were not disallowed by the
   observed robots file, but its ToS
   text on its face prohibits systematic retrieval; the sampled Eagles club
   site matched previously observed NFL/club boilerplate, but all 32 sites
   were not audited. Disney ToU text reviewed for the ESPN/Disney property
   facially restricts automation, AI-tool use, commercial use, and
   redistribution, and the parent property's robots text disallowed
   `anthropic-ai`; applicability of that terms instrument to the sampled API
   hosts remains unresolved. The official
   media.nfl.com injury-report PDFs are behind a media-credential gate.
   Among evaluated candidates, Sleeper is the only owner-documented free API,
   but its stated license is personal/non-commercial, and no redistribution
   grant was found on the enumerated terms/documentation surfaces. The sampled
   preseason dump exposed no usable practice-status witness. Gated sources
   were excluded from the discovery envelope; all other admission, rights, and reliability questions remain for
   the applicable governed review. That is an evidence boundary, **not** a
   legal determination; enforceability and scope questions are routed to
   counsel.

## W1 — historical contract (summary)

The historical dataset (2009–2024) is one combined player × team × week
snapshot row,
keyed by `gsis_id`, with the official two-status model: `practice_status`
(Full/Limited/DNP) and `report_status` (game-designation field:
blank/Questionable/Doubtful/Out; a raw blank may mean no designation,
not-yet-designated, or a dirty/partial row and remains unresolved without exact
report-edition evidence). `date_modified` is
the per-row revision clock (dense 2022+, ~absent pre-2020). Upstream was the
authenticated NFL Data Exchange XML service (publicly-known default
`media/media` credentials in the open-source scraper — reachability ≠
permission). The historical workflow declared a daily 07:00 UTC whole-season
refresh. Observed row timestamps concentrated on Friday, but neither the cron
nor the release timestamps are an execution ledger.
The dated death timeline cites immutable commits where available and mutable
release/page locators otherwise (last observed 2024 asset-update timestamp
2025-02-13; vignette
death notice 2025-09-05; resurrection commit 2026-03-18). The full field →
semantics → clock-class → survived-the-drift table is in
[`w1-historical-contract.md`](w1-historical-contract.md) §5.

## W2 — upstream ownership and precedent (summary)

The reviewed rosters, depth-charts, and injuries automation lives in
`nflverse/nflverse-rosters`, publishing to `nflverse/nflverse-data`
releases consumed by nflreadr/nflreadpy; the distribution repository contains
a CC-BY 4.0 `LICENSE.md`, while its scope over upstream material remains
unresolved. The
load-bearing structural observation: the orchestration repos were public, but
the three named endpoint-touching packages were not publicly accessible at the
audited organization locators (`nflapi`, `ngsscrapR`, `nflverse-espn`).

The closest observed precedent for source replacement is depth charts: the
source was documented as dead after 2024 → maintainers stood up an
ESPN-derived replacement in a non-public scraper → same release tag,
**breaking schema**, dictionary note, loader defaults updated — users' schema
complaints closed "completed," not reverted. ESPN QBR was likewise distributed
at the 2026-08-13 observation point via a community package.
Critically, W2 found **no maintainer statement on ESPN rights, redistribution,
or takedown risk on the enumerated reviewed surfaces** — where nflverse has
documented negotiated terms
(FTN), it says so explicitly (CC-BY-SA, attribution); no analogous ESPN
statement was found on the enumerated reviewed surfaces.

What precedent does **not** establish (full list in the report): the audit
found no ESPN permission record for the evaluated use, no evidence resolving
the scope of nflverse's release license over upstream material, and no source
authorization transferable to TIBER. Those are evidence gaps, not legal
conclusions. The observed depth-chart replacement was schema-breaking; this
does not establish a general change policy.

Contribution norms: issue-first, tests expected, Discord for design
discussion; new *sources* have historically entered via maintainers or
provider partnerships — **no such outside-contributor case was found in the
reviewed contribution examples**. The observed automation failed closed
at the artifact level (abort-don't-truncate), staleness surfaced via
per-release `timestamp.json` + badge tables; reviewed history included
multi-month dark windows, and docs lagged the observed release assets in the
injuries case.

## W3 — candidate matrix (summary)

Full per-candidate qualification, comparison matrix, and quoted terms in
[`w3-candidate-matrix.md`](w3-candidate-matrix.md). Ranking as found:

**Technical candidate ordering — none admitted by this reference:**

1. **nflverse `injuries` release** — publicly reachable, free, gsis-keyed,
   with observed 2025 practice/designation-shaped fields. No admission record
   is created here. A later review would need to resolve upstream rights
   provenance, the lost revision clock, and unproven 2026 in-season continuity.
2. **Sleeper players dump** — among evaluated candidates, the only
   owner-documented free automated feed
   (<1000 calls/min; players endpoint 1×/day), real freshness clock
   (`news_updated`), carries reserve-list states (IR/PUP/NFI). Blockers:
   personal/non-commercial license vs. redistribution, Sleeper-normalized
   vocabulary (not the official record), no usable practice-status values in
   the sampled preseason dump (possible deprecation), native `gsis_id` coverage
   only ~16% (crosswalk via
   `ff_playerids` required).
3. **NFL.com injuries + inactives pages** — league-published content, uniquely
   carries gameday inactives; the paths were not disallowed in the observed
   robots file, while the ToS text on its face restricts systematic retrieval
   (enforceability/scope is a counsel question). No admission decision is made;
   the markup has no timestamps and a live routing anomaly (`REG18` URL serving
   a week-1-titled page) is its own stability warning.
4. **ESPN site API** — best clocks and reserve-list detail, one call returns
   the league; **the most restrictive terms text observed in this audit**
   (the reviewed Disney ToU text facially restricts
   automation/AI/commercial/redistribution, and `anthropic-ai` was disallowed on
   the parent property; applicability to the sampled API hosts is unresolved).
   Editorial comment fields are expressive editorial content; none was
   retained in this discovery, and any future retention requires a governed
   rights and admission decision. No admission decision is made. ESPN core
   API: same posture, worse politeness economics.
5. **media.nfl.com PDFs / sampled club site** — excluded from this discovery
   pass (credential gate for media PDFs; the sampled Eagles terms text
   facially restricts systematic retrieval). No all-club conclusion is
   asserted.

Commercial comparison rows (excluded from the open question): MySportsFeeds
(registration/patronage-gated non-commercial tier, paid commercial license) and
SportsDataIO (enterprise sales) both fail free/open/redistributable.

**For upstream contribution:** among evaluated paths, the one supported enough for later
re-observation is **possible hardening of the existing nflverse injuries
pipeline** — the 2025 asset was observed; the unresolved value proposition is
2026 in-season continuity plus a revision/observation clock. The observed
record does not support using ESPN or Sleeper as upstream donors.

## Implications for W4–W6 (preliminary, for operator discussion)

- The W4 source-neutral record should treat `date_modified`-class revision
  clocks as first-class but optional-by-source, and must represent the
  practice-status / game-designation / gameday-inactive / reserve-list
  distinction the issue names — no single evaluated source carries all four
  classes (NFL.com comes closest; nflverse carries the first two).
- The W5 dual-layer architecture proposes a sharpened upstream question: a
  public candidate L0 artifact already exists (the nflverse release), so the
  question is not
  "build an upstream dataset" but "harden an existing one whose provenance
  just became opaque (non-public `nflapi` acquisition code, ultimate source and
  access unknown)." The draft would keep the observed
  2025 backfill distinct from any empirically established 2026 generation and
  evaluate staleness against both `timestamp.json` and the season-scoped
  calendar.
- A separately authorized observation window could test predeclared public
  asset identities. Repeated receipt-bound publications would support only an
  in-window public-publication claim; no qualifying observation would mean only
  none was seen in that declared asset/window universe, not source absence or
  pipeline non-execution. This reference authorizes no monitoring.

## Owner-routed open questions

| # | Question | Owner |
|---|---|---|
| 1 | Does fact-extraction from NFL.com survive the §1.3 systematic-retrieval clause (browsewrap enforceability, facts doctrine)? | Rights counsel |
| 2 | Does TIBER's free/no-paywall product fall inside Sleeper's "personal and non-commercial" license, and does normalized-fact retention count as redistribution? | Sleeper (via operator outreach, if later authorized) |
| 3 | Under what theory does nflverse-data redistribute official injury-report content, and does TIBER's consumption inherit protection or exposure? | Rights counsel; nflverse maintainers (outreach not authorized) |
| 4 | Will the configured injuries workflow produce in-season 2026 public assets? | Successor empirical review; observation not yet authorized |
| 5 | Would NFL grant non-newsroom research access to the per-day injury-report PDFs? | NFL Communications (outreach not authorized) |
| 6 | Are agent-mediated sample reads of Disney properties distinguishable from the prohibited class under the AI-tool clauses? | Rights counsel — should precede any repeat ESPN sampling |

## Candidate discovery disposition — operator decision required

If an operator decides to close the dated discovery question at this boundary,
the evidence in this reference supports this candidate token:

```text
open_availability_source_rights_or_reliability_blocked
```

Rationale: no candidate had both a resolved admission/rights path and observed
2026 in-season continuity. The token would close only the dated discovery
question, without claiming that the block is permanent. It is **not emitted by
this reference**: an exact, durable operator decision is still required. A
separately authorized September–October observation could support a bounded
successor finding. Neither this recommendation nor later pull-request review grants
acquisition, collection, outreach, implementation, promotion, or downstream
authority.
