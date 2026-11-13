## Status and scope
**Research reading note / follow-up proposal only. Prepared October 9, 2026 (America/Toronto) by dot (OpenAI).**

Joe asked dot to investigate his five-paper October 6–8 shortlist and open one new Research issue with findings. This issue records that completed reading and proposes a narrow next investigation. It does not adopt governance, activate an experiment, change schemas/code, admit sources, request reviews, call providers, spend, create monitoring, or authorize work in other repositories. ROP #30 remains with its existing investigator.

**Recommendation:** prioritize an audit of which completion obligations are already represented and independently checkable in TIBER. Reuse the existing Research custody/validator and Ops authority boundary. Do not build another agent framework or deploy a learned guard from these papers.

## Verified reading and corrections
The original versioned papers were inspected on October 9. Numerical claims below are author-reported results, not experiments reproduced by TIBER. The papers do not validate TIBER's implementation.

### 1. Study contracts: approved obligations versus produced artifacts
Eitan Waks and Ben Glocker, October 8, 2026, **arXiv:2610.11754v1**, *What Output-Only Review Cannot Verify: Study Contracts for Research Agents*. [Record](https://arxiv.org/abs/2610.11754v1) · [Full text, §§3–5](https://arxiv.org/html/2610.11754v1).

**Reported:** immutable approved revisions are separated from execution state through a versioned binding chain. In eight self-authored clean/mutated pairs, the checker detected 8/8 mutations and blocked 0/8 controls. Eighteen unpinned judge aliases produced 104 flags, 32 abstentions and eight terminal failures across 144 mutated evaluations, with no explicit clean judgments.

**Limit:** unequal information, task specification and fault-rule selection prevent a verifier-superiority conclusion. This is a non-peer-reviewed diagnostic, not demonstrated scientific correctness or closed-loop benefit. Hashes cannot establish semantic preservation or truthful observations; general adaptive enforcement remains incomplete.

**TIBER inference:** make required work and claim ceilings inspectable before execution. The paper's out-of-band approval proposal does not automatically replace Ops #66's current interim rule.

### 2. Obligations: safe actions can still leave required work undone
Youwei Feng, Yitong Zhang, Yuetong Liu and Jia Li, October 8, **arXiv:2610.11773v1**, *Safe Actions Alone Do Not Ensure Safe Agents: Identifying Unfulfilled Obligations with Guard Models*. [Record](https://arxiv.org/abs/2610.11773v1) · [Full text, §§3, 5–7](https://arxiv.org/html/2610.11773v1).

**Reported:** 240 trajectories, 120 positive/120 matched negative, containing 339 obligations. Among 14 existing models, best recall was 48.97% and best exact match 10%, achieved by different models. The specialized guard reached 57.52%/21.67%. In 186 tasks, one intervention at attempted termination raised joint functional/security success 6.5%→15.1%, while functional success changed 27.4%→26.9%.

**Limit:** software tasks, model-assisted annotations and semantic scoring, and one actor/scaffold intervention setting. These are not general safety guarantees.

**TIBER inference:** evaluate missing required actions alongside forbidden actions. A guard with these omission rates cannot be the sole completion or authority gate.

### 3. Persistent memory: measure actual exposure and genuine dependence
Hochan Son et al., October 6, **arXiv:2610.07782v1**, *Persistent Memory in Multi-Agent LLM Inference: What It Costs, What It Buys, and When You Can Tell*. [Record](https://arxiv.org/abs/2610.07782v1) · [Full text, §§2–5, 7](https://arxiv.org/html/2610.07782v1).

**Reported:** enabled recall added an estimated 0.368 MiB peak KV and +0.015 accuracy, 95% CI [−0.011,+0.046]. Independent-question tasks provide little useful cross-episode dependence. The paper identifies inactive components, repeated-run contamination, multi-axis/order confounds and underestimated noise.

**Corrections/limits:** KV figures are token-derived largest-call estimates, not measured device memory. Recall was reachable for 24% of questions; one system, few replicates and fixed arm order limit generalization. Null results here do not establish useless project memory.

**TIBER inference:** evaluate cross-session tasks with controlled memory exposure and logged reads, preserving evidence retention separately from retrieval usefulness.

### 4. Typed decisions: protect values and their interpretation
Seyedarmin Azizi, Erfan Baghaei Potraghloo and Massoud Pedram, October 8, **arXiv:2610.12292v1**, *One Word Opens the Gate: The Option-Channel Attack on Typed Decision Models as Agent Guardrails*. [Record](https://arxiv.org/abs/2610.12292v1) · [Full text, §§4–7, 10](https://arxiv.org/html/2610.12292v1).

**Reported:** seven models overall; clean screening accuracy 36–72%. Six irrelevant lines raised one gate's fail-open rate from 0 to 63.3% on initially correctly blocked cases. Selected label attacks reached 93–100% on four label-exposed models; two label-invariant implementations resisted that channel. Deterministic checks solved six synthetic parsed-field policies exactly.

**Limit:** tool-text injection and control-label influence are different threat models. Selected attack success is not unconditional failure across all models/tasks. Synthetic policy results do not cover arbitrary natural-language safety.

**TIBER inference:** keep authority enums/mappings outside untrusted text and enforce decidable rules deterministically. Parsing alone does not authenticate input facts.

### 5. OnTrack: warnings need calibrated costs before intervention
Babak Barazandeh, Connor Swanson, Chinmay Kulkarni and Nikhil Mungel, October 8, **arXiv:2610.12375v1**, *OnTrack: Real-Time Monitoring and Intervention in LLM Agent Trajectories via Streaming Structure-Aware Optimal Transport*. [Record](https://arxiv.org/abs/2610.12375v1) · [Full text, §§4.5–4.6, 6–7](https://arxiv.org/html/2610.12375v1).

**Reported:** eight-step AUROC .631 versus .574 for cosine. Length-matched full-trajectory AUROC was .526 in a different experiment. Only five reference instances were used.

**Important correction:** “five of six aborts” is base-rate-adjusted precision assuming 81% unresolved, not six observed aborts. The 150+150 profile sweep's illustrative threshold saved 17.9% of failing-population compute while falsely stopping 20.7% of successful runs. That threshold was selected after the sweep; simpler cutoff policies could match or exceed savings.

**TIBER inference:** consider shadow-mode warnings first, with false-stop costs and held-out calibration. Similarity to a reference trace must not grant authority, establish an evidence claim or automatically invalidate legitimate alternative work.

## Reconcile existing work first
Inspected Research main: **5339b587bf5e59a7c21eb48480fdb0a992c4271b**.

TIBER already has much of the relevant machinery:
- [Research README at the inspected pin](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/5339b587bf5e59a7c21eb48480fdb0a992c4271b/README.md): immutable job/input bindings; run/attempt distinctions; append-oriented hash-chained custody; checkpointed resume; submission, independent review and terminal seal. Validation explicitly does not establish empirical truth, rights, human authority or reviewer competence.
- [Research Gateway #17](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/17): separate custody/review/seal/readiness dimensions and fail-closed packet access. Do not replace it with a prose “done” classifier.
- [Research #19](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/19): existing automated-researcher, legibility and monitoring analysis.
- [Research #15](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15), [#21](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/21), [Harness #5](https://github.com/Prometheus-Frameworks/TIBER-Harness/issues/5), [#8](https://github.com/Prometheus-Frameworks/TIBER-Harness/issues/8): context, continuation, persistent-workbench and configuration evaluation. Reuse these anchors for memory/trajectory studies.
- [Ops #66](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/66): active authority/materialization boundary. The proposed charter is not automatically adopted; an agent-written receipt is not independent human-origin proof.
- [Forecast #190 durability audit](https://github.com/Prometheus-Frameworks/TIBER-Forecast/issues/190#issuecomment-5981004764): reconcile already documented local-only artifact and recovery gaps rather than opening another durability framework.

The [Context Compiler contract family](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/5339b587bf5e59a7c21eb48480fdb0a992c4271b/docs/contracts/context-compiler-contract-family-v0.md#L1676-L1815) already proposes compilation omissions, manifests and observable continuation traces. It remains draft candidate design, not adopted or activated. [Cold-resume derivation](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/5339b587bf5e59a7c21eb48480fdb0a992c4271b/src/validator.ts#L6014-L6102) is an existing implementation surface; do not conflate the two. Existing adversarial tests were inspected, not rerun.

### Existing omission checks, not an empty starting point
At the pinned [validator](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/5339b587bf5e59a7c21eb48480fdb0a992c4271b/src/validator.ts):
- [Question coverage](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/5339b587bf5e59a7c21eb48480fdb0a992c4271b/src/validator.ts#L1934-L1984) requires every activated question exactly once, preserving its prompt
- [Answer/blocker linkage](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/5339b587bf5e59a7c21eb48480fdb0a992c4271b/src/validator.ts#L4037-L4069) checks supporting claims/negatives and missing-input records
- [Counterevidence/checkpoints/budgets](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/5339b587bf5e59a7c21eb48480fdb0a992c4271b/src/validator.ts#L3594-L3731) impose further obligations
- [Independent-review declarations](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/5339b587bf5e59a7c21eb48480fdb0a992c4271b/src/validator.ts#L5161-L5208) distinguish substantive/protocol outcomes and reject same-session review. Declared fresh context does not independently prove isolation

**Narrow unresolved question:** which material operator obligations are never represented as frozen/checkable requirements, and which recorded witnesses are insufficient to establish substantive completion? This audit has not exhaustively proved a defect or absence across all TIBER code.

## Smallest next research proposal — NOT ACTIVATED
Prepare an **obligation-coverage crosswalk**, using existing contracts and a small set of already-retained, appropriately redacted handoffs:
1. Map each required action to its authority source, immutable target, due transition, evidence witness, validator/check owner and failure disposition
2. Distinguish satisfied, explicitly blocked, waived by authorized operator, out of scope and unknown. “Blocked” can be a correct terminal result; no obligation may compel an unauthorized action
3. Classify each check as already implemented, documented-only, semantic/manual, external-trust-dependent or genuinely missing
4. Return only the smallest justified design/test delta under existing Research/Harness/Ops ownership; do not introduce a second lifecycle or silently modify governance

Candidate fields are design questions, not adopted schema: obligation identity; approved contract revision; applicability; witness locator/hash; observed result; unresolved reason; actor/observer attribution; any explicit operator waiver; terminal claim ceiling.

### Later evaluation, separately authorized
If the crosswalk justifies it, design an equal-information synthetic comparison of the existing validator/checklist and optional model-assisted omission detection. Include paired controls:
- plausible final summary with omitted readback or required review
- every artifact present but wrong head/population or missing original bytes
- legitimate blocked outcome and authorized amendment/waiver
- harmless alternative tool order versus actual dependency violation
- untrusted labels/tool text that must not change authority enums
- cold resume where an earlier fact matters, with memory exposure recorded and contamination controlled

Predeclare omissions caught, false completion, false blocking, unnecessary operator interruptions, useful compliant completion and cost. Keep contract compliance, scientific correctness and authority authentication separate. For learned monitoring, compare against simple stopping rules and measure lost successful work, not just saved compute.

## Open questions and priorities
1. **First:** are important completion obligations unrepresented, or merely unexposed to the operator?
2. Can requirements be bound without allowing agent-authored observations to amend their own contract?
3. Which witnesses require trusted observation beyond a hash or self-report?
4. Do memory/monitoring benefits survive equal information, legitimate adaptation and repeated trials?
5. What is the smallest human-readable closeout that exposes unfinished obligations without burdening Joe?

Recommended disposition: **research_further_within_existing_controls**. No adoption or implementation decision is implied.

## Completion and publication receipt
Completed: five original-paper checks, material corrections, bounded existing-work reconciliation and this one reading-note issue. No experiments reproduced.

Prepared by dot from Joe's direct October 9 request received no later than 15:09:32 UTC. This is an agent-materialized documentation action; cryptographic human-origin verification was unavailable. The public record is context, not standalone execution authority.

Preflight: untruncated Research tree at the pin above, README/canonical references and current Ops #66 inspected. No AGENTS.md/CLAUDE.md/.agents entry was present in that tree. The inspected CI triggers on PRs and pushes to main, not issue creation. External webhook settings were not independently inspectable; no command mentions, labels, assignees, reviews, branches or PRs are included. Duplicate searches found related anchors above, but no matching five-paper intake. Inventory is targeted, not a fleet-wide audit.

Stop after issue creation/readback. Future designs, tests, implementation, governance changes, source admission, model calls, spending, monitoring and deployment require separate authorization.