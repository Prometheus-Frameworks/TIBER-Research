#!/usr/bin/env node

import { checkAgentThesisProposal } from "./agentEntry.js";
import {
  buildSyntheticFixture,
  createAttemptStart,
  createReview,
  createSeal,
  createSubmission,
  type AttemptStartMetadata,
  type ReviewMetadata,
  type SealMetadata,
  type SubmissionMetadata,
} from "./build.js";
import {
  normalizedJsonText,
  readJson,
  readNormalizedJson,
  writeUtf8CreateOnly,
} from "./io.js";
import {
  getGatewayPacket,
  getGatewayStatus,
  inspectGatewayIntake,
} from "./gateway.js";
import {
  renderGatewayIntakeMarkdown,
  renderGatewayPacketMarkdown,
  renderGatewayStatusMarkdown,
} from "./gatewayRenderer.js";
import { renderPacketMarkdown, type ResearchPacket } from "./renderer.js";
import { validateStage1Preflight } from "./preflight.js";
import {
  validateAttempt,
  validateResume,
  type ValidationPhase,
} from "./validator.js";

async function main(args: string[]): Promise<void> {
  const [command, ...rest] = args;
  switch (command) {
    case "agent-entry":
      return agentEntry(rest);
    case "gateway:intake":
      return gatewayIntake(rest);
    case "gateway:packet":
      return gatewayPacket(rest);
    case "gateway:status":
      return gatewayStatus(rest);
    case "fixture:build":
      return fixtureBuild(rest);
    case "preflight":
      return preflight(rest);
    case "render":
      return render(rest);
    case "resume":
      return resume(rest);
    case "review":
      return review(rest);
    case "seal":
      return seal(rest);
    case "start":
      return start(rest);
    case "submit":
      return submit(rest);
    case "validate":
      return validate(rest);
    default:
      throw new Error(usage());
  }
}

type GatewayFormat = "json" | "markdown";

function gatewayIntake(args: string[]): void {
  const { format, positionals } = gatewayArgs("gateway:intake", args, 2);
  const [workspace, proposalPath] = positionals;
  if (workspace === undefined || proposalPath === undefined) {
    throw new Error(`gateway:intake: expected 2 positional arguments\n${usage()}`);
  }
  const report = inspectGatewayIntake(readJson(workspace, proposalPath));
  writeGatewayOutput(report, renderGatewayIntakeMarkdown(report), format);
  if (!report.valid) {
    process.exitCode = 1;
  }
}

function gatewayStatus(args: string[]): void {
  const { format, positionals } = gatewayArgs("gateway:status", args, 3);
  const [workspace, runId, attemptId] = positionals;
  if (workspace === undefined || runId === undefined || attemptId === undefined) {
    throw new Error(`gateway:status: expected 3 positional arguments\n${usage()}`);
  }
  const report = getGatewayStatus(workspace, runId, attemptId);
  writeGatewayOutput(report, renderGatewayStatusMarkdown(report), format);
  if (!report.protocol_valid) {
    process.exitCode = 1;
  }
}

function gatewayPacket(args: string[]): void {
  const { format, positionals } = gatewayArgs("gateway:packet", args, 3);
  const [workspace, runId, attemptId] = positionals;
  if (workspace === undefined || runId === undefined || attemptId === undefined) {
    throw new Error(`gateway:packet: expected 3 positional arguments\n${usage()}`);
  }
  const report = getGatewayPacket(workspace, runId, attemptId);
  writeGatewayOutput(report, renderGatewayPacketMarkdown(report), format);
  if (!report.protocol_valid || report.body === null) {
    process.exitCode = 1;
  }
}

function gatewayArgs(
  command: string,
  args: string[],
  positionalCount: 2 | 3,
): { format: GatewayFormat; positionals: string[] } {
  const positionals = args.slice(0, positionalCount);
  if (
    positionals.length !== positionalCount ||
    positionals.some(
      (argument) => argument.length === 0 || argument.startsWith("--"),
    )
  ) {
    throw new Error(
      `${command}: expected ${positionalCount} positional arguments before flags\n${usage()}`,
    );
  }
  const flags = args.slice(positionalCount);
  if (flags.length > 1) {
    throw new Error(`${command}: duplicate or extra format flag\n${usage()}`);
  }
  const flag = flags[0];
  if (flag === undefined || flag === "--format=markdown") {
    return { format: "markdown", positionals };
  }
  if (flag === "--format=json") {
    return { format: "json", positionals };
  }
  throw new Error(`${command}: unknown flag or extra argument: ${flag}\n${usage()}`);
}

function writeGatewayOutput(
  report: unknown,
  markdown: string,
  format: GatewayFormat,
): void {
  process.stdout.write(format === "json" ? normalizedJsonText(report) : markdown);
}

/**
 * Validate an `agent-thesis-proposal/v0` object produced by an external agent.
 *
 * The proposal is read with `readJson`, not `readNormalizedJson`: it arrives
 * from an arbitrary provider over a conversation, so its byte form is not
 * governed. Only its meaning is checked.
 */
function agentEntry(args: string[]): void {
  const [workspace, proposalPath] = args;
  if (
    args.length !== 2 ||
    workspace === undefined ||
    proposalPath === undefined ||
    args.some(
      (argument) => argument.length === 0 || argument.startsWith("--"),
    )
  ) {
    throw new Error(
      `agent-entry: expected 2 positional arguments\n${usage()}`,
    );
  }
  const errors = checkAgentThesisProposal(readJson(workspace, proposalPath));
  process.stdout.write(
    normalizedJsonText({
      path: proposalPath,
      valid: errors.length === 0,
      errors,
    }),
  );
  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

function fixtureBuild(args: string[]): void {
  const [workspace, runId, attemptId] = requirePositionals(
    "fixture:build",
    args,
    3,
  );
  const built = buildSyntheticFixture(workspace, runId, attemptId);
  process.stdout.write(normalizedJsonText(built));
}

function preflight(args: string[]): void {
  if (args.length < 2 || args.length > 3) {
    throw new Error(
      `preflight: expected 2 positional arguments and optional --require-ready\n${usage()}`,
    );
  }
  const [workspace, manifestPath, flag] = args;
  if (workspace === undefined || manifestPath === undefined) {
    throw new Error(`preflight: expected 2 positional arguments\n${usage()}`);
  }
  if (
    workspace.startsWith("--") ||
    manifestPath.startsWith("--") ||
    (flag !== undefined && flag !== "--require-ready")
  ) {
    throw new Error(
      `preflight: unknown flag or extra argument\n${usage()}`,
    );
  }
  const report = validateStage1Preflight(
    workspace,
    manifestPath,
    flag === "--require-ready"
      ? { evaluationAt: new Date().toISOString() }
      : {},
  );
  process.stdout.write(normalizedJsonText(report));
  if (!report.valid || (flag === "--require-ready" && !report.activation_ready)) {
    process.exitCode = 1;
  }
}

function render(args: string[]): void {
  const [workspace, runId, attemptId] = requirePositionals(
    "render",
    args,
    3,
  );
  const attemptRoot = `runs/${runId}/attempts/${attemptId}`;
  const packetPath = `${attemptRoot}/packet.json`;
  const outputPath = `${attemptRoot}/packet.md`;
  const packet = readNormalizedJson<ResearchPacket>(workspace, packetPath);
  if (packet.run_id !== runId || packet.attempt_id !== attemptId) {
    throw new Error(
      "render: packet identity does not match the requested active attempt",
    );
  }
  writeUtf8CreateOnly(
    workspace,
    outputPath,
    renderPacketMarkdown(packet),
  );
}

function submit(args: string[]): void {
  const [workspace, runId, attemptId, metadataPath] = requirePositionals(
    "submit",
    args,
    4,
  );
  const metadata = readNormalizedJson<SubmissionMetadata>(
    workspace,
    metadataPath,
  );
  const digest = createSubmission(workspace, runId, attemptId, metadata);
  process.stdout.write(`${digest}\n`);
}

function start(args: string[]): void {
  const [workspace, runId, attemptId, metadataPath] = requirePositionals(
    "start",
    args,
    4,
  );
  const metadata = readNormalizedJson<AttemptStartMetadata>(
    workspace,
    metadataPath,
  );
  createAttemptStart(workspace, runId, attemptId, metadata);
}

function review(args: string[]): void {
  const [workspace, runId, attemptId, metadataPath] = requirePositionals(
    "review",
    args,
    4,
  );
  const metadata = readNormalizedJson<ReviewMetadata>(
    workspace,
    metadataPath,
  );
  const digest = createReview(workspace, runId, attemptId, metadata);
  process.stdout.write(`${digest}\n`);
}

function seal(args: string[]): void {
  const [workspace, runId, attemptId, metadataPath] = requirePositionals(
    "seal",
    args,
    4,
  );
  const metadata = readNormalizedJson<SealMetadata>(
    workspace,
    metadataPath,
  );
  const digest = createSeal(workspace, runId, attemptId, metadata);
  process.stdout.write(`${digest}\n`);
}

function validate(args: string[]): void {
  if (args.length < 3) {
    throw new Error(`validate: expected 3 positional arguments\n${usage()}`);
  }
  const positionalArgs = args.slice(0, 3);
  if (positionalArgs.some((argument) => argument.startsWith("--"))) {
    throw new Error(
      `validate: flags are permitted only after the 3 positional arguments\n${usage()}`,
    );
  }
  const [workspace, runId, attemptId] = requirePositionals(
    "validate",
    positionalArgs,
    3,
  );
  let requireEndToEnd = false;
  let phase: ValidationPhase | undefined;
  for (const flag of args.slice(3)) {
    if (flag === "--require-end-to-end") {
      if (requireEndToEnd) {
        throw new Error("validate: duplicate --require-end-to-end flag");
      }
      requireEndToEnd = true;
      continue;
    }
    if (flag.startsWith("--phase=")) {
      if (phase !== undefined) {
        throw new Error("validate: duplicate --phase flag");
      }
      const candidate = flag.slice("--phase=".length);
      if (!["candidate", "submitted", "reviewed", "sealed"].includes(candidate)) {
        throw new Error(`invalid validation phase: ${candidate}`);
      }
      phase = candidate as ValidationPhase;
      continue;
    }
    throw new Error(`validate: unknown flag or extra argument: ${flag}`);
  }
  const report = validateAttempt(workspace, runId, attemptId, {
    ...(phase === undefined ? {} : { phase }),
    requireEndToEnd,
  });
  process.stdout.write(normalizedJsonText(report));
  if (!report.valid) {
    process.exitCode = 1;
  }
}

function resume(args: string[]): void {
  const [workspace, runId, attemptId] = requirePositionals("resume", args, 3);
  const report = validateResume(workspace, runId, attemptId);
  process.stdout.write(
    normalizedJsonText({
      valid: report.valid,
      errors: report.errors,
      resume: report.resume,
    }),
  );
  if (!report.valid) {
    process.exitCode = 1;
  }
}

function requirePositionals(
  command: string,
  args: string[],
  count: 3,
): [string, string, string];
function requirePositionals(
  command: string,
  args: string[],
  count: 4,
): [string, string, string, string];
function requirePositionals(
  command: string,
  args: string[],
  count: 3 | 4,
): string[] {
  if (
    args.length !== count ||
    args.some(
      (argument) => argument.length === 0 || argument.startsWith("--"),
    )
  ) {
    throw new Error(`${command}: expected ${count} positional arguments\n${usage()}`);
  }
  return args;
}

function usage(): string {
  return [
    "Usage:",
    "  tiber-research agent-entry <workspace> <proposal-relative-path>",
    "  tiber-research gateway:intake <workspace> <proposal-relative-path> [--format=markdown|json]",
    "  tiber-research gateway:status <workspace> <run-id> <attempt-id> [--format=markdown|json]",
    "  tiber-research gateway:packet <workspace> <run-id> <attempt-id> [--format=markdown|json]",
    "  tiber-research fixture:build <workspace> <run-id> <attempt-id>",
    "  tiber-research preflight <workspace> <manifest-relative-path> [--require-ready]",
    "  tiber-research render <workspace> <run-id> <attempt-id>",
    "  tiber-research start <workspace> <run-id> <attempt-id> <metadata-relative-path>",
    "  tiber-research submit <workspace> <run-id> <attempt-id> <metadata-relative-path>",
    "  tiber-research review <workspace> <run-id> <attempt-id> <metadata-relative-path>",
    "  tiber-research seal <workspace> <run-id> <attempt-id> <metadata-relative-path>",
    "  tiber-research validate <workspace> <run-id> <attempt-id> [--phase=<phase>] [--require-end-to-end]",
    "  tiber-research resume <workspace> <run-id> <attempt-id>",
  ].join("\n");
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`tiber-research: ${message}\n`);
  process.exitCode = 1;
});
