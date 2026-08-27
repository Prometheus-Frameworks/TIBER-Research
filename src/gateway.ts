import {
  chmodSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { checkAgentThesisProposal } from "./agentEntry.js";
import { sha256CanonicalJson } from "./digest.js";
import { readNormalizedJson, resolveContained } from "./io.js";
import {
  renderPacketMarkdown,
  type ResearchPacket,
} from "./renderer.js";
import {
  validateAttemptStart,
  validateResume,
  type ResumeState,
  type ValidationIssue,
  type ValidationPhase,
  type ValidationReport,
} from "./validator.js";

export const RESEARCH_GATEWAY_VERSION = "research-gateway/v0" as const;
const MAX_GATEWAY_INTAKE_ITEMS = 1_000;
const MAX_GATEWAY_INTAKE_VALUES = 100_000;
const MAX_GATEWAY_INTAKE_DEPTH = 32;
const MAX_GATEWAY_SNAPSHOT_ENTRIES = 10_000;
const MAX_GATEWAY_SNAPSHOT_BYTES = 256 * 1024 * 1024;
const MAX_GATEWAY_SNAPSHOT_FILE_BYTES = 64 * 1024 * 1024;
const MAX_GATEWAY_SNAPSHOT_DEPTH = 64;
const MAX_GATEWAY_SNAPSHOT_PATH_LENGTH = 4_096;

export interface GatewayExecutionDeclaration {
  authority_effect: "none";
  deterministic_read: true;
  model_access: false;
  network_access: false;
  canonical_state_mutated: false;
}

const READ_ONLY_EXECUTION: GatewayExecutionDeclaration = Object.freeze({
  authority_effect: "none",
  canonical_state_mutated: false,
  deterministic_read: true,
  model_access: false,
  network_access: false,
});

export type GatewayIntakeResult =
  | "AWAITING_OPERATOR_CONFIRMATION"
  | "INTAKE_INVALID"
  | "OPERATOR_CONFIRMED_NOT_ACTIVATED";

export interface GatewayIntakeElement {
  element_id: string;
  label: string;
  statement: string;
  origin: string;
  basis: string;
  epistemic_class: string;
  assessment: string;
  evidence_refs: string[];
  subject_refs: string[];
  uncertainty: string | null;
}

export interface GatewayIntakeLink {
  link_id: string;
  from_element: string;
  to_element: string;
  mechanism: string;
  origin: string;
  basis: string;
  epistemic_class: string;
  assessment: string;
  necessity: string;
  evidence_refs: string[];
  counterevidence_refs: string[];
  uncertainty: string | null;
  falsifiers: string[];
}

export interface GatewayIntakeSubject {
  subject_id: string;
  label_in_take: string;
  kind: string;
  resolution: {
    resolved_label: string;
    resolution_basis: string;
    identifier: string | null;
  } | null;
}

export interface GatewayIntakeEvidence {
  evidence_id: string;
  basis: string;
  statement: string;
  locator: string | null;
  retrieved_via: string | null;
  verified: boolean;
  promotable: false;
  note: string | null;
}

export interface GatewayIntakeAlternativePath {
  path_id: string;
  description: string;
  relation: string;
  raised_by: string;
  node_refs: string[];
  edge_refs: string[];
  operator_response: string | null;
}

export interface GatewayIntakeUnsupportedAssumption {
  assumption_id: string;
  statement: string;
  attached_to: string[];
  surfaced_by: string;
  operator_response: string | null;
}

export interface GatewayIntakeWitness {
  witness_id: string;
  statement: string;
  status: string;
  why_unavailable: string;
  would_resolve: string[];
  owner_hint: string | null;
}

export interface GatewayIntakeReceivedTake {
  received_text: string;
  received_text_preserved: true;
  byte_identity: string;
  quote_digest: string | null;
  quote_digest_mode: string | null;
  transport_notes: string[];
  operator_stance: string;
  stance_basis: string;
  provenance_note: string;
  operator_supplied_at: string | null;
  list_label: string | null;
}

export interface GatewayIntakeOperatorConfirmation {
  confirmed_at: string;
  confirmation_text: string;
  confirmation_scope: string;
  exceptions: string[];
}

export interface GatewayIntakeStudySheet {
  received_take: GatewayIntakeReceivedTake;
  interpretation_summary: string;
  agent_additions: string;
  agent_evidence_access: string;
  agent_evidence_access_note: string;
  not_understood: string[];
  subjects: GatewayIntakeSubject[];
  proposed_elements: GatewayIntakeElement[];
  proposed_links: GatewayIntakeLink[];
  evidence_inventory: GatewayIntakeEvidence[];
  alternative_paths: GatewayIntakeAlternativePath[];
  unsupported_assumptions: GatewayIntakeUnsupportedAssumption[];
  thesis_falsifiers: string[];
  missing_witnesses: GatewayIntakeWitness[];
  unanswered_clarifications: string[];
}

export interface GatewayIntakeReport {
  gateway_version: typeof RESEARCH_GATEWAY_VERSION;
  operation: "intake";
  result_basis: "agent_scaffold_validation";
  result: GatewayIntakeResult;
  valid: boolean;
  proposal_id: string | null;
  proposal_state: "awaiting_operator_confirmation" | "operator_confirmed" | null;
  confirmation_state: "awaiting_operator_confirmation" | "operator_confirmed" | "unknown";
  operator_confirmation: GatewayIntakeOperatorConfirmation | null;
  freeze_state: "not_frozen";
  activation_state: "not_activated";
  authority_state: "unpromoted";
  downstream_authority: "none";
  study_sheet: GatewayIntakeStudySheet | null;
  validation_errors: string[];
  next_boundary:
    | "operator_confirmation_required"
    | "separate_job_and_preflight_required"
    | "valid_intake_required";
  execution: GatewayExecutionDeclaration;
}

export type GatewayStatusResult =
  | "PROTOCOL_CONSISTENT"
  | "PROTOCOL_INCONSISTENT";

export interface GatewayStatusReport {
  gateway_version: typeof RESEARCH_GATEWAY_VERSION;
  operation: "status";
  result_basis: "deterministic_custody_read";
  result: GatewayStatusResult;
  protocol_valid: boolean;
  run_id: string | null;
  attempt_id: string | null;
  phase: ValidationPhase | null;
  lifecycle_state: string | null;
  packet_state: "available" | "absent" | "unknown";
  review_state: "not_reached" | "returned" | "unknown";
  review_verdict: string | null;
  seal_state: "sealed" | "unsealed" | "unknown";
  process_terminal: string | null;
  completion: string | null;
  authority_state: string | null;
  authority_ceiling: string | null;
  downstream_authority: string | null;
  reportability: string | null;
  cutoff_at: string | null;
  end_to_end_ready: boolean;
  archive_id: string | null;
  frontier_question: string | null;
  blockers: string[];
  open_evidence_gaps: string[];
  budgets_remaining: Record<string, unknown> | null;
  next_permitted_actions: string[];
  reason_codes: string[];
  warning_codes: string[];
  execution: GatewayExecutionDeclaration;
}

export type GatewayPacketResult =
  | "PACKET_AVAILABLE"
  | "PACKET_NOT_AVAILABLE"
  | "PROTOCOL_INCONSISTENT";

export interface GatewayPacketBody {
  packet: ResearchPacket;
  markdown: string;
}

export interface GatewayPacketReport {
  gateway_version: typeof RESEARCH_GATEWAY_VERSION;
  operation: "packet";
  result_basis: "deterministic_custody_read";
  result: GatewayPacketResult;
  protocol_valid: boolean;
  status: GatewayStatusReport;
  body: GatewayPacketBody | null;
  execution: GatewayExecutionDeclaration;
}

interface GatewayProposal {
  proposal_id: string;
  proposal_state: "awaiting_operator_confirmation" | "operator_confirmed";
  operator_confirmation: {
    confirmed_at: string;
    confirmation_text: string;
    confirmation_scope: string;
    exceptions: string[];
  } | null;
  agent_declaration: {
    evidence_access: string;
    evidence_access_note: string;
  };
  original_take: {
    received_text: string;
    received_text_preserved: true;
    byte_identity: string;
    quote_digest: string | null;
    quote_digest_mode: string | null;
    transport_notes: string[];
    operator_stance: string;
    stance_basis: string;
    provenance_note: string;
    operator_supplied_at: string | null;
    list_label: string | null;
  };
  interpretation: {
    summary: string;
    agent_additions: string;
    not_understood: string[];
  };
  subjects: Array<{
    subject_id: string;
    label_in_take: string;
    kind: string;
    resolution: {
      resolved_label: string;
      resolution_basis: string;
      identifier: string | null;
    } | null;
  }>;
  nodes: Array<{
    node_id: string;
    label: string;
    statement: string;
    origin: string;
    basis: string;
    epistemic_class: string;
    assessment: string;
    evidence_refs: string[];
    subject_refs: string[];
    uncertainty: string | null;
  }>;
  edges: Array<{
    edge_id: string;
    from_node: string;
    to_node: string;
    mechanism: string;
    origin: string;
    basis: string;
    epistemic_class: string;
    assessment: string;
    necessity: string;
    evidence_refs: string[];
    counterevidence_refs: string[];
    uncertainty: string | null;
    falsifiers: string[];
  }>;
  evidence: Array<{
    evidence_id: string;
    basis: string;
    statement: string;
    locator: string | null;
    retrieved_via: string | null;
    verified: boolean;
    promotable: false;
    note: string | null;
  }>;
  alternative_paths: Array<{
    path_id: string;
    description: string;
    relation: string;
    raised_by: string;
    node_refs: string[];
    edge_refs: string[];
    operator_response: string | null;
  }>;
  unsupported_assumptions: Array<{
    assumption_id: string;
    statement: string;
    attached_to: string[];
    surfaced_by: string;
    operator_response: string | null;
  }>;
  thesis_falsifiers: string[];
  missing_witnesses: Array<{
    witness_id: string;
    statement: string;
    status: string;
    why_unavailable: string;
    would_resolve: string[];
    owner_hint: string | null;
  }>;
  clarifications: Array<{
    question: string;
    answer_state: string;
  }>;
}

interface ActivationSummary {
  authority_ceiling: string;
  cutoff_at: string;
}

interface SnapshotActivationRefs extends ActivationSummary {
  job_ref: { path: string };
  ops_decision_ref: { path: string };
}

interface SnapshotBudget {
  bytes: number;
  entries: number;
}

interface SnapshotObservation {
  destination: string;
  source: string;
  source_ctime_ms: number;
  source_dev: number;
  source_ino: number;
  source_mtime_ms: number;
  source_size: number;
  type: "directory" | "file";
}

interface PacketSummary {
  authority_state: string;
  completion: string;
  downstream_authority: string;
  process_terminal: string;
  reportability: string;
}

interface ReviewSummary {
  overall_verdict: string;
}

interface RunInspection {
  status: GatewayStatusReport;
  packet: ResearchPacket | null;
}

interface RunProjection {
  activation: ActivationSummary;
  packet: ResearchPacket | null;
  review: ReviewSummary | null;
}

/**
 * Validate and project an existing agent-entry proposal into a small operator
 * study sheet. This operation never freezes, persists, or activates the
 * proposal. The conversational agent remains responsible for producing the
 * structured proposal that reaches this deterministic boundary.
 */
export function inspectGatewayIntake(value: unknown): GatewayIntakeReport {
  let errors = intakeSizeErrors(value);
  if (errors.length === 0) {
    try {
      errors = checkAgentThesisProposal(value);
    } catch {
      errors = ["gateway intake validation could not be completed safely"];
    }
  }
  if (errors.length > 0) {
    return {
      activation_state: "not_activated",
      authority_state: "unpromoted",
      confirmation_state: "unknown",
      downstream_authority: "none",
      execution: READ_ONLY_EXECUTION,
      freeze_state: "not_frozen",
      gateway_version: RESEARCH_GATEWAY_VERSION,
      next_boundary: "valid_intake_required",
      operation: "intake",
      operator_confirmation: null,
      proposal_id: null,
      proposal_state: null,
      result: "INTAKE_INVALID",
      result_basis: "agent_scaffold_validation",
      study_sheet: null,
      valid: false,
      validation_errors: [...errors],
    };
  }

  const proposal = value as GatewayProposal;
  const confirmed = proposal.proposal_state === "operator_confirmed";
  return {
    activation_state: "not_activated",
    authority_state: "unpromoted",
    confirmation_state: proposal.proposal_state,
    downstream_authority: "none",
    execution: READ_ONLY_EXECUTION,
    freeze_state: "not_frozen",
    gateway_version: RESEARCH_GATEWAY_VERSION,
    next_boundary: confirmed
      ? "separate_job_and_preflight_required"
      : "operator_confirmation_required",
    operation: "intake",
    operator_confirmation:
      proposal.operator_confirmation === null
        ? null
        : {
            confirmation_scope:
              proposal.operator_confirmation.confirmation_scope,
            confirmation_text: proposal.operator_confirmation.confirmation_text,
            confirmed_at: proposal.operator_confirmation.confirmed_at,
            exceptions: [...proposal.operator_confirmation.exceptions],
          },
    proposal_id: proposal.proposal_id,
    proposal_state: proposal.proposal_state,
    result: confirmed
      ? "OPERATOR_CONFIRMED_NOT_ACTIVATED"
      : "AWAITING_OPERATOR_CONFIRMATION",
    result_basis: "agent_scaffold_validation",
    study_sheet: {
      agent_additions: proposal.interpretation.agent_additions,
      agent_evidence_access: proposal.agent_declaration.evidence_access,
      agent_evidence_access_note:
        proposal.agent_declaration.evidence_access_note,
      alternative_paths: proposal.alternative_paths.map((path) => ({
        description: path.description,
        edge_refs: [...path.edge_refs],
        node_refs: [...path.node_refs],
        operator_response: path.operator_response,
        path_id: path.path_id,
        raised_by: path.raised_by,
        relation: path.relation,
      })),
      evidence_inventory: proposal.evidence.map((evidence) => ({
        basis: evidence.basis,
        evidence_id: evidence.evidence_id,
        locator: evidence.locator,
        note: evidence.note,
        promotable: false,
        retrieved_via: evidence.retrieved_via,
        statement: evidence.statement,
        verified: evidence.verified,
      })),
      interpretation_summary: proposal.interpretation.summary,
      missing_witnesses: proposal.missing_witnesses.map((witness) => ({
        owner_hint: witness.owner_hint,
        statement: witness.statement,
        status: witness.status,
        would_resolve: [...witness.would_resolve],
        why_unavailable: witness.why_unavailable,
        witness_id: witness.witness_id,
      })),
      not_understood: [...proposal.interpretation.not_understood],
      proposed_elements: proposal.nodes.map((node) => ({
        assessment: node.assessment,
        basis: node.basis,
        element_id: node.node_id,
        epistemic_class: node.epistemic_class,
        evidence_refs: [...node.evidence_refs],
        label: node.label,
        origin: node.origin,
        statement: node.statement,
        subject_refs: [...node.subject_refs],
        uncertainty: node.uncertainty,
      })),
      proposed_links: proposal.edges.map((edge) => ({
        assessment: edge.assessment,
        basis: edge.basis,
        counterevidence_refs: [...edge.counterevidence_refs],
        evidence_refs: [...edge.evidence_refs],
        epistemic_class: edge.epistemic_class,
        falsifiers: [...edge.falsifiers],
        from_element: edge.from_node,
        link_id: edge.edge_id,
        mechanism: edge.mechanism,
        necessity: edge.necessity,
        origin: edge.origin,
        to_element: edge.to_node,
        uncertainty: edge.uncertainty,
      })),
      received_take: {
        byte_identity: proposal.original_take.byte_identity,
        list_label: proposal.original_take.list_label,
        operator_stance: proposal.original_take.operator_stance,
        operator_supplied_at: proposal.original_take.operator_supplied_at,
        provenance_note: proposal.original_take.provenance_note,
        quote_digest: proposal.original_take.quote_digest,
        quote_digest_mode: proposal.original_take.quote_digest_mode,
        received_text: proposal.original_take.received_text,
        received_text_preserved:
          proposal.original_take.received_text_preserved,
        stance_basis: proposal.original_take.stance_basis,
        transport_notes: [...proposal.original_take.transport_notes],
      },
      subjects: proposal.subjects.map((subject) => ({
        kind: subject.kind,
        label_in_take: subject.label_in_take,
        resolution:
          subject.resolution === null
            ? null
            : {
                identifier: subject.resolution.identifier,
                resolution_basis: subject.resolution.resolution_basis,
                resolved_label: subject.resolution.resolved_label,
              },
        subject_id: subject.subject_id,
      })),
      thesis_falsifiers: [...proposal.thesis_falsifiers],
      unanswered_clarifications: proposal.clarifications
        .filter((clarification) => clarification.answer_state === "unanswered")
        .map((clarification) => clarification.question),
      unsupported_assumptions: proposal.unsupported_assumptions.map(
        (assumption) => ({
          assumption_id: assumption.assumption_id,
          attached_to: [...assumption.attached_to],
          operator_response: assumption.operator_response,
          statement: assumption.statement,
          surfaced_by: assumption.surfaced_by,
        }),
      ),
    },
    valid: true,
    validation_errors: [],
  };
}

function intakeSizeErrors(value: unknown): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }
  const proposal = value as Record<string, unknown>;
  const boundedArrays = [
    "subjects",
    "nodes",
    "edges",
    "evidence",
    "alternative_paths",
    "missing_witnesses",
    "unsupported_assumptions",
    "thesis_falsifiers",
    "clarifications",
    "open_notes",
  ];
  const errors: string[] = [];
  for (const field of boundedArrays) {
    const entries = proposal[field];
    if (Array.isArray(entries) && entries.length > MAX_GATEWAY_INTAKE_ITEMS) {
      errors.push(
        `gateway intake ${field} exceeds the ${MAX_GATEWAY_INTAKE_ITEMS}-item safety limit`,
      );
    }
  }
  if (errors.length > 0) {
    return errors;
  }

  const pending: Array<{ depth: number; value: unknown }> = [
    { depth: 0, value },
  ];
  const seen = new WeakSet<object>();
  let valuesSeen = 0;
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === undefined) {
      break;
    }
    valuesSeen += 1;
    if (valuesSeen > MAX_GATEWAY_INTAKE_VALUES) {
      return [
        `gateway intake exceeds the ${MAX_GATEWAY_INTAKE_VALUES}-value structural safety limit`,
      ];
    }
    if (current.depth > MAX_GATEWAY_INTAKE_DEPTH) {
      return [
        `gateway intake exceeds the ${MAX_GATEWAY_INTAKE_DEPTH}-level nesting safety limit`,
      ];
    }
    if (current.value === null || typeof current.value !== "object") {
      continue;
    }
    if (seen.has(current.value)) {
      return ["gateway intake must be an acyclic data value"];
    }
    seen.add(current.value);
    const children = Array.isArray(current.value)
      ? current.value
      : Object.values(current.value as Record<string, unknown>);
    for (const child of children) {
      pending.push({ depth: current.depth + 1, value: child });
    }
  }
  return errors;
}

/** Inspect one exact run attempt without changing custody state. */
export function getGatewayStatus(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): GatewayStatusReport {
  return inspectRun(workspaceDir, runId, attemptId).status;
}

/**
 * Return a packet only after the complete detected lifecycle phase validates.
 * An inconsistent run never receives a packet body, even if packet files are
 * present and contain apparently positive labels.
 */
export function getGatewayPacket(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): GatewayPacketReport {
  const inspected = inspectRun(workspaceDir, runId, attemptId);
  if (!inspected.status.protocol_valid) {
    return {
      body: null,
      execution: READ_ONLY_EXECUTION,
      gateway_version: RESEARCH_GATEWAY_VERSION,
      operation: "packet",
      protocol_valid: false,
      result: "PROTOCOL_INCONSISTENT",
      result_basis: "deterministic_custody_read",
      status: inspected.status,
    };
  }
  if (inspected.packet === null) {
    return {
      body: null,
      execution: READ_ONLY_EXECUTION,
      gateway_version: RESEARCH_GATEWAY_VERSION,
      operation: "packet",
      protocol_valid: true,
      result: "PACKET_NOT_AVAILABLE",
      result_basis: "deterministic_custody_read",
      status: inspected.status,
    };
  }
  return {
    body: {
      markdown: renderPacketMarkdown(inspected.packet),
      packet: inspected.packet,
    },
    execution: READ_ONLY_EXECUTION,
    gateway_version: RESEARCH_GATEWAY_VERSION,
    operation: "packet",
    protocol_valid: true,
    result: "PACKET_AVAILABLE",
    result_basis: "deterministic_custody_read",
    status: inspected.status,
  };
}

function inspectRun(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): RunInspection {
  if (!isSafeId(runId) || !isSafeId(attemptId)) {
    return {
      packet: null,
      status: inconsistentStatus(null, null, ["gateway.identity_invalid"]),
    };
  }

  try {
    return withRunSnapshot(workspaceDir, runId, attemptId);
  } catch {
    return {
      packet: null,
      status: inconsistentStatus(runId, attemptId, [
        "gateway.snapshot_unavailable",
      ]),
    };
  }
}

/**
 * Copy only the governed run and its two activation dependencies into a
 * private ephemeral workspace. Validation and projection then read the same
 * stable bytes, so concurrent replacement in the caller's workspace cannot
 * pair a valid report with an unvalidated packet or review.
 */
function withRunSnapshot(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): RunInspection {
  const snapshotParent = mkdtempSync(
    join(tmpdir(), "tiber-research-gateway-"),
  );
  const snapshotWorkspace = join(snapshotParent, "workspace");
  mkdirSync(snapshotWorkspace, { recursive: true });

  try {
    const sourceWorkspace = resolve(workspaceDir);
    const budget: SnapshotBudget = { bytes: 0, entries: 0 };
    copySnapshotEntry(
      sourceWorkspace,
      snapshotWorkspace,
      `runs/${runId}`,
      "directory",
      budget,
    );
    const activation = readNormalizedJson<SnapshotActivationRefs>(
      snapshotWorkspace,
      `runs/${runId}/activation.json`,
    );
    for (const dependencyPath of [
      activation.job_ref?.path,
      activation.ops_decision_ref?.path,
    ]) {
      if (typeof dependencyPath !== "string") {
        throw new Error("activation dependency path is missing");
      }
      copySnapshotEntry(
        sourceWorkspace,
        snapshotWorkspace,
        dependencyPath,
        "file",
        budget,
      );
    }
    return inspectSnapshot(snapshotWorkspace, runId, attemptId);
  } finally {
    try {
      makeSnapshotRemovable(snapshotParent);
    } catch {
      // rmSync remains the cleanup authority. Permission normalization is a
      // best-effort precursor for copied read-only directory modes.
    }
    rmSync(snapshotParent, { force: true, recursive: true });
  }
}

function makeSnapshotRemovable(path: string): void {
  const stats = lstatSync(path);
  if (stats.isSymbolicLink()) {
    return;
  }
  if (!stats.isDirectory()) {
    chmodSync(path, 0o600);
    return;
  }

  chmodSync(path, 0o700);
  for (const entry of readdirSync(path)) {
    makeSnapshotRemovable(join(path, entry));
  }
}

function copySnapshotEntry(
  sourceWorkspace: string,
  snapshotWorkspace: string,
  relativePath: string,
  expectedType: "directory" | "file",
  budget: SnapshotBudget,
): void {
  if (
    relativePath.length > MAX_GATEWAY_SNAPSHOT_PATH_LENGTH ||
    relativePath.split("/").length > MAX_GATEWAY_SNAPSHOT_DEPTH
  ) {
    throw new Error("snapshot path exceeds the safety limit");
  }
  const source = resolveContained(sourceWorkspace, relativePath);
  const destination = resolveContained(snapshotWorkspace, relativePath);
  const sourceStats = lstatSync(source);
  if (
    sourceStats.isSymbolicLink() ||
    (expectedType === "directory"
      ? !sourceStats.isDirectory()
      : !sourceStats.isFile())
  ) {
    throw new Error(`snapshot entry is not an ordinary ${expectedType}`);
  }
  if (existsSync(destination)) {
    return;
  }
  mkdirSync(dirname(destination), { recursive: true });
  const observations: SnapshotObservation[] = [];
  cpSync(source, destination, {
    dereference: false,
    errorOnExist: true,
    filter: (entry) => {
      const stats = lstatSync(entry);
      const type = stats.isDirectory()
        ? "directory"
        : stats.isFile()
          ? "file"
          : null;
      if (stats.isSymbolicLink() || type === null) {
        throw new Error("snapshot contains a non-ordinary entry");
      }

      const nestedPath = relative(source, entry);
      if (
        nestedPath === ".." ||
        nestedPath.startsWith(`..${sep}`) ||
        nestedPath.split(sep).filter(Boolean).length >
          MAX_GATEWAY_SNAPSHOT_DEPTH
      ) {
        throw new Error("snapshot nesting exceeds the safety limit");
      }
      if (nestedPath.length === 0 && type !== expectedType) {
        throw new Error(`snapshot entry changed from ${expectedType}`);
      }
      budget.entries += 1;
      if (budget.entries > MAX_GATEWAY_SNAPSHOT_ENTRIES) {
        throw new Error("snapshot entry count exceeds the safety limit");
      }
      if (type === "file") {
        if (stats.size > MAX_GATEWAY_SNAPSHOT_FILE_BYTES) {
          throw new Error("snapshot file exceeds the safety limit");
        }
        budget.bytes += stats.size;
        if (budget.bytes > MAX_GATEWAY_SNAPSHOT_BYTES) {
          throw new Error("snapshot byte count exceeds the safety limit");
        }
      }

      observations.push({
        destination:
          nestedPath.length === 0
            ? destination
            : join(destination, nestedPath),
        source: entry,
        source_ctime_ms: stats.ctimeMs,
        source_dev: stats.dev,
        source_ino: stats.ino,
        source_mtime_ms: stats.mtimeMs,
        source_size: stats.size,
        type,
      });
      return true;
    },
    force: false,
    recursive: true,
  });

  for (const observation of observations) {
    const current = lstatSync(observation.source);
    const copied = lstatSync(observation.destination);
    if (
      current.isSymbolicLink() ||
      (observation.type === "directory"
        ? !current.isDirectory() || !copied.isDirectory()
        : !current.isFile() ||
          !copied.isFile() ||
          copied.size !== observation.source_size) ||
      current.dev !== observation.source_dev ||
      current.ino !== observation.source_ino ||
      current.size !== observation.source_size ||
      current.mtimeMs !== observation.source_mtime_ms ||
      current.ctimeMs !== observation.source_ctime_ms
    ) {
      throw new Error("snapshot source changed while it was copied");
    }
  }
}

function inspectSnapshot(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): RunInspection {
  let validation: ValidationReport;
  try {
    validation = validateRunState(workspaceDir, runId, attemptId);
  } catch {
    return {
      packet: null,
      status: inconsistentStatus(runId, attemptId, [
        "gateway.validation_unavailable",
      ]),
    };
  }

  if (!validation.valid) {
    return {
      packet: null,
      status: inconsistentStatus(
        runId,
        attemptId,
        validation.errors.map((issue) => issue.code),
        validation.warnings,
      ),
    };
  }

  try {
    return inspectValidatedRun(
      workspaceDir,
      runId,
      attemptId,
      validation,
    );
  } catch {
    // A read failure after validation can be a concurrent mutation. Fail
    // closed rather than returning labels derived from a stale validation.
    return {
      packet: null,
      status: inconsistentStatus(runId, attemptId, [
        "gateway.post_validation_read_failed",
      ]),
    };
  }
}

function inspectValidatedRun(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  validation: ValidationReport,
): RunInspection {
  const before = readRunProjection(workspaceDir, runId, attemptId);
  const stableValidation = validateRunState(workspaceDir, runId, attemptId);
  if (!stableValidation.valid) {
    return {
      packet: null,
      status: inconsistentStatus(
        runId,
        attemptId,
        [
          "gateway.state_changed_during_read",
          ...stableValidation.errors.map((issue) => issue.code),
        ],
        stableValidation.warnings,
      ),
    };
  }
  const after = readRunProjection(workspaceDir, runId, attemptId);
  if (
    sha256CanonicalJson(validation) !== sha256CanonicalJson(stableValidation) ||
    sha256CanonicalJson(before) !== sha256CanonicalJson(after)
  ) {
    return {
      packet: null,
      status: inconsistentStatus(runId, attemptId, [
        "gateway.state_changed_during_read",
      ]),
    };
  }

  return projectValidatedRun(runId, attemptId, stableValidation, after);
}

function readRunProjection(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): RunProjection {
  const runRoot = `runs/${runId}`;
  const attemptRoot = `${runRoot}/attempts/${attemptId}`;
  const packetPath = `${attemptRoot}/packet.json`;
  const reviewPath = `${attemptRoot}/review.json`;
  return {
    activation: readNormalizedJson<ActivationSummary>(
      workspaceDir,
      `${runRoot}/activation.json`,
    ),
    packet: isRegularFile(workspaceDir, packetPath)
      ? readNormalizedJson<ResearchPacket>(workspaceDir, packetPath)
      : null,
    review: isRegularFile(workspaceDir, reviewPath)
      ? readNormalizedJson<ReviewSummary>(workspaceDir, reviewPath)
      : null,
  };
}

function projectValidatedRun(
  runId: string,
  attemptId: string,
  validation: ValidationReport,
  projection: RunProjection,
): RunInspection {
  const resume = validation.resume;
  const packetSummary = projection.packet as PacketSummary | null;

  return {
    packet: projection.packet,
    status: {
      archive_id: validation.archive_id,
      attempt_id: attemptId,
      authority_ceiling: projection.activation.authority_ceiling,
      authority_state: packetSummary?.authority_state ?? null,
      blockers: copyResumeList(resume, "blockers"),
      budgets_remaining:
        resume?.budgets_remaining === null ||
        resume?.budgets_remaining === undefined
          ? null
          : { ...resume.budgets_remaining },
      completion: packetSummary?.completion ?? null,
      cutoff_at: projection.activation.cutoff_at,
      downstream_authority: packetSummary?.downstream_authority ?? null,
      end_to_end_ready: validation.end_to_end_ready,
      execution: READ_ONLY_EXECUTION,
      frontier_question: resume?.frontier_question ?? null,
      gateway_version: RESEARCH_GATEWAY_VERSION,
      lifecycle_state: resume?.last_status ?? validation.phase,
      next_permitted_actions: copyResumeList(
        resume,
        "next_permitted_actions",
      ),
      open_evidence_gaps: copyResumeList(resume, "open_evidence_gaps"),
      operation: "status",
      packet_state: projection.packet === null ? "absent" : "available",
      phase: validation.phase,
      process_terminal: packetSummary?.process_terminal ?? null,
      protocol_valid: true,
      reason_codes: [],
      reportability: packetSummary?.reportability ?? null,
      result: "PROTOCOL_CONSISTENT",
      result_basis: "deterministic_custody_read",
      review_state: projection.review === null ? "not_reached" : "returned",
      review_verdict: projection.review?.overall_verdict ?? null,
      run_id: runId,
      seal_state: validation.phase === "sealed" ? "sealed" : "unsealed",
      warning_codes: uniqueCodes(validation.warnings),
    },
  };
}

function validateRunState(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): ValidationReport {
  const attemptRoot = `runs/${runId}/attempts/${attemptId}`;
  const hasLedger = isRegularFile(workspaceDir, `${attemptRoot}/ledger.jsonl`);
  const hasPacket = isRegularFile(workspaceDir, `${attemptRoot}/packet.json`);
  return hasLedger || hasPacket
    ? validateResume(workspaceDir, runId, attemptId)
    : validateAttemptStart(workspaceDir, runId, attemptId);
}

function inconsistentStatus(
  runId: string | null,
  attemptId: string | null,
  codes: readonly string[],
  warnings: readonly ValidationIssue[] = [],
): GatewayStatusReport {
  return {
    archive_id: null,
    attempt_id: attemptId,
    authority_ceiling: null,
    authority_state: null,
    blockers: [],
    budgets_remaining: null,
    completion: null,
    cutoff_at: null,
    downstream_authority: null,
    end_to_end_ready: false,
    execution: READ_ONLY_EXECUTION,
    frontier_question: null,
    gateway_version: RESEARCH_GATEWAY_VERSION,
    lifecycle_state: null,
    next_permitted_actions: [],
    open_evidence_gaps: [],
    operation: "status",
    packet_state: "unknown",
    phase: null,
    process_terminal: null,
    protocol_valid: false,
    reason_codes: ["PROTOCOL_INCONSISTENT", ...uniqueStrings(codes)],
    reportability: null,
    result: "PROTOCOL_INCONSISTENT",
    result_basis: "deterministic_custody_read",
    review_state: "unknown",
    review_verdict: null,
    run_id: runId,
    seal_state: "unknown",
    warning_codes: uniqueCodes(warnings),
  };
}

function copyResumeList<K extends keyof ResumeState>(
  resume: ResumeState | null,
  key: K,
): string[] {
  const value = resume?.[key];
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function isRegularFile(workspaceDir: string, relativePath: string): boolean {
  try {
    const path = resolveContained(workspaceDir, relativePath);
    return existsSync(path) && lstatSync(path).isFile();
  } catch {
    return false;
  }
}

function isSafeId(value: string): boolean {
  return (
    value.length <= 128 &&
    /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*$/u.test(value)
  );
}

function uniqueCodes(issues: readonly ValidationIssue[]): string[] {
  return uniqueStrings(issues.map((issue) => issue.code));
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}
