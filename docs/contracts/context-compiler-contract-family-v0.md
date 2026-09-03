# Context Compiler candidate contract family v0 (`research-context-compiler-*/v0`)

Status: **draft Research contract-family freeze — candidate design, not adopted,
not activated**. Prepared for
[TIBER-Research issue #15](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15)
R2 and submitted for operator review and independent exact-head review under the
existing protocol, following the additive draft-contract precedent of
[`event-shock-packet-extensions-v0.md`](event-shock-packet-extensions-v0.md) and
[`agent-thesis-proposal-v0.md`](agent-thesis-proposal-v0.md).

This document is:

- candidate Research design;
- not adopted production schema;
- not implementation authority;
- not fixture-freeze authority;
- not R3 activation;
- not an adoption of the TIBER-Fantasy application-layer production placement,
  which remains a recommendation awaiting a separate operator decision;
- not Ops #67 completion — that audit retains ownership of the broader
  brought-agent capability vocabulary and lineage/precedent traversal;
- not an adoption of the authority-inert availability-witness packet, W4, or
  W5 in any part.

TIBER-Research owns candidate contract design and experiment custody. Upstream
repositories retain ownership of the semantics of every claim they assert.
Nothing in this document authorizes a live run, source acquisition, provider
execution, credential use, spending, deployment, promotion, Shared Reality
mutation, fantasy action, or any downstream authority. Merging it adopts a
**candidate**, not a production contract.

Base evidence for this freeze: TIBER-Research
`4170145bb71e7943bbe10a4ab0e009610bbed582`, whose repository-native primitives
are reused throughout: `schemas/v0/common.schema.json`
(blob `98b785f382b770f1631501a951267e4aa9c21609`),
`schemas/v0/source-metadata.schema.json`
(blob `58e113024b69bf514a8fb2fa9b3fc55fdcad72f6`),
`schemas/v0/packet.schema.json`
(blob `f0e58921900a8a190f8e179d22e98a8fe3842f0a`),
`schemas/v1/freshness-policy.schema.json`
(blob `cdaa8e1a6199522a82f8dbe93d31195e284543b2`),
`schemas/v1/observation-policy.schema.json`
(blob `e3cca441ac367b232f809dd917a0f0e366bc8305`),
`schemas/v1/governed-artifact-provenance-receipt.schema.json`
(blob `0904ea84422afdb42e75a61a716f2a1e11c3f85a`),
`src/canonical.ts` (blob `0cd1dd2570362f96b46865ceaaefe751e65f3910`), and
`src/digest.ts` (blob `88480e7cde00441c2cbd9d853a53db6fbf1745dd`).

---

## 1. Purpose

The family defines how a context compiler assembles governed football evidence
into a compact agent-facing packet plus replayable custody records, such that:

- every released statement is an actual attributable assertion (`ClaimV0`)
  and every absence is a typed result (`EvidenceResultV0`), never a fabricated
  claim;
- observed, derived, forecast, operator, and agent material remain
  structurally distinct and cannot launder into one another;
- private operator context is released only under an exact path-valid scope
  match (§8), with existence-safe behavior everywhere one principal could
  probe another's state;
- every release decision is bound to the exact claim, caller, request, and
  policy it evaluated — and, wherever rights govern the material, to the
  exact governing rights-disposition content (§5.6), never merely its
  locator;
- every digest uses the repository-native procedures; and
- compilation, continuation, and evaluation form a one-way, replayable
  lifecycle.

## 2. Repository-native reuse and composition rules

1. **Exact `$ref` reuse.** Native `$defs` and schemas are reused by exact
   reference and never restated, forked, extended inline, or renamed. A closed
   native schema (`additionalProperties: false`) is reused byte-valid; every
   family addition lives in sibling wrapper fields beside the native member,
   never inside it.
2. **Instance identity.** Instances carry a single `schema_version` string
   const naming family and version (for example
   `"research-context-compiler-claim/v0"`), following the native
   `research-*/v0` pattern. There is **no instance-level `schema_id`**; `$id`
   belongs to JSON Schema documents only. `schema_version` is included in
   every digest projection, so version substitution under an unchanged digest
   is impossible.
3. **Digest procedures.** The native `common#/$defs/digestMode` contains
   exactly two values, and only those two are digest modes in this family:
   - `tiber-canonical-json-v1` — canonical structured JSON
     (`src/canonical.ts`): JSON data model only; object member names sorted in
     ascending UTF-16 code-unit order at every depth; array order preserved;
     ECMAScript number serialization with `-0` normalized to `0`; rejects
     non-finite numbers, sparse arrays, `undefined`, `bigint`, functions,
     symbols, non-plain objects, and cycles; UTF-8 output without a BOM;
     hashed with SHA-256.
   - `tiber-raw-sha256-v1` — hash of exact bytes.
   The digest representation is always the native `sha256:<64 lowercase hex>`
   (`common#/$defs/digest`); the procedure is identified by the native
   `common#/$defs/digestMode` **beside** the digest (§4). No other prefix,
   profile name, or representation exists in this family.
   `tiber-json-file-v1` is **not a digest mode**: it is the repository's
   governed JSON serialization/file-form conformance rule (sorted keys,
   `JSON.stringify(value, null, 2)`, exactly one trailing LF).
4. **Governed JSON file claims.** A governed JSON fixture file carries two
   digests — its semantic canonical digest (`tiber-canonical-json-v1`) and
   its exact file-byte hash (`tiber-raw-sha256-v1`) — plus a **separate
   file-form conformance result** recording whether the bytes satisfy
   `tiber-json-file-v1`. The two digests and the conformance claim are three
   distinct statements and are never collapsed, and the conformance result is
   never represented as a digest value or a `digestMode`.
5. **Vocabulary reuse.** `safeId`, `nonEmptyString`, `relativePath`,
   `timestamp`, `nullableTimestamp`, `ownerRepository`, `freshnessState`,
   `admissibilityState`, `reportability`, `retentionMode`, `replayability`,
   `digest`, `digestMode`, `artifactDigest`, the source-metadata `locator`,
   `source_class`, `directness`, `temporal`, `revision`, and
   `rights_disposition_ref` are used exactly as defined at the base evidence
   blobs. The claim-level epistemic vocabulary is the packet-level
   `epistemic_class` enum — the seven common values plus `forecast`, per the
   event-shock extension.

## 3. Shape inventory — exactly twelve named shapes

Shared sub-objects:

1. `ClaimV0`
2. `EvidenceResultV0`
3. `ConflictSetV0`
4. `ReleaseDecisionV0`
5. `ReleasedEntryV0`
6. `ReleasedClaimMetadataV0`
7. `DigestBindingV0`

Top-level contracts:

8. `TiberAgentContextPacketV0`
9. `ContextCompilationTraceV0`
10. `TiberOperationManifestV0`
11. `AgentContinuationTraceV0`
12. `AgentContinuationEvaluationV0`

## 4. `DigestBindingV0`

Composition over native primitives; not a competing procedure:

```text
DigestBindingV0:
  digest_mode: common#/$defs/digestMode    # exactly tiber-canonical-json-v1
                                           # or tiber-raw-sha256-v1; no other
                                           # value exists (tiber-json-file-v1
                                           # is a file-form conformance rule,
                                           # never a digest_mode)
  digest:      common#/$defs/digest        # sha256:<64 lowercase hex>
```

Usage rule: `DigestBindingV0` is used for every content/self/object digest —
`claim_digest`, `payload_digest`, `result_digest`, `conflict_set_digest`,
`decision_digest`, `decision_input_digest`, `request_scope_digest`,
`request_identity_digest`, `metadata_projection_digest`, `packet_digest`,
`source_set_digest`, `compilation_trace_digest`, `manifest_digest`,
`trace_digest`, `evaluation_digest`, and the `content` form of
`rights_disposition_binding` (§5.6). The native `artifactDigest`
(`{artifact_type, path, digest, digest_mode}`) is used **only** where an
artifact type and repository-relative path genuinely exist (policy references,
receipt `governing_authority_ref`/`governing_manifest_ref`, trace snapshot
references to governed files, the `governed_artifact` form of
`rights_disposition_binding`). Self-digests never impersonate
`artifactDigest`.

Every self-digested shape's digest covers its canonicalized instance under
`tiber-canonical-json-v1` **excluding exactly its own digest field** and
including its `schema_version` const. Required fields are always present
(`null` is a value, never an encoding shortcut); optional fields are present
with a value or entirely absent (absence = not asserted); the canonical
procedure's own rejections (no `undefined`, non-finite numbers, etc.) apply to
every instance.

## 5. `ClaimV0` — an actual attributable assertion

A `ClaimV0` exists only when a real asserting party actually asserted
something. Absence states never appear as claims (§6).

### 5.1 Identity and content

- `schema_version`: `"research-context-compiler-claim/v0"` (const).
- `claim_id`: `safeId`, packet-unique (§12.2).
- `entity_ref`: `{canonical_id: safeId | null, source_native_id:
  nonEmptyString | null, display: nonEmptyString, identity_status:
  resolved | ambiguous | unresolved, resolution_method: safeId}` —
  `resolution_method` required iff `resolved`; ambiguous/unresolved require
  `canonical_id: null`.
- `asserter`: the party that actually asserted **this claim's `assertion`**,
  verbatim — `{party: nonEmptyString, repository: ownerRepository | absent,
  role: original_asserter | output_producer}`. Always real; never invented;
  never a blend of parties. `role` is total and mechanically determined by
  `claim_production_class`:
  - every production class other than `compiler_derived` →
    `role: original_asserter`, and `party` is the original asserting
    party/lane verbatim;
  - `compiler_derived` → `role: output_producer`, and `party` is exactly
    `derivation.transformer.transformer_id` (with `repository` the
    compiler's owning repository where one exists). A value the compiler
    assembles from separately asserted inputs was asserted by the compiler,
    not by any input party; naming an input party as the asserter of the
    composite value is contract-invalid (V11). Every input's own verbatim
    top-level `asserter` object — `original_asserter` for a non-derived
    input, `output_producer` for a derived input — is preserved on its
    `derivation.inputs[]` edge and is citable only as an input, never as
    the asserter of the derived value.
- `compiler_chain[]`: ordered transformer records `{transformer_id: safeId,
  version: nonEmptyString}`. A step that produces no new asserted value never
  changes `asserter`; a step that does produce one is a derivation, and the
  resulting `compiler_derived` claim names that step's transformer as its
  `output_producer` while every input asserter survives on its derivation
  edge.
- `derivation` — required iff `claim_production_class: compiler_derived`,
  absent otherwise. The inline input-edge structure that makes every
  derivation fully traversable (it is a claim substructure, not a new shape;
  the twelve-shape inventory is unchanged):

  ```text
  derivation:
    transformer: { transformer_id: safeId, version: nonEmptyString }
                 # the compiler_chain step applying to these inputs; the
                 # derived claim's asserter names this transformer
                 # (role: output_producer)
    inputs[]  (one or more), each:
      { input_kind:   claim | source_object,
        claim_ref:    { claim_id:          safeId,
                        claim_locator_ref: <native source-metadata locator
                                            {kind, value}>,
                        locator_pin:       <claim-locator pin — see the
                                            claim-locator rule below> }
                 # required iff input_kind = claim, absent otherwise: the
                 # input ClaimV0's own stable identifier plus an immutable,
                 # historically retrievable locator (the same rule
                 # reference-form entries obey, §10.1) — it names the
                 # input claim itself, never merely its underlying
                 # source object
        input_digest: DigestBindingV0,
                 # the input's immutable claim_digest, or the governed
                 # source/object content digest
        asserter:     <the input's verbatim top-level asserter object:
                       original_asserter for a source object or a
                       non-derived claim; output_producer for a derived
                       input claim — copied, never rewritten to an
                       earlier upstream party>,
        binding:      <the input's applicable source_binding, or its
                       governed locator {kind, value}>,
        role:         safeId }   # e.g. component_vector, scoring_contract
  ```

  **Claim-locator rule** — one rule for every claim locator in the family
  (`claim_ref.claim_locator_ref` here and `claim_locator_ref` in
  reference-form entries, §10.1). The native locator is reused unmodified;
  the sibling `locator_pin`, tagged by the locator's native `kind`, makes
  the reference immutable **and** historically retrievable:

  ```text
  locator_pin:
    kind = immutable_object  → { pin: immutable_object }
        # value names exactly one object in a governed write-once or
        # content-addressed store; the store's immutability is the
        # retrieval guarantee
    kind = repository_path   → { pin:        repository_revision,
                                 repository: ownerRepository,
                                 revision:   <exact immutable revision
                                              object id — a full commit
                                              object id, never a branch,
                                              tag, or "latest"> }
        # value is the relativePath read at exactly that revision
    kind = synthetic_fixture → { pin: repository_revision, repository,
                                 revision }   # fixture context only:
        # fixture claims are governed repository files; same pin
    kind = url               → rejected as a claim locator
        # an unversioned URL is mutable and outside custody; no pin
        # form exists for it
  ```

  Retrieval is exactly: the object named by `value` (`immutable_object`),
  or the file at `value` in `repository` at `revision`
  (`repository_revision`). An unpinned `repository_path`, a pin whose `pin`
  tag does not match the locator's `kind`, a `revision` that is not an
  exact immutable object id, or any `url` claim locator is contract-invalid
  (V12): a digest alone detects a changed target but cannot retrieve the
  historical `ClaimV0`, so the pin — not the digest — provides retrieval.
  No external digest index, snapshot store, or other persistence authority
  is introduced; derivation-time resolution, trace capture, replay, and
  recursive `inspect_lineage` all retrieve through this one rule.

  Rules: every input is bound by an immutable digest that already exists
  before the derived claim is constructed, so the edge set is acyclic by
  construction; each input preserves its own verbatim top-level `asserter`
  object and binding — **no composite or blended asserter is ever invented,
  no input party is ever named as the asserter of the derived value, and a
  nested derived input's `output_producer` is never replaced by an earlier
  upstream party**: the derived claim's top-level `asserter` is its
  `derivation.transformer` as `output_producer`, and every contributor is
  preserved on its input edge exactly as that input's own claim states it;
  one input and many inputs use the same structure. **Resolvable lineage:**
  a digest verifies an input only once the input is found, so every `claim`
  input additionally carries `claim_ref` — its `claim_id` and a pinned
  `claim_locator_ref` that retrieves exactly one immutable `ClaimV0` under
  the claim-locator rule. At derivation time, before the derived claim is
  constructed, the compiler retrieves each `claim_ref` through its pin,
  applies §10.2 checks 1–3 (retrieve, recompute the digest and verify it
  equals `input_digest`, verify `claim_id` equality), verifies that the
  edge's `asserter` equals the retrieved claim's verbatim top-level
  `asserter` object (V11), and records that verification in the
  compilation trace (§13); a claim input that cannot be retrieved, or
  retrieves to a different digest, id, or asserter, is contract-invalid
  (V12/V11). `claim_id` is only packet-unique (§12.2) and never identifies
  an input on its own: the pinned locator retrieves, the digest verifies.
  A multi-hop derivation — a derived claim consuming a derived claim — is
  therefore traversable by an `inspect_lineage`-class operation without
  any external digest index: walk `derivation.inputs[]`, retrieve each
  `claim_ref` through its pin, verify it against `input_digest`, and
  recurse into the retrieved claim's own `derivation` until every leaf is
  a `source_object` input or a non-derived claim; at every hop the edge
  reports the consumed claim's own `asserter` (its `output_producer` where
  it is itself derived). DST-01's named external component vector plus the
  observed league scoring contract are two such edges under one
  `output_producer`.
- `assertion`: `{payload_contract_ref: nonEmptyString (id+version of the
  payload shape, owned by the asserting/owning lane; for external material a
  declared contract carrying payload_validation: not_performed |
  validated{validator_ref}), payload: <plain parsed-JSON value> | null,
  units_ref: nonEmptyString | null, payload_digest: DigestBindingV0 | null}` —
  `payload_digest` required whenever `payload` is non-null and whenever
  `retention_mode = reference_only` releases identity without content.
- `retention_mode`: native `retentionMode`
  (`full | excerpt | derived_only | reference_only`) — what this claim
  instance carries. Payload withholding at release time is achieved by the
  reference form of `ReleasedEntryV0` (§10), never by emitting a modified
  claim.
- `reportability`: native `reportability` — the per-object classification;
  release decisions (§9) never reclassify it.
- `claim_digest`: `DigestBindingV0` (§4 projection rule). The claim projection
  is caller-invariant: **no release-decision field of any kind appears in
  `ClaimV0`**.

### 5.2 Structural and epistemic axes

- `context_layer` ∈ `observed | derived | forecast | operator | agent` —
  **structural placement only** (which packet section and non-ingestion rules
  apply). It is not an epistemic vocabulary and does not redefine the native
  one.
- `epistemic_class` ∈ `observed | calculated | inferred | forecast |
  hypothesis | speculative | contradicted | unknown` — the packet-level
  native vocabulary, used with its native meanings.
- `claim_origin_class` ∈ `tiber_governed_source | forecast_model |
  external_asserter | operator | agent | synthetic_fixture` — the identity of
  the **original claiming party/lane**. Genuinely new: no native primitive
  names who originally asserted a claim; native `source_class` classifies
  source-object **custody** and is bound separately (§5.3). Immutable through
  `compiler_chain`. On a `compiler_derived` claim it classifies the origin
  lane of the recast **input material**, never the compiler (which
  `asserter` names as `output_producer`): where the inputs' origin classes
  differ, the derived claim carries `external_asserter` if any input is
  external material, else `forecast_model` if any input is forecast
  material, else `tiber_governed_source`.
- `claim_production_class` ∈ `source_direct | compiler_derived |
  operator_entry | agent_generated | fixture_construction` — how the current
  claim object was produced. A deterministic recast of named external inputs
  is permanently `{claim_origin_class: external_asserter,
  claim_production_class: compiler_derived, context_layer: derived}` with full
  lineage; it never becomes observed and later adoption reclassifies nothing.

### 5.3 Tagged native source binding

```text
source_binding:
  { applicable: true,
    source_ref: <reference to a complete research-source-metadata/v0
                 instance, reused by exact $ref — carrying the NATIVE
                 source_class, directness, locator, admitted + admissibility,
                 rights_disposition_ref + limits, replayability, temporal,
                 and revision members unmodified> }
| { applicable: false, reason: safeId }
```

A native source object is never fabricated. Honest representations:

- **Unadmitted external candidate**: `claim_origin_class: external_asserter`,
  real `asserter`, admission `{applicable: true, state: unresolved}` (§5.6),
  `source_binding: {applicable: false, reason:
  external_candidate_unadmitted}`. It never carries
  `source_class: admitted_external_source`; a native source object binds only
  when a governed intake actually admits one.
- **Operator hypothesis**: `claim_origin_class: operator`,
  `claim_production_class: operator_entry`, `source_binding: {applicable:
  false, reason: operator_hypothesis_no_source_object}`. The native
  `operator_provided_observation` custody class remains reserved for genuinely
  admitted operator observations, where a real source object binds.
- **Agent material**: `claim_origin_class: agent`, `claim_production_class:
  agent_generated`, `source_binding: {applicable: false, reason:
  agent_generated_no_source}` — continuation traces only (§7 V9).
- **Forecast assertion**: `claim_origin_class: forecast_model` carries the
  Forecast distinction; its applicable binding uses the native custody class
  `governed_tiber_artifact`.
- **Synthetic fixture**: `claim_origin_class: synthetic_fixture`; binding
  applicable with native `source_class: synthetic_fixture` and the native
  forced-const pattern when a fixture source object exists, else
  `{applicable: false, reason: fixture_construction}`. Synthetic material is
  always visibly synthetic and authority-inert (`fixture_only` ceiling).

### 5.4 Clocks

Ten independently nullable clocks plus native revision identity. Native fields
are reused with exact native names and meanings; the two new clocks fill
representational gaps the native `temporal` block cannot express:

| Clock | Status | Meaning |
| --- | --- | --- |
| `event_time` | native | time of the underlying event or state described |
| `effective_at` | native | when the asserted state takes semantic effect |
| `source_generated_at` | new | when the asserting source generated its artifact or statement — never collapsed into event, effective, publication, availability, retrieval, or custody time |
| `source_revised_at` | new | the source's native revision clock, only where one genuinely exists; a missing native clock is a recorded source property, never manufactured |
| `published_at` | native | source-claimed publication |
| `source_available_at` | native | source-claimed first retrievability |
| `retrieved_at` | native | actual retrieval — **never orders or freshens an assertion** |
| `first_observed_at` | native | first governed custody observation |
| `admissible_at` | native | admission instant |
| `cutoff_at` | native | cutoff used for eligibility |

`revision {revision_id, supersedes_revision_id}` is reused verbatim on source
bindings; claims adopt the same pair pattern via `supersedes_claim_id`
(`safeId | absent`). Corrections append new claims; nothing edits.

### 5.5 Freshness — native member plus sibling evaluation

```text
freshness:            common#/$defs/freshness        # exactly {state, as_of}
freshness_evaluation: { policy_ref: artifactDigest,  # governed policy file →
                                                     # research-freshness-policy/v1
                        freshness_evaluated_at: timestamp,
                        clocks_considered: [safeId...],
                        missing_clock_rule_id: safeId }
```

The closed native `freshness` object is reused by exact `$ref` and never
extended; the evaluation record is a sibling. `state` uses the native
`freshnessState` (`current | stale | unresolved | not_applicable`);
"cannot be established" is `unresolved` (no other value exists for it). The
governed policy's own chronology, cutoff, and current-state rules govern the
evaluation; for governed TIBER artifacts the provenance receipt's freshness
block is the authoritative instance and this record documents how it was
evaluated. `effective_at` is a semantic clock and never substitutes for
`freshness_evaluated_at` or `retrieved_at`. Replays recompute the evaluation
from the same policy digest and clocks and must reproduce it byte-identically.

### 5.6 Admission, promotion, rights

- `admission`: `{applicable: true, state: common#admissibilityState
  (admitted | inadmissible | unresolved), rationale: nonEmptyString} |
  {applicable: false, reason: safeId}`. The native enum is reused unmodified —
  no `not_applicable` value is added; where admission genuinely does not
  govern (operator hypotheses, agent material), it is structurally absent with
  an explicit applicability reason. The native `admitted` boolean consistency
  rule (`admitted: true ⇔ state: admitted`) applies wherever the native
  admissibility block appears in a source binding.
- `promotion` ∈ `promoted | unpromoted | not_promotable` — promotion
  **status**, total over both source-binding arms:
  - `source_binding.applicable: true` → the claim's promotion capability
    must agree with the bound source object's native `promotable` boolean:
    `not_promotable ⇔ source_ref.promotable: false`; `promoted`/`unpromoted`
    require `source_ref.promotable: true`; `promoted` additionally requires
    `admission.state: admitted` (validation V4). Disagreement between the
    claim and its bound source object is contract-invalid.
  - `source_binding.applicable: false` (operator hypotheses, agent material,
    synthetic constructions, unadmitted external candidates) →
    `promotion: not_promotable` is the **only** permitted value; promoted
    and unpromoted require an applicable binding. An unadmitted external
    candidate can gain promotability only by a later governed intake that
    binds a real admitted source object — never by relabeling.
- `rights_observed` ∈ `documented_permission |
  terms_facially_restrict_declared_use | upstream_chain_unknown |
  no_terms_observed | not_applicable` — a typed **empirical** observation,
  genuinely new (the native `rights_disposition_ref` is the governing
  disposition pointer and `limits` are per-source strings; neither is a typed
  empirical state). The **governing** rights authority is bound totally,
  resolvably, and immutably via a tagged shape:

  ```text
  rights_authority:
    { applicable: true,
      rights_disposition_ref: <native nonEmptyString ref — the resolvable
                               reference to the governing disposition: via
                               the applicable source_binding's source
                               object (byte-equal to its native
                               rights_disposition_ref), or a directly bound
                               governed disposition where rights govern
                               material without a source object>,
      rights_disposition_binding:              # the EXACT governing content
        { form: governed_artifact,
          artifact: common#/$defs/artifactDigest }
                                   # the disposition is a governed
                                   # repository file: artifact_type, path,
                                   # digest, digest_mode
      | { form: content,
          content_digest: DigestBindingV0 } }
                                   # the disposition is not a governed file:
                                   # digest of the exact resolved
                                   # disposition content (tiber-raw-sha256-v1
                                   # over its exact bytes, or
                                   # tiber-canonical-json-v1 where the
                                   # disposition is a JSON value);
                                   # when the native ref is itself the
                                   # complete inline disposition text, the
                                   # content is that string's exact UTF-8
                                   # bytes under tiber-raw-sha256-v1
  | { applicable: false, reason: safeId }     # rights genuinely do not
                                              # govern (e.g. an operator's
                                              # own hypothesis)
  | { unresolved: true, reason: safeId }      # rights govern but no admitted
                                              # disposition exists (e.g. an
                                              # unadmitted external candidate)
  ```

  `rights_disposition_ref` retains the resolvable reference;
  `rights_disposition_binding` is a sibling family field (§2 rule 1 — the
  native member is reused unmodified) that binds the exact content the
  reference resolved to at claim construction. Both are required in the
  applicable arm (V10). Because `rights_authority` is a claim field, the
  binding is inside `claim_digest`; because it is an evaluated input of
  every release decision (§7), it is inside `decision_input_digest` and the
  released-metadata projection (§10.1). A disposition whose content changes
  at an unchanged reference therefore yields a different binding, hence a
  different claim (appended with `supersedes_claim_id`, never edited) and a
  different decision input — an earlier disclosure decision is never
  substitutable for it, and a decision replays only against the identical
  binding. Empirical observation (`rights_observed`), governing disposition
  (`rights_authority`), and per-request release decisions (§9) remain three
  distinct things. **Rights-authority compatibility (total):** an
  applicable `source_binding` binds a native source object that always
  carries a `rights_disposition_ref`, so `source_binding.applicable: true`
  requires `rights_authority.applicable: true` bound to it (V13);
  `unresolved` and `{applicable: false}` therefore occur only without an
  applicable source binding, where `promotion` is already
  `not_promotable` (above); an `external_asserter` claim never carries
  `{applicable: false}` — rights always govern external material, so its
  only non-applicable state is `unresolved` (V13). **Unresolved rights
  authority can never produce content disclosure or governed use**: with
  `rights_authority.unresolved`, `ReleaseDecisionV0.decisions.payload`
  cannot be `allow` for externally sourced content, S1 mechanically removes
  `consume_canonical` and `derive_governed` whatever admission, promotion,
  or any other set permits, and S5 refuses any derivation that consumed
  such an input (§9). What remains is explicitly non-governed handling —
  citation with authority fields, reference-only inspection, and
  run/scope/fixture-bounded use as the other sets allow — never admitted
  governed use.
- `privacy_scope`: `public | operator_private{principal_subject_ref,
  workspace, league | null, roster | null, player | null}` — scope only.
  `principal_subject_ref` is required for operator-private claims: under the
  local substrate it is the explicit `{workspaceId, operatorId}` pair; under a
  future authenticated path, the governed principal identity. Two principals
  sharing a workspace are always distinguishable. Refusal of
  non-representable inputs is a boundary handling disposition (§6), not a
  privacy scope.
- `conflict_state` ∈ `none | conflicted` (§11).
- `authority_ceiling` ∈ `shared_consumable | research_custody_only |
  operator_local_only | fixture_only | external_reference_only` — closed and
  total.

### 5.7 Provenance compatibility matrix

Combinations not listed are contract-invalid:

| context_layer | epistemic_class | claim_origin_class | claim_production_class | source_binding |
| --- | --- | --- | --- | --- |
| observed | observed | tiber_governed_source | source_direct | applicable · governed_tiber_artifact |
| observed | observed | external_asserter (admitted) | source_direct | applicable · admitted_external_source |
| observed | observed | operator (admitted observation only) | source_direct | applicable · operator_provided_observation |
| derived | calculated \| inferred | tiber_governed_source \| forecast_model \| external_asserter (per the §5.2 input-material rule) | compiler_derived | applicable (inputs' custody) or not-applicable with reason; `asserter` is the transformer as `output_producer`; every input asserter, `claim_ref`, and lineage always survive on the derivation edges |
| forecast | forecast | forecast_model | source_direct | applicable · governed_tiber_artifact |
| operator | hypothesis \| speculative | operator | operator_entry | not-applicable · operator_hypothesis_no_source_object |
| agent | hypothesis \| speculative \| inferred \| unknown | agent | agent_generated | not-applicable · agent_generated_no_source (traces only) |
| any (fixture context only) | per mimicked value | synthetic_fixture | fixture_construction | applicable · synthetic_fixture (native consts) or not-applicable · fixture_construction |

Deterministic validation (reject = contract-invalid): **V1** origin
operator/agent with `context_layer: observed`; **V2** `compiler_derived` with
`context_layer ≠ derived`; **V3** synthetic origin/production outside
`fixture_only` ceiling or carrying `promotion: promoted`; **V4**
`promotion: promoted` without `admission.state: admitted`; **V5**
operator-private material released without an exact path-valid scope match
(§8); **V6**
any conflict alternative not passing full per-claim release (§11); **V7**
`context_layer: forecast` with origin ≠ forecast_model or admission ≠
admitted; **V8** a substantive/native value supplied inside an
`{applicable: false}` arm, or a required substantive value missing from an
`{applicable: true}` arm — an applicable-true value is itself valid; **V9** `context_layer: agent` in any compiler-emitted packet;
**V10** `rights_authority.applicable: true` without both
`rights_disposition_ref` and `rights_disposition_binding`, a
`rights_disposition_ref` that differs from the bound source object's native
value under an applicable `source_binding`, or a binding whose digest does
not equal the recomputed digest of the resolved disposition content (§5.6);
**V11** `asserter.role: output_producer` on any claim other than
`compiler_derived`, `role: original_asserter` on a `compiler_derived` claim,
a `compiler_derived` claim whose `asserter.party` differs from
`derivation.transformer.transformer_id`, or a `derivation.inputs[]` edge
whose `asserter` is not the retrieved input claim's verbatim top-level
`asserter` object (an `original_asserter` substituted for a nested derived
input's `output_producer` included); **V12** a `derivation.inputs[]` edge
with `input_kind: claim` lacking `claim_ref`, carrying `claim_ref` with
`input_kind: source_object`, whose `claim_ref` violates the §5.1
claim-locator rule (unpinned `repository_path`, pin/kind mismatch,
non-immutable `revision`, or a `url` locator), or whose `claim_ref` fails
to retrieve a claim with digest equal to `input_digest` and id equal to
`claim_ref.claim_id`; **V13** `source_binding.applicable: true` with
`rights_authority` other than `{applicable: true}`,
`rights_authority.{applicable: false}` on a claim with
`claim_origin_class: external_asserter`, `rights_authority.unresolved` with
`promotion` other than `not_promotable`, or a `compiler_derived` claim
whose derivation consumed an input whose permitted-use intersection (§9)
lacked `derive_governed` at derivation time — every input with
`rights_authority.unresolved` included.

## 6. `EvidenceResultV0` — the per-request result envelope

`schema_version`: `"research-context-compiler-evidence-result/v0"`.

Represents the outcome of one requested operation/domain. Absence is a
**result**, never a fabricated claim with an invented asserter.

- `request`: `{operation_id: safeId, operation_version: nonEmptyString,
  requested_domain: safeId, scope_echo: <verified-scope summary only — never
  caller-raw coordinates>}`.
- `result_state` — **closed vocabulary**:

```text
fulfilled | fulfilled_partial | no_witness_known |
candidate_witness_unadmitted | source_required |
implemented_no_current_artifact | unavailable | rights_withheld |
conflict | not_found | refused_non_representable | reference_unverifiable
```

- `reason_codes[]`: mandatory whenever `result_state ≠ fulfilled`.
- `claims[]`: zero or more `ReleasedEntryV0` (§10); permitted only for
  `fulfilled | fulfilled_partial | conflict | candidate_witness_unadmitted`.
  A `candidate_witness_unadmitted` result may carry real unresolved-admission
  claims whose own release decisions allow the disclosure; the S-intersection
  (§9) governs their permitted uses, and S1 mechanically excludes
  `consume_canonical` and `derive_governed` for their unresolved admission
  and unresolved rights authority alike — they are inspectable and citable
  as unadmitted candidates, never governed inputs.
- `conflict_ref`: an embedded `ConflictSetV0` or its `DigestBindingV0`
  reference; present iff `result_state: conflict`.
- `omission_refs[]`: compilation-trace pointers for per-claim/per-alternative
  withholding — **never emitted on the private-generic path**.
- `result_digest`: `DigestBindingV0`.

`not_found` is the single generic, existence-safe result (§8).
`refused_non_representable` carries generic text only, with no storage or echo
of the refused input. `reference_unverifiable` is the typed fail-closed result
when correspondence verification (§10.2) fails; the trace binds the failed
verification record, and existence-safety overrides it to generic `not_found`
wherever specificity would leak private existence.

## 7. `ReleaseDecisionV0` — bound, replayable, non-substitutable

`schema_version`: `"research-context-compiler-release-decision/v0"`.

```text
subject_claim_digest:     DigestBindingV0     # the exact claim evaluated
request_scope_digest:     DigestBindingV0     # effective caller-scope object (§8)
request_identity_digest:  DigestBindingV0     # {operation_id,
                                              #  operation_version,
                                              #  requested_domain,
                                              #  decision_scope,
                                              #  request_scope_digest,
                                              #  transport_channel,
                                              #  scope_verification}
transport_channel:        http_public | local_stdio | internal | remote_future
scope_verification:       none | declared_unauthenticated | server_authenticated
rights_observation_refs[] + rights_observation_digest: DigestBindingV0
evaluated_inputs:         { admission (tagged), promotion,
                            rights_authority (tagged — the governing
                            disposition's resolvable ref AND its immutable
                            rights_disposition_binding, not only the
                            empirical observations), privacy_scope
                            (incl. principal_subject_ref), authority_ceiling,
                            claim_origin_class, claim_production_class,
                            source_binding applicability (+ native
                            source_class when applicable) }
decision_input_digest:    DigestBindingV0 over the canonical object containing
                          subject_claim_digest, request_scope_digest,
                          request_identity_digest, transport_channel,
                          scope_verification, rights_observation_digest, and
                          evaluated_inputs
disclosure_policy_ref:    artifactDigest      # governed policy file
disclosure_evaluated_at:  timestamp
decisions:                { payload:   allow | withhold,
                            metadata:  allow | withhold,
                            retention: {permitted: false} |
                                       {permitted: true,
                                        mode: common#retentionMode},
                            logging:   log_metadata_only | log_none,
                            existence: specific | generic }
reason_codes[]
decision_digest:          DigestBindingV0
```

Rules: a decision presented with a mismatched subject, scope, or request
identity is contract-invalid — decisions cannot be substituted across claims,
callers, operations, or domains; the only exception is an equivalence class
the disclosure policy explicitly defines and the decision explicitly binds by
reference and digest. `payload: allow` with `metadata: withhold` is
contract-invalid (payload without the metadata preserving identity, the
claim's own `asserter` and every derivation-edge asserter, authority, and
lineage is never releasable). `metadata: withhold`
means no entry is emitted. `existence: generic` forces the §8 generic path.
Retention composes with the native `retentionMode`; the native enum is
unforked. Empirical rights observations and the governing `rights_authority`
binding (§5.6) — reference and `rights_disposition_binding` together —
are both evaluated inputs, carried inside `evaluated_inputs` and therefore
inside `decision_input_digest`; the five decisions are per-request outputs;
the claim's own `reportability` and rights fields are unchanged by any
decision. With `rights_authority.unresolved`, `decisions.payload` cannot be
`allow` for externally sourced content. **Rights-sensitive replay:** a
replay recomputes `decision_input_digest` from the claim's bound
`rights_disposition_binding`, never from a fresh dereference of
`rights_disposition_ref`; a replay that resolves the reference and finds
content whose digest differs from the binding must report the decision as
non-replayable against current authority, and a decision computed under the
earlier binding is never presented for the superseding claim (the
non-substitution rule above).

**One-way lifecycle:** (1) `claim_digest` is computed with no release-decision
field of any kind; (2) the decision is computed referencing the claim digest
and evaluated inputs; (3) claim (or reference) and decision are placed
together in a `ReleasedEntryV0` inside an `EvidenceResultV0`; (4)
`result_digest` is computed. Claim ← decision ← entry ← result ← packet, with
no cycle.

## 8. Release paths and existence safety

**Effective caller scope:** one neutral resolved scope object,
`{principal_or_declared_subject, scope_verification, workspace, league,
roster, player}`, with exactly two non-interchangeable origins. On **Path L**
it is assembled by the local stdio transport from **declared** coordinates
and marked `declared_unauthenticated` — nothing about it is authenticated or
verified. On **Path S** it is produced by the transport's authentication
layer: an authenticated, server-derived principal, membership, and resource
scope. The words "authenticated" and "verified" describe Path S only.
`scope_verification` cannot be set by any caller-supplied coordinate, header,
or field, on either path.

**Path L — `declared_local_operator`.** Local stdio transport only.
Coordinates (`workspaceId`, `operatorId`) are accepted, **not authenticated**,
and establish no tenant membership; the packet records
`scope_verification: declared_unauthenticated` and `trust_assumption:
single_local_operator_process`. Path L releases operator-private claims whose
`{principal_subject_ref, workspace}` exactly match the declared coordinates —
valid only under that recorded process-local assumption. Path L never
satisfies the authenticated-workspace boundary and never supports remote or
multitenant claims; a non-stdio transport presenting Path L is
contract-invalid.

**Path S — `server_authenticated`.** Authenticated principal, governed
workspace membership, and exact authorized resource scope, all derived
server-side. Required before any private remote or multitenant use.

**Existence-safe generic result.** Wherever one principal could probe another
principal's state — always on Path S, on every public-channel private-domain
request, and on Path L whenever declared coordinates mismatch stored private
scope — the response is the single generic `EvidenceResultV0` with
`result_state: not_found`: byte-identical in shape for
exists-but-unauthorized and does-not-exist; no claims, no conflict ref, no
omission refs, no private claim id, digest, source reference, lineage, or
private-specific reason code. **No null `ClaimV0` shell is ever emitted.**
Payload disclosure, metadata disclosure, retention, logging, and existence
disclosure are five independent controls (§7); rights or privacy prohibitions
may bind at the metadata level, withholding identifiers, references, digests,
and lineage — not merely payload.

**Non-representable inputs:** league-chat content; coercive, psychological,
or private-incident material; credentials; hidden chain of thought; and
manager/account/chat identifiers **inside evidence payloads, fixtures,
narratives, or logs** are refused at intake with no storage or echo, in
every scope. This does not conflict with the governed scope identifiers the
paths themselves require: `operatorId`, `principal_id`, and
`principal_subject_ref` may exist **only** in the effective caller-scope
envelope and the private storage binding, governed by the §7
disclosure/logging decisions — they never appear in public-profile logs or
evidence payloads. Caller-supplied identifiers never establish authenticated
identity and never select Path-S state.

## 9. Permitted use — the S1–S6 intersection

Permitted use is the intersection of six independently computed subsets of
`U = {consume_canonical, derive_governed, cite_with_authority_fields,
inspect_reference_only, use_within_run, use_within_scope,
use_in_fixture_context}`. An empty intersection is an explicit refusal with
reason codes naming every emptying set. No first-match ordering exists;
ceilings can never be bypassed.

**S1 — admission/promotion/rights authority:** admitted+promoted → full U;
admitted+unpromoted/not_promotable → U −
{consume_canonical, derive_governed}; unresolved → U −
{consume_canonical, derive_governed}; inadmissible → ∅;
admission `{applicable: false}` → U − {consume_canonical, derive_governed}.
Then, mechanically and unconditionally, `rights_authority.unresolved`
(§5.6) removes {consume_canonical, derive_governed} from whatever the
admission/promotion step produced; no admission state, promotion status, or
other set restores them. Unresolved rights authority leaves only
non-governed handling (citation with authority fields, reference-only
inspection, and run/scope/fixture-bounded use as the other sets allow) and
never becomes admitted governed use.

**S2 — authority ceiling:** shared_consumable → full U;
research_custody_only → {use_within_run, cite_with_authority_fields,
inspect_reference_only}; operator_local_only → {use_within_scope,
cite_with_authority_fields, inspect_reference_only}; fixture_only →
{use_in_fixture_context, inspect_reference_only}; external_reference_only →
{cite_with_authority_fields, inspect_reference_only}.

**S3 — privacy/scope:** public → full U; operator_private with an exact
path-valid scope match (per the active path's §8 rules) →
{use_within_scope, cite_with_authority_fields, inspect_reference_only};
mismatch → ∅ (and the generic path emits nothing).

**S4 — disclosure decision:** payload allow + metadata allow → full U;
payload withhold + metadata allow → {cite_with_authority_fields,
inspect_reference_only}; metadata withhold → ∅ and no entry emitted;
payload allow + metadata withhold → contract-invalid.

**S5 — origin/production:** (tiber_governed_source | external_asserter |
forecast_model, source_direct) → full U; (any valid, compiler_derived) →
full U, which is well-formed only because every input's own S1–S6
intersection contained `derive_governed` at derivation time — a derivation
that consumed an input lacking it, any input with
`rights_authority.unresolved` included, is contract-invalid (V13) and no
such derived claim exists;
(operator, operator_entry) → {use_within_scope, cite_with_authority_fields,
inspect_reference_only}; (agent, agent_generated) →
{cite_with_authority_fields, inspect_reference_only}; (synthetic_fixture,
fixture_construction) → {use_in_fixture_context, inspect_reference_only}.

**S6 — metadata completeness:** complete verified attribution set
(`asserter` with its `role`, entity_ref, claim_origin_class,
claim_production_class, admission, promotion, authority_ceiling, clocks per
nullability, complete freshness
member + evaluation, compiler_chain or governed digest-bound reference, and —
for `claim_production_class: compiler_derived` — the complete `derivation`
input-edge set of §5.1) → full U; verified id/digest/locator/layer but incomplete attribution →
{inspect_reference_only}; unverifiable, prohibited, or mismatched → ∅ and no
entry emitted. A claim id, digest, and locator alone never qualify as
attributable citation metadata. `cite_with_authority_fields` on a
`compiler_derived` claim cites the derived value as the statement of its
`output_producer`; the input asserters on its derivation edges are citable
only as inputs to that derivation, never as asserters of the composite
value, and a nested derived input is cited as its own `output_producer`'s
statement, never as an earlier upstream party's.

Invariants: no admission state bypasses any ceiling; unresolved admission
never gains `derive_governed`; private scope always intersects; flipping
`promotion` alone between promoted and unpromoted (admission held admitted,
`rights_authority` held applicable) changes the final set by exactly
{consume_canonical, derive_governed} — the mechanical CA-01 check;
`rights_authority.unresolved` (§5.6) never yields payload disclosure of
externally sourced content and — mechanically, via S1 — never yields
`consume_canonical` or `derive_governed`, whatever admission, promotion, or
any other set permits; an `external_asserter` claim never carries
`rights_authority.{applicable: false}` (V13).

## 10. `ReleasedEntryV0` and `ReleasedClaimMetadataV0`

### 10.1 Released entry (used identically by `EvidenceResultV0.claims[]` and `ConflictSetV0.alternatives[]`)

```text
ReleasedEntryV0 (exactly one kind):
  common (both kinds, mandatory, must equal the underlying claim's values):
    claim_id · claim_digest: DigestBindingV0 · context_layer
    release_decision: ReleaseDecisionV0
  kind = "embedded":
    claim: <complete immutable ClaimV0>
    (permitted only when decisions.payload = allow AND metadata = allow)
  kind = "reference":
    claim_locator_ref: <native source-metadata locator {kind, value}>
    locator_pin:       <claim-locator pin under the §5.1 claim-locator
                        rule — immutable and historically retrievable>
    released_metadata: ReleasedClaimMetadataV0   (mandatory)
```

Payload withholding is achieved by choosing the reference form; a modified
claim is never emitted. Entries are covered by their container's digest and
carry none of their own.

`ReleasedClaimMetadataV0` (`schema_version:
"research-context-compiler-released-claim-metadata/v0"`) is the
deterministic, payload-free authorized projection
`project(ClaimV0, ReleaseDecisionV0)`: claim_id; claim_digest; entity_ref;
context_layer; epistemic_class; claim_origin_class; claim_production_class;
`asserter` with its `role` (for `compiler_derived`, the `output_producer`;
each derivation edge carries the consumed input's verbatim top-level
`asserter` object — `original_asserter` for a non-derived input,
`output_producer` for a derived input — and never substitutes an earlier
upstream party for a nested derived input's producer); compiler_chain
or its governed digest-bound reference; for
`claim_production_class: compiler_derived`, the `derivation` input edges of
§5.1 (transformer identity plus each input's kind, `claim_ref` with its
`locator_pin` where `input_kind: claim`, digest binding, asserter, binding,
and role — digests, identities, and pinned locators only, never input
payloads); the
complete clock set; the complete freshness member and evaluation; the
rights-observation state authorized for disclosure and the tagged
`rights_authority` binding including its `rights_disposition_binding`
(§5.6); admission (tagged);
promotion; authority_ceiling; reportability; the privacy classification
appropriate for the authorized response; payload_contract_ref; units_ref
where applicable; payload_digest only when its disclosure is authorized; and
`metadata_projection_digest: DigestBindingV0`. It contains no payload.

### 10.2 Correspondence verification (compile-time, fail-closed)

Before emitting any reference-form entry, the compiler must: (1) retrieve
the governed immutable claim through `claim_locator_ref` + `locator_pin`
under the §5.1 claim-locator rule (an unpinned, mismatched, or `url`
locator fails this check) — for governed TIBER
artifacts the resolution evidence is a
`research-governed-artifact-provenance-receipt/v1` instance under
`research-observation-policy/v1`; (2) recompute the resolved claim's digest
and verify it equals `claim_digest`; (3) verify claim_id equality; (4) verify
`context_layer` equality — a derived claim can never be indexed as observed;
(5) recompute the authorized projection and verify it equals
`released_metadata` field for field — for a `compiler_derived` claim this
includes recomputing each `derivation` input edge's digest binding, edge
asserter, and, for `claim` inputs, its `claim_ref` with `locator_pin`
(§5.1) against the resolved claim; (6)
recompute
`metadata_projection_digest`; (7) verify
`ReleaseDecisionV0.subject_claim_digest` equals the same claim digest. Every
verification is recorded in `ContextCompilationTraceV0` as a per-entry
`reference_verification` record (checks 1–7 results + evidence_ref; the
private-generic path records only that the generic rule fired). Any failure →
no entry, `result_state: reference_unverifiable` (or generic `not_found`
where existence safety requires). Entry-level fields are never trusted
without this verification. The identical rule applies to conflict
alternatives and context-layer indexes.

## 11. `ConflictSetV0`

`schema_version`: `"research-context-compiler-conflict-set/v0"`. Fields:
`conflict_set_id`, `subject {entity_ref, requested_domain}`,
`conflict_basis ∈ value | clock | source | authority`,
`alternatives[]` (each a `ReleasedEntryV0`), `conflict_set_digest:
DigestBindingV0`.

Rules: each alternative retains its own identity, asserter, layers, origin,
production, clocks, freshness, privacy, rights/disclosure disposition,
admission, promotion, ceiling, lineage, and retention; release authorization
runs independently per alternative **before** the set returns; the container
grants zero additional disclosure authority; a returned conflict must contain
**at least two distinct `claim_digest` values after release**, else it
degrades to the releasable content's ordinary result; an omitted alternative
leaves a trace-side omission reference where public rules allow, and the
whole result genericizes wherever omission shape would disclose private
existence. Conflicts are preserved, never merge-resolved.

## 12. `TiberAgentContextPacketV0`

`schema_version`: `"research-context-compiler-context-packet/v0"`.

### 12.1 Organization

- `results[]` — the primary structure, indexed by requested
  operation/domain; each entry one `EvidenceResultV0`. A claim has one
  packet-wide `claim_id ↔ claim_digest` identity and **may be referenced by
  multiple results**: at most one embedded occurrence exists per packet, and
  every other occurrence is exact reference-form reuse of the same identity
  (§12.2); the context-layer indexes list each identity once.
- **Context-layer indexes** — five deterministic lists of
  `{claim_id, claim_digest}` pairs (ordered by `claim_id`, byte-lexicographic)
  referencing released entries in `results[]`: the layer view without
  duplication, included in the packet digest. **The agent index is always
  empty in compiler-emitted packets** — the compiler has no ingestion channel
  for agent material, making non-ingestion structural.
- Header: `context_packet_id`, compiler id/version, `decision_scope`,
  `caller_scope` (channel; principal class; resolved scope bindings;
  `scope_verification`; Path L's recorded trust assumption where applicable),
  `generated_at`, `world_state_as_of | null` (never defaulted from
  `generated_at`), `known_unknowns[]` and `missing_witnesses[]` (each names
  what it would resolve; never a proxy invitation), `operation_manifest_ref` +
  `tool_manifest_digest: DigestBindingV0`, `authority_ceiling`,
  `prohibited_inferences[]` (minimum: schema-validity ≠ truth; retrieval ≠
  freshness; absence ≠ health; scenario ≠ forecast; link/manifest ≠
  capability; admission ≠ promotion; availability ≠ freshness;
  absence-result ≠ claim; container ≠ disclosure authority),
  `decision_owner: human`, `source_set_digest`, `packet_digest`.

### 12.2 Identity rules

Packet-wide, `claim_id ↔ claim_digest` is injective. The same immutable claim
may be referenced by multiple results — same id and digest, reference-form
reuse, never duplicated or mutated; at most one embedded occurrence per
packet. Each index lists a pair once; every indexed pair resolves through the
packet-wide mapping to at least one verified released entry, and every
entry's pair appears in exactly the index matching its `context_layer`.

### 12.3 `source_set_digest`

Entry tuple `{source_family: safeId, object_ref: nonEmptyString,
revision_ref: nonEmptyString | null, content_digest_mode:
common#digestMode, content_digest: common#digest}`. Empty-string
`revision_ref` is prohibited (reject at construction). Entries are sorted by
field-by-field comparison in tuple order, each field compared as UTF-8 byte
sequences with a type-aware rule: `null` sorts before any string. Exact
duplicate tuples collapse to one; same-ref/different-digest entries are
distinct and retained. Aggregate digest: `DigestBindingV0` with
`digest_mode: tiber-canonical-json-v1` over the sorted array. All other
arrays in the family are order-preserving. Source entries may additionally
carry the native `replayability` value.

## 13. `ContextCompilationTraceV0`

`schema_version`: `"research-context-compiler-compilation-trace/v0"`. The
replay/audit set retained outside the packet: request identity; compiler
id/version; exact source snapshot references (native `artifactDigest` for
governed files; `DigestBindingV0` for object digests; native `replayability`
where applicable; provenance-receipt references per §10.2; the
`rights_disposition_binding` of every claim whose `rights_authority` is
applicable, §5.6); candidate inputs
considered; inclusion/exclusion rules; every transformation/compaction with
before/after digests, and for every claim it produced with
`claim_production_class: compiler_derived` the complete `derivation`
input-edge set of §5.1 (transformer identity and each input's kind,
`claim_ref` with its `locator_pin` where `input_kind: claim`, digest
binding, the input's verbatim top-level asserter object, binding, and role)
recorded verbatim together with the derivation-time record of each
`claim_ref` retrieval through its pin, digest/id verification, edge-asserter
equality, and each input's `derive_governed` eligibility (§5.1 rules,
V11–V13) — replay retrieves through the same pins; omission reasons for
every omitted decisive-class field; freshness/authority filters recorded per axis (availability-of-result,
freshness, admission, promotion separately); per-entry
`reference_verification` records; per-released-entry `decision_input_digest`;
the three isolation statuses carried verbatim (`source_containment /
deployment_binding / authenticated_workspace_isolation` — never one boolean);
size/budget and displacement; `packet_digest` + `tool_manifest_digest`
(backward references only); compiler warnings;
`compilation_trace_digest`. The private-generic path records only that the
generic rule fired — never private identifiers.

## 14. `TiberOperationManifestV0`

`schema_version`: `"research-context-compiler-operation-manifest/v0"`. Per
operation: id + version; owning application layer; capability family from the
exact Ops #67 seven (`contract_schema_introspection, world_query,
provenance_lineage, validation_rejection_explanation, precedent_discovery,
operator_context_retrieve_persist, privileged_software_maintainer_exclude`) —
consumed as an **unresolved dependency**: Ops #67 owns the eventual catalog
and this manifest describes instances only; read/write class (the four
Sequence B compiler operations are all `read`); required scope class; typed
result/refusal states referencing the §6 closed vocabulary **including
`reference_unverifiable`**; per-channel availability status in which absent,
blocked, and design-only capabilities are listed visibly as such, never
omitted or implied. A manifest describes; it never grants — tool availability
is not approval, and a manifest entry creates no capability.
`manifest_digest: DigestBindingV0`.

## 15. `AgentContinuationTraceV0` and `AgentContinuationEvaluationV0`

`schema_version` consts:
`"research-context-compiler-continuation-trace/v0"` and
`"research-context-compiler-continuation-evaluation/v0"`.

**Trace** — the immutable execution record: fixture id + variant;
`context_packet_digest` + `tool_manifest_digest` (backward references);
provider, model/version, run id/time, sampling/config metadata
(configuration only — hidden chain of thought is never collected or
required); ordered tool calls with returned observation refs; claims made
with source refs; questions and abstentions (first-class, retained); final
response artifact; latency/cost metadata where governed; `trace_digest`.
**It contains no evaluation-result reference of any kind.**

**Evaluation** — references the immutable `trace_digest`; per-dimension
results over the #15 dimension set, each
`{value: pass | fail | blocked | non_measurable, method: deterministic |
reviewer, evidence_ref, reviewer_id where reviewer}`; fixture-invariant
violations; run-set aggregation marking any single-run claim `anecdotal`;
`evaluation_digest`.

**One-way lifecycle (no digest cycle):**

```text
TiberOperationManifestV0
  ← TiberAgentContextPacketV0        (references manifest_digest)
      ← ContextCompilationTraceV0    (references packet + manifest digests)
      ← AgentContinuationTraceV0     (references packet + manifest digests)
          ← AgentContinuationEvaluationV0  (references trace_digest)
```

Bidirectional discovery (trace → its evaluations) lives only in a separate
mutable run index outside every digest projection; the index carries no
authority and is never digest-bound evidence.

## 16. Digest golden vectors (normative conformance)

Computed with the pinned implementation (`src/canonical.ts`,
`src/digest.ts`); a conforming implementation must reproduce them exactly.

```text
GV-1  input {}  → canonical "{}"  · tiber-canonical-json-v1
      sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a

GV-2  inputs {"b":1,"a":[null,true,"x"]} and {"a":[null,true,"x"],"b":1}
      → canonical {"a":[null,true,"x"],"b":1} · identical digests
        (member-order invariance):
      sha256:afc6ee250958b0d942a566fb2d8e11fbc54da1d8d7769698553dd20799c5267f

GV-3  input {"z":{"b":2,"a":1},"m":[{"y":0.5,"x":10}],"n":[1e21,-0,0.1]}
      → canonical {"m":[{"x":10,"y":0.5}],"n":[1e+21,0,0.1],"z":{"a":1,"b":2}}
      sha256:82fa4ce42790dc7e6c1473e1eda82eeb2978363024770a3368d5c59190b8ab37

GV-4  raw bytes "TIBER\n" (54 49 42 45 52 0A) · tiber-raw-sha256-v1
      sha256:644f0b38989ee7c4bd98f27598e38662d488c1d464642a0b34d27a91ecc7c990

GV-5  source-set pre-sort input:
      [{"source_family":"tiber-fantasy","object_ref":"a","revision_ref":null,
        "content_digest_mode":"tiber-canonical-json-v1",
        "content_digest":"sha256:0000000000000000000000000000000000000000000000000000000000000000"},
       {"source_family":"tiber-data","object_ref":"b","revision_ref":"r1",
        "content_digest_mode":"tiber-raw-sha256-v1",
        "content_digest":"sha256:1111111111111111111111111111111111111111111111111111111111111111"}]
      sorted canonical string:
      [{"content_digest":"sha256:1111111111111111111111111111111111111111111111111111111111111111","content_digest_mode":"tiber-raw-sha256-v1","object_ref":"b","revision_ref":"r1","source_family":"tiber-data"},{"content_digest":"sha256:0000000000000000000000000000000000000000000000000000000000000000","content_digest_mode":"tiber-canonical-json-v1","object_ref":"a","revision_ref":null,"source_family":"tiber-fantasy"}]
      aggregate · tiber-canonical-json-v1
      sha256:afdbd4727fb14332c01db985152cbac67b004f60c5ef524508e18ecc60d50a94

Reject vectors (the pinned implementation's own errors):
      NaN        → "Non-finite numbers are not JSON values at $[\"x\"]"
      undefined  → "Unsupported JSON value type undefined at $[\"x\"]"
```

## 17. Unresolved dependencies

- **Ops #67** owns the brought-agent operation/tool vocabulary, the full
  lineage/precedent traversal surface, and the no-repository acceptance
  harness; this family maps onto its capability families without finalizing
  them.
- **Production compiler placement** (TIBER-Fantasy application layer) remains
  a recommendation awaiting a separate operator decision.
- **Canonical identity coverage** in the public roster packet remains a
  production-path follow-up.
- **Governed current Forecast artifact availability** remains blocked
  upstream; `get_forecast_context`-class operations return typed
  unavailability until it exists.
- **Authenticated workspace boundary (Path S)** remains an unbuilt design
  requirement; nothing here activates authentication.
- **Remote transport** remains blocked behind local closed-loop acceptance,
  an accepted Path S design, and separate operator authority.

## 18. Authority effects and prohibitions

Merging this document adopts a **candidate** Research contract family for the
continuing #15 R2 design record. It does not: adopt production schemas;
create or freeze fixtures; activate R3 or any experiment; rotate any
implementation lane; adopt the Fantasy production placement; complete Ops
#67; adopt the availability-witness packet, W4, or W5; authorize any code,
route, API, MCP, authentication, workspace registry, or remote transport
work; authorize source acquisition, monitoring, admission, or promotion;
authorize any Forecast run, Shared Reality write, deployment, Railway change,
or fantasy action; or transfer any authority to any later session, agent, or
reader. Under TIBER-Ops #66, consequential transitions continue to require
exact live operator authority; this text grants none.

---

## Appendix A (non-normative) — fixture registry summary and R3 prerequisites

The candidate fixture registry bound by the #15 R2 design (identities only;
no fixture is created or frozen by this document): RD-01 (thesis-hold
isolation), RD-02 (usage evidence unavailable/source-required), JJ-01
(operator hypothetical privacy), JT-01 (designation/eligibility/reserve axis
separation), AJ-01 (unresolved availability and late-swap geometry), DST-01
(deterministic external recast, permanently derived; its named external
component vector and the observed league scoring contract are distinct
digest-bound entries in the derived claim's `derivation.inputs[]` (§5.1),
each preserving the input's verbatim top-level `asserter` object (the
scoring contract's `original_asserter`; a further derived input's own
`output_producer`, never an earlier upstream party) and, where the input is
a claim, its pinned `claim_ref`; the derived claim's top-level `asserter`
is the compiler
transformer as `output_producer` — neither the component-vector party nor
the scoring-contract party is named as asserter of the composite value, and
a consumer citing the result cites the compiler's statement, not either
input party's; the recast remains traversable, including across further
derivation hops, through `inspect_lineage`-class operations), K-01 (incomplete kicker
components fail incomplete), **AV-01 (mandatory, fail-closed: a
retrospective/backfill artifact shaped like current evidence must surface
historical-available and current-stream-unknown as distinct results, with
`source_generated_at` distinct from `event_time`; a timestamp or schema match
never upgrades the observation mode)**, ISO-AB (synthetic public-A/private-B
isolation with caller-coordinate mutation, existence-leak, two-layer cache,
log, decision-substitution, and principal-discrimination checks), P346-PERT
(runtime-profile capability failure and mixed-case API/cache perturbations),
TRAV-01 (no-repository traversal), TUN-C (mechanism separation), KA-01
(roster shock), JW-01 (operator-context portability), SF-01 (1QB↔superflex
causal sensitivity/invariance), CA-01 (admitted and applicable rights
authority held constant, promotion flips — exactly {consume_canonical,
derive_governed} changes; with `rights_authority.unresolved` substituted,
promotion is necessarily `not_promotable` and neither capability is present
under any other set), FI-01
(freshness/identity trap: not-found ≠ not-current ≠ evidence-of-absence).

A bounded synthetic/offline R3 would require, before any activation:
operator acceptance of this family; separately authorized fixture freezing
(files, digests under §16 procedures, freeze manifest binding the digest
implementation reference); an operator-selected provider policy and budget
ceiling; a designated independent reviewer; ≥5 runs per fixture-variant per
configuration with single-run claims marked anecdotal; complete retention of
negative results and abstentions; and a live #66-valid activation
instruction. None of that is authorized here.

---

## Candidate terminal (Research #15)

```text
context_compiler_v0_ready_for_bounded_experiment_activation
```

This terminal authorizes **only Joseph's consideration** of a separately
pinned bounded experiment. It does not activate R3, any implementation,
fixture freeze, lane rotation, repository fan-out, merge, deployment,
promotion, or product change.
