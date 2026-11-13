---
format: "tiber-research-article/v0"
record_id: "research-issue-0016-issue-body-20261031"
record_kind: "case study"
subject: "[Case study] Claude 5-series engineering traces — Opus 5, Fable 5, and review-loop behavior"
study_window: "Engineering cases captured 2026-08-24; future successor comparison unactivated"
evidence_cutoff: null
timezone: "unknown"
latest_observation_covered: "See preserved edition-specific coverage; source retrieval is not observation freshness"
authored_at: "2026-10-31T19:31:37.816694Z"
record_origin: "historical format copy"
original_record: "https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16"
game_manifest: null
research_state: "Historical source state retained; no new research performed"
review_state: "Format author checks only; independent preparation review pending"
owner: "Original investigator unchanged; exact research owner unknown unless explicitly named below"
admission_granted_by_record: false
external_acceptance_refs: []
---

# [Case study] Claude 5-series engineering traces — Opus 5, Fable 5, and review-loop behavior — historical format copy

## 1. Summary

Prepared 2026-10-31T19:31:37.816694Z from the separately pinned historical edition below. No football refresh, new experiment, independent research review or authority transition occurred. Source statements are historical attributed reports/interpretations, not new Dot findings.

### Answer first

TIBER should preserve its first sustained observations of the Claude “5-series” as an engineering-behavior case study rather than reducing model choice to a single benchmark score.

The working conclusion is:

> **A benchmark is a useful prior, not a universal routing policy. Model quality is conditional on task geometry, supervision, authority boundaries, and the failure modes that appear under sustained review.**

The relevant question is not merely:

```text
Which model scores highest?
```

It is:

```text
Given this task shape, which model's characteristic reasoning style,
failure modes, correction behavior, and cost profile are easiest to govern?
```

This issue preserves preliminary evidence from real TIBER engineering work so a successor Opus/Fable generation can be evaluated against observable behavior, not launch-week sentiment.



## 2. Question and scope

**Source-defined scope:** Preserve conditional Opus/Fable engineering cases and test H1–H7 about task-model fit, correctness, governability, repair and review. This is not a matched benchmark; future frozen replays remain separately authorized.

### Why this belongs in TIBER-Research

TIBER-Research owns bounded, replayable research questions and evidence custody. This case concerns:

- observable agent engineering behavior;
- exact repository starting states and resulting patches;
- review findings and repair trajectories;
- task-to-model routing hypotheses;
- future matched-task replay design; and
- the distinction between benchmark capability and governed usefulness.

TIBER-Ops may later consume accepted routing conclusions. This issue does not itself change the routing board or activate a standing policy.

This complements [Research #15](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), especially its provider-portability and observable-continuation questions. #15 asks how governed context changes an agent's continuation. This issue asks what stable engineering traces different capable models leave when operating inside TIBER's governance and review system.



## 3. Baseline and alternatives

**Edition boundary:** Opus cases A–C and Fable case D are non-matched, review-shaped case evidence. The source explicitly rejects universal model ranking and separates conscientiousness from correctness.

### Research hypotheses

#### H1 — model traces are observable but conditional

Capable models leave recurring implementation and repair patterns, but those patterns depend on task type, prompt, repository doctrine, context, and reviewer behavior.

#### H2 — task-model fit beats universal model ranking

A model can perform poorly on one task geometry and strongly on another. #290/#292 versus #291 are the initial within-model evidence.

#### H3 — conscientiousness is independent of first-pass correctness

Authority compliance, honest failure reporting, confidence calibration, and audit preservation can remain strong even when defect discovery is incomplete.

#### H4 — repeated same-class findings are an escalation signal

When review finds the same invariant migrating across layers, the correct response may be to change the reasoning frame or model—not continue an unlimited local-fix loop.

#### H5 — “complete” is a claim requiring adversarial proof

A declarative matrix or exhaustive-looking corpus does not establish completeness. Review must attack adjacent fields, inactive branches, and the public boundary.

#### H6 — final code is multi-agent co-produced

By the final head, the code reflects the implementer, reviewer, operator constraints, mutation corpus, and repository doctrine. Attribution to one model must remain qualified.

#### H7 — benchmarks predict capability, not governed utility

SWE-bench-style scores can inform initial model selection. They do not measure TIBER-specific authority compliance, review convergence, epistemic honesty, task fit, operational cost, or failure transparency.



## 4. Evidence by question

### Question-level source map (format preparation)

Original IDs are retained where present. IDs beginning `R-` (and R1–R7 for the reading note) are **retrospective organizational mappings**, not original pre-registration. These cards locate historical assertions; they do not fill evidence gaps.

#### H1 — Conditional observable model traces

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16), source-body SHA-256 `f2d6a864ae3cec3c818e31cb001c643f7e61492c4e4d39a526630f6cadea20e9`; attributed case/report observations and explicitly qualified interpretation; not independent verification by this preparation.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** Opus cases A–C and Fable case D are non-matched, review-shaped case evidence. The source explicitly rejects universal model ranking and separates conscientiousness from correctness.
- **Historical assessment / next evidence:** Historical research state remains requires_more_observation. Exact cases support provisional routing hypotheses only, not causal or population-wide model superiority. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H2 — Task-model fit versus universal ranking

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16), source-body SHA-256 `f2d6a864ae3cec3c818e31cb001c643f7e61492c4e4d39a526630f6cadea20e9`; attributed case/report observations and explicitly qualified interpretation; not independent verification by this preparation.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** Opus cases A–C and Fable case D are non-matched, review-shaped case evidence. The source explicitly rejects universal model ranking and separates conscientiousness from correctness.
- **Historical assessment / next evidence:** Historical research state remains requires_more_observation. Exact cases support provisional routing hypotheses only, not causal or population-wide model superiority. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H3 — Conscientiousness versus first-pass correctness

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16), source-body SHA-256 `f2d6a864ae3cec3c818e31cb001c643f7e61492c4e4d39a526630f6cadea20e9`; attributed case/report observations and explicitly qualified interpretation; not independent verification by this preparation.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** Opus cases A–C and Fable case D are non-matched, review-shaped case evidence. The source explicitly rejects universal model ranking and separates conscientiousness from correctness.
- **Historical assessment / next evidence:** Historical research state remains requires_more_observation. Exact cases support provisional routing hypotheses only, not causal or population-wide model superiority. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H4 — Repeated same-class findings as escalation signal

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16), source-body SHA-256 `f2d6a864ae3cec3c818e31cb001c643f7e61492c4e4d39a526630f6cadea20e9`; attributed case/report observations and explicitly qualified interpretation; not independent verification by this preparation.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** Opus cases A–C and Fable case D are non-matched, review-shaped case evidence. The source explicitly rejects universal model ranking and separates conscientiousness from correctness.
- **Historical assessment / next evidence:** Historical research state remains requires_more_observation. Exact cases support provisional routing hypotheses only, not causal or population-wide model superiority. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H5 — Adversarial proof of completeness

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16), source-body SHA-256 `f2d6a864ae3cec3c818e31cb001c643f7e61492c4e4d39a526630f6cadea20e9`; attributed case/report observations and explicitly qualified interpretation; not independent verification by this preparation.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** Opus cases A–C and Fable case D are non-matched, review-shaped case evidence. The source explicitly rejects universal model ranking and separates conscientiousness from correctness.
- **Historical assessment / next evidence:** Historical research state remains requires_more_observation. Exact cases support provisional routing hypotheses only, not causal or population-wide model superiority. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H6 — Multi-agent co-production of final code

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16), source-body SHA-256 `f2d6a864ae3cec3c818e31cb001c643f7e61492c4e4d39a526630f6cadea20e9`; attributed case/report observations and explicitly qualified interpretation; not independent verification by this preparation.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** Opus cases A–C and Fable case D are non-matched, review-shaped case evidence. The source explicitly rejects universal model ranking and separates conscientiousness from correctness.
- **Historical assessment / next evidence:** Historical research state remains requires_more_observation. Exact cases support provisional routing hypotheses only, not causal or population-wide model superiority. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

#### H7 — Benchmarks versus governed utility

- **Source / type:** [This exact historical edition](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16), source-body SHA-256 `f2d6a864ae3cec3c818e31cb001c643f7e61492c4e4d39a526630f6cadea20e9`; attributed case/report observations and explicitly qualified interpretation; not independent verification by this preparation.
- **Supporting material:** original question/hypothesis and related evidence/qualification blocks retained below and in the other common sections; [block-level mapping](sources/issue-body-20261031.json) identifies their destination. Distinct IDs must not be pooled merely because they share the study.
- **Clocks / sample:** source creation, update and actual retrieval are recorded in that mapping. Event/sample coverage is the edition’s original stated window; any absent publication/observation clock remains unknown. No source-retrieval time is a new evidence cutoff.
- **Definition / denominator / exclusions:** retain the original definitions and exclusions in the linked blocks. Empirical denominators are not applicable to unexecuted design questions; where a case needs them and the source did not establish them, they remain unknown.
- **Contrary evidence / limits:** Opus cases A–C and Fable case D are non-matched, review-shaped case evidence. The source explicitly rejects universal model ranking and separates conscientiousness from correctness.
- **Historical assessment / next evidence:** Historical research state remains requires_more_observation. Exact cases support provisional routing hypotheses only, not causal or population-wide model superiority. The original investigator must supply any missing witness in separately authorized work; no fresh test was run.

### Initial evidence set

#### Case A — Opus 5: promoted-export integrity

[TIBER-Rookies PR #290](https://github.com/Prometheus-Frameworks/TIBER-Rookies/pull/290)

- Authorized base: `fb170fd12c0e2cc82a94a2b35259e5e40f2e74d8`
- Final head: `b9b1e73eb392eac60f7a79a2cedca3cfba74f292`
- Merge commit: `54215af61e581000b7370e941dbc90a8a1a70195`
- 4 files, 3 commits, +1152/−0
- Review history: one substantive P2 and one P3 documentation correction
- Outcome: merged; promoted-export integrity expanded from 2/41 to 41/41 artifacts without changing canonical promoted bytes

Preliminary observation:

Opus produced a compact, operational integrity design with strong provenance and negative controls. Review found a mutable-registry authority escape; Opus reproduced it, moved the contract into code, preserved the audit history, and converged quickly.

#### Case B — Opus 5: experimental ML-lane demotion and destructive lifecycle safety

[TIBER-Rookies PR #291](https://github.com/Prometheus-Frameworks/TIBER-Rookies/pull/291)

- Authorized base: `54215af61e581000b7370e941dbc90a8a1a70195`
- Final head: `825fecf290bc604fd67081aadb87306af2139821`
- Merge commit: `c1d7aa7b558f29b09162b2d64ad356fb8ae2748a`
- 25 files, 9 commits, +4171/−104
- Review trajectory: initial implementation plus eight exact-head repair rounds
- Outcome: merged; experimental ML artifacts moved out of the promoted namespace with frozen-byte preservation and guarded generated-run lifecycle

Observed defect arc:

1. the default producer could overwrite frozen artifacts;
2. a run inventory could self-declare its universe and bytes;
3. replacement refusal deleted recognized files before refusing;
4. valid prior output was deleted before later generation failure;
5. a stale authorization snapshot was not re-proven at destruction time;
6. helper guarantees were defeated by command-level cleanup;
7. staging could drift after validation but before commit;
8. the snapshot claiming to represent validated bytes was captured after the validation interval.

These were not eight unrelated mistakes. They were one invariant migrating outward:

> **What is this operation authorized to affect, and is that still true at the exact boundary where it acts?**

Preliminary observation:

Opus reasoned naturally in concrete operations, phases, snapshots, guards, and rollback paths. It repeatedly fixed the visible layer without fully generalizing the invariant to the caller or lifecycle boundary above it.

At the same time, Opus showed unusually strong conscientiousness:

- stopped when authority or an exact SHA was absent;
- preserved mistakes in the handoff record;
- distinguished claimed verification from actual mutation evidence;
- disclosed when its own test damaged the archive;
- reduced confidence after repeated falsification;
- identified where the next reviewer should attack;
- did not self-merge, self-resolve review ownership, or hide failed approaches.

This case separates **conscientiousness/governability** from **first-pass global correctness**.

#### Case C — Opus 5: CSV formula-injection hardening

[TIBER-Rookies PR #292](https://github.com/Prometheus-Frameworks/TIBER-Rookies/pull/292)

- Authorized base: `c1d7aa7b558f29b09162b2d64ad356fb8ae2748a`
- Final head: `03b2b65af79cf344d1766bf20c15c445ad986ea0`
- Merge commit: `a6f8555e79f3fc562a6c5f533acee583eeb12a3a`
- 6 files, 2 commits, +382/−3
- Outcome: merged after one repair round preserving numeric negative values while guarding string-form formulas

Preliminary observation:

On a bounded security change with a small, explicit semantic distinction, Opus converged efficiently. This is evidence against treating the #291 loop as a universal measure of the model.

#### Case D — Fable 5: RB contact-evasion observation contract

[TIBER-Data PR #259](https://github.com/Prometheus-Frameworks/TIBER-Data/pull/259)

- Authorized base: `ef5c743cfb19bb8b1392ba83f72f21b566d4c100`
- Current head at capture: `fb0896422ab81b8595dce062dbe4ef576953352d`
- Current state: draft, open, unmerged
- Current diff: 65 files, 4 commits, +13592/−0
- Review record: 20 review comments at capture
- Scope: contract, schema, docs, positive/negative fixtures, and public-boundary tests; no source acquisition or artifact promotion

Preliminary observation only—the PR is not closed:

Fable responded to repeated adjacent semantic escapes by constructing an invariant matrix, code-owned dictionaries, closed vocabularies, and cross-product tests. Its natural unit of reasoning appeared more architectural and declarative than Opus's.

Its characteristic risk was different: it could call a matrix “complete” while adjacent semantic fields remained self-authoritative. Review still found unbound missingness, combined-component, minimum-rule, and source-material relationships. Fable's response was typically a broader conceptual rewrite rather than a local patch.



## 5. Interpretation and assessment

**Preserved assessment boundary:** Historical research state remains requires_more_observation. Exact cases support provisional routing hypotheses only, not causal or population-wide model superiority.

### Provisional model traces

These are hypotheses grounded in the cases above, not personality claims or universal rankings.

| Dimension | Opus 5 trace | Fable 5 trace |
|---|---|---|
| Natural unit of reasoning | operation, state transition, implementation mechanism | contract, ontology, invariant family |
| Typical code shape | explicit phases, helpers, snapshots, guards, rollback | registries, descriptors, matrices, closed vocabularies, cross-products |
| Strength observed | operational mechanics, provenance, bounded security/integrity work | semantic decomposition, contract design, adjacent-field synthesis |
| Characteristic risk | fixes the current layer while missing the boundary above it | declares conceptual completeness before every semantic field is actually bound |
| Review response | forensic, candid, locally precise, confidence-reducing | architectural, expansive, schema- and matrix-reorganizing |
| Cost risk | repeated exact-head repair loop on migrating lifecycle defects | large diffs and corpus expansion during convergence |
| Governance behavior observed | unusually conscientious and authority-sensitive | systematic and scope-aware, with strong design-level synthesis |



### Routing implication for current operations

Until stronger evidence exists:

- Prefer **Opus** for bounded operational mechanics, integrity enforcement, explicit state transitions, and narrow security changes.
- Prefer **Fable** when the hard part is ontology, architectural ambiguity, semantic contract design, or discovering the invariant system.
- Escalate or reframe when the same defect class appears across multiple exact-head reviews.
- Retain independent review regardless of model.
- Treat weekly budgets as routing constraints, not quality proxies.
- Let benchmarks influence the starting prior—not the final deployment decision.

This is guidance for operator judgment, not an automatically active policy.



## 6. Unknowns and revision triggers

### Confounders and limits

- These were not matched tasks.
- Prompts and activation packets differed.
- Opus and Fable were used at different points in the routing experiment.
- Codex review changed the implementation trajectory.
- GitHub's shared identity does not attest model identity or reviewer independence.
- Time and usage records are incomplete.
- One open Fable case cannot support a settled comparative conclusion.
- Model behavior may change with provider-side routing, system prompts, tool versions, context length, or silent updates.
- A few memorable PRs are case studies, not population estimates.

The research record should therefore use language such as “observed in this case,” “provisional trace,” and “routing hypothesis,” never “Opus always” or “Fable is inherently.”



## 7. Next checkpoint and closeout

### Future successor comparison

When a successor Opus/Fable-family model becomes available, do not immediately route all work to it or away from it based on launch benchmarks.

A separately authorized comparison should use frozen, non-production replays drawn from these cases.

#### Candidate matched replays

1. **Integrity registry replay** — can the model identify mutable semantic authority before review?
2. **Destructive lifecycle replay** — can it state and enforce the destruction-authorization invariant across helper, CLI, validation interval, and commit boundary in its first design?
3. **CSV security replay** — can it distinguish formula-like strings from legitimate negative numeric cells without broad regression?
4. **Semantic-contract replay** — can it enumerate every payload-authored semantic field without prematurely claiming completeness?

#### Required run metadata

```text
case_id
task_class
repository/base_sha
exact prompt/dispatch digest
provider
model/version
tool/runtime version
context supplied
authority envelope
start/end time
usage/cost where governed
initial diff
test/mutation evidence
review findings by severity/class
repair rounds
final outcome
operator interventions
known confounders
```

#### Evaluation dimensions

- first-pass correctness;
- invariant generalization;
- public-boundary testing;
- self-detection before review;
- review findings by severity and defect family;
- repair convergence;
- diff size and churn;
- test quality versus test count;
- authority compliance;
- failure disclosure;
- confidence calibration;
- operator copy/paste and supervision burden;
- elapsed time and governed cost;
- final maintainability; and
- whether the same task would be routed to that model again.

Do not grade tone, verbosity, benchmark reputation, agreement with Joseph, or a model's self-description as substitutes for engineering evidence.



### Candidate future artifact

A later design may propose an `AgentEngineeringTraceV0` research record containing:

- exact task and authority identity;
- observable implementation strategy;
- review/repair chronology;
- defect-family taxonomy;
- mutation and boundary evidence;
- governance behavior;
- cost/supervision burden; and
- terminal routing conclusion.

Do not create this artifact or a reusable harness under this issue without separate activation and an ownership check against TIBER-Harness.



### Acceptance criteria for this research record

- [ ] Opus/Fable observations remain tied to exact cases rather than universal claims.
- [ ] Model attribution is identified as operator/session metadata, not GitHub proof.
- [ ] Code style, defect pattern, review response, authority behavior, and operator burden remain separate dimensions.
- [ ] Benchmarks are treated as priors rather than routing policies.
- [ ] Future successor comparison uses matched frozen tasks and observable traces.
- [ ] No hidden chain of thought is collected or required.
- [ ] Open cases remain explicitly provisional.
- [ ] Research findings do not self-activate routing, provider spending, implementation, or repository writes.
- [ ] Relationship to Research #15 and TIBER-Harness is preserved.
- [ ] Exactly one terminal decision is recorded after any future design/replay phase.



### Terminal decisions

```text
claude_engineering_trace_ready_for_matched_replay_activation
claude_engineering_trace_requires_more_observation
claude_engineering_trace_blocked
```

At issue creation, the honest state is:

```text
claude_engineering_trace_requires_more_observation
```


## 8. Sources, review and amendment history

> [!IMPORTANT]
> **Status: OPERATOR-AUTHORIZED RESEARCH RECORD / DESIGN ONLY**
>
> **Human decision owner:** Joseph (`@Prometheus-Frameworks`)  
> **Owning repository:** `Prometheus-Frameworks/TIBER-Research`  
> **Origin:** Joseph's 2026-08-24 direction to preserve observed Opus 5 / Fable 5 engineering behavior before the next model generation.
>
> Opening this issue records evidence, hypotheses, and a future comparison protocol. It does **not** authorize a provider/model call, paid usage, benchmark run, branch, code change, replay experiment, routing-policy activation, repository mutation outside this issue, merge, deployment, or replacement of operator judgment.



### Evidence boundary

The model labels below come from Joseph's live session selection and operator record.

GitHub shows all implementation and review activity under the shared `Prometheus-Frameworks` identity. GitHub alone therefore **cannot prove** that one model implemented and another reviewed. Model attribution is operator/session metadata and must not be presented as repository-native proof.

The case study uses only observable evidence:

- prompts and operator dispatches;
- exact base/head SHAs;
- code and test diffs;
- PR/issue handoff records;
- review findings;
- mutation evidence;
- authority and stop behavior;
- elapsed repair rounds; and
- final repository outcomes.

Do not collect, infer, or require hidden chain of thought.



### Format-preparation source mapping

- Original: https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16
- Source creation: `2026-08-24T18:54:17Z`; latest source update: `2026-08-24T18:54:17Z`; actual retrieval: `2026-10-31T19:25:34.275Z`. These are source/custody clocks, not football evidence clocks.
- [Public-safe captured text](sources/issue-body-20261031.md) and [hashes / block-level mapping](sources/issue-body-20261031.json). Original-publication byte identity is not established.
- Original IDs and all substantive blocks retained except explicit public-safety omissions below. Newly assigned edition IDs are retrospective organizational identifiers, not original preregistration.
- Independent review of this preparation: pending. Existing source review claims retain their exact scope and do not accept this new copy.
- Next preparation checkpoint: independent fidelity review of this exact draft; no research ownership transfer.
