import { createHash } from "node:crypto";
import {
  lstatSync,
  readFileSync,
  realpathSync,
  type Stats,
} from "node:fs";
import {
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

import { canonicalJsonBytes } from "./canonical.js";

export const SHA256_PREFIX = "sha256:" as const;
export const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;
export type Sha256Digest = `sha256:${string}`;

export class DigestFormatError extends TypeError {
  constructor(value: unknown) {
    super(`Expected sha256:<64 lowercase hexadecimal characters>; received ${String(value)}`);
    this.name = "DigestFormatError";
  }
}

/** Hash exact bytes and return the repository's tagged digest representation. */
export function sha256Raw(bytes: Uint8Array): Sha256Digest {
  return `${SHA256_PREFIX}${createHash("sha256").update(bytes).digest("hex")}`;
}

export const hashRawBytes = sha256Raw;

/** Hash the exact UTF-8 bytes of a string, with no newline or normalization added. */
export function sha256Utf8(text: string): Sha256Digest {
  return sha256Raw(new TextEncoder().encode(text));
}

export const hashUtf8 = sha256Utf8;

/** Canonicalize structured JSON using tiber-canonical-json-v1, then hash it. */
export function sha256CanonicalJson(value: unknown): Sha256Digest {
  return sha256Raw(canonicalJsonBytes(value));
}

export const hashCanonicalJson = sha256CanonicalJson;

/** Hash a file exactly as stored; appropriate for YAML, Markdown, JSONL, and source bytes. */
export function sha256FileRaw(filePath: string): Sha256Digest {
  return sha256Raw(readFileSync(filePath));
}

export const hashRawFile = sha256FileRaw;

export function isSha256Digest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && SHA256_PATTERN.test(value);
}

export function assertSha256Digest(value: unknown): asserts value is Sha256Digest {
  if (!isSha256Digest(value)) {
    throw new DigestFormatError(value);
  }
}

export type SafePathErrorCode =
  | "absolute_path"
  | "backslash"
  | "empty_path"
  | "invalid_segment"
  | "missing_path"
  | "nul_byte"
  | "outside_root"
  | "root_not_directory"
  | "symlink"
  | "unexpected_type";

export class SafePathError extends Error {
  readonly code: SafePathErrorCode;
  readonly candidate: string;

  constructor(code: SafePathErrorCode, candidate: string, message: string) {
    super(message);
    this.name = "SafePathError";
    this.code = code;
    this.candidate = candidate;
  }
}

export interface SafeRelativePathOptions {
  /**
   * Require the target to exist. Set false for a create path; all existing
   * ancestors are still checked for symlinks immediately before return.
   */
  mustExist?: boolean;
  expectedType?: "directory" | "either" | "file";
  /** Reject a root argument that is itself a symlink. Defaults to true. */
  rejectSymlinkRoot?: boolean;
}

function portablePathSegments(candidate: string): string[] {
  if (candidate.length === 0) {
    throw new SafePathError("empty_path", candidate, "Relative path must not be empty");
  }
  if (candidate.includes("\0")) {
    throw new SafePathError("nul_byte", candidate, "Relative path contains a NUL byte");
  }
  // Manifest paths use "/" on every platform. Treat "\" as suspicious rather
  // than allowing a path to mean different things on Windows and POSIX.
  if (candidate.includes("\\")) {
    throw new SafePathError(
      "backslash",
      candidate,
      "Relative paths must use portable '/' separators",
    );
  }
  if (
    isAbsolute(candidate) ||
    /^[A-Za-z]:\//u.test(candidate) ||
    candidate.startsWith("//")
  ) {
    throw new SafePathError("absolute_path", candidate, "Absolute paths are prohibited");
  }

  const segments = candidate.split("/");
  if (
    segments.some(
      (segment) => segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    throw new SafePathError(
      "invalid_segment",
      candidate,
      "Relative paths may not contain empty, '.' or '..' segments",
    );
  }
  return segments;
}

function isWithinRoot(root: string, target: string): boolean {
  const relation = relative(root, target);
  return relation === "" || (!relation.startsWith(`..${sep}`) && relation !== ".." && !isAbsolute(relation));
}

function pathType(stats: Stats): "directory" | "file" | "other" {
  if (stats.isDirectory()) {
    return "directory";
  }
  if (stats.isFile()) {
    return "file";
  }
  return "other";
}

/**
 * Resolve an untrusted repository-relative path without following symlinks.
 *
 * This is a best-effort synchronous boundary check, not a substitute for
 * OS-level openat/O_NOFOLLOW confinement. Call it immediately before opening a
 * path, and use exclusive creation for immutable manifests.
 */
export function resolveSafeRelativePath(
  rootPath: string,
  candidate: string,
  options: SafeRelativePathOptions = {},
): string {
  const mustExist = options.mustExist ?? true;
  const expectedType = options.expectedType ?? "either";
  const rejectSymlinkRoot = options.rejectSymlinkRoot ?? true;
  const segments = portablePathSegments(candidate);
  const lexicalRoot = resolve(rootPath);

  let rootStats: Stats;
  try {
    rootStats = lstatSync(lexicalRoot);
  } catch {
    throw new SafePathError(
      "missing_path",
      candidate,
      `Trusted root does not exist: ${lexicalRoot}`,
    );
  }
  if (rejectSymlinkRoot && rootStats.isSymbolicLink()) {
    throw new SafePathError(
      "symlink",
      candidate,
      `Trusted root must not be a symlink: ${lexicalRoot}`,
    );
  }

  const root = realpathSync.native(lexicalRoot);
  const resolvedRootStats = lstatSync(root);
  if (!resolvedRootStats.isDirectory()) {
    throw new SafePathError(
      "root_not_directory",
      candidate,
      `Trusted root is not a directory: ${root}`,
    );
  }

  const target = resolve(root, ...segments);
  if (!isWithinRoot(root, target)) {
    throw new SafePathError(
      "outside_root",
      candidate,
      `Resolved path escapes trusted root: ${candidate}`,
    );
  }

  let current = root;
  let targetStats: Stats | undefined;
  for (let index = 0; index < segments.length; index += 1) {
    current = resolve(current, segments[index] as string);
    try {
      const stats = lstatSync(current);
      if (stats.isSymbolicLink()) {
        throw new SafePathError(
          "symlink",
          candidate,
          `Symlink path components are prohibited: ${current}`,
        );
      }
      const final = index === segments.length - 1;
      if (!final && !stats.isDirectory()) {
        throw new SafePathError(
          "unexpected_type",
          candidate,
          `Intermediate path component is not a directory: ${current}`,
        );
      }
      if (final) {
        targetStats = stats;
      }
    } catch (error) {
      if (error instanceof SafePathError) {
        throw error;
      }
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      if (code === "ENOENT" && !mustExist) {
        // Once a component is absent, its descendants cannot yet be symlinks.
        // A writer must repeat this check immediately before exclusive create.
        break;
      }
      throw new SafePathError(
        "missing_path",
        candidate,
        `Path does not exist beneath trusted root: ${candidate}`,
      );
    }
  }

  if (mustExist && targetStats === undefined) {
    throw new SafePathError(
      "missing_path",
      candidate,
      `Path does not exist beneath trusted root: ${candidate}`,
    );
  }
  if (targetStats !== undefined && expectedType !== "either") {
    const actualType = pathType(targetStats);
    if (actualType !== expectedType) {
      throw new SafePathError(
        "unexpected_type",
        candidate,
        `Expected ${expectedType} but found ${actualType}: ${candidate}`,
      );
    }
  }

  return target;
}

export function sha256SafeRelativeFile(
  rootPath: string,
  candidate: string,
): Sha256Digest {
  const filePath = resolveSafeRelativePath(rootPath, candidate, {
    expectedType: "file",
    mustExist: true,
  });
  return sha256FileRaw(filePath);
}
