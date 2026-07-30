import assert from "node:assert/strict";
import test from "node:test";
import { isAfter, parseTimestamp } from "../src/protocol.js";

test("timestamp parsing rejects precision above milliseconds", () => {
  for (const value of [
    "2026-01-01T14:12:00.0001Z",
    "2026-01-01T14:12:00.1234+00:00",
    "2026-01-01T09:12:00.9999-05:00",
  ]) {
    assert.throws(
      () => parseTimestamp(value),
      /precision exceeds milliseconds/iu,
    );
  }
});

test("timestamp parsing accepts RFC 3339 instants through milliseconds", () => {
  for (const value of [
    "2026-01-01T14:12:00Z",
    "2026-01-01T14:12:00.1Z",
    "2026-01-01T14:12:00.12Z",
    "2026-01-01T14:12:00.123Z",
    "2026-01-01T09:12:00.123-05:00",
  ]) {
    assert.equal(Number.isFinite(parseTimestamp(value)), true);
  }
});

test("timestamp ordering cannot collapse a sub-millisecond regression", () => {
  assert.throws(
    () =>
      isAfter(
        "2026-01-01T14:12:00.0009Z",
        "2026-01-01T14:12:00.0001Z",
      ),
    /precision exceeds milliseconds/iu,
  );
});
