import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { checkAgentThesisProposal } from "../src/agentEntry.js";
import { normalizedJsonText } from "../src/io.js";

type JsonObject = Record<string, any>;

const MINIMAL = "fixtures/agent-entry/example-minimal.json";
const RAGGED = "fixtures/agent-entry/example-ragged.json";

function readFixtureText(relativePath: string): string {
  return readFileSync(resolve(relativePath), "utf8");
}

function fixture(relativePath: string): JsonObject {
  return JSON.parse(readFixtureText(relativePath)) as JsonObject;
}

/** Deep clone so each adversarial case mutates an independent copy. */
function mutate(
  relativePath: string,
  change: (value: JsonObject) => void,
): JsonObject {
  const value = fixture(relativePath);
  change(value);
  return value;
}

function assertRejected(value: unknown, fragment: string): void {
  const errors = checkAgentThesisProposal(value);
  assert.ok(
    errors.some((error) => error.includes(fragment)),
    `expected an error containing ${JSON.stringify(fragment)}, got ${JSON.stringify(errors)}`,
  );
}

test("both published examples validate", () => {
  for (const path of [MINIMAL, RAGGED]) {
    assert.deepEqual(checkAgentThesisProposal(fixture(path)), [], path);
  }
});

test("published examples are stored in the normalized JSON file form", () => {
  for (const path of [MINIMAL, RAGGED]) {
    assert.equal(readFixtureText(path), normalizedJsonText(fixture(path)), path);
  }
});

test("the examples demonstrate different geometries", () => {
  const minimal = fixture(MINIMAL);
  const ragged = fixture(RAGGED);

  // A one-node, zero-edge proposal is a complete and valid result.
  assert.equal(minimal.nodes.length, 1);
  assert.equal(minimal.edges.length, 0);

  // The second example is deliberately ragged rather than a connected tree:
  // at least one node participates in no edge at all.
  const touched = new Set<string>();
  for (const edge of ragged.edges) {
    touched.add(edge.from_node);
    touched.add(edge.to_node);
  }
  const isolated = ragged.nodes.filter(
    (node: JsonObject) => !touched.has(node.node_id),
  );
  assert.ok(
    isolated.length > 0,
    "the ragged example must keep at least one unconnected node",
  );
});

test("examples carry no promotable evidence and no downstream authority", () => {
  for (const path of [MINIMAL, RAGGED]) {
    const value = fixture(path);
    assert.equal(value.authority_state, "unpromoted", path);
    assert.equal(value.downstream_authority, "none", path);
    assert.equal(value.freeze_state, "not_frozen", path);
    for (const item of value.evidence) {
      assert.equal(item.promotable, false, path);
    }
  }
});

test("a frozen thesis can never be emitted by an agent", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.freeze_state = "frozen";
    }),
    "schema:",
  );
});

test("an unconfirmed proposal may not carry a confirmation", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.proposal_state = "awaiting_operator_confirmation";
    }),
    "/operator_confirmation",
  );
});

test("a confirmed proposal must carry the operator's own confirmation", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.operator_confirmation = null;
    }),
    "/operator_confirmation",
  );
});

test("an altered take cannot claim verbatim preservation", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.original_take.verbatim_preserved = false;
    }),
    "/original_take/verbatim_preserved",
  );
});

test("a digest mode without a digest is rejected", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.original_take.quote_digest_mode = "tiber-raw-sha256-v1";
    }),
    "/original_take/quote_digest_mode",
  );
});

test("shared-reality evidence requires a live TIBER tool", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.evidence[0].basis = "tiber_shared_reality";
      value.evidence[0].retrieved_via = "some tiber lookup";
      value.evidence[0].verified = true;
    }),
    'requires evidence_access "tiber_tool_available"',
  );
});

test("shared-reality evidence requires a locator and a retrieval path", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.agent_declaration.evidence_access = "tiber_tool_available";
      value.evidence[0].basis = "tiber_shared_reality";
      value.evidence[0].verified = true;
      value.evidence[0].retrieved_via = null;
    }),
    "/evidence/0/retrieved_via",
  );
});

test("recall may never be marked verified", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.evidence[0].basis = "agent_general_knowledge";
      value.evidence[0].verified = true;
    }),
    "/evidence/0/verified",
  );
});

test("inference and belief are never retrievals", () => {
  for (const basis of ["agent_inference", "operator_belief"]) {
    assertRejected(
      mutate(RAGGED, (value) => {
        value.evidence[0].basis = basis;
        value.evidence[0].verified = true;
      }),
      "it is not a retrieval",
    );
  }
});

test("recall alone cannot support an assessment", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.evidence[0].basis = "agent_general_knowledge";
      value.evidence[0].verified = false;
    }),
    "cannot rest only on agent_general_knowledge",
  );
});

test("an assessed element must cite evidence", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.nodes[0].assessment = "supported";
    }),
    "/nodes/0/evidence_refs",
  );
});

test("an observation without evidence is not an observation", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.nodes[2].epistemic_class = "observed";
    }),
    "/nodes/2/evidence_refs",
  );
});

test("evidence created by nothing cannot be referenced", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.nodes[1].evidence_refs = ["ev-does-not-exist"];
    }),
    "does not resolve to a evidence",
  );
});

test("edges must connect declared nodes", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.edges[0].from_node = "n-does-not-exist";
    }),
    "from_node does not resolve to a node",
  );
});

test("an edge may not connect a node to itself", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.edges[0].from_node = value.edges[0].to_node;
    }),
    "connects a node to itself",
  );
});

test("the causal graph must be acyclic", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.edges.push({
        edge_id: "e-cycle",
        from_node: "n-lateness",
        to_node: "n-relocation",
        mechanism: "A deliberately circular mechanism for the adversarial case.",
        origin: "agent_proposed",
        basis: "agent_inference",
        epistemic_class: "inferred",
        assessment: "unassessed",
        necessity: "unclear",
        evidence_refs: [],
        counterevidence_refs: [],
        uncertainty: null,
        falsifiers: [],
      });
    }),
    "contains a cycle",
  );
});

test("node and edge identifiers must not collide", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.edges[0].edge_id = "n-lateness";
      value.missing_witnesses[0].would_resolve = ["n-lateness"];
    }),
    "share the id",
  );
});

test("a Missing Witness must resolve something that exists", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.missing_witnesses[0].would_resolve = ["e-does-not-exist"];
    }),
    "would_resolve does not resolve to a node or edge",
  );
});

test("a Missing Witness must resolve something at all", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.missing_witnesses[0].would_resolve = [];
    }),
    "/missing_witnesses/0/would_resolve",
  );
});

test("unsupported assumptions must attach to real elements", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.unsupported_assumptions[0].attached_to = ["n-does-not-exist"];
    }),
    "attached_to does not resolve to a node or edge",
  );
});

test("duplicate identifiers are rejected", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.nodes[2].node_id = "n-lateness";
    }),
    "duplicate node_id",
  );
});

test("an unanswered clarification cannot have changed the structure", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.clarifications[1].changed_structure = true;
    }),
    "/clarifications/1/changed_structure",
  );
});

test("an answered clarification must record the answer", () => {
  assertRejected(
    mutate(RAGGED, (value) => {
      value.clarifications[0].answer = null;
    }),
    "/clarifications/0/answer",
  );
});

test("a fetched protocol must say where it was fetched from", () => {
  assertRejected(
    mutate(MINIMAL, (value) => {
      value.protocol_ref.retrieved_from = null;
    }),
    "retrieved_from is required",
  );
});

test("a protocol worked from memory may not claim a retrieval source", () => {
  assertRejected(
    mutate(MINIMAL, (value) => {
      value.protocol_ref.retrieval_state = "unavailable_worked_from_memory";
    }),
    "retrieved_from must be null",
  );
});

test("a proposal cannot relate to itself", () => {
  assertRejected(
    mutate(MINIMAL, (value) => {
      value.relates_to_prior = {
        prior_proposal_id: value.proposal_id,
        relationship: "operator_stated_update",
        note: null,
      };
    }),
    "cannot relate to itself",
  );
});

test("unknown fields are rejected rather than silently carried", () => {
  assertRejected(
    mutate(MINIMAL, (value) => {
      value.recommended_action = "start him";
    }),
    "schema:",
  );
});

test("empty arrays are required rather than omitted", () => {
  assertRejected(
    mutate(MINIMAL, (value) => {
      delete value.missing_witnesses;
    }),
    "schema:",
  );
});
