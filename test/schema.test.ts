import assert from "node:assert/strict";
import test from "node:test";
import { validateSchema } from "../src/schema.js";

test("compiled runtime resolves the repository schema directory", () => {
  const result = validateSchema(
    "https://schemas.tiber.dev/research/v0/common.schema.json",
    {},
  );

  assert.equal(result.valid, true);
});
