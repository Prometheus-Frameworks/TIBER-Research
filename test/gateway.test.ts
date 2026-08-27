import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  cpSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  truncateSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import test from "node:test";
import {
  getGatewayPacket,
  getGatewayStatus,
  inspectGatewayIntake,
} from "../src/gateway.js";
import {
  renderGatewayIntakeMarkdown,
  renderGatewayPacketMarkdown,
  renderGatewayStatusMarkdown,
} from "../src/gatewayRenderer.js";

const SYNTHETIC = resolve("fixtures/synthetic-complete");
const TUNSIL_WORKSPACE = resolve(".");
const SYNTHETIC_RUN = "run-synthetic-001";
const TUNSIL_RUN = "tunsil-absence-shock-v0";
const ATTEMPT = "attempt-001";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(resolve(path), "utf8")) as unknown;
}

function withSynthetic(
  callback: (workspace: string) => void,
): void {
  const parent = mkdtempSync(join(tmpdir(), "tiber-gateway-"));
  const workspace = join(parent, "workspace");
  cpSync(SYNTHETIC, workspace, { recursive: true });
  try {
    callback(workspace);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
}

function fingerprint(root: string): string[] {
  const entries: string[] = [];
  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort(
      (left, right) => left.name.localeCompare(right.name),
    )) {
      const absolute = join(directory, entry.name);
      const path = relative(root, absolute).replaceAll("\\", "/");
      const stat = lstatSync(absolute);
      if (stat.isDirectory()) {
        entries.push(`d:${path}`);
        visit(absolute);
      } else if (stat.isFile()) {
        const digest = createHash("sha256")
          .update(readFileSync(absolute))
          .digest("hex");
        entries.push(`f:${path}:${digest}`);
      } else if (stat.isSymbolicLink()) {
        entries.push(`l:${path}`);
      } else {
        entries.push(`o:${path}`);
      }
    }
  }
  visit(root);
  return entries;
}

test("gateway operations are deterministic and do not mutate custody", () => {
  withSynthetic((workspace) => {
    const proposal = readJson("fixtures/agent-entry/example-minimal.json");
    const before = fingerprint(workspace);

    const firstStatus = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    const firstPacket = getGatewayPacket(workspace, SYNTHETIC_RUN, ATTEMPT);
    const firstIntake = inspectGatewayIntake(proposal);
    const secondStatus = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    const secondPacket = getGatewayPacket(workspace, SYNTHETIC_RUN, ATTEMPT);
    const secondIntake = inspectGatewayIntake(proposal);

    assert.deepEqual(secondStatus, firstStatus);
    assert.deepEqual(secondPacket, firstPacket);
    assert.deepEqual(secondIntake, firstIntake);
    assert.deepEqual(fingerprint(workspace), before);
    for (const execution of [
      firstStatus.execution,
      firstPacket.execution,
      firstIntake.execution,
    ]) {
      assert.deepEqual(execution, {
        authority_effect: "none",
        canonical_state_mutated: false,
        deterministic_read: true,
        model_access: false,
        network_access: false,
      });
    }
  });
});

test("current Tunsil custody is submitted, unreviewed, and unsealed", () => {
  const status = getGatewayStatus(TUNSIL_WORKSPACE, TUNSIL_RUN, ATTEMPT);

  assert.equal(status.protocol_valid, true, JSON.stringify(status.reason_codes));
  assert.equal(status.phase, "submitted");
  assert.equal(status.lifecycle_state, "submitted");
  assert.equal(status.packet_state, "available");
  assert.equal(status.review_state, "not_reached");
  assert.equal(status.review_verdict, null);
  assert.equal(status.seal_state, "unsealed");
  assert.equal(status.completion, "inconclusive");
  assert.equal(status.authority_state, "unpromoted");
  assert.equal(status.downstream_authority, "none");
  assert.equal(status.end_to_end_ready, false);
  assert.deepEqual(status.next_permitted_actions, [
    "Await an independent fresh-context review.",
  ]);

  const packet = getGatewayPacket(TUNSIL_WORKSPACE, TUNSIL_RUN, ATTEMPT);
  assert.equal(packet.result, "PACKET_AVAILABLE");
  assert.notEqual(packet.body, null);
  assert.match(renderGatewayStatusMarkdown(status), /Cutoff:/u);
  assert.match(
    renderGatewayStatusMarkdown(status),
    /Gateway operation:.*authority effect none/iu,
  );
  assert.match(
    renderGatewayStatusMarkdown(status),
    /Empirical truth: Not established by the gateway/iu,
  );
  assert.doesNotMatch(renderGatewayStatusMarkdown(status), /Frontier question:/u);
  assert.doesNotMatch(renderGatewayStatusMarkdown(status), /Budgets remaining:/u);
});

test("sealed synthetic custody reports the validated terminal boundary", () => {
  const status = getGatewayStatus(SYNTHETIC, SYNTHETIC_RUN, ATTEMPT);

  assert.equal(status.protocol_valid, true);
  assert.equal(status.phase, "sealed");
  assert.equal(status.review_state, "returned");
  assert.equal(status.review_verdict, "pass");
  assert.equal(status.seal_state, "sealed");
  assert.equal(status.end_to_end_ready, true);
  assert.deepEqual(status.next_permitted_actions, [
    "No executor action is permitted; await a separate external Ops decision.",
  ]);
});

test("a validated pass review remains unsealed and permits only sealing", () => {
  withSynthetic((workspace) => {
    const attemptRoot = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "attempts",
      ATTEMPT,
    );
    rmSync(join(attemptRoot, "seal.json"));
    const runEvents = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "run-events.jsonl",
    );
    const records = readFileSync(runEvents, "utf8").trimEnd().split("\n");
    writeFileSync(runEvents, `${records.slice(0, 4).join("\n")}\n`, "utf8");

    const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(status.protocol_valid, true, JSON.stringify(status.reason_codes));
    assert.equal(status.phase, "reviewed");
    assert.equal(status.review_state, "returned");
    assert.equal(status.review_verdict, "pass");
    assert.equal(status.seal_state, "unsealed");
    assert.equal(status.end_to_end_ready, false);
    assert.deepEqual(status.next_permitted_actions, [
      "Seal the frozen reviewed attempt without modifying candidate bytes.",
    ]);
  });
});

test("packet-free active custody returns only the validated resume frontier", () => {
  withSynthetic((workspace) => {
    const attemptRoot = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "attempts",
      ATTEMPT,
    );
    for (const filename of [
      "packet.json",
      "packet.md",
      "submission.json",
      "review.json",
      "seal.json",
    ]) {
      rmSync(join(attemptRoot, filename));
    }
    const runEvents = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "run-events.jsonl",
    );
    const records = readFileSync(runEvents, "utf8").trimEnd().split("\n");
    writeFileSync(runEvents, `${records.slice(0, 2).join("\n")}\n`, "utf8");

    const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(status.protocol_valid, true, JSON.stringify(status.reason_codes));
    assert.equal(status.phase, "candidate");
    assert.equal(status.lifecycle_state, "attempt_started");
    assert.equal(status.packet_state, "absent");
    assert.equal(status.review_state, "not_reached");
    assert.equal(status.seal_state, "unsealed");
    assert.equal(
      status.frontier_question,
      "The bounded synthetic question is answered; freeze the candidate packet for review.",
    );
    assert.deepEqual(status.next_permitted_actions, [
      "Continue only the bounded research actions allowed by the activated job.",
    ]);
    const view = renderGatewayStatusMarkdown(status);
    assert.match(view, /Frontier question:/u);
    assert.match(view, /Budgets remaining:/u);

    const packet = getGatewayPacket(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(packet.result, "PACKET_NOT_AVAILABLE");
    assert.equal(packet.protocol_valid, true);
    assert.equal(packet.body, null);
  });
});

test("a valid-but-not-ready preflight is never represented as an active run", () => {
  const status = getGatewayStatus(
    resolve("."),
    "opportunity-clusters-2026-v0",
    ATTEMPT,
  );
  assert.equal(status.result, "PROTOCOL_INCONSISTENT");
  assert.equal(status.protocol_valid, false);
  assert.equal(status.phase, null);
  assert.equal(status.authority_ceiling, null);
  assert.deepEqual(status.next_permitted_actions, []);

  const packet = getGatewayPacket(
    resolve("."),
    "opportunity-clusters-2026-v0",
    ATTEMPT,
  );
  assert.equal(packet.body, null);
});

test("an inconsistent lifecycle suppresses phase, verdict, actions, and packet body", () => {
  withSynthetic((workspace) => {
    const runEvents = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "run-events.jsonl",
    );
    const records = readFileSync(runEvents, "utf8").trimEnd().split("\n");
    // Leave the positive review and seal artifacts in place while removing
    // their lifecycle events. A filename must not upgrade protocol state.
    writeFileSync(runEvents, `${records.slice(0, 3).join("\n")}\n`, "utf8");

    const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(status.result, "PROTOCOL_INCONSISTENT");
    assert.equal(status.protocol_valid, false);
    assert.equal(status.phase, null);
    assert.equal(status.lifecycle_state, null);
    assert.equal(status.review_state, "unknown");
    assert.equal(status.review_verdict, null);
    assert.equal(status.seal_state, "unknown");
    assert.equal(status.completion, null);
    assert.equal(status.authority_state, null);
    assert.equal(status.end_to_end_ready, false);
    assert.deepEqual(status.next_permitted_actions, []);
    assert.ok(status.reason_codes.includes("PROTOCOL_INCONSISTENT"));

    const packet = getGatewayPacket(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(packet.result, "PROTOCOL_INCONSISTENT");
    assert.equal(packet.body, null);

    const view = renderGatewayStatusMarkdown(status);
    assert.doesNotMatch(view, /\bpass\b/iu);
    assert.doesNotMatch(view, /next permitted/iu);
    assert.doesNotMatch(view, /actor-/iu);
    assert.doesNotMatch(view, /\/workspace\//u);
  });
});

test("intake confirmation remains separate from freezing and activation", () => {
  const awaiting = inspectGatewayIntake(
    readJson("fixtures/agent-entry/example-minimal.json"),
  );
  assert.equal(awaiting.valid, true);
  assert.equal(awaiting.result, "AWAITING_OPERATOR_CONFIRMATION");
  assert.equal(awaiting.freeze_state, "not_frozen");
  assert.equal(awaiting.activation_state, "not_activated");
  assert.equal(awaiting.next_boundary, "operator_confirmation_required");
  assert.equal(
    awaiting.study_sheet?.received_take.operator_stance,
    "unspecified",
  );
  assert.equal(
    awaiting.study_sheet?.received_take.stance_basis,
    "agent_default_unspecified",
  );
  assert.equal(
    awaiting.study_sheet?.received_take.byte_identity,
    "not_established",
  );
  const awaitingView = renderGatewayIntakeMarkdown(awaiting);
  assert.match(awaitingView, /Received operator take/u);
  assert.match(awaitingView, /Freeze: Not frozen/u);
  assert.match(awaitingView, /Operator stance: Unspecified/u);
  assert.match(awaitingView, /byte identity.*not established/iu);
  assert.doesNotMatch(awaitingView, /Operator statement/u);

  const confirmed = inspectGatewayIntake(
    readJson("fixtures/agent-entry/example-ragged.json"),
  );
  assert.equal(confirmed.valid, true);
  assert.equal(confirmed.result, "OPERATOR_CONFIRMED_NOT_ACTIVATED");
  assert.equal(confirmed.confirmation_state, "operator_confirmed");
  assert.equal(confirmed.freeze_state, "not_frozen");
  assert.equal(confirmed.activation_state, "not_activated");
  assert.equal(confirmed.authority_state, "unpromoted");
  assert.equal(confirmed.downstream_authority, "none");
  assert.equal(
    confirmed.operator_confirmation?.confirmation_scope,
    "whole_proposal",
  );
  assert.equal(
    confirmed.next_boundary,
    "separate_job_and_preflight_required",
  );
  assert.match(renderGatewayIntakeMarkdown(confirmed), /Not activated/u);

  const withExceptions = readJson(
    "fixtures/agent-entry/example-ragged.json",
  ) as Record<string, any>;
  withExceptions.operator_confirmation.confirmation_scope =
    "with_noted_exceptions";
  withExceptions.operator_confirmation.exceptions = [
    "The causal mechanism remains the agent's proposal.",
  ];
  const excepted = inspectGatewayIntake(withExceptions);
  assert.equal(excepted.valid, true, JSON.stringify(excepted.validation_errors));
  assert.deepEqual(excepted.operator_confirmation?.exceptions, [
    "The causal mechanism remains the agent's proposal.",
  ]);
  const exceptedView = renderGatewayIntakeMarkdown(excepted);
  assert.match(exceptedView, /Confirmation scope: With Noted Exceptions/u);
  assert.match(exceptedView, /causal mechanism remains the agent/iu);
});

test("invalid intake exposes no study sheet or authority", () => {
  const invalid = inspectGatewayIntake({
    activation_state: "activated",
    proposal_id: "invented",
  });
  assert.equal(invalid.valid, false);
  assert.equal(invalid.result, "INTAKE_INVALID");
  assert.equal(invalid.study_sheet, null);
  assert.equal(invalid.activation_state, "not_activated");
  assert.equal(invalid.authority_state, "unpromoted");
  assert.equal(invalid.downstream_authority, "none");

  const oversized = readJson(
    "fixtures/agent-entry/example-minimal.json",
  ) as Record<string, any>;
  oversized.nodes = Array.from({ length: 1_001 }, () =>
    structuredClone(oversized.nodes[0]),
  );
  const bounded = inspectGatewayIntake(oversized);
  assert.equal(bounded.valid, false);
  assert.match(bounded.validation_errors[0] ?? "", /safety limit/u);

  const cyclic = readJson(
    "fixtures/agent-entry/example-minimal.json",
  ) as Record<string, any>;
  cyclic.cycle = cyclic;
  const cycleResult = inspectGatewayIntake(cyclic);
  assert.equal(cycleResult.valid, false);
  assert.match(cycleResult.validation_errors[0] ?? "", /acyclic/u);
});

test("intake preserves epistemic qualifiers and labels unverified resolution", () => {
  const proposal = readJson(
    "fixtures/agent-entry/example-minimal.json",
  ) as Record<string, any>;
  proposal.subjects.push({
    kind: "player",
    label_in_take: "Player X",
    resolution: {
      identifier: null,
      resolution_basis: "agent_guess_unverified",
      resolved_label: "Definitive Player X",
    },
    subject_id: "s-player-x",
  });
  proposal.nodes[0].subject_refs = ["s-player-x"];

  const report = inspectGatewayIntake(proposal);
  assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
  assert.equal(
    report.study_sheet?.subjects[0]?.resolution?.resolution_basis,
    "agent_guess_unverified",
  );
  assert.deepEqual(report.study_sheet?.proposed_elements[0]?.subject_refs, [
    "s-player-x",
  ]);
  const view = renderGatewayIntakeMarkdown(report);
  assert.match(view, /Definitive Player X/u);
  assert.match(view, /agent_guess_unverified/u);

  const ragged = inspectGatewayIntake(
    readJson("fixtures/agent-entry/example-ragged.json"),
  );
  assert.equal(ragged.valid, true);
  assert.equal(ragged.study_sheet?.agent_evidence_access, "operator_supplied_only");
  assert.equal(ragged.study_sheet?.evidence_inventory.length, 1);
  assert.deepEqual(ragged.study_sheet?.proposed_links[0]?.evidence_refs, []);
  assert.deepEqual(
    ragged.study_sheet?.proposed_links[0]?.counterevidence_refs,
    [],
  );
  assert.equal(ragged.study_sheet?.proposed_links[0]?.necessity, "contributing");
  assert.equal(ragged.study_sheet?.alternative_paths.length, 1);
  assert.equal(ragged.study_sheet?.unsupported_assumptions.length, 1);
  assert.deepEqual(ragged.study_sheet?.missing_witnesses[0]?.would_resolve, [
    "e-relocation-lateness",
  ]);
});

test("unsafe identity and tampered packet paths fail closed", () => {
  const unsafeStatus = getGatewayStatus(SYNTHETIC, "../outside", ATTEMPT);
  assert.equal(unsafeStatus.result, "PROTOCOL_INCONSISTENT");
  assert.equal(unsafeStatus.run_id, null);
  assert.deepEqual(unsafeStatus.next_permitted_actions, []);

  const unsafePacket = getGatewayPacket(
    SYNTHETIC,
    SYNTHETIC_RUN,
    "../../attempt-001",
  );
  assert.equal(unsafePacket.result, "PROTOCOL_INCONSISTENT");
  assert.equal(unsafePacket.body, null);

  const oversizedStatus = getGatewayStatus(
    SYNTHETIC,
    `run-${"a".repeat(129)}`,
    ATTEMPT,
  );
  assert.equal(oversizedStatus.result, "PROTOCOL_INCONSISTENT");
  assert.equal(oversizedStatus.run_id, null);

  const backslashStatus = getGatewayStatus(
    SYNTHETIC,
    "run\\outside",
    ATTEMPT,
  );
  assert.equal(backslashStatus.result, "PROTOCOL_INCONSISTENT");
  assert.equal(backslashStatus.run_id, null);

  withSynthetic((workspace) => {
    const packetPath = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "attempts",
      ATTEMPT,
      "packet.json",
    );
    const packet = JSON.parse(readFileSync(packetPath, "utf8")) as Record<
      string,
      unknown
    >;
    packet.authority_state = "promoted";
    writeFileSync(packetPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");

    const result = getGatewayPacket(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(result.result, "PROTOCOL_INCONSISTENT");
    assert.equal(result.body, null);
  });
});

test("artifact and layout tampering expose no gateway packet or action", async (t) => {
  function assertFailsClosed(workspace: string): void {
    const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(status.result, "PROTOCOL_INCONSISTENT");
    assert.equal(status.phase, null);
    assert.equal(status.review_verdict, null);
    assert.deepEqual(status.next_permitted_actions, []);

    const packet = getGatewayPacket(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(packet.result, "PROTOCOL_INCONSISTENT");
    assert.equal(packet.body, null);
  }

  await t.test("packet identity", () => {
    withSynthetic((workspace) => {
      const packetPath = join(
        workspace,
        "runs",
        SYNTHETIC_RUN,
        "attempts",
        ATTEMPT,
        "packet.json",
      );
      const packet = JSON.parse(readFileSync(packetPath, "utf8")) as Record<
        string,
        unknown
      >;
      packet.run_id = "foreign-run";
      writeFileSync(packetPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
      assertFailsClosed(workspace);
    });
  });

  await t.test("ledger bytes", () => {
    withSynthetic((workspace) => {
      const ledgerPath = join(
        workspace,
        "runs",
        SYNTHETIC_RUN,
        "attempts",
        ATTEMPT,
        "ledger.jsonl",
      );
      const ledger = readFileSync(ledgerPath, "utf8");
      const changed = ledger.replace('"sequence":1', '"sequence":9');
      assert.notEqual(changed, ledger);
      writeFileSync(ledgerPath, changed, "utf8");
      assertFailsClosed(workspace);
    });
  });

  await t.test("rendered Markdown", () => {
    withSynthetic((workspace) => {
      const markdownPath = join(
        workspace,
        "runs",
        SYNTHETIC_RUN,
        "attempts",
        ATTEMPT,
        "packet.md",
      );
      writeFileSync(
        markdownPath,
        `${readFileSync(markdownPath, "utf8")}Unbound narrative.\n`,
        "utf8",
      );
      assertFailsClosed(workspace);
    });
  });

  await t.test("unexpected attempt file", () => {
    withSynthetic((workspace) => {
      writeFileSync(
        join(
          workspace,
          "runs",
          SYNTHETIC_RUN,
          "attempts",
          ATTEMPT,
          "extra.txt",
        ),
        "unbound\n",
        "utf8",
      );
      assertFailsClosed(workspace);
    });
  });

  await t.test("packet symlink", () => {
    withSynthetic((workspace) => {
      const packetPath = join(
        workspace,
        "runs",
        SYNTHETIC_RUN,
        "attempts",
        ATTEMPT,
        "packet.json",
      );
      rmSync(packetPath);
      symlinkSync("packet.md", packetPath);
      assertFailsClosed(workspace);
    });
  });
});

test("a special-file activation fails closed without being read", (t) => {
  const available = spawnSync("mkfifo", ["--help"], { encoding: "utf8" });
  if (available.error !== undefined) {
    t.skip("mkfifo is unavailable on this platform");
    return;
  }

  withSynthetic((workspace) => {
    const activationPath = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "activation.json",
    );
    rmSync(activationPath);
    const created = spawnSync("mkfifo", [activationPath], { encoding: "utf8" });
    assert.equal(created.status, 0, created.stderr);

    const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(status.result, "PROTOCOL_INCONSISTENT");
    assert.deepEqual(status.next_permitted_actions, []);
  });
});

test("a special unbound attempt entry cannot be sanitized by the snapshot", (t) => {
  const available = spawnSync("mkfifo", ["--help"], { encoding: "utf8" });
  if (available.error !== undefined) {
    t.skip("mkfifo is unavailable on this platform");
    return;
  }

  withSynthetic((workspace) => {
    const attemptRoot = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "attempts",
      ATTEMPT,
    );
    const fifoPath = join(attemptRoot, "unexpected.fifo");
    const created = spawnSync("mkfifo", [fifoPath], { encoding: "utf8" });
    assert.equal(created.status, 0, created.stderr);

    const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(status.result, "PROTOCOL_INCONSISTENT");
    assert.deepEqual(status.next_permitted_actions, []);
  });
});

test("an oversized unbound attempt entry aborts the bounded snapshot", () => {
  withSynthetic((workspace) => {
    const oversizedPath = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "attempts",
      ATTEMPT,
      "unexpected.bin",
    );
    writeFileSync(oversizedPath, "", "utf8");
    truncateSync(oversizedPath, 64 * 1024 * 1024 + 1);

    const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(status.result, "PROTOCOL_INCONSISTENT");
    assert.deepEqual(status.next_permitted_actions, []);
  });
});

test("activation dependencies must resolve to ordinary bounded files", () => {
  withSynthetic((workspace) => {
    const activationPath = join(
      workspace,
      "runs",
      SYNTHETIC_RUN,
      "activation.json",
    );
    const activation = JSON.parse(readFileSync(activationPath, "utf8")) as Record<
      string,
      any
    >;
    activation.job_ref.path = `runs/${SYNTHETIC_RUN}/attempts`;
    writeFileSync(
      activationPath,
      `${JSON.stringify(activation, null, 2)}\n`,
      "utf8",
    );

    const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(status.result, "PROTOCOL_INCONSISTENT");
    assert.deepEqual(status.next_permitted_actions, []);
  });
});

test("a readable read-only run snapshot is removed before return", (t) => {
  if (process.platform === "win32") {
    t.skip("POSIX directory modes are required for this regression");
    return;
  }

  withSynthetic((workspace) => {
    const runRoot = join(workspace, "runs", SYNTHETIC_RUN);
    const originalMode = lstatSync(runRoot).mode & 0o777;
    chmodSync(runRoot, 0o555);
    try {
      const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
      assert.equal(status.result, "PROTOCOL_CONSISTENT");
      assert.equal(status.phase, "sealed");
    } finally {
      chmodSync(runRoot, originalMode);
    }
  });
});

test("default views are concise and omit machine-sensitive internals", () => {
  const status = getGatewayStatus(SYNTHETIC, SYNTHETIC_RUN, ATTEMPT);
  const packet = getGatewayPacket(SYNTHETIC, SYNTHETIC_RUN, ATTEMPT);
  const statusView = renderGatewayStatusMarkdown(status);
  const packetView = renderGatewayPacketMarkdown(packet);

  for (const view of [statusView, packetView]) {
    assert.doesNotMatch(view, /actor_session_ref|actor-orchestrator/iu);
    assert.doesNotMatch(view, /ledger\.jsonl|event_hash/iu);
    assert.doesNotMatch(view, /\/workspace\/|\/tmp\//u);
    assert.doesNotMatch(view, /\bat\s+\S+\s+\([^\n]+:\d+:\d+\)/u);
  }
  assert.ok(packetView.length < 2_000, "default packet view should stay concise");
  assert.doesNotMatch(packetView, /Device Lantern met the declared/iu);
  assert.match(packet.body?.markdown ?? "", /Device Lantern met the declared/iu);
  assert.match(packetView, /Empirical truth: Not established by the gateway/iu);
});

test("default views redact sensitive-looking content even when supplied as prose", () => {
  const proposal = readJson(
    "fixtures/agent-entry/example-minimal.json",
  ) as Record<string, any>;
  proposal.original_take.received_text =
    "inspect /workspace/private/run.json\n    at execute (file:///workspace/src/run.ts:7:2)";
  proposal.interpretation.summary =
    "actor-orchestrator-999 saw C:\\private\\run.json";
  proposal.nodes[0].statement = proposal.original_take.received_text;
  const intake = inspectGatewayIntake(proposal);
  assert.equal(intake.valid, true);
  const intakeView = renderGatewayIntakeMarkdown(intake);
  assert.doesNotMatch(intakeView, /\/workspace|file:\/\/\/|C:\\private/iu);
  assert.doesNotMatch(intakeView, /actor-orchestrator-999/iu);
  assert.doesNotMatch(intakeView, /\bat execute\b/iu);

  const status = structuredClone(
    getGatewayStatus(SYNTHETIC, SYNTHETIC_RUN, ATTEMPT),
  );
  status.next_permitted_actions = [
    "Read /workspace/private/run.json with actor-orchestrator-999.",
  ];
  const statusView = renderGatewayStatusMarkdown(status);
  assert.doesNotMatch(statusView, /\/workspace|actor-orchestrator-999/iu);

  const packet = structuredClone(
    getGatewayPacket(SYNTHETIC, SYNTHETIC_RUN, ATTEMPT),
  );
  assert.notEqual(packet.body, null);
  if (packet.body !== null) {
    packet.body.packet.title =
      "Failure at execute (/workspace/src/run.ts:7:2) actor-orchestrator-999";
  }
  const packetView = renderGatewayPacketMarkdown(packet);
  assert.doesNotMatch(packetView, /\/workspace|actor-orchestrator-999/iu);
});

test("default views neutralize terminal and bidi control characters", () => {
  const proposal = readJson(
    "fixtures/agent-entry/example-minimal.json",
  ) as Record<string, any>;
  proposal.original_take.received_text =
    "ordinary\u001b[2J text \u202Epass becomes fail";

  const report = inspectGatewayIntake(proposal);
  assert.equal(report.valid, true);
  const view = renderGatewayIntakeMarkdown(report);
  assert.doesNotMatch(view, /[\u001b\u202E]/u);
  assert.match(view, /control character removed/u);
});

test("display redaction preserves football ratios, slash terms, and URLs", () => {
  const proposal = readJson(
    "fixtures/agent-entry/example-minimal.json",
  ) as Record<string, any>;
  const ordinary =
    "20/20 QB/RB chip/double-team pressure/sack https://github.com/Prometheus-Frameworks/TIBER-Research/issues/17";
  proposal.original_take.received_text = ordinary;
  proposal.interpretation.summary = ordinary;
  proposal.nodes[0].statement = ordinary;

  const report = inspectGatewayIntake(proposal);
  assert.equal(report.valid, true);
  const view = renderGatewayIntakeMarkdown(report);
  const readableView = view.replaceAll("\\", "");
  for (const fragment of [
    "20/20",
    "QB/RB",
    "chip/double-team",
    "pressure/sack",
    "https://github.com/Prometheus-Frameworks/TIBER-Research/issues/17",
  ]) {
    assert.ok(
      readableView.includes(fragment),
      `expected default view to preserve ${JSON.stringify(fragment)}`,
    );
  }
  assert.doesNotMatch(view, /absolute path redacted/iu);
});

test("display redaction covers Windows, UNC, hosted file URI, and quoted actor paths", () => {
  const proposal = readJson(
    "fixtures/agent-entry/example-minimal.json",
  ) as Record<string, any>;
  const sensitive =
    'C:/private/run.json \\\\server\\share\\run.json file://host/private/run.json "actor_session_ref": "reviewer-secret"';
  proposal.original_take.received_text = sensitive;
  proposal.interpretation.summary = sensitive;
  proposal.nodes[0].statement = sensitive;

  const report = inspectGatewayIntake(proposal);
  assert.equal(report.valid, true);
  const view = renderGatewayIntakeMarkdown(report);
  assert.doesNotMatch(
    view,
    /C:\/private|server.*share|file:\/\/host|reviewer-secret/iu,
  );
  assert.match(view, /absolute path redacted/iu);
  assert.match(view, /actor session redacted/iu);
});
