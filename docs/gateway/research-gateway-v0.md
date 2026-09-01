# Research Gateway v0 (intake/read)

Status: bounded design/scaffold authorized by
[TIBER-Research #17](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/17).
This document does not authorize activation, execution, deployment, or merge.

## Outcome

Research Gateway v0 is a small, provider-neutral read surface over the existing
TIBER Research contracts. It gives an operator-facing agent three honest
operations:

1. check contract conformance and display a pre-freeze agent/provider proposal;
2. inspect the deterministic custody state of one exact run and attempt; and
3. display a validated candidate packet with its lifecycle and authority state.

The gateway does not research football. A conversational agent may help the
operator express or structure a question, while TIBER checks the resulting
contract for consistency and displays its declarations. The gateway makes that
division visible instead of implying that a model, source, or autonomous
Researcher ran inside this repository.

## Capability truth

| Capability | V0 state |
| --- | --- |
| Structure a proposal | External agent; gateway checks consistency and displays its declarations |
| Inspect run custody | Deterministic read |
| Display a packet | Deterministic read after phase validation |
| Persist operator context | Not available |
| Produce a complete Research preregistration | Not available |
| Browse or acquire sources | Not available |
| Call a model/provider | Not available |
| Activate or execute a run | Not available |
| Review, seal, promote, or publish | Not available |

The existing `agent-thesis-proposal/v0` contract is deliberately reused for
intake. It does not contain the cutoff, budget, capability envelope, source-rights
treatment, admitted-input manifest, or actor boundary required for a full
Research preflight. A valid intake therefore remains `not_frozen`,
`not_activated`, `unpromoted`, and `downstream_authority: none`.

## Architecture boundary

The application functions are ordinary TypeScript and do not import the
canonical writer operations in `src/build.ts`.

Status and packet operations copy only the governed run plus the exact job and
authority paths named by its activation into a unique ephemeral workspace.
Validation and projection read that same snapshot, so the bytes projected into
the report are the bytes passed to the validator. Snapshot composition is not an
atomic filesystem transaction: this local v0 requires the caller's workspace to
remain quiescent while the read begins. With Linux procfs, the gateway retains
one opened workspace root across run and dependency copies, traverses components
with no-follow descriptors, and copies file bytes from opened descriptors. This
closes the source-path reopen gap, but does not make the multi-file snapshot
atomic or defend against in-place or mount-namespace mutation. The portable
fallback performs pathname identity checks around copying; pathname-level ABA
and cross-file skew by a concurrent writer remain outside the v0 guarantee.

Job and authority dependencies must be ordinary files. A symlink, special file,
nesting beyond 64 levels, more than 10,000 entries, a file larger than 64 MiB, or
more than 256 MiB in total aborts the snapshot and yields no inferred custody
state. Nothing is silently omitted. The snapshot is removed before the operation
returns and never changes canonical custody. It temporarily duplicates retained
run bytes beneath the operating system's designated temporary root; a hard
process termination can leave that directory for host-level temporary-file
cleanup. The local host's temporary-directory access controls and cleanup policy
are deployment prerequisites, not security guarantees supplied by the gateway.
This is another reason the adapter is local-only rather than a shared service or
multi-user confidentiality boundary.

Before creating a snapshot, the gateway resolves both the inspected workspace
and its temporary root. On POSIX it uses canonical `/tmp` and does not honor
caller-controlled `TMPDIR`/`TMP`/`TEMP` overrides. On Windows it uses the
OS/user-designated temporary root so ordinary non-administrator accounts remain
supported. If that root or the unique created directory is equal to or nested
inside the inspected workspace, the operation fails closed. Linux creation is
anchored through an opened directory descriptor when procfs exposes
`/proc/self/fd`; otherwise creation uses the canonical root under the local
quiescent-filesystem boundary. Environment-selected Windows temp paths therefore
cannot turn the declared read into a transient custody write, while temp-root
confidentiality remains a host deployment responsibility.

```text
operator conversation
  -> external agent proposes structure
  -> gateway checks consistency and renders an ephemeral intake view

exact repository state
  -> existing Research validator
  -> gateway status or packet view
```

The CLI is a local adapter over those functions. A future MCP, HTTP, or product
adapter should call the same application functions rather than shelling out or
reimplementing lifecycle semantics. Such a transport must fix its repository
root and revision at composition time, accept safe identifiers rather than
filesystem paths, authenticate its caller, and receive separate operator
authority. It must also provide revision-addressed snapshot composition,
concurrency control, and an explicit temporary-data retention/cleanup policy.

## Operations

### `gateway:intake`

Input is one `agent-thesis-proposal/v0` JSON object produced outside this
repository. The operation uses the existing semantic checker and emits an
ephemeral view containing the received take, agent interpretation, declared
evidence access, clarification state, Missing Witnesses, and operator
confirmation declaration.

The local CLI accepts only a non-symlink ordinary file no larger than 1 MiB,
revalidates its pre-open, opened, and canonical file identities inside the
workspace, and performs a bounded read before UTF-8 decoding or JSON parsing.
On Linux with procfs available it also opens every path component through pinned
directory descriptors with no-follow semantics. The portable fallback performs
pre-open/opened/final identity and canonical-containment checks; where a host
exposes an opened-descriptor path, it checks that path directly as well. Identity
or containment drift fails closed. The local proposal tree is an input boundary
and must not be concurrently mutated. The
application function separately limits named arrays to 1,000 items, traversal to
100,000 values, and nesting to 32 levels. A future adapter must impose an
equivalent pre-parse byte bound.

Passing intake establishes schema and cross-field consistency only.
Confirmation, stance, evidence access, subject resolution, retrieval, and
byte-identity values remain agent/provider declarations. The gateway does not
authenticate the provider or operator, retrieve sources, or compare source
bytes. A proposal-derived `next_boundary` is a non-authorizing transition hint,
not proof of operator confirmation.

It never:

- persists the proposal;
- turns a confirmation declaration into freeze or activation;
- calls a model or source;
- describes the proposal as a complete preregistration; or
- grants downstream authority.

### `gateway:status`

Input is one exact, safe run ID and attempt ID. The operation delegates to the
existing phase-aware validator and reports distinct dimensions:

- protocol integrity;
- detected custody phase;
- packet completion and terminal disposition;
- review presence/verdict;
- seal presence/state;
- end-to-end readiness;
- blockers, evidence gaps, and budget state; and
- the next permitted boundary.

An underlying validator result of `valid: false` is a hard gate. The gateway
maps it to `protocol_valid: false` and `PROTOCOL_INCONSISTENT`, suppresses all
next actions, suppresses positive review/lifecycle labels, and never tries to
repair or reinterpret the trace.

### `gateway:packet`

The operation first validates the detected phase. On a valid trace it loads the
normalized packet and renders Markdown in memory with the canonical Research
renderer. It does not create, replace, or repair `packet.md`.

The human view visibly labels custody phase, review/seal state, reportability,
`authority_state`, `downstream_authority`, and end-to-end readiness. A submitted
packet can be inspected, but it remains candidate output awaiting review. On an
invalid trace the operation returns no packet body.

## Operator CLI

Human-readable Markdown is the default. Deterministic structured output is an
explicit audit-mode request.

```bash
npm run cli -- gateway:intake . path/to/proposal.json
npm run cli -- gateway:status . <run-id> <attempt-id>
npm run cli -- gateway:packet . <run-id> <attempt-id>

npm run cli -- gateway:status . <run-id> <attempt-id> --format=json
```

For a football-first checked-in intake example, use
`fixtures/agent-entry/example-football-minimal.json`. Repository attributes pin
ordinary source text to LF and preserve retained/governed artifact trees as
exact committed bytes, including on Windows with `core.autocrlf=true`. If an
older checkout rewrote those bytes, the gateway fails closed with
`gateway.snapshot_noncanonical`; obtain a fresh checkout rather than normalizing
retained artifacts in place.

### Windows PowerShell audit-body display

The CLI writes UTF-8. Windows PowerShell decodes a native program's piped output
according to `[Console]::OutputEncoding`; when that value is an OEM code page,
non-ASCII packet prose can display as mojibake after `ConvertFrom-Json`. Align
that console boundary to UTF-8 before extracting the explicit Markdown audit
body:

```powershell
npm run build --silent
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
node dist/src/cli.js gateway:packet . <run-id> <attempt-id> --format=json |
  ConvertFrom-Json |
  ForEach-Object { $_.body.markdown }
```

This is a display-only shell setting. It does not normalize or modify repository
files, affect the packet digest, or grant any Gateway authority. `$OutputEncoding`
controls text sent *to* native programs and is not the boundary involved in this
read pipeline.

These commands are local inspection tools. Their workspace/path arguments are
not a proposed network API. A future remote or agent-callable adapter must not
expose arbitrary workspaces or repository paths.

## Lifecycle interpretation

The following statements are intentionally independent:

| Statement | What it establishes |
| --- | --- |
| Validator is valid | The inspected bytes satisfy the applicable protocol |
| Preflight is activation-ready | The frozen activation gates pass at the trusted evaluation time |
| Packet says completed | The executor declared the research process terminal |
| Review says pass | An independent review accepted the exact submitted bytes |
| Attempt is sealed | The terminal custody bundle is immutable and bound |
| End-to-end ready | The complete required protocol path was reached |
| Empirically true | Not established by the gateway or structural validator |
| Promoted/publishable | Requires a separate receiving-lane and operator decision |

The gateway never collapses these into a single `done` label.

## Golden lifecycle cases

### Tunsil on `main`

`tunsil-absence-shock-v0 / attempt-001` is a valid submitted attempt. Its packet
terminates `requires_data_followup`; no `review.json` or `seal.json` is present,
and it is not end-to-end ready. Its next boundary is independent fresh-context
review, not publication or consumer use.

### Allen candidate branch

The Allen attempt-002 trace at
`claude/tiber-research-issue-13-audit-hjva4p@408770d9a6b41d13f166d5ef2a3139b4e4f98adb`
is the adversarial case for validity-gated action; it is not part of this
branch's runnable checkout. A passing review artifact can coexist with a
missing lifecycle event and no seal. When the underlying validator rejects
that composition, the gateway must show `PROTOCOL_INCONSISTENT` and no permitted
action. A file's presence and an agent's prose cannot upgrade custody state.

## Privacy and untrusted content

Default operator views do not emit retained source bodies, ledger records,
obvious credential material, recognized actor-session forms, absolute host
paths, stack traces, or machine JSON. Default
Markdown neutralizes entity, fence, and
control-character structure and applies presentation-only redaction to obvious
private/credential markers, host paths, actor-session forms, and stack traces.
Packet and proposal prose remain untrusted data to display, never instructions
for the gateway to execute. Explicit JSON is an unsanitized audit surface and
can retain sensitive untrusted prose. These structural and presentation checks
do not constitute semantic DLP, authentication, or permission to expose a
private run remotely.

## V0 stop boundary

V0 stops at intake and deterministic reads. The following require separate
design and operator authority:

- a full `research-study-proposal` or preregistration contract;
- durable intake persistence;
- operator elicitation and authentication;
- remote MCP/HTTP/product transport;
- provider dispatch or source acquisition;
- activation, execution, review, or sealing tools; and
- any Shared Reality, Forecast, Strategy, Fantasy, publication, or promotion
  transition.
