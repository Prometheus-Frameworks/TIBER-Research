/**
 * The one structured-JSON byte procedure used by the Stage 0 contracts.
 *
 * tiber-canonical-json-v1:
 * - accepts only the JSON data model (no undefined, bigint, functions, symbols,
 *   accessors, sparse arrays, non-finite numbers, or custom prototypes);
 * - preserves array order and string code points without Unicode normalization;
 * - orders object member names by ascending UTF-16 code-unit order;
 * - uses ECMAScript JSON string and finite-number serialization;
 * - emits no insignificant whitespace and encodes the result as UTF-8 without
 *   a byte-order mark.
 *
 * This deliberately named procedure avoids implying RFC 8785 compliance while
 * making every byte-affecting choice explicit and versionable.
 */
export const CANONICAL_JSON_VERSION = "tiber-canonical-json-v1" as const;

export type JsonPrimitive = null | boolean | number | string;
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;
export type JsonArray = JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export class CanonicalJsonError extends TypeError {
  readonly path: string;

  constructor(message: string, path = "$") {
    super(`${message} at ${path}`);
    this.name = "CanonicalJsonError";
    this.path = path;
  }
}

export class StrictJsonParseError extends SyntaxError {
  readonly offset: number;
  readonly line: number;
  readonly column: number;

  constructor(message: string, source: string, offset: number) {
    const prefix = source.slice(0, offset);
    const line = prefix.split("\n").length;
    const lastNewline = prefix.lastIndexOf("\n");
    const column = offset - lastNewline;
    super(`${message} at line ${line}, column ${column}`);
    this.name = "StrictJsonParseError";
    this.offset = offset;
    this.line = line;
    this.column = column;
  }
}

function compareUtf16(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function propertyPath(parent: string, key: string): string {
  return `${parent}[${JSON.stringify(key)}]`;
}

function serializeJson(
  value: unknown,
  path: string,
  ancestors: Set<object>,
): string {
  if (value === null) {
    return "null";
  }

  switch (typeof value) {
    case "boolean":
      return value ? "true" : "false";
    case "string":
      return JSON.stringify(value);
    case "number": {
      if (!Number.isFinite(value)) {
        throw new CanonicalJsonError("Non-finite numbers are not JSON values", path);
      }
      // JSON.stringify follows ECMAScript number serialization and maps -0 to 0.
      return JSON.stringify(value);
    }
    case "undefined":
    case "bigint":
    case "function":
    case "symbol":
      throw new CanonicalJsonError(
        `Unsupported JSON value type ${typeof value}`,
        path,
      );
    case "object":
      break;
    default:
      throw new CanonicalJsonError(
        `Unsupported JSON value ${String(value)}`,
        path,
      );
  }

  const objectValue = value as object;
  if (ancestors.has(objectValue)) {
    throw new CanonicalJsonError("Cyclic values cannot be canonicalized", path);
  }
  ancestors.add(objectValue);

  try {
    if (Array.isArray(value)) {
      const ownKeys = Reflect.ownKeys(value);
      for (const ownKey of ownKeys) {
        if (typeof ownKey === "symbol") {
          throw new CanonicalJsonError(
            "Symbol properties are not part of the JSON data model",
            path,
          );
        }
        if (ownKey === "length") {
          continue;
        }
        const index = Number(ownKey);
        if (
          !Number.isSafeInteger(index) ||
          index < 0 ||
          String(index) !== ownKey ||
          index >= value.length
        ) {
          throw new CanonicalJsonError(
            `Array has a non-index property ${JSON.stringify(ownKey)}`,
            path,
          );
        }
      }

      const items: string[] = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) {
          throw new CanonicalJsonError(
            "Sparse arrays are not part of the JSON data model",
            `${path}[${index}]`,
          );
        }
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (
          descriptor === undefined ||
          !descriptor.enumerable ||
          !("value" in descriptor)
        ) {
          throw new CanonicalJsonError(
            "Array elements must be enumerable data properties",
            `${path}[${index}]`,
          );
        }
        items.push(serializeJson(descriptor.value, `${path}[${index}]`, ancestors));
      }
      return `[${items.join(",")}]`;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new CanonicalJsonError(
        "Only plain objects may be canonicalized",
        path,
      );
    }

    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key === "symbol")) {
      throw new CanonicalJsonError(
        "Symbol properties are not part of the JSON data model",
        path,
      );
    }

    const keys = ownKeys as string[];
    const members: string[] = [];
    for (const key of [...keys].sort(compareUtf16)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (
        descriptor === undefined ||
        !descriptor.enumerable ||
        !("value" in descriptor)
      ) {
        throw new CanonicalJsonError(
          "JSON object members must be enumerable data properties",
          propertyPath(path, key),
        );
      }
      members.push(
        `${JSON.stringify(key)}:${serializeJson(
          descriptor.value,
          propertyPath(path, key),
          ancestors,
        )}`,
      );
    }
    return `{${members.join(",")}}`;
  } finally {
    ancestors.delete(objectValue);
  }
}

/**
 * Canonicalize an in-memory JSON value according to tiber-canonical-json-v1.
 */
export function canonicalizeJson(value: unknown): string {
  return serializeJson(value, "$", new Set<object>());
}

/** Alias kept terse for callers that already establish JSON context. */
export const canonicalize = canonicalizeJson;

export function canonicalJsonBytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(canonicalizeJson(value));
}

/** Decode bytes as UTF-8 without replacement characters or a byte-order mark. */
export function decodeUtf8Strict(bytes: Uint8Array): string {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  ) {
    throw new StrictJsonParseError("UTF-8 byte-order marks are prohibited", "", 0);
  }

  try {
    return new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: true,
    }).decode(bytes);
  } catch (error) {
    throw new StrictJsonParseError(
      `Invalid UTF-8: ${error instanceof Error ? error.message : String(error)}`,
      "",
      0,
    );
  }
}

class StrictJsonParser {
  private offset = 0;

  constructor(private readonly source: string) {}

  parse(): JsonValue {
    if (this.source.charCodeAt(0) === 0xfeff) {
      this.fail("Unicode byte-order marks are prohibited");
    }
    this.skipWhitespace();
    const value = this.parseValue();
    this.skipWhitespace();
    if (this.offset !== this.source.length) {
      this.fail("Unexpected trailing content");
    }
    return value;
  }

  private fail(message: string, offset = this.offset): never {
    throw new StrictJsonParseError(message, this.source, offset);
  }

  private skipWhitespace(): void {
    while (this.offset < this.source.length) {
      const character = this.source[this.offset];
      if (
        character === " " ||
        character === "\t" ||
        character === "\n" ||
        character === "\r"
      ) {
        this.offset += 1;
      } else {
        return;
      }
    }
  }

  private parseValue(): JsonValue {
    const character = this.source[this.offset];
    switch (character) {
      case '"':
        return this.parseString();
      case "{":
        return this.parseObject();
      case "[":
        return this.parseArray();
      case "t":
        this.consumeLiteral("true");
        return true;
      case "f":
        this.consumeLiteral("false");
        return false;
      case "n":
        this.consumeLiteral("null");
        return null;
      default:
        if (character === "-" || (character !== undefined && /[0-9]/u.test(character))) {
          return this.parseNumber();
        }
        this.fail(
          character === undefined
            ? "Unexpected end of JSON input"
            : `Unexpected character ${JSON.stringify(character)}`,
        );
    }
  }

  private consumeLiteral(literal: string): void {
    if (this.source.slice(this.offset, this.offset + literal.length) !== literal) {
      this.fail(`Expected ${literal}`);
    }
    this.offset += literal.length;
  }

  private parseString(): string {
    const start = this.offset;
    this.offset += 1;

    while (this.offset < this.source.length) {
      const code = this.source.charCodeAt(this.offset);
      const character = this.source[this.offset];

      if (character === '"') {
        this.offset += 1;
        const token = this.source.slice(start, this.offset);
        return JSON.parse(token) as string;
      }

      if (code < 0x20) {
        this.fail("Unescaped control character in JSON string");
      }

      if (character === "\\") {
        this.offset += 1;
        const escape = this.source[this.offset];
        if (escape === "u") {
          const digits = this.source.slice(this.offset + 1, this.offset + 5);
          if (!/^[0-9a-fA-F]{4}$/u.test(digits)) {
            this.fail("Invalid Unicode escape in JSON string");
          }
          this.offset += 5;
          continue;
        }
        if (
          escape === '"' ||
          escape === "\\" ||
          escape === "/" ||
          escape === "b" ||
          escape === "f" ||
          escape === "n" ||
          escape === "r" ||
          escape === "t"
        ) {
          this.offset += 1;
          continue;
        }
        this.fail("Invalid escape in JSON string");
      }

      this.offset += 1;
    }

    this.fail("Unterminated JSON string", start);
  }

  private parseNumber(): number {
    const remainder = this.source.slice(this.offset);
    const match =
      /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/u.exec(remainder);
    if (match === null) {
      this.fail("Invalid JSON number");
    }

    const token = match[0];
    const value = Number(token);
    if (!Number.isFinite(value)) {
      this.fail("JSON number is outside the finite IEEE-754 range");
    }
    this.offset += token.length;
    return value;
  }

  private parseArray(): JsonArray {
    this.offset += 1;
    this.skipWhitespace();
    const result: JsonArray = [];
    if (this.source[this.offset] === "]") {
      this.offset += 1;
      return result;
    }

    while (true) {
      result.push(this.parseValue());
      this.skipWhitespace();
      const delimiter = this.source[this.offset];
      if (delimiter === "]") {
        this.offset += 1;
        return result;
      }
      if (delimiter !== ",") {
        this.fail("Expected ',' or ']' in JSON array");
      }
      this.offset += 1;
      this.skipWhitespace();
    }
  }

  private parseObject(): JsonObject {
    this.offset += 1;
    this.skipWhitespace();
    const result = Object.create(null) as JsonObject;
    const keys = new Set<string>();
    if (this.source[this.offset] === "}") {
      this.offset += 1;
      return result;
    }

    while (true) {
      if (this.source[this.offset] !== '"') {
        this.fail("Expected a string member name in JSON object");
      }
      const keyOffset = this.offset;
      const key = this.parseString();
      if (keys.has(key)) {
        this.fail(`Duplicate JSON object member ${JSON.stringify(key)}`, keyOffset);
      }
      keys.add(key);
      this.skipWhitespace();
      if (this.source[this.offset] !== ":") {
        this.fail("Expected ':' after JSON object member name");
      }
      this.offset += 1;
      this.skipWhitespace();
      result[key] = this.parseValue();
      this.skipWhitespace();
      const delimiter = this.source[this.offset];
      if (delimiter === "}") {
        this.offset += 1;
        return result;
      }
      if (delimiter !== ",") {
        this.fail("Expected ',' or '}' in JSON object");
      }
      this.offset += 1;
      this.skipWhitespace();
    }
  }
}

/**
 * Parse JSON while rejecting duplicate object names (including escape-equivalent
 * names), byte-order marks, invalid UTF-8, non-finite decoded numbers, and all
 * ordinary JSON syntax errors. JSON.parse alone does not reject duplicate names.
 */
export function parseJsonStrict(input: string | Uint8Array): JsonValue {
  const source = typeof input === "string" ? input : decodeUtf8Strict(input);
  return new StrictJsonParser(source).parse();
}

export function canonicalizeJsonText(input: string | Uint8Array): string {
  return canonicalizeJson(parseJsonStrict(input));
}
