# Agent-entry v0 — contract decisions and contamination register

Status: **draft contract, not adopted, not activated**. Prepared for
[TIBER-Research issue #10](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/10)
Phase 0. Adoption requires operator review and merge. Nothing here authorizes a
live run, source acquisition, Shared Reality expansion, a User Zero execution,
or downstream authority.

This document records what Phase 0 **reused**, what it **decided**, and — in
section 4 — every place the protocol could plausibly lead an external agent
toward an expected thesis shape.

---

## 1. Audit result

The audit covered TIBER-Research #9 and #10, the Stage 0/Stage 1 contract set in
this repository, and a cross-repository search of all eleven TIBER repositories
for prior art on thesis representation, Shared Reality, and operator authority.

**Verdict: mostly reusable, with three genuine contract decisions required.**

### 1.1 Reused without modification

| Primitive | Source | Used for |
|---|---|---|
| `safeId`, `timestamp`, `nullableTimestamp`, `nonEmptyString`, `digest`, `stringList`, `idList` | `schemas/v0/common.schema.json` | Every identifier, string, and timestamp in the new contract `$ref`s these definitions directly. No new primitive types were introduced. |
| `epistemicClass` vocabulary (plus the packet-level `forecast`) | `common.schema.json`, `packet.schema.json` | `nodes[].epistemic_class` and `edges[].epistemic_class` use the identical eight-member enum the packet claim contract uses. |
| Causal node/edge geometry | `packet.schema.json` `causal_paths` | `nodes[]` / `edges[]` carry the same conceptual load: directed edges with `mechanism`, `evidence_refs`, `counterevidence_refs`, `uncertainty`, and `falsifiers`, validated acyclic. |
| `tiber-raw-sha256-v1` | `README.md` digest rules | `original_take.quote_digest_mode`, so a preserved take hashes the same way an operator direction quote does. |
| Verbatim-quote-plus-digest pattern | `research-operator-direction-record/v1` | `original_take` and `operator_confirmation` both preserve exact operator words rather than a paraphrase, following the pattern already used to bind operator direction. |
| `authority_state: "unpromoted"` / `downstream_authority: "none"` | `packet.schema.json` | Identical constants, so an agent proposal is as authority-inert as a research packet. |
| Missing-gap routing shape | `inputs.schema.json` `blocked_inputs`, `packet.schema.json` `unresolved` + `followups.rfi` | `missing_witnesses[]` reuses the "a gap must name what it blocks" rule that `rfi.unresolved_refs` established. |

### 1.2 Compatible prior art, deliberately not forked

`operator_signal_note_v0` (TIBER-Data, `docs/contracts/operator-signal-note-v0.md`)
is the closest existing primitive: it preserves `raw_note` verbatim, refuses to
invent context, keeps `uncertainty` explicit, and carries a `do_not_apply` rail.
Its posture and this protocol's are the same.

It was **not** reused as the wire format, for three reasons:

1. It is owned by TIBER-Data and lives in that repository's namespace
   (`$id: https://tiber-data.local/...`, not a resolvable URL). Issue #9 assigns
   causal-thesis lineage semantics to TIBER-Research.
2. Its grain is *note → detected metrics/entities*. The agent-entry grain is
   *take → causal structure*. Bending one into the other would damage both.
3. It has no representation for edges, alternative paths, Missing Witnesses,
   operator confirmation, or freeze state.

**Recommendation for a later phase:** if operator notes and operator takes both
persist, converge them rather than maintaining two vocabularies. That is a
cross-repository decision and is out of scope for Phase 0.

### 1.3 Genuine contract decisions required

#### Decision 1 — "Shared Reality" has no existing definition anywhere in TIBER

A search of all eleven repositories and an organization-wide code search returned
**zero** occurrences of the term in any form. It appears only in the prose of
issues #9 and #10. The nearest shipped analogue is TIBER-Fantasy's Reality Stack
promotion ladder (`docs/flf_reality_stack_promotion_gate_spec.md`), which governs
*how far a signal may influence a decision* — a related but distinct question.

Phase 0 must say something about Shared Reality, because the whole point is
teaching an external agent not to contaminate it.

**Decision taken:** define it **operationally and minimally**, from the agent's
point of view only — "governed TIBER evidence you did not create and cannot
change" — and give it exactly one representation: the `tiber_shared_reality`
value of `evidence_basis`, which the validator refuses unless the agent declared
a live TIBER tool. The protocol adds no promotion path, no admission criteria,
no ladder, and no schema of its own for Shared Reality.

**This is a provisional definition scoped to the agent-entry surface.** It is
deliberately too small to be the org-wide definition. Codifying that term
properly is a separate operator decision — flagged in section 5.

#### Decision 2 — `CausalThesisLineageV0` does not exist

Issue #9 lists it as a *candidate* primitive for "a later authorized task" and
explicitly does not authorize its implementation. Phase 0 cannot depend on it and
must not quietly become it.

**Decision taken:** define `agent-thesis-proposal/v0` as a strictly smaller,
**pre-freeze** object. It is a proposal, not a lineage record. It carries no
`observation_updates`, no `tree_extension_events`, no `decision_events`, no
`year_end_adjudication`, and no `carry_forward_implications` — all of which are
#9's, and all of which belong to the frozen object, not the proposal.

It is designed to be **forward-compatible**: `proposal_id`, stable `node_id` and
`edge_id` values, `original_cutoff`-shaped timestamps, and the counter-thesis
slot (`alternative_paths`) all map onto #9's field list when that contract is
authored. `relates_to_prior` is the seam where append-only growth will attach.

The schema states this in its own `description`, so the distinction survives
even if this document does not travel with it.

#### Decision 3 — the research packet cannot carry an operator thesis

`packet.schema.json` requires `job_id`, `job_version`, `run_id`, and
`attempt_id`, and the validator binds a packet to a frozen activation, admitted
sources, and a hash-chained ledger. An external agent, in a chat window, with no
TIBER run, cannot produce one — and should not, because a packet is *governed
research output* and a thesis proposal is *an operator's belief structured*.
Collapsing them would do exactly what #9 forbids: convert operator conviction
into shared TIBER truth by choice of container.

**Decision taken:** a new, run-independent contract. It shares vocabulary with
the packet but not lifecycle. Nothing in the Stage 0 custody chain was modified;
`src/validator.ts`, `src/preflight.ts`, and every existing schema are
byte-unchanged.

---

## 2. What was added

```text
docs/agent-entry/tiber-agent-entry-v0.md          the public agent-entry resource
docs/agent-entry/user-zero-test-procedure-v0.md   pilot procedure + evaluation criteria
docs/agent-entry/README.md                        index and URL registry
docs/contracts/agent-thesis-proposal-v0.md        this document
schemas/v0/agent-thesis-proposal.schema.json      the output contract
src/agentEntry.ts                                 cross-object checks
src/cli.ts                                        one new `agent-entry` subcommand
fixtures/agent-entry/example-minimal.json         smallest legal proposal
fixtures/agent-entry/example-ragged.json          deliberately non-tree proposal
test/agent-entry.test.ts                          32 positive and adversarial tests
package.json                                      `agent-entry:check`, added to `check`
```

### 2.1 Division of enforcement

The JSON Schema enforces shape, enums, and single-object coupling. `src/agentEntry.ts`
enforces what spans objects:

| Rule | Where |
|---|---|
| An assessed or observed node/edge must cite evidence | schema |
| Shared Reality evidence needs a locator, a retrieval path, and `verified: true` | schema |
| Recall (`agent_general_knowledge`) can never be `verified` | schema |
| A confirmed proposal must carry the operator's own confirmation text | schema |
| `freeze_state` is always `not_frozen`; evidence is always `promotable: false` | schema |
| A Missing Witness must name at least one thing it would resolve | schema |
| An unanswered clarification cannot have changed the structure | schema |
| Shared Reality evidence requires a declared live TIBER tool | checker |
| Inference and belief can never be marked `verified` | checker |
| A `supported` assessment cannot rest only on the agent's recall | checker |
| Every `*_refs` / `would_resolve` / `attached_to` reference resolves | checker |
| Node and edge id namespaces are disjoint; ids are unique | checker |
| Edges connect declared nodes, never a node to itself; the graph is acyclic | checker |

Agent output is read with `readJson`, **not** `readNormalizedJson`: it arrives
over a conversation from an arbitrary provider, so its byte form is not governed.
Only its meaning is checked. The two committed fixtures are additionally held to
`tiber-json-file-v1` by a test, because those are repository artifacts.

---

## 3. What Phase 0 deliberately does not do

- No share-tree UI, no viewer, no rendering surface.
- No agent memory, scheduler, watch, or recurring campaign.
- No automatic fantasy decision of any kind, at any layer.
- No Shared Reality expansion and no promotion path. `promotable` is a
  `const false` in the schema, not a default.
- No admission of any football evidence. The only two examples in the repository
  are non-football.
- No User Zero execution.
- No modification to any Stage 0 or Stage 1 contract, validator, or fixture.
- No thesis taxonomy. See section 4.

---

## 4. Contamination register

The operator's explicit constraint: discover what thesis geometry emerges,
rather than teach the agent what we expect. Every judgement call where the
protocol could lead the agent is recorded here, including the ones that remain
unresolved.

### 4.1 Confirmed clean

- **No test-list content.** The Let's Cook list was never requested, fetched,
  read, or inferred. No file in this change references it.
- **No test subjects.** No player, team, coach, or roster situation named in
  issues #9 or #10 — or anywhere else — appears in the protocol, the schema, the
  fixtures, or the tests. Both examples are about a bus.
- **No expected tree geometry.** The seed tree in #9 and #10 uses the category
  spine *Talent / Organizational commitment / Role / Competition / Environment /
  Fantasy translation*. **None of those six words appears as a category, an
  example, an enum value, or a suggestion anywhere in the delivered protocol.**
  This was the single highest contamination risk in the assignment, because
  those headings read as neutral vocabulary while actually being our expected
  answer.
- **No taxonomy.** No "breakout tree", "fade tree", "contingency tree", or any
  other named thesis type. Section 8.1 of the protocol states affirmatively that
  v0 defines no required shapes, and instructs the agent not to fill that gap.
- **No arity or depth guidance.** No suggested node count, depth, branching
  factor, or minimum structure. The protocol states that a one-node object is a
  correct result, and the minimal fixture is exactly that.
- **No football vocabulary in the schema.** The enums are epistemic
  (`observed`, `inferred`, `operator_belief`) and structural (`required`,
  `contributing`), never domain-specific. `subjects[].kind` is a free
  identifier rather than an enum precisely so that v0 does not pre-decide what
  kinds of things a take can be about.
- **No worked football example.** The illustrative decomposition in issue #10
  ("player capability → incumbent displaceable → team grants role → role
  produces opportunity") is expected geometry and was deliberately excluded.

### 4.2 Residual risks — accepted, with reasoning

These could not be eliminated without making the protocol unusable. They are
listed so they can be weighed at review and watched during the pilot.

| # | Risk | Judgement |
|---|---|---|
| R1 | **The two fixtures imprint *some* shape.** One is a single node; the other is a three-node, one-edge, deliberately disconnected graph. An agent that reads them may anchor on those arities. | Mitigated three ways: the examples are non-football, they are structurally *different from each other*, and the second is deliberately ragged — an isolated node, an evidence-free edge — so that neither reads as a template. A test asserts the ragged example keeps an unconnected node, so the anti-template property cannot silently regress. Residual imprint is judged small but real. |
| R2 | **The vocabulary itself is a lens.** Offering `nodes`, `edges`, `mechanism`, `necessity`, `falsifiers`, and `alternative_paths` predisposes the agent toward causal-graph thinking. A take whose natural structure is not a graph may get bent into one. | Unavoidable: the assignment is to produce a structured causal representation, and #9 fixes node/edge as the lineage primitive. Partly mitigated by permitting empty `nodes` and `edges`, by section 8.2 framing these as "available moves, not a checklist", and by making a one-node object explicitly correct. **Worth watching in the pilot:** if operators' takes routinely resist the graph, that is a finding about the primitive, not about the agent. |
| R3 | **`necessity: required \| contributing \| unclear` is a small imposed theory** of how dependencies work. | Judged worth it: the distinction between "impossible without" and "helped by" is exactly what makes a thesis inspectable, and `unclear` is always available. Flagged for review; it is the field most likely to deserve deletion if the pilot finds it unused or misused. |
| R4 | **`alternative_paths[].relation` offers four named relations.** An agent may reach for whichever is nearest rather than the true one. | `unclear` is available, and `relation` describes the *relationship between paths*, not the thesis's own shape — so it constrains less than a taxonomy would. Lower risk than R3. |
| R5 | **Section 8.2's list of moves** (dependencies, alternatives, uncertainty, falsifiers, Missing Witnesses, unsupported assumptions) is a checklist in effect, whatever it says in words. | Explicitly framed as optional, with "It is normal for most of these to be absent from any given proposal." Cannot be removed without losing the useful behavior #10 asks for. **The clearest measurable symptom would be every proposal carrying one of each** — evaluation criterion E8 in the test procedure watches for exactly that. |
| R6 | **Asking for `thesis_falsifiers` may induce invented falsifiers.** | The protocol says a falsifier the operator names is worth far more than one the agent invents, and requires the text to mark agent-supplied ones. The array may be empty. |
| R7 | **"One take, one proposal"** is a granularity constraint that could split or merge against the operator's intent. | Mitigated by requiring the agent to *ask* rather than split silently. Judged the least-leading of the available options. |

### 4.3 Anti-contamination properties worth keeping

Three design choices actively work against contamination and should survive any
revision:

1. **`origin` on every node and edge** (`verbatim_in_take` /
   `operator_clarification` / `agent_proposed`) makes agent imposition
   *countable*. If a pilot proposal is 80% `agent_proposed`, the object records
   that, in itself, without anyone having to judge it.
2. **`clarifications[].changed_structure`** makes clarification burden
   *countable* — including the questions that turned out to be worthless.
3. **`agent_declaration.self_reported_concerns`**, with the protocol explicitly
   inviting the agent to report a sense of imposing structure, turns the
   contamination question into pilot data rather than a reviewer's guess.

---

## 5. Unresolved operator decisions

None of these block the pilot. All of them should be settled before this
protocol is used beyond User Zero.

1. **Codify "Shared Reality", or don't.** Phase 0 uses a provisional, agent-facing
   definition because no org-wide one exists. Either promote it to a real
   cross-repository contract, or accept that it stays a local term of art.
2. **Which URL is handed to User Zero** — the commit-pinned raw URL (immutable,
   correct for a frozen-protocol experiment) or the `main` raw URL (stable
   address, mutable content). The test procedure recommends the pinned one.
   See `docs/agent-entry/README.md`.
3. **Where confirmed proposals are stored.** Phase 0 defines the wire format
   only. Custody, workspace boundaries, and privacy for operator thesis state are
   #10 open questions and remain open.
4. **Whether `necessity` survives** (risk R3).
5. **Convergence with `operator_signal_note_v0`** (section 1.2), a
   cross-repository decision with TIBER-Data.
6. **Whether v0.1 should add a `list_bundle` wrapper** so an entire Let's Cook
   list round-trips as one artifact. Phase 0 deliberately kept one take per
   object; the pilot will show whether that is awkward in practice.

---

## 6. Verification

`npm run check` passes: typecheck, 339 tests (32 new; baseline 307), the
synthetic fixture end-to-end, both Stage 1 preflight packages unchanged, and
both agent-entry examples.

The Stage 0 and Stage 1 surfaces are untouched. `schemas/v0/common.schema.json`,
`packet.schema.json`, `inputs.schema.json`, `job.schema.json`, every `schemas/v1/`
contract, `src/validator.ts`, `src/preflight.ts`, the synthetic fixture, and both
preflight packages are byte-identical to `main`. The only changes to existing
files are one new import and one new subcommand in `src/cli.ts`, and two script
entries in `package.json`.
