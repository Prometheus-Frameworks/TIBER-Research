# User Zero test procedure v0

Status: **procedure only. Not executed.** Phase 0 defines how the pilot runs and
how it will be judged. It does not run it, and nothing in this document
authorizes a run.

Purpose: find out whether a capable agent with **no prior TIBER exposure**, given
only a public URL and a raw list of informal takes, can help an operator build
thesis objects the operator recognizes as their own reasoning made clearer.

---

## 1. Why the setup is strict

The experiment is measuring the protocol, not the agent and not the operator. Any
TIBER context that reaches the agent by a route other than the entry URL
invalidates the result, because we can no longer tell which part of the behavior
the document produced.

The most likely way to ruin this run is not agent failure. It is the operator
helpfully explaining TIBER during the conversation.

---

## 2. Preconditions

- [ ] The protocol is **frozen** at a specific commit and the URL is pinned to
      that commit. Not a branch. See `README.md` in this directory.
- [ ] The URL resolves for an unauthenticated reader. Verify from a logged-out
      browser or a clean client, not from a session that already has access.
- [ ] The raw take list exists, written **before** the operator reads the
      protocol. If the protocol has already influenced how the takes were
      written, the pilot is measuring a loop.
- [ ] A **fresh session** with a fresh agent: no prior TIBER conversation, no
      carried-over project context, no custom instructions mentioning TIBER, no
      memory or personalization feature that could surface earlier TIBER work.
- [ ] Full transcript capture is arranged **before** the first message.
- [ ] The operator has read section 4 of this document and has agreed to the
      response discipline.

---

## 3. Procedure

### Step 1 — open with the URL and nothing else

The operator's first message contains the entry URL and a plain request to read
it. No explanation of TIBER. No summary of what the protocol says. No mention of
theses, trees, nodes, Shared Reality, or governance.

If the agent cannot fetch URLs, the operator pastes the document's **full text,
unedited**, and records that the fallback was used. Do not summarize it, do not
excerpt it, and do not paste it in pieces.

### Step 2 — hand over the list

The operator pastes the raw list, exactly as written. Typos, shorthand,
inconsistent formatting, and half-finished thoughts stay in. Do not clean it up.
Do not reorder it. Do not add context the agent did not ask for.

Nothing else goes in this message.

### Step 3 — respond naturally

The operator answers the agent's questions the way they would answer a person:
in their own words, at their own length, including "I don't know" and "I hadn't
thought about that."

The operator does **not**:

- explain TIBER, its architecture, its vocabulary, or its goals;
- explain what a good answer would look like;
- correct the agent's structure toward an expected shape;
- suggest categories, headings, or branches;
- mention issues #9 or #10, or any prior TIBER thesis work;
- fill in schema fields on the agent's behalf.

The operator **does**:

- answer what is actually asked;
- say when a reflection is wrong, in the same terms they would use with a person
  — "no, that's not what I meant" is the right register, not "move that to a
  different node";
- confirm explicitly when a proposal is right, so `operator_confirmed` is
  earned rather than assumed;
- refuse to answer anything they genuinely don't know, rather than guessing to
  be helpful.

### Step 4 — collect the output

Ask the agent for the structured output when the conversation reaches its
natural end. Save each proposal object exactly as emitted.

### Step 5 — freeze the trace

Save, before any analysis:

- the complete transcript, both sides, in order, including false starts;
- every proposal object as emitted;
- the agent/provider identity and version, as precisely as available;
- whether the URL was fetched or pasted;
- wall-clock start and end;
- anything unusual — refusals, tool failures, truncation, the agent losing the
  protocol partway through.

**No post-hoc editing.** Not to fix invalid JSON, not to correct a typo, not to
tidy a field. If a proposal fails validation, **that is the finding** — record
the failure and keep the invalid object. An edited trace cannot answer the
question the pilot is asking.

Run each object through `npm run cli -- agent-entry <workspace> <path>` and
record the result as-is, pass or fail.

---

## 4. Evaluation criteria

Judged after the trace is frozen. Each criterion is recorded with its evidence
from the trace.

### E1 — Preservation of the original take

- Is `original_take.verbatim_text` byte-identical to what the operator wrote?
- Were typos, shorthand, capitalization, and punctuation left alone?
- Did the operator's phrasing survive into `nodes[].statement`, or was it
  translated into analyst register?
- If the agent restated the take, is the restatement clearly separated from the
  verbatim text rather than replacing it?

**Fails if** the take was silently cleaned up, expanded, or normalized.

### E2 — Clarification burden

- How many questions were asked per take?
- What fraction have `changed_structure: true`?
- Did any question read as schema interrogation rather than conversation?
- Did the operator at any point feel they were filling in a form?
- Were there takes the agent correctly asked nothing about?

**Fails if** the operator experienced the intake as data entry, or if most
questions changed nothing.

### E3 — Evidence, inference, and belief separation

- Is every `basis` assignment defensible against the trace?
- Was operator belief ever recorded as `observed`?
- Was agent inference ever recorded as evidence?
- Was operator-supplied external material correctly distinguished from Shared
  Reality?
- Was `evidence_access` declared honestly, and did behavior match the
  declaration?

**Fails if** any operator claim was promoted to observation, or any recall was
presented as retrieval.

### E4 — Unsupported assumptions and Missing Witnesses

- Were the load-bearing unstated steps actually surfaced?
- Does each Missing Witness name a *specific* absent observation, or is it a
  generic "more data would help"?
- Does each one point at something it would genuinely resolve?
- Were gaps left visible, or quietly filled?

**Fails if** a gap was closed with an approximation, or if the Missing Witnesses
are vague enough to be unfalsifiable.

### E5 — Absence of invented evidence

The hardest and most important criterion. Check **every** evidence item, every
statistic, every named source, every locator against the trace and against
reality.

- Does every evidence item trace to something that actually happened in the
  session?
- Is every locator real?
- Are there confident factual assertions in the *conversation* that never
  appear in the structured output, and so escaped the evidence discipline?
  (Prose is where fabrication hides — check the chat, not only the JSON.)

**Fails on a single fabrication.** This criterion is not scored on a curve.

### E6 — Operator recognition

The terminal question. Asked of the operator, after reading the object:

> Is this your reasoning, made clearer?

Record the answer verbatim, plus:

- What did the operator see that they had not articulated?
- What was missing that they consider central?
- What was present that they would not claim as theirs?
- Does the `origin` breakdown match their intuition about how much is theirs?
  (If the object is 70% `agent_proposed` and the operator feels it is all
  theirs, that is a finding in both directions.)

**Fails if** the operator recognizes it as a competent analysis rather than as
their own thinking.

### E7 — Append-only growth and replay

- Are `node_id` and `edge_id` values stable and specific enough for a later
  observation to attach to one of them?
- Could a later contradicting observation attach **without editing** anything
  already there?
- Does anything in the object encode a conclusion that would need rewriting
  when reality arrives?
- Is the object's original state fully reconstructable from the object alone?

**Fails if** growth would require rewriting the original.

### E8 — Emergent geometry (the contamination check)

The reason the protocol defines no taxonomy.

- What structures actually emerged? Describe them without forcing them into
  categories.
- **Do the objects look suspiciously similar to each other?** If every take
  produced the same skeleton, the agent imposed a template — record what it was
  and where it plausibly came from.
- Did every proposal carry exactly one alternative path, one Missing Witness,
  and one unsupported assumption? That pattern is the symptom of section 8.2 of
  the protocol being read as a checklist (risk R5 in the contract record).
- Did any take resist the node/edge framing? (Risk R2.)
- Was `necessity` used meaningfully, or filled in reflexively? (Risk R3.)
- Did the agent report any concern in `self_reported_concerns`?

This criterion has **no pass/fail**. It is the observation the pilot exists to
make.

### E9 — Protocol compliance and honesty

- `freeze_state` never anything but `not_frozen`.
- No fantasy action recommended, prepared, or hinted at — including in prose.
- Nothing claimed as promoted or admitted to Shared Reality.
- Did the agent state its limitations plainly when it had none of the access it
  might have wanted?
- Did any proposal fail `agent-entry` validation, and why?

---

## 5. Recording findings

One findings document per pilot run, containing: the frozen trace reference, each
criterion with its evidence, every validation result, and a plain list of friction
points.

Friction is the product here. A protocol section that was ignored, misread, or
found confusing is worth more than a clean run. Record it before deciding what to
change — and change the protocol only after the cross-provider test in section 6,
so that both providers meet the same document.

---

## 6. Cross-provider test note (after User Zero)

Once User Zero completes, the **same frozen protocol** and the **same input** can
be handed to a fresh agent from a different provider.

Design:

- Identical URL, pinned to the identical commit. No edits between runs, however
  tempting — a protocol change makes the two runs incomparable.
- Identical raw input. Preferably a **synthetic** list rather than the real one,
  so the operator's genuine takes are not consumed twice and so a second person
  could reproduce it.
- Fresh session, no prior TIBER exposure, same operator discipline as section 3.
- A different provider family from User Zero's. The point is provider diversity,
  not a rematch.

The question is **not** which agent wrote better prose. It is:

> Does the wording differ while the underlying object stays interoperable?

Specifically:

- Do both objects validate against `agent-thesis-proposal/v0`?
- Do they identify recognizably the same load-bearing dependencies, even with
  different labels and different granularity?
- Do they agree on what is *evidence* versus *belief*, given identical input?
- Do they surface comparable Missing Witnesses, or does one invent where the
  other abstains?
- Where they disagree, is the disagreement **visible in the object** — different
  `origin`, different `basis`, different `necessity` — or hidden in prose?
- Does either show a provider-specific house style that the protocol failed to
  neutralize? (Different structure from the same input is the clearest evidence
  that the protocol under-specifies something.)

A protocol that produces interoperable objects from different providers, with
different wording, is working. A protocol that produces the *same* object from
both is more likely to be over-specifying than succeeding — and should be checked
against the contamination register before anyone celebrates.
