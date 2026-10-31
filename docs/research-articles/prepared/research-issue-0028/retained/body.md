## Status and authority

**DESIGN ONLY. Disposition: `ol_context_v0_requires_followup`.**

Keep **OL Context** as the working title. Label outputs **rushing environment** and **pass-protection outcomes**. These describe team environments and observed outcomes; they do not isolate offensive-line contribution or separate “line vs back.”

Joe provided the initial draft and approved posting the corrected design on October 4, 2026. Prepared and reviewed by **dot (OpenAI)** under that bounded instruction. This agent-materialized record and GitHub account attribution are not cryptographic human-origin proof. Authority is limited to this issue publication; no implementation lane is activated.

This issue authorizes no code, branch/PR, source acquisition/admission, data construction, research or predictive run, runtime/mock implementation, promotion, provider outreach, spending, scheduling, merge or deployment. Any later task requires its own bounded authority.

## Purpose and ownership

Design the smallest honest OL Context layer for eventual TIBER Team inspection, while preserving quarterback, runner, play-calling, game-state, opponent and sampling influences.

This Research issue owns the question decomposition and test-design handoff. It does not relocate source truth or runtime ownership:
- **TIBER-Data:** source qualification, observations, identities, grains, denominators, coverage, clocks, rights and admission
- **TIBER-Teamstate:** team-environment interpretation from governed Data inputs
- **Role-and-opportunity-model:** observed player role and separately qualified route/block observations
- **TIBER-Fantasy / Team:** eventual governed evidence assembly and display
- **Forecast:** any separately authorized predictive evaluation

This follows [Research #9](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/9) and the [Teamstate boundary](https://github.com/Prometheus-Frameworks/TIBER-Teamstate/blob/9513fdae81d3a70189b8ebf03f38d40e1921204e/README.md). Ops coordinates authority; it does not own football data or model logic.

## Reconcile existing work

- [Research #3 actual Tunsil run](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/3#issuecomment-5293543208) and [PR #7](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/7): bounded research did execute; protection/redistribution mechanisms remained inconclusive and the terminal result required data follow-up. Do not describe it as merely an unexecuted proposal or as validating an OL causal model
- [Data #234](https://github.com/Prometheus-Frameworks/TIBER-Data/issues/234) and [PR #260](https://github.com/Prometheus-Frameworks/TIBER-Data/pull/260): reuse contact/evasion observation and fail-closed gate semantics. Contract availability does not imply admitted contact data
- [Ops #93](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/93): licensing/attribution follow-up remains pending; this issue grants no rights clearance
- [Forecast #190](https://github.com/Prometheus-Frameworks/TIBER-Forecast/issues/190): strict historical point-in-time qualification remains binding. The 2025 predictive path is currently blocked; do not weaken it to run this design
- [Fantasy #399](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/issues/399): player chart-builder design/metric registry is a reuse reference, not an implemented team-level chart or permission to add OL metrics
- [Fantasy #407](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/issues/407) / [#391](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/issues/391): preserve the unified Team plan and existing handoff rather than creating a competing execution plan
- Existing Fantasy OLC/opponent and rbContext paths require source/provenance reconciliation before reuse. Random/estimated legacy values and the 65% yards-before-contact estimate are not evidence and must not become design inputs

## Candidate metric definitions

All items below are candidates pending field-level readiness, purpose and admission checks. Freeze the eligible play universe before calculating rates. Record exact numerator, denominator, exclusions and coverage for each metric.

### Rushing environment

1. **Stuff rate:** eligible rushes gaining zero or fewer yards / eligible rushes. Explicitly decide treatment of kneels, scrambles, quarterback sneaks, penalties/no-plays, null yardage and season type
2. **Rush success rate:** eligible rushes with EPA greater than zero / eligible rushes with valid EPA. Preserve missing-EPA coverage separately
3. **Rush EPA/play:** sum of valid EPA / the same declared valid-EPA rush universe
4. **Direction/gap splits:** source-supported direction and gap only, retaining missing/unknown categories and sample sizes. Direction is not proof of an individual blocker's responsibility
5. **Box context:** FTN/nflverse charted defenders-in-box observations, where era and field coverage qualify; never turn absent charting into a light box
6. **NGS RYOE:** retain the source definition and covered-attempt population. Aggregate only matching team/window/covered-attempt observations with the correct attempt weighting. Do not average player rates without their denominators or apply covered-attempt RYOE to all PBP rushes

RYOE and stuff rate may be complementary descriptions. Their combination does not identify causal “line vs back” shares. First-contact and yards-before-contact observations are excluded unless a separately qualified witness supplies the actual field, definition, grain, coverage and rights.

### Pass-protection outcomes

1. **Sack and quarterback-hit outcomes:** explicit eligible dropback universe, source-native event definitions and handling of overlaps
2. **FTN quarterback-fault sack sensitivity:** show the raw result and a separately labeled restricted/sensitivity view. Removing QB-fault sacks does not make every remaining sack an OL-caused event
3. **FTN blitzers/pass rushers:** preserve distinct fields, coverage and context; neither is a complete pressure-event measure
4. **NGS time to throw:** label its source population and sack exclusion. It is not time to first pressure and must not be treated as an all-dropback protection metric

nflverse `pass_attempt` includes sacks. Do not add sacks to that count again. Define how scrambles and other dropback outcomes enter the chosen denominator rather than using interchangeable “attempt” and “dropback” labels.

PBP sack/hit flags, blitz counts and time to throw do not provide a complete pressure rate. Missing FTN classification is unknown, not false or “not QB fault.”

Definition references: [nflverse PBP dictionary](https://nflreadr.nflverse.com/articles/dictionary_pbp.html), [FTN charting dictionary](https://nflreadr.nflverse.com/articles/dictionary_ftn_charting.html), [NGS dictionary](https://nflreadr.nflverse.com/articles/dictionary_nextgen_stats.html), [participation dictionary](https://nflreadr.nflverse.com/articles/dictionary_participation.html). These references are not retained datasets or admission receipts.

## Opponent adjustment and windows

- Present raw and adjusted values separately. Declare the model/design, opponent sample, shrinkage/regularization, minimum sample, uncertainty and missingness
- For a predictive use, all opponent information and fitting must be past-only at the prediction cutoff
- For a retrospective descriptive comparison, use a declared leave-game-out opponent baseline to avoid using the evaluated game as its own benchmark; label it retrospective
- No silent season pooling or shrinkage across incompatible eras, source definitions or windows
- Upcoming schedule context is a separate forward-looking object, not a rewrite of observed team results
- Preserve personnel, QB, runner, scheme, game-state and opponent confounding. An adjusted association is still not isolated line attribution

## Hypotheses and test-design requirements

**H1 — Rushing environment and subsequent RB outcomes.** Test whether prior-window environment measures relate to later RB rushing efficiency/opportunity outcomes. Specify target, horizon, unit of analysis, controls and baseline before looking at results. Avoid same-week mathematical coupling: an EPA/stuff-derived feature correlated with overlapping EPA/yardage outcomes is not independent evidence of usefulness.

**H2 — Protection outcomes and RB target share.** Test the proposed association between poorer protection outcomes and later RB target involvement. Freeze RB identity/position, target numerator, team-target denominator, window, coverage and game-state controls. Target share is not route participation or proof of checkdown causality.

**H3 — Protection outcomes and RB route participation.** A distinct hypothesis is that protection demands reduce RB routes through blocking/chipping responsibilities. This test stays blocked without an actual governed route/route-versus-block witness and matching team-dropback denominator. FTN's primary-receiver route field does not enumerate all RB routes.

H2 and H3 can both hold: targets per route and route volume are different mechanisms. Do not force mutually exclusive verdicts or infer either from the other.

Separate:
- **2025 retrospective associations:** describe relationships using explicitly retrospective data, if that purpose and the fields qualify
- **2025 point-in-time prediction:** requires historical availability/revision evidence and the strict Forecast #190 cutoff; currently blocked

Do not rebrand a hindsight association as a backtest. Preregister missingness, minimum samples, multiple-testing treatment, uncertainty, falsifiers and negative/null outcomes. No experiment is run under this issue.

## Required design handoff and acceptance criteria

- [ ] Field-readiness matrix names dataset, era/channel, source-native field, exact definition, grain, numerator/denominator, eligible population, sample/coverage and join keys
- [ ] Matrix separately records event/publication/availability/retrieval/cutoff clocks, revisions, permitted purpose, source/rights evidence, admission state, and live versus retained/snapshot status
- [ ] Each metric has a deterministic definition and positive/negative test design for zero versus missing, missing charting, sacks counted once, unmatched coverage, incompatible windows and incomplete joins
- [ ] Raw and adjusted views preserve coverage/uncertainty and do not claim causal line attribution
- [ ] H1 uses lagged, non-overlapping outcomes; H2/H3 have distinct denominators and H3 remains gated by true route evidence
- [ ] 2025 retrospective description and strict point-in-time prediction remain separate
- [ ] Any visual deliverable is a clearly labeled **mock specification only**, with invented examples explicitly synthetic; no automatic runtime integration or real-player estimated values
- [ ] Team-level chart requirements are separately specified rather than asserted to be implemented by #399
- [ ] Ownership and the smallest follow-up proposal are explicit, reusing existing contracts and handoffs
- [ ] No per-lineman grades, fixed line-attribution percentages, composite OL score, forecast/ranking changes or fantasy advice
- [ ] Paid PFF/SIS/Fantasy Points and other source-specific restricted fields remain excluded absent a qualified witness and applicable rights. Do not claim every first-contact/YBC metric is intrinsically proprietary; qualification is field/channel/purpose-specific
- [ ] No sources, datasets or fixtures are acquired or admitted and no code or product change occurs

## Decision

**`ol_context_v0_requires_followup`**

The corrected design can be recorded now. The smallest next proposal is a read-only field-readiness and test-design packet under the owners above. Readiness is not implementation, source admission, Research activation, or Forecast approval.

Governance: [Ops #66](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/66). Normal public issue visibility, notifications and cross-references apply. The inspected Research tree has one CI workflow, triggered by PRs and main pushes, not issues; administrative integration settings were not inspected. No external-agent invocation or assignee is requested, and no runtime authority is conveyed.
