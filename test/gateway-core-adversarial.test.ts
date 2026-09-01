import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import test from "node:test";
import {
  getGatewayPacket,
  getGatewayStatus,
  inspectGatewayIntake,
} from "../src/gateway.js";

const SYNTHETIC = resolve("fixtures/synthetic-complete");
const SYNTHETIC_RUN = "run-synthetic-001";
const ATTEMPT = "attempt-001";

function fingerprint(root: string): string[] {
  const entries: string[] = [];

  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort(
      (left, right) => left.name.localeCompare(right.name),
    )) {
      const absolute = join(directory, entry.name);
      const path = relative(root, absolute).replaceAll("\\", "/");
      const stats = lstatSync(absolute);
      if (stats.isDirectory()) {
        entries.push(`d:${path}`);
        visit(absolute);
      } else if (stats.isFile()) {
        const digest = createHash("sha256")
          .update(readFileSync(absolute))
          .digest("hex");
        entries.push(`f:${path}:${digest}`);
      } else {
        entries.push(`other:${path}`);
      }
    }
  }

  visit(root);
  return entries;
}

function redirectTempRoot(path: string): () => void {
  const names = ["TMPDIR", "TMP", "TEMP"] as const;
  const original = new Map(
    names.map((name) => [name, process.env[name]] as const),
  );
  for (const name of names) {
    process.env[name] = path;
  }

  return () => {
    for (const name of names) {
      const value = original.get(name);
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  };
}

test("intake refuses a wide nested value before reading or queuing its tail", () => {
  let indexedReads = 0;
  const wide = new Proxy(new Array<unknown>(200_000), {
    get(target, property, receiver) {
      if (typeof property === "string" && /^(?:0|[1-9]\d*)$/u.test(property)) {
        indexedReads += 1;
        if (indexedReads > 100_000) {
          throw new Error("intake read beyond its declared value limit");
        }
      }
      return Reflect.get(target, property, receiver) as unknown;
    },
  });

  const report = inspectGatewayIntake({ nested: wide });

  assert.equal(report.result, "INTAKE_INVALID");
  assert.deepEqual(report.validation_errors, [
    "gateway intake exceeds the 100000-value structural safety limit",
  ]);
  assert.ok(indexedReads <= 100_000);
});

test("intake refuses an over-depth child before evaluating it", () => {
  const root: Record<string, unknown> = {};
  let cursor = root;
  for (let depth = 0; depth < 32; depth += 1) {
    const child: Record<string, unknown> = {};
    cursor.next = child;
    cursor = child;
  }

  let getterEvaluated = false;
  Object.defineProperty(cursor, "tooDeep", {
    enumerable: true,
    get() {
      getterEvaluated = true;
      throw new Error("an over-depth child must not be evaluated");
    },
  });

  const report = inspectGatewayIntake(root);

  assert.equal(report.result, "INTAKE_INVALID");
  assert.deepEqual(report.validation_errors, [
    "gateway intake exceeds the 32-level nesting safety limit",
  ]);
  assert.equal(getterEvaluated, false);
});

test("workspace-selected temporary environment overrides cannot redirect snapshots", () => {
  const parent = mkdtempSync(join(tmpdir(), "tiber-gateway-core-"));
  const workspace = join(parent, "workspace");
  cpSync(SYNTHETIC, workspace, { recursive: true });
  const before = fingerprint(workspace);
  const restoreTempRoot = redirectTempRoot(workspace);

  try {
    assert.equal(resolve(tmpdir()), resolve(workspace));

    const status = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    const packet = getGatewayPacket(workspace, SYNTHETIC_RUN, ATTEMPT);
    if (process.platform === "win32") {
      assert.equal(status.result, "PROTOCOL_INCONSISTENT");
      assert.ok(status.reason_codes.includes("gateway.snapshot_unavailable"));
      assert.equal(packet.result, "PROTOCOL_INCONSISTENT");
      assert.equal(packet.body, null);
    } else {
      assert.equal(status.result, "PROTOCOL_CONSISTENT");
      assert.equal(packet.result, "PACKET_AVAILABLE");
      assert.notEqual(packet.body, null);
    }
    assert.equal(status.execution.canonical_state_mutated, false);
    assert.equal(packet.execution.canonical_state_mutated, false);
    assert.deepEqual(fingerprint(workspace), before);
  } finally {
    restoreTempRoot();
  }

  try {
    const normalStatus = getGatewayStatus(workspace, SYNTHETIC_RUN, ATTEMPT);
    assert.equal(normalStatus.result, "PROTOCOL_CONSISTENT");
    assert.deepEqual(fingerprint(workspace), before);
  } finally {
    rmSync(parent, { force: true, recursive: true });
  }
});
