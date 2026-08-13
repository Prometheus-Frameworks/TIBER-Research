# Event-shock packet extensions v0 (draft for operator review)

Status: **draft contract extension — not adopted, not activated**. Prepared for
[TIBER-Research issue #3](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/3)
(Tunsil absence shock v0). Adoption requires operator review and merge under the
existing protocol. Nothing here authorizes a live run, source acquisition, or
downstream authority.

## Why

Issue #3 requires deliverables the Stage 0 packet contract could not represent:
a job-scoped terminal decision (including `requires_data_followup`), the W4
assessment vocabulary (`mixed`, `out_of_scope`), a `forecast` epistemic class,
a causal-path map with evidence and counterevidence on every edge,
preregistered response-branch assessments (H1/H2/H3), owner-routed RFIs, and
explicit falsifiers. These extensions add those structures **additively**: every
new field is optional, the synthetic fixture is byte-unchanged, and all prior
validation behavior is preserved for packets that do not use them.

## Wire identity (review finding, addressed)

The extensions carry a distinguishable contract identity. `schema_version`
becomes a two-value enum on each changed contract — `research-packet/v0` /
`research-packet/v0.1`, `research-job/v0` / `research-job/v0.1`,
`research-inputs/v0` / `research-inputs/v0.1` — with schema conditionals that
pin the `v0` identity to exactly the pre-extension wire language: under `v0`,
every new field is rejected and every extended enum is restricted to its
original members. A packet using extension semantics must declare `v0.1`, which
a validator pinned before this change fails closed on (its `v0` const no longer
matches). New semantics are therefore never indistinguishable from the old
contract, and the commit SHA is not a hidden schema version.

## What changed

### `schemas/v0/common.schema.json`

- New `ownerRepository` definition (`owner/name` reference for RFI routing).
  (`epistemicClass` is unchanged — `forecast` is a packet-claim class only,
  defined inline in the packet schema, so ledger-event surfaces are untouched.)

### `schemas/v0/job.schema.json` (both optional)

- `response_branches` — preregistered branches: `branch_id`, `label`,
  `description`, `expected_signals`. Declared at job time so branch content is
  frozen before evidence is seen.
- `terminal_decisions` — the closed set of job-scoped terminal decision tokens,
  each classed as `complete`, `requires_data_followup`, or `blocked`.

### `schemas/v0/inputs.schema.json`

- `blocked_inputs[]` gains optional `owner_repository` so a frozen evidence gap
  can carry its upstream owner from freeze time.

### `schemas/v0/packet.schema.json`

- Question `assessment` gains `mixed`; claim `assessment` gains `mixed` and
  `out_of_scope`.
- `claim_type` gains `efficiency_assessment`, so opportunity and efficiency are
  assessed as separate claims and cannot be collapsed into one verdict.
- Claims gain optional `falsifiers`.
- Follow-ups gain optional `rfi` (`owner_repository`, `related_issue`,
  `requested_evidence`, `unresolved_refs`) — a missing-input request routed to
  the repository that owns the gap. `unresolved_refs` (min 1) binds the RFI to
  the exact unresolved item it routes.
- Packet gains optional `terminal_decision`, `response_branches` (assessment of
  each preregistered branch), and `causal_paths` (nodes plus directed edges,
  each edge carrying mechanism, evidence, counterevidence, uncertainty, and
  falsifiers).

### Validator semantics (`src/validator.ts`)

- **Assessment aggregate**: `mixed` sits between `partly_supported` and
  `weakened` in the conservative question aggregate. `out_of_scope` claims are
  excluded from the aggregate entirely — a boundary ruling is not an answer —
  and an `out_of_scope` claim must carry a `null` disposition.
- **Epistemic coupling**: claims may now be `observed` (admitted evidence, no
  calculations), `calculated`, `inferred`, or `forecast`. A `forecast` claim
  fails closed without challenged evidence **and** non-empty falsifiers.
- **Terminal decision**: permitted only when the job declares
  `terminal_decisions`; then exactly one is required, it must be a declared
  token, and its class must cohere with the process terminal. A
  `requires_data_followup` decision additionally requires at least one
  unresolved missing/blocked input **and** at least one RFI whose
  `unresolved_refs` resolve to such a gap — an unrelated gap plus an unrelated
  RFI is rejected (review finding, addressed), so "we need more data" always
  leaves owner-addressed work bound to the exact gap.
- **RFI routing**: every RFI's `unresolved_refs` must resolve to missing or
  blocked unresolved items, and when a bound gap traces to a frozen blocked
  input that declares `owner_repository`, the RFI must be routed to that same
  owner.
- **Response branches**: permitted only when preregistered in the job; every
  preregistered branch must be assessed; label, description, and expected
  signals must exactly match the preregistration; `supported`, `contradicted`,
  or `mixed` branch assessments must cite admitted current observations.
- **Causal paths**: edges must connect declared nodes, must be acyclic, must
  cite admitted current observations as evidence, and node subjects must
  resolve to governed job subjects.

### Renderer (`src/renderer.ts`)

New sections (`Response Branches`, `Causal Paths`, claim `Falsifiers`,
follow-up `Request for information`, governance `Terminal decision`) render
only when the fields are present, so existing packets — including the synthetic
fixture — render byte-identically.

## Verification

- `npm run check` passes: typecheck, 289 tests (35 new in
  `test/extensions.test.ts`, including the v0 wire-identity gating cases and
  the unrelated-gap/unrelated-RFI adversarial case), golden fixture
  end-to-end, and the untouched Stage 1 preflight (still honestly
  `requires_operator_inputs`).
- The synthetic fixture and the `preflight/opportunity-clusters-2026-v0`
  package are byte-unchanged; the fixture continues to declare and validate as
  `research-packet/v0`.

## Open questions for the operator

1. `mixed` severity placement (between `partly_supported` and `weakened`) is a
   judgment call; confirm or reorder at review.
2. Whether question-level assessments should also admit `out_of_scope`
   (currently claim-level only, since job questions are in scope by
   construction).
