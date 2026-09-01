import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const CLI = resolve("dist/src/cli.js");
const FIXTURE = resolve("fixtures/synthetic-complete");
const PREFLIGHT_MANIFEST =
  "preflight/opportunity-clusters-2026-v0/preflight.json";
const RUN_ID = "run-synthetic-001";
const ATTEMPT_ID = "attempt-001";
const TUNSIL_RUN_ID = "tunsil-absence-shock-v0";

function cli(...args: string[]) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

test("CLI validates the golden end-to-end fixture", () => {
  const result = cli(
    "validate",
    FIXTURE,
    RUN_ID,
    ATTEMPT_ID,
    "--phase=sealed",
    "--require-end-to-end",
  );

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout) as {
    valid: boolean;
    end_to_end_ready: boolean;
  };
  assert.equal(report.valid, true);
  assert.equal(report.end_to_end_ready, true);
});

test("CLI resumes a packet-free active attempt from its ledger checkpoint", () => {
  const parent = mkdtempSync(join(tmpdir(), "tiber-research-cli-resume-"));
  const workspace = join(parent, "workspace");
  cpSync(FIXTURE, workspace, { recursive: true });
  try {
    const attemptRoot = join(
      workspace,
      "runs",
      RUN_ID,
      "attempts",
      ATTEMPT_ID,
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
    const runEventsPath = join(
      workspace,
      "runs",
      RUN_ID,
      "run-events.jsonl",
    );
    const activeEvents = readFileSync(runEventsPath, "utf8")
      .trimEnd()
      .split("\n")
      .slice(0, 2);
    writeFileSync(runEventsPath, `${activeEvents.join("\n")}\n`, "utf8");

    const result = cli("resume", workspace, RUN_ID, ATTEMPT_ID);

    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout) as {
      valid: boolean;
      errors: unknown[];
      resume: {
        last_sequence: number;
        last_status: string;
        next_permitted_actions: string[];
      } | null;
    };
    assert.equal(report.valid, true);
    assert.deepEqual(report.errors, []);
    assert.equal(report.resume?.last_sequence, 6);
    assert.equal(report.resume?.last_status, "attempt_started");
    assert.deepEqual(report.resume?.next_permitted_actions, [
      "Continue only the bounded research actions allowed by the activated job.",
    ]);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("CLI validates an honest non-activated Stage 1 preflight", () => {
  const result = cli("preflight", resolve("."), PREFLIGHT_MANIFEST);

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout) as {
    valid: boolean;
    activation_ready: boolean;
    status: string;
    errors: unknown[];
  };
  assert.equal(report.valid, true);
  assert.equal(report.activation_ready, false);
  assert.equal(report.status, "requires_operator_inputs");
  assert.deepEqual(report.errors, []);
});

test("CLI readiness gate rejects an honest non-activated preflight", () => {
  const result = cli(
    "preflight",
    resolve("."),
    PREFLIGHT_MANIFEST,
    "--require-ready",
  );

  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout) as {
    valid: boolean;
    activation_ready: boolean;
    evaluation_at: string | null;
  };
  assert.equal(report.valid, true);
  assert.equal(report.activation_ready, false);
  assert.equal(typeof report.evaluation_at, "string");
});

test("gateway CLI defaults to a concise operator view", async (t) => {
  await t.test("intake is explicitly pre-freeze and inactive", () => {
    const result = cli(
      "gateway:intake",
      resolve("."),
      "fixtures/agent-entry/example-minimal.json",
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^# Research intake$/mu);
    assert.match(result.stdout, /Awaiting Operator Confirmation/u);
    assert.match(result.stdout, /Not activated/u);
    assert.match(result.stdout, /Unpromoted; no downstream authority/u);
    assert.match(result.stdout, /Gateway operation:/u);
    assert.match(result.stdout, /Empirical truth: Not established/iu);
    assert.match(result.stdout, /with no stated cause\./u);
    assert.doesNotMatch(result.stdout, /cause\\\./u);
    assert.doesNotMatch(result.stdout, /^\{/u);
  });

  await t.test("Tunsil status separates submission, review, and seal", () => {
    const result = cli(
      "gateway:status",
      resolve("."),
      TUNSIL_RUN_ID,
      ATTEMPT_ID,
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^# Research status$/mu);
    assert.match(result.stdout, /Phase: submitted/iu);
    assert.match(result.stdout, /Review: Not reached/iu);
    assert.match(result.stdout, /Seal: Unsealed/iu);
    assert.match(result.stdout, /End-to-end ready: No/iu);
    assert.match(result.stdout, /chip\/double-team/iu);
    assert.match(result.stdout, /pressure\/sack/iu);
  });

  await t.test("packet defaults to summary instead of raw audit body", () => {
    const result = cli(
      "gateway:packet",
      resolve("."),
      TUNSIL_RUN_ID,
      ATTEMPT_ID,
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^# Research packet$/mu);
    assert.match(result.stdout, /Process terminal: Completed/iu);
    assert.match(result.stdout, /Terminal decision:.*Requires Data Followup/iu);
    assert.match(result.stdout, /Full packet Markdown is available only/iu);
    assert.doesNotMatch(result.stdout, /^\{/u);
    assert.doesNotMatch(result.stdout, /"claims"\s*:/u);
  });
});

test("gateway CLI exposes structured audit output only when requested", async (t) => {
  await t.test("status JSON reports a sealed synthetic attempt", () => {
    const result = cli(
      "gateway:status",
      FIXTURE,
      RUN_ID,
      ATTEMPT_ID,
      "--format=json",
    );

    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout) as {
      result: string;
      result_basis: string;
      phase: string | null;
      review_verdict: string | null;
      seal_state: string;
      end_to_end_ready: boolean;
      execution: {
        authority_effect: string;
        canonical_state_mutated: boolean;
        model_access: boolean;
        network_access: boolean;
      };
    };
    assert.equal(report.result, "PROTOCOL_CONSISTENT");
    assert.equal(report.result_basis, "deterministic_custody_read");
    assert.equal(report.phase, "sealed");
    assert.equal(report.review_verdict, "pass");
    assert.equal(report.seal_state, "sealed");
    assert.equal(report.end_to_end_ready, true);
    assert.deepEqual(report.execution, {
      authority_effect: "none",
      canonical_state_mutated: false,
      deterministic_read: true,
      model_access: false,
      network_access: false,
    });
  });

  await t.test("packet JSON contains the explicit audit body", () => {
    const result = cli(
      "gateway:packet",
      FIXTURE,
      RUN_ID,
      ATTEMPT_ID,
      "--format=json",
    );

    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout) as {
      result: string;
      body: { markdown: string; packet: { run_id: string } } | null;
    };
    assert.equal(report.result, "PACKET_AVAILABLE");
    assert.equal(report.body?.packet.run_id, RUN_ID);
    assert.match(
      report.body?.markdown ?? "",
      /^# Synthetic Device Threshold Research Packet$/mu,
    );
  });
});

test("gateway CLI fails closed on invalid identity or intake", async (t) => {
  await t.test("unsafe run identity emits no inferred positive state", () => {
    const result = cli(
      "gateway:status",
      resolve("."),
      "../unsafe",
      ATTEMPT_ID,
      "--format=json",
    );

    assert.equal(result.status, 1);
    const report = JSON.parse(result.stdout) as {
      result: string;
      phase: string | null;
      review_verdict: string | null;
      next_permitted_actions: string[];
    };
    assert.equal(report.result, "PROTOCOL_INCONSISTENT");
    assert.equal(report.phase, null);
    assert.equal(report.review_verdict, null);
    assert.deepEqual(report.next_permitted_actions, []);
  });

  await t.test("invalid intake is readable but non-zero", () => {
    const parent = mkdtempSync(join(tmpdir(), "tiber-gateway-intake-"));
    try {
      writeFileSync(join(parent, "invalid.json"), "{}\n", "utf8");
      const result = cli("gateway:intake", parent, "invalid.json");
      assert.equal(result.status, 1);
      assert.match(result.stdout, /Intake Invalid/u);
      assert.match(result.stdout, /valid intake proposal is required/iu);
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });

  await t.test("oversized intake is rejected before JSON parsing", () => {
    const parent = mkdtempSync(join(tmpdir(), "tiber-gateway-oversized-"));
    try {
      writeFileSync(join(parent, "oversized.json"), Buffer.alloc(1_048_577));
      const result = cli("gateway:intake", parent, "oversized.json");
      assert.equal(result.status, 1);
      assert.match(result.stderr, /exceeds the 1048576-byte intake limit/u);
      assert.doesNotMatch(result.stderr, /invalid JSON/u);
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });

  await t.test("FIFO intake is rejected without waiting for a writer", (t) => {
    if (process.platform === "win32") {
      t.skip("named FIFO creation is not portable to Windows");
      return;
    }

    const parent = mkdtempSync(join(tmpdir(), "tiber-gateway-fifo-"));
    try {
      const fifoPath = join(parent, "proposal.json");
      const created = spawnSync("mkfifo", [fifoPath], { encoding: "utf8" });
      if ((created.error as NodeJS.ErrnoException | undefined)?.code === "ENOENT") {
        t.skip("mkfifo is unavailable on this host");
        return;
      }
      assert.equal(created.status, 0, created.stderr);

      const result = spawnSync(
        process.execPath,
        [CLI, "gateway:intake", parent, "proposal.json"],
        {
          cwd: process.cwd(),
          encoding: "utf8",
          timeout: 2_000,
        },
      );
      assert.equal(result.error, undefined);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /expected an ordinary regular file/u);
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });

  await t.test("valid custody without a packet returns a typed non-zero result", () => {
    const parent = mkdtempSync(join(tmpdir(), "tiber-gateway-no-packet-"));
    const workspace = join(parent, "workspace");
    cpSync(FIXTURE, workspace, { recursive: true });
    try {
      const attemptRoot = join(
        workspace,
        "runs",
        RUN_ID,
        "attempts",
        ATTEMPT_ID,
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
      const runEventsPath = join(
        workspace,
        "runs",
        RUN_ID,
        "run-events.jsonl",
      );
      const activeEvents = readFileSync(runEventsPath, "utf8")
        .trimEnd()
        .split("\n")
        .slice(0, 2);
      writeFileSync(runEventsPath, `${activeEvents.join("\n")}\n`, "utf8");

      const result = cli("gateway:packet", workspace, RUN_ID, ATTEMPT_ID);
      assert.equal(result.status, 1);
      assert.match(result.stdout, /Result: Packet Not Available/u);
      assert.match(result.stdout, /Not available at this lifecycle phase/u);
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });
});

test("gateway CLI accepts only trailing, singular format flags", async (t) => {
  await t.test("flag before positionals", () => {
    const result = cli(
      "gateway:status",
      "--format=json",
      resolve("."),
      TUNSIL_RUN_ID,
      ATTEMPT_ID,
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /positional arguments before flags/u);
  });

  await t.test("duplicate format flags", () => {
    const result = cli(
      "gateway:status",
      resolve("."),
      TUNSIL_RUN_ID,
      ATTEMPT_ID,
      "--format=json",
      "--format=json",
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /duplicate or extra format flag/u);
  });

  await t.test("unknown trailing flag", () => {
    const result = cli(
      "gateway:status",
      resolve("."),
      TUNSIL_RUN_ID,
      ATTEMPT_ID,
      "--verbose",
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unknown flag or extra argument/u);
  });
});

test("CLI rejects unknown and duplicate flags", async (t) => {
  await t.test("unknown flag", () => {
    const result = cli(
      "validate",
      FIXTURE,
      RUN_ID,
      ATTEMPT_ID,
      "--trust-me",
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unknown flag or extra argument/u);
  });

  await t.test("duplicate phase", () => {
    const result = cli(
      "validate",
      FIXTURE,
      RUN_ID,
      ATTEMPT_ID,
      "--phase=sealed",
      "--phase=sealed",
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /duplicate --phase flag/u);
  });

  await t.test("duplicate readiness flag", () => {
    const result = cli(
      "validate",
      FIXTURE,
      RUN_ID,
      ATTEMPT_ID,
      "--require-end-to-end",
      "--require-end-to-end",
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /duplicate --require-end-to-end flag/u);
  });

  await t.test("flag before positional arguments", () => {
    const result = cli(
      "validate",
      "--phase=sealed",
      FIXTURE,
      RUN_ID,
      ATTEMPT_ID,
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /flags are permitted only after/u);
  });
});

test("CLI rejects unknown commands and extra positional arguments", async (t) => {
  await t.test("unknown command", () => {
    const result = cli("promote", FIXTURE, RUN_ID, ATTEMPT_ID);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage:/u);
  });

  await t.test("extra resume argument", () => {
    const result = cli("resume", FIXTURE, RUN_ID, ATTEMPT_ID, "extra");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /expected 3 positional arguments/u);
  });

  await t.test("extra preflight argument", () => {
    const result = cli(
      "preflight",
      resolve("."),
      PREFLIGHT_MANIFEST,
      "extra",
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unknown flag or extra argument/u);
  });
});
