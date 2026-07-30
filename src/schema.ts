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
const sourceRelativeSchemaRoot = join(moduleDir, "..", "schemas");
const compiledRelativeSchemaRoot = join(moduleDir, "..", "..", "schemas");
const schemaRoot = existsSync(sourceRelativeSchemaRoot)
  ? sourceRelativeSchemaRoot
  : compiledRelativeSchemaRoot;

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

  const schemas = schemaFiles(schemaRoot).map((path) => {
    const bytes = readFileSync(path);
    try {
      return parseJsonStrict(decodeUtf8Strict(bytes)) as {
        $id?: string;
        title?: string;
      };
    } catch (error) {
      throw new Error(`${path}: invalid schema JSON`, { cause: error });
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

function schemaFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return schemaFiles(path);
      }
      return entry.isFile() && entry.name.endsWith(".schema.json") ? [path] : [];
    })
    .sort();
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
