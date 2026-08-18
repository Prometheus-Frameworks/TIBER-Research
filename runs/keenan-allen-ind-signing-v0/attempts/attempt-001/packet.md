# Keenan Allen to Indianapolis: bounded transaction representability and candidate ownership\-change record

> Operator-readable rendering of `packet.json`. This document is not evidence, review, promotion, or downstream authority.

## Identity

- Schema version: `research-packet/v0.1`
- Synthetic fixture: `false`
- Job ID: `keenan-allen-ind-signing`
- Job version: `v1`
- Run ID: `keenan-allen-ind-signing-v0`
- Attempt ID: `attempt-001`
- Output class: `structured_research_packet`
- Generated at: `2026-08-18T21:42:00Z`

## Questions

### Question `q1-transaction-attestation`

- Prompt: Is the Allen\-to\-Indianapolis transaction attested by admitted reporting inside the observation window, with agreement on player, direction, destination team, and date?
- Completion: `answered`
- Assessment: `supported`
- Blocker reason: _None._
- Claim references:
  - `claim-transaction-attested`
- Limitations:
  - Attestation is not verification: no governed, first\-party, or league witness was admitted\.

### Question `q2-identity-and-current-association`

- Prompt: Does Keenan Allen resolve to a canonical TIBER identity, and which team does TIBER's own governed state currently associate him with?
- Completion: `answered`
- Assessment: `supported`
- Blocker reason: _None._
- Claim references:
  - `claim-canonical-identity`
  - `claim-current-team-association`
- Limitations:
  - Both identity answers rest on a candidate artifact that is explicitly not promoted\.

### Question `q3-candidate-representability`

- Prompt: Can the transaction be expressed as a contract\-conformant candidate player\_ownership\_change\_event\_v0 record inside research custody, without asserting governed roster truth or exceeding research authority?
- Completion: `answered`
- Assessment: `partly_supported`
- Blocker reason: _None._
- Claim references:
  - `claim-candidate-representable`
- Limitations:
  - Representation succeeded; verification against governed roster state remains blocked upstream\.

## Candidate Claims

### Claim `claim-transaction-attested`

- Question reference: `q1-transaction-attestation`
- Subject reference: `keenan-allen`
- Claim type: `evidence_assessment`
- Epistemic class: `observed`
- Assessment: `supported`
- Statement: Admitted reporting inside the observation window attests that Keenan Allen agreed to terms with the Indianapolis Colts on 2026\-08\-17, with three outlets agreeing on player, destination team, and date\.
- Scope:
-   Population: The single 2026\-08\-17 Keenan Allen / Indianapolis transaction report\.
-   Context: Indianapolis Colts, 2026 preseason, the 2026\-08\-17 Keenan Allen signing treated strictly as a roster\-membership transaction representability test\.
-   Context reference: `context-ind-2026-allen-signing`
-   Time horizon: The bounded 2026\-08\-17 to 2026\-08\-18 transaction\-reporting window, observed in a single audit session; no 2026 regular\-season observation exists inside the window\.
-   Cutoff at: `2026-08-18T21:27:16Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-001-hyp-transaction`
- Evidence references:
  - `event-004-obs-pfr-signing`
  - `event-005-obs-fox-signing`
  - `event-006-obs-larrybrown-signing`
- Calculation references: _None._
- Counterevidence references:
  - `event-007-obs-census-allen-identity`
- Challenge references:
  - `event-014-challenge-transaction-representation`
- Missing evidence references:
  - `unres-governed-roster-verification`
  - `unres-transaction-wire`
- Proposed disposition: _None._
- Limitations:
  - All three admitted reports trace to a single named insider report, so corroboration is not independence\.
  - Reported contract terms are third\-party reporting and are not a governed TIBER fact\.
  - Agreed terms are not an executed contract or a roster\-membership fact; no admitted evidence establishes that Allen occupies an Indianapolis roster spot\.
  - The retained source text is derived summary output, not a verbatim page capture\.
- Confidence band: `moderate`
- Confidence rationale: Three admitted reports agree on player, destination team, and date, and a bounded contradiction search found none; confidence is held at moderate rather than high because all three trace to a single originating insider report and no first\-party club, league, or governed witness was admitted\.
- Freshness state: `current`
- Freshness as of: `2026-08-18T21:27:16Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-canonical-identity`

- Question reference: `q2-identity-and-current-association`
- Subject reference: `keenan-allen`
- Claim type: `evidence_assessment`
- Epistemic class: `observed`
- Assessment: `supported`
- Statement: Keenan Allen resolves to canonical TIBER identity 00\-0030279 \(GSIS\), sourced from the pinned bounded 2026 population census, which marks the row canonical\_id\_source\_verified\.
- Scope:
-   Population: Keenan Allen's canonical identity across pinned TIBER\-Data artifacts\.
-   Context: Indianapolis Colts, 2026 preseason, the 2026\-08\-17 Keenan Allen signing treated strictly as a roster\-membership transaction representability test\.
-   Context reference: `context-ind-2026-allen-signing`
-   Time horizon: The bounded 2026\-08\-17 to 2026\-08\-18 transaction\-reporting window, observed in a single audit session; no 2026 regular\-season observation exists inside the window\.
-   Cutoff at: `2026-08-18T21:27:16Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-002-hyp-identity`
- Evidence references:
  - `event-007-obs-census-allen-identity`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-014-challenge-transaction-representation`
- Missing evidence references:
  - `unres-crosswalk-coverage`
- Proposed disposition: _None._
- Limitations:
  - The canonical identifier is carried only by a candidate artifact explicitly marked candidate\_governed\_artifact\_not\_promoted\.
  - The promoted identity crosswalk v2 carries no Keenan Allen record, so no promoted TIBER surface resolves him today\.
- Confidence band: `high`
- Confidence rationale: The pinned census carries an explicit canonical GSIS identifier for Keenan Allen with identity\_status canonical\_id\_source\_verified, read directly from the pinned artifact bytes\.
- Freshness state: `current`
- Freshness as of: `2026-08-18T21:27:16Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-current-team-association`

- Question reference: `q2-identity-and-current-association`
- Subject reference: `keenan-allen`
- Claim type: `evidence_assessment`
- Epistemic class: `observed`
- Assessment: `supported`
- Statement: TIBER's only recorded team association for Keenan Allen is Los Angeles Chargers, marked source\_backed\_historical\_team for source\_season 2025; TIBER records no Indianapolis association at the cutoff\.
- Scope:
-   Population: TIBER's recorded team association for Keenan Allen at the cutoff\.
-   Context: Indianapolis Colts, 2026 preseason, the 2026\-08\-17 Keenan Allen signing treated strictly as a roster\-membership transaction representability test\.
-   Context reference: `context-ind-2026-allen-signing`
-   Time horizon: The bounded 2026\-08\-17 to 2026\-08\-18 transaction\-reporting window, observed in a single audit session; no 2026 regular\-season observation exists inside the window\.
-   Cutoff at: `2026-08-18T21:27:16Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-002-hyp-identity`
- Evidence references:
  - `event-007-obs-census-allen-identity`
- Calculation references: _None._
- Counterevidence references: _None._
- Challenge references:
  - `event-014-challenge-transaction-representation`
- Missing evidence references:
  - `unres-governed-roster-verification`
- Proposed disposition: _None._
- Limitations:
  - The LAC association is a 2025 player\-season fact carrying team\_status source\_backed\_historical\_team; it is not a claim about Allen's roster membership at any 2026 date\.
  - Nothing in TIBER associates Keenan Allen with Indianapolis at the cutoff\.
- Confidence band: `high`
- Confidence rationale: The team assignment and its status qualifier were read directly from the pinned artifact, which states its own season scope and non\-promoted status\.
- Freshness state: `current`
- Freshness as of: `2026-08-18T21:27:16Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

### Claim `claim-candidate-representable`

- Question reference: `q3-candidate-representability`
- Subject reference: `keenan-allen`
- Claim type: `methodological`
- Epistemic class: `calculated`
- Assessment: `partly_supported`
- Statement: The transaction is expressible as a candidate player\_ownership\_change\_event\_v0 record \(event\_type signing, to\_team IND, player\_id 00\-0030279, from\_team fields null, verification\_status and confidence both provisional\) that validates against the pinned contract and is held in research custody; representation succeeds, while verification against governed roster state remains blocked\.
- Scope:
-   Population: The single candidate player\_ownership\_change\_event\_v0 record proposed by this run\.
-   Context: Indianapolis Colts, 2026 preseason, the 2026\-08\-17 Keenan Allen signing treated strictly as a roster\-membership transaction representability test\.
-   Context reference: `context-ind-2026-allen-signing`
-   Time horizon: The bounded 2026\-08\-17 to 2026\-08\-18 transaction\-reporting window, observed in a single audit session; no 2026 regular\-season observation exists inside the window\.
-   Cutoff at: `2026-08-18T21:27:16Z`
- Baseline reference: _None._
- Baseline position: _None._
- Comparison references: _None._
- Hypothesis references:
  - `event-003-hyp-representability`
- Evidence references:
  - `event-004-obs-pfr-signing`
  - `event-005-obs-fox-signing`
  - `event-006-obs-larrybrown-signing`
  - `event-007-obs-census-allen-identity`
  - `event-009-obs-ownership-events-fixture-only`
  - `event-010-obs-no-governed-roster-source`
  - `event-011-obs-ownership-change-contract`
- Calculation references:
  - `event-012-calc-candidate-event-row`
  - `event-013-calc-contract-conformance`
- Counterevidence references: _None._
- Challenge references:
  - `event-014-challenge-transaction-representation`
- Missing evidence references:
  - `unres-governed-roster-verification`
- Proposed disposition: _None._
- Limitations:
  - The record is unpromoted research custody only; it is not a TIBER\-Data artifact and carries no downstream authority\.
  - Conformance was checked against the pinned contract with a JSON Schema 2020\-12 validator and passed; that establishes legal shape and vocabulary only\. It is not TIBER\-Data's promotion review, and schema validity is not evidence that the transaction is governed\-verified\.
  - The assessment is partial because representation succeeded while verification against governed roster state remains impossible: TIBER\-Data holds no governed current 2026 roster, ownership, or transaction source\.
  - from\_team fields are null by policy; the 2025 historical LAC association was deliberately not promoted into a from\_team value, because no admitted evidence establishes Allen's roster membership immediately before the signing\.
- Confidence band: `moderate`
- Confidence rationale: The record was constructed field by field against the published contract, every unsupported field was left null, and it validates against the pinned schema; confidence is held at moderate because the governed\-verification half remains blocked and promotion review has not occurred\.
- Freshness state: `current`
- Freshness as of: `2026-08-18T21:27:16Z`
- Market inefficiency claim: _None._
- Market snapshot reference: _None._

## Negative Findings

_None._

## Unresolved Items

### Unresolved `unres-governed-roster-verification`

- Kind: `blocked_input`
- Statement: TIBER\-Data holds no governed, full\-universe, current 2026 roster, ownership, or transaction source, so the reported signing cannot be verified against governed roster state and the candidate record cannot move beyond provisional\.
- Blocked input references:
  - `governed-2026-roster-source`
- Related claim references:
  - `claim-transaction-attested`
  - `claim-current-team-association`
  - `claim-candidate-representable`
- Related question references:
  - `q1-transaction-attestation`
  - `q2-identity-and-current-association`
  - `q3-candidate-representability`

### Unresolved `unres-transaction-wire`

- Kind: `blocked_input`
- Statement: No current transaction wire exists, so TIBER cannot detect or independently corroborate a signing; this transaction entered custody only through operator\-directed manual admission\.
- Blocked input references:
  - `current-transaction-wire`
- Related claim references:
  - `claim-transaction-attested`
- Related question references:
  - `q1-transaction-attestation`

### Unresolved `unres-crosswalk-coverage`

- Kind: `blocked_input`
- Statement: The promoted identity crosswalk v2 carries no Keenan Allen record, so his canonical identity is available only from a candidate census that is explicitly not promoted\.
- Blocked input references:
  - `promoted-crosswalk-coverage-for-allen`
- Related claim references:
  - `claim-canonical-identity`
- Related question references:
  - `q2-identity-and-current-association`

## Follow-up Questions

### Follow-up `followup-promote-candidate-record`

- Question: Should the candidate player\_ownership\_change\_event\_v0 record for Keenan Allen be admitted into TIBER\-Data's promoted 2026 ownership\-event lane, replacing the fixture\-only exemplar as the lane's first source\-backed record?
- Rationale: Promotion is a TIBER\-Data governance decision outside this run's research\_custody\_only ceiling\. The candidate record exists, is digest\-bound, and is ready for that separate review\.
- Requires new run: `false`
- Request for information:
-   Owner repository: `Prometheus-Frameworks/TIBER-Data`
-   Related issue: `Prometheus-Frameworks/TIBER-Research#13`
-   Requested evidence: A TIBER\-Data admission decision for the candidate record, plus the governed roster or ownership witness needed to move verification\_status beyond provisional\.
  - Unresolved references: `unres-governed-roster-verification`

### Follow-up `followup-transaction-wire`

- Question: What is the smallest governed transaction\-detection path that would let TIBER observe a signing like this one without an operator\-directed manual admission?
- Rationale: This run detected nothing on its own; the transaction entered only because an operator directed the admission of specific public reports\.
- Requires new run: `false`
- Request for information:
-   Owner repository: `Prometheus-Frameworks/TIBER-Data`
-   Related issue: `Prometheus-Frameworks/TIBER-Research#13`
-   Requested evidence: A rights\-cleared, clock\-bearing transaction source qualified under the TIBER\-Data source\-admission process\.
  - Unresolved references: `unres-transaction-wire`

### Follow-up `followup-crosswalk-coverage`

- Question: Should the promoted identity crosswalk be extended to carry Keenan Allen, so his canonical identity does not depend on a non\-promoted candidate census?
- Rationale: Every identity claim in this packet rests on a candidate artifact explicitly marked not promoted\.
- Requires new run: `false`
- Request for information:
-   Owner repository: `Prometheus-Frameworks/TIBER-Data`
-   Related issue: `Prometheus-Frameworks/TIBER-Research#13`
-   Requested evidence: A promoted crosswalk record binding Keenan Allen's canonical GSIS identifier to the provider identifiers TIBER consumes\.
  - Unresolved references: `unres-crosswalk-coverage`

## Packet Limitations

- This run establishes representability, not roster truth: nothing here asserts that Keenan Allen occupies an Indianapolis roster spot in any governed TIBER sense\.
- No downstream inference of any kind was performed\. No role, alignment, snap share, target share, route participation, personnel usage, depth\-chart position, or fantasy consequence is derived for Allen or for any other Indianapolis player\.
- No other Colts player is named, scored, adjusted, or implicated by this packet\.
- All admitted external evidence is derived summary text rather than verbatim source bytes, and all of it traces to a single originating insider report\.
- The candidate record is held in research custody and is not written into TIBER\-Data; promotion remains a separate governance decision\.
- Retrieval was bounded to one audit session, so a later transaction, correction, or retraction inside the same window would not have been observed\.

## Governance State

- Process terminal: `completed`
- Completion: `answered`
- Terminal decision: `keenan_allen_ind_signing_v0_requires_data_followup`
- Authority state: `unpromoted`
- Downstream authority: `none`
- Reportability: `internal`
