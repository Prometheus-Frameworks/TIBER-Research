import assert from "node:assert/strict";
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { canonicalizeJson } from "../src/canonical.js";
import {
  buildSyntheticFixture,
  createAttemptStart,
  createReview,
  createSeal,
  createSubmission,
  type ReviewMetadata,
  type SubmissionMetadata,
} from "../src/build.js";
import { sha256CanonicalJson, sha256Raw } from "../src/digest.js";
import { writeJson, writeUtf8 } from "../src/io.js";
import { finalizeLedgerEvent } from "../src/ledger.js";
import {
  renderPacketMarkdown,
  type ResearchPacket,
} from "../src/renderer.js";
import {
  validateAttempt,
  validateResume,
  type ValidationOptions,
  type ValidationReport,
} from "../src/validator.js";

const FIXTURE = resolve("fixtures/synthetic-complete");
const RUN_ID = "run-synthetic-001";
const ATTEMPT_ID = "attempt-001";
const AUTHORITY_DECISION = "authority/decision.json";
const RUN_ROOT = `runs/${RUN_ID}`;
const ATTEMPT_ROOT = `${RUN_ROOT}/attempts/${ATTEMPT_ID}`;
const ACTIVATION = `${RUN_ROOT}/activation.json`;
const INPUTS = `${RUN_ROOT}/inputs.json`;
const RUN_EVENTS = `${RUN_ROOT}/run-events.jsonl`;
const LEDGER = `${ATTEMPT_ROOT}/ledger.jsonl`;
const PACKET = `${ATTEMPT_ROOT}/packet.json`;
const PACKET_MD = `${ATTEMPT_ROOT}/packet.md`;
const SUBMISSION = `${ATTEMPT_ROOT}/submission.json`;
const REVIEW = `${ATTEMPT_ROOT}/review.json`;
const SEAL = `${ATTEMPT_ROOT}/seal.json`;
const SOURCE_ROOT = `${RUN_ROOT}/sources/source-synthetic-bench-001`;
const SOURCE_METADATA = `${SOURCE_ROOT}/metadata.json`;
const SOURCE_CONTENT = `${SOURCE_ROOT}/content`;

type JsonObject = Record<string, any>;

function withFixture<T>(action: (root: string) => T): T {
  const parent = mkdtempSync(join(tmpdir(), "tiber-research-contract-"));
  const root = join(parent, "workspace");
  cpSync(FIXTURE, root, { recursive: true });
  try {
    return action(root);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function absolute(root: string, relativePath: string): string {
  return join(root, ...relativePath.split("/"));
}

function json<T = JsonObject>(root: string, path: string): T {
  return JSON.parse(readFileSync(absolute(root, path), "utf8")) as T;
}

function mutateJson(
  root: string,
  path: string,
  mutate: (value: JsonObject) => void,
): void {
  const value = json(root, path);
  mutate(value);
  writeJson(root, path, value);
}

function mutatePacket(
  root: string,
  mutate: (packet: JsonObject) => void,
): void {
  const packet = json(root, PACKET);
  mutate(packet);
  writeJson(root, PACKET, packet);
  writeUtf8(
    root,
    PACKET_MD,
    renderPacketMarkdown(packet as ResearchPacket),
  );
}

function readJsonl(root: string, path: string): JsonObject[] {
  return readFileSync(absolute(root, path), "utf8")
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as JsonObject);
}

function eventAt(events: JsonObject[], index: number): JsonObject {
  const event = events[index];
  assert.ok(event, `expected event at index ${index}`);
  return event;
}

function writeRechainedJsonl(
  root: string,
  path: string,
  events: JsonObject[],
): void {
  let previous: string | null = null;
  const records = events.map((event, index) => {
    const { event_hash: _eventHash, ...projection } = event;
    if (
      projection.event_type === "checkpoint" &&
      projection.payload !== null &&
      typeof projection.payload === "object"
    ) {
      (projection.payload as JsonObject).ledger_head_before_checkpoint =
        previous;
    }
    const finalized = finalizeLedgerEvent({
      ...projection,
      sequence: index + 1,
      previous_event_hash: previous,
    });
    previous = finalized.event_hash;
    return canonicalizeJson(finalized);
  });
  writeFileSync(absolute(root, path), `${records.join("\n")}\n`, "utf8");
}

function writeCoherentRechainedLedger(
  root: string,
  path: string,
  events: JsonObject[],
): void {
  let previous: string | null = null;
  const eventHashes = new Map<string, string>();
  const records = events.map((event, index) => {
    const { event_hash: _eventHash, ...projection } = event;
    if (
      projection.event_type === "calculation" &&
      projection.payload !== null &&
      typeof projection.payload === "object" &&
      Array.isArray(projection.payload.input_refs) &&
      Array.isArray(projection.payload.input_hashes)
    ) {
      projection.payload.input_hashes = projection.payload.input_refs.map(
        (reference: string, inputIndex: number) =>
          eventHashes.get(reference) ??
          projection.payload.input_hashes[inputIndex],
      );
    }
    if (
      projection.event_type === "checkpoint" &&
      projection.payload !== null &&
      typeof projection.payload === "object"
    ) {
      projection.payload.ledger_head_before_checkpoint = previous;
    }
    const finalized = finalizeLedgerEvent({
      ...projection,
      sequence: index + 1,
      previous_event_hash: previous,
    });
    previous = finalized.event_hash;
    eventHashes.set(projection.event_id as string, finalized.event_hash);
    return canonicalizeJson(finalized);
  });
  writeFileSync(absolute(root, path), `${records.join("\n")}\n`, "utf8");
}

function lifecycleTime(minute: number): string {
  return `2026-01-15T13:${String(minute).padStart(2, "0")}:00Z`;
}

function lifecycleSubmissionMetadata(
  actorSuffix: string,
  validatedMinute: number,
  submittedMinute: number,
): SubmissionMetadata {
  return {
    actor_session_ref: `actor-executor-${actorSuffix}`,
    model_declared: "none",
    observed_by: "lifecycle-regression",
    provider_declared: "deterministic-synthetic-fixture",
    run_event_actor_session_ref: "actor-orchestrator-001",
    submitted_at: lifecycleTime(submittedMinute),
    validated_at: lifecycleTime(validatedMinute),
  };
}

function lifecycleReviewMetadata(
  actorSuffix: string,
  reviewedMinute: number,
  verdict: "pass" | "rework_required",
): ReviewMetadata {
  return {
    actor_session_ref: `actor-reviewer-${actorSuffix}`,
    independence_basis:
      "Fresh synthetic lifecycle-regression context receives only the frozen submission.",
    independence_limits: [
      "This review exercises protocol lifecycle behavior only.",
    ],
    limitations: [
      "The fixture is synthetic and grants no downstream authority.",
    ],
    model_declared: "none",
    overall_verdict: verdict,
    protocol: {
      findings: [],
      rationale: "The frozen submission satisfies the synthetic protocol checks.",
      verdict: "pass",
    },
    provider_declared: "deterministic-synthetic-fixture",
    review_id: `lifecycle-review-${actorSuffix}`,
    reviewed_at: lifecycleTime(reviewedMinute),
    run_event_actor_session_ref: "actor-orchestrator-001",
    substantive: {
      findings:
        verdict === "rework_required"
          ? ["A separately authorized successor should address the bounded concern."]
          : [],
      rationale:
        verdict === "rework_required"
          ? "The bounded result requires one successor attempt before acceptance."
          : "The bounded synthetic result is supported.",
      verdict,
    },
  };
}

function prepareSuccessorCandidate(
  root: string,
  sourceAttemptId: string,
  successorAttemptId: string,
  actorSuffix: string,
  firstLedgerMinute: number,
): void {
  const sourceRoot = `${RUN_ROOT}/attempts/${sourceAttemptId}`;
  const successorRoot = `${RUN_ROOT}/attempts/${successorAttemptId}`;
  cpSync(
    absolute(root, sourceRoot),
    absolute(root, successorRoot),
    { recursive: true },
  );
  for (const filename of ["submission.json", "review.json", "seal.json"]) {
    rmSync(absolute(root, `${successorRoot}/${filename}`), { force: true });
  }

  const ledgerPath = `${successorRoot}/ledger.jsonl`;
  const events = readJsonl(root, ledgerPath);
  for (const [index, event] of events.entries()) {
    event.attempt_id = successorAttemptId;
    event.actor_session_ref = `actor-executor-${actorSuffix}`;
    event.recorded_at = lifecycleTime(firstLedgerMinute + index);
  }
  writeCoherentRechainedLedger(root, ledgerPath, events);

  const packetPath = `${successorRoot}/packet.json`;
  const packetMarkdownPath = `${successorRoot}/packet.md`;
  const packet = json<ResearchPacket>(root, packetPath);
  packet.attempt_id = successorAttemptId;
  packet.generated_at = lifecycleTime(firstLedgerMinute + events.length);
  writeJson(root, packetPath, packet);
  writeUtf8(root, packetMarkdownPath, renderPacketMarkdown(packet));
}

function retainRunEvents(root: string, count: number): void {
  writeRechainedJsonl(root, RUN_EVENTS, readJsonl(root, RUN_EVENTS).slice(0, count));
}

function refreshTerminalBindings(root: string): void {
  mutateJson(root, SUBMISSION, (submission) => {
    for (const artifact of submission.artifacts as JsonObject[]) {
      artifact.digest =
        artifact.digest_mode === "tiber-canonical-json-v1"
          ? sha256CanonicalJson(json(root, artifact.path as string))
          : sha256Raw(readFileSync(absolute(root, artifact.path as string)));
    }
    for (const source of submission.sources as JsonObject[]) {
      for (const artifact of [source.metadata, source.content]) {
        if (artifact === null) {
          continue;
        }
        artifact.digest =
          artifact.digest_mode === "tiber-canonical-json-v1"
            ? sha256CanonicalJson(json(root, artifact.path as string))
            : sha256Raw(
                readFileSync(absolute(root, artifact.path as string)),
              );
      }
    }
    const ledger = readJsonl(root, LEDGER);
    const last = eventAt(ledger, ledger.length - 1);
    submission.ledger_head = {
      event_count: ledger.length,
      event_hash: last.event_hash,
      event_id: last.event_id,
    };
  });
  const submission = json(root, SUBMISSION);

  const hasReview = (() => {
    try {
      return readFileSync(absolute(root, REVIEW)).length >= 0;
    } catch {
      return false;
    }
  })();
  let review: JsonObject | null = null;
  if (hasReview) {
    mutateJson(root, REVIEW, (value) => {
      value.submission_ref.digest = sha256CanonicalJson(submission);
    });
    review = json(root, REVIEW);
  }

  mutateJson(root, SEAL, (seal) => {
    seal.submission_ref.digest = sha256CanonicalJson(submission);
    seal.terminal_state.process_terminal = json(root, PACKET).process_terminal;
    if (review === null) {
      seal.review_ref = null;
      seal.terminal_state.review_verdict = "not_reached";
    } else {
      seal.review_ref.digest = sha256CanonicalJson(review);
      seal.terminal_state.review_verdict = review.overall_verdict;
    }
  });
  const seal = json(root, SEAL);

  const oldEvents = readJsonl(root, RUN_EVENTS);
  const activationEvent = structuredClone(
    oldEvents.find((event) => event.event_type === "activation"),
  );
  const attemptStart = structuredClone(
    oldEvents.find(
      (event) =>
        event.event_type === "attempt_started" &&
        event.attempt_id === ATTEMPT_ID,
    ),
  );
  const submitted = structuredClone(
    oldEvents.find(
      (event) =>
        event.event_type === "attempt_submitted" &&
        event.attempt_id === ATTEMPT_ID,
    ),
  );
  const closed = structuredClone(
    oldEvents.find(
      (event) =>
        event.event_type === "run_closed" &&
        event.attempt_id === ATTEMPT_ID,
    ),
  );
  assert.ok(activationEvent);
  assert.ok(attemptStart);
  assert.ok(submitted);
  assert.ok(closed);
  activationEvent.payload.artifact_digest = sha256CanonicalJson(
    json(root, ACTIVATION),
  );
  submitted.payload.artifact_digest = sha256CanonicalJson(submission);
  submitted.recorded_at = submission.submitted_at;
  closed.payload.artifact_digest = sha256CanonicalJson(seal);
  closed.payload.terminal_state = seal.terminal_state.process_terminal;
  closed.recorded_at = seal.sealed_at;

  const terminalEvents = [activationEvent, attemptStart, submitted];
  if (review !== null) {
    const reviewed = structuredClone(
      oldEvents.find(
        (event) =>
          event.event_type === "review_returned" &&
          event.attempt_id === ATTEMPT_ID,
      ),
    );
    assert.ok(reviewed);
    reviewed.payload.artifact_digest = sha256CanonicalJson(review);
    reviewed.recorded_at = review.reviewed_at;
    terminalEvents.push(reviewed);
  }
  terminalEvents.push(closed);
  writeRechainedJsonl(root, RUN_EVENTS, terminalEvents);
}

function refreshFrozenInputAuthorization(root: string): void {
  const inputs = json(root, INPUTS);
  mutateJson(root, AUTHORITY_DECISION, (decision) => {
    decision.inputs_ref.digest = sha256CanonicalJson(inputs);
  });
  const authorityDecision = json(root, AUTHORITY_DECISION);
  mutateJson(root, ACTIVATION, (activation) => {
    activation.inputs_ref.digest = sha256CanonicalJson(inputs);
    activation.ops_decision_ref.digest =
      sha256CanonicalJson(authorityDecision);
  });
}

function refreshFrozenJobAuthorization(root: string): void {
  const jobDigest = sha256Raw(readFileSync(absolute(root, "job.yaml")));
  mutateJson(root, INPUTS, (inputs) => {
    inputs.job_ref.digest = jobDigest;
  });
  const inputs = json(root, INPUTS);
  mutateJson(root, AUTHORITY_DECISION, (decision) => {
    decision.inputs_ref.digest = sha256CanonicalJson(inputs);
    decision.job_ref.digest = jobDigest;
  });
  const authorityDecision = json(root, AUTHORITY_DECISION);
  mutateJson(root, ACTIVATION, (activation) => {
    activation.inputs_ref.digest = sha256CanonicalJson(inputs);
    activation.job_ref.digest = jobDigest;
    activation.ops_decision_ref.digest =
      sha256CanonicalJson(authorityDecision);
  });
}

function refreshSourceMetadataBindings(root: string): void {
  const metadataDigest = sha256CanonicalJson(json(root, SOURCE_METADATA));
  mutateJson(root, INPUTS, (inputs) => {
    inputs.sources[0].metadata_digest = metadataDigest;
  });
  refreshFrozenInputAuthorization(root);
  refreshTerminalBindings(root);
}

function makeRetrospectiveCustodyFixture(root: string): void {
  mutateJson(root, SOURCE_METADATA, (metadata) => {
    metadata.temporal.retrieved_at = "2026-01-03T10:00:00Z";
    metadata.temporal.first_observed_at = "2026-01-03T10:00:00Z";
    metadata.temporal.admissible_at = "2026-01-03T11:00:00Z";
  });
  const metadataDigest = sha256CanonicalJson(json(root, SOURCE_METADATA));
  mutateJson(root, INPUTS, (inputs) => {
    inputs.frozen_at = "2026-01-03T12:00:00Z";
    inputs.sources[0].metadata_digest = metadataDigest;
  });
  mutateJson(root, AUTHORITY_DECISION, (decision) => {
    decision.approved_at = "2026-01-03T13:00:00Z";
  });
  mutateJson(root, ACTIVATION, (activation) => {
    activation.activated_at = "2026-01-03T14:00:00Z";
    activation.ops_decision_ref.approved_at =
      "2026-01-03T13:00:00Z";
  });

  const ledger = readJsonl(root, LEDGER);
  for (const [index, event] of ledger.entries()) {
    event.recorded_at =
      `2026-01-03T14:${String(index + 2).padStart(2, "0")}:00Z`;
  }
  writeCoherentRechainedLedger(root, LEDGER, ledger);
  mutatePacket(root, (packet) => {
    packet.generated_at = "2026-01-03T14:08:00Z";
  });

  const runEvents = readJsonl(root, RUN_EVENTS);
  eventAt(runEvents, 0).recorded_at = "2026-01-03T14:00:00Z";
  eventAt(runEvents, 1).recorded_at = "2026-01-03T14:01:00Z";
  writeRechainedJsonl(root, RUN_EVENTS, runEvents);
  refreshFrozenInputAuthorization(root);
  refreshTerminalBindings(root);
}

function makeBlockedNoReviewFixture(root: string): void {
  mutateJson(root, INPUTS, (inputs) => {
    inputs.blocked_inputs = [
      {
        input_id: "input-missing-synthetic",
        question_refs: ["question-threshold"],
        reason: "The explicitly required synthetic input was unavailable.",
        status: "unavailable",
      },
    ];
  });
  refreshFrozenInputAuthorization(root);

  mutatePacket(root, (packet) => {
    packet.process_terminal = "blocked";
    packet.completion = "blocked";
    packet.claims = [];
    packet.questions[0].assessment = "insufficient";
    packet.questions[0].blocker_reason = "missing_evidence";
    packet.questions[0].claim_refs = [];
    packet.questions[0].completion = "blocked";
    packet.unresolved = [
      {
        blocked_input_refs: ["input-missing-synthetic"],
        kind: "blocked_input",
        related_claim_refs: [],
        related_question_refs: ["question-threshold"],
        statement:
          "The explicitly required synthetic input was unavailable.",
        unresolved_id: "unresolved-missing-synthetic-input",
      },
    ];
  });

  rmSync(absolute(root, REVIEW));
  mutateJson(root, SEAL, (seal) => {
    seal.review_ref = null;
    seal.terminal_state.process_terminal = "blocked";
    seal.terminal_state.review_verdict = "not_reached";
  });
  refreshTerminalBindings(root);
}

function assertInvalid(
  root: string,
  expectedCodes: string | string[],
  options: ValidationOptions = {},
): ValidationReport {
  const report = validateAttempt(root, RUN_ID, ATTEMPT_ID, options);
  assert.equal(report.valid, false, JSON.stringify(report, null, 2));
  for (const code of Array.isArray(expectedCodes)
    ? expectedCodes
    : [expectedCodes]) {
    assert.ok(
      report.errors.some((entry) => entry.code === code),
      `expected ${code}; received ${report.errors
        .map((entry) => entry.code)
        .join(", ")}`,
    );
  }
  assert.equal(
    report.archive_id,
    null,
    "an invalid seal must never receive an archive ID",
  );
  return report;
}

test("golden fixture reaches a reviewed, sealed, downstream-authority-free end state", () => {
  withFixture((root) => {
    const report = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
      requireEndToEnd: true,
    });

    assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
    assert.equal(report.phase, "sealed");
    assert.equal(report.end_to_end_ready, true);
    assert.match(report.archive_id ?? "", /^sha256:[a-f0-9]{64}$/u);
    assert.equal(report.resume?.last_sequence, 6);
    assert.equal(report.resume?.last_status, "sealed:completed:pass");
    assert.deepEqual(report.resume?.open_evidence_gaps, []);
    assert.deepEqual(report.resume?.blockers, []);
    assert.deepEqual(report.resume?.next_permitted_actions, [
      "No executor action is permitted; await a separate external Ops decision.",
    ]);
  });
});

test("immutable authority, job, input, and capability pins fail closed", async (t) => {
  await t.test("authority decision semantics", () => {
    withFixture((root) => {
      mutateJson(root, AUTHORITY_DECISION, (decision) => {
        decision.scope = `${decision.scope} Unauthorized amendment.`;
      });
      assertInvalid(root, "digest.authority_decision_mismatch");
    });
  });

  await t.test("job bytes", () => {
    withFixture((root) => {
      appendFileSync(absolute(root, "job.yaml"), "\n# byte rewrite\n");
      assertInvalid(root, "digest.job_mismatch");
    });
  });

  await t.test("frozen input population", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        inputs.subjects.push({
          aliases: [],
          kind: "synthetic-device",
          label: "Fictional Device Comet",
          subject_id: "device-comet",
        });
      });
      assertInvalid(root, [
        "digest.inputs_mismatch",
        "population.subjects_changed",
      ]);
    });
  });

  await t.test("frozen research context cannot drift from the job", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        inputs.research_context.description =
          "Unauthorized alternate synthetic context.";
      });
      refreshFrozenInputAuthorization(root);
      refreshTerminalBindings(root);
      assertInvalid(root, "context.frozen_mismatch");
    });
  });

  await t.test("inputs must be frozen before operator approval", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        inputs.frozen_at = "2026-01-01T14:13:00Z";
      });
      refreshFrozenInputAuthorization(root);
      refreshTerminalBindings(root);
      assertInvalid(root, "activation.inputs_after_authority");
    });
  });

  await t.test("operator approval must predate activation", () => {
    withFixture((root) => {
      mutateJson(root, AUTHORITY_DECISION, (decision) => {
        decision.approved_at = "2026-01-01T14:16:00Z";
      });
      const decision = json(root, AUTHORITY_DECISION);
      mutateJson(root, ACTIVATION, (activation) => {
        activation.ops_decision_ref.approved_at =
          "2026-01-01T14:16:00Z";
        activation.ops_decision_ref.digest =
          sha256CanonicalJson(decision);
      });
      refreshTerminalBindings(root);
      assertInvalid(root, "activation.authority_after_activation");
    });
  });

  await t.test("tool capability expansion", () => {
    withFixture((root) => {
      mutateJson(root, ACTIVATION, (activation) => {
        activation.effective_capabilities.tools.push("unrestricted-browser");
      });
      assertInvalid(root, "authority.capability_expansion");
    });
  });

  await t.test("write-scope expansion", () => {
    withFixture((root) => {
      mutateJson(root, ACTIVATION, (activation) => {
        activation.effective_capabilities.repository_write.push("strategy");
      });
      assertInvalid(root, [
        "authority.capability_expansion",
        "authority.write_scope",
      ]);
    });
  });

  await t.test("budget expansion", () => {
    withFixture((root) => {
      mutateJson(root, ACTIVATION, (activation) => {
        activation.budget.tool_calls = 5;
      });
      assertInvalid(root, "authority.budget_expansion");
    });
  });

  await t.test("packet output class is pinned to the immutable job", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.output_class = "structured_research_packet";
      });
      assertInvalid(root, [
        "identity.mismatch",
        "packet.synthetic_mode_mismatch",
      ]);
    });
  });

  await t.test("synthetic jobs cannot declare a domain-research mode", () => {
    withFixture((root) => {
      const jobPath = absolute(root, "job.yaml");
      const job = readFileSync(jobPath, "utf8");
      writeFileSync(
        jobPath,
        job.replace(
          "mode: synthetic_conformance",
          "mode: bounded_domain_research",
        ),
        "utf8",
      );
      refreshFrozenJobAuthorization(root);
      refreshTerminalBindings(root);
      assertInvalid(root, "packet.synthetic_mode_mismatch");
    });
  });

  await t.test("job terminal-state allowlists bind packet and review outcomes", () => {
    withFixture((root) => {
      const jobPath = absolute(root, "job.yaml");
      const narrowed = readFileSync(jobPath, "utf8")
        .replace("    - completed\n", "")
        .replace("    - answered\n", "")
        .replace("    - pass\n", "");
      writeFileSync(jobPath, narrowed, "utf8");
      refreshFrozenJobAuthorization(root);
      refreshTerminalBindings(root);

      const report = assertInvalid(
        root,
        "job.terminal_state_not_permitted",
      );
      for (const path of [
        `${PACKET}.process_terminal`,
        `${PACKET}.completion`,
        `${REVIEW}.substantive.verdict`,
        `${REVIEW}.protocol.verdict`,
        `${REVIEW}.overall_verdict`,
      ]) {
        assert.ok(
          report.errors.some(
            (entry) =>
              entry.code === "job.terminal_state_not_permitted" &&
              entry.path === path,
          ),
          `expected terminal-state authority error at ${path}`,
        );
      }
    });
  });
});

test("population, question, claim, and source identities are closed and unique", async (t) => {
  await t.test("duplicate frozen subject", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        inputs.subjects.push(structuredClone(inputs.subjects[0]));
      });
      assertInvalid(root, "population.duplicate_subject");
    });
  });

  await t.test("duplicate packet question", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.questions.push(structuredClone(packet.questions[0]));
      });
      assertInvalid(root, "question.duplicate_id");
    });
  });

  await t.test("duplicate packet claim", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.claims.push(structuredClone(packet.claims[0]));
      });
      assertInvalid(root, "packet.duplicate_claim");
    });
  });

  await t.test("comparison-only member cannot receive a claim", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.claims[0].subject_ref = "device-orbit";
      });
      assertInvalid(root, "population.comparison_promoted_to_subject");
    });
  });

  await t.test("unknown member cannot receive a claim", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.claims[0].subject_ref = "device-comet";
      });
      assertInvalid(root, "population.silent_subject_addition");
    });
  });

  await t.test("duplicate source object ID", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        inputs.sources.push(structuredClone(inputs.sources[0]));
      });
      assertInvalid(root, "source.duplicate_id");
    });
  });

  await t.test("governed input artifact must be admitted and current", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        inputs.artifacts.push({
          admissibility: "inadmissible",
          artifact_digest: `sha256:${"6".repeat(64)}`,
          artifact_id: "artifact-stale",
          blob_digest: `sha256:${"7".repeat(64)}`,
          commit: "8".repeat(40),
          freshness: "stale",
          path: "governed/baseline.json",
          repository: "Prometheus-Frameworks/Synthetic",
        });
      });
      assertInvalid(root, [
        "input.artifact_not_admitted",
        "input.artifact_not_current",
      ]);
    });
  });

  await t.test("governed input artifact IDs are unique", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        const artifact = {
          admissibility: "admitted",
          artifact_digest: `sha256:${"6".repeat(64)}`,
          artifact_id: "artifact-pinned",
          blob_digest: `sha256:${"7".repeat(64)}`,
          commit: "8".repeat(40),
          freshness: "current",
          path: "governed/baseline.json",
          repository: "Prometheus-Frameworks/Synthetic",
        };
        inputs.artifacts.push(artifact, structuredClone(artifact));
      });
      assertInvalid(root, "input.duplicate_artifact");
    });
  });

  await t.test("declared baseline must resolve to an exact frozen artifact", () => {
    withFixture((root) => {
      const path = absolute(root, "job.yaml");
      const text = readFileSync(path, "utf8");
      writeFileSync(
        path,
        text.replace(
          "baseline_ref: null",
          [
            "baseline_ref:",
            "  input_id: artifact-missing",
            `  digest: sha256:${"9".repeat(64)}`,
          ].join("\n"),
        ),
      );
      assertInvalid(root, "input.baseline_unpinned");
    });
  });

  await t.test("subject and comparison populations are disjoint", () => {
    withFixture((root) => {
      const path = absolute(root, "job.yaml");
      const text = readFileSync(path, "utf8");
      writeFileSync(
        path,
        text.replace(
          "subject_id: device-orbit",
          "subject_id: device-lantern",
        ),
      );
      assertInvalid(root, "population.subject_comparison_overlap");
    });
  });
});

test("source, temporal, market, and retained-byte controls fail closed", async (t) => {
  await t.test("missing declared source", () => {
    withFixture((root) => {
      rmSync(absolute(root, SOURCE_CONTENT));
      assertInvalid(root, "candidate.unreadable");
    });
  });

  await t.test("unadmitted source family", () => {
    withFixture((root) => {
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.source_family_id = "unapproved-source-family";
      });
      assertInvalid(root, "source.family_not_admitted");
    });
  });

  await t.test("stale source", () => {
    withFixture((root) => {
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.freshness.state = "stale";
      });
      assertInvalid(root, "source.not_current");
    });
  });

  await t.test("source context mismatch", () => {
    withFixture((root) => {
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.context_match.matched = false;
      });
      assertInvalid(root, "source.context_mismatch");
    });
  });

  await t.test("source intended-use mismatch", () => {
    withFixture((root) => {
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.intended_use = "A different and unauthorized use.";
      });
      assertInvalid(root, "source.intended_use_mismatch");
    });
  });

  await t.test("source rights mismatch", () => {
    withFixture((root) => {
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.rights_disposition_ref = "synthetic:unapproved-rights";
      });
      assertInvalid(root, "source.rights_mismatch");
    });
  });

  await t.test("source reportability mismatch", () => {
    withFixture((root) => {
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.reportability = "internal";
      });
      assertInvalid(root, "source.reportability_not_admitted");
    });
  });

  await t.test("source evidence-class mismatch", () => {
    withFixture((root) => {
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.source_class = "admitted_external_source";
      });
      assertInvalid(root, "source.evidence_class_not_admitted");
    });
  });

  await t.test("exact pre-cutoff revision may be retained after cutoff", () => {
    withFixture((root) => {
      makeRetrospectiveCustodyFixture(root);

      const report = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        requireEndToEnd: true,
      });
      assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
      assert.equal(report.end_to_end_ready, true);
    });
  });

  await t.test("retrospective custody cannot postdate frozen inputs", () => {
    withFixture((root) => {
      makeRetrospectiveCustodyFixture(root);
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.temporal.retrieved_at = "2026-01-03T12:30:00Z";
        metadata.temporal.first_observed_at = "2026-01-03T12:30:00Z";
        metadata.temporal.admissible_at = "2026-01-03T12:45:00Z";
      });
      refreshSourceMetadataBindings(root);
      assertInvalid(root, "temporal.custody_after_freeze");
    });
  });

  await t.test("source revision unavailable at cutoff is rejected", () => {
    withFixture((root) => {
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.temporal.source_available_at = "2026-01-03T09:00:00Z";
        metadata.temporal.retrieved_at = "2026-01-03T10:00:00Z";
        metadata.temporal.first_observed_at = "2026-01-03T10:00:00Z";
        metadata.temporal.admissible_at = "2026-01-03T11:00:00Z";
      });
      refreshSourceMetadataBindings(root);
      assertInvalid(root, "temporal.source_unavailable_at_cutoff");
    });
  });

  await t.test("retained content mutation", () => {
    withFixture((root) => {
      appendFileSync(absolute(root, SOURCE_CONTENT), "\nmutated bytes\n");
      assertInvalid(root, "digest.source_content_mismatch");
    });
  });

  await t.test("market claim without a snapshot", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.claims[0].claim_type = "market_inefficiency";
        packet.claims[0].market_inefficiency_claim =
          "The invented item is mispriced.";
        packet.claims[0].market_snapshot_ref = "market-missing";
      });
      assertInvalid(root, "packet.market_snapshot_missing");
    });
  });

  await t.test("stale, post-cutoff, invalid-window market snapshot", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        inputs.market_snapshots.push({
          aggregation_method: "invented mean",
          context: "Invented Stage 0 bench fixture.",
          context_ref: "context-synthetic-bench-v1",
          freshness: "stale",
          known_bias: [],
          market_snapshot_id: "market-invalid",
          observed_at: "2026-01-03T00:00:00Z",
          sample_size: 1,
          source_object_refs: ["source-missing"],
          window_end: "2026-01-02T12:00:00Z",
          window_start: "2026-01-03T12:00:00Z",
        });
      });
      assertInvalid(root, [
        "market.source_invalid",
        "market.post_cutoff",
        "market.window_invalid",
        "market.stale",
      ]);
    });
  });

  await t.test("market snapshot cannot postdate frozen inputs", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        inputs.market_snapshots.push({
          aggregation_method: "Invented exact count.",
          context: "Invented Stage 0 bench fixture.",
          context_ref: "context-synthetic-bench-v1",
          freshness: "current",
          known_bias: ["Synthetic fixture only."],
          market_snapshot_id: "market-after-freeze",
          observed_at: "2026-01-01T15:00:00Z",
          sample_size: 4,
          source_object_refs: ["source-synthetic-bench-001"],
          window_end: "2026-01-01T15:00:00Z",
          window_start: "2026-01-01T14:30:00Z",
        });
      });
      refreshFrozenInputAuthorization(root);
      refreshTerminalBindings(root);
      assertInvalid(root, "market.after_input_freeze");
    });
  });

  await t.test("context-bound current market snapshot supports a synthetic market claim", () => {
    withFixture((root) => {
      mutateJson(root, INPUTS, (inputs) => {
        inputs.market_snapshots.push({
          aggregation_method: "Exact count across four retained synthetic cycles.",
          context: "Invented Stage 0 bench fixture.",
          context_ref: "context-synthetic-bench-v1",
          freshness: "current",
          known_bias: [
            "The fixture is invented and its four observations have no external meaning.",
          ],
          market_snapshot_id: "market-synthetic-001",
          observed_at: "2026-01-01T12:00:00Z",
          sample_size: 4,
          source_object_refs: ["source-synthetic-bench-001"],
          window_end: "2026-01-01T12:00:00Z",
          window_start: "2026-01-01T09:00:00Z",
        });
      });
      refreshFrozenInputAuthorization(root);
      mutatePacket(root, (packet) => {
        packet.claims[0].claim_type = "market_inefficiency";
        packet.claims[0].market_inefficiency_claim =
          "Only within the invented fixture, the retained synthetic result differs from its declared comparison.";
        packet.claims[0].market_snapshot_ref = "market-synthetic-001";
      });
      refreshTerminalBindings(root);

      const report = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        requireEndToEnd: true,
      });
      assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
      assert.equal(report.end_to_end_ready, true);
      assert.match(report.archive_id ?? "", /^sha256:[a-f0-9]{64}$/u);
    });
  });

  await t.test("public-safe output cannot consume an internal source", () => {
    withFixture((root) => {
      const jobPath = absolute(root, "job.yaml");
      const job = readFileSync(jobPath, "utf8");
      writeFileSync(
        jobPath,
        job.replace(
          "      reportability:\n        - public_safe\n",
          "      reportability:\n        - public_safe\n        - internal\n",
        ),
        "utf8",
      );
      mutateJson(root, SOURCE_METADATA, (metadata) => {
        metadata.reportability = "internal";
      });
      const metadataDigest = sha256CanonicalJson(
        json(root, SOURCE_METADATA),
      );
      mutateJson(root, INPUTS, (inputs) => {
        inputs.sources[0].metadata_digest = metadataDigest;
      });
      refreshFrozenJobAuthorization(root);
      refreshTerminalBindings(root);
      assertInvalid(root, "reportability.source_incompatible");
    });
  });

  await t.test("calculation requires its admitted evidence class", () => {
    withFixture((root) => {
      const jobPath = absolute(root, "job.yaml");
      const job = readFileSync(jobPath, "utf8");
      writeFileSync(
        jobPath,
        job.replace("    - deterministic_calculation\n", ""),
        "utf8",
      );
      refreshFrozenJobAuthorization(root);
      refreshTerminalBindings(root);
      assertInvalid(root, "calculation.evidence_class_not_admitted");
    });
  });
});

test("ledger chain, evidence state, calculations, and checkpoints are replayable", async (t) => {
  await t.test("ledger records cannot predate attempt activation", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 0).recorded_at = "2026-01-01T14:18:00Z";
      writeCoherentRechainedLedger(root, LEDGER, events);
      for (const path of [SUBMISSION, REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      retainRunEvents(root, 2);
      assertInvalid(
        root,
        "ledger.before_attempt_start",
        { phase: "candidate" },
      );
    });
  });

  await t.test("packet generation cannot predate activation", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.generated_at = "2026-01-01T14:14:00Z";
      });
      for (const path of [SUBMISSION, REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      retainRunEvents(root, 2);
      assertInvalid(
        root,
        [
          "packet.generated_before_activation",
          "packet.generated_before_ledger",
        ],
        { phase: "candidate" },
      );
    });
  });

  await t.test("packet generation cannot predate the final ledger event", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.generated_at = "2026-01-01T14:27:00Z";
      });
      for (const path of [SUBMISSION, REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      retainRunEvents(root, 2);
      assertInvalid(
        root,
        "packet.generated_before_ledger",
        { phase: "candidate" },
      );
    });
  });

  await t.test("semantically identical noncanonical JSONL bytes are rejected", () => {
    withFixture((root) => {
      const lines = readFileSync(absolute(root, LEDGER), "utf8")
        .trimEnd()
        .split("\n");
      const first = lines[0];
      assert.ok(first);
      lines[0] = first.replace(",", ", ");
      writeFileSync(absolute(root, LEDGER), `${lines.join("\n")}\n`, "utf8");
      assertInvalid(root, "candidate.unreadable");
    });
  });

  await t.test("sequence and self-hash mutation", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 1).sequence = 8;
      writeFileSync(
        absolute(root, LEDGER),
        `${events.map((event) => canonicalizeJson(event)).join("\n")}\n`,
      );
      assertInvalid(root, [
        "ledger.sequence_mismatch",
        "ledger.event_hash_mismatch",
      ]);
    });
  });

  await t.test("post-submission append invalidates the frozen head", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      const prior = events.at(-1);
      assert.ok(prior);
      events.push({
        actor_session_ref: "actor-executor-001",
        admissibility_state: "admitted",
        applicable_scope: {
          comparison_refs: [],
          question_refs: ["question-threshold"],
          subject_refs: ["device-lantern"],
        },
        attempt_id: ATTEMPT_ID,
        authoring_role: "executor",
        epistemic_class: "unknown",
        event_id: "event-007-after-submission",
        event_type: "status_transition",
        freshness_state: "current",
        limitations: ["This append occurs after the frozen submission."],
        model_declared: "none",
        parent_event_refs: ["event-006-checkpoint"],
        payload: {
          from: "synthesis_ready",
          rationale: "Unauthorized post-submission append.",
          to: "submitted",
        },
        previous_event_hash: prior.event_hash,
        recorded_at: "2026-01-15T12:31:00Z",
        provider_declared: "deterministic-synthetic-fixture",
        run_id: RUN_ID,
        schema_version: "research-ledger-event/v0",
        sequence: 7,
        source_refs: [],
        synthetic_fixture: true,
      });
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, [
        "submission.artifacts_mismatch",
        "submission.ledger_head",
      ]);
    });
  });

  await t.test("stale evidence cannot support a claim", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 1).freshness_state = "stale";
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "packet.evidence_state");
    });
  });

  await t.test("claim hypothesis scope must match the claim", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 0).applicable_scope.subject_refs = [];
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "packet.hypothesis_scope");
    });
  });

  await t.test("claim hypothesis payload must backlink its question and subject", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 0).payload.subject_ref = "device-orbit";
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "packet.hypothesis_backlink");
    });
  });

  await t.test("claim evidence must follow its hypothesis", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      const hypothesis = structuredClone(eventAt(events, 0));
      const observation = structuredClone(eventAt(events, 1));
      observation.parent_event_refs = [];
      events[0] = observation;
      events[1] = hypothesis;
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "packet.hypothesis_order");
    });
  });

  await t.test("supporting evidence must match claim question scope", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 1).applicable_scope.question_refs = [];
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "packet.evidence_scope");
    });
  });

  await t.test("supporting evidence must match claim subject scope", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 1).applicable_scope.subject_refs = [];
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "packet.evidence_scope");
    });
  });

  await t.test("not_found cannot be positive claim evidence", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 1).payload.result = "not_found";
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "packet.evidence_observation");
    });
  });

  await t.test("observation window cannot cross the activated cutoff", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 1).payload.observation_window.end =
        "2026-01-03T00:00:00Z";
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "ledger.observation_post_cutoff");
    });
  });

  await t.test("unknown evidence reference", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.claims[0].evidence_refs = ["event-does-not-exist"];
      });
      assertInvalid(root, "packet.evidence_link");
    });
  });

  await t.test("challenge must name the candidate claim", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 4).payload.claim_refs = ["claim-other"];
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "packet.challenge_backlink");
    });
  });

  await t.test("challenge cannot omit rival, coverage, or counterevidence", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      const challenge = eventAt(events, 4);
      challenge.payload.claim_refs = [];
      challenge.payload.negative_finding_refs = [];
      challenge.payload.rival_explanations = [];
      challenge.payload.coverage_checks = [];
      challenge.payload.counterevidence_event_refs = [];
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "challenge.empty");
    });
  });

  await t.test("challenge counterevidence resolves to a prior observation", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 4).payload.counterevidence_event_refs = [
        "event-001-hypothesis",
      ];
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "challenge.counterevidence_invalid");
    });
  });

  await t.test("calculation output must match its declared digest", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 2).payload.output.pass_count = 4;
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "calculation.output_digest");
    });
  });

  await t.test("calculation binds both input event and source hashes", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 2).payload.input_hashes = [];
      writeRechainedJsonl(root, LEDGER, events);
      const report = assertInvalid(root, "calculation.input_hash_missing");
      assert.ok(
        report.errors.filter(
          (entry) => entry.code === "calculation.input_hash_missing",
        ).length >= 2,
        "both the prior event and retained source must be hash-bound",
      );
    });
  });

  await t.test("calculation inputs must resolve", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 2).payload.input_refs = ["event-does-not-exist"];
      eventAt(events, 2).payload.input_hashes = [];
      eventAt(events, 2).source_refs = [];
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "calculation.input_unresolved");
    });
  });

  await t.test("calculation source lineage is exact", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 2).source_refs = [];
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "calculation.source_lineage");
    });
  });

  await t.test("checkpoint cannot expand the activated budget", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 5).payload.budgets_remaining.tool_calls = 99;
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "checkpoint.budget_expansion");
    });
  });

  await t.test("checkpoint budget reconciles to recorded usage", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 5).payload.budgets_remaining.tool_calls = 3;
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "checkpoint.tool_budget_mismatch");
    });
  });

  await t.test("later checkpoint cannot replenish a prior budget", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      const prior = eventAt(events, events.length - 1);
      events.push({
        actor_session_ref: "actor-executor-001",
        admissibility_state: "admitted",
        applicable_scope: {
          comparison_refs: [],
          question_refs: ["question-threshold"],
          subject_refs: ["device-lantern"],
        },
        attempt_id: ATTEMPT_ID,
        authoring_role: "executor",
        epistemic_class: "unknown",
        event_id: "event-007-checkpoint-replenished",
        event_type: "checkpoint",
        freshness_state: "not_applicable",
        limitations: ["Synthetic invalid checkpoint."],
        model_declared: "none",
        parent_event_refs: ["event-006-checkpoint"],
        payload: {
          blocked_items: [],
          budgets_remaining: {
            evidence_objects: 0,
            tool_calls: 4,
            wall_clock_minutes: 6,
          },
          evidence_gaps: [],
          frontier_question: "Invalid replenished checkpoint.",
          ledger_head_before_checkpoint: prior.event_hash,
          next_permitted_actions: [],
          out_of_scope_discoveries: [],
        },
        previous_event_hash: prior.event_hash,
        provider_declared: "deterministic-synthetic-fixture",
        recorded_at: "2026-01-01T14:29:00Z",
        run_id: RUN_ID,
        schema_version: "research-ledger-event/v0",
        sequence: events.length + 1,
        source_refs: [],
        synthetic_fixture: true,
      });
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "checkpoint.budget_expansion");
    });
  });
});

test("packet negative, unresolved, and freshness records are fully linked", async (t) => {
  await t.test("question assessment conservatively matches its linked claim", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.questions[0].assessment = "contradicted";
      });
      assertInvalid(root, "packet.question_assessment_mismatch");
    });
  });

  await t.test("candidate claim uses an admissible terminal epistemic class", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.claims[0].epistemic_class = "hypothesis";
      });
      assertInvalid(root, "packet.claim_epistemic_mismatch");
    });
  });

  await t.test("claim freshness cannot cross the activated cutoff", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.claims[0].freshness.as_of = "2026-01-03T00:00:00Z";
      });
      assertInvalid(root, "packet.claim_freshness");
    });
  });

  await t.test("negative finding references must resolve", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.negative_findings.push({
          challenge_refs: ["event-005-challenge"],
          evidence_refs: ["event-does-not-exist"],
          finding_id: "finding-dangling",
          hypothesis_refs: ["event-001-hypothesis"],
          limitations: ["Synthetic invalid negative finding."],
          question_refs: ["question-does-not-exist"],
          statement: "This intentionally has dangling references.",
          subject_refs: ["device-does-not-exist"],
        });
      });
      assertInvalid(root, [
        "packet.negative_question_link",
        "packet.negative_subject_link",
        "packet.negative_evidence_link",
      ]);
    });
  });

  await t.test("negative finding evidence must match its declared scope", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.negative_findings.push({
          challenge_refs: ["event-005-challenge"],
          evidence_refs: ["event-002-observation"],
          finding_id: "finding-wrong-scope",
          hypothesis_refs: ["event-001-hypothesis"],
          limitations: ["Synthetic invalid negative finding."],
          question_refs: ["question-threshold"],
          statement: "This intentionally declares an unrelated subject.",
          subject_refs: ["device-orbit"],
        });
      });
      assertInvalid(root, "packet.negative_evidence_scope");
    });
  });

  await t.test("unresolved claim and question references must resolve", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.unresolved.push({
          blocked_input_refs: [],
          kind: "missing_evidence",
          related_claim_refs: ["claim-does-not-exist"],
          related_question_refs: ["question-does-not-exist"],
          statement: "This intentionally has dangling references.",
          unresolved_id: "unresolved-dangling",
        });
      });
      assertInvalid(root, [
        "packet.unresolved_claim_link",
        "packet.unresolved_question_link",
      ]);
    });
  });
});

test("submission, review, seal, and run-event lifecycle are exact bindings", async (t) => {
  await t.test("submission binds the complete core artifact inventory", () => {
    withFixture((root) => {
      mutateJson(root, SUBMISSION, (submission) => {
        submission.artifacts[0].digest = `sha256:${"0".repeat(64)}`;
      });
      assertInvalid(root, "submission.artifacts_mismatch");
    });
  });

  await t.test("submission binds source inventory", () => {
    withFixture((root) => {
      mutateJson(root, SUBMISSION, (submission) => {
        submission.sources[0].content.digest = `sha256:${"0".repeat(64)}`;
      });
      assertInvalid(root, "submission.sources_mismatch");
    });
  });

  await t.test("submission executor metadata matches the final ledger writer", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, events.length - 1).provider_declared =
        "different-provider";
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "submission.executor_session");
    });
  });

  await t.test("review must be independent", () => {
    withFixture((root) => {
      mutateJson(root, REVIEW, (review) => {
        review.reviewer.actor_session_ref = "actor-executor-001";
      });
      assertInvalid(root, "review.not_independent");
    });
  });

  await t.test("overall review pass cannot collapse separate verdicts", () => {
    withFixture((root) => {
      mutateJson(root, REVIEW, (review) => {
        review.substantive.verdict = "rework_required";
      });
      assertInvalid(root, "review.verdict_collapse");
    });
  });

  await t.test("review binds the exact submission", () => {
    withFixture((root) => {
      mutateJson(root, REVIEW, (review) => {
        review.submission_ref.digest = `sha256:${"1".repeat(64)}`;
      });
      assertInvalid(root, "review.submission_mismatch");
    });
  });

  await t.test("seal binds the exact review", () => {
    withFixture((root) => {
      mutateJson(root, SEAL, (seal) => {
        seal.review_ref.digest = `sha256:${"2".repeat(64)}`;
      });
      assertInvalid(root, "seal.review_mismatch");
    });
  });

  await t.test("terminal lifecycle event cannot be omitted", () => {
    withFixture((root) => {
      const events = readJsonl(root, RUN_EVENTS);
      events.splice(3, 1);
      writeRechainedJsonl(root, RUN_EVENTS, events);
      assertInvalid(root, "run_event.lifecycle_missing");
    });
  });

  await t.test("terminal lifecycle event must bind exact archive", () => {
    withFixture((root) => {
      const events = readJsonl(root, RUN_EVENTS);
      eventAt(events, 4).payload.artifact_digest = `sha256:${"3".repeat(64)}`;
      writeRechainedJsonl(root, RUN_EVENTS, events);
      assertInvalid(root, "run_event.lifecycle_mismatch");
    });
  });

  await t.test("run event requires its event-specific payload", () => {
    withFixture((root) => {
      const events = readJsonl(root, RUN_EVENTS);
      eventAt(events, 2).payload = {};
      writeRechainedJsonl(root, RUN_EVENTS, events);
      const report = validateAttempt(root, RUN_ID, ATTEMPT_ID);
      assert.equal(report.valid, false);
      assert.ok(
        report.errors.some(
          (entry) =>
            entry.code === "schema.invalid" &&
            entry.path.startsWith(`${RUN_EVENTS}:3`) &&
            entry.message.includes("required"),
        ),
        `expected an event-specific required-payload schema error; received ${JSON.stringify(
          report.errors,
          null,
          2,
        )}`,
      );
      assert.equal(report.archive_id, null);
    });
  });

  await t.test("terminal run events preserve lifecycle order", () => {
    withFixture((root) => {
      const events = readJsonl(root, RUN_EVENTS);
      const submitted = structuredClone(eventAt(events, 2));
      const reviewed = structuredClone(eventAt(events, 3));
      submitted.recorded_at = "2026-01-15T12:35:00Z";
      reviewed.recorded_at = "2026-01-15T12:30:00Z";
      events[2] = reviewed;
      events[3] = submitted;
      writeRechainedJsonl(root, RUN_EVENTS, events);
      assertInvalid(root, "run_event.lifecycle_order");
    });
  });

  await t.test("submission cannot predate the frozen ledger head", () => {
    withFixture((root) => {
      mutateJson(root, SUBMISSION, (submission) => {
        submission.submitted_at = "2026-01-01T14:00:00Z";
      });
      assertInvalid(root, "terminal.chronology");
    });
  });

  await t.test("review cannot predate submission", () => {
    withFixture((root) => {
      mutateJson(root, REVIEW, (review) => {
        review.reviewed_at = "2026-01-15T12:00:00Z";
      });
      assertInvalid(root, "terminal.chronology");
    });
  });

  await t.test("seal cannot predate review", () => {
    withFixture((root) => {
      mutateJson(root, SEAL, (seal) => {
        seal.sealed_at = "2026-01-15T12:00:00Z";
      });
      assertInvalid(root, "terminal.chronology");
    });
  });

  await t.test("terminal event timestamp matches the bound artifact", () => {
    withFixture((root) => {
      const events = readJsonl(root, RUN_EVENTS);
      eventAt(events, 2).recorded_at = "2026-01-15T12:31:00Z";
      writeRechainedJsonl(root, RUN_EVENTS, events);
      assertInvalid(root, "run_event.artifact_time_mismatch");
    });
  });

  await t.test("predecessor archive reference must resolve", () => {
    withFixture((root) => {
      mutateJson(root, SEAL, (seal) => {
        seal.predecessor_attempt_ref = {
          archive_id: `sha256:${"4".repeat(64)}`,
          attempt_id: "attempt-000",
        };
      });
      assertInvalid(root, "attempt.predecessor_missing");
    });
  });

  await t.test("untrusted predecessor pins are rejected before rework comparison", () => {
    withFixture((root) => {
      const predecessorRoot = `${RUN_ROOT}/attempts/attempt-000`;
      cpSync(
        absolute(root, ATTEMPT_ROOT),
        absolute(root, predecessorRoot),
        { recursive: true },
      );
      mutateJson(root, `${predecessorRoot}/seal.json`, (seal) => {
        seal.terminal_state.review_verdict = "rework_required";
      });
      mutateJson(root, `${predecessorRoot}/submission.json`, (submission) => {
        submission.artifacts.find(
          (artifact: JsonObject) => artifact.artifact_type === "inputs",
        ).digest = `sha256:${"5".repeat(64)}`;
      });
      const predecessorSeal = json(root, `${predecessorRoot}/seal.json`);
      mutateJson(root, SEAL, (seal) => {
        seal.predecessor_attempt_ref = {
          archive_id: sha256CanonicalJson(predecessorSeal),
          attempt_id: "attempt-000",
        };
      });
      const report = assertInvalid(root, "attempt.predecessor_invalid");
      assert.equal(
        report.errors.some(
          (entry) => entry.code === "attempt.rework_changed_run_inputs",
        ),
        false,
        "untrusted predecessor pin lists must not reach the rework comparison",
      );
    });
  });

  await t.test("an additional ordinary attempt does not mutate the sealed predecessor", () => {
    withFixture((root) => {
      cpSync(
        absolute(root, ATTEMPT_ROOT),
        absolute(root, `${RUN_ROOT}/attempts/attempt-002`),
        { recursive: true },
      );
      const report = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        requireEndToEnd: true,
      });
      assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
      assert.equal(report.end_to_end_ready, true);
    });
  });

  await t.test("rework seal waits for Ops before an authorized successor starts", () => {
    withFixture((root) => {
      rmSync(absolute(root, REVIEW));
      rmSync(absolute(root, SEAL));
      retainRunEvents(root, 3);

      createReview(
        root,
        RUN_ID,
        ATTEMPT_ID,
        {
          ...lifecycleReviewMetadata("001", 35, "rework_required"),
          reviewed_at: "2026-01-15T12:35:00Z",
        },
      );
      const eventsBeforeSeal = readFileSync(
        absolute(root, RUN_EVENTS),
        "utf8",
      );
      const archiveId = createSeal(root, RUN_ID, ATTEMPT_ID, {
        actor_session_ref: "actor-orchestrator-001",
        predecessor_attempt_ref: null,
        sealed_at: "2026-01-15T12:36:00Z",
      });

      assert.equal(
        readFileSync(absolute(root, RUN_EVENTS), "utf8"),
        eventsBeforeSeal,
        "sealing for rework must not invent a successor or close the run",
      );
      assert.equal(archiveId, sha256CanonicalJson(json(root, SEAL)));
      const awaitingOps = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        phase: "sealed",
      });
      assert.equal(
        awaitingOps.valid,
        true,
        JSON.stringify(awaitingOps.errors, null, 2),
      );
      assert.equal(awaitingOps.end_to_end_ready, false);
      assert.deepEqual(awaitingOps.resume?.next_permitted_actions, [
        "Await a separately authorized successor_link; the sealed attempt cannot authorize its own continuation.",
      ]);

      const successorAttemptId = "attempt-002";
      const recoveredArchiveId = createSeal(root, RUN_ID, ATTEMPT_ID, {
        actor_session_ref: "actor-orchestrator-001",
        predecessor_attempt_ref: null,
        sealed_at: "2026-01-15T12:36:00Z",
        successor_attempt_id: successorAttemptId,
        successor_decision_ref: "synthetic:ops-authorize-attempt-002",
        successor_linked_at: lifecycleTime(0),
      });
      assert.equal(recoveredArchiveId, archiveId);

      const linkedPredecessor = validateAttempt(
        root,
        RUN_ID,
        ATTEMPT_ID,
        { phase: "sealed" },
      );
      assert.equal(
        linkedPredecessor.valid,
        true,
        JSON.stringify(linkedPredecessor.errors, null, 2),
      );
      assert.deepEqual(linkedPredecessor.resume?.next_permitted_actions, [
        "Start only the Ops-authorized successor attempt attempt-002.",
      ]);
      const linkedEvents = readJsonl(root, RUN_EVENTS);
      assert.equal(linkedEvents.at(-1)?.event_type, "successor_link");
      assert.equal(
        linkedEvents.at(-1)?.payload.successor_attempt_ref,
        successorAttemptId,
      );
      assert.equal(
        linkedEvents.at(-1)?.payload.decision_ref,
        "synthetic:ops-authorize-attempt-002",
      );

      prepareSuccessorCandidate(
        root,
        ATTEMPT_ID,
        successorAttemptId,
        "002",
        2,
      );
      createAttemptStart(root, RUN_ID, successorAttemptId, {
        actor_session_ref: "actor-orchestrator-001",
        started_at: lifecycleTime(1),
      });

      const predecessorAfterStart = validateAttempt(
        root,
        RUN_ID,
        ATTEMPT_ID,
        { phase: "sealed" },
      );
      assert.equal(
        predecessorAfterStart.valid,
        true,
        JSON.stringify(predecessorAfterStart.errors, null, 2),
      );
      const successor = validateAttempt(
        root,
        RUN_ID,
        successorAttemptId,
        { phase: "candidate" },
      );
      assert.equal(
        successor.valid,
        true,
        JSON.stringify(successor.errors, null, 2),
      );
      assert.equal(successor.phase, "candidate");
      assert.equal(successor.end_to_end_ready, false);
      assert.equal(successor.resume?.last_status, "attempt_started");
    });
  });

  await t.test("a third attempt cannot skip its immediate predecessor", () => {
    withFixture((root) => {
      rmSync(absolute(root, REVIEW));
      rmSync(absolute(root, SEAL));
      retainRunEvents(root, 3);
      createReview(root, RUN_ID, ATTEMPT_ID, {
        ...lifecycleReviewMetadata("001", 35, "rework_required"),
        reviewed_at: "2026-01-15T12:35:00Z",
      });
      const archiveA = createSeal(root, RUN_ID, ATTEMPT_ID, {
        actor_session_ref: "actor-orchestrator-001",
        predecessor_attempt_ref: null,
        sealed_at: "2026-01-15T12:36:00Z",
      });
      createSeal(root, RUN_ID, ATTEMPT_ID, {
        actor_session_ref: "actor-orchestrator-001",
        predecessor_attempt_ref: null,
        sealed_at: "2026-01-15T12:36:00Z",
        successor_attempt_id: "attempt-002",
        successor_decision_ref: "synthetic:ops-authorize-attempt-002",
        successor_linked_at: lifecycleTime(0),
      });

      prepareSuccessorCandidate(
        root,
        ATTEMPT_ID,
        "attempt-002",
        "002",
        2,
      );
      createAttemptStart(root, RUN_ID, "attempt-002", {
        actor_session_ref: "actor-orchestrator-001",
        started_at: lifecycleTime(1),
      });
      createSubmission(
        root,
        RUN_ID,
        "attempt-002",
        lifecycleSubmissionMetadata("002", 9, 10),
      );
      createReview(
        root,
        RUN_ID,
        "attempt-002",
        lifecycleReviewMetadata("002", 15, "rework_required"),
      );
      const archiveB = createSeal(root, RUN_ID, "attempt-002", {
        actor_session_ref: "actor-orchestrator-001",
        predecessor_attempt_ref: {
          archive_id: archiveA,
          attempt_id: ATTEMPT_ID,
        },
        sealed_at: lifecycleTime(16),
      });
      const validB = validateAttempt(root, RUN_ID, "attempt-002", {
        phase: "sealed",
      });
      assert.equal(validB.valid, true, JSON.stringify(validB.errors, null, 2));

      createSeal(root, RUN_ID, "attempt-002", {
        actor_session_ref: "actor-orchestrator-001",
        predecessor_attempt_ref: {
          archive_id: archiveA,
          attempt_id: ATTEMPT_ID,
        },
        sealed_at: lifecycleTime(16),
        successor_attempt_id: "attempt-003",
        successor_decision_ref: "synthetic:ops-authorize-attempt-003",
        successor_linked_at: lifecycleTime(20),
      });
      prepareSuccessorCandidate(
        root,
        "attempt-002",
        "attempt-003",
        "003",
        22,
      );
      createAttemptStart(root, RUN_ID, "attempt-003", {
        actor_session_ref: "actor-orchestrator-001",
        started_at: lifecycleTime(21),
      });
      createSubmission(
        root,
        RUN_ID,
        "attempt-003",
        lifecycleSubmissionMetadata("003", 29, 30),
      );
      createReview(
        root,
        RUN_ID,
        "attempt-003",
        lifecycleReviewMetadata("003", 35, "pass"),
      );
      const reviewedC = validateAttempt(root, RUN_ID, "attempt-003", {
        phase: "reviewed",
      });
      assert.equal(
        reviewedC.valid,
        true,
        JSON.stringify(reviewedC.errors, null, 2),
      );

      const cSealPath = `${RUN_ROOT}/attempts/attempt-003/seal.json`;
      const runEventsBefore = readFileSync(absolute(root, RUN_EVENTS), "utf8");
      assert.throws(
        () =>
          createSeal(root, RUN_ID, "attempt-003", {
            actor_session_ref: "actor-orchestrator-001",
            predecessor_attempt_ref: {
              archive_id: archiveA,
              attempt_id: ATTEMPT_ID,
            },
            sealed_at: lifecycleTime(36),
          }),
        /attempt\.predecessor_lineage/u,
      );
      assert.equal(existsSync(absolute(root, cSealPath)), false);
      assert.equal(
        readFileSync(absolute(root, RUN_EVENTS), "utf8"),
        runEventsBefore,
      );
      assert.match(archiveB, /^sha256:[a-f0-9]{64}$/u);
    });
  });
});

test("layout, promotion, privacy, and byte-normalization controls reject contamination", async (t) => {
  await t.test("unbound top-level run entry", () => {
    withFixture((root) => {
      writeFileSync(absolute(root, `${RUN_ROOT}/notes.txt`), "not bound\n");
      assertInvalid(root, "layout.unbound_run_entry");
    });
  });

  await t.test("unbound retained-source file", () => {
    withFixture((root) => {
      writeFileSync(absolute(root, `${SOURCE_ROOT}/extra.txt`), "not bound\n");
      assertInvalid(root, "layout.unbound_source_file");
    });
  });

  await t.test("source symlink", () => {
    withFixture((root) => {
      symlinkSync("content", absolute(root, `${SOURCE_ROOT}/alias`));
      assertInvalid(root, "layout.symlink");
    });
  });

  await t.test("unexpected attempt file", () => {
    withFixture((root) => {
      writeFileSync(absolute(root, `${ATTEMPT_ROOT}/notes.txt`), "not bound\n");
      assertInvalid(root, "attempt.unexpected_file");
    });
  });

  await t.test("unbound sibling-attempt file", () => {
    withFixture((root) => {
      const sibling = `${RUN_ROOT}/attempts/attempt-002`;
      writeUtf8(root, `${sibling}/notes.txt`, "not bound\n");
      assertInvalid(root, "layout.unbound_attempt_entry");
    });
  });

  await t.test("private marker in sibling attempt", () => {
    withFixture((root) => {
      const sibling = `${RUN_ROOT}/attempts/attempt-002`;
      writeJson(root, `${sibling}/packet.json`, {
        league_id: "private-league-123",
      });
      assertInvalid(root, "privacy.sibling_structural_violation");
    });
  });

  await t.test("promotion record inside governed run", () => {
    withFixture((root) => {
      writeJson(root, `${ATTEMPT_ROOT}/promotion.json`, {
        authority: "not permitted",
      });
      assertInvalid(root, "authority.promotion_inside_run");
    });
  });

  await t.test("private structural field", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 0).payload.league_id = "private-league-123";
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "privacy.structural_violation");
    });
  });

  await t.test("low-entropy private identifier digest", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, 0).payload.roster_id_hash = `sha256:${"a".repeat(64)}`;
      writeRechainedJsonl(root, LEDGER, events);
      assertInvalid(root, "privacy.structural_violation");
    });
  });

  await t.test("obvious private marker in retained raw source", () => {
    withFixture((root) => {
      appendFileSync(
        absolute(root, SOURCE_CONTENT),
        "\nemail: private@example.test\n",
      );
      assertInvalid(root, "privacy.raw_source_marker");
    });
  });

  await t.test("obvious private marker in allowed job prose", () => {
    withFixture((root) => {
      const jobPath = absolute(root, "job.yaml");
      const job = readFileSync(jobPath, "utf8");
      writeFileSync(
        jobPath,
        job.replace(
          "purpose: Exercise the Stage 0 protocol with invented device observations that have no football or real-world authority.",
          "purpose: Exercise the Stage 0 protocol with invented device observations; contact email private@example.test.",
        ),
        "utf8",
      );
      refreshFrozenJobAuthorization(root);
      refreshTerminalBindings(root);
      assertInvalid(root, "privacy.raw_core_marker");
    });
  });

  await t.test("JSON whitespace rewrite", () => {
    withFixture((root) => {
      const packet = json(root, PACKET);
      writeFileSync(absolute(root, PACKET), `${JSON.stringify(packet)}\n`);
      assertInvalid(root, "candidate.unreadable");
    });
  });
});

test("deterministic rendering and cold resume do not depend on session memory", async (t) => {
  await t.test("packet Markdown is exactly reproducible", () => {
    withFixture((root) => {
      const packet = json<ResearchPacket>(root, PACKET);
      const expected = renderPacketMarkdown(packet);
      assert.equal(readFileSync(absolute(root, PACKET_MD), "utf8"), expected);
      assert.equal(renderPacketMarkdown(structuredClone(packet)), expected);
    });
  });

  await t.test("narrative drift is rejected", () => {
    withFixture((root) => {
      appendFileSync(absolute(root, PACKET_MD), "\nUnsupported prose.\n");
      assertInvalid(root, "packet.markdown_mismatch");
    });
  });

  await t.test("candidate is valid but not end-to-end complete", () => {
    withFixture((root) => {
      for (const path of [SUBMISSION, REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      writeRechainedJsonl(root, RUN_EVENTS, readJsonl(root, RUN_EVENTS).slice(0, 2));

      const candidate = validateAttempt(root, RUN_ID, ATTEMPT_ID);
      assert.equal(candidate.valid, true, JSON.stringify(candidate.errors, null, 2));
      assert.equal(candidate.phase, "candidate");
      assert.equal(candidate.end_to_end_ready, false);
      assert.equal(candidate.resume?.last_status, "attempt_started");

      assertInvalid(
        root,
        "readiness.end_to_end_not_reached",
        { requireEndToEnd: true },
      );
    });
  });

  await t.test("packet-free cold resume uses the validated ledger checkpoint", () => {
    withFixture((root) => {
      for (const path of [PACKET, PACKET_MD, SUBMISSION, REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      retainRunEvents(root, 2);

      const report = validateResume(root, RUN_ID, ATTEMPT_ID);
      assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
      assert.equal(report.phase, "candidate");
      assert.equal(report.end_to_end_ready, false);
      assert.equal(report.archive_id, null);
      assert.equal(report.resume?.last_sequence, 6);
      assert.equal(report.resume?.last_status, "attempt_started");
      assert.deepEqual(report.resume?.next_permitted_actions, [
        "Continue only the bounded research actions allowed by the activated job.",
      ]);
    });
  });

  await t.test("packet-free resume rejects terminal artifacts", () => {
    withFixture((root) => {
      rmSync(absolute(root, PACKET));
      const report = validateResume(root, RUN_ID, ATTEMPT_ID);
      assert.equal(report.valid, false);
      assert.ok(
        report.errors.some(
          (entry) =>
            entry.code === "resume.packet_missing_for_terminal_state",
        ),
      );
      assert.equal(report.archive_id, null);
    });
  });

  await t.test("checkpoint prose cannot leak downstream authority into resume", () => {
    withFixture((root) => {
      const events = readJsonl(root, LEDGER);
      eventAt(events, events.length - 1).payload.next_permitted_actions = [
        "Publish the packet, promote the claim, modify Strategy, and acquire a live source.",
      ];
      writeRechainedJsonl(root, LEDGER, events);
      for (const path of [PACKET, PACKET_MD, SUBMISSION, REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      retainRunEvents(root, 2);

      const report = validateResume(root, RUN_ID, ATTEMPT_ID);
      assert.equal(report.valid, false);
      assert.ok(
        report.errors.some(
          (entry) => entry.code === "resume.action_not_permitted",
        ),
      );
      assert.equal(report.archive_id, null);
      assert.deepEqual(report.resume?.next_permitted_actions, [
        "Continue only the bounded research actions allowed by the activated job.",
      ]);
      assert.doesNotMatch(
        report.resume?.next_permitted_actions.join(" ") ?? "",
        /publish|promot|strategy|live source|acquir/iu,
      );
    });
  });

  await t.test("blocked no-review seal is archivable but never end-to-end ready", () => {
    withFixture((root) => {
      makeBlockedNoReviewFixture(root);
      const report = validateAttempt(root, RUN_ID, ATTEMPT_ID);
      assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
      assert.equal(report.phase, "sealed");
      assert.equal(report.end_to_end_ready, false);
      assert.match(report.archive_id ?? "", /^sha256:[a-f0-9]{64}$/u);
      assert.equal(report.resume?.last_status, "sealed:blocked:not_reached");

      const strict = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        requireEndToEnd: true,
      });
      assert.equal(strict.valid, false);
      assert.ok(
        strict.errors.some(
          (entry) => entry.code === "readiness.end_to_end_not_reached",
        ),
      );
    });
  });

  await t.test("reviewed completed inconclusive result is end-to-end ready without a positive claim", () => {
    withFixture((root) => {
      mutatePacket(root, (packet) => {
        packet.claims = [];
        packet.completion = "inconclusive";
        packet.questions[0].assessment = "insufficient";
        packet.questions[0].blocker_reason = null;
        packet.questions[0].claim_refs = [];
        packet.questions[0].completion = "inconclusive";
        packet.negative_findings = [
          {
            challenge_refs: ["event-005-challenge"],
            evidence_refs: ["event-004-counterevidence"],
            finding_id: "finding-bounded-negative",
            hypothesis_refs: ["event-001-hypothesis"],
            limitations: [
              "This is a governed negative result only for the synthetic fixture.",
            ],
            question_refs: ["question-threshold"],
            statement:
              "The bounded run did not support a promotable positive conclusion.",
            subject_refs: ["device-lantern"],
          },
        ];
      });
      const ledger = readJsonl(root, LEDGER);
      const challenge = eventAt(ledger, 4);
      challenge.payload.claim_refs = [];
      challenge.payload.negative_finding_refs = [
        "finding-bounded-negative",
      ];
      writeRechainedJsonl(root, LEDGER, ledger);
      mutateJson(root, REVIEW, (review) => {
        review.substantive.rationale =
          "The governed negative result is supported and appropriately bounded.";
        review.protocol.rationale =
          "The negative result remains traceable and grants no downstream authority.";
      });
      refreshTerminalBindings(root);

      const report = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        requireEndToEnd: true,
      });
      assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
      assert.equal(report.end_to_end_ready, true);
      assert.match(report.archive_id ?? "", /^sha256:[a-f0-9]{64}$/u);
    });
  });

  await t.test("synthetic fixture builder rejects a non-synthetic activation", () => {
    withFixture((root) => {
      mutateJson(root, ACTIVATION, (activation) => {
        activation.synthetic_fixture = false;
      });
      assert.throws(
        () => buildSyntheticFixture(root, RUN_ID, ATTEMPT_ID),
        /fixture builder requires an explicitly synthetic job and activation/u,
      );
    });
  });
});

test("invalid writer metadata leaves artifacts and run events unchanged", async (t) => {
  const validSubmissionMetadata: SubmissionMetadata = {
    actor_session_ref: "actor-executor-001",
    model_declared: "none",
    observed_by: "fixture-builder",
    provider_declared: "deterministic-synthetic-fixture",
    submitted_at: "2026-01-15T12:30:00Z",
    validated_at: "2026-01-15T12:29:00Z",
  };
  const validReviewMetadata: ReviewMetadata = {
    actor_session_ref: "actor-reviewer-001",
    independence_basis:
      "Fresh synthetic reviewer context receives only the frozen submission.",
    independence_limits: [
      "The fixture tests protocol binding, not empirical truth or reviewer competence.",
    ],
    limitations: [
      "This deterministic fixture is non-football-authoritative and grants no downstream authority.",
    ],
    model_declared: "none",
    overall_verdict: "pass",
    protocol: {
      findings: [],
      rationale:
        "The synthetic claim is traceable to admitted bytes, a calculation, and an explicit challenge.",
      verdict: "pass",
    },
    provider_declared: "deterministic-synthetic-fixture",
    review_id: "synthetic-review-001",
    reviewed_at: "2026-01-15T12:35:00Z",
    substantive: {
      findings: [],
      rationale:
        "The fictional threshold claim represents its admitted supporting and contrary observations.",
      verdict: "pass",
    },
  };

  await t.test("invalid attempt start is not appended", () => {
    withFixture((root) => {
      for (const path of [SUBMISSION, REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      retainRunEvents(root, 1);
      const runEventsBefore = readFileSync(absolute(root, RUN_EVENTS), "utf8");
      const ledgerBefore = readFileSync(absolute(root, LEDGER), "utf8");

      assert.throws(
        () =>
          createAttemptStart(root, RUN_ID, ATTEMPT_ID, {
            actor_session_ref: "actor-orchestrator-001",
            started_at: "not-a-timestamp",
          }),
        /timestamp|date-time|started_at/iu,
      );
      assert.equal(
        readFileSync(absolute(root, RUN_EVENTS), "utf8"),
        runEventsBefore,
      );
      assert.equal(readFileSync(absolute(root, LEDGER), "utf8"), ledgerBefore);
      assert.equal(readJsonl(root, RUN_EVENTS).length, 1);
    });
  });

  await t.test("invalid submission creates neither artifact nor event", () => {
    withFixture((root) => {
      for (const path of [SUBMISSION, REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      retainRunEvents(root, 2);
      const runEventsBefore = readFileSync(absolute(root, RUN_EVENTS), "utf8");

      assert.throws(
        () =>
          createSubmission(root, RUN_ID, ATTEMPT_ID, {
            ...validSubmissionMetadata,
            submitted_at: "not-a-timestamp",
          }),
        /timestamp|date-time|submitted_at/iu,
      );
      assert.equal(existsSync(absolute(root, SUBMISSION)), false);
      assert.equal(
        readFileSync(absolute(root, RUN_EVENTS), "utf8"),
        runEventsBefore,
      );
      const candidate = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        phase: "candidate",
      });
      assert.equal(
        candidate.valid,
        true,
        JSON.stringify(candidate.errors, null, 2),
      );
    });
  });

  await t.test("invalid review creates neither artifact nor event", () => {
    withFixture((root) => {
      for (const path of [REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      retainRunEvents(root, 3);
      const runEventsBefore = readFileSync(absolute(root, RUN_EVENTS), "utf8");

      assert.throws(
        () =>
          createReview(root, RUN_ID, ATTEMPT_ID, {
            ...validReviewMetadata,
            reviewed_at: "not-a-timestamp",
          }),
        /timestamp|date-time|reviewed_at/iu,
      );
      assert.equal(existsSync(absolute(root, REVIEW)), false);
      assert.equal(
        readFileSync(absolute(root, RUN_EVENTS), "utf8"),
        runEventsBefore,
      );
      const submitted = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        phase: "submitted",
      });
      assert.equal(
        submitted.valid,
        true,
        JSON.stringify(submitted.errors, null, 2),
      );
    });
  });

  await t.test("invalid seal creates neither artifact nor event", () => {
    withFixture((root) => {
      rmSync(absolute(root, SEAL));
      retainRunEvents(root, 4);
      const runEventsBefore = readFileSync(absolute(root, RUN_EVENTS), "utf8");

      assert.throws(
        () =>
          createSeal(root, RUN_ID, ATTEMPT_ID, {
            predecessor_attempt_ref: null,
            sealed_at: "not-a-timestamp",
          }),
        /timestamp|date-time|sealed_at/iu,
      );
      assert.equal(existsSync(absolute(root, SEAL)), false);
      assert.equal(
        readFileSync(absolute(root, RUN_EVENTS), "utf8"),
        runEventsBefore,
      );
      const reviewed = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        phase: "reviewed",
      });
      assert.equal(
        reviewed.valid,
        true,
        JSON.stringify(reviewed.errors, null, 2),
      );
    });
  });
});

test("terminal writers are idempotent only for the exact frozen record", async (t) => {
  const submissionMetadata: SubmissionMetadata = {
    actor_session_ref: "actor-executor-001",
    model_declared: "none",
    observed_by: "fixture-builder",
    provider_declared: "deterministic-synthetic-fixture",
    submitted_at: "2026-01-15T12:30:00Z",
    validated_at: "2026-01-15T12:29:00Z",
  };
  const reviewMetadata: ReviewMetadata = {
    actor_session_ref: "actor-reviewer-001",
    independence_basis:
      "Fresh synthetic reviewer context receives only the frozen submission.",
    independence_limits: [
      "The fixture tests protocol binding, not empirical truth or reviewer competence.",
    ],
    limitations: [
      "This deterministic fixture is non-football-authoritative and grants no downstream authority.",
    ],
    model_declared: "none",
    overall_verdict: "pass",
    protocol: {
      findings: [],
      rationale:
        "The synthetic claim is traceable to admitted bytes, a calculation, and an explicit challenge.",
      verdict: "pass",
    },
    provider_declared: "deterministic-synthetic-fixture",
    review_id: "synthetic-review-001",
    reviewed_at: "2026-01-15T12:35:00Z",
    substantive: {
      findings: [],
      rationale:
        "The fictional threshold claim represents its admitted supporting and contrary observations.",
      verdict: "pass",
    },
  };

  await t.test("submission preflight does not dereference an external governed artifact", () => {
    withFixture((root) => {
      const externalPath = "governed/external-baseline.json";
      mutateJson(root, INPUTS, (inputs) => {
        inputs.artifacts.push({
          admissibility: "admitted",
          artifact_digest: `sha256:${"6".repeat(64)}`,
          artifact_id: "artifact-external-governed",
          blob_digest: `sha256:${"7".repeat(64)}`,
          commit: "8".repeat(40),
          freshness: "current",
          path: externalPath,
          repository: "Prometheus-Frameworks/External",
        });
      });
      refreshFrozenInputAuthorization(root);
      refreshTerminalBindings(root);
      for (const path of [SUBMISSION, REVIEW, SEAL]) {
        rmSync(absolute(root, path));
      }
      retainRunEvents(root, 2);
      assert.equal(existsSync(absolute(root, externalPath)), false);

      const digest = createSubmission(
        root,
        RUN_ID,
        ATTEMPT_ID,
        submissionMetadata,
      );
      assert.match(digest, /^sha256:[a-f0-9]{64}$/u);
      assert.equal(existsSync(absolute(root, externalPath)), false);
      const submitted = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
        phase: "submitted",
      });
      assert.equal(
        submitted.valid,
        true,
        JSON.stringify(submitted.errors, null, 2),
      );
    });
  });

  await t.test("submission exact-byte recovery returns the frozen digest", () => {
    withFixture((root) => {
      const digest = createSubmission(
        root,
        RUN_ID,
        ATTEMPT_ID,
        submissionMetadata,
      );
      assert.equal(digest, sha256CanonicalJson(json(root, SUBMISSION)));

      assert.throws(
        () =>
          createSubmission(root, RUN_ID, ATTEMPT_ID, {
            ...submissionMetadata,
            submitted_at: "2026-01-15T12:31:00Z",
          }),
        /existing generated bytes differ|frozen|EEXIST/u,
      );
    });
  });

  await t.test("review exact-byte recovery returns the frozen digest", () => {
    withFixture((root) => {
      const digest = createReview(
        root,
        RUN_ID,
        ATTEMPT_ID,
        reviewMetadata,
      );
      assert.equal(digest, sha256CanonicalJson(json(root, REVIEW)));

      assert.throws(
        () =>
          createReview(root, RUN_ID, ATTEMPT_ID, {
            ...reviewMetadata,
            reviewed_at: "2026-01-15T12:35:01Z",
          }),
        /existing generated bytes differ|frozen|EEXIST/u,
      );
    });
  });

  await t.test("seal exact-byte recovery returns the frozen digest", () => {
    withFixture((root) => {
      const metadata = {
        predecessor_attempt_ref: null,
        sealed_at: "2026-01-15T12:36:00Z",
      } as const;
      const digest = createSeal(root, RUN_ID, ATTEMPT_ID, metadata);
      assert.equal(digest, sha256CanonicalJson(json(root, SEAL)));

      assert.throws(
        () =>
          createSeal(root, RUN_ID, ATTEMPT_ID, {
            predecessor_attempt_ref: null,
            sealed_at: "2026-01-15T12:37:00Z",
          }),
        /existing generated bytes differ|frozen|EEXIST/u,
      );
    });
  });
});
