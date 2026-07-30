# TIBER Research

TIBER Research is the file-backed custody layer for bounded, replayable research.
It stores immutable job inputs, append-oriented attempt state, structured candidate
findings, independent reviews, and terminal seals.

This Stage 0 repository is contract infrastructure only. It does not conduct football
research, call a model or external source, schedule work, access private context,
promote claims, or change a downstream TIBER artifact.

The governing architecture is
[`TIBER-Harness/docs/design/tiber-researcher-v0.md`](https://github.com/Prometheus-Frameworks/TIBER-Harness/blob/eac4b0968ff4645582743421fc8bb2f6a1c2aa8b/docs/design/tiber-researcher-v0.md).
Stage 0 authority is recorded in
[`TIBER-Ops#53`](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/53).

## Boundary

- **TIBER-Ops owns authority:** activation, amendment, cancellation, promotion,
  revocation, and supersession.
- **TIBER Research owns custody:** exact contracts, admitted inputs, evidence
  lineage, attempt state, candidate packets, reviews, and seals.
- **Executors and reviewers are roles:** Codex, Claude Code, local models, or
  future providers may fill a declared role but own neither custody nor authority.
- **TIBER-Harness remains separate:** it may later evaluate synthetic conformance
  under separate authority; it does not own live research.
- **Consumers pull:** no Research artifact grants Strategy, Forecast, product,
  publication, merge, or real-world action authority.

## Stage 0 surface

```text
schemas/v0/                         JSON Schema 2020-12 contracts
src/                                offline deterministic tools
fixtures/synthetic-complete/        fictional end-to-end fixture
test/                               positive and adversarial tests
```

The synthetic fixture is deliberately non-football-authoritative. Its entities and
observations are invented only to exercise the protocol.

## Identity model

| Identity | Meaning | Change rule |
|---|---|---|
| `job_id` | Durable bounded question | New question gets a new ID |
| `job_version` | Immutable job specification | Material contract change creates a successor version |
| `run_id` | One activation against frozen inputs, cutoff, authority, and budget | Any change to those pins creates a new run |
| `attempt_id` | One frozen executor submission | Review rework with unchanged run inputs creates a successor attempt |

An attempt ledger is single-writer and hash-chained. It freezes when
`submission.json` is created. A reviewer writes only `review.json`; any candidate
repair creates another attempt. Every terminal attempt receives `seal.json`.
Promotion is always external to the sealed run.

## Digest rules

Stage 0 pins two procedures:

- `tiber-raw-sha256-v1`: hash the exact file bytes and identify them as
  `sha256:<lowercase-hex>`. YAML, Markdown, JSONL, and retained source content use
  this procedure.
- `tiber-canonical-json-v1`: accept only JSON values; recursively sort object keys
  in ascending UTF-16 code-unit order; preserve array order; serialize primitives
  with ECMAScript `JSON.stringify`; normalize negative zero to `0`; reject
  non-finite numbers, sparse arrays, `undefined`, non-plain objects, and cycles;
  encode the result as UTF-8; then hash it with SHA-256.
- `tiber-json-file-v1`: governed JSON files recursively sort object keys by the
  same UTF-16 ordering, preserve array order, serialize with
  `JSON.stringify(value, null, 2)`, and end with exactly one LF. Canonical hashes
  bind JSON meaning; this required file form makes whitespace and member-order
  rewrites fail validation too.

The procedure is intentionally named rather than described as generic
“canonical JSON.” Changing it requires a new version.

## Commands

Requires Node.js 20 or newer.

```bash
npm ci
npm run typecheck
npm test
npm run fixture:check
```

The CLI also exposes the individual offline operations:

```bash
npm run cli -- start <workspace> <run-id> <attempt-id> <metadata-relative-path>
npm run cli -- render <workspace> <run-id> <attempt-id>
npm run cli -- submit <workspace> <run-id> <attempt-id> <metadata-relative-path>
npm run cli -- review <workspace> <run-id> <attempt-id> <metadata-relative-path>
npm run cli -- seal <workspace> <run-id> <attempt-id> <metadata-relative-path>
npm run cli -- validate <workspace> <run-id> <attempt-id> --phase=sealed --require-end-to-end
npm run cli -- resume <workspace> <run-id> <attempt-id>
```

`fixture:build` verifies the existing synthetic ledger and deterministically
creates or verifies its rendered packet, submission, independent review
receipt, seal, and run-event bindings. It uses fixed fixture metadata; it
performs no network or model call.

Metadata paths are workspace-relative normalized JSON files. `start`, `submit`,
`review`, and `seal` are create-only operations with exact-byte idempotent
recovery: repeating the same operation is safe, while conflicting replacement
content is rejected. `render` is likewise create-only. All commands fail closed
with a non-zero exit status. Validation reports every detected protocol error
but never repairs reviewed material.

## Lifecycle and governance

The activation binds a normalized Ops authority receipt to the exact job,
inputs, cutoff, capability allowlist, budget, authority ceiling, branch, and
write path. The same frozen research context is carried through admitted source
metadata and every scoped claim. Source observations retain distinct event,
publication, availability, retrieval, and cutoff times.

Run-level events authorize attempt starts and record submission, review, seal,
successor, and closure transitions. A `rework_required` seal does not invent its
successor or close the run: a later successor link must identify a separate Ops
decision, after which the named attempt may begin. Predecessor bundles are
validated recursively before their pins are trusted.

A packet-free `resume` validates the frozen authority, inputs, source objects,
run-event history, hash-chained ledger, and final checkpoint before deriving a
closed set of safe next actions. It does not surface executor-authored prose as
authority or depend on prior session memory.

A submission freezes its attempt. Review and seal files bind the submitted
bytes by hash. The seal remains immutable, so later successor authorization is
recorded in the run event stream rather than patched into `seal.json`.

## What validation establishes

The Stage 0 validator establishes schema conformance, identity and authority
pinning, path containment, admitted-source linkage, cutoff handling, ledger
integrity, claim traceability, deterministic rendering, submission/review
binding, and seal integrity.

It does **not** establish empirical truth, source rights, reviewer competence,
or the intellectual correctness of a synthesis. End-to-end readiness is a
protocol result, not a positive finding: a governed inconclusive result may
pass. Those remain substantive research and operator-review questions.

The validator also does not authenticate the human named in an authority
receipt, enforce operating-system access controls, or replace protected Git
history and branch rules. Those are repository/host trust assumptions outside
this offline file validator. Its private-data check detects structural policy
violations and obvious secret markers; it is not semantic DLP.

## Explicitly inactive

Stage 0 contains no:

- `#52` player research or real football evidence;
- external browsing, source acquisition, or source admission;
- hosted-provider execution or permanent agent state;
- scheduler or recurring campaign;
- private league, roster, scoring, user, or credential context;
- promotion record or Strategy/Forecast/product integration;
- ranking, lineup, waiver, trade, or draft action;
- database, vector store, knowledge graph, or UI.

Passing Stage 0 does not activate Stage 1.

## Required before Stage 1

Stage 0 validates only the synthetic, network-denied contract path. Before any
live job is activated, a successor contract revision must also define and test:

- an availability-evidence receipt that binds an external source's exact
  revision and content identity to its claimed pre-cutoff availability;
- observed/effective timestamps and provenance for pinned governed artifacts,
  rather than relying on a bare `current` label;
- a concrete destination/source allowlist and enforcement boundary for any
  network-enabled execution; and
- a provider-neutral cost unit, ceiling, trusted usage observation, and
  checkpoint reconciliation rule.

Until those interfaces exist, a live activation must not rely on retrospective
external-source admission, network access, or a claimed cost ceiling. These are
pre–Stage 1 gates, not permissions inferred from the Stage 0 schemas.
