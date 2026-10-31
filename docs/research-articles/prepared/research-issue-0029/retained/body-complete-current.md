> **October 7, 2026 update:** The original research framing is retained below. The appended **Architecture synthesis v0** records the later discussion of domain compression, the web-and-lenses visualization, and a bounded “Lean for football” verifier. This remains a research/design record, not an adopted contract or implementation authorization.

## Motivation

A discussion prompted by the Unique Games Conjecture surfaced a useful framing for TIBER.

The fantasy industry often behaves as though enough metrics, data and modeling will eventually reveal a near-deterministic "Universe A": the underlying football truth that tells us what will happen Sunday. The opposite extreme, "Universe B", would say football is essentially incoherent and unpredictable.

TIBER should investigate a third framing:

> **Universe C: football contains substantial real structure, but the observable pregame state constrains a distribution of plausible outcomes rather than uniquely determining the realized outcome.**

This is a research/design hypothesis, not a settled claim and not a claim that the Unique Games Conjecture directly applies to football.

## Core model

Let:

- **S_t** = the true football state at time t (latent and only partially observable)
- **E_t** = evidence available to TIBER at time t
- **Ŝ_t** = TIBER's bounded interpretation of that state
- **Y** = a future outcome (targets, carries, fantasy points, EPA, etc.)

The useful target may be closer to:

`E_t → Ŝ_t → P(Y | Ŝ_t)`

than:

`E_t → prediction of Y`

Sunday then reveals one realized trajectory/sample, not the underlying probability distribution itself.

## What this would mean for TIBER

### 1. Interpretation before prediction
ROP, Teamstate and related surfaces should primarily improve our estimate of the current state of the world. They should not imply that improved state knowledge eliminates outcome uncertainty.

### 2. Separate state claims from outcome claims
Examples:

- "Player X's opportunity state increased" is a state/interpretation claim.
- "Player X will score 18 fantasy points" is an outcome prediction.

A poor box score does not, by itself, falsify the first claim.

### 3. Preserve uncertainty as information
Uncertainty should not automatically be treated as model weakness. A well-supported conclusion may be: "we know considerably more about this player, but the outcome distribution remains wide."

### 4. Evaluate probabilistically
Where TIBER does forecast, evaluate distributions and calibration over repeated observations rather than grading every individual prediction as simply right/wrong.

Potential future measures include calibration, proper scoring rules, interval coverage and out-of-sample distributional performance. No metric choice is authorized by this issue.

### 5. Treat evidence as belief-changing
A useful research question becomes:

> **What evidence meaningfully changes our beliefs about the distribution of plausible outcomes, by how much, and with what confidence?**

This may be more productive than searching indefinitely for a single metric that "predicts fantasy points."

### 6. Preserve operator agency
TIBER can assemble evidence, expose state changes, quantify uncertainty and eventually estimate outcome distributions while leaving the final fantasy decision with the human operator.

## Why this matters

Football is sequential, adaptive, partially observed and stochastic. Coaches and players react to one another; game state changes future play; injuries and individual events alter subsequent states. Even excellent pregame information may therefore leave irreducible uncertainty about the realized game.

At the same time, football is not random. Opportunity, routes, targets, personnel, quarterback quality, scoring environment and many other variables contain real structure. Universe C is intended to hold both facts simultaneously:

> **Structure is real. Uncertainty is real. Better evidence should improve beliefs without pretending to abolish uncertainty.**

## Proposed next work

This issue should begin as a conceptual/research track, not an implementation mandate.

1. Formalize the Universe C hypothesis and identify where it conflicts with or reinforces current TIBER architecture.
2. Inventory existing TIBER outputs as **observation**, **state interpretation**, **distributional forecast**, or **decision support**.
3. Define what would empirically distinguish useful state inference from merely explaining outcomes after the fact.
4. Design a small retrospective experiment using existing governed artifacts to test whether ROP/Teamstate state changes improve probabilistic beliefs out of sample.
5. Explore appropriate calibration/scoring methods and minimum sample requirements.
6. Identify claims that TIBER should explicitly refuse to make because the evidence does not support that degree of certainty.

## Guardrails

- Do not treat UGC as evidence that football obeys this framework; it was the conceptual trigger.
- Do not assume Universe C is correct. Make it falsifiable where possible.
- Do not add proprietary data, new providers or source admissions under this issue.
- Do not change Forecast/ROP/Teamstate semantics or production behavior without separate review and operator authorization.
- Do not optimize for confident predictions merely to make the system appear decisive.
- Preserve observed vs inferred distinctions and point-in-time provenance.

## Desired outcome

A clearer epistemic contract for TIBER:

> **TIBER's job is not to manufacture certainty about Sunday. Its job is to improve the operator's justified beliefs about the current football state and the plausible futures that follow from it.**

If the research supports this framing, later work can translate it into evaluation methodology, product surfaces and model architecture.

---

## Architecture synthesis v0

**Date:** October 7, 2026. **Disposition:** research/design proposal; not implemented, independently reviewed, or adopted as a production contract.

**Publication scope:** Joe asked to preserve this conversation on GitHub. This agent-authored synthesis extends the existing #29 rather than opening a competing Universe C issue or repository. Publication of this text is not an execution grant, authenticated operator receipt, empirical result, source admission, or model promotion.

### A. The central distinction: reality, evidence, representation

> **Universe C is the football world. TIBER builds a map of it, not the world itself.**

Use the existing notation rather than introduce a competing state ontology:

| Concept | Meaning | What it is not |
|---|---|---|
| Universe C / `S_t` | The actual football situation and its evolving relationships at time t | A TIBER database, score, card, or complete list of observable variables |
| `E_t` | The evidence available and eligible for the stated question at cutoff t | Complete access to reality or automatic proof that a source is correct |
| `Ŝ_t` | A bounded, purpose-specific representation constructed from that evidence | Ground truth, a guarantee of next-week opportunity, or a complete reconstruction of football |
| `P_M(Y given E_t)` | A model's distribution over future outcomes, possibly using explicit state summaries | The true distribution established merely because a model emitted it |
| `Y` | One realized outcome or game trajectory | A complete measurement of the pregame state or its distribution |

The working research hypothesis is that useful, inspectable state summaries can preserve relevant structure without erasing uncertainty. The existence of a world outside the model is a conceptual boundary; the usefulness of particular summaries and models must be tested. This is not a claim to have proved physical indeterminism or identified football's irreducible-error floor.

The original phrase “football is not random” should be read as **“football is not structureless.”** Structure and uncertainty can coexist. Likewise, Universe A/B are conversational contrasts, not audited descriptions of the fantasy industry.

### B. The picture: a web, observed through compressed lenses

The following is a conceptual relationship diagram, not a measured causal graph and not the current runtime topology. Relationships and optional future components require their own evidence and contracts.

```mermaid
flowchart TB
  subgraph WORLD["Universe C - actual football, only partly observed"]
    PLAYER["Player ability, health and availability"]
    TEAM["Team, quarterback, protection and scheme"]
    ROLE["Assignments, participation and usage"]
    OPP["Opponent and defensive response"]
    GAME["Score, clock and evolving game conditions"]
    ENV["Weather and venue"]
    PLAYER <--> ROLE
    TEAM <--> ROLE
    TEAM <--> OPP
    ROLE <--> OPP
    GAME <--> TEAM
    GAME <--> OPP
    ENV --- GAME
  end

  E["Eligible evidence at cutoff t - E(t)"]
  PLAYER -. observations .-> E
  TEAM -. observations .-> E
  ROLE -. observations .-> E
  OPP -. observations .-> E
  GAME -. observations .-> E
  ENV -. observations .-> E

  subgraph MAP["TIBER - separable, evidence-bearing lenses"]
    ROP["ROP - recorded historical work"]
    TTS["TTS - qualified team context"]
    OTHER["Other permitted evidence - or explicit unknowns"]
    STATE["Proposed composed interpretation - S-hat(t)"]
    FORECAST["Separately qualified Forecast distribution"]
    CARD["Consumer card - presentation, not new truth"]
    E --> ROP
    E --> TTS
    E --> OTHER
    ROP --> STATE
    TTS --> STATE
    OTHER --> STATE
    STATE --> FORECAST
    E -. direct eligible baseline .-> FORECAST
    ROP --> CARD
    TTS --> CARD
    STATE --> CARD
    FORECAST --> CARD
  end

  V["Scoped verification of evidence-to-claim transitions"]
  V -. checks .-> ROP
  V -. checks .-> TTS
  V -. checks .-> STATE
  V -. checks .-> FORECAST
  V -. checks .-> CARD

  NEXT["World evolves beyond cutoff - one realized Y"]
  GAME --> NEXT
  EVAL["Separate state and forecast evaluations"]
  FORECAST --> EVAL
  STATE --> EVAL
  NEXT --> EVAL
  NEXT --> LATER["New observations at a later cutoff"]
```

**Reading the picture:** The web belongs to reality. The lenses belong to TIBER. Dotted verification edges check scoped records; they do not let the verifier inspect reality directly. Arrows from a state or forecast into a card are conditional on qualification, not a statement that those outputs already exist.

“Everything needs everything” becomes: **relationships matter, but not every component must depend on every other component.** ROP and TTS need not be mandatory serial gates. The October 4 #27 audit explicitly permits exact, qualified Data observations to feed Forecast directly.

Football can contain feedback over time. Artifact provenance should not justify itself through circular references: represent successive immutable checkpoints and explicit time-indexed dependencies rather than letting a current claim cite itself as evidence.

### C. Compression is question-specific, not a universal football score

Joe's central observation is preserved here: **ROP and TTS compress different fronts of the sport.** That is a useful architectural interpretation, not proof that either summary retains all relevant information.

- **ROP:** preserve the meaning of recorded work in its historical window. `WeeklyRoleStateV1` does not silently become expected future workload, ability, or role security.
- **TTS / Teamstate:** preserve the team-context fields actually supplied and qualified by the specific artifact. Do not assume the label “Teamstate” includes every desirable QB, protection, scheme, injury, or opponent field.
- **Persistent/inferred player state:** a separate research candidate under #27 and Forecast's existing program, not a redefinition of ROP.
- **Composed state:** retain component identity, evidence lineage, scope and missingness; not one opaque “football truth” number.
- **Player State Card:** a presentation of qualified records. A change of layout, league selector, or consumer surface must not change the underlying football claim. League scoring and roster utility are separate, explicitly parameterized views.

A candidate research notation is:

`Z_i(t) = g_i(eligible evidence, window, purpose, version)`

`Ŝ_t = compose(Z_ROP, Z_TTS, other qualified inputs, explicit unknowns)`

These are proposals, not newly registered schemas. A deterministic summary cannot create new evidence absent from its inputs. Learned components must also disclose training data/prior lineage; an agent's unstated knowledge cannot quietly expand the evidence set.

For each compression, a future contract should say what question it serves, what it preserves, what it omits, its population and clock boundaries, and which downstream claims it cannot support. Whether information discarded by a compression matters must be tested against suitable baselines; do not call a summary statistically sufficient without establishing that property.

Overlapping lenses are not independent witnesses. If ROP and TTS share a source revision or denominator, composition must preserve that shared ancestry rather than count the same fact twice. Likewise, role, opportunity and efficiency are not automatically independent factors whose averages can simply be multiplied.

### D. The targets-only example: preserve the insight, tighten the analogy

Consider the explicitly simple toy model:

`next-week fantasy-point estimate = a + b * last-week targets`

A few close predictions do not establish that it understands the process generating targets or their conversion into points. Identical inputs produce identical predictions in this toy model even when two players' unobserved situations differ.

The conversation's accurate-QB versus inaccurate-QB receivers are **hypothetical mechanism examples**, not source-qualified claims about named NFL players. The model may miss future target-volume changes, target quality, depth, defensive attention, or conversion variation. A miss alone does not identify which explanation was responsible; mechanism attribution needs evidence.

Two important qualifications:

1. **One input is not the same as low model complexity.** The stated linear toy is simple; a highly flexible function of one input need not be. Feature count, functional flexibility, data requirements and information quality are different quantities.
2. **The denominator in rational approximation is not a formal measure of football-model complexity.** The discussion of pi supplied an analogy about isolated impressive fits versus systematic behavior, not a theorem bounding fantasy predictability.

Candidate research question: **Does a richer, more inspectable representation improve held-out performance or interpretation enough to justify its added complexity?** More variables do not earn admission merely by sounding football-relevant. Strong predictive performance also does not, by itself, establish a causal explanation.

UGC and the mathematical discussion are inspiration only. No claim about the correctness or formalization status of any particular OpenAI mathematical result is a premise of this architecture.

### E. “Lean for football”: a bounded verifier, not a truth oracle

The transferable idea is to separate candidate generation from checking a precisely stated claim. Lean checks formal proofs in a specified logical environment; its axioms and dependencies matter. A football evidence checker is **not equivalent to a theorem prover** and cannot mechanically establish that a latent role interpretation corresponds to reality. [Lean reference manual](https://lean-lang.org/doc/reference/latest/Introduction/) · [Axioms and computation](https://lean-lang.org/theorem_proving_in_lean4/Axioms-and-Computation/)

A suitable proposed TIBER contract is:

> **Given these exact evidence records, declared assumptions, versioned transformations, cutoff and purpose, does this claim satisfy the rules the checker actually enforces?**

Conceptually:

```text
exact inputs + declared rule/model version + candidate claim + cutoff + purpose
    -> scoped checks
    -> conformance receipt + failures/unknowns + explicit limits
```

A passing receipt could establish arithmetic, schema conformance, identity/scope compatibility, evidence linkage, timestamp conditions, and reproducibility within its implemented scope. It cannot establish source honesty, legal entitlement merely from a declared rights field, reviewer competence, causal truth, model calibration, or guaranteed future performance.

**Keep four statuses distinct:** mechanical conformance, substantive review, empirical support, and operator/purpose authorization. Passing one does not imply the others. A recorded authorization claim is not automatically authenticated human authority.

This is a proposed contract view over existing machinery, **not a request to build a new Lean-like engine, new repository, or universal kernel**. Research already describes custody and claim-traceability checks; Harness already separates advisory model output from deterministic conformance checks. Their actual scopes and exclusions remain binding. [Research README](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/main/README.md) · [Harness README](https://github.com/Prometheus-Frameworks/TIBER-Harness/blob/main/README.md)

### F. Typed claims: no silent changes of epistemic status

The following is proposed vocabulary for a reconciliation inventory, not a replacement schema:

| Claim kind | Example | Boundary |
|---|---|---|
| Observed/recorded | A source records nine credited targets in a specified game | Provenance-bearing observation, not infallible reality |
| Reported | A named source reports an availability condition | Preserve attribution and publication/availability clocks |
| Derived | A share computed using a specified numerator and compatible denominator | Deterministic result, not inferred role security |
| Inferred state | A model estimates a more persistent receiving role | Retain model, assumptions, uncertainty and limitations |
| Forecast | A distribution for next-game targets or fantasy production | Separate future horizon, scoring definition and evaluation |
| Outcome | Realized targets or fantasy points after the game | Later evidence, not knowledge available before that game |
| Scenario / thesis | A conditional absence scenario or an operator hypothesis | Do not promote a hypothetical condition into an observed fact |

Unknown, unavailable, stale and conflicting information remain explicit statuses. They are not zeros, observed absences, or precise probability estimates.

Reject silent casts such as inferred-to-observed, retrospective-to-as-known-then, or a schema-pass-to-publication-authorized transition. **Past outcomes may legitimately become evidence for later forecasts** once the relevant cutoff and purpose rules are satisfied. The prohibition is backward leakage, not learning from history.

A proposed claim receipt should reuse existing fields for: subject and identity bindings; season/phase/game/window; claim kind and units; numerator/denominator where relevant; exact input/version references; event, publication, availability, retrieval and cutoff clocks; transformations/model/training cutoff; purpose and rights evidence references; source overlap; missingness; uncertainty; and review/authorization references. Missing required witnesses withhold the affected claim; they do not authorize fabricated substitutes.

### G. A checkable example and explicit negative cases

**All values below are synthetic teaching examples. No real-player artifact or producer run is asserted.**

Suppose a frozen packet records:

```text
player credited targets: 9
team credited targets: 36
same game, team scope, metric definition and source revision
compatible identity and denominator coverage
qualifying evidence for the intended cutoff and purpose
```

A compatible rule can derive `9 / 36 = 0.25` as a **historical credited-target share**. It cannot derive “HIGH future receiving opportunity” merely by relabeling that number. Routes, next-week targets and next-week fantasy points remain unestablished unless separately supported.

Candidate conformance cases for a later, separately authorized synthetic test packet:

| Case | Required behavior |
|---|---|
| Exact compatible inputs and correct arithmetic | Permit the narrowly scoped historical derivation only |
| Team attempts substituted for credited-target denominator without a permitted definition | Reject the unsupported denominator substitution |
| Numerator/denominator from different weeks, teams or incompatible revisions | Reject the join/scope mismatch |
| Routes missing while targets exist | Preserve routes as unavailable; do not manufacture participation |
| An inferred role relabeled as observed | Reject the type/status promotion |
| Data retrieved after a historical cutoff with no qualifying availability witness | Withhold point-in-time predictive use; do not backdate availability |
| Corrected historical view presented as the original known-at view | Reject the temporal claim; retain separately labeled retrospective scope where permitted |
| ROP and TTS reuse the same evidence ancestry | Preserve dependence; do not manufacture independent corroboration |
| Missing, inactive, bye and genuine zero collapsed into one value | Reject the unsupported equivalence |
| Point estimate displayed as a calibrated interval without support | Withhold the invented distributional claim |
| Matching realized score from a leakage-contaminated forecast | Reject the invalid derivation despite the numerical hit |
| A past outcome used at a genuinely later eligible cutoff | Allow the properly qualified historical input; never rewrite the earlier frozen record |
| Successful validation treated as permission to publish or change a roster | Reject the authority escalation |

These are **test-design requirements, not implemented or executed tests**. Policy versions, exact error codes and owners must be reconciled before any implementation.

### H. Three evaluations, not one green badge

**1. Derivation/conformance evaluation:** Were the inputs, arithmetic, identities, types, purposes and clocks handled according to the explicit rules? This is where deterministic validators can supply bounded guarantees.

**2. State-claim evaluation:** Did a predeclared interpretation explain or anticipate relevant football structure better than alternatives? A latent state is not directly visible just because Sunday's box score exists. Use independently specified witnesses where available, competing interpretations, and predeclared observable implications. Avoid evaluating a state against a label constructed from the very same inputs and calling that independent validation. Some states will be observationally hard to distinguish; report that limitation.

**3. Outcome-distribution evaluation:** Did frozen probabilistic forecasts perform usefully across an appropriate held-out population? Candidate methods remain those already proposed in #27/#29: proper scoring, calibration, interval coverage with width, sample counts and dependence-aware uncertainty. A single correct score neither proves calibration nor validates all components.

Maintain separate state-estimation uncertainty, future-outcome variability, and data/model limitations. Do not invent numerical confidence when only qualitative uncertainty is supported.

A valid derivation can feed a poor model. A well-supported pregame role can coexist with an unexpectedly poor outcome. A lucky outcome cannot rescue an invalid derivation. Conversely, repeated disagreement with predeclared implications must be allowed to challenge the state model; “Universe C is uncertain” cannot become an unfalsifiable excuse.

### I. Reconcile with existing owners; do not create parallel architecture

| Existing record/layer | Relationship to this synthesis |
|---|---|
| **Research #29** | Home for the Universe C framing and proposed evidence/state/outcome/verification distinctions |
| **Research #27 and its October 4 audit** | Existing investigation of persistent estimators, candidate component states, baselines and evaluation; no second persistent-state program here |
| **Forecast #190** | Existing point-in-time historical-evidence qualification and preparation gate; this synthesis does not authorize the experiment |
| **Data** | Evidence, source revisions, identity, custody/availability witnesses and consumer eligibility under existing contracts |
| **ROP** | Recorded historical work; no predictive-semantic change |
| **TTS / Teamstate** | Optional, purpose-qualified team context; no implied full feature coverage or source independence |
| **Forecast** | Existing home for predictive inference/distributions under its own scope; no new model or current behavior change |
| **Research custody** | Preserve exact research inputs, candidates, reviews and seals; a public issue is not a sealed Research run |
| **Harness** | Separate conformance/evaluation layer; not a live research executor, production dependency or promoter |
| **Fantasy / existing Player State Card work** | Render eligible records without changing their meaning or treating a UI as ground truth |
| **Ops / operator** | Existing activation, amendment, publication, promotion and revocation authority; issue prose grants none of these implicitly |

The October 4 audit already makes several of these boundaries explicit: ROP is observational, shared Data lineage is not independent corroboration, inferred checkpoints belong within Forecast's existing program, and direct Data inputs can be appropriate. This synthesis sharpens the **separate state-versus-outcome evaluation contract** rather than replacing that audit.

References: [#27](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/27) · [October 4 audit](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/27#issuecomment-5980269904) · [Forecast #190](https://github.com/Prometheus-Frameworks/TIBER-Forecast/issues/190) · [ROP observed-state contract cited by that audit](https://github.com/Prometheus-Frameworks/Role-and-opportunity-model/blob/eab07cbfc17a841804991194ac162609224bf744/docs/contracts/weekly-role-state-v1.md)

The audit is an attributed historical source, not a fresh certification of every linked repository, deployment or player artifact. The README and issue records were read for this publication; no tests, producers or empirical experiments were rerun.

### J. Durable research summaries, not just durable chats

A future human-readable summary should be a view over existing Research records, not a second ledger or an invented reconstruction of an agent's private reasoning. It should preserve:

```text
Question and intended use
Evidence available at the cutoff, with exact references
Hypothesis and competing explanations
Assumptions and known limitations
Approaches considered and documented failure reasons
Method / experiment / derivation references
Result and uncertainty
What this establishes
What this does not establish
Mechanical-check, independent-review and empirical-support status
Unresolved gaps and their owning layer
Publication / promotion / operator-authorization status
Version, predecessor and correction or supersession links
```

Failed approaches are useful when their evidence and failure conditions were actually recorded. Do not invent a research history to make a final result look more rigorous. Corrections should create explicit successor records under existing custody rules rather than silently rewriting frozen evidence or forecasts.

### K. Smallest proposed next step and stop boundary

**Proposed only:** one read-only **Universe C claim-and-transition crosswalk** under this existing issue, reconciled with #27 and Forecast #190. No execution is dispatched by this paragraph.

That packet should inventory a small set of existing artifact types and record, for each: owner; actual claim kind; exact contract; cutoff/purpose; inputs and shared ancestry; what existing validators check; what requires substantive review; what requires empirical evaluation; unsupported claims; and the smallest missing positive/negative test specification.

Start with an existing historical ROP record, an existing qualified TTS record, their existing descriptive composition, and the already proposed inferred-checkpoint/card interfaces. Missing or inaccessible examples must remain explicit gaps. Do not acquire replacement football data or generate new player values to complete the matrix. Any later formalization, schema patch, source qualification or experiment needs its own bounded proposal and operator decision.

**Documentation acceptance checklist:**

- [x] Distinguish Universe C, eligible evidence, bounded state, modeled distribution and realized outcome.
- [x] Preserve ROP/TTS semantics and optional composition rather than require an everything-depends-on-everything chain.
- [x] Include a readable relationship diagram and explain its non-causal, non-runtime status.
- [x] Define the verifier's limits and keep conformance, review, empirical support and authority separate.
- [x] Record typed-claim, temporal-leakage and shared-lineage failure examples.
- [x] Separate state and outcome evaluations without claiming direct access to latent truth.
- [x] Reuse #27/#190 and existing custody/Harness/consumer boundaries.
- [x] Preserve a bounded, non-dispatched next-step proposal.
- [ ] Independent review of this synthesis.
- [ ] Operator adoption of any resulting contract changes; not requested or inferred here.

**Terminal boundary:** documentation recorded in #29 only. No production code, new schema, source acquisition/admission, real-player output, producer run, predictive experiment, model change, schedule, merge, deployment, spending, or fantasy action is authorized by this synthesis. It neither resolves another issue's blockers nor certifies an existing artifact.

> **Universe C is the world. TIBER's states are bounded maps. Verification checks the construction and permitted use of those maps; empirical evaluation tests how useful they are. The operator retains the decision.**