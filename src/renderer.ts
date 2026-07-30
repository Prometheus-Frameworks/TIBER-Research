import { canonicalizeJson, type JsonValue } from "./canonical.js";

export const PACKET_MARKDOWN_VERSION = "tiber-packet-markdown-v1" as const;

export interface PacketQuestion {
  question_id: string;
  prompt: string;
  completion: string;
  assessment: string;
  blocker_reason: string | null;
  claim_refs: string[];
  limitations: string[];
}

export interface PacketScope {
  population: string;
  context: string;
  context_ref: string;
  time_horizon: string;
  cutoff_at: string;
}

export interface PacketConfidence {
  band: string;
  rationale: string;
}

export interface PacketFreshness {
  state: string;
  as_of: string | null;
}

export interface PacketClaim {
  claim_id: string;
  question_ref: string;
  subject_ref: string;
  claim_type: string;
  epistemic_class: string;
  assessment: string;
  statement: string;
  scope: PacketScope;
  baseline_ref: string | null;
  baseline_position: string | null;
  comparison_refs: string[];
  hypothesis_refs: string[];
  evidence_refs: string[];
  calculation_refs: string[];
  counterevidence_refs: string[];
  challenge_refs: string[];
  missing_evidence_refs: string[];
  proposed_disposition: string | null;
  limitations: string[];
  confidence: PacketConfidence;
  freshness: PacketFreshness;
  market_inefficiency_claim: string | null;
  market_snapshot_ref: string | null;
}

export interface PacketNegativeFinding {
  finding_id: string;
  statement: string;
  question_refs: string[];
  subject_refs: string[];
  hypothesis_refs: string[];
  evidence_refs: string[];
  challenge_refs: string[];
  limitations: string[];
}

export interface PacketUnresolvedItem {
  unresolved_id: string;
  kind: "blocked_input" | "contradiction" | "missing_evidence";
  statement: string;
  blocked_input_refs: string[];
  related_claim_refs: string[];
  related_question_refs: string[];
}

export interface PacketFollowup {
  followup_id: string;
  question: string;
  rationale: string;
  requires_new_run: boolean;
}

export interface ResearchPacket {
  schema_version: string;
  synthetic_fixture: boolean;
  job_id: string;
  job_version: string;
  run_id: string;
  attempt_id: string;
  output_class: string;
  title: string;
  generated_at: string;
  questions: PacketQuestion[];
  claims: PacketClaim[];
  negative_findings: PacketNegativeFinding[];
  unresolved: PacketUnresolvedItem[];
  followups: PacketFollowup[];
  limitations: string[];
  process_terminal: string;
  completion: string;
  authority_state: string;
  downstream_authority: string;
  reportability: string;
}

function normalizeNewlines(value: string): string {
  return value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function escapeMarkdown(value: string): string {
  return normalizeNewlines(value)
    .replaceAll("\\", "\\\\")
    .replace(/([`*_[\]{}<>#+.!|()-])/gu, "\\$1")
    .replaceAll("\n", "<br>\n");
}

function codeSpan(value: string): string {
  const normalized = normalizeNewlines(value).replaceAll("\n", " ");
  const runs = normalized.match(/`+/gu) ?? [];
  const fenceLength =
    runs.reduce((maximum, run) => Math.max(maximum, run.length), 0) + 1;
  const fence = "`".repeat(fenceLength);
  const padding =
    normalized.startsWith("`") ||
    normalized.endsWith("`") ||
    normalized.startsWith(" ") ||
    normalized.endsWith(" ")
      ? " "
      : "";
  return `${fence}${padding}${normalized}${padding}${fence}`;
}

function scalar(value: JsonValue): string {
  if (value === null) {
    return "_None._";
  }
  if (typeof value === "string") {
    return escapeMarkdown(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return codeSpan(String(value));
  }
  return codeSpan(canonicalizeJson(value));
}

function field(lines: string[], label: string, value: string | null): void {
  lines.push(`- ${label}: ${value === null ? "_None._" : codeSpan(value)}`);
}

function textField(lines: string[], label: string, value: string): void {
  lines.push(`- ${label}: ${escapeMarkdown(value)}`);
}

function referenceList(
  lines: string[],
  label: string,
  values: readonly string[],
): void {
  if (values.length === 0) {
    lines.push(`- ${label}: _None._`);
    return;
  }
  lines.push(`- ${label}:`);
  for (const value of values) {
    lines.push(`  - ${codeSpan(value)}`);
  }
}

function textList(
  lines: string[],
  label: string,
  values: readonly string[],
): void {
  if (values.length === 0) {
    lines.push(`- ${label}: _None._`);
    return;
  }
  lines.push(`- ${label}:`);
  for (const value of values) {
    lines.push(`  - ${escapeMarkdown(value)}`);
  }
}

function blank(lines: string[]): void {
  if (lines.length > 0 && lines[lines.length - 1] !== "") {
    lines.push("");
  }
}

/**
 * Render the authoritative packet object with a fixed section and field order.
 * Array order is preserved because it is part of packet.json semantics.
 */
export function renderPacketMarkdown(packet: Readonly<ResearchPacket>): string {
  const lines: string[] = [];

  lines.push(`# ${escapeMarkdown(packet.title)}`, "");
  lines.push(
    "> Operator-readable rendering of `packet.json`. This document is not evidence, review, promotion, or downstream authority.",
    "",
  );

  lines.push("## Identity", "");
  field(lines, "Schema version", packet.schema_version);
  field(lines, "Synthetic fixture", packet.synthetic_fixture ? "true" : "false");
  field(lines, "Job ID", packet.job_id);
  field(lines, "Job version", packet.job_version);
  field(lines, "Run ID", packet.run_id);
  field(lines, "Attempt ID", packet.attempt_id);
  field(lines, "Output class", packet.output_class);
  field(lines, "Generated at", packet.generated_at);
  blank(lines);

  lines.push("## Questions", "");
  if (packet.questions.length === 0) {
    lines.push("_None._", "");
  } else {
    for (const question of packet.questions) {
      lines.push(`### Question ${codeSpan(question.question_id)}`, "");
      textField(lines, "Prompt", question.prompt);
      field(lines, "Completion", question.completion);
      field(lines, "Assessment", question.assessment);
      field(lines, "Blocker reason", question.blocker_reason);
      referenceList(lines, "Claim references", question.claim_refs);
      textList(lines, "Limitations", question.limitations);
      blank(lines);
    }
  }

  lines.push("## Candidate Claims", "");
  if (packet.claims.length === 0) {
    lines.push("_None._", "");
  } else {
    for (const claim of packet.claims) {
      lines.push(`### Claim ${codeSpan(claim.claim_id)}`, "");
      field(lines, "Question reference", claim.question_ref);
      field(lines, "Subject reference", claim.subject_ref);
      field(lines, "Claim type", claim.claim_type);
      field(lines, "Epistemic class", claim.epistemic_class);
      field(lines, "Assessment", claim.assessment);
      textField(lines, "Statement", claim.statement);
      lines.push("- Scope:");
      textField(lines, "  Population", claim.scope.population);
      textField(lines, "  Context", claim.scope.context);
      field(lines, "  Context reference", claim.scope.context_ref);
      textField(lines, "  Time horizon", claim.scope.time_horizon);
      field(lines, "  Cutoff at", claim.scope.cutoff_at);
      field(lines, "Baseline reference", claim.baseline_ref);
      field(lines, "Baseline position", claim.baseline_position);
      referenceList(lines, "Comparison references", claim.comparison_refs);
      referenceList(lines, "Hypothesis references", claim.hypothesis_refs);
      referenceList(lines, "Evidence references", claim.evidence_refs);
      referenceList(lines, "Calculation references", claim.calculation_refs);
      referenceList(lines, "Counterevidence references", claim.counterevidence_refs);
      referenceList(lines, "Challenge references", claim.challenge_refs);
      referenceList(
        lines,
        "Missing evidence references",
        claim.missing_evidence_refs,
      );
      field(lines, "Proposed disposition", claim.proposed_disposition);
      textList(lines, "Limitations", claim.limitations);
      field(lines, "Confidence band", claim.confidence.band);
      textField(lines, "Confidence rationale", claim.confidence.rationale);
      field(lines, "Freshness state", claim.freshness.state);
      field(lines, "Freshness as of", claim.freshness.as_of);
      lines.push(
        `- Market inefficiency claim: ${scalar(claim.market_inefficiency_claim)}`,
      );
      field(lines, "Market snapshot reference", claim.market_snapshot_ref);
      blank(lines);
    }
  }

  lines.push("## Negative Findings", "");
  if (packet.negative_findings.length === 0) {
    lines.push("_None._", "");
  } else {
    for (const finding of packet.negative_findings) {
      lines.push(`### Negative finding ${codeSpan(finding.finding_id)}`, "");
      textField(lines, "Statement", finding.statement);
      referenceList(lines, "Question references", finding.question_refs);
      referenceList(lines, "Subject references", finding.subject_refs);
      referenceList(lines, "Hypothesis references", finding.hypothesis_refs);
      referenceList(lines, "Evidence references", finding.evidence_refs);
      referenceList(lines, "Challenge references", finding.challenge_refs);
      textList(lines, "Limitations", finding.limitations);
      blank(lines);
    }
  }

  lines.push("## Unresolved Items", "");
  if (packet.unresolved.length === 0) {
    lines.push("_None._", "");
  } else {
    for (const unresolved of packet.unresolved) {
      lines.push(`### Unresolved ${codeSpan(unresolved.unresolved_id)}`, "");
      field(lines, "Kind", unresolved.kind);
      textField(lines, "Statement", unresolved.statement);
      referenceList(
        lines,
        "Blocked input references",
        unresolved.blocked_input_refs,
      );
      referenceList(lines, "Related claim references", unresolved.related_claim_refs);
      referenceList(
        lines,
        "Related question references",
        unresolved.related_question_refs,
      );
      blank(lines);
    }
  }

  lines.push("## Follow-up Questions", "");
  if (packet.followups.length === 0) {
    lines.push("_None._", "");
  } else {
    for (const followup of packet.followups) {
      lines.push(`### Follow-up ${codeSpan(followup.followup_id)}`, "");
      textField(lines, "Question", followup.question);
      textField(lines, "Rationale", followup.rationale);
      field(
        lines,
        "Requires new run",
        followup.requires_new_run ? "true" : "false",
      );
      blank(lines);
    }
  }

  lines.push("## Packet Limitations", "");
  if (packet.limitations.length === 0) {
    lines.push("_None._", "");
  } else {
    for (const limitation of packet.limitations) {
      lines.push(`- ${escapeMarkdown(limitation)}`);
    }
    blank(lines);
  }

  lines.push("## Governance State", "");
  field(lines, "Process terminal", packet.process_terminal);
  field(lines, "Completion", packet.completion);
  field(lines, "Authority state", packet.authority_state);
  field(lines, "Downstream authority", packet.downstream_authority);
  field(lines, "Reportability", packet.reportability);

  // Exactly one LF at EOF is part of tiber-packet-markdown-v1.
  return `${lines.join("\n").replace(/\n+$/u, "")}\n`;
}

export const renderPacket = renderPacketMarkdown;
