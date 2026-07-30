import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Ajv2020,
  type ErrorObject,
  type ValidateFunction,
} from "ajv/dist/2020.js";
import addFormatsImport, { type FormatsPlugin } from "ajv-formats";
import { decodeUtf8Strict, parseJsonStrict } from "./canonical.js";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const sourceRelativeSchemaDir = join(moduleDir, "..", "schemas", "v0");
const compiledRelativeSchemaDir = join(moduleDir, "..", "..", "schemas", "v0");
const schemaDir = existsSync(sourceRelativeSchemaDir)
  ? sourceRelativeSchemaDir
  : compiledRelativeSchemaDir;

export interface SchemaFailure {
  instancePath: string;
  keyword: string;
  message: string;
  params: Record<string, unknown>;
}

export interface SchemaResult {
  valid: boolean;
  errors: SchemaFailure[];
}

let validators: Map<string, ValidateFunction> | undefined;
const addFormats = addFormatsImport as unknown as FormatsPlugin;

function loadValidators(): Map<string, ValidateFunction> {
  if (validators) {
    return validators;
  }

  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    validateFormats: true,
  });
  addFormats(ajv);

  const schemas = readdirSync(schemaDir)
    .filter((name) => name.endsWith(".schema.json"))
    .sort()
    .map((name) => {
      const bytes = readFileSync(join(schemaDir, name));
      try {
        return parseJsonStrict(decodeUtf8Strict(bytes)) as {
          $id?: string;
          title?: string;
        };
      } catch (error) {
        throw new Error(`${name}: invalid schema JSON`, { cause: error });
      }
    });

  for (const schema of schemas) {
    ajv.addSchema(schema);
  }

  validators = new Map<string, ValidateFunction>();
  for (const schema of schemas) {
    if (!schema.$id) {
      throw new Error(`schema is missing $id: ${schema.title ?? "untitled"}`);
    }
    const validator = ajv.getSchema(schema.$id);
    if (!validator) {
      throw new Error(`schema did not compile: ${schema.$id}`);
    }
    validators.set(schema.$id, validator);
  }

  return validators;
}

export function validateSchema(schemaId: string, value: unknown): SchemaResult {
  const validator = loadValidators().get(schemaId);
  if (!validator) {
    throw new Error(`unknown schema: ${schemaId}`);
  }

  const valid = validator(value);
  return {
    valid: Boolean(valid),
    errors: (validator.errors ?? []).map(formatError),
  };
}

function formatError(error: ErrorObject): SchemaFailure {
  return {
    instancePath: error.instancePath,
    keyword: error.keyword,
    message: error.message ?? "schema validation failed",
    params: error.params as Record<string, unknown>,
  };
}

export function resetSchemaCacheForTests(): void {
  validators = undefined;
}
