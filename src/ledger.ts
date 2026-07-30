import {
  canonicalizeJson,
  decodeUtf8Strict,
  parseJsonStrict,
  type JsonObject,
  type JsonValue,
} from "./canonical.js";
import {
  isSha256Digest,
  sha256CanonicalJson,
  type Sha256Digest,
} from "./digest.js";

export interface LedgerEventRecord extends JsonObject {
  schema_version: string;
  event_id: string;
  run_id: string;
  attempt_id: string;
  sequence: number;
  previous_event_hash: Sha256Digest | null;
  event_type: string;
  actor_session_ref: string;
  authoring_role: string;
  provider_declared: string;
  model_declared: string;
  recorded_at: string;
  parent_event_refs: JsonValue[];
  source_refs: JsonValue[];
  epistemic_class: string;
  freshness_state: string;
  admissibility_state: string;
  applicable_scope: {
    question_refs: JsonValue[];
    subject_refs: JsonValue[];
    comparison_refs: JsonValue[];
  };
  limitations: string[];
  payload: JsonObject;
  event_hash: Sha256Digest;
}

export interface LedgerJsonlOptions {
  /** Append-oriented ledgers end every complete event with LF. Defaults true. */
  requireFinalNewline?: boolean;
  /** An empty active attempt is normally invalid. Defaults false. */
  allowEmpty?: boolean;
  /** Canonical Stage 0 JSONL uses LF, not CRLF. Defaults false. */
  allowCrlf?: boolean;
}

export class LedgerJsonlError extends SyntaxError {
  readonly line?: number;

  constructor(message: string, line?: number, cause?: unknown) {
    super(line === undefined ? message : `line ${line}: ${message}`, {
      cause,
    });
    this.name = "LedgerJsonlError";
    if (line !== undefined) {
      this.line = line;
    }
  }
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Parse one strict JSON object per LF-terminated line.
 *
 * Duplicate member names (including escape-equivalent names), blank records,
 * malformed UTF-8, CRLF by default, and truncated final records fail closed.
 */
export function parseLedgerJsonl(
  input: string | Uint8Array,
  options: LedgerJsonlOptions = {},
): LedgerEventRecord[] {
  const requireFinalNewline = options.requireFinalNewline ?? true;
  const allowEmpty = options.allowEmpty ?? false;
  const allowCrlf = options.allowCrlf ?? false;
  let source = typeof input === "string" ? input : decodeUtf8Strict(input);

  if (!allowCrlf && source.includes("\r")) {
    throw new LedgerJsonlError("carriage returns are prohibited; use LF JSONL");
  }
  if (allowCrlf) {
    source = source.replaceAll("\r\n", "\n");
    if (source.includes("\r")) {
      throw new LedgerJsonlError("bare carriage returns are prohibited");
    }
  }

  if (source.length === 0) {
    if (allowEmpty) {
      return [];
    }
    throw new LedgerJsonlError("ledger must contain at least one complete event");
  }
  if (requireFinalNewline && !source.endsWith("\n")) {
    throw new LedgerJsonlError(
      "ledger is not LF-terminated; the final record may be truncated",
    );
  }

  const recordText = source.endsWith("\n") ? source.slice(0, -1) : source;
  if (recordText.length === 0) {
    if (allowEmpty) {
      return [];
    }
    throw new LedgerJsonlError("ledger must contain at least one complete event");
  }

  const lines = recordText.split("\n");
  const events: LedgerEventRecord[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index] as string;
    if (line.trim().length === 0) {
      throw new LedgerJsonlError("blank JSONL records are prohibited", lineNumber);
    }

    let value: JsonValue;
    try {
      value = parseJsonStrict(line);
    } catch (error) {
      throw new LedgerJsonlError("invalid strict JSON record", lineNumber, error);
    }
    if (!isJsonObject(value)) {
      throw new LedgerJsonlError(
        "ledger record must be a JSON object",
        lineNumber,
      );
    }
    if (line !== canonicalizeJson(value)) {
      throw new LedgerJsonlError(
        "record bytes do not use canonical compact JSON",
        lineNumber,
      );
    }
    events.push(value as LedgerEventRecord);
  }
  return events;
}

function eventHashProjection(event: Readonly<Record<string, unknown>>): JsonObject {
  const prototype = Object.getPrototypeOf(event);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("Ledger event must be a plain JSON object");
  }

  const projection = Object.create(null) as JsonObject;
  for (const key of Reflect.ownKeys(event)) {
    if (typeof key === "symbol") {
      // Feed an explicit invalid value through canonicalization for its stable
      // path-aware error rather than silently omitting a hidden member.
      canonicalizeJson(event);
      throw new TypeError("Ledger event has a symbol property");
    }
    if (key === "event_hash") {
      continue;
    }
    const descriptor = Object.getOwnPropertyDescriptor(event, key);
    if (
      descriptor === undefined ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new TypeError(
        `Ledger event member ${JSON.stringify(key)} must be an enumerable data property`,
      );
    }
    projection[key] = descriptor.value as JsonValue;
  }
  return projection;
}

/** Hash every top-level event member except the event_hash member itself. */
export function calculateLedgerEventHash(
  event: Readonly<Record<string, unknown>>,
): Sha256Digest {
  return sha256CanonicalJson(eventHashProjection(event));
}

export const hashLedgerEvent = calculateLedgerEventHash;

/**
 * Add a self-hash to a new event. Existing event_hash members are rejected so
 * callers cannot accidentally bless a rewritten frozen event.
 */
export function finalizeLedgerEvent<T extends Record<string, unknown>>(
  event: T,
): T & { event_hash: Sha256Digest } {
  if (Object.hasOwn(event, "event_hash")) {
    throw new TypeError("Cannot finalize an event that already has event_hash");
  }
  const event_hash = calculateLedgerEventHash(event);
  return { ...event, event_hash };
}

export type LedgerIssueCode =
  | "actor_not_allowed"
  | "actor_session_handoff_invalid"
  | "actor_session_changed"
  | "attempt_changed"
  | "duplicate_event_id"
  | "empty_ledger"
  | "event_hash_invalid"
  | "event_hash_mismatch"
  | "event_id_invalid"
  | "event_not_object"
  | "previous_hash_invalid"
  | "previous_hash_mismatch"
  | "run_changed"
  | "schema_version_mismatch"
  | "sequence_invalid"
  | "sequence_mismatch";

export interface LedgerValidationIssue {
  code: LedgerIssueCode;
  event_index?: number;
  event_id?: string;
  message: string;
}

export interface LedgerValidationOptions {
  requireEvents?: boolean;
  expectedSchemaVersion?: string;
  expectedRunId?: string;
  expectedAttemptId?: string;
  /**
   * Bind the active append authority to one actor session when the activation
   * provides that exact identity.
   */
  expectedActorSessionRef?: string;
  allowedActorSessionRefs?: readonly string[];
  /**
   * Permit a new sole executor session only immediately after a checkpoint.
   * This preserves cold resume without treating session identity as proof of
   * append authority.
   */
  requireCheckpointSessionHandoff?: boolean;
  /**
   * Require all records to share actor_session_ref. Defaults false because a
   * governed cold resume may create a new session for the same sole executor.
   */
  requireSingleActorSession?: boolean;
}

export interface LedgerValidationResult {
  valid: boolean;
  event_count: number;
  head: Sha256Digest | null;
  last_validated_sequence: number;
  last_validated_head: Sha256Digest | null;
  issues: LedgerValidationIssue[];
}

function recordIssue(
  issues: LedgerValidationIssue[],
  code: LedgerIssueCode,
  eventIndex: number | undefined,
  eventId: string | undefined,
  message: string,
): void {
  const issue: LedgerValidationIssue = { code, message };
  if (eventIndex !== undefined) {
    issue.event_index = eventIndex;
  }
  if (eventId !== undefined) {
    issue.event_id = eventId;
  }
  issues.push(issue);
}

function stringMember(
  event: Readonly<Record<string, unknown>>,
  key: string,
): string | undefined {
  const value = event[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Validate strict sequence, stable run/attempt identity, unique IDs, the
 * previous-event chain, and every event's self-hash.
 *
 * This proves serialized append order. The executing environment must still
 * ensure only the activated writer can open the ledger for append.
 */
export function validateLedgerChain(
  inputEvents: readonly unknown[],
  options: LedgerValidationOptions = {},
): LedgerValidationResult {
  const issues: LedgerValidationIssue[] = [];
  const requireEvents = options.requireEvents ?? true;
  if (inputEvents.length === 0 && requireEvents) {
    recordIssue(
      issues,
      "empty_ledger",
      undefined,
      undefined,
      "Ledger must contain at least one event",
    );
  }

  let runId = options.expectedRunId;
  let attemptId = options.expectedAttemptId;
  let firstActorSession: string | undefined;
  let previousActorSession: string | undefined;
  let previousEventType: string | undefined;
  let previousDeclaredHash: Sha256Digest | null = null;
  let prefixValid = true;
  let lastValidatedHead: Sha256Digest | null = null;
  let lastValidatedSequence = 0;
  const eventIds = new Set<string>();

  for (let index = 0; index < inputEvents.length; index += 1) {
    const eventIndex = index;
    const expectedSequence = index + 1;
    const issueCountBeforeEvent = issues.length;
    const unknownEvent = inputEvents[index];

    if (
      unknownEvent === null ||
      typeof unknownEvent !== "object" ||
      Array.isArray(unknownEvent)
    ) {
      recordIssue(
        issues,
        "event_not_object",
        eventIndex,
        undefined,
        "Ledger event must be a JSON object",
      );
      prefixValid = false;
      previousDeclaredHash = null;
      continue;
    }

    const event = unknownEvent as Readonly<Record<string, unknown>>;
    const eventId = stringMember(event, "event_id");
    if (eventId === undefined) {
      recordIssue(
        issues,
        "event_id_invalid",
        eventIndex,
        undefined,
        "event_id must be a non-empty string",
      );
    } else if (eventIds.has(eventId)) {
      recordIssue(
        issues,
        "duplicate_event_id",
        eventIndex,
        eventId,
        `Duplicate event_id ${eventId}`,
      );
    } else {
      eventIds.add(eventId);
    }

    const sequence = event.sequence;
    if (!Number.isSafeInteger(sequence) || (sequence as number) < 1) {
      recordIssue(
        issues,
        "sequence_invalid",
        eventIndex,
        eventId,
        "sequence must be a positive safe integer",
      );
    } else if (sequence !== expectedSequence) {
      recordIssue(
        issues,
        "sequence_mismatch",
        eventIndex,
        eventId,
        `Expected sequence ${expectedSequence}; received ${String(sequence)}`,
      );
    }

    const currentRunId = stringMember(event, "run_id");
    if (runId === undefined) {
      runId = currentRunId;
    } else if (currentRunId !== runId) {
      recordIssue(
        issues,
        "run_changed",
        eventIndex,
        eventId,
        `Expected run_id ${runId}; received ${String(event.run_id)}`,
      );
    }

    const currentAttemptId = stringMember(event, "attempt_id");
    if (attemptId === undefined) {
      attemptId = currentAttemptId;
    } else if (currentAttemptId !== attemptId) {
      recordIssue(
        issues,
        "attempt_changed",
        eventIndex,
        eventId,
        `Expected attempt_id ${attemptId}; received ${String(event.attempt_id)}`,
      );
    }

    if (
      options.expectedSchemaVersion !== undefined &&
      event.schema_version !== options.expectedSchemaVersion
    ) {
      recordIssue(
        issues,
        "schema_version_mismatch",
        eventIndex,
        eventId,
        `Expected schema_version ${options.expectedSchemaVersion}; received ${String(event.schema_version)}`,
      );
    }

    const actorSession = stringMember(event, "actor_session_ref");
    if (firstActorSession === undefined) {
      firstActorSession = actorSession;
    }
    if (
      options.expectedActorSessionRef !== undefined &&
      actorSession !== options.expectedActorSessionRef
    ) {
      recordIssue(
        issues,
        "actor_not_allowed",
        eventIndex,
        eventId,
        `Expected actor_session_ref ${options.expectedActorSessionRef}; received ${String(event.actor_session_ref)}`,
      );
    }
    if (
      options.allowedActorSessionRefs !== undefined &&
      (actorSession === undefined ||
        !options.allowedActorSessionRefs.includes(actorSession))
    ) {
      recordIssue(
        issues,
        "actor_not_allowed",
        eventIndex,
        eventId,
        `actor_session_ref is not in the activated allowlist: ${String(event.actor_session_ref)}`,
      );
    }
    if (
      options.requireSingleActorSession === true &&
      firstActorSession !== undefined &&
      actorSession !== firstActorSession
    ) {
      recordIssue(
        issues,
        "actor_session_changed",
        eventIndex,
        eventId,
        `Expected one actor_session_ref ${firstActorSession}; received ${String(event.actor_session_ref)}`,
      );
    }
    if (
      options.requireCheckpointSessionHandoff === true &&
      previousActorSession !== undefined &&
      actorSession !== undefined &&
      actorSession !== previousActorSession &&
      previousEventType !== "checkpoint"
    ) {
      recordIssue(
        issues,
        "actor_session_handoff_invalid",
        eventIndex,
        eventId,
        `actor_session_ref may change only after a checkpoint; prior event type was ${String(previousEventType)}`,
      );
    }

    const declaredPrevious = event.previous_event_hash;
    if (index === 0) {
      if (declaredPrevious !== null) {
        recordIssue(
          issues,
          "previous_hash_mismatch",
          eventIndex,
          eventId,
          "The first event must declare previous_event_hash as null",
        );
      }
    } else if (!isSha256Digest(declaredPrevious)) {
      recordIssue(
        issues,
        "previous_hash_invalid",
        eventIndex,
        eventId,
        "previous_event_hash must be a lowercase tagged SHA-256 digest",
      );
    } else if (
      previousDeclaredHash === null ||
      declaredPrevious !== previousDeclaredHash
    ) {
      recordIssue(
        issues,
        "previous_hash_mismatch",
        eventIndex,
        eventId,
        `previous_event_hash does not match the prior event hash`,
      );
    }

    const declaredHash = event.event_hash;
    if (!isSha256Digest(declaredHash)) {
      recordIssue(
        issues,
        "event_hash_invalid",
        eventIndex,
        eventId,
        "event_hash must be a lowercase tagged SHA-256 digest",
      );
      previousDeclaredHash = null;
    } else {
      let calculatedHash: Sha256Digest | undefined;
      try {
        calculatedHash = calculateLedgerEventHash(event);
      } catch (error) {
        recordIssue(
          issues,
          "event_not_object",
          eventIndex,
          eventId,
          `Event cannot be canonicalized: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      if (calculatedHash !== undefined && declaredHash !== calculatedHash) {
        recordIssue(
          issues,
          "event_hash_mismatch",
          eventIndex,
          eventId,
          `event_hash does not match canonical event bytes; expected ${calculatedHash}`,
        );
      }
      previousDeclaredHash = declaredHash;
    }

    if (prefixValid && issues.length === issueCountBeforeEvent && isSha256Digest(declaredHash)) {
      lastValidatedHead = declaredHash;
      lastValidatedSequence = expectedSequence;
    } else {
      prefixValid = false;
    }
    previousActorSession = actorSession;
    previousEventType = stringMember(event, "event_type");
  }

  const valid = issues.length === 0;
  return {
    valid,
    event_count: inputEvents.length,
    head: valid ? previousDeclaredHash : null,
    last_validated_sequence: lastValidatedSequence,
    last_validated_head: lastValidatedHead,
    issues,
  };
}

export class LedgerChainError extends Error {
  readonly result: LedgerValidationResult;

  constructor(result: LedgerValidationResult) {
    super(
      `Invalid ledger chain: ${result.issues
        .map((issue) => issue.message)
        .join("; ")}`,
    );
    this.name = "LedgerChainError";
    this.result = result;
  }
}

export function assertValidLedgerChain(
  events: readonly unknown[],
  options: LedgerValidationOptions = {},
): asserts events is readonly LedgerEventRecord[] {
  const result = validateLedgerChain(events, options);
  if (!result.valid) {
    throw new LedgerChainError(result);
  }
}

export interface NextLedgerLink {
  sequence: number;
  previous_event_hash: Sha256Digest | null;
}

/**
 * Return the only valid link for the next serialized append. Existing bytes
 * must be revalidated immediately before the writer appends.
 */
export function nextLedgerLink(
  events: readonly unknown[],
  options: LedgerValidationOptions = {},
): NextLedgerLink {
  if (events.length === 0) {
    return { sequence: 1, previous_event_hash: null };
  }
  const validation = validateLedgerChain(events, {
    ...options,
    requireEvents: true,
  });
  if (!validation.valid || validation.head === null) {
    throw new LedgerChainError(validation);
  }
  return {
    sequence: validation.event_count + 1,
    previous_event_hash: validation.head,
  };
}
