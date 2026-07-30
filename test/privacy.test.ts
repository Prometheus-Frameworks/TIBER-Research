import assert from "node:assert/strict";
import test from "node:test";
import { scanStructuralPrivacy } from "../src/privacy.js";

test("Stage 0 structural privacy scan rejects private contract fields", () => {
  const findings = scanStructuralPrivacy({
    league_id: "123",
    context: "private_roster",
  });

  assert.equal(findings.length, 2);
});

test("Stage 0 structural privacy scan rejects low-entropy private hashes", () => {
  const digest = `sha256:${"a".repeat(64)}`;
  for (const key of [
    "league_id_hash",
    "roster_id_digest",
    "user_id_hash",
    "email_value_digest",
    "sleeper_id_hash",
  ]) {
    const findings = scanStructuralPrivacy({ [key]: digest });
    assert.ok(findings.length > 0, `expected ${key} to be rejected`);
  }
});

test("Stage 0 structural privacy scan does not claim generic semantic DLP", () => {
  assert.deepEqual(
    scanStructuralPrivacy({
      label: "fictional public equipment sample",
      artifact_digest: `sha256:${"b".repeat(64)}`,
    }),
    [],
  );
});
