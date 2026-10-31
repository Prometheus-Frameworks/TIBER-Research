## Purpose

Build the smallest real user-facing pilot of the causal-thesis-lineage architecture from #9: an operator should be able to bring an informal **“Let’s Cook” list** of bold football/fantasy takes to an agent, have the agent help turn those takes into governed causal thesis trees, and receive a **shareable human-readable tree link**.

This is deliberately an operator-first pilot. We will use it on ourselves before inviting an outside user.

The goal is not to build a TIBER chatbot or a consensus-correction engine. The goal is to create the **door handle** through which a user and their preferred agent can enter TIBER’s research environment.

## Core principle

> **TIBER should challenge the completeness of a thesis, not the operator’s right to hold it.**

An agent may help the operator expose causal dependencies, alternatives, counterpaths, uncertainties, falsifiers, Missing Witnesses, and relevant Shared Reality. It must not silently replace the operator’s thesis with consensus or convert an operator belief into shared TIBER truth.

The human should be able to speak naturally. The agent absorbs the schema/governance complexity.

Example:

> “I think this guy is going to smash because they’ll use him in the slot and I don’t think the veteran ahead of him is that good.”

The agent may reflect:

> “Your thesis appears to depend on (1) player capability, (2) the incumbent being displaceable, (3) the team granting the role if earned, and (4) that role producing enough opportunity to matter. Is that a fair representation?”

The operator’s confirmation binds the thesis. The agent does not get to manufacture the answer.

## Pilot A — working Jeremiyah Love share tree

Create one real, navigable/shareable thesis tree using the prospective Jeremiyah Love Year-1 seed from #9.

Initial tree:

```text
Jeremiyah Love
│
├── Talent
│   └── prospect profile + preseason translation
│
├── Organizational commitment
│   └── extremely high draft capital
│
├── Role
│   ├── expected heavy workload
│   └── receiving involvement
│
├── Competition
│   └── Allgeier is competent
│
├── Environment
│   ├── LaFleur / Rams-McVay lineage
│   └── expected passing-offense improvement
│
└── Fantasy translation
    └── PPR receiving + workload → high ceiling
```

The share surface should make clear:

- operator hypothesis / authorship;
- original cutoff / frozen version;
- causal branches and edges;
- Shared Reality evidence attached to a branch;
- operator inference versus observed evidence;
- supporting evidence and counterevidence;
- unresolved assumptions / Missing Witnesses;
- branch state such as supported / challenged / unresolved / unobserved;
- append-only updates/unlocks without rewriting the original tree;
- enough context that another person can understand **how the operator thought about the player**, not merely see a final rank or score.

A share recipient must not need edit authority to inspect the tree.

### Non-goal

Do not adjudicate whether the Love thesis is correct as part of building the viewer. This is a prospective golden trace: freeze the reasoning first and let the 2026 season provide the evidence later.

## Pilot B — agent-ready Let’s Cook entry link

Provide a stable public/shareable entry resource that can be handed to a capable external agent (ChatGPT, Claude, Grok, future local agents, etc.).

Conceptually:

```text
operator → sends agent TIBER entry link
         → agent reads thesis/governance instructions
         → agent asks for Let’s Cook list
         → operator pastes informal notes
         → agent proposes structured thesis trees
         → operator confirms/corrects
         → confirmed trees enter operator workspace
         → TIBER can track/replay them over time
```

The entry resource should be agent-readable without requiring the agent to understand the entire TIBER repository architecture.

At minimum it must explain:

1. operator claims are not Shared Reality;
2. preserve original wording and provenance;
3. separate observation, inference, hypothesis, and prediction;
4. decompose a take into causal nodes/edges where useful;
5. surface plausible missing branches and alternative paths rather than forcing a correction;
6. use TIBER Shared Reality to ground questions when available;
7. identify unsupported assumptions and Missing Witnesses explicitly;
8. never fabricate evidence to complete a tree;
9. require operator confirmation before freezing a thesis;
10. append later updates rather than rewriting the original belief state.

## UAV / agent-guidance requirement

The agent should function as a research scaffold.

Examples of useful behavior:

### Caleb Douglas

If the operator says Douglas is a breakout candidate, the agent should be able to inspect/surface paths such as:

- talent/prospect thesis;
- organizational commitment;
- current depth-chart access;
- target competition;
- route/first-team access;
- QB/offensive environment;
- market price;
- role-growth triggers.

It should distinguish “Douglas is good” from “Douglas is underpriced” and from “Douglas has a plausible path to targets.”

### Zachariah Branch

If an incumbent currently owns the relevant role, the agent should expose that role-access dependency rather than simply correcting the operator:

```text
Branch breakout
  → player capability
  → incumbent role obstacle
  → path to displace / route around incumbent
  → first-team access trigger
  → opportunity if role opens
  → fantasy translation
```

### Vacated-role thesis

If an operator believes a player will inherit another player’s vacated role, the agent should help test whether that role is genuinely unclaimed, redistributed elsewhere, or structurally changed. The purpose is to reveal the causal terrain around the operator’s claim.

## Operator workspace boundary

A user’s thesis tree belongs to that operator/workspace.

Shared TIBER evidence may be referenced by many operators, but one operator’s beliefs must not mutate Shared Reality or another operator’s thesis.

Future example:

- Operator A shares “Jeremiyah Love Year-1 thesis.”
- Operator B forks it or creates “Jadarian Price > Love.”
- TIBER can compare the structures and identify where the disagreement actually lives.

A future comparison might report that both operators agree on player talent but disagree on workload concentration, receiving involvement, or relative market value. It must not declare a winner merely because one tree differs from consensus.

## Share / fork direction

The first viewer only needs a shareable read path, but design the identity/provenance shape so a future recipient can intentionally **fork** a thesis without editing the original.

Fork provenance should retain:

- source thesis identity/version;
- source operator attribution subject to privacy settings;
- fork cutoff;
- which nodes/edges were inherited;
- which were changed or added by the new operator.

## First user experiment

Joe will act as the first external-style user after the Love share tree and agent entry resource exist.

Test protocol:

1. Start from a raw personal “Let’s Cook” list written as informal one-line takes.
2. Give the list to an agent using only the public TIBER agent-entry instructions plus normal TIBER tools available to that agent.
3. Do not manually construct the trees for the agent.
4. Observe whether the agent can:
   - preserve the user’s actual claim;
   - ask useful clarifying questions without turning intake into a form;
   - discover relevant causal paths from TIBER;
   - expose alternatives/counterpaths;
   - distinguish evidence from operator inference;
   - produce a tree the operator recognizes as their reasoning;
   - freeze it only after operator confirmation.
5. Share at least one resulting tree through the same viewer used for the Love golden trace.
6. Record friction/failure cases as pilot findings rather than silently tuning the output after the fact.

Only after this self-pilot succeeds should we invite an outside user to import their own Let’s Cook list.

## Acceptance criteria for v0

- [ ] A real Jeremiyah Love prospective thesis exists as a durable `CausalThesisLineageV0`-compatible artifact/object.
- [ ] It has a stable read-only share link usable from a phone/browser.
- [ ] The share view visibly separates operator belief from Shared Reality/evidence.
- [ ] Original thesis version/cutoff cannot be silently rewritten by later updates.
- [ ] A stable agent-ready entry link/resource exists.
- [ ] The agent instructions are provider-neutral; they do not require ChatGPT, Claude, or any specific vendor.
- [ ] An agent can ingest a plain-text Let’s Cook list and propose draft trees without the user manually filling schema fields.
- [ ] Operator confirmation is required before a draft thesis becomes frozen.
- [ ] Missing Witnesses / unsupported branches remain visible rather than auto-filled.
- [ ] Joe completes one end-to-end self-pilot from raw Let’s Cook list → agent-guided tree → frozen thesis → share link.
- [ ] Pilot failures and usability friction are documented before inviting an outside tester.

## Architecture constraints

- Reuse the causal-thesis-lineage concepts from #9; do not invent a second incompatible thesis model just for sharing.
- Shared Reality, TIBER interpretation, and operator decision/belief state remain distinct authority layers.
- The agent is an assembly/guidance interface, not an authority source.
- A share link must never grant write authority by possession alone.
- Do not require users to understand repository/schema vocabulary to participate.
- Prefer a small protocol + durable storage + human-readable viewer over a large bespoke chatbot/dashboard.
- No automatic fantasy transactions, rankings changes, or downstream writes are authorized by this pilot.

## Open design questions to answer during implementation

- Where should private operator thesis state live versus publicly shareable projections of it?
- What minimum authentication is required to create/update a workspace while keeping read-only sharing easy?
- What exact public resource should agents consume (e.g. `llms.txt`, agent guide, schema endpoint, MCP/App tool description, or a combination)?
- How should an agent retrieve Shared Reality evidence without receiving authority to mutate it?
- What is the smallest useful visual representation of branch status and lineage on mobile?
- How should privacy/anonymity work before outside-user testing?

## Related

- #9 — causal thesis lineage v0 / Love + Jeanty golden traces
- TIBER-Research #3/#7 — first governed Research golden trace and bounded causal-path/RFI machinery
- TIBER-Fantasy canonical identity pilot — stable entity identity should be reused rather than matching thesis subjects by display name

## Terminal v0 success condition

A user can take an informal football take from their Notes app, give it to an agent through a TIBER entry link, recognize the resulting causal tree as **their own reasoning made clearer**, freeze it, and send another human a read-only link showing how they thought about the player.

That is the first door handle.