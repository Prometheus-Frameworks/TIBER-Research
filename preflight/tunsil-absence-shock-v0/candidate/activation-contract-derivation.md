# v2 activation-contract derivation — tunsil-absence-shock-v0

Authored under the v2 re-freeze build authority (TIBER-Research issue #3
comment 5284914358, recorded 2026-08-13T18:39:40Z). This note derives, from
the Stage 0 activation validator (`src/validator.ts`), the exact shapes the
v2 package adopts, so the fresh-context reviewer can check the derivation
against the code rather than against executor assertions.

## 1. Capability / write-path shape (validateCapabilities, ~line 1745)

The Stage 0 activation validator requires, for run id
`tunsil-absence-shock-v0`:

- `repository_write` entries must each be exactly
  `runs/tunsil-absence-shock-v0/run-events.jsonl`, exactly
  `runs/tunsil-absence-shock-v0/attempts`, or fall beneath the attempts root
  ("effective writes must remain beneath the stable attempts root or target
  the run event log");
- `repository_write` must INCLUDE both the attempts root and the run event
  log ("effective writes must include the stable attempts root and run event
  log");
- the future activation record's `permitted_path` must equal the attempts
  root `runs/tunsil-absence-shock-v0/attempts` ("permitted_path must equal
  the stable run attempts root") — this is *within* the operator-bound
  `runs/tunsil-absence-shock-v0/**` write scope;
- `repository_read` must cover the activation job path
  (`preflight/tunsil-absence-shock-v0/candidate/job.yaml`), the activation
  decision path (which `validateIdentityPins` requires to sit beneath a
  top-level `authority/` directory), and `runs/tunsil-absence-shock-v0`;
- the activation record's capabilities must not expand the job envelope, and
  the Stage 1 validator separately requires them to equal the job envelope
  exactly — so the JOB itself must carry the activation-conformant envelope.

v2 therefore binds in `candidate/job.yaml` (the only job change):

- `repository_read`: `authority`, `docs`,
  `preflight/tunsil-absence-shock-v0`, `runs/tunsil-absence-shock-v0`,
  `schemas`, `src`;
- `repository_write`: `runs/tunsil-absence-shock-v0/attempts`,
  `runs/tunsil-absence-shock-v0/run-events.jsonl`.

Derived values for the future activation record: `permitted_branch`
`claude/tunsil-pilot-preflight`; `permitted_path`
`runs/tunsil-absence-shock-v0/attempts`; decision file beneath top-level
`authority/`; `inputs_ref.path` `runs/tunsil-absence-shock-v0/inputs.json`
(`validateIdentityPins`: "expected runs/<runId>/inputs.json").

## 2. Frozen-inputs location and run layout (validateIdentityPins,
validateSources, validatePreactivationLayout)

- The frozen inputs now live at `runs/tunsil-absence-shock-v0/inputs.json`
  (the activation identity pin) and are bound as the Stage 1 manifest's
  `candidate_inputs` artifact at that path.
- `validateSources` requires every source metadata/content path to sit
  beneath `runs/tunsil-absence-shock-v0/sources/<source_object_id>/`, and
  requires metadata `intended_use` and `rights_disposition_ref` to equal the
  admitted family policy strings verbatim. The seven Manual Witness sources
  moved accordingly; the ONLY metadata field changes are `content_path`
  (run-local relocation) and the two family-policy strings. All clocks,
  digests of retained excerpts, revision identities, rationales, and
  limitations are unchanged; the per-source claim scopes remain recorded
  verbatim in `candidate/source-envelope.json`.
- `validatePreactivationLayout` permits the pre-activation run directory to
  contain ONLY `inputs.json` and `sources/`. No attempts directory, run
  event log, or activation record exists — none may exist before activation.

## 3. Governing-manifest digest semantics (validateProvenance, ~line 2032)

A v1 provenance receipt only covers its artifact when
`governing_manifest_ref.digest === artifact.artifact_digest` AND that ref
resolves to a schema-valid `research-governing-manifest/v1` document. So the
frozen `artifact_digest` must be the canonical-JSON digest of the artifact's
GOVERNING MANIFEST record, not of the artifact content. v2 authors one
governing manifest per pinned artifact under `governance/` and re-binds
`inputs.artifacts[].artifact_digest` to those digests. `blob_digest` remains
the true content identity (sha256 of the git blob bytes, re-verified 9/9
against the pinned commits).

On `governance_status`: the schema admits only `promoted`. For all nine
artifacts this asserts merged-governed-on-main status in their home
repositories (operator-approved merges of 2026-08-13 and 2026-08-12), which
is true; no other enum member exists to express finer gradation.

## 4. Prior activate_run decision — void for v2

`authority/issue-3-activation-decision.json` (operator decision of
2026-08-13T17:00:15Z, comment 5283843131) bound the v1 digests
(job `sha256:74574487…`, inputs `sha256:13723b1a…`) and voids itself on any
digest movement. The v2 re-freeze moves both digests, so that record is VOID
FOR V2. Its schema has no status field, so this note and the Stage 1
manifest record the voiding: the file is retained on disk purely as a
historical record, bound as `prior_activation_direction_record`, and no
longer participates in any governing binding. Because the Stage 1 validator
machine-traverses every artifact-digest-shaped reference, the retained
copy's `approved_artifact_refs` list is empty; the exact v1 digests the
decision bound remain verbatim in its `scope` entries, in the digest-bound
decision snapshot (`snapshots/issue-3-comment-5283843131.md`), and in git
history at head `251fabd`. The package's governing operator direction is now
the v2 build authority (comment 5284914358).

## 5. Chronology constraint — ADJUDICATED AND CORRECTED

The residual finding originally reported here (the provenance freshness
chain `operator_direction.recorded_at <= freshness.as_of <= cutoff_at`
combined with `inputs.frozen_at <= approved_at` transitively forced
`frozen_at <= cutoff_at`, making activation-readiness unreachable for any
package that freezes after its cutoff) was adjudicated by the Sol review
lane and corrected under operator-transmitted authority (issue #3 comment
5286246398, recorded 2026-08-13T20:51:15Z, snapshotted in
`snapshots/issue-3-comment-5286246398.md`).

Canonical Research chronology as adjudicated:
`evidence/admission <= cutoff <= freeze <= activation/execution`.
Evidence-side clocks (event_time, effective_at, published_at, admissible_at,
artifact effectiveness) remain strictly at or before the cutoff.
Custody-side clocks (receipt observation/verification, freshness
assessment, freeze, operator direction, approval, activation) may follow
the cutoff in their existing relative order.

Correction applied in `src/preflight.ts` (this branch): the
`freshness_after_cutoff` invariant (`as_of <= cutoff_at`) was removed —
`as_of` is a custody-side assessment instant, still bounded by
`effective_at <= as_of <= verified_at <= prepared_at` and by the operator
direction/approval instants; and the new adversarial invariant
`inputs_frozen_before_cutoff` rejects any candidate inputs frozen BEFORE
their cutoff (the eligible-but-unobservable interval the v1 review's P1
correction eliminated). Regression coverage in
`test/activation-materialization.test.ts` validates the canonical
chronology end-to-end (including a freshness assessment after the cutoff)
and asserts the freeze-before-cutoff rejection. Under the corrected
contract, the v2 package's provenance receipts and activation decision are
fully materializable with its real clocks (cutoff 2026-08-13T14:13:09Z,
freeze 2026-08-13T18:53:09Z); the remaining gate is solely the new
digest-bound operator activation decision after fresh Sol review.
