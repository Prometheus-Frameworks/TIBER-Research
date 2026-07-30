import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  readJson,
  readNormalizedJson,
  readUtf8,
  readYaml,
  resolveContained,
  writeUtf8CreateOnly,
} from "../src/io.js";

function workspace(): string {
  return mkdtempSync(join(tmpdir(), "tiber-research-io-"));
}

test("readJson rejects duplicate keys, including escaped equivalents", () => {
  const root = workspace();
  writeFileSync(join(root, "literal.json"), '{"a":1,"a":2}\n');
  writeFileSync(join(root, "escaped.json"), '{"a":1,"\\u0061":2}\n');

  assert.throws(
    () => readJson(root, "literal.json"),
    /Duplicate JSON object member/u,
  );
  assert.throws(
    () => readJson(root, "escaped.json"),
    /Duplicate JSON object member/u,
  );
});

test("readNormalizedJson rejects semantically equal byte rewrites", () => {
  const root = workspace();
  writeFileSync(join(root, "compact.json"), '{"b":2,"a":1}\n');
  writeFileSync(join(root, "reordered.json"), '{\n  "b": 2,\n  "a": 1\n}\n');
  writeFileSync(join(root, "normalized.json"), '{\n  "a": 1,\n  "b": 2\n}\n');

  assert.throws(
    () => readNormalizedJson(root, "compact.json"),
    /tiber-json-file-v1/u,
  );
  assert.throws(
    () => readNormalizedJson(root, "reordered.json"),
    /tiber-json-file-v1/u,
  );
  assert.equal(
    JSON.stringify(readNormalizedJson(root, "normalized.json")),
    '{"a":1,"b":2}',
  );
});

test("tiber-json-file-v1 preserves special object member names", () => {
  const root = workspace();
  writeFileSync(
    join(root, "special.json"),
    '{\n  "__proto__": "kept",\n  "constructor": "also-kept"\n}\n',
  );

  const value = readNormalizedJson<Record<string, string>>(root, "special.json");
  assert.equal(value.__proto__, "kept");
  assert.equal(value.constructor, "also-kept");
});

test("readYaml rejects duplicate keys and aliases", () => {
  const root = workspace();
  writeFileSync(join(root, "duplicate.yaml"), "job_id: one\njob_id: two\n");
  writeFileSync(
    join(root, "alias.yaml"),
    "base: &base\n  job_id: one\ncopy: *base\n",
  );

  assert.throws(() => readYaml(root, "duplicate.yaml"), /Map keys must be unique/u);
  assert.throws(() => readYaml(root, "alias.yaml"), /Excessive alias count/u);
});

test("readUtf8 rejects malformed UTF-8", () => {
  const root = workspace();
  writeFileSync(join(root, "bad.json"), Buffer.from([0xc3, 0x28]));

  assert.throws(() => readUtf8(root, "bad.json"), /invalid UTF-8/u);
});

test("resolveContained rejects traversal, absolute paths, and symlinks", () => {
  const root = workspace();
  const outside = workspace();
  mkdirSync(join(root, "safe"));
  symlinkSync(outside, join(root, "safe", "escape"));

  assert.throws(() => resolveContained(root, "../escape"), /unsafe relative path/u);
  assert.throws(() => resolveContained(root, "/tmp/escape"), /unsafe relative path/u);
  for (const ambiguousPath of [
    "safe/./file",
    "safe//file",
    "safe/",
    "safe\\file",
  ]) {
    assert.throws(
      () => resolveContained(root, ambiguousPath),
      /unsafe relative path/u,
      ambiguousPath,
    );
  }
  assert.throws(
    () => resolveContained(root, "safe/escape/file.json"),
    /symbolic links are prohibited/u,
  );
});

test("create-only writes cannot replace a frozen file", () => {
  const root = workspace();
  writeUtf8CreateOnly(root, "attempt/submission.json", "{}\n");

  assert.throws(
    () => writeUtf8CreateOnly(root, "attempt/submission.json", '{"changed":true}\n'),
    /EEXIST/u,
  );
});
