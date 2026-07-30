import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { canonicalizeJson } from "./canonical.js";
import {
  sha256CanonicalJson,
  sha256Raw,
  type Sha256Digest,
} from "./digest.js";
import {
  finalizeLedgerEvent,
  parseLedgerJsonl,
} from "./ledger.js";
import {
  appendUtf8,
  normalizedJsonText,
  readBytes,
  readNormalizedJson,
  readUtf8,
  readYaml,
  resolveContained,
  writeJsonCreateOnly,
  writeUtf8CreateOnly,
} from "./io.js";
import { isAfter } from "./protocol.js";
import { renderPacketMarkdown, type ResearchPacket } from "./renderer.js";
import {
  validateAttempt,
  validateAttemptStart,
  validateResume,
} from "./validator.js";
import { VERSIONS } from "./versions.js";

interface ActivationForBuild {
  synthetic_fixture: boolean;
  run_id: string;
  job_ref: {
    job_id: string;
    job_version: string;
    path: string;
  };
  ops_decision_ref: {
    path: string;
  };
}

interface InputsForBuild {
  sources: Array<{
    source_object_id: string;
    metadata_path: string;
    content_path: string | null;
  }>;
}

interface JobForBuild {
  synthetic_fixture: boolean;
  job_id: string;
  job_version: string;
  reportability: string;
}

interface ArtifactDigest {
  artifact_type: string;
  path: string;
  digest: Sha256Digest;
  digest_mode: string;
}

export interface SubmissionMetadata {
  submitted_at: string;
  validated_at: string;
  actor_session_ref: string;
  provider_declared: string;
  model_declared: string;
  observed_by: string;
  run_event_actor_session_ref?: string;
}

export interface AttemptStartMetadata {
  started_at: string;
  actor_session_ref: string;
}

export interface ReviewMetadata {
  review_id: string;
  reviewed_at: string;
  actor_session_ref: string;
  provider_declared: string;
  model_declared: string;
  independence_basis: string;
  independence_limits: string[];
  substantive: {
    verdict: "blocked" | "pass" | "reject" | "rework_required";
    rationale: string;
    findings: string[];
  };
  protocol: {
    verdict: "blocked" | "pass" | "reject" | "rework_required";
    rationale: string;
    findings: string[];
  };
  overall_verdict: "blocked" | "pass" | "reject" | "rework_required";
  limitations: string[];
  run_event_actor_session_ref?: string;
}

export interface SealMetadata {
  sealed_at: string;
  predecessor_attempt_ref: {
    attempt_id: string;
    archive_id: Sha256Digest;
  } | null;
  /**
   * Required for live runs. Synthetic fixtures use their pinned orchestrator
   * actor when this compatibility field is omitted.
   */
  actor_session_ref?: string;
  /**
   * A rework/blocked seal may link one exact successor instead of closing the
   * run. The successor receives its own attempt_started event separately.
   */
  successor_attempt_id?: string | null;
  /**
   * Explicit Ops decision authorizing the successor link. This is required
   * only when successor_attempt_id is present and is not stored in seal.json.
   */
  successor_decision_ref?: string | null;
  /**
   * Time the external successor decision was recorded. It may equal or follow
   * sealed_at, but cannot predate the immutable attempt archive.
   */
  successor_linked_at?: string | null;
}

export interface BuiltFixture {
  submission_digest: Sha256Digest;
  review_digest: Sha256Digest;
  archive_id: Sha256Digest;
}

/**
 * Append or exactly recover the run-level event that opens an attempt.
 *
 * The first attempt may follow activation. Every later attempt must be the
 * exact successor named by the immediately preceding Ops-authorized link.
 */
export function createAttemptStart(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  metadata: AttemptStartMetadata,
): void {
  if (!isSafeId(runId) || !isSafeId(attemptId)) {
    throw new Error("run_id and attempt_id must be safe identifiers");
  }
  if (!isSafeId(metadata.actor_session_ref)) {
    throw new Error("attempt start requires a safe actor_session_ref");
  }
  const runEventPath = `runs/${runId}/run-events.jsonl`;
  const events = parseLedgerJsonl(readBytes(workspaceDir, runEventPath));
  const existing = events.find(
    (event) =>
      event.event_type === "attempt_started" &&
      event.attempt_id === attemptId,
  );
  if (existing === undefined) {
    const last = events.at(-1);
    const hasPriorAttempt = events.some(
      (event) => event.event_type === "attempt_started",
    );
    const authorized =
      last !== undefined &&
      ((!hasPriorAttempt && last.event_type === "activation") ||
        (hasPriorAttempt &&
          last.event_type === "successor_link" &&
          last.payload.successor_attempt_ref === attemptId &&
          typeof last.payload.decision_ref === "string" &&
          last.payload.decision_ref.trim().length > 0));
    if (!authorized) {
      throw new Error(
        "attempt start requires activation or the immediately preceding Ops-authorized successor_link",
      );
    }
    if (hasPriorAttempt) {
      const predecessorAttemptId = last?.attempt_id;
      if (
        typeof predecessorAttemptId !== "string" ||
        !isSafeId(predecessorAttemptId)
      ) {
        throw new Error(
          "successor attempt start requires a valid predecessor attempt reference",
        );
      }
      requireValidLifecycle(
        validateAttempt(
          workspaceDir,
          runId,
          predecessorAttemptId,
          { phase: "sealed" },
        ),
        "successor predecessor",
      );
    }
    const attemptRoot = `runs/${runId}/attempts/${attemptId}`;
    const attemptAbsolute = resolveContained(workspaceDir, attemptRoot);
    if (existsSync(attemptAbsolute)) {
      const attemptStats = lstatSync(attemptAbsolute);
      if (
        attemptStats.isSymbolicLink() ||
        !attemptStats.isDirectory() ||
        readdirSync(attemptAbsolute).length > 0
      ) {
        throw new Error(
          "a new attempt cannot contain research artifacts before attempt_started",
        );
      }
    }
  }
  const event: RunEventInput = {
    actor_session_ref: metadata.actor_session_ref,
    attempt_id: attemptId,
    event_type: "attempt_started",
    payload: { attempt_ref: attemptId },
    recorded_at: metadata.started_at,
  };
  if (existing !== undefined) {
    ensureRunEvent(workspaceDir, runId, event);
    const attemptRoot = `runs/${runId}/attempts/${attemptId}`;
    const packetExists = existsSync(
      resolveContained(workspaceDir, `${attemptRoot}/packet.json`),
    );
    const ledgerExists = existsSync(
      resolveContained(workspaceDir, `${attemptRoot}/ledger.jsonl`),
    );
    const validation = packetExists
      ? validateAttempt(workspaceDir, runId, attemptId)
      : ledgerExists
        ? validateResume(workspaceDir, runId, attemptId)
        : validateAttemptStart(workspaceDir, runId, attemptId);
    requireValidLifecycle(validation, "attempt start recovery");
    return;
  }
  preflightTransition(
    workspaceDir,
    runId,
    attemptId,
    null,
    event,
    "started",
    "attempt start",
  );
  ensureRunEvent(workspaceDir, runId, event);
  requireValidLifecycle(
    validateAttemptStart(workspaceDir, runId, attemptId),
    "attempt start",
  );
}

export function buildSubmissionObject(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  metadata: SubmissionMetadata,
): Record<string, unknown> {
  const validation = validateAttempt(workspaceDir, runId, attemptId, {
    phase: "candidate",
  });
  if (!validation.valid) {
    throw new Error(formatValidationFailure("pre-submission", validation.errors));
  }

  const runRoot = `runs/${runId}`;
  const attemptRoot = `${runRoot}/attempts/${attemptId}`;
  const activation = readNormalizedJson<ActivationForBuild>(
    workspaceDir,
    `${runRoot}/activation.json`,
  );
  const inputs = readNormalizedJson<InputsForBuild>(
    workspaceDir,
    `${runRoot}/inputs.json`,
  );
  const job = readYaml<JobForBuild>(workspaceDir, activation.job_ref.path);
  const ledger = parseLedgerJsonl(
    readBytes(workspaceDir, `${attemptRoot}/ledger.jsonl`),
  );
  const last = ledger.at(-1);
  if (last === undefined) {
    throw new Error("cannot submit an empty ledger");
  }

  const artifacts: ArtifactDigest[] = [
    canonicalArtifact(
      workspaceDir,
      "authority_decision",
      activation.ops_decision_ref.path,
    ),
    canonicalArtifact(
      workspaceDir,
      "activation",
      `${runRoot}/activation.json`,
    ),
    canonicalArtifact(workspaceDir, "inputs", `${runRoot}/inputs.json`),
    rawArtifact(workspaceDir, "job", activation.job_ref.path),
    rawArtifact(workspaceDir, "ledger", `${attemptRoot}/ledger.jsonl`),
    canonicalArtifact(
      workspaceDir,
      "packet_json",
      `${attemptRoot}/packet.json`,
    ),
    rawArtifact(
      workspaceDir,
      "packet_markdown",
      `${attemptRoot}/packet.md`,
    ),
  ];

  const sources = inputs.sources.map((source) => ({
    source_object_id: source.source_object_id,
    metadata: canonicalArtifact(
      workspaceDir,
      "source_metadata",
      source.metadata_path,
    ),
    content:
      source.content_path === null
        ? null
        : rawArtifact(
            workspaceDir,
            "source_content",
            source.content_path,
          ),
  }));

  return {
    schema_version: "research-submission/v0",
    synthetic_fixture: activation.synthetic_fixture,
    job_id: job.job_id,
    job_version: job.job_version,
    run_id: runId,
    attempt_id: attemptId,
    submitted_at: metadata.submitted_at,
    executor_session: {
      actor_session_ref: metadata.actor_session_ref,
      role: "executor",
      provider_declared: metadata.provider_declared,
      model_declared: metadata.model_declared,
      observed_by: metadata.observed_by,
    },
    artifacts,
    sources,
    ledger_head: {
      event_id: last.event_id,
      event_hash: last.event_hash,
      event_count: ledger.length,
    },
    validation: {
      result: "pass",
      validated_at: metadata.validated_at,
    },
    canonicalization_version: VERSIONS.canonicalJson,
    raw_hash_version: VERSIONS.rawHash,
    json_file_version: VERSIONS.jsonFile,
    validator_version: VERSIONS.validator,
    renderer_version: VERSIONS.renderer,
  };
}

export function createSubmission(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  metadata: SubmissionMetadata,
): Sha256Digest {
  const path = `runs/${runId}/attempts/${attemptId}/submission.json`;
  const artifactExists = exists(workspaceDir, path);
  let value: Record<string, unknown>;
  if (artifactExists) {
    value = readNormalizedJson<Record<string, unknown>>(workspaceDir, path);
    assertSubmissionMetadata(value, metadata, path);
    requireRecoverableLifecycle(
      validateAttempt(workspaceDir, runId, attemptId, {
        phase: "submitted",
      }),
      "submission",
    );
  } else {
    value = buildSubmissionObject(workspaceDir, runId, attemptId, metadata);
  }
  const digest = sha256CanonicalJson(value);
  const activation = readNormalizedJson<ActivationForBuild>(
    workspaceDir,
    `runs/${runId}/activation.json`,
  );
  const event: RunEventInput = {
    actor_session_ref: resolveRunEventActor(
      metadata.run_event_actor_session_ref,
      activation,
      "submission",
    ),
    attempt_id: attemptId,
    event_type: "attempt_submitted",
    payload: {
      attempt_ref: attemptId,
      submission_ref: path,
      artifact_digest: digest,
    },
    recorded_at: metadata.submitted_at,
  };
  preflightTransition(
    workspaceDir,
    runId,
    attemptId,
    artifactExists ? null : { path, value },
    event,
    "submitted",
    "submission",
  );
  if (!artifactExists) {
    writeJsonCreateOnly(workspaceDir, path, value);
  }
  ensureRunEvent(workspaceDir, runId, event);
  requireValidLifecycle(
    validateAttempt(workspaceDir, runId, attemptId, {
      phase: "submitted",
    }),
    "submission",
  );
  return digest;
}

export function buildReviewObject(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  metadata: ReviewMetadata,
): Record<string, unknown> {
  const validation = validateAttempt(workspaceDir, runId, attemptId, {
    phase: "submitted",
  });
  if (!validation.valid) {
    throw new Error(formatValidationFailure("pre-review", validation.errors));
  }
  const runRoot = `runs/${runId}`;
  const attemptRoot = `${runRoot}/attempts/${attemptId}`;
  const activation = readNormalizedJson<ActivationForBuild>(
    workspaceDir,
    `${runRoot}/activation.json`,
  );
  const job = readYaml<JobForBuild>(workspaceDir, activation.job_ref.path);
  const submission = readNormalizedJson(
    workspaceDir,
    `${attemptRoot}/submission.json`,
  );

  return {
    schema_version: "research-review/v0",
    synthetic_fixture: activation.synthetic_fixture,
    review_id: metadata.review_id,
    job_id: job.job_id,
    job_version: job.job_version,
    run_id: runId,
    attempt_id: attemptId,
    reviewed_at: metadata.reviewed_at,
    submission_ref: {
      path: `${attemptRoot}/submission.json`,
      digest: sha256CanonicalJson(submission),
      digest_mode: VERSIONS.canonicalJson,
    },
    reviewer: {
      actor_session_ref: metadata.actor_session_ref,
      role: "reviewer",
      provider_declared: metadata.provider_declared,
      model_declared: metadata.model_declared,
      fresh_context: true,
      independence_basis: metadata.independence_basis,
      independence_limits: metadata.independence_limits,
    },
    substantive: metadata.substantive,
    protocol: metadata.protocol,
    overall_verdict: metadata.overall_verdict,
    candidate_modifications_made: false,
    limitations: metadata.limitations,
    canonicalization_version: VERSIONS.canonicalJson,
    json_file_version: VERSIONS.jsonFile,
    validator_version: VERSIONS.validator,
  };
}

export function createReview(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  metadata: ReviewMetadata,
): Sha256Digest {
  const path = `runs/${runId}/attempts/${attemptId}/review.json`;
  const artifactExists = exists(workspaceDir, path);
  let value: Record<string, unknown>;
  if (artifactExists) {
    value = readNormalizedJson<Record<string, unknown>>(workspaceDir, path);
    assertReviewMetadata(value, metadata, path);
    requireRecoverableLifecycle(
      validateAttempt(workspaceDir, runId, attemptId, {
        phase: "reviewed",
      }),
      "review",
    );
  } else {
    value = buildReviewObject(workspaceDir, runId, attemptId, metadata);
  }
  const digest = sha256CanonicalJson(value);
  const activation = readNormalizedJson<ActivationForBuild>(
    workspaceDir,
    `runs/${runId}/activation.json`,
  );
  const event: RunEventInput = {
    actor_session_ref: resolveRunEventActor(
      metadata.run_event_actor_session_ref,
      activation,
      "review",
    ),
    attempt_id: attemptId,
    event_type: "review_returned",
    payload: {
      attempt_ref: attemptId,
      review_ref: path,
      artifact_digest: digest,
    },
    recorded_at: metadata.reviewed_at,
  };
  preflightTransition(
    workspaceDir,
    runId,
    attemptId,
    artifactExists ? null : { path, value },
    event,
    "reviewed",
    "review",
  );
  if (!artifactExists) {
    writeJsonCreateOnly(workspaceDir, path, value);
  }
  ensureRunEvent(workspaceDir, runId, event);
  requireValidLifecycle(
    validateAttempt(workspaceDir, runId, attemptId, {
      phase: "reviewed",
    }),
    "review",
  );
  return digest;
}

export function buildSealObject(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  metadata: SealMetadata,
): Record<string, unknown> {
  const runRoot = `runs/${runId}`;
  const attemptRoot = `${runRoot}/attempts/${attemptId}`;
  const reviewPath = `${attemptRoot}/review.json`;
  const hasReview = exists(workspaceDir, reviewPath);
  const validation = validateAttempt(workspaceDir, runId, attemptId, {
    phase: hasReview ? "reviewed" : "submitted",
  });
  if (!validation.valid) {
    throw new Error(formatValidationFailure("pre-seal", validation.errors));
  }
  const activation = readNormalizedJson<ActivationForBuild>(
    workspaceDir,
    `${runRoot}/activation.json`,
  );
  const job = readYaml<JobForBuild>(workspaceDir, activation.job_ref.path);
  const packet = readNormalizedJson<ResearchPacket>(
    workspaceDir,
    `${attemptRoot}/packet.json`,
  );
  const submission = readNormalizedJson(
    workspaceDir,
    `${attemptRoot}/submission.json`,
  );
  const review = hasReview
    ? readNormalizedJson<{ overall_verdict: string }>(
        workspaceDir,
        reviewPath,
      )
    : null;
  if (
    review === null &&
    (packet.process_terminal === "completed" ||
      packet.completion !== "blocked")
  ) {
    throw new Error(
      "review-not-reached sealing is limited to non-completed blocked attempts",
    );
  }
  const reviewVerdict = review?.overall_verdict ?? "not_reached";
  const successorAttemptId = metadata.successor_attempt_id ?? null;
  const successorDecisionRef = metadata.successor_decision_ref ?? null;
  const successorLinkedAt = metadata.successor_linked_at ?? null;
  if (
    successorAttemptId !== null &&
    (!isSafeId(successorAttemptId) ||
      successorAttemptId === attemptId ||
      !["blocked", "rework_required"].includes(reviewVerdict))
  ) {
    throw new Error(
      "successor_attempt_id requires a distinct safe ID and a blocked or rework-required review",
    );
  }
  if (
    (successorAttemptId === null) !==
      (successorDecisionRef === null && successorLinkedAt === null)
  ) {
    throw new Error(
      "successor_attempt_id, successor_decision_ref, and successor_linked_at must be provided together",
    );
  }
  if (
    successorAttemptId !== null &&
    (successorDecisionRef === null ||
      successorDecisionRef.trim().length === 0 ||
      successorLinkedAt === null ||
      isAfter(metadata.sealed_at, successorLinkedAt))
  ) {
    throw new Error(
      "successor link requires a non-empty Ops decision reference and a timestamp at or after sealed_at",
    );
  }

  return {
    schema_version: "research-seal/v0",
    synthetic_fixture: activation.synthetic_fixture,
    job_id: job.job_id,
    job_version: job.job_version,
    run_id: runId,
    attempt_id: attemptId,
    sealed_at: metadata.sealed_at,
    submission_ref: {
      path: `${attemptRoot}/submission.json`,
      digest: sha256CanonicalJson(submission),
      digest_mode: VERSIONS.canonicalJson,
    },
    review_ref:
      review === null
        ? null
        : {
            path: reviewPath,
            digest: sha256CanonicalJson(review),
            digest_mode: VERSIONS.canonicalJson,
          },
    terminal_state: {
      process_terminal: packet.process_terminal,
      review_verdict: reviewVerdict,
      attempt_state: "sealed",
    },
    archive_policy: {
      retention: "repository_history",
      redaction: "none_required",
      reportability: job.reportability,
    },
    authority_state: "unpromoted",
    downstream_authority: "none",
    predecessor_attempt_ref: metadata.predecessor_attempt_ref,
    successor_attempt_ref: null,
    canonicalization_version: VERSIONS.canonicalJson,
    raw_hash_version: VERSIONS.rawHash,
    json_file_version: VERSIONS.jsonFile,
    validator_version: VERSIONS.validator,
    renderer_version: VERSIONS.renderer,
  };
}

export function createSeal(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  metadata: SealMetadata,
): Sha256Digest {
  const path = `runs/${runId}/attempts/${attemptId}/seal.json`;
  const artifactExists = exists(workspaceDir, path);
  let value: Record<string, unknown>;
  if (artifactExists) {
    value = readNormalizedJson<Record<string, unknown>>(workspaceDir, path);
    assertSealMetadata(value, metadata, path);
    requireRecoverableLifecycle(
      validateAttempt(workspaceDir, runId, attemptId, {
        phase: "sealed",
      }),
      "seal",
    );
  } else {
    value = buildSealObject(workspaceDir, runId, attemptId, metadata);
  }
  const digest = sha256CanonicalJson(value);
  const activation = readNormalizedJson<ActivationForBuild>(
    workspaceDir,
    `runs/${runId}/activation.json`,
  );
  const actorSessionRef =
    resolveRunEventActor(metadata.actor_session_ref, activation, "seal");
  const terminalState = readObject(value, "terminal_state", path);
  const reviewVerdict = readString(
    terminalState,
    "review_verdict",
    path,
  );
  const successorAttemptId = metadata.successor_attempt_id ?? null;
  const successorDecisionRef = metadata.successor_decision_ref ?? null;
  const successorLinkedAt = metadata.successor_linked_at ?? null;
  if (
    successorAttemptId !== null &&
    !["blocked", "rework_required"].includes(reviewVerdict)
  ) {
    throw new Error(
      "successor_attempt_id conflicts with the frozen seal review verdict",
    );
  }
  if (
    (successorAttemptId === null) !==
      (successorDecisionRef === null && successorLinkedAt === null)
  ) {
    throw new Error(
      "successor_attempt_id, successor_decision_ref, and successor_linked_at must be provided together",
    );
  }
  if (
    successorAttemptId !== null &&
    (successorDecisionRef === null ||
      successorDecisionRef.trim().length === 0 ||
      successorLinkedAt === null ||
      isAfter(metadata.sealed_at, successorLinkedAt))
  ) {
    throw new Error(
      "successor link requires a non-empty Ops decision reference and a timestamp at or after sealed_at",
    );
  }
  let event: RunEventInput | null = null;
  if (successorAttemptId === null) {
    if (reviewVerdict !== "rework_required") {
      event = {
        actor_session_ref: actorSessionRef,
        attempt_id: attemptId,
        event_type: "run_closed",
        payload: {
          attempt_ref: attemptId,
          terminal_state: readString(
            terminalState,
            "process_terminal",
            path,
          ),
          artifact_digest: digest,
        },
        recorded_at: metadata.sealed_at,
      };
    }
  } else {
    if (successorDecisionRef === null || successorLinkedAt === null) {
      throw new Error("successor link metadata is incomplete");
    }
    event = {
      actor_session_ref: actorSessionRef,
      attempt_id: attemptId,
      event_type: "successor_link",
      payload: {
        predecessor_attempt_ref: attemptId,
        successor_attempt_ref: successorAttemptId,
        decision_ref: successorDecisionRef,
        artifact_digest: digest,
      },
      recorded_at: successorLinkedAt,
    };
  }
  preflightTransition(
    workspaceDir,
    runId,
    attemptId,
    artifactExists ? null : { path, value },
    event,
    "sealed",
    "seal",
  );
  if (!artifactExists) {
    writeJsonCreateOnly(workspaceDir, path, value);
  }
  if (event !== null) {
    ensureRunEvent(workspaceDir, runId, event);
  }
  requireValidLifecycle(
    validateAttempt(workspaceDir, runId, attemptId, {
      phase: "sealed",
    }),
    "seal",
  );
  return digest;
}

export function buildSyntheticFixture(
  workspaceDir: string,
  runId: string,
  attemptId: string,
): BuiltFixture {
  const activation = readNormalizedJson<ActivationForBuild>(
    workspaceDir,
    `runs/${runId}/activation.json`,
  );
  const job = readYaml<JobForBuild>(workspaceDir, activation.job_ref.path);
  if (!activation.synthetic_fixture || !job.synthetic_fixture) {
    throw new Error(
      "fixture builder requires an explicitly synthetic job and activation",
    );
  }
  const attemptRoot = `runs/${runId}/attempts/${attemptId}`;
  const packet = readNormalizedJson<ResearchPacket>(
    workspaceDir,
    `${attemptRoot}/packet.json`,
  );
  ensureText(
    workspaceDir,
    `${attemptRoot}/packet.md`,
    renderPacketMarkdown(packet),
  );
  const submissionDigest = createSubmission(
    workspaceDir,
    runId,
    attemptId,
    SYNTHETIC_SUBMISSION,
  );
  const reviewDigest = createReview(
    workspaceDir,
    runId,
    attemptId,
    SYNTHETIC_REVIEW,
  );
  const archiveId = createSeal(
    workspaceDir,
    runId,
    attemptId,
    SYNTHETIC_SEAL,
  );

  const final = validateAttempt(workspaceDir, runId, attemptId, {
    phase: "sealed",
    requireEndToEnd: true,
  });
  if (!final.valid || final.archive_id === null) {
    throw new Error(formatValidationFailure("sealed fixture", final.errors));
  }

  return {
    submission_digest: submissionDigest,
    review_digest: reviewDigest,
    archive_id: archiveId,
  };
}

const SYNTHETIC_SUBMISSION: SubmissionMetadata = {
  submitted_at: "2026-01-15T12:30:00Z",
  validated_at: "2026-01-15T12:29:00Z",
  actor_session_ref: "actor-executor-001",
  provider_declared: "deterministic-synthetic-fixture",
  model_declared: "none",
  observed_by: "fixture-builder",
  run_event_actor_session_ref: "actor-orchestrator-001",
};

const SYNTHETIC_REVIEW: ReviewMetadata = {
  review_id: "synthetic-review-001",
  reviewed_at: "2026-01-15T12:35:00Z",
  actor_session_ref: "actor-reviewer-001",
  provider_declared: "deterministic-synthetic-fixture",
  model_declared: "none",
  independence_basis:
    "Fresh synthetic reviewer context receives only the frozen submission.",
  independence_limits: [
    "The fixture tests protocol binding, not empirical truth or reviewer competence.",
  ],
  substantive: {
    verdict: "pass",
    rationale:
      "The fictional threshold claim represents its admitted supporting and contrary observations.",
    findings: [],
  },
  protocol: {
    verdict: "pass",
    rationale:
      "The synthetic claim is traceable to admitted bytes, a calculation, and an explicit challenge.",
    findings: [],
  },
  overall_verdict: "pass",
  run_event_actor_session_ref: "actor-orchestrator-001",
  limitations: [
    "This deterministic fixture is non-football-authoritative and grants no downstream authority.",
  ],
};

const SYNTHETIC_SEAL: SealMetadata = {
  actor_session_ref: "actor-orchestrator-001",
  sealed_at: "2026-01-15T12:36:00Z",
  predecessor_attempt_ref: null,
  successor_attempt_id: null,
  successor_decision_ref: null,
  successor_linked_at: null,
};

interface RunEventInput {
  actor_session_ref: string;
  attempt_id: string;
  event_type:
    | "attempt_started"
    | "attempt_submitted"
    | "review_returned"
    | "run_closed"
    | "successor_link";
  payload: Record<string, unknown>;
  recorded_at: string;
}

interface ProspectiveJsonArtifact {
  path: string;
  value: Record<string, unknown>;
}

type TransitionPhase =
  | "candidate"
  | "reviewed"
  | "sealed"
  | "started"
  | "submitted";

/**
 * Validate the exact prospective artifact/event pair in an isolated,
 * run-scoped shadow workspace before touching governed bytes.
 *
 * The active run, authority/job receipts, and any externally pinned input
 * artifacts are the complete validator read set. Single-writer authority then
 * makes the real create-only write plus append a deterministic commit of the
 * already validated transition.
 */
function preflightTransition(
  workspaceDir: string,
  runId: string,
  attemptId: string,
  artifact: ProspectiveJsonArtifact | null,
  event: RunEventInput | null,
  phase: TransitionPhase,
  label: string,
): void {
  const parent = mkdtempSync(join(tmpdir(), "tiber-research-preflight-"));
  const shadow = join(parent, "workspace");
  mkdirSync(shadow);
  try {
    const runRoot = `runs/${runId}`;
    copyRelative(workspaceDir, shadow, runRoot);
    const activation = readNormalizedJson<ActivationForBuild>(
      workspaceDir,
      `${runRoot}/activation.json`,
    );
    for (const path of [
      activation.job_ref.path,
      activation.ops_decision_ref.path,
    ]) {
      if (path === runRoot || path.startsWith(`${runRoot}/`)) {
        continue;
      }
      copyRelative(workspaceDir, shadow, path);
    }
    if (artifact !== null) {
      writeJsonCreateOnly(shadow, artifact.path, artifact.value);
    }
    if (event !== null) {
      ensureRunEvent(shadow, runId, event);
    }
    const validation =
      phase === "started"
        ? validateAttemptStart(shadow, runId, attemptId)
        : validateAttempt(shadow, runId, attemptId, { phase });
    requireValidLifecycle(validation, `${label} preflight`);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function copyRelative(
  sourceWorkspace: string,
  targetWorkspace: string,
  relativePath: string,
): void {
  const source = resolveContained(sourceWorkspace, relativePath);
  const target = resolveContained(targetWorkspace, relativePath);
  if (existsSync(target)) {
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  const sourceStats = lstatSync(source);
  if (sourceStats.isSymbolicLink()) {
    throw new Error(`preflight refuses symbolic link: ${relativePath}`);
  }
  cpSync(source, target, {
    recursive: sourceStats.isDirectory(),
    errorOnExist: true,
  });
}

function ensureRunEvent(
  workspaceDir: string,
  runId: string,
  input: RunEventInput,
): void {
  const path = `runs/${runId}/run-events.jsonl`;
  const activation = readNormalizedJson<ActivationForBuild>(
    workspaceDir,
    `runs/${runId}/activation.json`,
  );
  const events = parseLedgerJsonl(readBytes(workspaceDir, path));
  const matches = events.filter(
    (event) =>
      event.event_type === input.event_type &&
      event.attempt_id === input.attempt_id,
  );
  if (matches.length > 1) {
    throw new Error(
      `${path}: multiple ${input.event_type} events exist for ${input.attempt_id}`,
    );
  }
  if (matches.length === 1) {
    const existing = matches[0];
    if (existing === undefined) {
      throw new Error(`${path}: internal run-event lookup failure`);
    }
    const prior =
      existing.sequence === 1
        ? null
        : events[existing.sequence - 2]?.event_hash;
    const expected = finalizeLedgerEvent({
      schema_version: "research-run-event/v0",
      synthetic_fixture: activation.synthetic_fixture,
      run_id: runId,
      attempt_id: input.attempt_id,
      actor_session_ref: input.actor_session_ref,
      event_id: runEventId(existing.sequence, input.event_type),
      event_type: input.event_type,
      recorded_at: input.recorded_at,
      sequence: existing.sequence,
      previous_event_hash: prior ?? null,
      payload: input.payload,
    });
    if (canonicalizeJson(existing) !== canonicalizeJson(expected)) {
      throw new Error(
        `${path}: existing frozen ${input.event_type} event differs from the requested exact binding`,
      );
    }
    return;
  }

  const last = events.at(-1);
  if (last === undefined) {
    throw new Error(`${path}: activation event is missing`);
  }
  if (isAfter(last.recorded_at, input.recorded_at)) {
    throw new Error(
      `${path}: ${input.event_type} recorded_at would regress run chronology`,
    );
  }
  const sequence = events.length + 1;
  const event = finalizeLedgerEvent({
    schema_version: "research-run-event/v0",
    synthetic_fixture: activation.synthetic_fixture,
    run_id: runId,
    attempt_id: input.attempt_id,
    actor_session_ref: input.actor_session_ref,
    event_id: runEventId(sequence, input.event_type),
    event_type: input.event_type,
    recorded_at: input.recorded_at,
    sequence,
    previous_event_hash: last.event_hash,
    payload: input.payload,
  });
  appendUtf8(workspaceDir, path, `${canonicalizeJson(event)}\n`);
}

function runEventId(sequence: number, eventType: string): string {
  return `run-event-${String(sequence).padStart(3, "0")}-${eventType.replaceAll("_", "-")}`;
}

function resolveRunEventActor(
  declared: string | undefined,
  activation: ActivationForBuild,
  artifact: string,
): string {
  const actor =
    declared ??
    (activation.synthetic_fixture ? "actor-orchestrator-001" : "");
  if (!isSafeId(actor)) {
    throw new Error(
      `${artifact} metadata must provide a safe run-event actor session reference`,
    );
  }
  return actor;
}

function requireRecoverableLifecycle(
  report: ReturnType<typeof validateAttempt>,
  artifact: string,
): void {
  if (report.valid) {
    return;
  }
  if (
    report.errors.length > 0 &&
    report.errors.every(
      (error) => error.code === "run_event.lifecycle_missing",
    )
  ) {
    return;
  }
  throw new Error(formatValidationFailure(`${artifact} recovery`, report.errors));
}

function requireValidLifecycle(
  report: ReturnType<typeof validateAttempt>,
  artifact: string,
): void {
  if (!report.valid) {
    throw new Error(formatValidationFailure(`post-${artifact}`, report.errors));
  }
}

function assertSubmissionMetadata(
  value: Record<string, unknown>,
  metadata: SubmissionMetadata,
  path: string,
): void {
  const executor = readObject(value, "executor_session", path);
  const validation = readObject(value, "validation", path);
  assertMetadataValues(path, [
    ["submitted_at", value.submitted_at, metadata.submitted_at],
    [
      "executor_session.actor_session_ref",
      executor.actor_session_ref,
      metadata.actor_session_ref,
    ],
    [
      "executor_session.provider_declared",
      executor.provider_declared,
      metadata.provider_declared,
    ],
    [
      "executor_session.model_declared",
      executor.model_declared,
      metadata.model_declared,
    ],
    [
      "executor_session.observed_by",
      executor.observed_by,
      metadata.observed_by,
    ],
    [
      "validation.validated_at",
      validation.validated_at,
      metadata.validated_at,
    ],
  ]);
}

function assertReviewMetadata(
  value: Record<string, unknown>,
  metadata: ReviewMetadata,
  path: string,
): void {
  const reviewer = readObject(value, "reviewer", path);
  assertMetadataValues(path, [
    ["review_id", value.review_id, metadata.review_id],
    ["reviewed_at", value.reviewed_at, metadata.reviewed_at],
    [
      "reviewer.actor_session_ref",
      reviewer.actor_session_ref,
      metadata.actor_session_ref,
    ],
    [
      "reviewer.provider_declared",
      reviewer.provider_declared,
      metadata.provider_declared,
    ],
    [
      "reviewer.model_declared",
      reviewer.model_declared,
      metadata.model_declared,
    ],
    [
      "reviewer.independence_basis",
      reviewer.independence_basis,
      metadata.independence_basis,
    ],
    [
      "reviewer.independence_limits",
      reviewer.independence_limits,
      metadata.independence_limits,
    ],
    ["substantive", value.substantive, metadata.substantive],
    ["protocol", value.protocol, metadata.protocol],
    ["overall_verdict", value.overall_verdict, metadata.overall_verdict],
    ["limitations", value.limitations, metadata.limitations],
  ]);
}

function assertSealMetadata(
  value: Record<string, unknown>,
  metadata: SealMetadata,
  path: string,
): void {
  assertMetadataValues(path, [
    ["sealed_at", value.sealed_at, metadata.sealed_at],
    [
      "predecessor_attempt_ref",
      value.predecessor_attempt_ref,
      metadata.predecessor_attempt_ref,
    ],
  ]);
}

function assertMetadataValues(
  path: string,
  fields: Array<[string, unknown, unknown]>,
): void {
  for (const [field, actual, expected] of fields) {
    if (sha256CanonicalJson(actual) !== sha256CanonicalJson(expected)) {
      throw new Error(
        `${path}: existing frozen ${field} differs from requested metadata`,
      );
    }
  }
}

function readObject(
  value: Record<string, unknown>,
  field: string,
  path: string,
): Record<string, unknown> {
  const member = value[field];
  if (member === null || typeof member !== "object" || Array.isArray(member)) {
    throw new Error(`${path}.${field}: expected object`);
  }
  return member as Record<string, unknown>;
}

function readString(
  value: Record<string, unknown>,
  field: string,
  path: string,
): string {
  const member = value[field];
  if (typeof member !== "string") {
    throw new Error(`${path}.${field}: expected string`);
  }
  return member;
}

function exists(workspaceDir: string, path: string): boolean {
  try {
    return existsSync(resolveContained(workspaceDir, path));
  } catch {
    return false;
  }
}

function isSafeId(value: string): boolean {
  return /^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*$/u.test(value);
}

function canonicalArtifact(
  workspaceDir: string,
  artifactType: string,
  path: string,
): ArtifactDigest {
  return {
    artifact_type: artifactType,
    path,
    digest: sha256CanonicalJson(readNormalizedJson(workspaceDir, path)),
    digest_mode: VERSIONS.canonicalJson,
  };
}

function rawArtifact(
  workspaceDir: string,
  artifactType: string,
  path: string,
): ArtifactDigest {
  return {
    artifact_type: artifactType,
    path,
    digest: sha256Raw(readBytes(workspaceDir, path)),
    digest_mode: VERSIONS.rawHash,
  };
}

function ensureText(
  workspaceDir: string,
  path: string,
  expected: string,
): void {
  const absolute = resolveContained(workspaceDir, path);
  if (existsSync(absolute)) {
    const actual = readUtf8(workspaceDir, path);
    if (actual !== expected) {
      throw new Error(`${path}: existing generated bytes differ`);
    }
    return;
  }
  writeUtf8CreateOnly(workspaceDir, path, expected);
}

function ensureJson(
  workspaceDir: string,
  path: string,
  expected: unknown,
): void {
  const text = normalizedJsonText(expected);
  ensureText(workspaceDir, path, text);
}

function formatValidationFailure(
  stage: string,
  errors: Array<{ code: string; path: string; message: string }>,
): string {
  return `${stage} validation failed:\n${errors
    .map((error) => `- [${error.code}] ${error.path}: ${error.message}`)
    .join("\n")}`;
}
