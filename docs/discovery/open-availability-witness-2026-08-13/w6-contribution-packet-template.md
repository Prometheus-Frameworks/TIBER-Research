# W6 — Upstream contribution-packet template (template only; intervention deferred)

Status: **AUTHORITY-INERT TEMPLATE — NO PROPOSAL OR OBSERVATION AUTHORIZED**

This proposed template records the shape of a possible later nflverse
intervention packet. No durable operator record adopts the template, binds an
observation window, or authorizes monitoring, outreach, or a proposal. The
authority and custody boundary in [`README.md`](README.md) controls this file.
If a successor issue later records repeated qualifying public-asset
observations in a predeclared 2026 window, a contribution might address
revision-clock/provenance/documentation hardening. Other bounded results would
require a fresh problem-selection decision; this template predetermines none.

## Proposed successor gate

Recommended prerequisites for a separately authorized successor are:

1. a bounded operator-authorized observation plan that predeclares exact asset
   identities, window, expected observation opportunities (the denominator),
   content digests, receipts, and deltas. Repeated qualifying observations can
   support only an in-window public-publication claim; ledger counts never
   represent total upstream executions;
2. an operator decision selecting the contribution problem (continuity fix
   vs. hardening vs. none);
3. an operator decision authorizing outreach, separate from 1–2. No outreach
   is authorized by this template; any later outreach requires separate
   operator authority.

## Proposed packet sections (content deferred)

1. **Problem statement** — one paragraph, in nflverse's terms, not TIBER's.
2. **Evidence of the gap** — governed, receipt-bound observations only
   (release timestamps, asset listings, workflow crons, doc/asset
   contradictions); no hearsay.
3. **Proposed change** — smallest useful unit (candidate examples, chosen
   later by evidence: reinstate a row-level revision clock; per-day practice
   observation preservation; dictionary/vignette corrections; provenance
   notes distinguishing backfill vs. stream generations).
4. **Sample output** — a handful of normalized sample rows produced from a
   separately admitted public release artifact, before/after.
5. **Schema compatibility analysis** — against `injuries_2009–2024`,
   `injuries_2025`, and the nflreadr/nflreadpy loaders + dictionary; explicit
   breaking/non-breaking declaration. The observed depth-chart change is one
   compatibility case, not general permission for breaking changes.
6. **Caching / politeness strategy** — only if the proposal touches
   collection; otherwise explicitly n/a.
7. **Fail-closed shape-change behavior** — matching the ecosystem's observed
   abort-don't-truncate pattern.
8. **Maintenance commitment** — proposed owner, duration, and handoff stated
   honestly; a successor decision must name an accountable maintainer before
   making any ongoing commitment.
9. **Tests/validation approach** — matching nflreadr's testthat +
   data-dictionary expectations.
10. **Rights posture statement** — what the contribution does and does not
    claim about upstream rights (it cures nothing; it must not worsen
    anything); explicit acknowledgment that `nflapi` is a non-public
    maintainer-controlled acquisition implementation while the ultimate
    endpoint, source, and access remain unresolved.
11. **Unresolved questions for maintainers** — enumerated, answerable,
    none rhetorical.
12. **Community norms compliance** — issue-first per CONTRIBUTING; Discord
    for design discussion; humility clause: the proposal leads with working
    evidence useful to people who never use TIBER.

## Evidence a later, separately authorized proposal would require

- Freshly authorized, receipt-bound observations over predeclared exact
  `injuries_2026.*` asset identities, window, and expected observation
  opportunities. Record observed public generations and schema if they occur;
  a ledger count is not total executions, and no qualifying observation means
  only none was seen in that declared universe. Public reachability does not
  itself authorize retrieval or admission.
- The docs/asset contradiction described in W1, freshly re-observed and
  admitted; the dated reference is orientation, not a reusable pin.
- The revision-clock regression described in W1 (`date_modified` present in
  observed historical files and absent from the observed 2025 artifact),
  freshly re-observed and admitted.
- If proposing per-day practice preservation: freshly governed evidence that
  the release collapses intra-week states; do not promote the historical
  weekday calculation from this reference without replayable custody.
