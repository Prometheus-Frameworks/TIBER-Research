# TIBER Research

TIBER Research is the file-backed custody layer for bounded, replayable research.
It stores immutable job inputs, append-oriented attempt state, structured candidate
findings, independent reviews, and terminal seals.

The repository currently contains the Stage 0 contracts and a Stage 1 activation
preflight. It does not yet conduct football research, call a model or external
source, schedule work, access private context, promote claims, or change a
downstream TIBER artifact.

The governing architecture is
[`TIBER-Harness/docs/design/tiber-researcher-v0.md`](https://github.com/Prometheus-Frameworks/TIBER-Harness/blob/eac4b0968ff4645582743421fc8bb2f6a1c2aa8b/docs/design/tiber-researcher-v0.md).
Stage 0 authority is recorded in
[`TIBER-Ops#53`](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/53).
Stage 1 preflight authority is recorded in
[`TIBER-Ops#54`](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/54).

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
preflight/                           hash-bound live-pilot activation candidates
test/                               positive and adversarial tests
```

The synthetic fixture is deliberately non-football-authoritative. Its entities and
observations are invented only to exercise the protocol.

## Agent entry (draft)

`docs/agent-entry/` holds a separate, run-independent surface: one public,
provider-neutral document an operator can hand to any capable external agent that
has never seen TIBER, and the `agent-thesis-proposal/v0` contract that agent
returns. It turns an informal operator take into an inspectable structure while
keeping Shared Reality, external evidence, agent inference, agent recall, and the
operator's own position distinct — including whether the operator asserted the
take at all, or was merely exploring it.

```text
docs/agent-entry/                    the public entry protocol and pilot procedure
docs/contracts/agent-thesis-proposal-v0.md   contract decisions and contamination register
schemas/v0/agent-thesis-proposal.schema.json the proposal contract
fixtures/agent-entry/                validating contract and football-first examples
```

An agent proposal is pre-freeze and authority-inert: `freeze_state` is always
`not_frozen`, evidence is always `promotable: false`, and freezing requires the
operator. It is deliberately smaller than the `CausalThesisLineageV0` primitive
sketched in [`#9`](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/9),
which does not exist yet. Validate a returned proposal with
`npm run cli -- agent-entry . <path>`. The surface is a draft: not adopted, not
activated, and it runs no pilot.

## Research Gateway v0 (intake/read scaffold)

The bounded Research Gateway v0 gives an operator three local, provider-neutral
entry points over the existing contracts:

```bash
npm run cli -- gateway:intake . <proposal-relative-path>
npm run cli -- gateway:status . <run-id> <attempt-id>
npm run cli -- gateway:packet . <run-id> <attempt-id>
```

The default output is concise Markdown intended for an operator or a connected
agent. Add `--format=json` after the positional arguments for the full
structured gateway report. Intake validates and renders one external agent's
`agent-thesis-proposal/v0`; it neither confirms the interpretation nor creates a
full preregistration. Status and packet access are deterministic reads of one
exact repository run and attempt. Invalid custody fails closed: the gateway
withholds the packet, suppresses inferred actions, and does not repeat positive
review or lifecycle labels from inconsistent bytes.

This is an access scaffold, not an autonomous researcher. It performs no model
call, browsing, source acquisition, durable or canonical persistence,
activation, execution, review, seal, promotion, publication, or downstream
write. A conversational agent can prepare the intake object and explain the
returned view; the existing Research validator remains the source of truth for
custody state. See
[`docs/gateway/research-gateway-v0.md`](docs/gateway/research-gateway-v0.md) for
the capability boundary and documented Tunsil/Allen lifecycle cases.

The checked-in examples can be inspected directly:

```bash
npm run cli -- gateway:intake . fixtures/agent-entry/example-football-minimal.json
npm run cli -- gateway:status . tunsil-absence-shock-v0 attempt-001
npm run cli -- gateway:packet . tunsil-absence-shock-v0 attempt-001
```

The repository pins ordinary source text to LF and marks retained/governed
artifact trees as non-text so Git preserves their committed bytes exactly. This
makes the same status and packet reads work when a Windows user has
`core.autocrlf=true`. A clone made before those attributes existed can fail
closed with `gateway.snapshot_noncanonical`; re-clone after updating rather than
normalizing retained artifacts in place.

## Identity model

| Identity | Meaning | Change rule |
|---|---|---|
| `job_id` | Durable bounded question | New question gets a new ID |
| `job_version` | Immutable job specification | Material contract change creates a successor version |
| `run_id` | One activation against frozen inputs, cutoff, authority, and budget | Any change to those pins creates a new run |
| `attempt_id` | One frozen executor submission | Review rework with unchanged run inputs creates a successor attempt |

An attempt ledger is single-writer at append time and hash-chained. A cold
resume may change `actor_session_ref` only immediately after a checkpoint;
session identifiers record attribution but do not replace exclusive write
authority. The ledger freezes when `submission.json` is created. A reviewer
writes only `review.json`; any candidate repair creates another attempt. Every
terminal attempt receives `seal.json`. Promotion is always external to the
sealed run.

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
npm run preflight:check
npm run agent-entry:check
```

The CLI also exposes the individual offline operations:

```bash
npm run cli -- start <workspace> <run-id> <attempt-id> <metadata-relative-path>
npm run cli -- preflight <workspace> <manifest-relative-path> [--require-ready]
npm run cli -- render <workspace> <run-id> <attempt-id>
npm run cli -- submit <workspace> <run-id> <attempt-id> <metadata-relative-path>
npm run cli -- review <workspace> <run-id> <attempt-id> <metadata-relative-path>
npm run cli -- seal <workspace> <run-id> <attempt-id> <metadata-relative-path>
npm run cli -- validate <workspace> <run-id> <attempt-id> --phase=sealed --require-end-to-end
npm run cli -- resume <workspace> <run-id> <attempt-id>
npm run cli -- agent-entry <workspace> <proposal-relative-path>
npm run cli -- gateway:intake <workspace> <proposal-relative-path> [--format=markdown|json]
npm run cli -- gateway:status <workspace> <run-id> <attempt-id> [--format=markdown|json]
npm run cli -- gateway:packet <workspace> <run-id> <attempt-id> [--format=markdown|json]
```

`agent-entry` validates an `agent-thesis-proposal/v0` object returned by an
external agent: schema conformance, reference integrity, an acyclic causal graph,
and the anti-fabrication couplings (an assessed element must cite evidence; Shared
Reality evidence requires a declared live TIBER tool, a locator, and a retrieval
path; the agent's own recall can never be verified or be the sole support for an
assessment; `operator_belief` requires the operator to have actually asserted the
take, so belief attribution fails closed; and a quote digest is permitted only
where byte identity with the operator's source was genuinely established). It
reads the proposal with `readJson` rather than
`readNormalizedJson`: agent output arrives from an arbitrary provider, so its byte
form is not governed and only its meaning is checked.

`fixture:build` verifies the existing synthetic ledger and deterministically
creates or verifies its rendered packet, submission, independent review
receipt, seal, and run-event bindings. It uses fixed fixture metadata; it
performs no network or model call.

`preflight` validates a normalized Stage 1 manifest, every recursively referenced
artifact, exact digest modes, package completeness, privacy ceiling, candidate-run
identity, the full Stage 0 job/input/authority schemas, source and governed-artifact
receipt coverage, cutoff chronology, network policy versus observed enforcement,
and fixed provider-neutral actor-session reservations. A valid preflight may still
report `activation_ready: false`; that means its blocked or operator-input-required
disposition is honest and internally consistent. Add `--require-ready` when the
command is being used as an activation gate. That gate injects the runner's
canonical UTC time, rejects preflights prepared in the future, and rechecks
the network receipt validity window at time of use. Historical validation
without a trusted evaluation time never grants activation readiness.
Chronology fields fail closed above millisecond precision so the runtime never
silently truncates otherwise schema-valid RFC 3339 instants.

## Stage 1 preflight

The `opportunity-clusters-2026-v0` package freezes the exact captured body bytes
from #51, #52, and Strategy #8 and contains:

- a closed 30-subject identity proposal, including
  `Ferguson → Terrance Ferguson` and `Higgins → Jayden Higgins`;
- a deliberately blank operator-baseline template;
- a research-context proposal with unconfirmed assumptions kept distinct from
  activated inputs;
- an internal-artifact capability and source-envelope audit;
- a proposed exact denied-network policy;
- a proposed two-actor-session cost ceiling with per-role limits of one
  executor and one reviewer; and
- a hash-bound preflight manifest that inventories every package file.

The package currently validates as `requires_operator_inputs`, not
`ready_for_activation`. It creates no `job.yaml`, input manifest, activation
receipt, evidence ledger, packet, review, archive, or promotion record. In
particular, a proposed network policy is not treated as an effective enforcement
receipt, and zero external-source receipts are recorded because the admitted
external source set is empty.

Referenced egress, observation, freshness, governing-manifest, and cost-rate
objects are schema-validated as well as hash-bound. Observation policy admits
exact boundary, actor identity, role, method, and trust-basis tuples; an
activation direction must approve the exact policy used by every receipt. A
future activation-ready bundle must also quarantine the pre-activation run
root to frozen inputs and their declared source objects; a promotion or any
other unbound run file fails closed.

Metadata paths are workspace-relative normalized JSON files. `start`, `submit`,
`review`, and `seal` are create-only operations with exact-byte idempotent
recovery: repeating the same operation is safe, while conflicting replacement
content is rejected. `render` is likewise create-only. Invalid contracts fail
with a non-zero exit status; a valid but non-ready preflight does so only when
`--require-ready` is requested. Validation reports every detected protocol error
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
decision, after which the named attempt may begin. A new start requires an empty
attempt path and validates the frozen run plus any sealed predecessor before it
appends authorization. Predecessor bundles are validated recursively before
their pins are trusted.

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
this offline file validator. The activation-facing time-of-use check trusts the
runner's system clock. Its private-data check detects structural policy
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

Passing Stage 0 or a Stage 1 preflight does not activate a live research run.

## Required before live Stage 1 activation

The successor preflight contracts now define and test:

- an availability-evidence receipt that binds an external source's exact
  revision and content identity to its claimed pre-cutoff availability;
- observed/effective timestamps and provenance for pinned governed artifacts,
  rather than relying on a bare `current` label;
- a concrete destination/source allowlist and enforcement boundary for any
  network-enabled execution; and
- a provider-neutral cost unit, ceiling, trusted usage observation, and
  checkpoint reconciliation rule.

The #52 candidate does not yet satisfy those interfaces. Activation still requires
a machine-readable operator baseline, confirmed research context and cutoff,
current source-backed 2026 role evidence (or an explicitly narrower job), governed
provenance receipts, a trusted network-enforcement receipt, resolution of the two
rookie cross-namespace identities, explicit retention and reportability treatment,
a named independent reviewer boundary, exact branch and write-path authority, and
a separate Ops activation decision binding the precise job, inputs, network, and
cost artifacts.
Market claims also require an admitted market snapshot; otherwise those questions
must terminate blocked or remain out of scope.
