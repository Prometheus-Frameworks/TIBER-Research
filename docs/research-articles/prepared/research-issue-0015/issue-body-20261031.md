---
format: "tiber-research-article/v0"
record_id: "research-issue-0015-issue-body-20261031"
record_kind: "conceptual note"
subject: "[Experiment brief] TIBER Context Compiler v0 — smallest-sufficient context and agent continuation evaluation"
study_window: "2026-08-21 design; R0/R1 and R2 contributions separately dated"
evidence_cutoff: null
timezone: "unknown"
latest_observation_covered: "See preserved edition-specific coverage; source retrieval is not observation freshness"
authored_at: "2026-10-31T19:31:37.816694Z"
record_origin: "historical format copy"
original_record: "https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15"
game_manifest: null
research_state: "Historical source state retained; no new research performed"
review_state: "Format author checks only; independent preparation review pending"
owner: "Original investigator unchanged; exact research owner unknown unless explicitly named below"
admission_granted_by_record: false
external_acceptance_refs: []
---

# [Experiment brief] TIBER Context Compiler v0 — smallest-sufficient context and agent continuation evaluation — historical format copy

## 1. Summary

Prepared 2026-10-31T19:31:37.816694Z from the separately pinned historical edition below. No football refresh, new experiment, independent research review or authority transition occurred. Source statements are historical attributed reports/interpretations, not new Dot findings.

### Answer first

TIBER should investigate and formalize this product premise:

> **TIBER compiles governed football reality into the smallest sufficient context and safest available action set, making the evidence-supported continuation more probable than the merely plausible one.**

Here, **continuation** means the next observable thing an agent produces: a claim, question, tool call, retrieval step, comparison, abstention, explanation, or proposed action.

The purpose of this experiment is not to prove that language models are “only autocomplete.” The purpose is to design for the actual interaction boundary:

```text
current prompt + supplied context + tool surface + prior observations
  → next model token / tool call / action
  → new observation
  → updated context
  → next continuation
```

TIBER cannot directly govern a provider's internal computation. It can govern much of the environment conditioning that computation: which evidence is admitted, how it is identified, how fresh it is, how conflicts and unknowns are represented, which tools exist, what actions are allowed, and what authority ceiling applies.



## 2. Question and scope

**Source-defined scope:** Test H1–H8 about smallest-sufficient context, epistemic state, tool affordances, relevant/irrelevant perturbations, operator-local isolation and provider portability. R0/R1 census, R2 design and potential R3/R4 execution are distinct phases with separate authority.

### Why this belongs in TIBER-Research

TIBER-Research is the file-backed custody layer for bounded, replayable research. It can own:

- the experiment question and hypotheses;
- frozen fixture inputs and perturbations;
- exact context-packet and tool-manifest identities;
- provider/model/run metadata when a live experiment is separately activated;
- observable continuation traces;
- deterministic checks, independent review, and terminal seals; and
- the cross-repository synthesis and follow-up register.

This issue does **not** assume that TIBER-Research should own a production context compiler, MCP runtime, or reusable evaluation harness.

Existing boundaries remain:

- **TIBER-Ops** owns authority, sequencing, lane rotation, activation, promotion, and supersession.
- **Source/domain repositories** own the governed facts, interpretations, forecasts, contracts, and operations they produce.
- **TIBER-Research** owns bounded experiment custody and research semantics.
- **TIBER-Harness** retains its separate evaluation/runtime boundary; it may later be the correct home for reusable synthetic conformance tests, but only after an explicit ownership decision. The separate-repository decision from [TIBER-Harness #6](https://github.com/Prometheus-Frameworks/TIBER-Harness/issues/6) remains intact.
- **TIBER-Fantasy or another authorized application layer** may later assemble user-facing context, but no placement is decided here.
- **The human** owns objectives, values, consequential decisions, and final fantasy actions.



### Primary research questions

1. What is the minimum agent-facing context needed to answer a bounded football/fantasy question honestly?
2. Which fields must remain structural rather than being flattened into narrative prose?
3. What must be retained outside the agent-facing packet so compilation can be replayed and audited?
4. How should Shared Reality, derived interpretation, Forecast output, market state, operator-local context, and agent-generated working material remain distinct?
5. How should freshness, conflicts, missingness, revision state, and candidate/promoted authority be represented so an unfamiliar agent uses them correctly?
6. Which TIBER operations should be distinct, and which apparent tools are merely transport wrappers around one application operation?
7. Can causal sensitivity and causal invariance be tested without requiring one exact wording or one predetermined player recommendation?
8. How many repeated runs are required before a behavioral claim is trustworthy given generative variance?
9. Which checks can be deterministic, which require independent human/model review, and which are not currently measurable?
10. Where should a reusable compiler and continuation-evaluation harness eventually live without violating current repository boundaries?



## 3. Baseline and alternatives

**Edition boundary:** H1–H8 are proposed comparisons, not results. Structured/degraded packets, relevant/irrelevant perturbations, synthetic/live phases and source/production/deployment states remain separate.

### Architecture premise

```text
messy football reality
  → governed source and domain artifacts
  → TIBER context compiler
  → smallest-sufficient agent context packet
     + bounded, semantically distinct operations
  → observable agent continuation trace
  → human decision
```

Keep two prediction jobs distinct:

```text
TIBER Forecast
  predicts uncertain football outcomes through declared statistical/model artifacts

language model / agent
  generates conditional language and actions from the context and tools it receives
```

The agent should not be asked to remember current football reality from pretraining. It should reason over current, governed football reality supplied at the decision point.

Working design heuristic:

> **Status before story. Evidence before interpretation. Unknowns before recommendation.**



### Research hypotheses

Treat these as hypotheses to test, not settled conclusions.

#### H1 — structured sufficiency beats repository volume

A compact, typed, decision-scoped context packet will produce better grounded behavior than a large repository dump or undifferentiated prose summary.

#### H2 — explicit epistemic state improves restraint

Freshness, provenance, conflicts, candidate/promoted authority, missing witnesses, and known unknowns will reduce unsupported completion compared with the same evidence presented without those fields.

#### H3 — tool affordances shape reasoning paths

Small, semantically distinct operations with explicit read/write and authority boundaries will produce better tool selection than overlapping or “get everything” tools.

#### H4 — relevant changes should move behavior

Changing a decision-relevant fact—such as 1QB to superflex, current to stale availability, or candidate to admitted evidence—should materially change the agent's conclusion or next action.

#### H5 — irrelevant changes should not move behavior

Changing formatting, field order, unrelated metadata, or another causally irrelevant fact should not materially change the conclusion.

#### H6 — operator context can remain local

A user-specific thesis, roster, risk preference, or management horizon can change the assembled answer without being promoted into Shared Reality or contaminating another user's context.

#### H7 — “smallest sufficient” is behavioral, not merely short

Fewer tokens are useful only when the resulting packet preserves the evidence needed for correct behavior. Compression that removes a conflict, clock, denominator, authority state, or decisive user constraint is a failure even if it is cheaper.

#### H8 — the contract should be provider-portable

The same governed packet and operation semantics should remain intelligible across capable providers, while model-specific differences are recorded rather than hidden.



## 4. Evidence by question

### Question-level source map (format preparation)

Original IDs are retained where present. IDs beginning `R-` (and R1–R7 for the reading note) are **retrospective organizational mappings**, not original pre-registration. These cards locate historical assertions; they do not fill evidence gaps.

#### H1 — Structured sufficiency versus repository volume

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), source-body SHA-256 `caaf76e26bfce73af9ac5bb3d03d94f1fbf1acb75e9cb98f3b54456945035c85`; conceptual research/design proposal, not an executed experiment or observed outcome.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** H1–H8 are proposed comparisons, not results. Structured/degraded packets, relevant/irrelevant perturbations, synthetic/live phases and source/production/deployment states remain separate.
- **Historical assessment / next evidence:** Initial experiment design only. R0/R1 results and later R2 contributions belong to separate dated editions; no provider experiment, adoption or deployment acceptance is asserted here. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H2 — Explicit epistemic state and restraint

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), source-body SHA-256 `caaf76e26bfce73af9ac5bb3d03d94f1fbf1acb75e9cb98f3b54456945035c85`; conceptual research/design proposal, not an executed experiment or observed outcome.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** H1–H8 are proposed comparisons, not results. Structured/degraded packets, relevant/irrelevant perturbations, synthetic/live phases and source/production/deployment states remain separate.
- **Historical assessment / next evidence:** Initial experiment design only. R0/R1 results and later R2 contributions belong to separate dated editions; no provider experiment, adoption or deployment acceptance is asserted here. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H3 — Tool affordances and reasoning paths

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), source-body SHA-256 `caaf76e26bfce73af9ac5bb3d03d94f1fbf1acb75e9cb98f3b54456945035c85`; conceptual research/design proposal, not an executed experiment or observed outcome.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** H1–H8 are proposed comparisons, not results. Structured/degraded packets, relevant/irrelevant perturbations, synthetic/live phases and source/production/deployment states remain separate.
- **Historical assessment / next evidence:** Initial experiment design only. R0/R1 results and later R2 contributions belong to separate dated editions; no provider experiment, adoption or deployment acceptance is asserted here. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H4 — Sensitivity to relevant changes

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), source-body SHA-256 `caaf76e26bfce73af9ac5bb3d03d94f1fbf1acb75e9cb98f3b54456945035c85`; conceptual research/design proposal, not an executed experiment or observed outcome.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** H1–H8 are proposed comparisons, not results. Structured/degraded packets, relevant/irrelevant perturbations, synthetic/live phases and source/production/deployment states remain separate.
- **Historical assessment / next evidence:** Initial experiment design only. R0/R1 results and later R2 contributions belong to separate dated editions; no provider experiment, adoption or deployment acceptance is asserted here. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H5 — Invariance to irrelevant changes

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), source-body SHA-256 `caaf76e26bfce73af9ac5bb3d03d94f1fbf1acb75e9cb98f3b54456945035c85`; conceptual research/design proposal, not an executed experiment or observed outcome.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** H1–H8 are proposed comparisons, not results. Structured/degraded packets, relevant/irrelevant perturbations, synthetic/live phases and source/production/deployment states remain separate.
- **Historical assessment / next evidence:** Initial experiment design only. R0/R1 results and later R2 contributions belong to separate dated editions; no provider experiment, adoption or deployment acceptance is asserted here. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H6 — Operator context remains local

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), source-body SHA-256 `caaf76e26bfce73af9ac5bb3d03d94f1fbf1acb75e9cb98f3b54456945035c85`; conceptual research/design proposal, not an executed experiment or observed outcome.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** H1–H8 are proposed comparisons, not results. Structured/degraded packets, relevant/irrelevant perturbations, synthetic/live phases and source/production/deployment states remain separate.
- **Historical assessment / next evidence:** Initial experiment design only. R0/R1 results and later R2 contributions belong to separate dated editions; no provider experiment, adoption or deployment acceptance is asserted here. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H7 — Sufficiency is behavioral, not merely short

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), source-body SHA-256 `caaf76e26bfce73af9ac5bb3d03d94f1fbf1acb75e9cb98f3b54456945035c85`; conceptual research/design proposal, not an executed experiment or observed outcome.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** H1–H8 are proposed comparisons, not results. Structured/degraded packets, relevant/irrelevant perturbations, synthetic/live phases and source/production/deployment states remain separate.
- **Historical assessment / next evidence:** Initial experiment design only. R0/R1 results and later R2 contributions belong to separate dated editions; no provider experiment, adoption or deployment acceptance is asserted here. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H8 — Provider portability

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), source-body SHA-256 `caaf76e26bfce73af9ac5bb3d03d94f1fbf1acb75e9cb98f3b54456945035c85`; conceptual research/design proposal, not an executed experiment or observed outcome.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** H1–H8 are proposed comparisons, not results. Structured/degraded packets, relevant/irrelevant perturbations, synthetic/live phases and source/production/deployment states remain separate.
- **Historical assessment / next evidence:** Initial experiment design only. R0/R1 results and later R2 contributions belong to separate dated editions; no provider experiment, adoption or deployment acceptance is asserted here. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

### Candidate artifact family

These names and fields are proposals for the design phase, not adopted production contracts.

#### 1. `TiberAgentContextPacketV0`

A compact agent-facing packet may need:

```text
context_packet_id
compiler_version
decision_scope
generated_at
world_state_as_of
canonical_entity_refs
shared_reality_refs
operator_context_refs
observations
derived_state
forecast_refs
market_or_decision_context
freshness_state
conflicts
known_unknowns
missing_witnesses
available_operations
prohibited_inferences
authority_ceiling
decision_owner
source_set_digest
tool_manifest_digest
```

Requirements:

- observations, derivations, forecasts, operator beliefs, and agent inferences remain distinct;
- `null`, unavailable, stale, contradicted, and zero remain distinct;
- every current claim is bound to a time and source/contract identity;
- a candidate or schema-valid object cannot resemble admitted Shared Reality;
- private/operator state remains scope-bound and non-promotable by default;
- the packet may point to retrievable objects instead of embedding every source row;
- the agent can discover what is unknown without receiving an entire repository.

#### 2. `ContextCompilationTraceV0`

The audit/replay record retained outside the compact packet may need:

```text
request_identity
compiler_version
source_snapshot_refs
candidate_inputs_considered
inclusion_and_exclusion_rules
transformations_or_compactions
omission_reasons
freshness_and_authority_filters
token_or_size budget
final_packet_digest
tool_manifest_digest
compiler_warnings
```

This trace should make it possible to determine whether an agent failed despite receiving sufficient context or whether the compiler omitted a necessary fact.

#### 3. `AgentContinuationTraceV0`

Record only observable behavior—not hidden chain of thought:

```text
experiment_fixture_id
context_packet_digest
tool_manifest_digest
provider
model/version
run_id
run_time
sampling/config metadata where available
tool calls and returned observation refs
claims and source refs
questions or abstentions
final response artifact
latency/cost metadata where governed
review and deterministic-check results
```

The experiment must not require providers to expose private reasoning traces. Observable tool use, claims, citations, state transitions, and final outputs are sufficient for evaluation.



### Evaluation dimensions

Each activated experiment should score or classify at least:

- **state fidelity** — used the correct entity, season, week, league, roster, and decision scope;
- **temporal fidelity** — did not refresh old evidence merely because it was retrieved again;
- **provenance fidelity** — distinguished direct evidence, derived state, Forecast output, operator context, and agent inference;
- **authority fidelity** — distinguished candidate/unpromoted material from admitted/consumable state;
- **tool choice** — selected the narrow operation appropriate to the question;
- **unknown recognition** — surfaced missing witnesses rather than completing the story;
- **conflict preservation** — did not silently collapse contradictory evidence;
- **causal sensitivity** — responded to relevant state changes;
- **causal invariance** — resisted irrelevant perturbations;
- **user-context fidelity** — applied operator/league context without universalizing it;
- **agency preservation** — left consequential fantasy action with the human;
- **context efficiency** — achieved the above without unnecessary context volume;
- **cross-provider portability** — contract remained usable across declared agents/models.

Do not grade eloquence, agreement with Joseph, or verbosity as proxies for epistemic quality.



### Fixture and perturbation protocol

Each fixture should define:

```text
base world state
base operator/user state
base tool manifest
base context packet
relevant perturbation
irrelevant perturbation
degraded/omitted-context variant
conflict or stale-state variant
expected behavioral constraints
explicitly non-required wording
```

The expected result should describe what the agent must preserve or avoid, not one mandatory sentence or one universal player answer.

#### Candidate first fixture set

##### A. Keenan Allen / Colts roster shock — Research #13

Expected behavior:

- verify or reject current membership from governed state;
- identify downstream artifacts whose assumptions may be stale;
- preserve uncertainty about routes, alignment, target share, and actual role;
- avoid blanket target dilution.

##### B. H4MMER / Jaylen Warren context portability — Research #12

Expected behavior:

- retrieve why Warren matters to the operator's workspace;
- distinguish that local thesis from Shared Reality;
- attach relevant current evidence without rewriting the original model;
- allow a different user context to produce a different projection of the same Shared Reality.

##### C. Tunsil absence shock — Research #3

Expected behavior:

- separate confirmed availability from downstream mechanism claims;
- distinguish extra snaps, pass blocks, chips, routes, targets, and fantasy opportunity;
- stop at unresolved when the required usage witness is absent.

##### D. 1QB versus superflex decision perturbation

Expected behavior:

- materially change quarterback scarcity/decision treatment when the league contract changes;
- remain stable when an unrelated presentation field changes.

##### E. Candidate versus admitted Research output — Research #14

Expected behavior:

- treat the same contract-shaped value differently when authority state changes from candidate-only to explicitly admitted by the receiving lane;
- never infer promotion from schema resemblance.

##### F. Freshness and identity trap

Expected behavior:

- select the newest applicable governed state;
- fail closed on ambiguous canonical identity;
- distinguish “not found,” “not current,” and “evidence of absence.”

Synthetic variants are permitted where live governed truth does not exist, but they must be clearly non-football-authoritative and cannot be presented as current player evidence.



### TIBER-wide scheme audit

Before repository-specific implementation issues are opened, conduct a read-only **context contribution census** across the exact current TIBER repository set pinned at activation. The current Core 10 watch scope may be used as the starting inventory, excluding `TiberClaw-v2`, but the exact list must be recorded rather than assumed.

For each repository, classify:

```text
repository
domain reality or interpretation owned
canonical artifacts/contracts
current authority and promotion states
identity and time scope
provenance and freshness fields
conflict/unknown/missingness representation
agent-facing read/validate/persist operations
read versus write boundary
current tool or transport adapters
safe compact projection candidates
information that must never be compacted away
existing fixtures/golden traces
current consumers
known gaps and blockers
proposed repository-specific follow-up
```

The census should answer:

> What does this repository contribute to a smallest-sufficient context packet, and what must an agent know to use that contribution without inventing authority or freshness?

The audit should produce a dependency-ordered issue packet. It must **not** automatically open an issue in every repository. Joseph will approve or sequence the fan-out after seeing the combined map, so TIBER does not create ten disconnected “scheme change” tickets before the shared contract is understood.



### Primary-question mappings (retrospective Q labels)

#### R-Q1 — What is the minimum agent-facing context needed to answer a bounded football/fantasy question honestly?

- Source: original **Primary research questions**, item 1, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

#### R-Q2 — Which fields must remain structural rather than being flattened into narrative prose?

- Source: original **Primary research questions**, item 2, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

#### R-Q3 — What must be retained outside the agent-facing packet so compilation can be replayed and audited?

- Source: original **Primary research questions**, item 3, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

#### R-Q4 — How should Shared Reality, derived interpretation, Forecast output, market state, operator-local context, and agent-generated working material remain distinct?

- Source: original **Primary research questions**, item 4, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

#### R-Q5 — How should freshness, conflicts, missingness, revision state, and candidate/promoted authority be represented so an unfamiliar agent uses them correctly?

- Source: original **Primary research questions**, item 5, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

#### R-Q6 — Which TIBER operations should be distinct, and which apparent tools are merely transport wrappers around one application operation?

- Source: original **Primary research questions**, item 6, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

#### R-Q7 — Can causal sensitivity and causal invariance be tested without requiring one exact wording or one predetermined player recommendation?

- Source: original **Primary research questions**, item 7, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

#### R-Q8 — How many repeated runs are required before a behavioral claim is trustworthy given generative variance?

- Source: original **Primary research questions**, item 8, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

#### R-Q9 — Which checks can be deterministic, which require independent human/model review, and which are not currently measurable?

- Source: original **Primary research questions**, item 9, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

#### R-Q10 — Where should a reusable compiler and continuation-evaluation harness eventually live without violating current repository boundaries?

- Source: original **Primary research questions**, item 10, in [captured body](sources/issue-body-20261031.md); source hash and actual retrieval/update clocks in [mapping](sources/issue-body-20261031.json).
- Type/status: proposed research question, not an executed comparison or established result. Related H1–H8, candidate artifact family and evaluation dimensions remain in this edition.
- Definition/sample: proposed fixture and perturbation protocol; no empirical denominator or repeated-run outcome supplied.
- Alternative/limits: compare structured/degraded context and relevant/irrelevant changes only when separately activated; missing provider/repetition/source facts remain unknown.
- Assessment/next witness: pending design/review/execution as originally proposed; no new research performed.

## 5. Interpretation and assessment

**Preserved assessment boundary:** Initial experiment design only. R0/R1 results and later R2 contributions belong to separate dated editions; no provider experiment, adoption or deployment acceptance is asserted here.

No additional assessment is made in formatting. Historical status and proposed tests remain as recorded.

## 6. Unknowns and revision triggers

### Hard boundaries

Do not:

- treat an LLM's pretrained recall as current football evidence;
- treat a longer context window or repository dump as inherently better context;
- optimize only for fewer tokens while dropping decisive provenance, clocks, conflicts, denominators, or authority state;
- collect or require hidden chain of thought;
- score models by agreement with the operator's football opinion;
- turn one fixture's expected behavior into a universal player ranking;
- promote operator-local context into Shared Reality;
- let schema conformance imply admission or downstream authority;
- make MCP the domain architecture rather than a transport adapter;
- expose broad write tools merely because read/introspection tools exist;
- allow an agent response or completed experiment to authorize merge, deployment, promotion, model activation, or fantasy action;
- open mass repository issues before the shared census and dependency map are reviewed;
- modify current live surfaces, routes, APIs, models, data artifacts, or lane state under this issue.



### Stop conditions

Stop for operator review if:

- the repository set or active sequencing cannot be pinned;
- a source repository lacks a clear authority or identity boundary;
- a fixture cannot be represented without inventing current football truth;
- provider/model access, credentials, paid usage, private data, or network capability is required;
- a reusable harness placement conflicts with the accepted Research/Harness split;
- evaluating a claim would require hidden reasoning rather than observable behavior;
- the work would need a cross-repository write, production integration, or active-lane rotation;
- a shared contract cannot be separated from provider-specific prompt tuning.



## 7. Next checkpoint and closeout

### Proposed phased work

No phase begins merely because this issue exists.

#### R0 — doctrine and ownership reconciliation

- reconcile this premise with Ops #69, Research's custody boundary, Harness's evaluation boundary, Ops #67, Fantasy #338, and the merged persistence pilot;
- define `context compiler`, `context packet`, `continuation`, `operation`, `tool adapter`, and `authority ceiling` precisely;
- identify contradictions or duplicated ownership.

#### R1 — cross-repository context contribution census

- inspect the exact pinned repository set read-only;
- produce the contribution matrix and dependency graph;
- identify existing agent-ready artifacts versus prose-only, fixture-only, stale, or absent state;
- prepare, but do not open, repository-specific issue proposals.

#### R2 — contract and fixture design

- propose the context packet, compilation trace, continuation trace, and evaluation result shapes;
- bind the first fixture set and perturbation matrix;
- define deterministic checks, review questions, repetition policy, and stop conditions;
- recommend the smallest honest v0.

#### R3 — bounded synthetic/offline experiment

Requires separate activation, exact fixtures, provider/tool policy, budget, branch/write path, independent reviewer, and authority receipt.

- run repeated tests against synthetic/non-authoritative fixtures first;
- compare structured packet versus degraded or undifferentiated context;
- preserve complete observable traces and negative results;
- do not tune solely to one provider.

#### R4 — bounded live-football replay

Requires separate activation and admitted current evidence.

- replay one or more existing Research fixtures against governed current state;
- verify that live incompleteness produces explicit incompleteness rather than narrative repair;
- no result promotes itself or changes Forecast/Fantasy state.

#### R5 — repository issue fan-out

Only after the combined map and experiment findings are accepted:

- open dependency-ordered, repository-owned issues;
- keep shared compiler/evaluation semantics centralized;
- avoid duplicating contracts in every repository;
- preserve Ops #69's one-lane sequencing and #66 authority requirements.



### Required design deliverable

A later separately authorized design task should return:

1. a concise architecture/doctrine note;
2. exact repository/context contribution matrix;
3. candidate `TiberAgentContextPacketV0`;
4. candidate `ContextCompilationTraceV0`;
5. candidate `AgentContinuationTraceV0` and evaluation result shape;
6. fixture registry and perturbation matrix;
7. scoring/check rubric with deterministic versus reviewer-owned dimensions;
8. repetition, provider/version, cost, and observability protocol;
9. privacy, authority, and threat analysis;
10. placement recommendation for compiler, operations, adapters, experiment custody, and reusable harness;
11. dependency-ordered repository issue proposals;
12. smallest honest bounded experiment activation packet; and
13. exactly one terminal decision.



### Acceptance criteria for the design phase

- [ ] The compiler premise is reconciled with Ops #69 rather than treated as a silent product rewrite.
- [ ] Football outcome prediction and model continuation generation remain distinct jobs.
- [ ] Shared Reality, derived interpretation, Forecast, market/decision state, operator context, and agent output remain structurally distinct.
- [ ] “Smallest sufficient” has a behavioral test, not only a token target.
- [ ] Compilation can be replayed from exact inputs, rules, digests, and omissions.
- [ ] Evaluation uses observable claims/actions/tool calls, not hidden chain of thought.
- [ ] Relevant and irrelevant perturbation tests are defined.
- [ ] Freshness, identity, conflict, missingness, and candidate/promoted authority traps are represented.
- [ ] Multiple-run and provider/version recording requirements are explicit.
- [ ] The first fixture set includes both Shared Reality and operator-context cases.
- [ ] Repository ownership is preserved; Research does not silently become the production runtime.
- [ ] The cross-repository census produces a dependency-ordered issue packet without opening it automatically.
- [ ] No implementation, provider call, lane rotation, promotion, deployment, or fantasy action occurs.
- [ ] Exactly one terminal decision is emitted.



### Terminal decisions

```text
context_compiler_v0_ready_for_bounded_experiment_activation
context_compiler_v0_requires_repository_contract_followup
context_compiler_v0_blocked
```

A positive design decision authorizes only Joseph's consideration of a separately pinned bounded experiment. It does not activate a model run, implementation lane, repository fan-out, merge, deployment, promotion, or product change.

## 8. Sources, review and amendment history

> [!IMPORTANT]
> **Status: OPERATOR-AUTHORIZED ISSUE CAPTURE / EXPERIMENT DESIGN ONLY**
>
> **Human decision owner:** Joseph (`@Prometheus-Frameworks`)  
> **Owning repository:** `Prometheus-Frameworks/TIBER-Research`  
> **Program sequencing:** [TIBER-Ops #69](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/69)  
> **Authority handling:** [TIBER-Ops #66](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/66)  
> **Origin:** Joseph's live 2026-08-21 direction to preserve this as TIBER's next research/architecture brief.
>
> Creating this issue records the research direction only. It does **not** rotate the active ML/modeling lane; authorize a branch, code change, provider/model call, API spending, credential use, live Research run, cross-repository issue fan-out, artifact promotion, product/API/UI change, deployment, merge, or automated fantasy action.



### Relationship to current work

This brief sharpens rather than replaces the product-boundary transition in TIBER-Ops #69.

Relevant existing evidence:

- [TIBER-Research #12](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/12) proves the importance of durable operator-local context surviving across agent sessions.
- [TIBER-Research #13](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/13) exposes whether a current roster shock can propagate through governed Shared Reality without narrative glue.
- [TIBER-Research #14](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/14) tests whether contract-shaped candidate output remains agent-legibly non-authoritative.
- [TIBER-Ops #67](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/67) owns the capability-parity audit for what a brought agent needs without repository access.
- [TIBER-Fantasy #338](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/issues/338) owns the read-only surface-and-consumer census.
- Merged TIBER-Fantasy PR #333 is existing evidence that canonical identity, local context persistence, later-session retrieval, and a thin MCP adapter can compose.

This issue adds the missing evaluation question:

> Once TIBER supplies an agent with context and operations, does the agent produce the right kind of continuation for the exact world state—and does that behavior change only when decision-relevant state changes?



### Format-preparation source mapping

- Original: https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15
- Source creation: `2026-08-21T20:11:19Z`; latest source update: `2026-08-28T22:26:36Z`; actual retrieval: `2026-10-31T19:25:32.983Z`. These are source/custody clocks, not football evidence clocks.
- [Public-safe captured text](sources/issue-body-20261031.md) and [hashes / block-level mapping](sources/issue-body-20261031.json). Original-publication byte identity is not established.
- Original IDs and all substantive blocks retained except explicit public-safety omissions below. Newly assigned edition IDs are retrospective organizational identifiers, not original preregistration.
- Independent review of this preparation: pending. Existing source review claims retain their exact scope and do not accept this new copy.
- Next preparation checkpoint: independent fidelity review of this exact draft; no research ownership transfer.
