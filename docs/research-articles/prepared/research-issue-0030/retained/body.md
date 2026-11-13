## Research question
Does separating **defensive front and secondary context** improve explanation and prospective forecasting of opponent rushing and receiving opportunity compared with a single overall-defense baseline?

This is a **design and test-planning issue**, not an authorization to acquire sources, fit models, run experiments, change Teamstate, or publish player forecasts.

## Motivation
Universe C is an evolving network of football interactions. One aggregate defensive grade can hide a strong front seven paired with a vulnerable secondary, or the reverse. A weak secondary may still be difficult to exploit when the pass rush is disruptive. We want useful **separable compression**, not a universal team-strength score.

## Proposed lenses
- Defensive front: interior run fits, edge containment, pressure generation, linebacker run/pass functions.
- Secondary: outside/slot coverage, safety help, explosive-play prevention, tackling.
- Offensive line: pass protection, interior/exterior rushing environment (reconcile existing [OL Context #28](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/28)).
- Offensive skill positions: receiving deployment, rushing workload, blocking; QB treated separately for passing/pressure response.
- Cross-unit interactions: pressure × coverage; blocking × front; personnel package, scheme, opponent and game state.

**Position groups and functional units overlap.** LB coverage and blitzing cross traditional boundaries. Distinguish outcomes observed while a unit was on the field from causal credit assigned to that unit.

## Bounded first comparison — design only
Define the smallest defensible matchup-level comparison:
- **B0:** overall defensive environment baseline.
- **B1:** separately measured front/run-defense and coverage/pass-defense contexts.
- **B2 (optional later):** a limited interaction (e.g. pressure × coverage), only if supported by qualified fields and sample size.

Prefer next-game opponent **rushing and receiving opportunity** targets over fantasy points in the first test. Keep target, carry, route, snap, pass-attempt and other denominators distinct; do not silently equate yards allowed with unit ability.

Predeclare eligible population, historical cutoff, time-varying personnel/availability, schedule, game/season, opponent strength, score state, coverage, and missingness. Compare walk-forward out-of-sample errors against B0 and simpler baselines; report cohort counts, coverage/abstention, stability, sensitivity to personnel changes and whether any gain is large enough to justify extra complexity. Avoid postgame labels leaking into pregame features.

A model that fails to improve held-out opportunity estimates may still support descriptive team interpretation, but must not be promoted as a predictive upgrade.

## First requested deliverable
A **read-only field-readiness and falsification packet**, reconciling:
- [Universe C #29](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/29)
- [OL Context #28](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/28)
- Existing TIBER-Teamstate contracts and outputs
- Data field definitions, source/rights/cutoff eligibility
- [Forecast #190](https://github.com/Prometheus-Frameworks/TIBER-Forecast/issues/190) and its strict point-in-time constraints
- Existing ROP observational boundaries

Return a matrix of each candidate field: owner/source, grain, definition, numerator/denominator, population, timestamps, identity/team joins, coverage, provenance, purpose eligibility, unknowns and smallest positive/negative test. Separate **already available**, **candidate/unadmitted**, and **not evidenced**. Identify the smallest feasible B0/B1 comparison, or state why it is blocked.

## Ownership and boundaries
Research owns question decomposition and design packet. Data owns source evidence and eligibility. Teamstate owns team-context interpretation. ROP owns observed player work. Forecast owns predictive tests under separate authorization. Ops/operator retains consequential authority.

No code, new contracts, provider acquisition, proprietary-data ingestion, model run, player values, PR, merge, deployment, schedule or downstream activation is authorized by this issue. Stop at the exact missing witness or proposed bounded next operator decision.