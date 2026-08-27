import {
  lstatSync,
  appendFileSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { parseDocument } from "yaml";
import {
  canonicalizeJson,
  decodeUtf8Strict,
  parseJsonStrict,
  type JsonValue,
} from "./canonical.js";

export class NonCanonicalJsonFileError extends Error {
  readonly relativePath: string;

  constructor(relativePath: string) {
    super(`${relativePath}: JSON bytes do not conform to tiber-json-file-v1`);
    this.name = "NonCanonicalJsonFileError";
    this.relativePath = relativePath;
  }
}

export function resolveContained(workspaceDir: string, relativePath: string): string {
  const pathSegments = relativePath.split("/");
  if (
    relativePath.length === 0 ||
    isAbsolute(relativePath) ||
    relativePath.includes("\\") ||
    pathSegments.some(
      (segment) => segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    throw new Error(`unsafe relative path: ${relativePath}`);
  }

  const workspace = realpathSync(workspaceDir);
  const candidate = resolve(workspace, relativePath);
  const fromWorkspace = relative(workspace, candidate);

  if (
    fromWorkspace === ".." ||
    fromWorkspace.startsWith(`..${sep}`) ||
    isAbsolute(fromWorkspace)
  ) {
    throw new Error(`path escapes workspace: ${relativePath}`);
  }

  let cursor = workspace;
  const segments = fromWorkspace.split(sep).filter(Boolean);
  for (const segment of segments) {
    cursor = resolve(cursor, segment);
    try {
      if (lstatSync(cursor).isSymbolicLink()) {
        throw new Error(`symbolic links are prohibited: ${relativePath}`);
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        break;
      }
      throw error;
    }
  }

  return candidate;
}

export function readBytes(workspaceDir: string, relativePath: string): Buffer {
  return readFileSync(resolveContained(workspaceDir, relativePath));
}

export function readUtf8(workspaceDir: string, relativePath: string): string {
  try {
    return decodeUtf8Strict(readBytes(workspaceDir, relativePath));
  } catch (error) {
    throw new Error(`${relativePath}: invalid UTF-8`, { cause: error });
  }
}

export function readJson<T = unknown>(
  workspaceDir: string,
  relativePath: string,
): T {
  const text = readUtf8(workspaceDir, relativePath);
  try {
    return parseJsonStrict(text) as T;
  } catch (error) {
    throw new Error(
      `${relativePath}: invalid JSON: ${(error as Error).message}`,
      { cause: error },
    );
  }
}

/**
 * Read a governed JSON artifact and require the one Stage 0 on-disk form:
 * JSON.stringify(value, null, 2) followed by exactly one LF.
 *
 * Canonical JSON hashes bind semantics; this byte normalization makes
 * whitespace and member-order rewrites independently invalid.
 */
export function readNormalizedJson<T = unknown>(
  workspaceDir: string,
  relativePath: string,
): T {
  const text = readUtf8(workspaceDir, relativePath);
  const value = readJson<T>(workspaceDir, relativePath);
  const expected = normalizedJsonText(value);
  if (text !== expected) {
    throw new NonCanonicalJsonFileError(relativePath);
  }
  return value;
}

export function normalizedJsonText(value: unknown): string {
  // Validate the complete value before projecting it into the file form.
  canonicalizeJson(value);
  return `${JSON.stringify(sortJsonValue(value as JsonValue), null, 2)}\n`;
}

function sortJsonValue(value: JsonValue): JsonValue {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sortJsonValue(entry));
  }
  const sorted = Object.create(null) as Record<string, JsonValue>;
  for (const key of Object.keys(value).sort()) {
    const entry = value[key];
    if (entry === undefined) {
      throw new Error(`missing JSON member while sorting: ${key}`);
    }
    sorted[key] = sortJsonValue(entry);
  }
  return sorted;
}

export function readYaml<T = unknown>(
  workspaceDir: string,
  relativePath: string,
): T {
  const text = readUtf8(workspaceDir, relativePath);
  const document = parseDocument(text, {
    merge: false,
    strict: true,
    uniqueKeys: true,
  });
  if (document.errors.length > 0) {
    throw new Error(
      `${relativePath}: invalid YAML: ${document.errors
        .map((entry) => entry.message)
        .join("; ")}`,
    );
  }
  if (document.warnings.length > 0) {
    throw new Error(
      `${relativePath}: ambiguous YAML: ${document.warnings
        .map((entry) => entry.message)
        .join("; ")}`,
    );
  }
  return document.toJS({ maxAliasCount: 0 }) as T;
}

export function writeUtf8(
  workspaceDir: string,
  relativePath: string,
  content: string,
): void {
  const target = resolveContained(workspaceDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, { encoding: "utf8", flag: "w" });
}

export function writeUtf8CreateOnly(
  workspaceDir: string,
  relativePath: string,
  content: string,
): void {
  const target = resolveContained(workspaceDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, { encoding: "utf8", flag: "wx" });
}

export function appendUtf8(
  workspaceDir: string,
  relativePath: string,
  content: string,
): void {
  const target = resolveContained(workspaceDir, relativePath);
  appendFileSync(target, content, { encoding: "utf8", flag: "a" });
}

export function writeJson(
  workspaceDir: string,
  relativePath: string,
  value: unknown,
): void {
  writeUtf8(workspaceDir, relativePath, normalizedJsonText(value));
}

export function writeJsonCreateOnly(
  workspaceDir: string,
  relativePath: string,
  value: unknown,
): void {
  writeUtf8CreateOnly(
    workspaceDir,
    relativePath,
    normalizedJsonText(value),
  );
}
