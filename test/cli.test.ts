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
