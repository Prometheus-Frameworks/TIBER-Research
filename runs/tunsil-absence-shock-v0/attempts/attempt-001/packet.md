# Tunsil Absence Shock v0 Research Packet

> Operator-readable rendering of `packet.json`. This document is not evidence, review, promotion, or downstream authority.

## Identity

- Schema version: `research-packet/v0.1`
- Synthetic fixture: `false`
- Job ID: `tunsil-absence-shock`
- Job version: `v1`
- Run ID: `tunsil-absence-shock-v0`
- Attempt ID: `attempt-001`
- Output class: `structured_research_packet`
- Generated at: `2026-08-14T12:53:42Z`

## Questions

### Question `q1-availability-replacement-state`

- Prompt: Is Tunsil unavailable for the observation window, is Coleman the actual replacement, and is the surrounding line configuration correctly identified?
- Completion: `answered`
- Assessment: `partly_supported`
- Blocker reason: _None._
- Claim references:
  - `claim-q1a-tunsil-unavailable`
  - `claim-q1b-coleman-replacement`
  - `claim-q1c-line-configuration`
- Limitations:
  - Availability and replacement are supported from admitted first\-party evidence; the full line\-configuration identification is only partly supported and OL identities remain unresolved\.

### Question `q2-protection-quality-pressure`

- Prompt: Does replacing Tunsil with Coleman create a material expected reduction in isolated protection quality or increase the need for schematic help?
- Completion: `inconclusive`
- Assessment: `insufficient`
- Blocker reason: _None._
- Claim references:
  - `claim-q2-protection-quality`
- Limitations:
  - No governed protection\-quality or pressure witness exists; the frozen blocked inputs carry the owner routing\.

### Question `q3-quarterback-playcalling-response`

- Prompt: Does the absence change protection count, pressure conditions, time to throw, scramble/throwaway behavior, play action, quick game, rollout usage, depth of target, or explosive\-pass opportunity?
- Completion: `inconclusive`
- Assessment: `insufficient`
- Blocker reason: _None._
- Claim references:
  - `claim-q3-qb-playcalling`
- Limitations:
  - No governed charting witness for protection counts, pressure conditions, or play\-design distribution exists for the window\.

### Question `q4-backfield-constraint-redistribution`

- Prompt: Does Washington increase running\-back protection or chip participation, with any additional White snaps correctly separated into pass blocks, chip\-and\-release routes, full routes, carries, and targets, and does Croskey\-Merritt lose passing\-down participation without an assumed early\-down carry loss?
- Completion: `inconclusive`
- Assessment: `insufficient`
- Blocker reason: _None._
- Claim references:
  - `claim-q4a-backfield-redistribution`
  - `claim-q4b-white-2025-passpro-baseline`
- Limitations:
  - A supported pre\-window baseline of White's protection/receiving profile exists, but window\-realized redistribution is unassessable without role\-separated participation data\.

### Question `q5-mclaurin-opportunity-vs-efficiency`

- Prompt: Separately from efficiency: does McLaurin's target/first\-read opportunity change; and separately from opportunity: do his air yards, target depth, play\-action/deep usage, YPRR, explosive conversion, red\-zone opportunity, or touchdown ceiling change?
- Completion: `inconclusive`
- Assessment: `insufficient`
- Blocker reason: _None._
- Claim references:
  - `claim-q5a-mclaurin-target-intent`
  - `claim-q5b-mclaurin-opportunity-change`
- Limitations:
  - A supported pre\-injury intent baseline exists, but neither opportunity nor efficiency change is assessable inside the window without governed usage witnesses\.

## Candidate Claims

### Claim `claim-q1a-tunsil-unavailable`

- Question reference: `q1-availability-replacement-state`
- Subject reference: `laremy-tunsil`
- Claim type: `evidence_assessment`
- Epistemic class: `observed`
- Assessment: `supported`
- Statement: Tunsil is unavailable for the observation window: two independent admitted club reports from 2026\-08\-10 confirm a torn triceps requiring surgery with an extended absence and no return timeline\.
- Scope:
-   Population: Laremy Tunsil \(run\-scoped identity\)\.
-   Context: Washington Commanders 2026 training camp/preseason after the 2026\-08\-08 Tunsil torn\-triceps event, before any regular\-season play\.
-   Context reference: `context-was-2026-camp-tunsil-shock`
-   Time horizon: 2026 training\-camp/preseason window from the 2026\-08\-08 injury event to the activated cutoff; no regular\-season observations exist inside the window\.
-   Cutoff at: `2026-08-13T14:13:09Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-001-hyp-q1-tunsil`
- Evidence references:
  - `event-008-obs-tunsil-out`
  - `event-009-obs-coleman-lt`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-016-challenge-q1`
- Missing evidence references:
  - `unres-current-availability`
- Proposed disposition: _None._
- Limitations:
  - Both availability reports are first\-party club communications; no independent medical witness is admitted\.
  - No return date exists; the duration is bounded only by 'extended time' and 'foreseeable future'\.
  - The quantitative side of availability \(a governed injury/roster state witness\) remains a frozen blocked input\.
- Confidence band: `high`
- Confidence rationale: Two same\-window admitted first\-party pages independently attest surgery and extended absence, and a bounded counterevidence search found nothing; the only weakness is the absence of a non\-club witness\.
- Freshness state: `current`
- Freshness as of: `2026-08-10T19:08:48Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-q1b-coleman-replacement`

- Question reference: `q1-availability-replacement-state`
- Subject reference: `brandon-coleman`
- Claim type: `evidence_assessment`
- Epistemic class: `observed`
- Assessment: `supported`
- Statement: Coleman is the actual replacement at left tackle inside the window: admitted club reports name him the present solution and place him with the starters at left tackle in Monday practice\.
- Scope:
-   Population: Brandon Coleman \(run\-scoped identity\)\.
-   Context: Washington Commanders 2026 training camp/preseason after the 2026\-08\-08 Tunsil torn\-triceps event, before any regular\-season play\.
-   Context reference: `context-was-2026-camp-tunsil-shock`
-   Time horizon: 2026 training\-camp/preseason window from the 2026\-08\-08 injury event to the activated cutoff; no regular\-season observations exist inside the window\.
-   Cutoff at: `2026-08-13T14:13:09Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-002-hyp-q1-coleman`
- Evidence references:
  - `event-008-obs-tunsil-out`
  - `event-009-obs-coleman-lt`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-016-challenge-q1`
- Missing evidence references: _None._
- Proposed disposition: _None._
- Limitations:
  - Starter alignment is a camp\-practice observation; a roster move or cross\-match before week one could change the actual replacement\.
- Confidence band: `moderate`
- Confidence rationale: Both admitted pages agree on the replacement, but camp alignment is inherently provisional and no depth\-chart witness for the window is admitted\.
- Freshness state: `current`
- Freshness as of: `2026-08-10T19:08:48Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-q1c-line-configuration`

- Question reference: `q1-availability-replacement-state`
- Subject reference: `was-oline-configuration`
- Claim type: `evidence_assessment`
- Epistemic class: `inferred`
- Assessment: `partly_supported`
- Statement: The surrounding line configuration is partly identified: Chris Paul winning the left\-guard job is directly attested and the excerpts corroborate Conerly's 2025 arrival, but the full five\-man alignment \(including Conerly at right tackle and Wylie as swing\) is issue\-frozen context the admitted excerpts do not restate, and no governed OL identities exist\.
- Scope:
-   Population: Composite Washington offensive\-line configuration subject \(run\-scoped\)\.
-   Context: Washington Commanders 2026 training camp/preseason after the 2026\-08\-08 Tunsil torn\-triceps event, before any regular\-season play\.
-   Context reference: `context-was-2026-camp-tunsil-shock`
-   Time horizon: 2026 training\-camp/preseason window from the 2026\-08\-08 injury event to the activated cutoff; no regular\-season observations exist inside the window\.
-   Cutoff at: `2026-08-13T14:13:09Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-003-hyp-q1-config`
- Evidence references:
  - `event-009-obs-coleman-lt`
  - `event-010-obs-oline-camp`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-016-challenge-q1`
- Missing evidence references:
  - `unres-ol-identity`
  - `unres-current-availability`
- Proposed disposition: _None._
- Limitations:
  - Configuration facts beyond Paul at left guard rest on the frozen issue context, not restated admitted text\.
  - All five line identities are run\-scoped; none has a governed GSIS binding\.
- Confidence band: `low`
- Confidence rationale: Only part of the configuration is directly attested in admitted excerpts and the identities are unresolved, so the composite claim cannot rise above partly supported\.
- Freshness state: `current`
- Freshness as of: `2026-08-12T19:03:38Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-q2-protection-quality`

- Question reference: `q2-protection-quality-pressure`
- Subject reference: `brandon-coleman`
- Claim type: `evidence_assessment`
- Epistemic class: `inferred`
- Assessment: `insufficient`
- Statement: Whether replacing Tunsil with Coleman creates a material expected reduction in isolated protection quality or increases the need for schematic help cannot be assessed: the frozen inputs record that no governed pass\-block, chip/double\-team, or pressure attribution witness exists, and the only in\-window protection observation is a qualitative one\-on\-one drill characterization that excludes schematic help by construction\.
- Scope:
-   Population: Coleman and the composite line configuration \(run\-scoped identities\)\.
-   Context: Washington Commanders 2026 training camp/preseason after the 2026\-08\-08 Tunsil torn\-triceps event, before any regular\-season play\.
-   Context reference: `context-was-2026-camp-tunsil-shock`
-   Time horizon: 2026 training\-camp/preseason window from the 2026\-08\-08 injury event to the activated cutoff; no regular\-season observations exist inside the window\.
-   Cutoff at: `2026-08-13T14:13:09Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-004-hyp-q2-protection`
- Evidence references:
  - `event-010-obs-oline-camp`
- Calculation references: _None._
- Counterevidence references:
  - `event-015-obs-counter-camp-protection`
- Challenge references:
  - `event-017-challenge-insufficiency`
- Missing evidence references:
  - `unres-protection-pressure`
  - `unres-ol-identity`
- Proposed disposition: _None._
- Limitations:
  - No proxy metric was substituted for the missing protection witness, per the job's hard boundaries\.
  - The operator\-excluded proprietary charting class is the only known carrier of the missing fields\.
- Confidence band: `not_assessed`
- Confidence rationale: Insufficiency is a witness\-absence determination, not a graded finding; assigning a confidence band would misstate it as an assessment of the football question\.
- Freshness state: `current`
- Freshness as of: `2026-08-12T19:03:38Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-q3-qb-playcalling`

- Question reference: `q3-quarterback-playcalling-response`
- Subject reference: `jayden-daniels`
- Claim type: `evidence_assessment`
- Epistemic class: `inferred`
- Assessment: `insufficient`
- Statement: Whether the absence changes protection count, pressure conditions, time to throw, scramble/throwaway behavior, play action, quick game, rollouts, depth of target, or explosive\-pass opportunity cannot be assessed: no governed charting witness for any of these fields exists per the frozen inputs, and the admitted camp characterizations of Daniels \(efficient, sharp\) carry no play\-design measurement\.
- Scope:
-   Population: Jayden Daniels \(gsis 00\-0039910\)\.
-   Context: Washington Commanders 2026 training camp/preseason after the 2026\-08\-08 Tunsil torn\-triceps event, before any regular\-season play\.
-   Context reference: `context-was-2026-camp-tunsil-shock`
-   Time horizon: 2026 training\-camp/preseason window from the 2026\-08\-08 injury event to the activated cutoff; no regular\-season observations exist inside the window\.
-   Cutoff at: `2026-08-13T14:13:09Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-005-hyp-q3-daniels`
- Evidence references:
  - `event-010-obs-oline-camp`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-017-challenge-insufficiency`
- Missing evidence references:
  - `unres-protection-pressure`
- Proposed disposition: _None._
- Limitations:
  - Camp praise for Daniels is not evidence about protection\-dependent play design and was not used as such\.
- Confidence band: `not_assessed`
- Confidence rationale: Insufficiency is a witness\-absence determination, not a graded finding\.
- Freshness state: `current`
- Freshness as of: `2026-08-12T19:03:38Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-q4a-backfield-redistribution`

- Question reference: `q4-backfield-constraint-redistribution`
- Subject reference: `rachaad-white`
- Claim type: `evidence_assessment`
- Epistemic class: `inferred`
- Assessment: `insufficient`
- Statement: Whether Washington increases running\-back protection or chip participation — with White's snaps correctly separated into pass blocks, chip\-and\-release routes, full routes, carries, and targets, and without assuming Croskey\-Merritt loses early\-down carries — cannot be assessed: no governed role\-separated participation witness exists for the window, and no governed interpreter separates those roles\.
- Scope:
-   Population: Rachaad White \(gsis 00\-0037256\) and Jacory Croskey\-Merritt \(gsis 00\-0040242\)\.
-   Context: Washington Commanders 2026 training camp/preseason after the 2026\-08\-08 Tunsil torn\-triceps event, before any regular\-season play\.
-   Context reference: `context-was-2026-camp-tunsil-shock`
-   Time horizon: 2026 training\-camp/preseason window from the 2026\-08\-08 injury event to the activated cutoff; no regular\-season observations exist inside the window\.
-   Cutoff at: `2026-08-13T14:13:09Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-006-hyp-q4-backfield`
- Evidence references:
  - `event-013-obs-rb-room`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-017-challenge-insufficiency`
- Missing evidence references:
  - `unres-route-participation`
  - `unres-protection-pressure`
  - `unres-rb-passpro-roles`
- Proposed disposition: _None._
- Limitations:
  - The May role descriptions establish intended roles, not window\-realized redistribution\.
- Confidence band: `not_assessed`
- Confidence rationale: Insufficiency is a witness\-absence determination, not a graded finding\.
- Freshness state: `current`
- Freshness as of: `2026-05-27T15:07:54Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-q4b-white-2025-passpro-baseline`

- Question reference: `q4-backfield-constraint-redistribution`
- Subject reference: `rachaad-white`
- Claim type: `evidence_assessment`
- Epistemic class: `observed`
- Assessment: `supported`
- Statement: As a bounded pre\-window baseline only: the admitted club signing article credits White with strong recent pass protection \(six pressures allowed, 95\.2 efficiency in 2025; similar 2024 figures\) and a short\-area receiving profile \(205 of 230 career targets caught, 1\.09 yards per route run\), and he was brought in as a third\-down pass\-catcher — the profile a protection\-driven redistribution would draw on if one occurs\.
- Scope:
-   Population: Rachaad White \(gsis 00\-0037256\); 2024\-2025 retrospective figures as quoted at signing, predating the observation window\.
-   Context: Washington Commanders 2026 training camp/preseason after the 2026\-08\-08 Tunsil torn\-triceps event, before any regular\-season play\.
-   Context reference: `context-was-2026-camp-tunsil-shock`
-   Time horizon: 2026 training\-camp/preseason window from the 2026\-08\-08 injury event to the activated cutoff; no regular\-season observations exist inside the window\.
-   Cutoff at: `2026-08-13T14:13:09Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-006-hyp-q4-backfield`
- Evidence references:
  - `event-012-obs-white-passpro-2025`
  - `event-013-obs-rb-room`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-017-challenge-insufficiency`
- Missing evidence references: _None._
- Proposed disposition: _None._
- Limitations:
  - The figures are the club article's quoted numbers; no governed charting witness verifies them in this run\.
  - This baseline says nothing about whether redistribution occurs in 2026; that remains insufficient\.
- Confidence band: `moderate`
- Confidence rationale: The profile statement is directly observed in the admitted article, but the underlying figures are unverified quotations of third\-party charting\.
- Freshness state: `current`
- Freshness as of: `2026-05-27T15:07:54Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-q5a-mclaurin-target-intent`

- Question reference: `q5-mclaurin-opportunity-vs-efficiency`
- Subject reference: `terry-mclaurin`
- Claim type: `evidence_assessment`
- Epistemic class: `observed`
- Assessment: `supported`
- Statement: As a bounded pre\-injury baseline of intent only: the admitted May 2026 article states the offense is built around getting McLaurin ten targets a game with repeated explosive receptions, moving receivers to create matchups — an opportunity\-centric schematic intent recorded before the Tunsil event\.
- Scope:
-   Population: Terry McLaurin \(gsis 00\-0035659\); schematic intent as stated 2026\-05\-20, predating the observation window\.
-   Context: Washington Commanders 2026 training camp/preseason after the 2026\-08\-08 Tunsil torn\-triceps event, before any regular\-season play\.
-   Context reference: `context-was-2026-camp-tunsil-shock`
-   Time horizon: 2026 training\-camp/preseason window from the 2026\-08\-08 injury event to the activated cutoff; no regular\-season observations exist inside the window\.
-   Cutoff at: `2026-08-13T14:13:09Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-007-hyp-q5-mclaurin`
- Evidence references:
  - `event-011-obs-mclaurin-plan`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-017-challenge-insufficiency`
- Missing evidence references: _None._
- Proposed disposition: _None._
- Limitations:
  - Stated intent is not realized usage and predates the injury; it cannot support any claim about post\-injury opportunity\.
- Confidence band: `moderate`
- Confidence rationale: The intent quotation is directly observed; its bearing on the window is inherently limited, which the claim's own scope bounds\.
- Freshness state: `current`
- Freshness as of: `2026-05-20T15:17:13Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-q5b-mclaurin-opportunity-change`

- Question reference: `q5-mclaurin-opportunity-vs-efficiency`
- Subject reference: `terry-mclaurin`
- Claim type: `opportunity_assessment`
- Epistemic class: `inferred`
- Assessment: `insufficient`
- Statement: Whether McLaurin's target/first\-read opportunity changes — separately from whether his air yards, target depth, play\-action/deep usage, YPRR, explosive conversion, red\-zone opportunity, or touchdown ceiling change — cannot be assessed: no governed target, air\-yard, route, or usage witness exists inside the window, and the only in\-window McLaurin observation \(winning all one\-on\-one matchups in a joint practice\) measures neither opportunity nor protection\-dependent efficiency\.
- Scope:
-   Population: Terry McLaurin \(gsis 00\-0035659\)\.
-   Context: Washington Commanders 2026 training camp/preseason after the 2026\-08\-08 Tunsil torn\-triceps event, before any regular\-season play\.
-   Context reference: `context-was-2026-camp-tunsil-shock`
-   Time horizon: 2026 training\-camp/preseason window from the 2026\-08\-08 injury event to the activated cutoff; no regular\-season observations exist inside the window\.
-   Cutoff at: `2026-08-13T14:13:09Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-007-hyp-q5-mclaurin`
- Evidence references:
  - `event-010-obs-oline-camp`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-017-challenge-insufficiency`
- Missing evidence references:
  - `unres-route-participation`
- Proposed disposition: _None._
- Limitations:
  - Per the job boundaries, no proxy \(including camp anecdotes or intent statements\) was substituted for the missing opportunity witnesses\.
  - The operator's original bullishness question therefore receives an explicit requires\-data terminal, not a directional answer\.
- Confidence band: `not_assessed`
- Confidence rationale: Insufficiency is a witness\-absence determination, not a graded finding\.
- Freshness state: `current`
- Freshness as of: `2026-08-12T19:03:38Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

## Negative Findings

_None._

## Unresolved Items

### Unresolved `unres-route-participation`

- Kind: `blocked_input`
- Statement: No governed live\-2026 route or route\-participation witness exists; FTN participation publishes post\-season only and PFF\-derived participation is provider\_or\_license\_blocked\.
- Blocked input references:
  - `route-participation-evidence`
- Related claim references:
  - `claim-q4a-backfield-redistribution`
  - `claim-q5b-mclaurin-opportunity-change`
- Related question references:
  - `q4-backfield-constraint-redistribution`
  - `q5-mclaurin-opportunity-vs-efficiency`

### Unresolved `unres-protection-pressure`

- Kind: `blocked_input`
- Statement: No governed pass\-block, chip/double\-team, or pressure/sack attribution witness exists; the operator excluded the proprietary charting class that carries these fields\.
- Blocked input references:
  - `protection-pressure-attribution`
- Related claim references:
  - `claim-q2-protection-quality`
  - `claim-q3-qb-playcalling`
  - `claim-q4a-backfield-redistribution`
- Related question references:
  - `q2-protection-quality-pressure`
  - `q3-quarterback-playcalling-response`
  - `q4-backfield-constraint-redistribution`

### Unresolved `unres-current-availability`

- Kind: `blocked_input`
- Statement: No qualified governed current\-2026 in\-season availability witness is admitted; the nflverse 2025 restoration is a retrospective\-backfill provenance class and the current\-player\-state audit leaves 2026 lanes unresolved\.
- Blocked input references:
  - `current-governed-availability-state`
- Related claim references:
  - `claim-q1a-tunsil-unavailable`
  - `claim-q1c-line-configuration`
- Related question references:
  - `q1-availability-replacement-state`

### Unresolved `unres-ol-identity`

- Kind: `blocked_input`
- Statement: Tunsil, Coleman, Paul, Conerly Jr\., and Wylie sit outside the governed skill\-position identity population; their identities are run\-scoped pending governed OL identity coverage\.
- Blocked input references:
  - `ol-canonical-identity`
- Related claim references:
  - `claim-q1c-line-configuration`
  - `claim-q2-protection-quality`
- Related question references:
  - `q1-availability-replacement-state`
  - `q2-protection-quality-pressure`

### Unresolved `unres-rb-passpro-roles`

- Kind: `blocked_input`
- Statement: No governed interpreter separates running\-back pass blocks, chip\-and\-release routes, and full routes; the candidate downstream home is not yet activated\.
- Blocked input references:
  - `rb-passpro-role-interpretation`
- Related claim references:
  - `claim-q4a-backfield-redistribution`
- Related question references:
  - `q4-backfield-constraint-redistribution`

## Follow-up Questions

### Follow-up `followup-rfi-route-participation`

- Question: Can TIBER\-Data stand up a governed live\-2026 route/route\-participation witness \(routes run, participation shares\) admissible for in\-season runs?
- Rationale: Route participation is the opportunity denominator for q4 and q5; its absence is the frozen blocker for both\.
- Requires new run: `true`
- Request for information:
-   Owner repository: `Prometheus-Frameworks/TIBER-Data`
-   Related issue: `Prometheus-Frameworks/TIBER-Data#247`
-   Requested evidence: A governed, rights\-clean live\-2026 route\-participation witness with per\-game routes and participation shares for skill positions\.
  - Unresolved references: `unres-route-participation`

### Follow-up `followup-rfi-protection-pressure`

- Question: Can TIBER\-Data stand up a governed pass\-block/chip/double\-team and pressure/sack attribution witness \(the '\[D0\] Tunsil golden trace' successor\)?
- Rationale: Protection\-quality attribution is the frozen blocker for q2 and q3 and half of q4; without it the protection\-to\-opportunity chain cannot be evidenced\.
- Requires new run: `true`
- Request for information:
-   Owner repository: `Prometheus-Frameworks/TIBER-Data`
-   Related issue: _None._
-   Requested evidence: Governed per\-snap pass\-block assignments, chip/double\-team participation, and pressure/sack attribution for the Washington line and backs\.
  - Unresolved references: `unres-protection-pressure`

### Follow-up `followup-rfi-current-availability`

- Question: Can TIBER\-Data qualify a governed current\-2026 in\-season availability witness, resolving the September continuity question for the restored nflverse injuries lane?
- Rationale: Current availability is the quantitative side of q1 and the durable witness Lane 2 tracks; the 2025 backfill provenance class does not qualify\.
- Requires new run: `true`
- Request for information:
-   Owner repository: `Prometheus-Frameworks/TIBER-Data`
-   Related issue: `Prometheus-Frameworks/TIBER-Research#5`
-   Requested evidence: A qualified governed current\-2026 injury/roster/gameday availability witness with in\-season continuity evidence from the September observation checkpoint\.
  - Unresolved references: `unres-current-availability`

### Follow-up `followup-rfi-ol-identity`

- Question: Can TIBER\-Data extend governed identity coverage to offensive linemen so line subjects stop requiring run\-scoped identities?
- Rationale: All five line identities in this run are run\-scoped; composite\-subject grain was required because no governed OL GSIS bindings exist\.
- Requires new run: `false`
- Request for information:
-   Owner repository: `Prometheus-Frameworks/TIBER-Data`
-   Related issue: _None._
-   Requested evidence: Governed GSIS identity bindings for offensive linemen, starting with the Washington line named in this run\.
  - Unresolved references: `unres-ol-identity`

### Follow-up `followup-rfi-rb-passpro-roles`

- Question: Can Role\-and\-opportunity\-model activate the deterministic RB pass\-protection/route role interpreter \(issue \#23\)?
- Rationale: q4's role separation \(pass blocks vs chip\-and\-release vs full routes\) has a designed downstream home that is not yet activated\.
- Requires new run: `true`
- Request for information:
-   Owner repository: `Prometheus-Frameworks/Role-and-opportunity-model`
-   Related issue: `Prometheus-Frameworks/Role-and-opportunity-model#23`
-   Requested evidence: An activated deterministic interpreter separating RB pass blocks, chip\-and\-release routes, full routes, carries, and targets\.
  - Unresolved references: `unres-rb-passpro-roles`

## Response Branches

### Branch `h1-replacement-holds`

- Label: H1 — Replacement holds
- Description: Coleman remains serviceable without materially greater help\.
- Expected signals:
  - Stable chip/double\-team and six\-/seven\-man protection rates\.
  - Stable quick\-pressure and sack rates\.
  - Stable play\-action/deep\-attempt profile\.
  - Stable McLaurin air\-yard opportunity\.
  - No meaningful White/Croskey\-Merritt passing\-down redistribution attributable to protection\.
- Assessment: `insufficient`
- Evidence references: _None._
- Counterevidence references: _None._
- Claim references:
  - `claim-q2-protection-quality`
  - `claim-q3-qb-playcalling`
- Context notes:
  - Every expected H1 signal \(protection rates, pressure rates, play\-design profile, air\-yard opportunity, backfield redistribution\) requires a witness class the frozen inputs record as absent\.
- Limitations:
  - Preregistered before evidence review; assessed insufficient because no admitted in\-window quantitative signal can discriminate the branches\.

### Branch `h2-successful-adaptation`

- Label: H2 — Successful adaptation
- Description: Washington preserves quarterback conditions by redistributing protection and changing play design\.
- Expected signals:
  - More chips, double teams, tight\-end or running\-back protection\.
  - More quick game, under\-center play action, movement, or rollouts\.
  - McLaurin target opportunity holding better than target depth or explosive efficiency\.
  - White gaining passing\-down snaps, with routes and pass blocks reported separately\.
  - Croskey\-Merritt early\-down rushing remaining more stable than his third\-down/two\-minute role\.
- Assessment: `insufficient`
- Evidence references: _None._
- Counterevidence references: _None._
- Claim references:
  - `claim-q3-qb-playcalling`
  - `claim-q4a-backfield-redistribution`
  - `claim-q5b-mclaurin-opportunity-change`
- Context notes:
  - Adaptation signals \(chips, protector counts, play\-design shifts, role\-separated White snaps\) are precisely the fields of the missing protection and participation witnesses\.
- Limitations:
  - Preregistered before evidence review; assessed insufficient because no admitted in\-window quantitative signal can discriminate the branches\.

### Branch `h3-protection-failure`

- Label: H3 — Protection failure
- Description: Adaptation does not fully compensate for the replacement\.
- Expected signals:
  - Higher quick\-pressure, pressure\-to\-sack, hit, throwaway, or scramble rates\.
  - Lower depth of target and explosive\-pass frequency\.
  - Fewer sustained and scoring drives\.
  - Lower passing efficiency for Daniels\.
  - Offense\-wide efficiency pressure that cannot be represented as one player's lost workload\.
- Assessment: `insufficient`
- Evidence references: _None._
- Counterevidence references: _None._
- Claim references:
  - `claim-q2-protection-quality`
  - `claim-q5b-mclaurin-opportunity-change`
- Context notes:
  - Failure signals \(pressure, sack conversion, depth\-of\-target decline, drive outcomes\) have no admitted in\-window witness; no regular\-season observations exist inside the window at all\.
- Limitations:
  - Preregistered before evidence review; assessed insufficient because no admitted in\-window quantitative signal can discriminate the branches\.

## Causal Paths

### Causal path `path-tunsil-protection-chain`

- Description: The frozen causal chain runs Tunsil absence \-\> left\-tackle replacement \-\> protection conditions \-\> quarterback passing conditions \-\> McLaurin opportunity/efficiency, with a parallel branch to backfield protection roles\. Only the first two links carry admitted evidence; the downstream links \(protection to quarterback conditions, quarterback conditions to McLaurin opportunity, protection to backfield roles\) are deliberately not represented as edges because no admitted in\-window evidence supports them, and representing them without evidence would reintroduce the narrative\-only downgrade the job prohibits\.
- Nodes:
  - `node-tunsil-absence`: Tunsil unavailable \(torn triceps, surgery, extended absence\)
    - Subject references: `laremy-tunsil`
  - `node-lt-replacement`: Coleman at left tackle within the reshaped line configuration
    - Subject references: `brandon-coleman`, `was-oline-configuration`
  - `node-protection-conditions`: Isolated protection quality and schematic\-help conditions
    - Subject references: `was-oline-configuration`, `jayden-daniels`

#### Edge `edge-absence-to-replacement` (`node-tunsil-absence` → `node-lt-replacement`)

- Mechanism: The confirmed surgery and extended absence force a starter replacement at left tackle; admitted reports name Coleman working with the starters as the present solution\.
- Evidence references:
  - `event-008-obs-tunsil-out`
  - `event-009-obs-coleman-lt`
- Counterevidence references: _None._
- Uncertainty: Camp alignment is provisional; a roster move or a Conerly cross\-match could change the replacement before games count\.
- Falsifiers:
  - An admitted report of Tunsil returning within the window\.
  - An admitted report of a different starter at left tackle\.
- Claim references:
  - `claim-q1a-tunsil-unavailable`
  - `claim-q1b-coleman-replacement`

#### Edge `edge-replacement-to-protection` (`node-lt-replacement` → `node-protection-conditions`)

- Mechanism: Replacing a Pro Bowl left tackle with a 2024 third\-round pick who played guard in 2025 and missed most of camp injured changes the line's isolated protection conditions and plausibly the need for schematic help; the only in\-window protection evidence is a qualitative joint\-practice characterization\.
- Evidence references:
  - `event-009-obs-coleman-lt`
  - `event-010-obs-oline-camp`
- Counterevidence references:
  - `event-015-obs-counter-camp-protection`
- Uncertainty: Direction and magnitude are unmeasured: no governed pass\-block, chip/double\-team, or pressure witness exists, so this edge records an evidenced mechanism with an unquantified effect\.
- Falsifiers:
  - Governed protection data showing stable isolated protection quality without added help\.
  - Governed charting showing no change in protection counts or pressure conditions\.
- Claim references:
  - `claim-q2-protection-quality`

## Packet Limitations

- All football evidence is first\-party club reporting admitted manually per instance; no independent or charted witness exists inside the window\.
- The observation window contains no regular\-season play; every observation is camp or joint\-practice grade\.
- Availability, replacement, and two pre\-window baselines are the only supported findings; the protection\-to\-opportunity chain the operator asked about is explicitly unassessed, not implicitly downgraded\.
- This packet is internal, grants no downstream authority, and must not mutate any TIBER product, ranking, forecast, or fantasy surface; the operator's bullishness question is answered only by the requires\-data terminal and the routed RFIs\.

## Governance State

- Process terminal: `completed`
- Completion: `inconclusive`
- Terminal decision: `tunsil_absence_shock_v0_requires_data_followup`
- Authority state: `unpromoted`
- Downstream authority: `none`
- Reportability: `internal`
