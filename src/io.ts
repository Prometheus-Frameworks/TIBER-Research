import {
  appendFileSync,
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  realpathSync,
  statSync,
  writeFileSync,
  type BigIntStats,
  type Stats,
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
 * Read ungoverned JSON from an ordinary file while bounding memory before any
 * bytes are buffered, decoded, or parsed. The open descriptor is checked again
 * after the path check, and reads are capped in case the file grows concurrently.
 */
export function readJsonRegularFileLimited<T = unknown>(
  workspaceDir: string,
  relativePath: string,
  maxBytes: number,
): T {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new Error("JSON byte limit must be a positive safe integer");
  }

  const workspace = realpathSync(workspaceDir);
  const target = resolveContained(workspace, relativePath);
  const pathStats = lstatSync(target);
  assertRegularFileWithinLimit(relativePath, pathStats, maxBytes);
  const initialIdentity = lstatSync(target, { bigint: true });

  let descriptor: number | undefined;
  try {
    // POSIX defensive flags keep a concurrently substituted FIFO from blocking
    // and reject a substituted symlink. Windows has no filesystem FIFO and the
    // preceding contained-path lstat remains the portable check there.
    const defensiveFlags = process.platform === "win32"
      ? 0
      : constants.O_NONBLOCK | constants.O_NOFOLLOW;
    const pinnedDescriptor = openContainedRegularFileLinux(
      workspace,
      relativePath,
      defensiveFlags,
    );
    descriptor = pinnedDescriptor ?? openSync(
      target,
      constants.O_RDONLY | defensiveFlags,
    );
    const openedStats = fstatSync(descriptor);
    assertRegularFileWithinLimit(relativePath, openedStats, maxBytes);
    assertOpenedFileContained(
      workspace,
      target,
      descriptor,
      initialIdentity,
      relativePath,
      pinnedDescriptor !== null,
    );

    const buffer = Buffer.allocUnsafe(maxBytes + 1);
    let bytesRead = 0;
    while (bytesRead < buffer.length) {
      const count = readSync(
        descriptor,
        buffer,
        bytesRead,
        buffer.length - bytesRead,
        null,
      );
      if (count === 0) {
        break;
      }
      bytesRead += count;
    }
    if (bytesRead > maxBytes) {
      throw new Error(
        `${relativePath}: exceeds the ${maxBytes}-byte intake limit`,
      );
    }

    let text: string;
    try {
      text = decodeUtf8Strict(buffer.subarray(0, bytesRead));
    } catch (error) {
      throw new Error(`${relativePath}: invalid UTF-8`, { cause: error });
    }
    try {
      return parseJsonStrict(text) as T;
    } catch (error) {
      throw new Error(
        `${relativePath}: invalid JSON: ${(error as Error).message}`,
        { cause: error },
      );
    }
  } finally {
    if (descriptor !== undefined) {
      closeSync(descriptor);
    }
  }
}

function openContainedRegularFileLinux(
  workspace: string,
  relativePath: string,
  fileFlags: number,
): number | null {
  if (process.platform !== "linux") {
    return null;
  }
  try {
    realpathSync("/proc/self/fd");
  } catch {
    return null;
  }

  const segments = relativePath.split("/");
  const filename = segments.pop();
  if (filename === undefined) {
    throw new Error(`unsafe relative path: ${relativePath}`);
  }
  const directoryFlags =
    constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW;
  const workspaceIdentity = lstatSync(workspace, { bigint: true });
  let directoryDescriptor: number | undefined;
  try {
    directoryDescriptor = openSync(workspace, directoryFlags);
    assertSameFileIdentity(
      workspaceIdentity,
      fstatSync(directoryDescriptor, { bigint: true }),
      `${relativePath}: workspace changed before intake traversal`,
    );

    for (const segment of segments) {
      const nextDescriptor = openSync(
        `/proc/self/fd/${directoryDescriptor}/${segment}`,
        directoryFlags,
      );
      closeSync(directoryDescriptor);
      directoryDescriptor = nextDescriptor;
    }

    return openSync(
      `/proc/self/fd/${directoryDescriptor}/${filename}`,
      constants.O_RDONLY | fileFlags,
    );
  } finally {
    if (directoryDescriptor !== undefined) {
      closeSync(directoryDescriptor);
    }
  }
}

function assertOpenedFileContained(
  workspace: string,
  target: string,
  descriptor: number,
  initialIdentity: BigIntStats,
  relativePath: string,
  pinnedTraversal: boolean,
): void {
  const openedIdentity = fstatSync(descriptor, { bigint: true });
  assertSameFileIdentity(
    initialIdentity,
    openedIdentity,
    `${relativePath}: file changed before it was opened`,
  );

  if (pinnedTraversal) {
    return;
  }

  const descriptorPath = openedDescriptorPath(descriptor);
  if (descriptorPath !== null) {
    assertCanonicalPathContained(workspace, descriptorPath, relativePath);
  }

  const canonicalTarget = realpathSync(target);
  assertCanonicalPathContained(workspace, canonicalTarget, relativePath);
  const finalLinkIdentity = lstatSync(target, { bigint: true });
  if (finalLinkIdentity.isSymbolicLink()) {
    throw new Error(`${relativePath}: symbolic links are prohibited`);
  }
  assertSameFileIdentity(
    openedIdentity,
    finalLinkIdentity,
    `${relativePath}: file changed while it was opened`,
  );
  assertSameFileIdentity(
    openedIdentity,
    statSync(canonicalTarget, { bigint: true }),
    `${relativePath}: canonical file identity changed while it was opened`,
  );
}

function openedDescriptorPath(descriptor: number): string | null {
  const descriptorLink = process.platform === "linux"
    ? `/proc/self/fd/${descriptor}`
    : process.platform === "win32"
      ? null
      : `/dev/fd/${descriptor}`;
  if (descriptorLink === null) {
    return null;
  }
  try {
    const resolved = realpathSync(descriptorLink);
    return resolved.startsWith("/proc/self/fd/") || resolved.startsWith("/dev/fd/")
      ? null
      : resolved;
  } catch {
    return null;
  }
}

function assertCanonicalPathContained(
  workspace: string,
  candidate: string,
  relativePath: string,
): void {
  const fromWorkspace = relative(workspace, candidate);
  if (
    fromWorkspace === ".." ||
    fromWorkspace.startsWith(`..${sep}`) ||
    isAbsolute(fromWorkspace)
  ) {
    throw new Error(`${relativePath}: opened file escapes workspace`);
  }
}

function assertSameFileIdentity(
  expected: BigIntStats,
  actual: BigIntStats,
  message: string,
): void {
  if (expected.dev !== actual.dev || expected.ino !== actual.ino) {
    throw new Error(message);
  }
}

function assertRegularFileWithinLimit(
  relativePath: string,
  stats: Stats,
  maxBytes: number,
): void {
  if (!stats.isFile()) {
    throw new Error(`${relativePath}: expected an ordinary regular file`);
  }
  if (stats.size > maxBytes) {
    throw new Error(`${relativePath}: exceeds the ${maxBytes}-byte intake limit`);
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
