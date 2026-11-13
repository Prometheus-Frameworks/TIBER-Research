## Status and authority

**OPERATOR-APPROVED DESIGN INTAKE ONLY**

Joe approved posting this issue on 2026-08-14 so the causal-tree concept developed in chat becomes durable TIBER architecture.

This issue records the concept, ownership questions, candidate contract, and paired pilot design. It does **not** authorize a branch, code changes, source acquisition, a live Research run, player rankings, Forecast/Fantasy mutation, promotion, publication, or downstream advice. Any implementation or activated trace requires separate operator authority.

## Core idea

TIBER should preserve a football thesis as a **versioned causal tree**, not reduce it to one preseason rank and one final outcome.

> The tree may grow, but the original tree cannot be rewritten.

The system must preserve:

- what was believed;
- when it was believed;
- which evidence supported it;
- which assumptions connected the causal nodes;
- what would falsify it;
- which decision it informed;
- which later observations supported, challenged, or extended it; and
- what was learned without inserting hindsight into the original state.

A final fantasy outcome is one observation. It does not by itself establish whether the original player evaluation, workload assumption, environmental thesis, price decision, or causal mechanism was correct.

## Seed prospective tree — Jeremiyah Love

The following is **operator thesis structure**, not universal TIBER truth and not an approved player forecast:

```text
Jeremiyah Love
│
├── Talent
│   └── prospect profile + preseason translation
│
├── Organizational commitment
│   └── extremely high draft capital
│
├── Role
│   ├── expected heavy workload
│   └── receiving involvement
│
├── Competition
│   └── Allgeier is competent
│
├── Environment
│   ├── LaFleur / Rams-McVay lineage
│   └── expected passing-offense improvement
│
└── Fantasy translation
    └── PPR receiving + workload → high ceiling
```

Potential future unlocks that must be added as new tree versions/events rather than backfilled into the original thesis:

```text
Player capability
- prospect profile
- receiving ability
- elusiveness / creation
- preseason translation

Role access
- workload share
- receiving involvement
- goal-line access
- third-down / two-minute access

Competition
- Allgeier ability
- actual snap split
- late-season role movement

Offensive environment
- coaching/scheme translation
- passing-offense elevation
- quarterback execution
- scoring-drive quality

Constraints
- offensive-line health/quality
- game script
- player health
- defensive attention

Market and decision state
- acquisition cost
- available alternatives
- how much uncertainty was priced in

Fantasy translation
- rushing volume
- receptions
- touchdowns
- weekly usability
- total PPR outcome
```

### Counter-thesis to preserve

A competing operator view from the same football discussion was that Jadarian Price may outperform Love in fantasy.

The system should not flatten this into `Love good / Price bad`. It should identify where the disagreement actually lives, such as:

- workload concentration;
- receiving involvement;
- competition strength;
- offensive environment;
- player talent;
- acquisition cost; and
- timing of role materialization.

The counter-thesis is operator field evidence only unless separately admitted and governed.

## Why a sub-1,000-yard Love season would remain informative

If Love finishes below 1,000 rushing yards, several materially different adjudications remain possible:

```text
Talent supported; workload assumption contradicted.
Talent supported; offensive environment failed to improve.
Role supported; offensive-line constraints depressed efficiency.
Allgeier was a larger threat than expected.
Allgeier improved during the year rather than Love regressing.
Love was useful in PPR despite missing a rushing threshold.
The player thesis was sound but the acquisition price was wrong.
The competing operator predicted the outcome but for a different mechanism.
```

TIBER must keep these distinct.

## Outcome and process dimensions

Do not collapse the year-end review into one `right | wrong` field.

At minimum, preserve separate assessments for:

```text
outcome_accuracy
mechanism_accuracy
timing_accuracy
market_or_price_accuracy
decision_quality_at_original_information_set
update_quality_as_new_evidence_arrived
```

The first useful product is an inspectable record, not a single composite score.

## Paired pilot design

### Pilot A — prospective Jeremiyah Love trace

Before the season:

- freeze the original Love thesis tree at an exact cutoff;
- preserve the Price counter-thesis and its stated rationale separately;
- record market/acquisition context and the operator decision state;
- name expected signals, falsifiers, uncertainties, and Missing Witnesses;
- do not convert operator conviction into shared TIBER truth.

During the season:

- append observations to nodes and edges;
- preserve week/time scope;
- distinguish player capability, role, competition, environment, constraints, and fantasy translation;
- permit the decision to reopen when price, roster state, role, or evidence changes;
- never rewrite the preseason tree.

After Year 1:

- adjudicate each node/edge independently;
- distinguish process from realized outcome;
- preserve unresolved branches into Year 2;
- record any newly discovered variable as a tree extension/unlock.

### Pilot B — retrospective Ashton Jeanty calibration trace

Reconstruct a pre-Year-1 Jeanty tree from only evidence available at the declared historical cutoff, then compare it with Year-1 reality.

The retrospective must not erase poor rushing outcomes or remove inconvenient plays merely to defend the prospect thesis.

Instead preserve the complete rushing outcome and partition the causal question:

```text
All rushing attempts
│
├── Immediate backfield disruption
│   ├── defender penetration before designed access
│   ├── first contact behind the line of scrimmage
│   └── probable blocking / assignment collapse
│
├── Ambiguous negative plays
│   ├── possible blocking loss
│   ├── possible runner decision error
│   └── attribution unresolved
│
└── Access achieved
    ├── efficiency after reaching the line of scrimmage
    ├── yards after contact
    ├── missed tackles
    ├── explosive conversion
    └── runner-created value
```

The raw efficiency remains visible because those plays affected the offense and fantasy result. A conditional view answers a different bounded question:

> When Jeanty received minimally viable access, what did he do with it?

Any film/manual charting used to classify those plays must be represented as governed Manual Witness evidence with disagreement and uncertainty preserved.

Year-2 changes such as quarterback upgrade, offensive-line health stabilization, coaching change, scheme change, or player development become explicit new branches. They may legitimately move the forward thesis without being inserted retroactively into the Year-1 tree.

## Candidate architecture primitive — `CausalThesisLineageV0`

A future non-production contract should be able to represent:

```text
thesis_id
subject_refs
comparison_population
original_cutoff
operator_hypothesis
counter_theses
league_or_decision_context
market_context
causal_nodes
causal_edges
expected_signals
falsifiers
missing_witnesses
source_and_evidence_refs
observation_updates
tree_extension_events
decision_events
year_end_adjudication
carry_forward_implications
```

Candidate append-only event vocabulary:

```text
node_supported
node_challenged
node_contradicted
edge_supported
edge_unobserved
assumption_contradicted
new_constraint_discovered
new_witness_required
market_changed
decision_reopened
tree_extended
```

Every event needs a time/cutoff boundary, author/witness identity, evidence class, and explicit observation-versus-inference state.

## Relationship to existing TIBER work

This issue should align rather than duplicate:

- **TIBER-Research #3** — causal-path maps, challenges, Missing Witnesses, preregistered branches, and independently reviewed packets.
- **TIBER-Data #40** — historical rookie replay, weekly outcomes, role materialization, and `model_was_right_for_wrong_reason` / `model_was_wrong_for_right_reason` concepts.
- **TIBER-Ops #48** — operator thesis history, decision packets, draft traces, acquisition windows, and human final authority.
- **TIBER-Rookies** — prospect evidence and rookie translation; it must not own universal decision-state memory.
- **TIBER-Fantasy / TIBER-Strategy** — league, roster, market, board-geometry, acquisition, and operator-decision context.

## Proposed ownership boundary

### TIBER-Research

Owns:

- causal-thesis lineage semantics;
- node/edge assessment vocabulary;
- prospective/retrospective replay protocol;
- challenge, falsifier, counter-thesis, and year-end adjudication rules.

### TIBER-Data and evidence producers

Own:

- governed observations and outcomes;
- play/participation/availability/team-environment evidence;
- source identity, clocks, provenance, and missingness.

### TIBER-Fantasy / TIBER-Strategy

Own or consume:

- league and roster context;
- market/acquisition state;
- board geometry;
- operator decision lineage and user-facing assembly.

### Human operator

Owns:

- personal hypothesis and conviction;
- final fantasy action;
- decision rationale;
- whether a new/reopened decision is accepted.

Shared Reality may not be forked by operator preference. The projection of Shared Reality onto an operator's problem may differ.

## Required design deliverable for a later authorized task

A bounded design task should produce:

1. a `CausalThesisLineageV0` contract proposal;
2. immutable original-tree and append-only update semantics;
3. the Love prospective pilot record/template;
4. the Jeanty retrospective pilot record/template;
5. outcome-versus-process adjudication rules;
6. node/edge evidence and Missing Witness requirements;
7. Manual Witness / film-charting treatment;
8. cross-repo ownership and handoff map;
9. deterministic replay requirements;
10. UI/agent assembly implications without implementation;
11. a smallest honest v0 and staged backlog.

## Hard boundaries

Do not:

- turn the Love thesis into a universal player ranking or forecast;
- treat the Price counter-thesis as source-backed evidence;
- use final fantasy points as proof of a mechanism;
- rewrite the original tree after outcomes are known;
- delete unfavorable plays from Jeanty's raw outcome;
- label an access-conditioned slice as overall rushing efficiency;
- infer blocking attribution without an admitted witness;
- make film classifications authoritative without contributor identity, definition, disagreement, and review;
- silently score the operator as right or wrong;
- mutate Forecast, Rookies, Fantasy, Strategy, or promoted artifacts;
- implement a live product or activate a research run under this issue.

## Acceptance criteria

- [ ] Original trees are immutable and later knowledge is append-only.
- [ ] Outcome, mechanism, timing, price, decision quality, and update quality remain distinct.
- [ ] Love and Price remain separate operator hypotheses, not shared truth.
- [ ] Prospective and retrospective replay use the same core lineage semantics.
- [ ] Raw outcomes remain visible alongside conditional causal slices.
- [ ] New variables become explicit unlocks/tree extensions rather than hindsight edits.
- [ ] Every node/edge can declare evidence, counterevidence, uncertainty, falsifiers, and Missing Witnesses.
- [ ] Operator decision context remains separate from shared evidence.
- [ ] Cross-repo ownership is explicit.
- [ ] No ranking, projection, advice, model mutation, source acquisition, or product implementation occurs.

## Candidate terminal decisions for a later design task

```text
causal_thesis_lineage_v0_ready_for_paired_pilot_activation
causal_thesis_lineage_v0_requires_contract_or_ownership_followup
causal_thesis_lineage_v0_blocked
```

A positive design decision would authorize only separate operator consideration of a bounded paired-pilot issue. It would not itself activate the Love or Jeanty traces.