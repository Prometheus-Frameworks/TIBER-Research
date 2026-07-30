import {
  existsSync,
  lstatSync,
  readdirSync,
  type Dirent,
} from "node:fs";
import { relative, resolve } from "node:path";
import {
  sha256CanonicalJson,
  sha256Raw,
  type Sha256Digest,
} from "./digest.js";
import {
  calculateLedgerEventHash,
  parseLedgerJsonl,
  validateLedgerChain,
  type LedgerEventRecord,
} from "./ledger.js";
import {
  readBytes,
  readNormalizedJson,
  readUtf8,
  readYaml,
  resolveContained,
} from "./io.js";
import {
  scanRawTextPrivacy,
  scanStructuralPrivacy,
} from "./privacy.js";
import {
  capabilityExpansionErrors,
  isAfter,
  type CapabilityEnvelope,
} from "./protocol.js";
import {
  renderPacketMarkdown,
  type PacketClaim,
  type ResearchPacket,
} from "./renderer.js";
import { validateSchema } from "./schema.js";
import { VERSIONS } from "./versions.js";

const SCHEMA = Object.freeze({
  activation: "https://schemas.tiber.dev/research/v0/activation.schema.json",
  authorityDecision:
    "https://schemas.tiber.dev/research/v0/authority-decision.schema.json",
  inputs: "https://schemas.tiber.dev/research/v0/inputs.schema.json",
  job: "https://schemas.tiber.dev/research/v0/job.schema.json",
  ledgerEvent:
    "https://schemas.tiber.dev/research/v0/ledger-event.schema.json",
  packet: "https://schemas.tiber.dev/research/v0/packet.schema.json",
  review: "https://schemas.tiber.dev/research/v0/review.schema.json",
  runEvent: "https://schemas.tiber.dev/research/v0/run-event.schema.json",
  seal: "https://schemas.tiber.dev/research/v0/seal.schema.json",
  sourceMetadata:
    "https://schemas.tiber.dev/research/v0/source-metadata.schema.json",
  submission:
    "https://schemas.tiber.dev/research/v0/submission.schema.json",
});

export type ValidationPhase = "candidate" | "reviewed" | "sealed" | "submitted";

export interface ValidationOptions {
  phase?: ValidationPhase;
  requireEndToEnd?: boolean;
}

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface ResumeState {
  run_id: string;
  attempt_id: string;
  ledger_head: Sha256Digest | null;
  last_sequence: number;
  last_status: string | null;
  frontier_question: string | null;
  open_evidence_gaps: string[];
  blockers: string[];
  budgets_remaining: Record<string, unknown> | null;
  next_permitted_actions: string[];
}

export interface ValidationReport {
  valid: boolean;
  phase: ValidationPhase;
  end_to_end_ready: boolean;
  archive_id: Sha256Digest | null;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  resume: ResumeState | null;
}

interface Job {
  synthetic_fixture: boolean;
  job_id: string;
  job_version: string;
  mode: string;
  output_class: string;
  questions: Array<{ question_id: string; prompt: string }>;
  subjects: Subject[];
  comparison_population: { mode: string; members: Subject[] };
  research_context: ResearchContext;
  baseline_ref: {
    input_id: string;
    digest: Sha256Digest;
  } | null;
  cutoff_at: string;
  time_horizon: string;
  source_envelope: {
    families: Array<{
      source_family_id: string;
      intended_use: string;
      acquisition_methods: string[];
      retention_modes: string[];
      reportability: string[];
      rights_disposition_ref: string;
    }>;
    evidence_classes: string[];
    required_replayability: string;
  };
  capabilities: CapabilityEnvelope;
  budgets: {
    wall_clock_minutes: number;
    tool_calls: number;
    evidence_objects: number;
  };
  authority: {
    ceiling: string;
    prohibited_actions: string[];
    human_decision_owner: string;
    amendment_owner: string;
    consumer_authority: string;
  };
  reportability: string;
  gates: {
    checkpoint_required: boolean;
    cold_resume_required: boolean;
    self_challenge_required: boolean;
    independent_review_required: boolean;
    single_writer_required: boolean;
  };
  context_policy: {
    allowed_context_classes: string[];
    prohibited_context_classes: string[];
    privacy_ceiling: string;
  };
  terminal_states: {
    process: string[];
    completion: string[];
    review: string[];
  };
}

interface Subject {
  subject_id: string;
  label: string;
  kind: string;
  aliases?: string[];
}

interface ResearchContext {
  context_id: string;
  context_class: string;
  description: string;
  dimensions: Record<string, string | number | boolean>;
}

interface Activation {
  synthetic_fixture: boolean;
  run_id: string;
  activated_at: string;
  authority_ceiling: string;
  idempotency_key: string;
  permitted_branch: string;
  job_ref: {
    job_id: string;
    job_version: string;
    path: string;
    digest: Sha256Digest;
    digest_mode: string;
  };
  inputs_ref: {
    path: string;
    digest: Sha256Digest;
    digest_mode: string;
  };
  ops_decision_ref: {
    decision_ref: string;
    path: string;
    digest: Sha256Digest;
    digest_mode: string;
    approved_at: string;
    approved_by: string;
  };
  cutoff_at: string;
  effective_capabilities: CapabilityEnvelope;
  budget: {
    wall_clock_minutes: number;
    tool_calls: number;
    evidence_objects: number;
  };
  permitted_path: string;
}

interface AuthorityDecision {
  synthetic_fixture: boolean;
  decision_ref: string;
  run_id: string;
  job_ref: Activation["job_ref"];
  inputs_ref: Activation["inputs_ref"];
  cutoff_at: string;
  capabilities: CapabilityEnvelope;
  budget: Activation["budget"];
  authority_ceiling: string;
  permitted_branch: string;
  permitted_path: string;
  approved_at: string;
  approved_by: string;
}

interface Inputs {
  synthetic_fixture: boolean;
  run_id: string;
  frozen_at: string;
  cutoff_at: string;
  job_ref: Activation["job_ref"];
  research_context: ResearchContext;
  subjects: Subject[];
  comparisons: Subject[];
  artifacts: Array<{
    artifact_id: string;
    repository: string;
    commit: string;
    path: string;
    blob_digest: Sha256Digest;
    artifact_digest: Sha256Digest;
    admissibility: string;
    freshness: string;
  }>;
  sources: SourceInput[];
  market_snapshots: Array<{
    market_snapshot_id: string;
    source_object_refs: string[];
    context_ref: string;
    context: string;
    observed_at: string;
    window_start: string;
    window_end: string;
    freshness: string;
  }>;
  blocked_inputs: Array<{
    input_id: string;
    question_refs: string[];
    reason: string;
    status: string;
  }>;
}

interface SourceInput {
  source_object_id: string;
  metadata_path: string;
  metadata_digest: Sha256Digest;
  content_path: string | null;
  content_digest: Sha256Digest | null;
  retention_mode: string;
  replayability: string;
  admissibility: string;
  promotable: boolean;
}

interface SourceMetadata {
  synthetic_fixture: boolean;
  run_id: string;
  source_object_id: string;
  source_family_id: string;
  source_class: string;
  acquisition_method: string;
  intended_use: string;
  rights_disposition_ref: string;
  reportability: string;
  context_match: {
    context_ref: string;
    matched: boolean;
    rationale: string;
  };
  content_path: string | null;
  content_digest: Sha256Digest | null;
  retention_mode: string;
  replayability: string;
  admitted: boolean;
  admissibility: { state: string };
  freshness: { state: string };
  temporal: Record<string, string | null>;
  promotable: boolean;
}

interface ArtifactDigest {
  artifact_type: string;
  path: string;
  digest: Sha256Digest;
  digest_mode: string;
}

interface TerminalRef {
  path: string;
  digest: Sha256Digest;
  digest_mode: string;
}

interface Submission {
  synthetic_fixture: boolean;
  job_id: string;
  job_version: string;
  run_id: string;
  attempt_id: string;
  submitted_at: string;
  executor_session: {
    actor_session_ref: string;
    provider_declared: string;
    model_declared: string;
  };
  artifacts: ArtifactDigest[];
  sources: Array<{
    source_object_id: string;
    metadata: ArtifactDigest;
    content: ArtifactDigest | null;
  }>;
  ledger_head: {
    event_id: string;
    event_hash: Sha256Digest;
    event_count: number;
  };
  validation: { result: string; validated_at: string };
  canonicalization_version: string;
  raw_hash_version: string;
  json_file_version: string;
  validator_version: string;
  renderer_version: string;
}

interface Review {
  synthetic_fixture: boolean;
  job_id: string;
  job_version: string;
  run_id: string;
  attempt_id: string;
  reviewed_at: string;
  submission_ref: TerminalRef;
  reviewer: {
    actor_session_ref: string;
    fresh_context: boolean;
    independence_basis: string;
  };
  substantive: { verdict: string };
  protocol: { verdict: string };
  overall_verdict: string;
  candidate_modifications_made: boolean;
}

interface Seal {
  synthetic_fixture: boolean;
  job_id: string;
  job_version: string;
  run_id: string;
  attempt_id: string;
  sealed_at: string;
  submission_ref: TerminalRef;
  review_ref: TerminalRef | null;
  terminal_state: {
    process_terminal: string;
    review_verdict: string;
    attempt_state: string;
  };
  archive_policy: {
    retention: string;
    redaction: string;
    reportability: string;
  };
  authority_state: string;
  downstream_authority: string;
  predecessor_attempt_ref: {
    attempt_id: string;
    archive_id: Sha256Digest;
  } | null;
  successor_attempt_ref: string | null;
  canonicalization_version: string;
  raw_hash_version: string;
  json_file_version: string;
  validator_version: string;
  renderer_version: string;
}

interface LoadedCandidate {
  job: Job;
  activation: Activation;
  inputs: Inputs;
  packet: ResearchPacket;
  ledger: LedgerEventRecord[];
  runEvents: RunEventRecord[];
  sources: Map<string, SourceMetadata>;
  ledgerPath: string;
  packetPath: string;
  packetMarkdownPath: string;
  attemptRoot: string;
  runRoot: string;
}

interface RunEventRecord {
  [key: string]: unknown;
  schema_version: string;
  synthetic_fixture: boolean;
  event_id: string;
  run_id: string;
  attempt_id: string | null;
  sequence: number;
  previous_event_hash: Sha256Digest | null;
  event_type: string;
  actor_session_ref: string;
  recorded_at: string;
  payload: Record<string, unknown>;
  event_hash: Sha256Digest;
}

export function validateAttempt(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  options: ValidationOptions = {},
): ValidationReport {
  return validateAttemptInternal(
    workspaceDir,
    runId,
    attemptId,
    options,
    new Set(),
  );
}

function validateAttemptInternal(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  options: ValidationOptions,
  predecessorChain: ReadonlySet<string>,
): ValidationReport {
  const phase = options.phase ?? detectPhase(workspaceDir, runId, attemptId);
  const report: ValidationReport = {
    valid: false,
    phase,
    end_to_end_ready: false,
    archive_id: null,
    errors: [],
    warnings: [],
    resume: null,
  };

  if (predecessorChain.has(attemptId)) {
    issue(
      report,
      "attempt.predecessor_cycle",
      `runs/${runId}/attempts/${attemptId}`,
      "attempt predecessor links must be acyclic",
    );
    return finish(report, options);
  }
  const nextPredecessorChain = new Set(predecessorChain);
  nextPredecessorChain.add(attemptId);

  if (!isSafeId(runId) || !isSafeId(attemptId)) {
    issue(
      report,
      "identity.invalid",
      ".",
      "run_id and attempt_id must be safe identifiers",
    );
    return finish(report, options);
  }

  let candidate: LoadedCandidate;
  try {
    candidate = validateCandidate(workspaceDir, runId, attemptId, report);
  } catch (error) {
    issue(
      report,
      "candidate.unreadable",
      ".",
      error instanceof Error ? error.message : String(error),
    );
    return finish(report, options);
  }

  const attemptFiles = listAttemptFiles(workspaceDir, candidate.attemptRoot, report);
  const required = new Set(["ledger.jsonl", "packet.json", "packet.md"]);
  if (phaseRank(phase) >= phaseRank("submitted")) {
    required.add("submission.json");
  }
  if (phase === "reviewed") {
    required.add("review.json");
  }
  if (phaseRank(phase) >= phaseRank("sealed")) {
    required.add("seal.json");
  }
  for (const name of required) {
    if (!attemptFiles.has(name)) {
      issue(
        report,
        "attempt.file_missing",
        `${candidate.attemptRoot}/${name}`,
        `required ${phase} artifact is missing`,
      );
    }
  }

  let submission: Submission | null = null;
  let review: Review | null = null;
  let seal: Seal | null = null;

  if (attemptFiles.has("submission.json")) {
    submission = loadAndValidateSubmission(workspaceDir, candidate, report);
  }
  if (attemptFiles.has("review.json")) {
    review = loadAndValidateReview(
      workspaceDir,
      candidate,
      submission,
      report,
    );
  }
  if (attemptFiles.has("seal.json")) {
    seal = loadAndValidateSeal(
      workspaceDir,
      candidate,
      submission,
      review,
      report,
      nextPredecessorChain,
    );
  }

  if (
    seal?.review_ref !== null &&
    seal?.review_ref !== undefined &&
    review === null
  ) {
    issue(
      report,
      "seal.review_missing",
      `${candidate.attemptRoot}/review.json`,
      "seal binds a review but review.json is absent or invalid",
    );
  }

  validateRunEventLifecycle(candidate, submission, review, seal, report);
  if (seal !== null && report.errors.length === 0) {
    report.archive_id = sha256CanonicalJson(seal);
  }
  report.resume = deriveResumeState(
    runId,
    attemptId,
    candidate.ledger,
    candidate.ledger.at(-1)?.event_hash ?? null,
    candidate.runEvents,
    submission,
    review,
    seal,
  );

  const substantiveResult =
    candidate.packet.claims.length > 0 ||
    candidate.packet.negative_findings.length > 0 ||
    candidate.packet.unresolved.length > 0;
  report.end_to_end_ready =
    report.errors.length === 0 &&
    substantiveResult &&
    candidate.packet.process_terminal === "completed" &&
    ["answered", "inconclusive"].includes(candidate.packet.completion) &&
    submission !== null &&
    review?.overall_verdict === "pass" &&
    seal?.terminal_state.review_verdict === "pass" &&
    seal.terminal_state.process_terminal === "completed";

  return finish(report, options);
}

/**
 * Validate and resume an in-progress attempt before packet synthesis.
 *
 * Once packet.json exists, the ordinary phase-aware validator remains the
 * authority. Before that point this path validates only frozen authority,
 * inputs, sources, run events, the append-only ledger, and checkpoint state.
 */
export function validateResume(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): ValidationReport {
  const packetPath = `runs/${runId}/attempts/${attemptId}/packet.json`;
  if (exists(workspaceDir, packetPath)) {
    return validateAttempt(workspaceDir, runId, attemptId);
  }

  const report: ValidationReport = {
    valid: false,
    phase: "candidate",
    end_to_end_ready: false,
    archive_id: null,
    errors: [],
    warnings: [],
    resume: null,
  };
  if (!isSafeId(runId) || !isSafeId(attemptId)) {
    issue(
      report,
      "identity.invalid",
      ".",
      "run_id and attempt_id must be safe identifiers",
    );
    return finish(report, {});
  }

  try {
    const runRoot = `runs/${runId}`;
    const attemptRoot = `${runRoot}/attempts/${attemptId}`;
    const activationPath = `${runRoot}/activation.json`;
    const inputsPath = `${runRoot}/inputs.json`;
    const runEventsPath = `${runRoot}/run-events.jsonl`;
    const ledgerPath = `${attemptRoot}/ledger.jsonl`;
    const activation = readNormalizedJson<Activation>(
      workspaceDir,
      activationPath,
    );
    const inputs = readNormalizedJson<Inputs>(workspaceDir, inputsPath);
    const job = readYaml<Job>(workspaceDir, activation.job_ref.path);
    schema(report, activationPath, SCHEMA.activation, activation);
    schema(report, inputsPath, SCHEMA.inputs, inputs);
    schema(report, activation.job_ref.path, SCHEMA.job, job);
    validateIdentityPins(
      workspaceDir,
      runId,
      attemptId,
      job,
      activation,
      inputs,
      null,
      report,
    );
    validateCapabilities(
      job,
      activation,
      attemptId,
      report,
      activationPath,
    );
    validateFrozenInputPopulation(job, inputs, report);
    validatePinnedArtifacts(job, inputs, report);
    const sourceMap = validateSources(
      workspaceDir,
      runRoot,
      job,
      activation,
      inputs,
      report,
    );
    if (sourceMap.size > activation.budget.evidence_objects) {
      issue(
        report,
        "budget.evidence_exceeded",
        "inputs.sources",
        "admitted source-object count exceeds the activated evidence budget",
      );
    }
    validateMarketSnapshots(inputs, activation, sourceMap, report);
    validateRunLayout(workspaceDir, runRoot, inputs, report);
    const runEvents = validateRunEvents(
      workspaceDir,
      runEventsPath,
      runId,
      activation,
      attemptId,
      report,
    );
    const ledger = parseLedgerJsonl(readBytes(workspaceDir, ledgerPath));
    ledger.forEach((event, index) =>
      schema(report, `${ledgerPath}:${index + 1}`, SCHEMA.ledgerEvent, event),
    );
    const ledgerResult = validateLedgerChain(ledger, {
      expectedAttemptId: attemptId,
      expectedRunId: runId,
      expectedSchemaVersion: "research-ledger-event/v0",
    });
    for (const ledgerIssue of ledgerResult.issues) {
      issue(
        report,
        `ledger.${ledgerIssue.code}`,
        `${ledgerPath}${ledgerIssue.event_index === undefined ? "" : `:${ledgerIssue.event_index + 1}`}`,
        ledgerIssue.message,
      );
    }
    validateLedgerSemantics(
      ledger,
      job,
      activation,
      sourceMap,
      report,
      ledgerPath,
    );
    const attemptStarted = runEvents.find(
      (event) =>
        event.event_type === "attempt_started" &&
        event.attempt_id === attemptId,
    );
    if (attemptStarted !== undefined) {
      ledger.forEach((event, index) => {
        if (isAfter(attemptStarted.recorded_at, event.recorded_at)) {
          issue(
            report,
            "ledger.before_attempt_start",
            `${ledgerPath}:${index + 1}`,
            "ledger event cannot predate the exact attempt_started run event",
          );
        }
      });
    }
    if (
      (job.gates.checkpoint_required || job.gates.cold_resume_required) &&
      ledger.at(-1)?.event_type !== "checkpoint"
    ) {
      issue(
        report,
        "checkpoint.terminal_missing",
        ledgerPath,
        "cold resume requires the current validated ledger prefix to end at a checkpoint",
      );
    }

    const attemptFiles = listAttemptFiles(workspaceDir, attemptRoot, report);
    if (!attemptFiles.has("ledger.jsonl")) {
      issue(
        report,
        "attempt.file_missing",
        ledgerPath,
        "packet-free resume requires ledger.jsonl",
      );
    }
    for (const terminalName of [
      "packet.md",
      "submission.json",
      "review.json",
      "seal.json",
    ]) {
      if (attemptFiles.has(terminalName)) {
        issue(
          report,
          "resume.packet_missing_for_terminal_state",
          `${attemptRoot}/${terminalName}`,
          `${terminalName} cannot exist before packet.json`,
        );
      }
    }
    if (
      runEvents.some(
        (event) =>
          event.attempt_id === attemptId &&
          [
            "attempt_submitted",
            "review_returned",
            "successor_link",
            "run_closed",
          ].includes(event.event_type),
      )
    ) {
      issue(
        report,
        "resume.packet_missing_for_terminal_state",
        runEventsPath,
        "terminal run events cannot exist before packet synthesis",
      );
    }
    for (const privacyFinding of scanStructuralPrivacy({
      activation,
      inputs,
      job,
      ledger,
      runEvents,
      sources: [...sourceMap.values()],
    })) {
      issue(
        report,
        "privacy.structural_violation",
        privacyFinding.path,
        privacyFinding.reason,
      );
    }
    scanCoreContractPrivacy(
      workspaceDir,
      [
        activation.job_ref.path,
        activation.ops_decision_ref.path,
        activationPath,
        inputsPath,
        runEventsPath,
        ...inputs.sources.map((source) => source.metadata_path),
      ],
      report,
    );
    rejectPromotionInsideRun(workspaceDir, runRoot, report);
    scanSourceContentPrivacy(workspaceDir, inputs, report);
    report.resume = deriveResumeState(
      runId,
      attemptId,
      ledger,
      ledger.at(-1)?.event_hash ?? null,
      runEvents,
      null,
      null,
      null,
    );
  } catch (error) {
    issue(
      report,
      "resume.unreadable",
      ".",
      error instanceof Error ? error.message : String(error),
    );
  }
  return finish(report, {});
}

function validateCandidate(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  report: ValidationReport,
): LoadedCandidate {
  const runRoot = `runs/${runId}`;
  const attemptRoot = `${runRoot}/attempts/${attemptId}`;
  const activationPath = `${runRoot}/activation.json`;
  const inputsPath = `${runRoot}/inputs.json`;
  const runEventsPath = `${runRoot}/run-events.jsonl`;
  const ledgerPath = `${attemptRoot}/ledger.jsonl`;
  const packetPath = `${attemptRoot}/packet.json`;
  const packetMarkdownPath = `${attemptRoot}/packet.md`;

  const activation = readNormalizedJson<Activation>(
    workspaceDir,
    activationPath,
  );
  schema(report, activationPath, SCHEMA.activation, activation);
  const inputs = readNormalizedJson<Inputs>(workspaceDir, inputsPath);
  schema(report, inputsPath, SCHEMA.inputs, inputs);
  const job = readYaml<Job>(workspaceDir, activation.job_ref.path);
  schema(report, activation.job_ref.path, SCHEMA.job, job);
  const packet = readNormalizedJson<ResearchPacket>(
    workspaceDir,
    packetPath,
  );
  schema(report, packetPath, SCHEMA.packet, packet);

  validateIdentityPins(
    workspaceDir,
    runId,
    attemptId,
    job,
    activation,
    inputs,
    packet,
    report,
  );
  validateTerminalStateMembership(job, packet, report, packetPath);
  validateCapabilities(
    job,
    activation,
    attemptId,
    report,
    activationPath,
  );
  validateSubjectAndQuestionPins(job, inputs, packet, report, packetPath);
  validatePinnedArtifacts(job, inputs, report);

  const sourceMap = validateSources(
    workspaceDir,
    runRoot,
    job,
    activation,
    inputs,
    report,
  );
  if (sourceMap.size > activation.budget.evidence_objects) {
    issue(
      report,
      "budget.evidence_exceeded",
      "inputs.sources",
      "admitted source-object count exceeds the activated evidence budget",
    );
  }
  validateMarketSnapshots(inputs, activation, sourceMap, report);

  validateRunLayout(workspaceDir, runRoot, inputs, report);
  const runEvents = validateRunEvents(
    workspaceDir,
    runEventsPath,
    runId,
    activation,
    attemptId,
    report,
  );

  const ledger = parseLedgerJsonl(readBytes(workspaceDir, ledgerPath));
  ledger.forEach((event, index) =>
    schema(report, `${ledgerPath}:${index + 1}`, SCHEMA.ledgerEvent, event),
  );
  const ledgerResult = validateLedgerChain(ledger, {
    expectedAttemptId: attemptId,
    expectedRunId: runId,
    expectedSchemaVersion: "research-ledger-event/v0",
  });
  for (const ledgerIssue of ledgerResult.issues) {
    issue(
      report,
      `ledger.${ledgerIssue.code}`,
      `${ledgerPath}${ledgerIssue.event_index === undefined ? "" : `:${ledgerIssue.event_index + 1}`}`,
      ledgerIssue.message,
    );
  }
  validateLedgerSemantics(
    ledger,
    job,
    activation,
    sourceMap,
    report,
    ledgerPath,
  );
  const attemptStarted = runEvents.find(
    (event) =>
      event.event_type === "attempt_started" &&
      event.attempt_id === attemptId,
  );
  if (attemptStarted !== undefined) {
    ledger.forEach((event, index) => {
      if (isAfter(attemptStarted.recorded_at, event.recorded_at)) {
        issue(
          report,
          "ledger.before_attempt_start",
          `${ledgerPath}:${index + 1}`,
          "ledger event cannot predate the exact attempt_started run event",
        );
      }
    });
  }
  if (isAfter(activation.activated_at, packet.generated_at)) {
    issue(
      report,
      "packet.generated_before_activation",
      `${packetPath}.generated_at`,
      "packet generation cannot predate run activation",
    );
  }
  const finalLedgerTime = ledger.at(-1)?.recorded_at;
  if (
    finalLedgerTime !== undefined &&
    isAfter(finalLedgerTime, packet.generated_at)
  ) {
    issue(
      report,
      "packet.generated_before_ledger",
      `${packetPath}.generated_at`,
      "packet generation cannot predate the final frozen ledger event",
    );
  }
  if (
    (job.gates.checkpoint_required || job.gates.cold_resume_required) &&
    ledger.at(-1)?.event_type !== "checkpoint"
  ) {
    issue(
      report,
      "checkpoint.terminal_missing",
      ledgerPath,
      "the frozen attempt must end with a checkpoint for deterministic cold resume",
    );
  }
  if (
    job.gates.self_challenge_required &&
    packet.process_terminal === "completed" &&
    !ledger.some((event) => event.event_type === "challenge")
  ) {
    issue(
      report,
      "challenge.required",
      ledgerPath,
      "completed research requires an explicit challenge record",
    );
  }
  validatePacketTraceability(
    job,
    activation,
    inputs,
    packet,
    ledger,
    report,
    packetPath,
  );

  const rendered = renderPacketMarkdown(packet);
  const actualMarkdown = readUtf8(workspaceDir, packetMarkdownPath);
  if (actualMarkdown !== rendered) {
    issue(
      report,
      "packet.markdown_mismatch",
      packetMarkdownPath,
      "packet.md is not the exact deterministic rendering of packet.json",
    );
  }

  for (const privacyFinding of scanStructuralPrivacy({
    activation,
    inputs,
    job,
    packet,
    ledger,
    runEvents,
    sources: [...sourceMap.values()],
  })) {
    issue(
      report,
      "privacy.structural_violation",
      privacyFinding.path,
      privacyFinding.reason,
    );
  }
  scanCoreContractPrivacy(
    workspaceDir,
    [
      activation.job_ref.path,
      activation.ops_decision_ref.path,
      activationPath,
      inputsPath,
      runEventsPath,
      ...inputs.sources.map((source) => source.metadata_path),
    ],
    report,
  );

  rejectPromotionInsideRun(workspaceDir, runRoot, report);
  scanSourceContentPrivacy(workspaceDir, inputs, report);

  return {
    job,
    activation,
    inputs,
    packet,
    ledger,
    runEvents,
    sources: sourceMap,
    ledgerPath,
    packetPath,
    packetMarkdownPath,
    attemptRoot,
    runRoot,
  };
}

function validateIdentityPins(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  job: Job,
  activation: Activation,
  inputs: Inputs,
  packet: ResearchPacket | null,
  report: ValidationReport,
): void {
  const identityPairs: Array<[string, unknown, unknown]> = [
    ["activation.run_id", activation.run_id, runId],
    ["inputs.run_id", inputs.run_id, runId],
    ["activation.job_id", activation.job_ref.job_id, job.job_id],
    ["inputs.job_id", inputs.job_ref.job_id, job.job_id],
    ["activation.job_version", activation.job_ref.job_version, job.job_version],
    ["inputs.job_version", inputs.job_ref.job_version, job.job_version],
    ["activation.cutoff_at", activation.cutoff_at, job.cutoff_at],
    ["inputs.cutoff_at", inputs.cutoff_at, job.cutoff_at],
    ["activation.synthetic_fixture", activation.synthetic_fixture, job.synthetic_fixture],
    ["inputs.synthetic_fixture", inputs.synthetic_fixture, job.synthetic_fixture],
    ["activation.authority_ceiling", activation.authority_ceiling, job.authority.ceiling],
    [
      "activation.idempotency_key",
      activation.idempotency_key,
      `${job.job_id}:${job.job_version}:${runId}`,
    ],
  ];
  if (packet !== null) {
    identityPairs.push(
      ["packet.run_id", packet.run_id, runId],
      ["packet.attempt_id", packet.attempt_id, attemptId],
      ["packet.job_id", packet.job_id, job.job_id],
      ["packet.job_version", packet.job_version, job.job_version],
      ["packet.synthetic_fixture", packet.synthetic_fixture, job.synthetic_fixture],
      ["packet.reportability", packet.reportability, job.reportability],
      ["packet.output_class", packet.output_class, job.output_class],
    );
  }
  for (const [path, actual, expected] of identityPairs) {
    if (actual !== expected) {
      issue(
        report,
        "identity.mismatch",
        path,
        `expected ${String(expected)}; received ${String(actual)}`,
      );
    }
  }
  if (
    job.synthetic_fixture &&
    (job.mode !== "synthetic_conformance" ||
      job.output_class !== "synthetic_conformance_fixture" ||
      (packet !== null &&
        packet.output_class !== "synthetic_conformance_fixture"))
  ) {
    issue(
      report,
      "packet.synthetic_mode_mismatch",
      packet === null ? "job" : "packet.output_class",
      "synthetic fixtures require synthetic_conformance mode and output class",
    );
  }
  if (
    sha256CanonicalJson(inputs.research_context) !==
    sha256CanonicalJson(job.research_context)
  ) {
    issue(
      report,
      "context.frozen_mismatch",
      "inputs.research_context",
      "frozen research context differs from the immutable job context",
    );
  }
  if (
    !job.context_policy.allowed_context_classes.includes(
      job.research_context.context_class,
    ) ||
    job.context_policy.prohibited_context_classes.includes(
      job.research_context.context_class,
    ) ||
    (job.synthetic_fixture &&
      job.research_context.context_class !== "synthetic_fixture")
  ) {
    issue(
      report,
      "context.policy_mismatch",
      "job.research_context",
      "research context class is outside the job context policy",
    );
  }

  const jobDigest = sha256Raw(
    readBytes(workspaceDir, activation.job_ref.path),
  );
  for (const [path, digest] of [
    ["activation.job_ref.digest", activation.job_ref.digest],
    ["inputs.job_ref.digest", inputs.job_ref.digest],
  ] as const) {
    if (digest !== jobDigest) {
      issue(
        report,
        "digest.job_mismatch",
        path,
        `expected ${jobDigest}; received ${digest}`,
      );
    }
  }

  const inputDigest = sha256CanonicalJson(inputs);
  if (activation.inputs_ref.digest !== inputDigest) {
    issue(
      report,
      "digest.inputs_mismatch",
      "activation.inputs_ref.digest",
      `expected ${inputDigest}; received ${activation.inputs_ref.digest}`,
    );
  }
  const expectedInputPath = `runs/${runId}/inputs.json`;
  if (activation.inputs_ref.path !== expectedInputPath) {
    issue(
      report,
      "path.inputs_mismatch",
      "activation.inputs_ref.path",
      `expected ${expectedInputPath}`,
    );
  }
  const authorityDecision = readNormalizedJson<AuthorityDecision>(
    workspaceDir,
    activation.ops_decision_ref.path,
  );
  schema(
    report,
    activation.ops_decision_ref.path,
    SCHEMA.authorityDecision,
    authorityDecision,
  );
  const decisionDigest = sha256CanonicalJson(authorityDecision);
  if (activation.ops_decision_ref.digest !== decisionDigest) {
    issue(
      report,
      "digest.authority_decision_mismatch",
      "activation.ops_decision_ref.digest",
      `expected ${decisionDigest}; received ${activation.ops_decision_ref.digest}`,
    );
  }
  if (activation.ops_decision_ref.digest_mode !== VERSIONS.canonicalJson) {
    issue(
      report,
      "version.authority_digest_mode",
      "activation.ops_decision_ref.digest_mode",
      `expected ${VERSIONS.canonicalJson}`,
    );
  }
  if (!activation.ops_decision_ref.path.startsWith("authority/")) {
    issue(
      report,
      "authority.decision_path",
      "activation.ops_decision_ref.path",
      "authority decision receipt must remain beneath authority/",
    );
  }
  const decisionBindings: Array<[string, unknown, unknown]> = [
    ["synthetic_fixture", authorityDecision.synthetic_fixture, activation.synthetic_fixture],
    ["decision_ref", authorityDecision.decision_ref, activation.ops_decision_ref.decision_ref],
    ["run_id", authorityDecision.run_id, activation.run_id],
    ["job_ref", authorityDecision.job_ref, activation.job_ref],
    ["inputs_ref", authorityDecision.inputs_ref, activation.inputs_ref],
    ["cutoff_at", authorityDecision.cutoff_at, activation.cutoff_at],
    [
      "capabilities",
      authorityDecision.capabilities,
      activation.effective_capabilities,
    ],
    ["budget", authorityDecision.budget, activation.budget],
    [
      "authority_ceiling",
      authorityDecision.authority_ceiling,
      activation.authority_ceiling,
    ],
    [
      "permitted_branch",
      authorityDecision.permitted_branch,
      activation.permitted_branch,
    ],
    [
      "permitted_path",
      authorityDecision.permitted_path,
      activation.permitted_path,
    ],
    [
      "approved_at",
      authorityDecision.approved_at,
      activation.ops_decision_ref.approved_at,
    ],
    [
      "approved_by",
      authorityDecision.approved_by,
      activation.ops_decision_ref.approved_by,
    ],
  ];
  for (const [field, authorized, activated] of decisionBindings) {
    if (sha256CanonicalJson(authorized) !== sha256CanonicalJson(activated)) {
      issue(
        report,
        "authority.decision_mismatch",
        `${activation.ops_decision_ref.path}.${field}`,
        "activation differs from the exact operator-authorized value",
      );
    }
  }
  if (isAfter(inputs.frozen_at, activation.ops_decision_ref.approved_at)) {
    issue(
      report,
      "activation.inputs_after_authority",
      "inputs.frozen_at",
      "frozen inputs must exist before or at the exact operator approval",
    );
  }
  if (
    isAfter(
      activation.ops_decision_ref.approved_at,
      activation.activated_at,
    )
  ) {
    issue(
      report,
      "activation.authority_after_activation",
      "activation.activated_at",
      "operator approval must not postdate activation",
    );
  }
}

function validatePinnedArtifacts(
  job: Job,
  inputs: Inputs,
  report: ValidationReport,
): void {
  reportDuplicateIds(
    inputs.artifacts.map((artifact) => artifact.artifact_id),
    report,
    "input.duplicate_artifact",
    "inputs.artifacts",
  );
  for (const artifact of inputs.artifacts) {
    if (artifact.admissibility !== "admitted") {
      issue(
        report,
        "input.artifact_not_admitted",
        `inputs.artifacts.${artifact.artifact_id}`,
        "governed input artifact is not explicitly admitted",
      );
    }
    if (artifact.freshness !== "current") {
      issue(
        report,
        "input.artifact_not_current",
        `inputs.artifacts.${artifact.artifact_id}`,
        "governed input artifact is not current for the frozen run",
      );
    }
  }
  if (job.baseline_ref !== null) {
    const matches = inputs.artifacts.filter(
      (artifact) =>
        artifact.artifact_id === job.baseline_ref?.input_id &&
        artifact.artifact_digest === job.baseline_ref.digest,
    );
    if (matches.length !== 1) {
      issue(
        report,
        "input.baseline_unpinned",
        "inputs.artifacts",
        "job baseline_ref must resolve exactly once to the frozen artifact digest",
      );
    }
  }
  reportDuplicateIds(
    inputs.blocked_inputs.map((entry) => entry.input_id),
    report,
    "input.duplicate_blocked_input",
    "inputs.blocked_inputs",
  );
  const questionIds = new Set(
    job.questions.map((question) => question.question_id),
  );
  for (const blocked of inputs.blocked_inputs) {
    if (blocked.question_refs.length === 0) {
      issue(
        report,
        "input.blocked_question_missing",
        `inputs.blocked_inputs.${blocked.input_id}`,
        "blocked input must identify at least one affected frozen question",
      );
    }
    validateScopeReferences(
      blocked.question_refs,
      questionIds,
      report,
      "input.blocked_question_unknown",
      `inputs.blocked_inputs.${blocked.input_id}.question_refs`,
    );
  }
}

function validateTerminalStateMembership(
  job: Job,
  packet: ResearchPacket,
  report: ValidationReport,
  path: string,
): void {
  for (const [kind, value, allowed] of [
    ["process", packet.process_terminal, job.terminal_states.process],
    ["completion", packet.completion, job.terminal_states.completion],
  ] as const) {
    if (!allowed.includes(value)) {
      issue(
        report,
        "job.terminal_state_not_permitted",
        `${path}.${kind === "process" ? "process_terminal" : "completion"}`,
        `${kind} terminal state ${value} is outside the activated job contract`,
      );
    }
  }
}

function validateCapabilities(
  job: Job,
  activation: Activation,
  _attemptId: string,
  report: ValidationReport,
  path: string,
): void {
  for (const error of capabilityExpansionErrors(
    job.capabilities,
    activation.effective_capabilities,
  )) {
    issue(report, "authority.capability_expansion", path, error);
  }
  const expectedAttemptsRoot = `runs/${activation.run_id}/attempts`;
  const runEventsPath = `runs/${activation.run_id}/run-events.jsonl`;
  if (
    activation.effective_capabilities.repository_write.some(
      (pathEntry) =>
        pathEntry !== runEventsPath &&
        pathEntry !== expectedAttemptsRoot &&
        !pathEntry.startsWith(`${expectedAttemptsRoot}/`),
    )
  ) {
    issue(
      report,
      "authority.write_scope",
      `${path}.effective_capabilities.repository_write`,
      "effective writes must remain beneath the stable attempts root or target the run event log",
    );
  }
  if (
    !activation.effective_capabilities.repository_write.includes(
      expectedAttemptsRoot,
    ) ||
    !activation.effective_capabilities.repository_write.includes(runEventsPath)
  ) {
    issue(
      report,
      "authority.write_scope_missing",
      `${path}.effective_capabilities.repository_write`,
      "effective writes must include the stable attempts root and run event log",
    );
  }
  if (activation.permitted_path !== expectedAttemptsRoot) {
    issue(
      report,
      "authority.permitted_path",
      `${path}.permitted_path`,
      "permitted_path must equal the stable run attempts root",
    );
  }
  for (const requiredRead of [
    activation.job_ref.path,
    activation.ops_decision_ref.path,
    `runs/${activation.run_id}`,
  ]) {
    if (
      !activation.effective_capabilities.repository_read.some(
        (granted) =>
          requiredRead === granted || requiredRead.startsWith(`${granted}/`),
      )
    ) {
      issue(
        report,
        "authority.read_scope_missing",
        `${path}.effective_capabilities.repository_read`,
        `effective read scope does not cover required governed input: ${requiredRead}`,
      );
    }
  }
  for (const key of [
    "wall_clock_minutes",
    "tool_calls",
    "evidence_objects",
  ] as const) {
    if (activation.budget[key] > job.budgets[key]) {
      issue(
        report,
        "authority.budget_expansion",
        `${path}.budget.${key}`,
        `activated ${key} budget exceeds the immutable job ceiling`,
      );
    }
  }
}

function validateSubjectAndQuestionPins(
  job: Job,
  inputs: Inputs,
  packet: ResearchPacket,
  report: ValidationReport,
  path: string,
): void {
  if (sha256CanonicalJson(job.subjects) !== sha256CanonicalJson(inputs.subjects)) {
    issue(
      report,
      "population.subjects_changed",
      "inputs.subjects",
      "frozen subject population differs from the activated job",
    );
  }
  if (
    sha256CanonicalJson(job.comparison_population.members) !==
    sha256CanonicalJson(inputs.comparisons)
  ) {
    issue(
      report,
      "population.comparisons_changed",
      "inputs.comparisons",
      "comparison population differs from the activated job",
    );
  }

  reportDuplicateIds(
    job.subjects.map((entry) => entry.subject_id),
    report,
    "population.duplicate_subject",
    "job.subjects",
  );
  reportDuplicateIds(
    job.comparison_population.members.map((entry) => entry.subject_id),
    report,
    "population.duplicate_comparison",
    "job.comparison_population.members",
  );
  reportDuplicateIds(
    inputs.subjects.map((entry) => entry.subject_id),
    report,
    "population.duplicate_subject",
    "inputs.subjects",
  );
  reportDuplicateIds(
    inputs.comparisons.map((entry) => entry.subject_id),
    report,
    "population.duplicate_comparison",
    "inputs.comparisons",
  );
  reportDuplicateIds(
    job.questions.map((entry) => entry.question_id),
    report,
    "question.duplicate_id",
    "job.questions",
  );
  reportDuplicateIds(
    packet.questions.map((entry) => entry.question_id),
    report,
    "question.duplicate_id",
    `${path}.questions`,
  );
  reportDuplicateIds(
    packet.claims.map((entry) => entry.claim_id),
    report,
    "packet.duplicate_claim",
    `${path}.claims`,
  );
  reportDuplicateIds(
    packet.negative_findings.map((entry) => entry.finding_id),
    report,
    "packet.duplicate_negative_finding",
    `${path}.negative_findings`,
  );
  reportDuplicateIds(
    packet.unresolved.map((entry) => entry.unresolved_id),
    report,
    "packet.duplicate_unresolved",
    `${path}.unresolved`,
  );
  reportDuplicateIds(
    packet.followups.map((entry) => entry.followup_id),
    report,
    "packet.duplicate_followup",
    `${path}.followups`,
  );

  const subjectIds = uniqueIds(job.subjects.map((entry) => entry.subject_id));
  const comparisonIds = uniqueIds(
    job.comparison_population.members.map((entry) => entry.subject_id),
  );
  for (const subjectId of subjectIds) {
    if (comparisonIds.has(subjectId)) {
      issue(
        report,
        "population.subject_comparison_overlap",
        "job.comparison_population.members",
        `subject ${subjectId} appears in both the subject and comparison populations`,
      );
    }
  }
  const questionMap = new Map(
    job.questions.map((question) => [question.question_id, question.prompt]),
  );
  const packetQuestions = uniqueIds(
    packet.questions.map((question) => question.question_id),
  );

  if (
    packetQuestions.size !== questionMap.size ||
    [...questionMap.keys()].some((id) => !packetQuestions.has(id))
  ) {
    issue(
      report,
      "question.population_mismatch",
      `${path}.questions`,
      "packet must resolve every activated question exactly once",
    );
  }

  const claimReferenceCounts = new Map<string, number>();
  for (const question of packet.questions) {
    reportDuplicateIds(
      question.claim_refs,
      report,
      "packet.duplicate_claim_reference",
      `${path}.questions.${question.question_id}.claim_refs`,
    );
    for (const claimRef of question.claim_refs) {
      claimReferenceCounts.set(
        claimRef,
        (claimReferenceCounts.get(claimRef) ?? 0) + 1,
      );
    }
    if (question.prompt !== questionMap.get(question.question_id)) {
      issue(
        report,
        "question.prompt_changed",
        `${path}.questions.${question.question_id}`,
        "packet question prompt differs from the activated job",
      );
    }
  }

  for (const claim of packet.claims) {
    const referenceCount = claimReferenceCounts.get(claim.claim_id) ?? 0;
    if (referenceCount !== 1) {
      issue(
        report,
        "packet.claim_reference_count",
        `${path}.claims.${claim.claim_id}`,
        `claim must be referenced exactly once by its matching question; received ${referenceCount}`,
      );
    }
    if (!subjectIds.has(claim.subject_ref)) {
      issue(
        report,
        comparisonIds.has(claim.subject_ref)
          ? "population.comparison_promoted_to_subject"
          : "population.silent_subject_addition",
        `${path}.claims.${claim.claim_id}.subject_ref`,
        "claim subject is not in the frozen subject population",
      );
    }
    if (!questionMap.has(claim.question_ref)) {
      issue(
        report,
        "question.unknown_reference",
        `${path}.claims.${claim.claim_id}.question_ref`,
        "claim references a question outside the activated job",
      );
    }
    if (
      (job.baseline_ref === null && claim.baseline_ref !== null) ||
      (job.baseline_ref !== null &&
        claim.baseline_ref !== job.baseline_ref.input_id)
    ) {
      issue(
        report,
        "packet.baseline_reference",
        `${path}.claims.${claim.claim_id}.baseline_ref`,
        "claim baseline reference must match the immutable job baseline",
      );
    }
    if (
      (claim.baseline_ref === null && claim.baseline_position !== null) ||
      (claim.baseline_ref !== null && claim.baseline_position === null)
    ) {
      issue(
        report,
        "packet.baseline_position",
        `${path}.claims.${claim.claim_id}.baseline_position`,
        "baseline position must be present exactly when a frozen baseline is referenced",
      );
    }
    for (const comparisonRef of claim.comparison_refs) {
      if (!comparisonIds.has(comparisonRef)) {
        issue(
          report,
          "population.unknown_comparison_reference",
          `${path}.claims.${claim.claim_id}.comparison_refs`,
          `comparison reference is outside the frozen comparison population: ${comparisonRef}`,
        );
      }
    }
    for (const [relation, references] of [
      ["comparison_refs", claim.comparison_refs],
      ["hypothesis_refs", claim.hypothesis_refs],
      ["evidence_refs", claim.evidence_refs],
      ["calculation_refs", claim.calculation_refs],
      ["counterevidence_refs", claim.counterevidence_refs],
      ["challenge_refs", claim.challenge_refs],
      ["missing_evidence_refs", claim.missing_evidence_refs],
    ] as const) {
      reportDuplicateIds(
        references,
        report,
        "packet.duplicate_traceability_reference",
        `${path}.claims.${claim.claim_id}.${relation}`,
      );
    }
  }
}

function validateFrozenInputPopulation(
  job: Job,
  inputs: Inputs,
  report: ValidationReport,
): void {
  if (
    sha256CanonicalJson(job.subjects) !==
    sha256CanonicalJson(inputs.subjects)
  ) {
    issue(
      report,
      "population.subjects_changed",
      "inputs.subjects",
      "frozen subject population differs from the activated job",
    );
  }
  if (
    sha256CanonicalJson(job.comparison_population.members) !==
    sha256CanonicalJson(inputs.comparisons)
  ) {
    issue(
      report,
      "population.comparisons_changed",
      "inputs.comparisons",
      "comparison population differs from the activated job",
    );
  }
  reportDuplicateIds(
    job.subjects.map((entry) => entry.subject_id),
    report,
    "population.duplicate_subject",
    "job.subjects",
  );
  reportDuplicateIds(
    job.comparison_population.members.map((entry) => entry.subject_id),
    report,
    "population.duplicate_comparison",
    "job.comparison_population.members",
  );
  reportDuplicateIds(
    inputs.subjects.map((entry) => entry.subject_id),
    report,
    "population.duplicate_subject",
    "inputs.subjects",
  );
  reportDuplicateIds(
    inputs.comparisons.map((entry) => entry.subject_id),
    report,
    "population.duplicate_comparison",
    "inputs.comparisons",
  );
  reportDuplicateIds(
    job.questions.map((entry) => entry.question_id),
    report,
    "question.duplicate_id",
    "job.questions",
  );
  const subjectIds = new Set(
    job.subjects.map((entry) => entry.subject_id),
  );
  for (const comparison of job.comparison_population.members) {
    if (subjectIds.has(comparison.subject_id)) {
      issue(
        report,
        "population.subject_comparison_overlap",
        "job.comparison_population.members",
        `subject ${comparison.subject_id} appears in both the subject and comparison populations`,
      );
    }
  }
}

function validateSources(
  workspaceDir: string,
  runRoot: string,
  job: Job,
  activation: Activation,
  inputs: Inputs,
  report: ValidationReport,
): Map<string, SourceMetadata> {
  const result = new Map<string, SourceMetadata>();
  reportDuplicateIds(
    job.source_envelope.families.map((family) => family.source_family_id),
    report,
    "source.duplicate_family",
    "job.source_envelope.families",
  );
  const allowedFamilies = new Map(
    job.source_envelope.families.map((family) => [
      family.source_family_id,
      family,
    ]),
  );

  for (const source of inputs.sources) {
    if (result.has(source.source_object_id)) {
      issue(
        report,
        "source.duplicate_id",
        "inputs.sources",
        `duplicate source ${source.source_object_id}`,
      );
      continue;
    }
    const expectedPrefix = `${runRoot}/sources/${source.source_object_id}/`;
    if (!source.metadata_path.startsWith(expectedPrefix)) {
      issue(
        report,
        "source.path_scope",
        source.metadata_path,
        "source metadata must be stored beneath its run-scoped source directory",
      );
    }
    const metadata = readNormalizedJson<SourceMetadata>(
      workspaceDir,
      source.metadata_path,
    );
    schema(report, source.metadata_path, SCHEMA.sourceMetadata, metadata);
    result.set(source.source_object_id, metadata);

    const metadataDigest = sha256CanonicalJson(metadata);
    if (source.metadata_digest !== metadataDigest) {
      issue(
        report,
        "digest.source_metadata_mismatch",
        source.metadata_path,
        `expected ${metadataDigest}; received ${source.metadata_digest}`,
      );
    }

    const checks: Array<[string, unknown, unknown]> = [
      ["run_id", metadata.run_id, activation.run_id],
      ["source_object_id", metadata.source_object_id, source.source_object_id],
      ["content_path", metadata.content_path, source.content_path],
      ["content_digest", metadata.content_digest, source.content_digest],
      ["retention_mode", metadata.retention_mode, source.retention_mode],
      ["replayability", metadata.replayability, source.replayability],
      ["admissibility", metadata.admissibility.state, source.admissibility],
      ["promotable", metadata.promotable, source.promotable],
    ];
    for (const [field, actual, expected] of checks) {
      if (actual !== expected) {
        issue(
          report,
          "source.manifest_mismatch",
          `${source.metadata_path}.${field}`,
          `expected ${String(expected)}; received ${String(actual)}`,
        );
      }
    }

    const family = allowedFamilies.get(metadata.source_family_id);
    if (!family) {
      issue(
        report,
        "source.family_not_admitted",
        source.metadata_path,
        `source family ${metadata.source_family_id} is outside the job envelope`,
      );
    } else {
      if (!family.acquisition_methods.includes(metadata.acquisition_method)) {
        issue(
          report,
          "source.acquisition_not_admitted",
          source.metadata_path,
          `acquisition method ${metadata.acquisition_method} is not admitted`,
        );
      }
      if (!family.retention_modes.includes(metadata.retention_mode)) {
        issue(
          report,
          "source.retention_not_admitted",
          source.metadata_path,
          `retention mode ${metadata.retention_mode} is not admitted`,
        );
      }
      if (metadata.intended_use !== family.intended_use) {
        issue(
          report,
          "source.intended_use_mismatch",
          source.metadata_path,
          "source intended use differs from the admitted family policy",
        );
      }
      if (
        metadata.rights_disposition_ref !== family.rights_disposition_ref
      ) {
        issue(
          report,
          "source.rights_mismatch",
          source.metadata_path,
          "source rights disposition differs from the admitted family policy",
        );
      }
      if (!family.reportability.includes(metadata.reportability)) {
        issue(
          report,
          "source.reportability_not_admitted",
          source.metadata_path,
          `reportability ${metadata.reportability} is outside the admitted family policy`,
        );
      }
    }
    const evidenceClass =
      metadata.source_class === "synthetic_fixture"
        ? "synthetic_fixture_observation"
        : metadata.source_class;
    if (!job.source_envelope.evidence_classes.includes(evidenceClass)) {
      issue(
        report,
        "source.evidence_class_not_admitted",
        source.metadata_path,
        `source class ${metadata.source_class} is outside the job evidence envelope`,
      );
    }
    if (!metadata.admitted || metadata.admissibility.state !== "admitted") {
      issue(
        report,
        "source.not_admitted",
        source.metadata_path,
        "retained evidence source is not explicitly admitted",
      );
    }
    const reportabilityOrder = new Map([
      ["public_safe", 0],
      ["internal", 1],
      ["non_promotable", 2],
      ["later_review_only", 3],
    ]);
    if (
      metadata.admitted &&
      (reportabilityOrder.get(metadata.reportability) ??
        Number.POSITIVE_INFINITY) >
        (reportabilityOrder.get(job.reportability) ?? -1)
    ) {
      issue(
        report,
        "reportability.source_incompatible",
        `${source.metadata_path}.reportability`,
        `source reportability ${metadata.reportability} is more restrictive than output ${job.reportability}`,
      );
    }
    if (
      metadata.context_match.matched !== true ||
      metadata.context_match.context_ref !==
        job.research_context.context_id
    ) {
      issue(
        report,
        "source.context_mismatch",
        source.metadata_path,
        "retained evidence source is not matched to the exact frozen research context",
      );
    }
    if (metadata.freshness.state !== "current") {
      issue(
        report,
        "source.not_current",
        source.metadata_path,
        "admitted evidence used by an active synthetic claim must be current",
      );
    }
    if (metadata.admissibility.state !== source.admissibility) {
      issue(
        report,
        "source.admissibility_mismatch",
        source.metadata_path,
        "source metadata and frozen manifest disagree on admissibility",
      );
    }
    if (
      job.synthetic_fixture &&
      (metadata.source_class !== "synthetic_fixture" ||
        !job.source_envelope.evidence_classes.includes(
          "synthetic_fixture_observation",
        ))
    ) {
      issue(
        report,
        "source.synthetic_class_mismatch",
        source.metadata_path,
        "synthetic fixture must use the synthetic evidence class",
      );
    }
    if (
      job.source_envelope.required_replayability === "full_replay" &&
      metadata.replayability !== "full_replay"
    ) {
      issue(
        report,
        "source.replayability_insufficient",
        source.metadata_path,
        "job requires full replayability",
      );
    }
    if (metadata.replayability === "lineage_only" && metadata.promotable) {
      issue(
        report,
        "source.lineage_only_promotable",
        source.metadata_path,
        "lineage-only evidence cannot be promotable in v0",
      );
    }

    validateSourceTimes(
      metadata,
      activation.cutoff_at,
      inputs.frozen_at,
      report,
      source.metadata_path,
    );

    if (source.content_path === null || source.content_digest === null) {
      if (source.replayability === "full_replay") {
        issue(
          report,
          "source.content_missing",
          source.metadata_path,
          "full-replay source is missing retained content",
        );
      }
    } else {
      if (!source.content_path.startsWith(expectedPrefix)) {
        issue(
          report,
          "source.path_scope",
          source.content_path,
          "source content must be stored beneath its run-scoped source directory",
        );
      }
      const digest = sha256Raw(readBytes(workspaceDir, source.content_path));
      if (digest !== source.content_digest) {
        issue(
          report,
          "digest.source_content_mismatch",
          source.content_path,
          `expected ${source.content_digest}; received ${digest}`,
        );
      }
    }
  }
  return result;
}

function validateRunLayout(
  workspaceDir: string,
  runRoot: string,
  inputs: Inputs,
  report: ValidationReport,
): void {
  const runAbsolute = resolveContained(workspaceDir, runRoot);
  const topLevel = new Map(
    readdirSync(runAbsolute, { withFileTypes: true }).map((entry) => [
      entry.name,
      entry,
    ]),
  );
  const requiredTopLevel = new Map([
    ["activation.json", "file"],
    ["attempts", "directory"],
    ["inputs.json", "file"],
    ["run-events.jsonl", "file"],
    ["sources", "directory"],
  ]);
  for (const [name, expectedType] of requiredTopLevel) {
    const entry = topLevel.get(name);
    if (
      entry === undefined ||
      entry.isSymbolicLink() ||
      (expectedType === "file" ? !entry.isFile() : !entry.isDirectory())
    ) {
      issue(
        report,
        "layout.run_entry",
        `${runRoot}/${name}`,
        `required ordinary ${expectedType} is missing or has the wrong type`,
      );
    }
  }
  for (const entry of topLevel.values()) {
    if (!requiredTopLevel.has(entry.name)) {
      issue(
        report,
        "layout.unbound_run_entry",
        `${runRoot}/${entry.name}`,
        "run contains an unbound top-level entry",
      );
    }
    if (entry.isSymbolicLink()) {
      issue(
        report,
        "layout.symlink",
        `${runRoot}/${entry.name}`,
        "symbolic links are prohibited in governed run state",
      );
    }
  }

  const sourceRoot = `${runRoot}/sources`;
  const sourceAbsolute = resolveContained(workspaceDir, sourceRoot);
  const expectedFiles = new Set<string>();
  const expectedDirectories = new Set<string>([sourceRoot]);
  for (const source of inputs.sources) {
    expectedFiles.add(source.metadata_path);
    if (source.content_path !== null) {
      expectedFiles.add(source.content_path);
    }
    for (const file of [
      source.metadata_path,
      ...(source.content_path === null ? [] : [source.content_path]),
    ]) {
      const parts = file.split("/");
      for (let index = 1; index < parts.length; index += 1) {
        expectedDirectories.add(parts.slice(0, index).join("/"));
      }
    }
  }
  walk(sourceAbsolute, (entry, absolutePath) => {
    const relativePath = relative(resolve(workspaceDir), absolutePath).split("\\").join("/");
    if (entry.isSymbolicLink()) {
      issue(
        report,
        "layout.symlink",
        relativePath,
        "symbolic links are prohibited in governed source state",
      );
      return;
    }
    if (entry.isDirectory()) {
      if (!expectedDirectories.has(relativePath)) {
        issue(
          report,
          "layout.unbound_source_directory",
          relativePath,
          "source directory is not declared by the frozen input manifest",
        );
      }
    } else if (!entry.isFile() || !expectedFiles.has(relativePath)) {
      issue(
        report,
        "layout.unbound_source_file",
        relativePath,
        "source file is not declared and digest-bound by the frozen input manifest",
      );
    }
  });
  for (const expected of expectedFiles) {
    if (!exists(workspaceDir, expected)) {
      issue(
        report,
        "layout.source_file_missing",
        expected,
        "declared source file is missing",
      );
    }
  }

  const attemptsRoot = `${runRoot}/attempts`;
  const attemptsAbsolute = resolveContained(workspaceDir, attemptsRoot);
  const allowedAttemptFiles = new Set([
    "ledger.jsonl",
    "packet.json",
    "packet.md",
    "review.json",
    "seal.json",
    "submission.json",
  ]);
  for (const entry of readdirSync(attemptsAbsolute, { withFileTypes: true })) {
    if (
      entry.isSymbolicLink() ||
      !entry.isDirectory() ||
      !isSafeId(entry.name)
    ) {
      issue(
        report,
        "layout.attempt_entry",
        `${attemptsRoot}/${entry.name}`,
        "attempts directory may contain only ordinary safe-ID directories",
      );
      continue;
    }
    const siblingRoot = `${attemptsRoot}/${entry.name}`;
    const siblingAbsolute = resolveContained(workspaceDir, siblingRoot);
    for (const child of readdirSync(siblingAbsolute, { withFileTypes: true })) {
      const childPath = `${siblingRoot}/${child.name}`;
      if (
        child.isSymbolicLink() ||
        !child.isFile() ||
        !allowedAttemptFiles.has(child.name)
      ) {
        issue(
          report,
          "layout.unbound_attempt_entry",
          childPath,
          "every attempt directory may contain only ordinary canonical contract files",
        );
        continue;
      }
      let text: string;
      try {
        text = readUtf8(workspaceDir, childPath);
      } catch (error) {
        issue(
          report,
          "privacy.unscannable_attempt",
          childPath,
          error instanceof Error ? error.message : String(error),
        );
        continue;
      }
      for (const finding of scanRawTextPrivacy(text, childPath)) {
        issue(
          report,
          "privacy.raw_attempt_marker",
          finding.path,
          finding.reason,
        );
      }
      try {
        const structured =
          child.name === "ledger.jsonl"
            ? parseLedgerJsonl(text)
            : child.name.endsWith(".json")
              ? readNormalizedJson(workspaceDir, childPath)
              : null;
        if (structured !== null) {
          for (const finding of scanStructuralPrivacy(structured)) {
            issue(
              report,
              "privacy.sibling_structural_violation",
              `${childPath}:${finding.path}`,
              finding.reason,
            );
          }
        }
      } catch (error) {
        issue(
          report,
          "layout.sibling_attempt_unreadable",
          childPath,
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  }
}

function validateSourceTimes(
  source: SourceMetadata,
  cutoff: string,
  frozenAt: string,
  report: ValidationReport,
  path: string,
): void {
  if (source.temporal.cutoff_at !== cutoff) {
    issue(
      report,
      "temporal.cutoff_mismatch",
      `${path}.temporal.cutoff_at`,
      "source cutoff does not match the activated run cutoff",
    );
  }
  for (const field of [
    "event_time",
    "effective_at",
    "published_at",
  ]) {
    const value = source.temporal[field];
    if (value !== null && value !== undefined && isAfter(value, cutoff)) {
      issue(
        report,
        "temporal.evidence_post_cutoff",
        `${path}.temporal.${field}`,
        `${field} occurs after the activated cutoff`,
      );
    }
  }
  const availableAt = source.temporal.source_available_at;
  if (
    availableAt !== null &&
    availableAt !== undefined &&
    isAfter(availableAt, cutoff)
  ) {
    issue(
      report,
      "temporal.source_unavailable_at_cutoff",
      `${path}.temporal.source_available_at`,
      "the exact retained source revision was not available by the activated cutoff",
    );
  }
  for (const field of [
    "retrieved_at",
    "first_observed_at",
    "admissible_at",
  ]) {
    const value = source.temporal[field];
    if (
      value !== null &&
      value !== undefined &&
      isAfter(value, frozenAt)
    ) {
      issue(
        report,
        "temporal.custody_after_freeze",
        `${path}.temporal.${field}`,
        `${field} cannot postdate the frozen input manifest`,
      );
    }
  }
  for (const requiredField of [
    "source_available_at",
    "retrieved_at",
    "first_observed_at",
    "admissible_at",
  ]) {
    if (source.temporal[requiredField] === null) {
      issue(
        report,
        "temporal.required_missing",
        `${path}.temporal.${requiredField}`,
        "admitted retained sources require this distinct provenance timestamp",
      );
    }
  }
  const available = source.temporal.source_available_at ?? null;
  const retrieved = source.temporal.retrieved_at ?? null;
  const firstObserved = source.temporal.first_observed_at ?? null;
  const admissible = source.temporal.admissible_at ?? null;
  const chronology: Array<[string, string | null, string, string | null]> = [
    ["source_available_at", available, "retrieved_at", retrieved],
    ["source_available_at", available, "first_observed_at", firstObserved],
    ["retrieved_at", retrieved, "admissible_at", admissible],
    ["first_observed_at", firstObserved, "admissible_at", admissible],
  ];
  for (const [earlierName, earlier, laterName, later] of chronology) {
    if (
      earlier !== null &&
      later !== null &&
      isAfter(earlier, later)
    ) {
      issue(
        report,
        "temporal.order",
        `${path}.temporal`,
        `${earlierName} occurs after ${laterName}`,
      );
    }
  }
}

function validateMarketSnapshots(
  inputs: Inputs,
  activation: Activation,
  sources: Map<string, SourceMetadata>,
  report: ValidationReport,
): void {
  const ids = new Set<string>();
  for (const snapshot of inputs.market_snapshots) {
    if (ids.has(snapshot.market_snapshot_id)) {
      issue(
        report,
        "market.duplicate_snapshot",
        "inputs.market_snapshots",
        `duplicate market snapshot ${snapshot.market_snapshot_id}`,
      );
    }
    ids.add(snapshot.market_snapshot_id);
    if (
      snapshot.context_ref !== inputs.research_context.context_id
    ) {
      issue(
        report,
        "market.context_mismatch",
        `inputs.market_snapshots.${snapshot.market_snapshot_id}.context_ref`,
        "market snapshot does not bind the frozen research context",
      );
    }
    if (snapshot.source_object_refs.length === 0) {
      issue(
        report,
        "market.sources_missing",
        `inputs.market_snapshots.${snapshot.market_snapshot_id}`,
        "market snapshot must bind at least one admitted source object",
      );
    }
    for (const sourceRef of snapshot.source_object_refs) {
      const source = sources.get(sourceRef);
      if (
        source === undefined ||
        !source.admitted ||
        source.admissibility.state !== "admitted" ||
        source.freshness.state !== "current" ||
        source.context_match.matched !== true
      ) {
        issue(
          report,
          "market.source_invalid",
          `inputs.market_snapshots.${snapshot.market_snapshot_id}`,
          `market source ${sourceRef} is missing, stale, inadmissible, or context-mismatched`,
        );
      }
    }
    for (const [field, value] of [
      ["observed_at", snapshot.observed_at],
      ["window_start", snapshot.window_start],
      ["window_end", snapshot.window_end],
    ] as const) {
      if (isAfter(value, activation.cutoff_at)) {
        issue(
          report,
          "market.post_cutoff",
          `inputs.market_snapshots.${snapshot.market_snapshot_id}.${field}`,
          `${field} occurs after the activated cutoff`,
        );
      }
      if (isAfter(value, inputs.frozen_at)) {
        issue(
          report,
          "market.after_input_freeze",
          `inputs.market_snapshots.${snapshot.market_snapshot_id}.${field}`,
          `${field} cannot postdate the frozen input manifest`,
        );
      }
    }
    if (isAfter(snapshot.window_start, snapshot.window_end)) {
      issue(
        report,
        "market.window_invalid",
        `inputs.market_snapshots.${snapshot.market_snapshot_id}`,
        "market window_start occurs after window_end",
      );
    }
    if (isAfter(snapshot.window_end, snapshot.observed_at)) {
      issue(
        report,
        "market.observation_precedes_window",
        `inputs.market_snapshots.${snapshot.market_snapshot_id}`,
        "market observed_at cannot predate the end of its retained observation window",
      );
    }
    if (snapshot.freshness !== "current") {
      issue(
        report,
        "market.stale",
        `inputs.market_snapshots.${snapshot.market_snapshot_id}`,
        "market snapshot is not current for the activated cutoff",
      );
    }
  }
}

function scanCoreContractPrivacy(
  workspaceDir: string,
  paths: readonly string[],
  report: ValidationReport,
): void {
  for (const path of new Set(paths)) {
    let text: string;
    try {
      text = readUtf8(workspaceDir, path);
    } catch (error) {
      issue(
        report,
        "privacy.unscannable_core",
        path,
        error instanceof Error ? error.message : String(error),
      );
      continue;
    }
    for (const finding of scanRawTextPrivacy(text, path)) {
      issue(
        report,
        "privacy.raw_core_marker",
        finding.path,
        finding.reason,
      );
    }
  }
}

function scanSourceContentPrivacy(
  workspaceDir: string,
  inputs: Inputs,
  report: ValidationReport,
): void {
  for (const source of inputs.sources) {
    if (source.content_path === null) {
      continue;
    }
    let text: string;
    try {
      text = readUtf8(workspaceDir, source.content_path);
    } catch (error) {
      issue(
        report,
        "privacy.unscannable_source",
        source.content_path,
        `public Stage 0 retained content must be strict UTF-8: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      continue;
    }
    for (const finding of scanRawTextPrivacy(text, source.content_path)) {
      issue(
        report,
        "privacy.raw_source_marker",
        finding.path,
        finding.reason,
      );
    }
  }
}

function validateRunEvents(
  workspaceDir: string,
  path: string,
  runId: string,
  activation: Activation,
  attemptId: string,
  report: ValidationReport,
): RunEventRecord[] {
  const events = parseLedgerJsonl(
    readBytes(workspaceDir, path),
  ) as unknown as RunEventRecord[];
  let previous: string | null = null;
  let previousRecordedAt: string | null = null;
  const ids = new Set<string>();
  const attempts = new Map<
    string,
    {
      phase:
        | "interrupted"
        | "linked"
        | "reviewed"
        | "run_closed"
        | "started"
        | "submitted";
      terminalCause: string | null;
    }
  >();
  let activeAttempt: string | null = null;
  let expectedSuccessor: string | null = null;
  let runClosed = false;

  for (const [index, event] of events.entries()) {
    const eventPath = `${path}:${index + 1}`;
    schema(report, eventPath, SCHEMA.runEvent, event);
    if (event.run_id !== runId) {
      issue(
        report,
        "run_event.run_mismatch",
        eventPath,
        "run event changes run_id",
      );
    }
    if (event.synthetic_fixture !== activation.synthetic_fixture) {
      issue(
        report,
        "run_event.synthetic_mismatch",
        eventPath,
        "run event changes the activation synthetic-fixture classification",
      );
    }
    if (event.sequence !== index + 1) {
      issue(
        report,
        "run_event.sequence",
        eventPath,
        `expected sequence ${index + 1}`,
      );
    }
    if (ids.has(event.event_id)) {
      issue(
        report,
        "run_event.duplicate_id",
        eventPath,
        `duplicate event_id ${event.event_id}`,
      );
    }
    ids.add(event.event_id);
    if (event.previous_event_hash !== previous) {
      issue(
        report,
        "run_event.previous_hash",
        eventPath,
        "previous_event_hash does not match the prior event",
      );
    }
    if (
      previousRecordedAt !== null &&
      isAfter(previousRecordedAt, event.recorded_at)
    ) {
      issue(
        report,
        "run_event.time_regression",
        eventPath,
        "run-event recorded_at values must be nondecreasing",
      );
    }
    const calculated = calculateLedgerEventHash(event);
    if (event.event_hash !== calculated) {
      issue(
        report,
        "run_event.event_hash",
        eventPath,
        `expected ${calculated}; received ${event.event_hash}`,
      );
    }
    if (event.event_type === "activation") {
      if (
        index !== 0 ||
        event.attempt_id !== null ||
        event.payload.activation_ref !== `runs/${runId}/activation.json` ||
        event.payload.artifact_digest !==
          sha256CanonicalJson(activation) ||
        event.payload.decision_ref !==
          activation.ops_decision_ref.decision_ref ||
        event.recorded_at !== activation.activated_at
      ) {
        issue(
          report,
          "run_event.activation_payload",
          eventPath,
          "activation event does not bind the exact activation and authority decision",
        );
      }
    } else {
      if (runClosed) {
        lifecycleOrderIssue(
          eventPath,
          "no run event may follow run_closed",
        );
      }
      const eventAttempt = event.attempt_id;
      if (eventAttempt === null) {
        lifecycleOrderIssue(
          eventPath,
          `${event.event_type} must name an attempt`,
        );
      } else {
        const state = attempts.get(eventAttempt);
        switch (event.event_type) {
          case "attempt_started": {
            if (
              event.payload.attempt_ref !== eventAttempt ||
              state !== undefined ||
              activeAttempt !== null ||
              (expectedSuccessor !== null &&
                expectedSuccessor !== eventAttempt) ||
              (expectedSuccessor === null && attempts.size > 0)
            ) {
              lifecycleOrderIssue(
                eventPath,
                "attempt_started must open the first attempt or the exact linked successor while no other attempt is active",
              );
            } else {
              attempts.set(eventAttempt, {
                phase: "started",
                terminalCause: null,
              });
              activeAttempt = eventAttempt;
              expectedSuccessor = null;
            }
            break;
          }
          case "attempt_submitted": {
            if (
              event.payload.attempt_ref !== eventAttempt ||
              activeAttempt !== eventAttempt ||
              state === undefined ||
              !["started", "interrupted"].includes(state.phase)
            ) {
              lifecycleOrderIssue(
                eventPath,
                "attempt_submitted must follow the same active attempt's start or terminal interruption",
              );
            } else {
              state.phase = "submitted";
            }
            break;
          }
          case "review_returned": {
            if (
              event.payload.attempt_ref !== eventAttempt ||
              activeAttempt !== eventAttempt ||
              state?.phase !== "submitted"
            ) {
              lifecycleOrderIssue(
                eventPath,
                "review_returned must follow submission of the same active attempt",
              );
            } else {
              state.phase = "reviewed";
            }
            break;
          }
          case "cancellation":
          case "budget_exhausted":
          case "protocol_violation": {
            const expectedTerminal =
              event.event_type === "cancellation"
                ? "cancelled"
                : event.event_type;
            if (
              event.payload.attempt_ref !== eventAttempt ||
              event.payload.terminal_state !== expectedTerminal ||
              activeAttempt !== eventAttempt ||
              state?.phase !== "started"
            ) {
              lifecycleOrderIssue(
                eventPath,
                `${event.event_type} must terminate the same active, unsubmitted attempt`,
              );
            } else {
              state.phase = "interrupted";
              state.terminalCause = expectedTerminal;
            }
            break;
          }
          case "successor_link": {
            const successor = event.payload.successor_attempt_ref;
            const decisionRef = event.payload.decision_ref;
            if (
              event.payload.predecessor_attempt_ref !== eventAttempt ||
              typeof successor !== "string" ||
              typeof decisionRef !== "string" ||
              decisionRef.trim().length === 0 ||
              successor === eventAttempt ||
              attempts.has(String(successor)) ||
              expectedSuccessor !== null ||
              activeAttempt !== eventAttempt ||
              state?.phase !== "reviewed"
            ) {
              lifecycleOrderIssue(
                eventPath,
                "successor_link must follow review of the active predecessor and name one unused successor plus explicit Ops authority",
              );
            } else {
              state.phase = "linked";
              activeAttempt = null;
              expectedSuccessor = successor;
            }
            break;
          }
          case "run_closed": {
            if (
              event.payload.attempt_ref !== eventAttempt ||
              activeAttempt !== eventAttempt ||
              state === undefined ||
              !["submitted", "reviewed"].includes(state.phase) ||
              (state.terminalCause !== null &&
                event.payload.terminal_state !== state.terminalCause)
            ) {
              lifecycleOrderIssue(
                eventPath,
                "run_closed must follow the frozen submission or review of the same final attempt",
              );
            } else {
              state.phase = "run_closed";
              activeAttempt = null;
              runClosed = true;
            }
            break;
          }
          default:
            lifecycleOrderIssue(
              eventPath,
              `unsupported run event type: ${event.event_type}`,
            );
        }
      }
    }
    previous = event.event_hash;
    previousRecordedAt = event.recorded_at;
  }
  if (events.filter((event) => event.event_type === "activation").length !== 1) {
    issue(
      report,
      "run_event.activation_count",
      path,
      "run event log must begin with exactly one activation event",
    );
  }
  const attemptStarts = events.filter(
    (event) =>
      event.event_type === "attempt_started" && event.attempt_id === attemptId,
  );
  if (attemptStarts.length !== 1) {
    issue(
      report,
      "run_event.attempt_start_count",
      path,
      "active attempt must have exactly one attempt_started event",
    );
  }
  return events;

  function lifecycleOrderIssue(eventPath: string, message: string): void {
    issue(
      report,
      "run_event.lifecycle_order",
      eventPath,
      message,
    );
  }
}

function validateLedgerSemantics(
  ledger: LedgerEventRecord[],
  job: Job,
  activation: Activation,
  sources: Map<string, SourceMetadata>,
  report: ValidationReport,
  path: string,
): void {
  const priorEvents = new Set<string>();
  const priorEventMap = new Map<string, LedgerEventRecord>();
  const questionIds = new Set(job.questions.map((question) => question.question_id));
  const subjectIds = new Set(job.subjects.map((subject) => subject.subject_id));
  const comparisonIds = new Set(
    job.comparison_population.members.map((subject) => subject.subject_id),
  );
  let previousRecordedAt: string | null = null;
  let toolUseCount = 0;
  let previousRemaining = { ...activation.budget };
  for (const [index, event] of ledger.entries()) {
    if (
      previousRecordedAt !== null &&
      isAfter(previousRecordedAt, event.recorded_at)
    ) {
      issue(
        report,
        "ledger.time_regression",
        `${path}:${index + 1}`,
        "ledger recorded_at values must be nondecreasing",
      );
    }
    validateScopeReferences(
      stringArray(event.applicable_scope?.question_refs),
      questionIds,
      report,
      "ledger.scope_question",
      `${path}:${index + 1}.applicable_scope.question_refs`,
    );
    validateScopeReferences(
      stringArray(event.applicable_scope?.subject_refs),
      subjectIds,
      report,
      "ledger.scope_subject",
      `${path}:${index + 1}.applicable_scope.subject_refs`,
    );
    validateScopeReferences(
      stringArray(event.applicable_scope?.comparison_refs),
      comparisonIds,
      report,
      "ledger.scope_comparison",
      `${path}:${index + 1}.applicable_scope.comparison_refs`,
    );
    const allowedEpistemic = new Map<string, ReadonlySet<string>>([
      ["hypothesis", new Set(["hypothesis"])],
      ["source_observation", new Set(["observed", "contradicted"])],
      ["calculation", new Set(["calculated"])],
      ["challenge", new Set(["inferred"])],
      ["checkpoint", new Set(["unknown"])],
      ["intervention", new Set(["unknown"])],
      ["tool_use", new Set(["unknown"])],
      ["status_transition", new Set(["unknown"])],
      ["amendment_proposal", new Set(["unknown"])],
      ["out_of_scope_discovery", new Set(["unknown"])],
    ]).get(event.event_type);
    if (
      allowedEpistemic === undefined ||
      !allowedEpistemic.has(event.epistemic_class)
    ) {
      issue(
        report,
        "ledger.epistemic_class",
        `${path}:${index + 1}`,
        `epistemic class ${event.epistemic_class} is invalid for ${event.event_type}`,
      );
    }
    const evidenceEvent = [
      "source_observation",
      "calculation",
      "challenge",
    ].includes(event.event_type);
    const expectedFreshness = evidenceEvent ? "current" : "not_applicable";
    if (event.freshness_state !== expectedFreshness) {
      issue(
        report,
        "ledger.freshness_class",
        `${path}:${index + 1}`,
        `${event.event_type} must use freshness ${expectedFreshness}`,
      );
    }
    for (const parent of event.parent_event_refs) {
      if (typeof parent !== "string" || !priorEvents.has(parent)) {
        issue(
          report,
          "ledger.parent_not_prior",
          `${path}:${index + 1}`,
          `parent event must resolve to an earlier event: ${String(parent)}`,
        );
      }
    }
    for (const sourceRef of event.source_refs) {
      if (typeof sourceRef !== "string" || !sources.has(sourceRef)) {
        issue(
          report,
          "ledger.source_not_admitted",
          `${path}:${index + 1}`,
          `source reference is not admitted: ${String(sourceRef)}`,
        );
      }
    }
    if (event.event_type === "source_observation") {
      const payloadRef = event.payload.source_object_ref;
      if (typeof payloadRef !== "string" || !sources.has(payloadRef)) {
        issue(
          report,
          "ledger.observation_source_not_admitted",
          `${path}:${index + 1}`,
          "source observation does not resolve to an admitted source object",
        );
      } else if (
        event.source_refs.length !== 1 ||
        event.source_refs[0] !== payloadRef
      ) {
        issue(
          report,
          "ledger.observation_source_mismatch",
          `${path}:${index + 1}`,
          "source observation payload and top-level source_refs must bind the same single source",
        );
      }
      const window =
        event.payload.observation_window !== null &&
        typeof event.payload.observation_window === "object" &&
        !Array.isArray(event.payload.observation_window)
          ? (event.payload.observation_window as Record<string, unknown>)
          : null;
      const start = window?.start;
      const end = window?.end;
      if (
        typeof start !== "string" ||
        typeof end !== "string" ||
        isAfter(start, end)
      ) {
        issue(
          report,
          "ledger.observation_window_invalid",
          `${path}:${index + 1}`,
          "observation window must have ordered start and end timestamps",
        );
      } else if (isAfter(end, activation.cutoff_at)) {
        issue(
          report,
          "ledger.observation_post_cutoff",
          `${path}:${index + 1}`,
          "observation window extends beyond the activated evidence cutoff",
        );
      }
    }
    if (event.event_type === "tool_use") {
      toolUseCount += 1;
      const tool = event.payload.tool;
      if (
        typeof tool !== "string" ||
        !activation.effective_capabilities.tools.includes(tool) ||
        event.payload.within_allowlist !== true
      ) {
        issue(
          report,
          "authority.tool_use",
          `${path}:${index + 1}`,
          "tool_use event is outside the activated allowlist",
        );
      }
    }
    if (event.event_type === "calculation") {
      if (
        !job.source_envelope.evidence_classes.includes(
          "deterministic_calculation",
        )
      ) {
        issue(
          report,
          "calculation.evidence_class_not_admitted",
          `${path}:${index + 1}`,
          "calculation records require deterministic_calculation in the activated evidence envelope",
        );
      }
      const declaredOutputDigest = event.payload.output_digest;
      const expectedOutputDigest = sha256CanonicalJson(event.payload.output);
      if (declaredOutputDigest !== expectedOutputDigest) {
        issue(
          report,
          "calculation.output_digest",
          `${path}:${index + 1}`,
          `expected ${expectedOutputDigest}; received ${String(declaredOutputDigest)}`,
        );
      }
      const inputRefs = stringArray(event.payload.input_refs);
      const inputHashes = new Set(stringArray(event.payload.input_hashes));
      const expectedSourceRefs = new Set<string>();
      for (const ref of inputRefs) {
        const source = sources.get(ref);
        const priorEvent = priorEventMap.get(ref);
        if (source === undefined && priorEvent === undefined) {
          issue(
            report,
            "calculation.input_unresolved",
            `${path}:${index + 1}`,
            `calculation input does not resolve to a prior event or admitted source: ${ref}`,
          );
          continue;
        }
        if (source !== undefined) {
          expectedSourceRefs.add(ref);
        }
        if (priorEvent !== undefined) {
          for (const priorSource of stringArray(priorEvent.source_refs)) {
            expectedSourceRefs.add(priorSource);
          }
        }
        const requiredDigest =
          source?.content_digest ?? priorEvent?.event_hash ?? null;
        if (requiredDigest !== null && !inputHashes.has(requiredDigest)) {
          issue(
            report,
            "calculation.input_hash_missing",
            `${path}:${index + 1}`,
            `calculation does not hash-bind input ${ref}`,
          );
        }
      }
      if (
        sha256CanonicalJson([...expectedSourceRefs].sort()) !==
        sha256CanonicalJson(stringArray(event.source_refs).sort())
      ) {
        issue(
          report,
          "calculation.source_lineage",
          `${path}:${index + 1}`,
          "calculation source_refs must equal the admitted sources reachable from input_refs",
        );
      }
    }
    if (event.event_type === "challenge") {
      const rivals = stringArray(event.payload.rival_explanations);
      const coverage = stringArray(event.payload.coverage_checks);
      const counterRefs = stringArray(
        event.payload.counterevidence_event_refs,
      );
      const challengeTargets = [
        ...stringArray(event.payload.claim_refs),
        ...stringArray(event.payload.negative_finding_refs),
      ];
      if (
        rivals.length === 0 ||
        coverage.length === 0 ||
        counterRefs.length === 0 ||
        challengeTargets.length === 0
      ) {
        issue(
          report,
          "challenge.empty",
          `${path}:${index + 1}`,
          "challenge requires a target, rival explanation, coverage check, and bounded counterevidence observation",
        );
      }
      for (const ref of counterRefs) {
        const counter = priorEventMap.get(ref);
        if (
          counter === undefined ||
          counter.event_type !== "source_observation" ||
          counter.admissibility_state !== "admitted" ||
          counter.freshness_state !== "current" ||
          !["not_found", "observed"].includes(String(counter.payload.result))
        ) {
          issue(
            report,
            "challenge.counterevidence_invalid",
            `${path}:${index + 1}`,
            `challenge counterevidence must resolve to a prior admitted, current observation: ${ref}`,
          );
        }
      }
      const expectedChallengeSources = new Set(
        stringArray(event.parent_event_refs).flatMap((ref) =>
          stringArray(priorEventMap.get(ref)?.source_refs),
        ),
      );
      if (
        sha256CanonicalJson([...expectedChallengeSources].sort()) !==
        sha256CanonicalJson(stringArray(event.source_refs).sort())
      ) {
        issue(
          report,
          "challenge.source_lineage",
          `${path}:${index + 1}`,
          "challenge source_refs must equal the sources bound by its parent evidence records",
        );
      }
    }
    if (event.event_type === "checkpoint") {
      for (const action of stringArray(event.payload.next_permitted_actions)) {
        if (
          /\b(?:publish(?:ed|ing)?|publication|promot(?:e|ion)|modify\s+(?:the\s+)?strategy|strategy\s+modification|live\s+(?:source|research)|source\s+acquisition|acquir(?:e|ing)\s+(?:an?\s+)?source)\b/iu.test(
            action,
          )
        ) {
          issue(
            report,
            "resume.action_not_permitted",
            `${path}:${index + 1}`,
            "checkpoint prose names an action outside the research authority ceiling",
          );
        }
      }
      if (
        event.payload.ledger_head_before_checkpoint !==
        event.previous_event_hash
      ) {
        issue(
          report,
          "checkpoint.stale_ledger_head",
          `${path}:${index + 1}`,
          "checkpoint must bind the immediately preceding ledger head",
        );
      }
      const remaining = event.payload.budgets_remaining;
      if (
        remaining === null ||
        typeof remaining !== "object" ||
        Array.isArray(remaining)
      ) {
        issue(
          report,
          "checkpoint.budget_invalid",
          `${path}:${index + 1}`,
          "checkpoint must preserve the remaining budget",
        );
      } else {
        for (const key of [
          "wall_clock_minutes",
          "tool_calls",
          "evidence_objects",
        ] as const) {
          const value = (remaining as Record<string, unknown>)[key];
          if (
            typeof value !== "number" ||
            value < 0 ||
            value > activation.budget[key] ||
            value > previousRemaining[key]
          ) {
            issue(
              report,
              "checkpoint.budget_expansion",
              `${path}:${index + 1}`,
              `remaining ${key} exceeds, replenishes, or violates the activated budget`,
            );
          } else {
            previousRemaining[key] = value;
          }
        }
        if (
          (remaining as Record<string, unknown>).tool_calls !==
          activation.budget.tool_calls - toolUseCount
        ) {
          issue(
            report,
            "checkpoint.tool_budget_mismatch",
            `${path}:${index + 1}`,
            "remaining tool-call budget does not reconcile to recorded tool_use events",
          );
        }
        if (
          (remaining as Record<string, unknown>).evidence_objects !==
          activation.budget.evidence_objects - sources.size
        ) {
          issue(
            report,
            "checkpoint.evidence_budget_mismatch",
            `${path}:${index + 1}`,
            "remaining evidence-object budget does not reconcile to admitted source objects",
          );
        }
      }
    }
    priorEvents.add(event.event_id);
    priorEventMap.set(event.event_id, event);
    previousRecordedAt = event.recorded_at;
  }
  if (toolUseCount > activation.budget.tool_calls) {
    issue(
      report,
      "budget.tool_calls_exceeded",
      path,
      "recorded tool_use events exceed the activated tool-call budget",
    );
  }
}

function validatePacketTraceability(
  job: Job,
  activation: Activation,
  inputs: Inputs,
  packet: ResearchPacket,
  ledger: LedgerEventRecord[],
  report: ValidationReport,
  path: string,
): void {
  const eventMap = new Map(ledger.map((event) => [event.event_id, event]));
  const claimMap = new Map(packet.claims.map((claim) => [claim.claim_id, claim]));
  const unresolvedMap = new Map(
    packet.unresolved.map((entry) => [entry.unresolved_id, entry]),
  );
  const blockedInputMap = new Map(
    inputs.blocked_inputs.map((entry) => [entry.input_id, entry]),
  );
  const questionIds = new Set(job.questions.map((entry) => entry.question_id));
  const subjectIds = new Set(job.subjects.map((entry) => entry.subject_id));
  const negativeByQuestion = new Map<string, number>();
  for (const finding of packet.negative_findings) {
    reportDuplicateIds(
      finding.question_refs,
      report,
      "packet.duplicate_question_reference",
      `${path}.negative_findings.${finding.finding_id}.question_refs`,
    );
    reportDuplicateIds(
      finding.subject_refs,
      report,
      "packet.duplicate_subject_reference",
      `${path}.negative_findings.${finding.finding_id}.subject_refs`,
    );
    for (const questionRef of finding.question_refs) {
      if (!questionIds.has(questionRef)) {
        issue(
          report,
          "packet.negative_question_link",
          `${path}.negative_findings.${finding.finding_id}`,
          `unknown question reference: ${questionRef}`,
        );
      }
      negativeByQuestion.set(
        questionRef,
        (negativeByQuestion.get(questionRef) ?? 0) + 1,
      );
    }
    for (const subjectRef of finding.subject_refs) {
      if (!subjectIds.has(subjectRef)) {
        issue(
          report,
          "packet.negative_subject_link",
          `${path}.negative_findings.${finding.finding_id}`,
          `unknown subject reference: ${subjectRef}`,
        );
      }
    }
    for (const evidenceRef of finding.evidence_refs) {
      const event = eventMap.get(evidenceRef);
      if (
        event === undefined ||
        event.event_type !== "source_observation" ||
        event.admissibility_state !== "admitted" ||
        event.freshness_state !== "current" ||
        !["not_found", "observed"].includes(String(event.payload.result))
      ) {
        issue(
          report,
          "packet.negative_evidence_link",
          `${path}.negative_findings.${finding.finding_id}`,
          `negative finding evidence is unresolved, stale, inadmissible, or the wrong type: ${evidenceRef}`,
        );
        continue;
      }
      const eventQuestions = stringArray(
        event.applicable_scope?.question_refs,
      );
      const eventSubjects = stringArray(event.applicable_scope?.subject_refs);
      if (
        finding.question_refs.some((ref) => !eventQuestions.includes(ref)) ||
        finding.subject_refs.some((ref) => !eventSubjects.includes(ref))
      ) {
        issue(
          report,
          "packet.negative_evidence_scope",
          `${path}.negative_findings.${finding.finding_id}`,
          `negative finding evidence is not scoped to its declared questions and subjects: ${evidenceRef}`,
        );
      }
    }
    const hypothesisIds = new Set(finding.hypothesis_refs);
    for (const hypothesisRef of finding.hypothesis_refs) {
      const hypothesis = eventMap.get(hypothesisRef);
      if (
        hypothesis === undefined ||
        hypothesis.event_type !== "hypothesis" ||
        hypothesis.admissibility_state !== "admitted" ||
        hypothesis.freshness_state !== "not_applicable" ||
        !finding.question_refs.includes(
          String(hypothesis.payload.question_ref),
        ) ||
        !finding.subject_refs.includes(String(hypothesis.payload.subject_ref))
      ) {
        issue(
          report,
          "packet.negative_hypothesis_link",
          `${path}.negative_findings.${finding.finding_id}`,
          `negative finding hypothesis is unresolved or out of scope: ${hypothesisRef}`,
        );
      }
    }
    for (const evidenceRef of finding.evidence_refs) {
      const evidence = eventMap.get(evidenceRef);
      if (
        evidence !== undefined &&
        !hasAnyAncestor(evidence, hypothesisIds, eventMap)
      ) {
        issue(
          report,
          "packet.negative_evidence_lineage",
          `${path}.negative_findings.${finding.finding_id}`,
          `negative evidence is not descended from a referenced hypothesis: ${evidenceRef}`,
        );
      }
    }
    for (const challengeRef of finding.challenge_refs) {
      const challenge = eventMap.get(challengeRef);
      if (
        challenge === undefined ||
        challenge.event_type !== "challenge" ||
        challenge.admissibility_state !== "admitted" ||
        challenge.freshness_state !== "current" ||
        !stringArray(challenge.payload.negative_finding_refs).includes(
          finding.finding_id,
        ) ||
        finding.evidence_refs.some(
          (ref) => !hasAnyAncestor(challenge, new Set([ref]), eventMap),
        )
      ) {
        issue(
          report,
          "packet.negative_challenge_link",
          `${path}.negative_findings.${finding.finding_id}`,
          `negative finding challenge is unresolved, out of scope, or lacks lineage: ${challengeRef}`,
        );
      }
    }
  }
  for (const unresolved of packet.unresolved) {
    if (
      unresolved.kind === "blocked_input" &&
      unresolved.blocked_input_refs.length === 0
    ) {
      issue(
        report,
        "packet.blocked_input_link",
        `${path}.unresolved.${unresolved.unresolved_id}`,
        "blocked_input unresolved item must bind a frozen blocked input",
      );
    }
    if (
      unresolved.kind !== "blocked_input" &&
      unresolved.blocked_input_refs.length > 0
    ) {
      issue(
        report,
        "packet.blocked_input_kind",
        `${path}.unresolved.${unresolved.unresolved_id}`,
        "only blocked_input unresolved items may carry blocked input references",
      );
    }
    for (const blockedRef of unresolved.blocked_input_refs) {
      const blocked = blockedInputMap.get(blockedRef);
      if (
        blocked === undefined ||
        unresolved.related_question_refs.some(
          (questionRef) => !blocked.question_refs.includes(questionRef),
        )
      ) {
        issue(
          report,
          "packet.blocked_input_link",
          `${path}.unresolved.${unresolved.unresolved_id}`,
          `blocked input reference is unresolved or scoped to different questions: ${blockedRef}`,
        );
      }
    }
    for (const claimRef of unresolved.related_claim_refs) {
      if (!claimMap.has(claimRef)) {
        issue(
          report,
          "packet.unresolved_claim_link",
          `${path}.unresolved.${unresolved.unresolved_id}`,
          `unknown related claim: ${claimRef}`,
        );
      }
    }
    for (const questionRef of unresolved.related_question_refs) {
      if (!questionIds.has(questionRef)) {
        issue(
          report,
          "packet.unresolved_question_link",
          `${path}.unresolved.${unresolved.unresolved_id}`,
          `unknown related question: ${questionRef}`,
        );
      }
    }
  }
  const marketSnapshots = new Map(
    inputs.market_snapshots.map((entry) => [
      entry.market_snapshot_id,
      entry,
    ]),
  );

  for (const question of packet.questions) {
    if (
      (question.completion === "blocked" &&
        (question.blocker_reason === null ||
          question.assessment !== "insufficient")) ||
      (question.completion !== "blocked" && question.blocker_reason !== null)
    ) {
      issue(
        report,
        "packet.question_state",
        `${path}.questions.${question.question_id}`,
        "question completion, assessment, and blocker reason are incoherent",
      );
    }
    if (
      question.completion === "answered" &&
      question.claim_refs.length === 0 &&
      (negativeByQuestion.get(question.question_id) ?? 0) === 0
    ) {
      issue(
        report,
        "packet.question_unanswered",
        `${path}.questions.${question.question_id}`,
        "answered question requires a linked claim or scoped negative finding",
      );
    }
    if (question.completion === "blocked" && question.claim_refs.length > 0) {
      issue(
        report,
        "packet.blocked_question_claim",
        `${path}.questions.${question.question_id}`,
        "blocked question cannot expose a candidate claim",
      );
    }
    if (
      question.completion === "blocked" &&
      !packet.unresolved.some(
        (entry) =>
          ["blocked_input", "missing_evidence"].includes(entry.kind) &&
          entry.related_question_refs.includes(question.question_id),
      )
    ) {
      issue(
        report,
        "packet.blocked_question_unresolved",
        `${path}.questions.${question.question_id}`,
        "blocked question requires a linked unresolved missing or blocked input record",
      );
    }
    for (const claimRef of question.claim_refs) {
      const claim = claimMap.get(claimRef);
      if (!claim || claim.question_ref !== question.question_id) {
        issue(
          report,
          "packet.question_claim_link",
          `${path}.questions.${question.question_id}`,
          `claim reference does not resolve back to this question: ${claimRef}`,
        );
      }
    }
    const linkedAssessments = question.claim_refs
      .map((claimRef) => claimMap.get(claimRef))
      .filter(
        (claim): claim is PacketClaim =>
          claim !== undefined &&
          claim.question_ref === question.question_id,
      )
      .map((claim) => claim.assessment);
    const assessmentSeverity = new Map([
      ["supported", 0],
      ["partly_supported", 1],
      ["weakened", 2],
      ["contradicted", 3],
      ["insufficient", 4],
    ]);
    const hasNegativeFinding =
      (negativeByQuestion.get(question.question_id) ?? 0) > 0;
    const expectedAssessment =
      hasNegativeFinding || linkedAssessments.length === 0
        ? "insufficient"
        : linkedAssessments.reduce((worst, assessment) =>
            (assessmentSeverity.get(assessment) ?? Number.POSITIVE_INFINITY) >
            (assessmentSeverity.get(worst) ?? Number.POSITIVE_INFINITY)
              ? assessment
              : worst,
          "supported");
    if (question.assessment !== expectedAssessment) {
      issue(
        report,
        "packet.question_assessment_mismatch",
        `${path}.questions.${question.question_id}.assessment`,
        `question assessment must equal the conservative aggregate of linked claims and negative findings: ${expectedAssessment}`,
      );
    }
  }
  const expectedCompletion = packet.questions.every(
    (question) => question.completion === "answered",
  )
    ? "answered"
    : packet.process_terminal === "completed"
      ? "inconclusive"
      : "blocked";
  if (packet.completion !== expectedCompletion) {
    issue(
      report,
      "packet.completion_matrix",
      `${path}.completion`,
      `expected ${expectedCompletion} from the question and process terminal states`,
    );
  }

  for (const claim of packet.claims) {
    if (
      !["calculated", "inferred"].includes(claim.epistemic_class) ||
      (claim.epistemic_class === "calculated" &&
        claim.calculation_refs.length === 0) ||
      (claim.epistemic_class === "inferred" &&
        (claim.evidence_refs.length === 0 ||
          claim.challenge_refs.length === 0))
    ) {
      issue(
        report,
        "packet.claim_epistemic_mismatch",
        `${path}.claims.${claim.claim_id}.epistemic_class`,
        "candidate claims must be inferred from challenged evidence or calculated from explicit calculation records",
      );
    }
    if (claim.scope.cutoff_at !== activation.cutoff_at) {
      issue(
        report,
        "packet.claim_cutoff",
        `${path}.claims.${claim.claim_id}.scope.cutoff_at`,
        "claim scope cutoff differs from the activated cutoff",
      );
    }
    if (claim.scope.time_horizon !== job.time_horizon) {
      issue(
        report,
        "packet.claim_horizon",
        `${path}.claims.${claim.claim_id}.scope.time_horizon`,
        "claim time horizon differs from the activated job",
      );
    }
    if (claim.scope.context_ref !== job.research_context.context_id) {
      issue(
        report,
        "packet.claim_context",
        `${path}.claims.${claim.claim_id}.scope.context_ref`,
        "claim does not bind the exact frozen research context",
      );
    }
    if (
      claim.freshness.state !== "current" ||
      claim.freshness.as_of === null ||
      isAfter(claim.freshness.as_of, activation.cutoff_at)
    ) {
      issue(
        report,
        "packet.claim_freshness",
        `${path}.claims.${claim.claim_id}.freshness`,
        "candidate claim must be current as of a timestamp no later than the activated cutoff",
      );
    }
    const dispositionValid =
      job.baseline_ref === null
        ? claim.proposed_disposition === null
        : claim.assessment === "insufficient"
          ? claim.proposed_disposition === "insufficient_evidence"
          : ["upstream", "downstream", "unchanged"].includes(
              String(claim.proposed_disposition),
            );
    if (!dispositionValid) {
      issue(
        report,
        "packet.claim_disposition",
        `${path}.claims.${claim.claim_id}.proposed_disposition`,
        "claim assessment and proposed disposition are incoherent",
      );
    }
    for (const missingRef of claim.missing_evidence_refs) {
      const unresolved = unresolvedMap.get(missingRef);
      if (
        unresolved === undefined ||
        !["missing_evidence", "blocked_input"].includes(unresolved.kind) ||
        !unresolved.related_claim_refs.includes(claim.claim_id)
      ) {
        issue(
          report,
          "packet.missing_evidence_link",
          `${path}.claims.${claim.claim_id}.missing_evidence_refs`,
          `missing-evidence reference does not resolve back to the claim: ${missingRef}`,
        );
      }
    }
    if (
      claim.assessment === "insufficient" &&
      claim.missing_evidence_refs.length === 0
    ) {
      issue(
        report,
        "packet.missing_evidence_required",
        `${path}.claims.${claim.claim_id}.missing_evidence_refs`,
        "insufficient claims must identify their unresolved evidence gap",
      );
    }
    resolveTypedEvents(
      report,
      path,
      claim,
      "hypothesis",
      claim.hypothesis_refs,
      eventMap,
      new Set(["hypothesis"]),
      new Set(["not_applicable", "current"]),
      null,
    );
    if (claim.freshness.as_of !== null) {
      for (const evidenceRef of [
        ...claim.evidence_refs,
        ...claim.counterevidence_refs,
      ]) {
        const event = eventMap.get(evidenceRef);
        const window =
          event?.payload.observation_window !== null &&
          typeof event?.payload.observation_window === "object" &&
          !Array.isArray(event.payload.observation_window)
            ? (event.payload.observation_window as Record<string, unknown>)
            : null;
        const end = window?.end;
        if (
          typeof end === "string" &&
          isAfter(end, claim.freshness.as_of)
        ) {
          issue(
            report,
            "packet.claim_freshness_lineage",
            `${path}.claims.${claim.claim_id}.freshness`,
            `claim freshness predates cited evidence ${evidenceRef}`,
          );
        }
      }
    }
    resolveTypedEvents(
      report,
      path,
      claim,
      "evidence",
      claim.evidence_refs,
      eventMap,
      new Set(["source_observation"]),
      new Set(["current"]),
      new Set(["observed"]),
    );
    resolveTypedEvents(
      report,
      path,
      claim,
      "calculation",
      claim.calculation_refs,
      eventMap,
      new Set(["calculation"]),
      new Set(["current"]),
      null,
    );
    resolveTypedEvents(
      report,
      path,
      claim,
      "counterevidence",
      claim.counterevidence_refs,
      eventMap,
      new Set(["source_observation"]),
      new Set(["current"]),
      new Set(["observed"]),
    );
    resolveTypedEvents(
      report,
      path,
      claim,
      "challenge",
      claim.challenge_refs,
      eventMap,
      new Set(["challenge"]),
      new Set(["current"]),
      null,
    );
    const hypothesisEvents = claim.hypothesis_refs
      .map((ref) => eventMap.get(ref))
      .filter((event): event is LedgerEventRecord => event !== undefined);
    const hypothesisIds = new Set(claim.hypothesis_refs);
    const derivedEvents = [
      ...claim.evidence_refs,
      ...claim.calculation_refs,
      ...claim.counterevidence_refs,
      ...claim.challenge_refs,
    ]
      .map((ref) => eventMap.get(ref))
      .filter((event): event is LedgerEventRecord => event !== undefined);
    for (const hypothesis of hypothesisEvents) {
      if (
        hypothesis.payload.question_ref !== claim.question_ref ||
        hypothesis.payload.subject_ref !== claim.subject_ref
      ) {
        issue(
          report,
          "packet.hypothesis_backlink",
          `${path}.claims.${claim.claim_id}.hypothesis_refs`,
          `hypothesis ${hypothesis.event_id} does not match the claim question and subject`,
        );
      }
      if (derivedEvents.some((event) => event.sequence <= hypothesis.sequence)) {
        issue(
          report,
          "packet.hypothesis_order",
          `${path}.claims.${claim.claim_id}.hypothesis_refs`,
          "support, calculation, counterevidence, and challenge records must follow the referenced hypothesis",
        );
      }
    }
    for (const evidenceRef of [
      ...claim.evidence_refs,
      ...claim.counterevidence_refs,
    ]) {
      const evidence = eventMap.get(evidenceRef);
      if (
        evidence !== undefined &&
        !hasAnyAncestor(evidence, hypothesisIds, eventMap)
      ) {
        issue(
          report,
          "packet.evidence_lineage",
          `${path}.claims.${claim.claim_id}`,
          `evidence ${evidenceRef} is not descended from a referenced hypothesis`,
        );
      }
    }
    for (const calculationRef of claim.calculation_refs) {
      const calculation = eventMap.get(calculationRef);
      if (
        calculation !== undefined &&
        (!hasAnyAncestor(
          calculation,
          new Set(claim.evidence_refs),
          eventMap,
        ) ||
          !hasAnyAncestor(calculation, hypothesisIds, eventMap))
      ) {
        issue(
          report,
          "packet.calculation_lineage",
          `${path}.claims.${claim.claim_id}`,
          `calculation ${calculationRef} is not descended from the claim hypothesis and supporting evidence`,
        );
      }
    }
    const challengedLineage = new Set([
      ...claim.evidence_refs,
      ...claim.calculation_refs,
      ...claim.counterevidence_refs,
    ]);
    for (const challengeRef of claim.challenge_refs) {
      const challenge = eventMap.get(challengeRef);
      const claimRefs = challenge?.payload.claim_refs;
      if (
        challenge !== undefined &&
        (!Array.isArray(claimRefs) || !claimRefs.includes(claim.claim_id))
      ) {
        issue(
          report,
          "packet.challenge_backlink",
          `${path}.claims.${claim.claim_id}.challenge_refs`,
          `challenge ${challengeRef} does not name claim ${claim.claim_id}`,
        );
      }
      if (
        challenge !== undefined &&
        [...challengedLineage].some(
          (ref) => !hasAnyAncestor(challenge, new Set([ref]), eventMap),
        )
      ) {
        issue(
          report,
          "packet.challenge_lineage",
          `${path}.claims.${claim.claim_id}.challenge_refs`,
          `challenge ${challengeRef} is not descended from every cited evidence and calculation record`,
        );
      }
      const challengedCounterevidence = new Set(
        stringArray(challenge?.payload.counterevidence_event_refs),
      );
      for (const counterRef of claim.counterevidence_refs) {
        if (!challengedCounterevidence.has(counterRef)) {
          issue(
            report,
            "packet.challenge_counterevidence_backlink",
            `${path}.claims.${claim.claim_id}.counterevidence_refs`,
            `counterevidence ${counterRef} is absent from challenge ${challengeRef}`,
          );
        }
      }
    }

    const hasMarketClaim =
      claim.market_inefficiency_claim !== null ||
      claim.claim_type === "market_inefficiency";
    if (hasMarketClaim) {
      if (
        claim.market_snapshot_ref === null ||
        !marketSnapshots.has(claim.market_snapshot_ref)
      ) {
        issue(
          report,
          "packet.market_snapshot_missing",
          `${path}.claims.${claim.claim_id}`,
          "market claim requires an admitted context-matched market snapshot",
        );
      } else {
        const snapshot = marketSnapshots.get(claim.market_snapshot_ref);
        if (
          snapshot?.context !== claim.scope.context ||
          snapshot?.context_ref !== claim.scope.context_ref
        ) {
          issue(
            report,
            "packet.market_context_mismatch",
            `${path}.claims.${claim.claim_id}.scope.context`,
            "market claim context differs from its frozen market snapshot",
          );
        }
        if (
          snapshot !== undefined &&
          claim.freshness.as_of !== null &&
          isAfter(snapshot.observed_at, claim.freshness.as_of)
        ) {
          issue(
            report,
            "packet.market_freshness_mismatch",
            `${path}.claims.${claim.claim_id}.freshness`,
            "market claim freshness predates its market snapshot",
          );
        }
      }
    } else if (claim.market_snapshot_ref !== null) {
      issue(
        report,
        "packet.market_snapshot_without_claim",
        `${path}.claims.${claim.claim_id}`,
        "non-market claim must not retain a market snapshot reference",
      );
    }
  }
}

function hasAnyAncestor(
  event: LedgerEventRecord,
  targetIds: ReadonlySet<string>,
  events: ReadonlyMap<string, LedgerEventRecord>,
  visited = new Set<string>(),
): boolean {
  for (const parentRef of stringArray(event.parent_event_refs)) {
    if (targetIds.has(parentRef)) {
      return true;
    }
    if (visited.has(parentRef)) {
      continue;
    }
    visited.add(parentRef);
    const parent = events.get(parentRef);
    if (
      parent !== undefined &&
      hasAnyAncestor(parent, targetIds, events, visited)
    ) {
      return true;
    }
  }
  return false;
}

function resolveTypedEvents(
  report: ValidationReport,
  packetPath: string,
  claim: PacketClaim,
  relation: string,
  refs: string[],
  events: Map<string, LedgerEventRecord>,
  allowedTypes: Set<string>,
  allowedFreshness: Set<string>,
  allowedObservationResults: Set<string> | null,
): void {
  for (const ref of refs) {
    const event = events.get(ref);
    if (!event || !allowedTypes.has(event.event_type)) {
      issue(
        report,
        `packet.${relation}_link`,
        `${packetPath}.claims.${claim.claim_id}`,
        `${relation} reference ${ref} does not resolve to ${[
          ...allowedTypes,
        ].join(" or ")}`,
      );
      continue;
    }
    if (
      event.admissibility_state !== "admitted" ||
      !allowedFreshness.has(event.freshness_state)
    ) {
      issue(
        report,
        `packet.${relation}_state`,
        `${packetPath}.claims.${claim.claim_id}`,
        `${relation} reference ${ref} is stale, unresolved, or inadmissible`,
      );
    }
    const questionRefs = stringArray(event.applicable_scope?.question_refs);
    const subjectRefs = stringArray(event.applicable_scope?.subject_refs);
    if (
      !questionRefs.includes(claim.question_ref) ||
      !subjectRefs.includes(claim.subject_ref)
    ) {
      issue(
        report,
        `packet.${relation}_scope`,
        `${packetPath}.claims.${claim.claim_id}`,
        `${relation} reference ${ref} is not scoped to the claim question and subject`,
      );
    }
    if (
      event.event_type === "source_observation" &&
      allowedObservationResults !== null &&
      !allowedObservationResults.has(String(event.payload.result))
    ) {
      issue(
        report,
        `packet.${relation}_observation`,
        `${packetPath}.claims.${claim.claim_id}`,
        `${relation} reference ${ref} is unavailable or inadmissible`,
      );
    }
  }
}

function loadAndValidateSubmission(
  workspaceDir: string,
  candidate: LoadedCandidate,
  report: ValidationReport,
): Submission | null {
  const path = `${candidate.attemptRoot}/submission.json`;
  try {
    const submission = readNormalizedJson<Submission>(workspaceDir, path);
    schema(report, path, SCHEMA.submission, submission);
    validateCommonIdentity(candidate, submission, report, path);
    validateVersionPins(submission, report, path);

    const expectedArtifacts = expectedCoreArtifacts(
      workspaceDir,
      candidate,
    );
    compareArtifactSets(
      submission.artifacts,
      expectedArtifacts,
      report,
      `${path}.artifacts`,
    );
    const expectedSources = expectedSourceArtifacts(
      workspaceDir,
      candidate,
    );
    if (
      sha256CanonicalJson(submission.sources) !==
      sha256CanonicalJson(expectedSources)
    ) {
      issue(
        report,
        "submission.sources_mismatch",
        `${path}.sources`,
        "source digest inventory does not exactly bind the admitted source objects",
      );
    }

    const last = candidate.ledger.at(-1);
    if (
      last === undefined ||
      submission.ledger_head.event_id !== last.event_id ||
      submission.ledger_head.event_hash !== last.event_hash ||
      submission.ledger_head.event_count !== candidate.ledger.length
    ) {
      issue(
        report,
        "submission.ledger_head",
        `${path}.ledger_head`,
        "submission does not bind the validated ledger head",
      );
    }
    if (
      last !== undefined &&
      (submission.executor_session.actor_session_ref !== last.actor_session_ref ||
        submission.executor_session.provider_declared !==
          last.provider_declared ||
        submission.executor_session.model_declared !== last.model_declared)
    ) {
      issue(
        report,
        "submission.executor_session",
        `${path}.executor_session`,
        "executor identity and provider metadata must match the final ledger writer",
      );
    }
    if (submission.validation.result !== "pass") {
      issue(
        report,
        "submission.validation",
        `${path}.validation`,
        "submission lacks a passing pre-submission validation receipt",
      );
    }
    const ledgerRecordedAt = candidate.ledger.at(-1)?.recorded_at;
    if (
      (ledgerRecordedAt !== undefined &&
        isAfter(ledgerRecordedAt, submission.validation.validated_at)) ||
      isAfter(
        candidate.packet.generated_at,
        submission.validation.validated_at,
      ) ||
      isAfter(submission.validation.validated_at, submission.submitted_at)
    ) {
      issue(
        report,
        "terminal.chronology",
        path,
        "submission must follow the ledger and packet, and validation must not postdate submission",
      );
    }
    return submission;
  } catch (error) {
    issue(
      report,
      "submission.unreadable",
      path,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

function loadAndValidateReview(
  workspaceDir: string,
  candidate: LoadedCandidate,
  submission: Submission | null,
  report: ValidationReport,
): Review | null {
  const path = `${candidate.attemptRoot}/review.json`;
  try {
    const review = readNormalizedJson<Review>(workspaceDir, path);
    schema(report, path, SCHEMA.review, review);
    validateCommonIdentity(candidate, review, report, path);
    for (const [field, verdict] of [
      ["substantive.verdict", review.substantive.verdict],
      ["protocol.verdict", review.protocol.verdict],
      ["overall_verdict", review.overall_verdict],
    ] as const) {
      if (!candidate.job.terminal_states.review.includes(verdict)) {
        issue(
          report,
          "job.terminal_state_not_permitted",
          `${path}.${field}`,
          `review verdict ${verdict} is outside the activated job contract`,
        );
      }
    }
    if (submission === null) {
      issue(
        report,
        "review.submission_missing",
        path,
        "review cannot exist without a valid frozen submission",
      );
      return review;
    }
    const submissionPath = `${candidate.attemptRoot}/submission.json`;
    const expectedDigest = sha256CanonicalJson(submission);
    if (
      review.submission_ref.path !== submissionPath ||
      review.submission_ref.digest !== expectedDigest
    ) {
      issue(
        report,
        "review.submission_mismatch",
        `${path}.submission_ref`,
        "review does not bind the exact frozen submission",
      );
    }
    if (
      review.reviewer.actor_session_ref ===
      submission.executor_session.actor_session_ref
    ) {
      issue(
        report,
        "review.not_independent",
        `${path}.reviewer.actor_session_ref`,
        "reviewer session must differ from the executor session",
      );
    }
    if (
      review.reviewer.fresh_context !== true ||
      review.reviewer.independence_basis.trim().length === 0
    ) {
      issue(
        report,
        "review.independence_undeclared",
        `${path}.reviewer`,
        "review must declare a fresh context and independence basis",
      );
    }
    if (review.candidate_modifications_made !== false) {
      issue(
        report,
        "review.modified_candidate",
        `${path}.candidate_modifications_made`,
        "reviewer may not repair the reviewed candidate",
      );
    }
    if (isAfter(submission.submitted_at, review.reviewed_at)) {
      issue(
        report,
        "terminal.chronology",
        path,
        "independent review cannot predate the frozen submission",
      );
    }
    if (
      review.overall_verdict === "pass" &&
      (review.substantive.verdict !== "pass" ||
        review.protocol.verdict !== "pass")
    ) {
      issue(
        report,
        "review.verdict_collapse",
        path,
        "overall pass requires separate substantive and protocol passes",
      );
    }
    const severity = new Map([
      ["pass", 0],
      ["rework_required", 1],
      ["blocked", 2],
      ["reject", 3],
    ]);
    const expectedOverall = [
      review.substantive.verdict,
      review.protocol.verdict,
    ].reduce((worst, verdict) =>
      (severity.get(verdict) ?? Number.POSITIVE_INFINITY) >
      (severity.get(worst) ?? Number.POSITIVE_INFINITY)
        ? verdict
        : worst,
    "pass");
    if (review.overall_verdict !== expectedOverall) {
      issue(
        report,
        "review.verdict_aggregate",
        path,
        `overall verdict must equal the deterministic worst section verdict: ${expectedOverall}`,
      );
    }
    return review;
  } catch (error) {
    issue(
      report,
      "review.unreadable",
      path,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

function loadAndValidateSeal(
  workspaceDir: string,
  candidate: LoadedCandidate,
  submission: Submission | null,
  review: Review | null,
  report: ValidationReport,
  predecessorChain: ReadonlySet<string>,
): Seal | null {
  const path = `${candidate.attemptRoot}/seal.json`;
  try {
    const seal = readNormalizedJson<Seal>(workspaceDir, path);
    schema(report, path, SCHEMA.seal, seal);
    validateCommonIdentity(candidate, seal, report, path);
    validateVersionPins(seal, report, path);
    for (const [field, value, allowed] of [
      [
        "terminal_state.process_terminal",
        seal.terminal_state.process_terminal,
        candidate.job.terminal_states.process,
      ],
      [
        "terminal_state.review_verdict",
        seal.terminal_state.review_verdict,
        candidate.job.terminal_states.review,
      ],
    ] as const) {
      if (!allowed.includes(value)) {
        issue(
          report,
          "job.terminal_state_not_permitted",
          `${path}.${field}`,
          `sealed terminal state ${value} is outside the activated job contract`,
        );
      }
    }

    if (Object.hasOwn(seal, "archive_id")) {
      issue(
        report,
        "seal.self_hash",
        path,
        "seal must not contain its own archive digest",
      );
    }
    if (seal.successor_attempt_ref !== null) {
      issue(
        report,
        "seal.forward_link",
        `${path}.successor_attempt_ref`,
        "v0 seals are backward-linked only; forward links belong in run-events",
      );
    }
    if (submission === null) {
      issue(
        report,
        "seal.submission_missing",
        path,
        "seal cannot exist without a valid submission",
      );
    } else {
      const expectedPath = `${candidate.attemptRoot}/submission.json`;
      const expectedDigest = sha256CanonicalJson(submission);
      if (
        seal.submission_ref.path !== expectedPath ||
        seal.submission_ref.digest !== expectedDigest
      ) {
        issue(
          report,
          "seal.submission_mismatch",
          `${path}.submission_ref`,
          "seal does not bind the exact submission",
        );
      }
    }
    if (seal.review_ref === null) {
      if (
        review !== null ||
        seal.terminal_state.review_verdict !== "not_reached"
      ) {
        issue(
          report,
          "seal.review_state",
          `${path}.review_ref`,
          "null review is permitted only when review was not reached",
        );
      }
    } else if (review === null) {
      issue(
        report,
        "seal.review_missing",
        `${path}.review_ref`,
        "seal review reference does not resolve",
      );
    } else {
      const expectedPath = `${candidate.attemptRoot}/review.json`;
      const expectedDigest = sha256CanonicalJson(review);
      if (
        seal.review_ref.path !== expectedPath ||
        seal.review_ref.digest !== expectedDigest
      ) {
        issue(
          report,
          "seal.review_mismatch",
          `${path}.review_ref`,
          "seal does not bind the exact independent review",
        );
      }
      if (seal.terminal_state.review_verdict !== review.overall_verdict) {
        issue(
          report,
          "seal.review_verdict",
          `${path}.terminal_state.review_verdict`,
          "seal verdict differs from the bound review",
        );
      }
    }
    if (
      seal.terminal_state.process_terminal !==
      candidate.packet.process_terminal
    ) {
      issue(
        report,
        "seal.process_terminal",
        `${path}.terminal_state.process_terminal`,
        "seal process state differs from the frozen packet",
      );
    }
    if (
      seal.archive_policy.retention !== "repository_history" ||
      seal.archive_policy.redaction !== "none_required" ||
      seal.archive_policy.reportability !== candidate.job.reportability
    ) {
      issue(
        report,
        "seal.archive_policy",
        `${path}.archive_policy`,
        "archive policy must preserve repository history, the public-context privacy ceiling, and job reportability",
      );
    }
    const priorTerminalTime =
      review?.reviewed_at ?? submission?.submitted_at ?? null;
    if (
      priorTerminalTime !== null &&
      isAfter(priorTerminalTime, seal.sealed_at)
    ) {
      issue(
        report,
        "terminal.chronology",
        path,
        "seal cannot predate its submission or review",
      );
    }
    if (
      seal.review_ref === null &&
      (seal.terminal_state.process_terminal === "completed" ||
        candidate.packet.completion !== "blocked")
    ) {
      issue(
        report,
        "seal.no_review_terminal",
        path,
        "review-not-reached seals are limited to non-completed blocked attempts",
      );
    }
    if (
      review?.overall_verdict === "pass" &&
      seal.terminal_state.process_terminal !== "completed"
    ) {
      issue(
        report,
        "seal.pass_terminal",
        path,
        "a passing review can seal only a completed process",
      );
    }
    validatePredecessor(
      workspaceDir,
      candidate,
      seal,
      report,
      path,
      predecessorChain,
    );
    return seal;
  } catch (error) {
    issue(
      report,
      "seal.unreadable",
      path,
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

function validatePredecessor(
  workspaceDir: string,
  candidate: LoadedCandidate,
  seal: Seal,
  report: ValidationReport,
  path: string,
  predecessorChain: ReadonlySet<string>,
): void {
  const predecessorRef = seal.predecessor_attempt_ref;
  const incomingLinks = candidate.runEvents.filter(
    (event) =>
      event.event_type === "successor_link" &&
      event.payload.successor_attempt_ref === seal.attempt_id,
  );
  if (predecessorRef === null) {
    if (incomingLinks.length > 0) {
      issue(
        report,
        "attempt.predecessor_lineage",
        `${path}.predecessor_attempt_ref`,
        "attempt was opened by a successor_link but its seal omits that exact predecessor",
      );
    }
    return;
  }
  const predecessorId = predecessorRef.attempt_id;
  if (!isSafeId(predecessorId) || predecessorId === seal.attempt_id) {
    issue(
      report,
      "attempt.predecessor_invalid",
      `${path}.predecessor_attempt_ref`,
      "predecessor must be a distinct safe attempt ID",
    );
    return;
  }
  const incomingLink = incomingLinks[0];
  if (
    incomingLinks.length !== 1 ||
    incomingLink === undefined ||
    incomingLink.attempt_id !== predecessorId ||
    incomingLink.payload.predecessor_attempt_ref !== predecessorId ||
    incomingLink.payload.artifact_digest !== predecessorRef.archive_id
  ) {
    issue(
      report,
      "attempt.predecessor_lineage",
      `${path}.predecessor_attempt_ref`,
      "sealed predecessor must equal the unique predecessor and archive authorized by the incoming successor_link",
    );
  }
  const predecessorRoot = `${candidate.runRoot}/attempts/${predecessorId}`;
  const predecessorSealPath = `${predecessorRoot}/seal.json`;
  const predecessorSubmissionPath = `${predecessorRoot}/submission.json`;
  if (
    !exists(workspaceDir, predecessorSealPath) ||
    !exists(workspaceDir, predecessorSubmissionPath)
  ) {
    issue(
      report,
      "attempt.predecessor_missing",
      `${path}.predecessor_attempt_ref`,
      "predecessor seal and submission must exist",
    );
    return;
  }

  const predecessorReport = validateAttemptInternal(
    workspaceDir,
    candidate.activation.run_id,
    predecessorId,
    { phase: "sealed" },
    predecessorChain,
  );
  if (!predecessorReport.valid) {
    for (const predecessorIssue of predecessorReport.errors) {
      issue(
        report,
        predecessorIssue.code,
        predecessorIssue.path,
        `invalid predecessor ${predecessorId}: ${predecessorIssue.message}`,
      );
    }
    issue(
      report,
      "attempt.predecessor_invalid",
      `${path}.predecessor_attempt_ref`,
      "predecessor archive failed full schema, identity, submission, review, seal, or lifecycle validation",
    );
    return;
  }
  const predecessorSeal = readNormalizedJson<Seal>(
    workspaceDir,
    predecessorSealPath,
  );
  const predecessorSubmission = readNormalizedJson<Submission>(
    workspaceDir,
    predecessorSubmissionPath,
  );
  const predecessorArchiveId = sha256CanonicalJson(predecessorSeal);
  if (predecessorRef.archive_id !== predecessorArchiveId) {
    issue(
      report,
      "attempt.predecessor_archive_mismatch",
      `${path}.predecessor_attempt_ref.archive_id`,
      `expected ${predecessorArchiveId}; received ${predecessorRef.archive_id}`,
    );
  }
  if (
    predecessorSeal.terminal_state.review_verdict !== "rework_required" &&
    predecessorSeal.terminal_state.review_verdict !== "blocked"
  ) {
    issue(
      report,
      "attempt.predecessor_state",
      predecessorSealPath,
      "successor attempt requires a rework-required or blocked predecessor",
    );
  }
  const currentSubmission = readNormalizedJson<Submission>(
    workspaceDir,
    `${candidate.attemptRoot}/submission.json`,
  );
  const pinnedTypes = new Set(["activation", "inputs", "job"]);
  const priorPins = predecessorSubmission.artifacts
    .filter((entry) => pinnedTypes.has(entry.artifact_type))
    .map((entry) => entry.digest)
    .sort();
  const currentPins = currentSubmission.artifacts
    .filter((entry) => pinnedTypes.has(entry.artifact_type))
    .map((entry) => entry.digest)
    .sort();
  if (sha256CanonicalJson(priorPins) !== sha256CanonicalJson(currentPins)) {
    issue(
      report,
      "attempt.rework_changed_run_inputs",
      path,
      "changed job/activation/inputs require a new run, not a successor attempt",
    );
  }
}

function validateCommonIdentity(
  candidate: LoadedCandidate,
  artifact:
    | Review
    | Seal
    | Submission,
  report: ValidationReport,
  path: string,
): void {
  const expected: Array<[string, unknown, unknown]> = [
    ["job_id", artifact.job_id, candidate.job.job_id],
    ["job_version", artifact.job_version, candidate.job.job_version],
    ["run_id", artifact.run_id, candidate.activation.run_id],
    ["attempt_id", artifact.attempt_id, candidate.packet.attempt_id],
    [
      "synthetic_fixture",
      artifact.synthetic_fixture,
      candidate.job.synthetic_fixture,
    ],
  ];
  for (const [field, actual, value] of expected) {
    if (actual !== value) {
      issue(
        report,
        "identity.mismatch",
        `${path}.${field}`,
        `expected ${String(value)}; received ${String(actual)}`,
      );
    }
  }
}

function validateVersionPins(
  artifact: Submission | Seal,
  report: ValidationReport,
  path: string,
): void {
  const pins: Array<[string, string, string]> = [
    [
      "canonicalization_version",
      artifact.canonicalization_version,
      VERSIONS.canonicalJson,
    ],
    ["raw_hash_version", artifact.raw_hash_version, VERSIONS.rawHash],
    ["json_file_version", artifact.json_file_version, VERSIONS.jsonFile],
    ["validator_version", artifact.validator_version, VERSIONS.validator],
    ["renderer_version", artifact.renderer_version, VERSIONS.renderer],
  ];
  for (const [field, actual, expected] of pins) {
    if (actual !== expected) {
      issue(
        report,
        "version.mismatch",
        `${path}.${field}`,
        `expected ${expected}; received ${actual}`,
      );
    }
  }
}

function expectedCoreArtifacts(
  workspaceDir: string,
  candidate: LoadedCandidate,
): ArtifactDigest[] {
  const entries: Array<{
    artifact_type: string;
    path: string;
    digest_mode: string;
  }> = [
    {
      artifact_type: "authority_decision",
      path: candidate.activation.ops_decision_ref.path,
      digest_mode: VERSIONS.canonicalJson,
    },
    {
      artifact_type: "activation",
      path: `${candidate.runRoot}/activation.json`,
      digest_mode: VERSIONS.canonicalJson,
    },
    {
      artifact_type: "inputs",
      path: `${candidate.runRoot}/inputs.json`,
      digest_mode: VERSIONS.canonicalJson,
    },
    {
      artifact_type: "job",
      path: candidate.activation.job_ref.path,
      digest_mode: VERSIONS.rawHash,
    },
    {
      artifact_type: "ledger",
      path: candidate.ledgerPath,
      digest_mode: VERSIONS.rawHash,
    },
    {
      artifact_type: "packet_json",
      path: candidate.packetPath,
      digest_mode: VERSIONS.canonicalJson,
    },
    {
      artifact_type: "packet_markdown",
      path: candidate.packetMarkdownPath,
      digest_mode: VERSIONS.rawHash,
    },
  ];
  return entries.map((entry) => ({
    ...entry,
    digest:
      entry.digest_mode === VERSIONS.canonicalJson
        ? sha256CanonicalJson(
            readNormalizedJson(workspaceDir, entry.path),
          )
        : sha256Raw(readBytes(workspaceDir, entry.path)),
  }));
}

function expectedSourceArtifacts(
  workspaceDir: string,
  candidate: LoadedCandidate,
): Submission["sources"] {
  return candidate.inputs.sources.map((source) => ({
    source_object_id: source.source_object_id,
    metadata: {
      artifact_type: "source_metadata",
      path: source.metadata_path,
      digest: sha256CanonicalJson(
        readNormalizedJson(workspaceDir, source.metadata_path),
      ),
      digest_mode: VERSIONS.canonicalJson,
    },
    content:
      source.content_path === null
        ? null
        : {
            artifact_type: "source_content",
            path: source.content_path,
            digest: sha256Raw(readBytes(workspaceDir, source.content_path)),
            digest_mode: VERSIONS.rawHash,
          },
  }));
}

function compareArtifactSets(
  actual: ArtifactDigest[],
  expected: ArtifactDigest[],
  report: ValidationReport,
  path: string,
): void {
  const sorted = (entries: ArtifactDigest[]) =>
    [...entries].sort((left, right) => left.artifact_type.localeCompare(right.artifact_type));
  if (
    sha256CanonicalJson(sorted(actual)) !==
    sha256CanonicalJson(sorted(expected))
  ) {
    issue(
      report,
      "submission.artifacts_mismatch",
      path,
      "artifact inventory does not exactly bind the required frozen bytes",
    );
  }
}

function listAttemptFiles(
  workspaceDir: string,
  attemptRoot: string,
  report: ValidationReport,
): Set<string> {
  const absolute = resolveContained(workspaceDir, attemptRoot);
  const allowed = new Set([
    "ledger.jsonl",
    "packet.json",
    "packet.md",
    "review.json",
    "seal.json",
    "submission.json",
  ]);
  const found = new Set<string>();
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || !entry.isFile()) {
      issue(
        report,
        "attempt.unexpected_entry",
        `${attemptRoot}/${entry.name}`,
        "attempt directory may contain only ordinary canonical files",
      );
      continue;
    }
    found.add(entry.name);
    if (!allowed.has(entry.name)) {
      issue(
        report,
        "attempt.unexpected_file",
        `${attemptRoot}/${entry.name}`,
        "unexpected attempt file is not bound by the contract",
      );
    }
  }
  return found;
}

function rejectPromotionInsideRun(
  workspaceDir: string,
  runRoot: string,
  report: ValidationReport,
): void {
  const absolute = resolveContained(workspaceDir, runRoot);
  walk(absolute, (entry, path) => {
    if (entry.name === "promotion.json") {
      issue(
        report,
        "authority.promotion_inside_run",
        relative(resolve(workspaceDir), path),
        "promotion must remain an external Ops decision",
      );
    }
  });
}

function validateRunEventLifecycle(
  candidate: LoadedCandidate,
  submission: Submission | null,
  review: Review | null,
  seal: Seal | null,
  report: ValidationReport,
): void {
  const runEventPath = `${candidate.runRoot}/run-events.jsonl`;
  const attemptId = candidate.packet.attempt_id;
  const relevant = candidate.runEvents.filter(
    (event) => event.attempt_id === attemptId,
  );
  const byType = new Map<string, RunEventRecord[]>();
  for (const event of relevant) {
    const bucket = byType.get(event.event_type) ?? [];
    bucket.push(event);
    byType.set(event.event_type, bucket);
  }

  checkArtifactEvent(
    "attempt_submitted",
    submission,
    submission === null ? null : sha256CanonicalJson(submission),
    `${candidate.attemptRoot}/submission.json`,
    "submission_ref",
    submission?.submitted_at ?? null,
  );
  checkArtifactEvent(
    "review_returned",
    review,
    review === null ? null : sha256CanonicalJson(review),
    `${candidate.attemptRoot}/review.json`,
    "review_ref",
    review?.reviewed_at ?? null,
  );

  const closedEvents = byType.get("run_closed") ?? [];
  const successorEvents = byType.get("successor_link") ?? [];
  if (seal === null) {
    if (closedEvents.length > 0 || successorEvents.length > 0) {
      issue(
        report,
        "run_event.dangling_terminal_event",
        runEventPath,
        "a seal-binding run_closed or successor_link event exists without seal.json",
      );
    }
  } else {
    const terminalEvents = [...closedEvents, ...successorEvents];
    const mayAwaitSuccessor =
      seal.terminal_state.review_verdict === "rework_required";
    if (
      terminalEvents.length > 1 ||
      (!mayAwaitSuccessor && terminalEvents.length !== 1)
    ) {
      issue(
        report,
        "run_event.lifecycle_missing",
        runEventPath,
        mayAwaitSuccessor
          ? "a rework-required seal may have at most one later successor_link event"
          : "a sealed attempt requires exactly one seal-binding run_closed or successor_link event",
      );
    } else if (terminalEvents.length === 1) {
      const terminalEvent = terminalEvents[0];
      const archiveId = sha256CanonicalJson(seal);
      if (
        terminalEvent === undefined ||
        terminalEvent.payload.artifact_digest !== archiveId
      ) {
        issue(
          report,
          "run_event.lifecycle_mismatch",
          runEventPath,
          "terminal run event must bind the exact seal digest",
        );
      }
      if (terminalEvent?.event_type === "run_closed") {
        if (
          terminalEvent.payload.attempt_ref !== attemptId ||
          terminalEvent.payload.terminal_state !==
            seal.terminal_state.process_terminal ||
          terminalEvent.recorded_at !== seal.sealed_at ||
          mayAwaitSuccessor
        ) {
          issue(
            report,
            terminalEvent.recorded_at !== seal.sealed_at
              ? "run_event.artifact_time_mismatch"
              : "run_event.close_state",
            runEventPath,
            "run_closed must bind the sealed final attempt, exact process terminal state, and sealed_at timestamp",
          );
        }
      } else if (terminalEvent?.event_type === "successor_link") {
        if (
          terminalEvent.payload.predecessor_attempt_ref !== attemptId ||
          typeof terminalEvent.payload.decision_ref !== "string" ||
          terminalEvent.payload.decision_ref.trim().length === 0 ||
          isAfter(seal.sealed_at, terminalEvent.recorded_at) ||
          !["blocked", "rework_required"].includes(
            seal.terminal_state.review_verdict,
          )
        ) {
          issue(
            report,
            "run_event.successor_state",
            runEventPath,
            "successor_link requires a blocked or rework-required predecessor seal, explicit Ops authority, and a timestamp at or after sealing",
          );
        }
      }
    }
  }

  const interruptionByTerminal = new Map([
    ["cancelled", "cancellation"],
    ["budget_exhausted", "budget_exhausted"],
    ["protocol_violation", "protocol_violation"],
  ]);
  const expectedInterruption =
    seal === null
      ? undefined
      : interruptionByTerminal.get(seal.terminal_state.process_terminal);
  for (const eventType of [
    "cancellation",
    "budget_exhausted",
    "protocol_violation",
  ]) {
    const count = (byType.get(eventType) ?? []).length;
    const expected = eventType === expectedInterruption ? 1 : 0;
    if (count !== expected) {
      issue(
        report,
        "run_event.interruption_state",
        runEventPath,
        expected === 1
          ? `sealed ${seal?.terminal_state.process_terminal ?? ""} attempt requires one ${eventType} event`
          : `${eventType} event conflicts with the sealed process terminal state`,
      );
    }
  }

  function checkArtifactEvent(
    eventType: string,
    artifact: unknown | null,
    digest: Sha256Digest | null,
    artifactPath: string | null,
    pathField: string | null,
    artifactTime: string | null,
  ): void {
    const events = byType.get(eventType) ?? [];
    if (artifact === null) {
      if (events.length > 0) {
        issue(
          report,
          "run_event.dangling_terminal_event",
          runEventPath,
          `${eventType} exists without its frozen artifact`,
        );
      }
      return;
    }
    if (events.length !== 1) {
      issue(
        report,
        "run_event.lifecycle_missing",
        runEventPath,
        `expected exactly one ${eventType} event for the frozen artifact`,
      );
      return;
    }
    const event = events[0];
    if (
      event === undefined ||
      event.payload.artifact_digest !== digest ||
      event.payload.attempt_ref !== attemptId ||
      (pathField !== null && event.payload[pathField] !== artifactPath)
    ) {
      issue(
        report,
        "run_event.lifecycle_mismatch",
        runEventPath,
        `${eventType} does not bind the exact artifact and attempt`,
      );
    }
    if (
      event !== undefined &&
      artifactTime !== null &&
      event.recorded_at !== artifactTime
    ) {
      issue(
        report,
        "run_event.artifact_time_mismatch",
        runEventPath,
        `${eventType} recorded_at must equal the bound artifact timestamp`,
      );
    }
  }
}

function walk(
  directory: string,
  visit: (entry: Dirent, absolutePath: string) => void,
): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    visit(entry, path);
    if (entry.isSymbolicLink()) {
      continue;
    }
    if (entry.isDirectory()) {
      walk(path, visit);
    }
  }
}

function deriveResumeState(
  runId: string,
  attemptId: string,
  ledger: LedgerEventRecord[],
  head: Sha256Digest | null,
  runEvents: RunEventRecord[],
  submission: Submission | null,
  review: Review | null,
  seal: Seal | null,
): ResumeState {
  let lastStatus: string | null = null;
  let frontier: string | null = null;
  let gaps: string[] = [];
  let blockers: string[] = [];
  let budgets: Record<string, unknown> | null = null;
  let next: string[] = [];
  for (const event of ledger) {
    if (
      event.event_type === "status_transition" &&
      typeof event.payload.to === "string"
    ) {
      lastStatus = event.payload.to;
    }
    if (event.event_type === "checkpoint") {
      frontier =
        typeof event.payload.frontier_question === "string"
          ? event.payload.frontier_question
          : null;
      gaps = stringArray(event.payload.evidence_gaps);
      blockers = stringArray(event.payload.blocked_items);
      budgets =
        event.payload.budgets_remaining !== null &&
        typeof event.payload.budgets_remaining === "object" &&
        !Array.isArray(event.payload.budgets_remaining)
          ? (event.payload.budgets_remaining as Record<string, unknown>)
          : null;
    }
  }
  const lastRunEvent = runEvents.at(-1);
  if (seal !== null) {
    lastStatus = `sealed:${seal.terminal_state.process_terminal}:${seal.terminal_state.review_verdict}`;
    const successorLink = runEvents.find(
      (event) =>
        event.event_type === "successor_link" &&
        event.attempt_id === attemptId,
    );
    next =
      seal.terminal_state.review_verdict === "rework_required"
        ? successorLink === undefined
          ? [
              "Await a separately authorized successor_link; the sealed attempt cannot authorize its own continuation.",
            ]
          : [
              `Start only the Ops-authorized successor attempt ${String(successorLink.payload.successor_attempt_ref)}.`,
            ]
        : [
            "No executor action is permitted; await a separate external Ops decision.",
          ];
  } else if (review !== null) {
    lastStatus = `reviewed:${review.overall_verdict}`;
    next =
      review.overall_verdict === "rework_required"
        ? ["Await a separately authorized successor attempt."]
        : ["Seal the frozen reviewed attempt without modifying candidate bytes."];
  } else if (submission !== null) {
    lastStatus = "submitted";
    next = ["Await an independent fresh-context review."];
  } else if (lastRunEvent?.event_type === "attempt_started") {
    lastStatus ??= "attempt_started";
    next = [
      "Continue only the bounded research actions allowed by the activated job.",
    ];
  }
  return {
    run_id: runId,
    attempt_id: attemptId,
    ledger_head: head,
    last_sequence: ledger.length,
    last_status: lastStatus,
    frontier_question: frontier,
    open_evidence_gaps: gaps,
    blockers,
    budgets_remaining: budgets,
    next_permitted_actions: next,
  };
}

function schema(
  report: ValidationReport,
  path: string,
  schemaId: string,
  value: unknown,
): void {
  const result = validateSchema(schemaId, value);
  for (const error of result.errors) {
    issue(
      report,
      "schema.invalid",
      `${path}${error.instancePath}`,
      `${error.keyword}: ${error.message}`,
    );
  }
}

function issue(
  report: ValidationReport,
  code: string,
  path: string,
  message: string,
): void {
  report.errors.push({ code, path, message });
}

function finish(
  report: ValidationReport,
  options: ValidationOptions,
): ValidationReport {
  if (options.requireEndToEnd === true && !report.end_to_end_ready) {
    issue(
      report,
      "readiness.end_to_end_not_reached",
      ".",
      "structural validity does not satisfy the required end-to-end reviewed seal path",
    );
  }
  report.valid = report.errors.length === 0;
  return report;
}

function phaseRank(phase: ValidationPhase): number {
  return {
    candidate: 0,
    submitted: 1,
    reviewed: 2,
    sealed: 3,
  }[phase];
}

function detectPhase(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): ValidationPhase {
  const root = `runs/${runId}/attempts/${attemptId}`;
  if (exists(workspaceDir, `${root}/seal.json`)) {
    return "sealed";
  }
  if (exists(workspaceDir, `${root}/review.json`)) {
    return "reviewed";
  }
  if (exists(workspaceDir, `${root}/submission.json`)) {
    return "submitted";
  }
  return "candidate";
}

function exists(workspaceDir: string, path: string): boolean {
  try {
    const resolved = resolveContained(workspaceDir, path);
    return existsSync(resolved) && !lstatSync(resolved).isSymbolicLink();
  } catch {
    return false;
  }
}

function uniqueIds(values: string[]): Set<string> {
  return new Set(values);
}

function reportDuplicateIds(
  values: readonly string[],
  report: ValidationReport,
  code: string,
  path: string,
): void {
  const seen = new Set<string>();
  const reported = new Set<string>();
  for (const value of values) {
    if (seen.has(value) && !reported.has(value)) {
      issue(report, code, path, `duplicate identifier or reference: ${value}`);
      reported.add(value);
    }
    seen.add(value);
  }
}

function validateScopeReferences(
  values: readonly string[],
  admitted: ReadonlySet<string>,
  report: ValidationReport,
  code: string,
  path: string,
): void {
  reportDuplicateIds(values, report, `${code}_duplicate`, path);
  for (const value of values) {
    if (!admitted.has(value)) {
      issue(report, code, path, `scope reference is outside the frozen job: ${value}`);
    }
  }
}

function isSafeId(value: string): boolean {
  return /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*$/u.test(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

export const internalArtifactBuilders = {
  expectedCoreArtifacts,
  expectedSourceArtifacts,
};
