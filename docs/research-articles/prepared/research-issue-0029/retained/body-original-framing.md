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

