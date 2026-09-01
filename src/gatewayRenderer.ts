import type {
  GatewayIntakeReport,
  GatewayIntakeStudySheet,
  GatewayPacketReport,
  GatewayStatusReport,
} from "./gateway.js";

/**
 * Concise default view of a validated intake proposal. It preserves the
 * epistemic qualifiers needed for confirmation while omitting evidence
 * locators, retrieval internals, and raw validation output.
 */
export function renderGatewayIntakeMarkdown(
  report: Readonly<GatewayIntakeReport>,
): string {
  const lines = ["# Research intake", ""];
  field(
    lines,
    "Result",
    report.result === "OPERATOR_CONFIRMED_NOT_ACTIVATED"
      ? "Agent/provider-declared operator confirmation; unauthenticated by the gateway; not activated"
      : humanize(report.result),
  );
  field(lines, "Basis", humanize(report.result_basis));
  executionField(lines);
  empiricalBoundaryField(lines);
  field(
    lines,
    "Trust boundary",
    report.valid
      ? "Contract-consistent agent/provider declarations only; no provider or operator authentication, source retrieval, or source-byte comparison"
      : "Schema and cross-field consistency not established; no agent/provider declaration accepted as contract-consistent",
  );
  field(
    lines,
    "Confirmation declaration",
    report.valid
      ? `Agent/provider-declared; unauthenticated by the gateway: ${humanize(report.confirmation_state)}`
      : "Not accepted; intake is invalid",
  );
  if (report.valid && report.operator_confirmation !== null) {
    field(
      lines,
      "Confirmation scope",
      `${humanize(report.operator_confirmation.confirmation_scope)} (agent/provider-declared; unauthenticated by the gateway)`,
    );
    textList(
      lines,
      "Confirmation exceptions",
      report.operator_confirmation.exceptions,
    );
  }
  field(lines, "Freeze", "Not frozen");
  field(lines, "Activation", "Not activated");
  field(lines, "Authority", "Unpromoted; no downstream authority");

  if (!report.valid || report.study_sheet === null) {
    field(lines, "Next boundary", "A valid intake proposal is required");
    field(lines, "Validation issue count", String(report.validation_errors.length));
    return finish(lines);
  }
  const identifierAliases = intakeIdentifierAliases(report.study_sheet);

  lines.push(
    "",
    "## Received operator take",
    "",
    escapeText(report.study_sheet.received_take.received_text),
  );
  field(
    lines,
    "Operator stance",
    `${humanize(report.study_sheet.received_take.operator_stance)} (agent/provider-declared; unauthenticated by the gateway)`,
  );
  field(
    lines,
    "Stance basis",
    `${humanize(report.study_sheet.received_take.stance_basis)} (agent/provider-declared; unauthenticated by the gateway)`,
  );
  field(
    lines,
    "Byte identity declaration",
    report.study_sheet.received_take.byte_identity ===
      "verified_against_operator_source"
      ? "Agent/provider-declared; unauthenticated by the gateway: verified against operator source"
      : "Agent/provider-declared; unauthenticated by the gateway: not established against the operator source",
  );
  textList(
    lines,
    "Known transport notes",
    report.study_sheet.received_take.transport_notes,
  );
  lines.push("", "## Proposed interpretation", "", escapeText(report.study_sheet.interpretation_summary));
  textList(lines, "Not understood", report.study_sheet.not_understood);
  field(lines, "Agent additions", report.study_sheet.agent_additions);
  field(
    lines,
    "Evidence access declaration",
    `Agent/provider-declared; unauthenticated by the gateway: ${humanize(report.study_sheet.agent_evidence_access)}`,
  );
  field(
    lines,
    "Evidence access note",
    `Agent/provider-declared; unauthenticated by the gateway: ${report.study_sheet.agent_evidence_access_note}`,
  );

  if (report.study_sheet.subjects.length > 0) {
    lines.push("", "## Subjects", "");
    for (const subject of report.study_sheet.subjects) {
      if (subject.resolution === null) {
        lines.push(
          `- ${escapeText(subject.label_in_take)} — Subject resolution declaration (agent/provider-declared; unauthenticated by the gateway): unresolved (${inlineIdentifier(subject.kind, identifierAliases)})`,
        );
      } else {
        lines.push(
          `- ${escapeText(subject.label_in_take)} — Subject resolution declaration (agent/provider-declared; unauthenticated by the gateway): ${escapeText(subject.resolution.resolved_label)} (${inlineCode(subject.resolution.resolution_basis)})`,
        );
      }
    }
  }

  if (report.study_sheet.proposed_elements.length > 0) {
    lines.push("", "## Proposed elements", "");
    for (const element of report.study_sheet.proposed_elements) {
      lines.push(`### ${escapeText(element.label)}`, "");
      lines.push(`- ${escapeText(element.statement)}`);
      field(
        lines,
        "Epistemic qualifiers",
        `${humanize(element.origin)}; ${humanize(element.basis)}; ${humanize(element.epistemic_class)}; ${humanize(element.assessment)}`,
      );
      referenceList(lines, "Evidence references", element.evidence_refs, identifierAliases);
      referenceList(lines, "Subject references", element.subject_refs, identifierAliases);
      if (element.uncertainty !== null) {
        field(lines, "Uncertainty", element.uncertainty);
      }
    }
  }

  if (report.study_sheet.proposed_links.length > 0) {
    lines.push("", "## Proposed links", "");
    for (const link of report.study_sheet.proposed_links) {
      lines.push(
        `### ${inlineIdentifier(link.from_element, identifierAliases)} → ${inlineIdentifier(link.to_element, identifierAliases)}`,
        "",
      );
      field(lines, "Mechanism", link.mechanism);
      field(
        lines,
        "Epistemic qualifiers",
        `${humanize(link.origin)}; ${humanize(link.basis)}; ${humanize(link.epistemic_class)}; ${humanize(link.assessment)}; necessity ${humanize(link.necessity)}`,
      );
      referenceList(lines, "Evidence references", link.evidence_refs, identifierAliases);
      referenceList(
        lines,
        "Counterevidence references",
        link.counterevidence_refs,
        identifierAliases,
      );
      textList(lines, "Falsifiers", link.falsifiers);
      if (link.uncertainty !== null) {
        field(lines, "Uncertainty", link.uncertainty);
      }
    }
  }

  if (report.study_sheet.evidence_inventory.length > 0) {
    lines.push("", "## Evidence inventory", "");
    for (const evidence of report.study_sheet.evidence_inventory) {
      lines.push(`- ${escapeText(evidence.statement)}`);
      field(
        lines,
        "  Qualifiers",
        `${humanize(evidence.basis)}; agent/provider-declared retrieval ${evidence.verified ? "verified" : "unverified"}; unauthenticated by the gateway; non-promotable`,
      );
    }
  }

  if (report.study_sheet.alternative_paths.length > 0) {
    lines.push("", "## Alternative paths", "");
    for (const path of report.study_sheet.alternative_paths) {
      lines.push(`- ${escapeText(path.description)}`);
      field(
        lines,
        "  Qualifiers",
        `${humanize(path.raised_by)}; ${humanize(path.relation)}`,
      );
    }
  }

  if (report.study_sheet.unsupported_assumptions.length > 0) {
    lines.push("", "## Unsupported assumptions", "");
    for (const assumption of report.study_sheet.unsupported_assumptions) {
      lines.push(`- ${escapeText(assumption.statement)}`);
      field(lines, "  Surfaced by", humanize(assumption.surfaced_by));
      referenceList(lines, "  Attached to", assumption.attached_to, identifierAliases);
    }
  }

  if (report.study_sheet.missing_witnesses.length > 0) {
    lines.push("", "## Missing witnesses", "");
    for (const witness of report.study_sheet.missing_witnesses) {
      lines.push(`- ${escapeText(witness.statement)} (${inlineCode(witness.status)})`);
      referenceList(lines, "  Would resolve", witness.would_resolve, identifierAliases);
    }
  }
  textList(
    lines,
    "Unanswered clarifications",
    report.study_sheet.unanswered_clarifications,
  );
  textList(lines, "Thesis falsifiers", report.study_sheet.thesis_falsifiers);
  lines.push("", "## Boundary", "");
  field(
    lines,
    "Declaration-derived boundary (not authorized)",
    humanize(report.next_boundary),
  );
  return finish(lines);
}

/**
 * Concise lifecycle view. On protocol failure it intentionally prints only
 * non-sensitive reason codes and never repeats phase, verdict, or next-action
 * labels derived from inconsistent bytes.
 */
export function renderGatewayStatusMarkdown(
  report: Readonly<GatewayStatusReport>,
): string {
  const lines = ["# Research status", ""];
  field(lines, "Result", humanize(report.result));
  field(lines, "Basis", humanize(report.result_basis));
  executionField(lines);
  empiricalBoundaryField(lines);
  if (!report.protocol_valid) {
    field(lines, "Authority", "No action inferred from inconsistent state");
    referenceList(lines, "Reason codes", report.reason_codes);
    return finish(lines);
  }

  field(
    lines,
    "Run",
    structuredIdentifier(report.run_id, "Run"),
  );
  field(
    lines,
    "Attempt",
    structuredIdentifier(report.attempt_id, "Attempt"),
  );
  field(lines, "Cutoff", report.cutoff_at ?? "Unknown");
  field(lines, "Phase", report.phase ?? "Unknown");
  field(lines, "Lifecycle", report.lifecycle_state ?? "Unknown");
  field(lines, "Packet", humanize(report.packet_state));
  field(
    lines,
    "Review",
    report.review_verdict === null
      ? humanize(report.review_state)
      : `${humanize(report.review_state)}: ${humanize(report.review_verdict)}`,
  );
  field(lines, "Seal", humanize(report.seal_state));
  field(lines, "Completion", report.completion === null ? "Not reached" : humanize(report.completion));
  field(
    lines,
    "Process terminal",
    report.process_terminal === null
      ? "Not reached"
      : humanize(report.process_terminal),
  );
  field(
    lines,
    "Reportability",
    report.reportability === null ? "Not reached" : humanize(report.reportability),
  );
  field(
    lines,
    "Authority",
    `${humanize(report.authority_state ?? "not_reported")}; ${humanize(report.downstream_authority ?? "no_downstream_authority_reported")}`,
  );
  field(
    lines,
    "Authority ceiling",
    report.authority_ceiling === null
      ? "Not reported"
      : humanize(report.authority_ceiling),
  );
  field(lines, "End-to-end ready", report.end_to_end_ready ? "Yes" : "No");

  if (report.phase === "candidate" && report.frontier_question !== null) {
    field(lines, "Frontier question", report.frontier_question);
  }
  if (report.phase === "candidate" && report.budgets_remaining !== null) {
    recordList(lines, "Budgets remaining", report.budgets_remaining);
  }

  if (report.blockers.length > 0) {
    referenceList(lines, "Blockers", report.blockers);
  }
  if (report.open_evidence_gaps.length > 0) {
    textList(lines, "Open evidence gaps", report.open_evidence_gaps);
  }
  if (report.next_permitted_actions.length > 0) {
    textList(lines, "Next permitted actions", report.next_permitted_actions);
  }
  return finish(lines);
}

/**
 * Default packet view is deliberately a summary. The full deterministic
 * packet Markdown remains available as the explicit `body.markdown` audit
 * field; it is not dumped into the default surface.
 */
export function renderGatewayPacketMarkdown(
  report: Readonly<GatewayPacketReport>,
): string {
  const lines = ["# Research packet", ""];
  field(lines, "Result", humanize(report.result));
  field(lines, "Basis", humanize(report.result_basis));
  executionField(lines);
  empiricalBoundaryField(lines);
  if (!report.protocol_valid) {
    field(lines, "Packet body", "Withheld because protocol validation failed");
    field(lines, "Authority", "No action inferred from inconsistent state");
    return finish(lines);
  }
  if (report.body === null) {
    field(lines, "Packet body", "Not available at this lifecycle phase");
    return finish(lines);
  }

  const packet = report.body.packet;
  field(lines, "Title", packet.title);
  field(lines, "Cutoff", report.status.cutoff_at ?? "Unknown");
  field(lines, "Phase", report.status.phase ?? "Unknown");
  field(lines, "Completion", humanize(packet.completion));
  field(lines, "Process terminal", humanize(packet.process_terminal));
  field(
    lines,
    "Terminal decision",
    packet.terminal_decision === undefined
      ? "Not declared"
      : humanize(packet.terminal_decision),
  );
  field(lines, "Review", report.status.review_verdict ?? "Not reached");
  field(lines, "Seal", humanize(report.status.seal_state));
  field(
    lines,
    "End-to-end ready",
    report.status.end_to_end_ready ? "Yes" : "No",
  );
  field(lines, "Reportability", humanize(packet.reportability));
  field(
    lines,
    "Authority",
    `${humanize(packet.authority_state)}; ${humanize(packet.downstream_authority)}`,
  );
  field(
    lines,
    "Authority ceiling",
    report.status.authority_ceiling === null
      ? "Not reported"
      : humanize(report.status.authority_ceiling),
  );
  countField(lines, "Claims", packet.claims.length);
  countField(lines, "Negative findings", packet.negative_findings.length);
  countField(lines, "Unresolved items", packet.unresolved.length);
  countField(lines, "Follow-ups", packet.followups.length);
  lines.push("", "> Full packet Markdown is available only through the explicit audit body.");
  return finish(lines);
}

function field(lines: string[], label: string, value: string): void {
  lines.push(`- ${label}: ${escapeText(value)}`);
}

function countField(lines: string[], label: string, value: number): void {
  field(lines, label, String(value));
}

function executionField(lines: string[]): void {
  field(
    lines,
    "Gateway operation",
    "This validation/read used no model or network access; authority effect none",
  );
}

function empiricalBoundaryField(lines: string[]): void {
  field(lines, "Empirical truth", "Not established by the gateway");
}

function recordList(
  lines: string[],
  label: string,
  values: Readonly<Record<string, unknown>>,
): void {
  const entries = Object.entries(values).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  if (entries.length === 0) {
    return;
  }
  lines.push(`- ${label}:`);
  for (const [key, value] of entries) {
    const displayed =
      value === null || ["boolean", "number", "string"].includes(typeof value)
        ? String(value)
        : "Structured value available in audit output";
    lines.push(`  - ${escapeText(humanize(key))}: ${escapeText(displayed)}`);
  }
}

function referenceList(
  lines: string[],
  label: string,
  values: readonly string[],
  identifierAliases?: ReadonlyMap<string, string>,
): void {
  if (values.length === 0) {
    return;
  }
  lines.push(`- ${label}:`);
  for (const value of values) {
    lines.push(`  - ${inlineIdentifier(value, identifierAliases)}`);
  }
}

function textList(lines: string[], label: string, values: readonly string[]): void {
  if (values.length === 0) {
    return;
  }
  lines.push(`- ${label}:`);
  for (const value of values) {
    lines.push(`  - ${escapeText(value)}`);
  }
}

function escapeText(value: string): string {
  return redactDisplayText(value)
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replaceAll("\\", "\\\\")
    .replaceAll("&", "&amp;")
    .replace(/([`*_[\]{}<>|])/gu, "\\$1")
    .replace(
      /(^|\n)( {0,3})(?=(?:=+|-+|(?:-[ \t]*){3,})[ \t]*(?:\n|$))([=-])/gu,
      "$1$2\\$3",
    )
    .replace(/(^|\n)([ \t]{0,3})([#>+-])(?=\s)/gu, "$1$2\\$3")
    .replace(/(^|\n)([ \t]{0,3})(~{3,})/gu, "$1$2\\$3")
    .replace(
      /(^|\n)([ \t]{0,3})(\d+)([.)])(?=\s)/gu,
      "$1$2$3\\$4",
    )
    .replaceAll("\n", "<br>\n");
}

function inlineCode(value: string): string {
  const normalized = redactDisplayText(value)
    .replaceAll("\r", " ")
    .replaceAll("\n", " ");
  const runs = normalized.match(/`+/gu) ?? [];
  const size = runs.reduce((maximum, run) => Math.max(maximum, run.length), 0) + 1;
  const fence = "`".repeat(size);
  const padding =
    normalized.startsWith("`") ||
    normalized.endsWith("`") ||
    normalized.startsWith(" ") ||
    normalized.endsWith(" ")
      ? " "
      : "";
  return `${fence}${padding}${normalized}${padding}${fence}`;
}

function inlineIdentifier(
  value: string,
  aliases?: ReadonlyMap<string, string>,
): string {
  return inlineCode(aliases?.get(value) ?? value);
}

function structuredIdentifier(
  value: string | null,
  label: string,
): string {
  if (value === null) {
    return "Unknown";
  }
  return containsRecognizedActorSession(value)
    ? `${label} (actor-shaped identifier redacted)`
    : value;
}

function intakeIdentifierAliases(
  studySheet: Readonly<GatewayIntakeStudySheet>,
): ReadonlyMap<string, string> {
  const aliases = new Map<string, string>();
  const add = (values: readonly string[], label: string): void => {
    values.forEach((value, index) => {
      if (containsRecognizedActorSession(value) && !aliases.has(value)) {
        aliases.set(
          value,
          `${label} ${index + 1} (actor-shaped identifier redacted)`,
        );
      }
    });
  };

  add(studySheet.proposed_elements.map((element) => element.element_id), "Element");
  add(studySheet.proposed_links.map((link) => link.link_id), "Link");
  add(studySheet.subjects.map((subject) => subject.subject_id), "Subject");
  add(studySheet.subjects.map((subject) => subject.kind), "Subject kind");
  add(studySheet.evidence_inventory.map((evidence) => evidence.evidence_id), "Evidence");
  add(studySheet.alternative_paths.map((path) => path.path_id), "Alternative path");
  add(
    studySheet.unsupported_assumptions.map(
      (assumption) => assumption.assumption_id,
    ),
    "Assumption",
  );
  add(studySheet.missing_witnesses.map((witness) => witness.witness_id), "Witness");
  return aliases;
}

/**
 * Presentation-only redaction. Source proposal and packet values remain
 * available in the explicit structured audit report; the default Markdown
 * surface does not echo obvious credentials, host paths, actor-session labels,
 * or stack frames.
 */
function redactDisplayText(value: string): string {
  if (containsObviousPrivateOrCredentialValue(value)) {
    return "[private or credential material redacted]";
  }

  const containsStack = containsStackTrace(value);
  const containsPath = containsAbsoluteHostPath(value);
  const containsActor = containsRecognizedActorSession(value);
  if (containsStack || containsPath) {
    return [
      containsStack ? "[stack trace redacted]" : null,
      containsPath ? "[absolute path redacted]" : null,
      containsActor ? "[actor session redacted]" : null,
    ]
      .filter((marker): marker is string => marker !== null)
      .join(" ");
  }

  return sanitizeDisplayControls(value)
    .replace(
      /\bactor-[a-z0-9._-]*-\d+\b/giu,
      "[actor session redacted]",
    )
    .replace(
      /\b(?:anthropic|claude|codex|openai)-(?:executor|orchestrator|reviewer|session)(?:-[a-z0-9._-]+)?\b/giu,
      "[actor session redacted]",
    )
    .replace(
      /["']?\bactor_session_ref\b["']?\s*[:=]\s*["']?[^"'\s,}]+["']?/giu,
      "[actor session redacted]",
    );
}

function containsObviousPrivateOrCredentialValue(value: string): boolean {
  return (
    /\b(?:[a-z0-9]+[_-])*(?:api[_-]?key|access[_-]?token|auth(?:entication|orization)?[_-]?token|authorization|client[_-]?secret|credentials?|github[_-]?token|password|passwd|private[_-]?key|secret(?:[_-](?:access[_-])?key)?|token|email|(?:league|roster|user|sleeper)[_-]?id)\b["']?\s*[:=]\s*["']?(?:bearer\s+)?\S+/iu.test(
      value,
    ) ||
    /\bbearer\s+[a-z0-9._~-]{16,}\b/iu.test(value) ||
    /\b(?:sk-(?:proj|live|test|ant-api\d+)-[a-z0-9_-]{8,}|sk_live_[a-z0-9]{16,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|hf_[A-Za-z0-9]{16,}|glpat-[A-Za-z0-9_-]{16,}|npm_[A-Za-z0-9]{16,})\b/iu.test(
      value,
    ) ||
    /-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----/u.test(value) ||
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu.test(value) ||
    /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/u.test(
      value,
    ) ||
    /\b[a-z][a-z0-9+.-]*:\/\/[^\s/@:]+:[^\s/@]+@/iu.test(value)
  );
}

function containsStackTrace(value: string): boolean {
  return (
    /^\s*at\s+.*(?:\([^\n]*:\d+(?::\d+)?\)|file:\/\/\/[^\n]*:\d+(?::\d+)?)\s*$/imu.test(
      value,
    ) ||
    /^\s*(?:Traceback \(most recent call last\):|Exception in thread\b.*|Caused by:\s+.*|stack backtrace:|goroutine \d+ \[[^\]]+\]:)\s*$/imu.test(
      value,
    ) ||
    /^\s*File\s+["'][^"'\n]+["'],\s+line\s+\d+(?:,\s+in\s+[^\n]+)?\s*$/imu.test(
      value,
    ) ||
    /^\s*at\s+.*\s+in\s+[^\n]+:line\s+\d+\s*$/imu.test(value)
  );
}

function containsAbsoluteHostPath(value: string): boolean {
  return (
    /file:\/\//iu.test(value) ||
    /\b[A-Za-z]:[\\/](?=\S)/u.test(value) ||
    /\\\\(?=\S)/u.test(value) ||
    /(^|[^\p{L}\p{N}:\/])\/\/(?=[^\s/])/mu.test(value) ||
    /(^|[^\p{L}\p{N}/])\/(?=[^\s/])/mu.test(value)
  );
}

function containsRecognizedActorSession(value: string): boolean {
  return (
    /\bactor-[a-z0-9._-]*-\d+\b/iu.test(value) ||
    /\b(?:anthropic|claude|codex|openai)-(?:executor|orchestrator|reviewer|session)(?:-[a-z0-9._-]+)?\b/iu.test(
      value,
    ) ||
    /["']?\bactor_session_ref\b["']?\s*[:=]\s*["']?[^"'\s,}]+["']?/iu.test(
      value,
    )
  );
}

function sanitizeDisplayControls(value: string): string {
  return value.replace(
    /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/gu,
    "[control character removed]",
  );
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
}

function finish(lines: string[]): string {
  return `${lines.join("\n").replace(/\n+$/u, "")}\n`;
}
