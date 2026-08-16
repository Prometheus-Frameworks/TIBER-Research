import { validateSchema } from "./schema.js";

export const AGENT_THESIS_PROPOSAL_SCHEMA_ID =
  "https://schemas.tiber.dev/research/v0/agent-thesis-proposal.schema.json";

/**
 * Cross-field checks for `agent-thesis-proposal/v0`.
 *
 * The JSON Schema enforces shape, enums, and the single-object coupling rules
 * (assessed elements cite evidence; Shared Reality evidence carries a locator).
 * These checks enforce the rules that span objects: reference integrity, id
 * disjointness, acyclicity, and the two anti-fabrication invariants that depend
 * on the declared evidence access.
 *
 * Agent output arrives over a wire from an arbitrary provider, so this checker
 * deliberately does not require `tiber-json-file-v1` byte normalization. Only
 * meaning is governed here, not formatting.
 */

interface Identified {
  readonly [key: string]: unknown;
}

interface Proposal {
  readonly proposal_id: string;
  readonly agent_declaration: { readonly evidence_access: string };
  readonly protocol_ref: {
    readonly retrieval_state: string;
    readonly retrieved_from: string | null;
  };
  readonly subjects: readonly Identified[];
  readonly nodes: readonly Identified[];
  readonly edges: readonly Identified[];
  readonly evidence: readonly Identified[];
  readonly alternative_paths: readonly Identified[];
  readonly missing_witnesses: readonly Identified[];
  readonly unsupported_assumptions: readonly Identified[];
  readonly clarifications: readonly Identified[];
  readonly relates_to_prior: { readonly prior_proposal_id: string } | null;
}

export function checkAgentThesisProposal(value: unknown): string[] {
  const schemaResult = validateSchema(AGENT_THESIS_PROPOSAL_SCHEMA_ID, value);
  if (!schemaResult.valid) {
    return schemaResult.errors.map(
      (error) =>
        `schema: ${error.instancePath === "" ? "/" : error.instancePath} ${error.message}`,
    );
  }

  const proposal = value as Proposal;
  const errors: string[] = [];

  const subjectIds = collectIds(
    proposal.subjects,
    "subject_id",
    "subjects",
    errors,
  );
  const nodeIds = collectIds(proposal.nodes, "node_id", "nodes", errors);
  const edgeIds = collectIds(proposal.edges, "edge_id", "edges", errors);
  const evidenceIds = collectIds(
    proposal.evidence,
    "evidence_id",
    "evidence",
    errors,
  );
  collectIds(proposal.alternative_paths, "path_id", "alternative_paths", errors);
  collectIds(
    proposal.missing_witnesses,
    "witness_id",
    "missing_witnesses",
    errors,
  );
  collectIds(
    proposal.unsupported_assumptions,
    "assumption_id",
    "unsupported_assumptions",
    errors,
  );
  collectIds(
    proposal.clarifications,
    "question_id",
    "clarifications",
    errors,
  );

  // `would_resolve` and `attached_to` address nodes and edges in one namespace,
  // so a shared id would make those references ambiguous.
  for (const id of nodeIds) {
    if (edgeIds.has(id)) {
      errors.push(`node and edge share the id: ${id}`);
    }
  }
  const elementIds = new Set([...nodeIds, ...edgeIds]);

  const evidenceBasis = new Map<string, string>();
  for (const item of proposal.evidence) {
    const id = stringField(item, "evidence_id");
    const basis = stringField(item, "basis");
    if (id !== undefined && basis !== undefined) {
      evidenceBasis.set(id, basis);
    }
  }

  checkEvidenceAccess(proposal, errors);
  checkProtocolRef(proposal, errors);

  proposal.nodes.forEach((node, index) => {
    const label = `nodes[${index}]`;
    checkRefs(node, "evidence_refs", evidenceIds, "evidence", label, errors);
    checkRefs(node, "subject_refs", subjectIds, "subject", label, errors);
    checkSupportQuality(node, evidenceBasis, label, errors);
  });

  proposal.edges.forEach((edge, index) => {
    const label = `edges[${index}]`;
    checkRefs(edge, "evidence_refs", evidenceIds, "evidence", label, errors);
    checkRefs(
      edge,
      "counterevidence_refs",
      evidenceIds,
      "evidence",
      label,
      errors,
    );
    checkSupportQuality(edge, evidenceBasis, label, errors);

    const from = stringField(edge, "from_node");
    const to = stringField(edge, "to_node");
    for (const [field, id] of [
      ["from_node", from],
      ["to_node", to],
    ] as const) {
      if (id !== undefined && !nodeIds.has(id)) {
        errors.push(`${label}: ${field} does not resolve to a node: ${id}`);
      }
    }
    if (from !== undefined && from === to) {
      errors.push(`${label}: edge connects a node to itself: ${from}`);
    }
  });

  checkAcyclic(proposal.edges, nodeIds, errors);

  proposal.alternative_paths.forEach((path, index) => {
    const label = `alternative_paths[${index}]`;
    checkRefs(path, "node_refs", nodeIds, "node", label, errors);
    checkRefs(path, "edge_refs", edgeIds, "edge", label, errors);
  });

  proposal.missing_witnesses.forEach((witness, index) => {
    checkRefs(
      witness,
      "would_resolve",
      elementIds,
      "node or edge",
      `missing_witnesses[${index}]`,
      errors,
    );
  });

  proposal.unsupported_assumptions.forEach((assumption, index) => {
    checkRefs(
      assumption,
      "attached_to",
      elementIds,
      "node or edge",
      `unsupported_assumptions[${index}]`,
      errors,
    );
  });

  if (
    proposal.relates_to_prior !== null &&
    proposal.relates_to_prior.prior_proposal_id === proposal.proposal_id
  ) {
    errors.push("relates_to_prior: a proposal cannot relate to itself");
  }

  return errors;
}

/**
 * An agent without TIBER access can never hold Shared Reality evidence, and
 * reasoning is never a retrieval. Both invariants keep recall and inference
 * from being laundered into governed observation.
 */
function checkEvidenceAccess(proposal: Proposal, errors: string[]): void {
  const access = proposal.agent_declaration.evidence_access;
  proposal.evidence.forEach((item, index) => {
    const label = `evidence[${index}]`;
    const basis = stringField(item, "basis");
    if (basis === "tiber_shared_reality" && access !== "tiber_tool_available") {
      errors.push(
        `${label}: shared-reality evidence requires evidence_access "tiber_tool_available", not "${access}"`,
      );
    }
    if (
      (basis === "agent_inference" || basis === "operator_belief") &&
      item.verified === true
    ) {
      errors.push(
        `${label}: ${basis} cannot be marked verified; it is not a retrieval`,
      );
    }
  });
}

function checkProtocolRef(proposal: Proposal, errors: string[]): void {
  const { retrieval_state: state, retrieved_from: from } = proposal.protocol_ref;
  if (state === "fetched_from_url" && from === null) {
    errors.push(
      "protocol_ref: retrieved_from is required when the protocol was fetched from a URL",
    );
  }
  if (state === "unavailable_worked_from_memory" && from !== null) {
    errors.push(
      "protocol_ref: retrieved_from must be null when the protocol was not retrieved",
    );
  }
}

/**
 * The agent's own recall cannot be the only thing holding up a `supported`
 * assessment. Unverified memory may appear in the record; it may not carry it.
 */
function checkSupportQuality(
  element: Identified,
  evidenceBasis: Map<string, string>,
  label: string,
  errors: string[],
): void {
  if (element.assessment !== "supported") {
    return;
  }
  const refs = element.evidence_refs;
  if (!Array.isArray(refs) || refs.length === 0) {
    return;
  }
  const supporting = refs.filter(
    (ref) =>
      typeof ref === "string" &&
      evidenceBasis.has(ref) &&
      evidenceBasis.get(ref) !== "agent_general_knowledge",
  );
  if (supporting.length === 0) {
    errors.push(
      `${label}: a "supported" assessment cannot rest only on agent_general_knowledge`,
    );
  }
}

function checkAcyclic(
  edges: readonly Identified[],
  nodeIds: ReadonlySet<string>,
  errors: string[],
): void {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const from = stringField(edge, "from_node");
    const to = stringField(edge, "to_node");
    if (from === undefined || to === undefined) {
      continue;
    }
    if (!nodeIds.has(from) || !nodeIds.has(to)) {
      // Already reported as an unresolved reference.
      continue;
    }
    adjacency.set(from, [...(adjacency.get(from) ?? []), to]);
  }

  const permanent = new Set<string>();
  const active = new Set<string>();
  let cyclic = false;

  const visit = (node: string): void => {
    if (cyclic || permanent.has(node)) {
      return;
    }
    if (active.has(node)) {
      cyclic = true;
      return;
    }
    active.add(node);
    for (const next of adjacency.get(node) ?? []) {
      visit(next);
    }
    active.delete(node);
    permanent.add(node);
  };

  for (const node of nodeIds) {
    visit(node);
  }

  if (cyclic) {
    errors.push("edges: the causal graph contains a cycle");
  }
}

function collectIds(
  items: readonly Identified[],
  field: string,
  label: string,
  errors: string[],
): Set<string> {
  const ids = new Set<string>();
  items.forEach((item, index) => {
    const id = stringField(item, field);
    if (id === undefined) {
      return;
    }
    if (ids.has(id)) {
      errors.push(`${label}[${index}]: duplicate ${field}: ${id}`);
      return;
    }
    ids.add(id);
  });
  return ids;
}

function checkRefs(
  item: Identified,
  field: string,
  known: ReadonlySet<string>,
  kind: string,
  label: string,
  errors: string[],
): void {
  const refs = item[field];
  if (!Array.isArray(refs)) {
    return;
  }
  for (const ref of refs) {
    if (typeof ref === "string" && !known.has(ref)) {
      errors.push(`${label}: ${field} does not resolve to a ${kind}: ${ref}`);
    }
  }
}

function stringField(item: Identified, field: string): string | undefined {
  const value = item[field];
  return typeof value === "string" ? value : undefined;
}
