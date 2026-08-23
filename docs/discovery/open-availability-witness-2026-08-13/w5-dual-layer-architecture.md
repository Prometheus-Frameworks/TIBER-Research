# W5 — Dual-layer availability architecture (design draft)

Status: **AUTHORITY-INERT DESIGN — NOT IMPLEMENTED OR ADOPTED**

Prepared 2026-08-13 for TIBER-Research issue #5 (Lane 2). Formalizes the
layer boundaries the issue sketched, updated for the W1–W3 observation that a
public candidate L0 artifact exists (the nflverse injuries release). This does
not declare an admitted or reliable upstream layer. No durable operator record adopts this
architecture. The authority and custody boundary in [`README.md`](README.md)
controls it. Proposed terminology is recorded in
[`witness-terminology.md`](witness-terminology.md): L0 is a **Witness**; this
project investigates possible **Witness Restoration**; unresolved inputs
surface as contract-valid **Missing Witnesses**.

## The layers

```text
[L0] upstream normalized availability artifact
     e.g. nflverse-data `injuries` release; community-maintained; its own
     schema, cadence, and unresolved upstream-rights scope; A WITNESS, NOT TRUTH
        ↓  (governed download of a digest-bound release asset; no upstream scrape)
[L1A] TIBER-Data governed reusable-stream admission
     per-generation provenance class registration (W4 table)
     source + revision identity (source revision + content digest)
     rights observations separate from admission; retention scope enforced
     receipt-backed observation/trust boundary + full cutoff chronology
     canonical identity binding (gsis native, or declared crosswalk w/ method)
     vocabulary mapping tables with explicit non-mappings
     cutoff-eligibility evaluation (observation mode aware)
     revision/supersession handling (append-only, supersession links)
     population/coverage measurement (not assumed)
        ↓  (reusable governed artifacts with claim scopes)
[L1B] TIBER-Research run-scoped Manual Witness admission
     explicit operator authority + per-instance source/availability receipts
     excerpt/reference retention; non-promotable outside the bound run
     never upgrades into a reusable feed or TIBER-Data admission
        ↓  (run-scoped governed source objects)
[L2] TIBER-Research consumption
     both lanes freeze only admitted, cutoff-eligible inputs; Missing Witnesses
     freeze as blocked_inputs with owner routing
        ↓  (only through later governed contracts — none is adopted by this draft)
[L3] Forecast / Fantasy
     no availability-derived mutation of forecasts, rankings, or product
     surfaces without a separately adopted contract
```

## Boundary statements

**L0 is a witness, not automatic truth.** Publication is only the upstream
assertion that an artifact exists. A governed, digest-bound observation receipt
is what can establish that exact bytes were retrievable at a specified instant.
Everything else — whether the bytes may be retained, what their fields mean, whether
it is current, whether it covers the population, whose assertion it carries —
must be established by the applicable governed admission lane or remains
unresolved.

**Under this draft, L1A would add reusable availability-stream governance:**

- **Provenance class binding** (W4): which generation of the witness this is. A
  prospective 2026 generation remains `unknown_pending_observation` until
  governed receipts establish repeated qualifying public-asset observations
  or another observed generation mode inside a predeclared asset/window
  universe. No qualifying observation supports only that bounded statement; it
  does not establish global source absence or pipeline non-execution.
- **Rights/admission separation**: the discovery reference found no statement
  resolving the release's upstream rights chain. L1A records the empirical
  rights observation separately from TIBER's admission policy and scope.
- **Clock honesty**: the observed 2025 public artifact has no row-level revision
  clock. The release-level `timestamp.json` was the only public revision signal
  observed in this reference; L1 refuses to manufacture row-level ordering or
  an execution count from it.
- **Identity**: gsis-native for nflverse; crosswalk-with-declared-method for
  any source keyed otherwise.
- **Staleness semantics**: a declared season-scoped cron supplies context, not
  execution evidence. Staleness policy evaluates the exact asset/window
  universe against governed receipts and calendar policy, never an inferred run
  ledger.

**L1B preserves the existing Manual Witness exception.** Current main admits
specific operator-directed observations directly into a bounded Research run
with source metadata, availability receipts, true clocks, retention limits,
and `promotable: false`. That path is not a reusable feed and grants no
TIBER-Data or cross-run authority.

**L2 consumes claim-scoped governed inputs, not unadmitted feeds.** A Research
run freezes specific cutoff-eligible L1A artifacts and/or L1B source objects
into its inputs with claim scopes. What neither lane can provide freezes as
`blocked_inputs` with `owner_repository` and exits packets as gap-bound RFIs.

**L3 is closed by default in this draft.** This draft creates or implies no
availability-derived forecast/product mutation; opening that path would require
a separate future contract and operator decision.

## The "MSF" label — deliberately unresolved here

No durable operator record was found for an exclusive acronym reservation, so
this design does not supersede issue #5's earlier wording. It writes
**MySportsFeeds** in full for the commercial provider and uses
**TIBER-Research** for the L2 consumer. A future terminology decision can
reserve the acronym explicitly without changing the layer boundary.

## Failure modes the split contains

| Failure | Contained by |
|---|---|
| Upstream schema drift (already happened: `season_type` added, `date_modified` dropped) | L1 per-generation classes + mapping tables; drift registers a new class, does not silently flow through |
| Replacement/backfill publication after documentation reported a source death (observed 2026-03-18) | L1 observation-mode distinction; backfill records cannot satisfy in-window claims |
| A declared asset/window yields no qualifying observation | L1 records that bounded result; L2 claims degrade to `insufficient` with owner-routed RFIs instead of inferring global source absence or proxying |
| Docs contradicting assets (observed 2026-08-13) | L1A requires separately observed, digest-bound asset identity; documentation remains contextual rather than proof of asset state |
| Rights ambiguity | L1A separates the empirical rights record from admission and gates retention/reportability by exact admitted scope |

## Explicitly out of scope for W5

Collector implementation, scheduling, any TIBER-operated scraping of L0's
upstreams, community-contribution/verification machinery (future research
topic per the project thesis), and any Forecast/Fantasy wiring.
