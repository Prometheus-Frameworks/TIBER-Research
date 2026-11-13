## Status and authority

**OPERATOR-DECLARED PROJECT — DISCOVERY ONLY, NOT ACTIVATED FOR ACQUISITION OR OUTREACH**

Declared 2026-08-12 as Lane 2 of the availability/event-shock project established alongside TIBER-Research #3.

This issue authorizes investigation and design only. It does **not** authorize scraping, automated collection, credentials, paid/gated access, bulk retention, redistribution, contact with nflverse maintainers, an upstream issue/PR, production ingestion, artifact promotion, or downstream Forecast/Fantasy use.

## Problem

TIBER's Tunsil event-shock pilot exposed a broader missing-witness problem: the open NFL ecosystem no longer provides the same current injury/practice-report continuity that historical research workflows relied on after the prior source stopped supplying post-2024 data.

A private one-off TIBER scraper would solve the immediate symptom while creating another opaque dependency. The higher-leverage question is whether a current, maintainable, rights-compatible availability witness can be restored in a way that benefits both TIBER and the wider open NFL-data ecosystem.

## Research question

> Can TIBER qualify a durable free/open source for 2025+ NFL injury, practice-status, and availability evidence, and — if appropriate — contribute a normalized version upstream to nflverse while retaining a stricter governed admission layer for TIBER?

## Why this is a TIBER project

This is not merely a data-scraping task. It is a source-governance problem involving:

- source death and successor authority;
- player/team identity continuity;
- publication, availability, retrieval, and revision clocks;
- practice status versus game status versus roster/IR truth;
- rights, retention, and redistribution constraints;
- schema compatibility and missingness;
- upstream reliability and shape-change detection;
- provenance needed for claim-scoped research;
- fail-closed behavior when the witness disappears or changes.

That makes it a useful MSF-style test of whether TIBER can restore a missing external witness without silently lowering its epistemic standard.

## Lane relationship

### Lane 1 — Tunsil manual governed pilot

TIBER-Research #3 remains the immediate golden trace. It intentionally uses a small manually admitted evidence set and must not wait for this project.

### Lane 2 — this issue

This issue investigates the durable/open successor. Findings here may later improve future event-shock jobs, but must not leak backward into the activated cutoff of #3.

## Discovery work

### W1 — reconstruct the historical contract

Document the historical injury/practice-report schema used by nflverse workflows, including where practical:

- season/week/date;
- team;
- player identifiers and name fields;
- report/practice/game status;
- injury description/body part;
- report type;
- update/revision timestamp;
- historical source identity;
- expected release cadence and missingness behavior.

Identify exactly what stopped after 2024 and distinguish source death from pipeline failure.

### W2 — inspect upstream ownership and precedent

Inspect the current nflverse repositories/workflows responsible for rosters, depth charts, injuries/practice reports, and released datasets.

Document:

- owning repository(s);
- current automation state;
- contribution norms;
- schema/release compatibility expectations;
- existing ESPN-derived tooling or precedent, if any;
- what that precedent does **not** establish about rights for a new injury source.

Do not contact maintainers yet.

### W3 — candidate-source qualification

Evaluate candidate sources without assuming public reachability equals permission.

At minimum consider:

1. first-party team practice/injury reports and availability statements;
2. NFL-operated public disclosures where available;
3. structured public endpoints that appear technically suitable, including ESPN candidates, but only as candidates pending rights/reliability review;
4. other genuinely open/licensed sources discovered during the audit.

For every candidate record:

- source owner and endpoint/page identity;
- access method;
- authentication/gating state;
- robots/terms/licensing posture;
- retention and redistribution implications;
- rate-limit/politeness requirements;
- coverage by team/week/status class;
- player identity quality;
- publication and revision clocks;
- schema stability;
- historical/backfill availability;
- known failure modes;
- whether raw content, normalized facts, or neither may be retained/redistributed.

Unknown rights state is a blocker, not an invitation to infer permission.

### W4 — minimal normalized contract

Draft a source-neutral availability record that can represent at least:

```yaml
season:
week:
report_date:
team_ref:
player_ref:
practice_status:
game_status:
injury_or_availability_description:
source_ref:
published_at:
available_at:
retrieved_at:
source_revision_ref:
identity_status:
rights_state:
```

Do not force fields unsupported by a source. Missingness must remain explicit.

### W5 — dual-layer architecture

Determine whether the project can support:

```text
upstream normalized public dataset
        ↓
TIBER-Data admission layer
  - immutable source/content receipt where permitted
  - source and rights state
  - clocks and cutoff eligibility
  - canonical identity binding
  - claim scope
  - revision/supersession handling
        ↓
TIBER-Research / MSF
```

The upstream artifact need not carry every TIBER-specific governance field. TIBER must not treat upstream publication alone as automatic claim admission.

### W6 — upstream feasibility packet

If a candidate survives W1–W5, prepare — but do not yet send — a proposed nflverse contribution packet containing:

- problem statement;
- evidence that the historical source/workflow no longer covers 2025+;
- candidate source and rights posture;
- sample normalized rows;
- schema compatibility analysis;
- caching/rate-limit strategy;
- fail-closed shape-change behavior;
- proposed maintenance commitment;
- tests/validation approach;
- unresolved questions for maintainers.

## Hard boundaries

Do not:

- treat an undocumented public JSON endpoint as licensed because it requires no key;
- scrape at production scale during discovery;
- bypass authentication, bot protection, paywalls, or gated APIs;
- reproduce proprietary raw content unnecessarily;
- silently substitute beat-reporter prose for official practice/game status;
- conflate depth-chart position with health/availability;
- conflate practice status, game designation, active/inactive status, IR/PUP/NFI state, and actual snaps;
- promise nflverse a source before rights and maintenance feasibility are understood;
- make the Tunsil pilot dependent on this project;
- promote a candidate source into TIBER-Data merely because an upstream project accepts it.

## Required deliverable

Produce a discovery packet with:

1. historical source/workflow reconstruction;
2. candidate-source matrix;
3. rights/reliability assessment;
4. source-neutral schema proposal;
5. identity and clock treatment;
6. failure/revision model;
7. dual-layer TIBER/upstream architecture;
8. draft upstream contribution packet if justified;
9. explicit unresolved questions and owner-routed RFIs;
10. exactly one terminal decision.

## Terminal decisions

```text
open_availability_source_upstream_candidate
open_availability_source_tiber_only_candidate
open_availability_source_rights_or_reliability_blocked
```

`upstream_candidate` means the evidence supports approaching maintainers with a concrete proposal; it does not authorize outreach or implementation by itself.

## Acceptance criteria

- [ ] Historical post-2024 gap is reproduced from pinned evidence rather than hearsay.
- [ ] At least first-party and structured-endpoint source classes are compared.
- [ ] Public accessibility and redistribution rights are evaluated separately.
- [ ] Candidate coverage and identity quality are measured, not assumed.
- [ ] Publication/retrieval/revision clocks are representable.
- [ ] Practice, game, roster, IR, and actual-usage states remain distinct.
- [ ] Unknown or adverse rights state fails closed.
- [ ] Upstream normalized data and TIBER claim admission remain separate authorities.
- [ ] No outreach or collector implementation occurs without a subsequent operator decision.
- [ ] Exactly one terminal decision is produced.

## Initial relationship to existing work

- TIBER-Research #3 — Lane 1 / Tunsil golden trace.
- TIBER-Data #246 / PR #249 — current player-state readiness and injury-source gap.
- TIBER-Data #231 / PR #250 — depth-chart pilot; depth chart is not availability truth.
- TIBER-Fantasy #297 / PR #322 — candidate post-cutoff ledger observations.

This issue is intentionally ambitious, but discovery remains bounded: first prove that a lawful, reliable witness exists; only then decide whether TIBER should build it, contribute it upstream, or stop.