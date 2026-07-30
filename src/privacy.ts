export interface PrivacyFinding {
  path: string;
  reason: string;
}

const forbiddenKeys = new Set([
  "api_key",
  "access_token",
  "authorization",
  "credential",
  "email",
  "league_id",
  "password",
  "private_context",
  "private_value_hash",
  "roster_id",
  "secret",
  "sleeper_id",
  "user_id",
]);

const forbiddenContextValues = new Set([
  "private",
  "private_league",
  "private_roster",
  "private_scoring",
  "private_user",
]);

const forbiddenDerivedKey =
  /(?:league|roster|user|account|email|phone|sleeper)(?:_id|_value)?_(?:hash|digest)$/u;

/**
 * Stage 0 has a structural privacy ceiling, not a semantic DLP claim.
 * This catches prohibited contract fields/classes and obvious credential material.
 */
export function scanStructuralPrivacy(value: unknown): PrivacyFinding[] {
  const findings: PrivacyFinding[] = [];
  walk(value, "$", findings);
  return findings;
}

const obviousPrivateText =
  /\b(?:api[_-]?key|access[_-]?token|league[_-]?id|roster[_-]?id|user[_-]?id|email|password|sleeper[_-]?id)\b/giu;

export function scanRawTextPrivacy(
  text: string,
  path = "$",
): PrivacyFinding[] {
  const findings: PrivacyFinding[] = [];
  for (const match of text.matchAll(obviousPrivateText)) {
    findings.push({
      path,
      reason: `obvious prohibited private/credential marker: ${match[0]}`,
    });
  }
  return findings;
}

function walk(
  value: unknown,
  path: string,
  findings: PrivacyFinding[],
): void {
  if (typeof value === "string") {
    if (forbiddenContextValues.has(value.toLowerCase())) {
      findings.push({
        path,
        reason: `prohibited private context class: ${value}`,
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, `${path}[${index}]`, findings));
    return;
  }

  if (value === null || typeof value !== "object") {
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    const entryPath = `${path}.${key}`;
    if (forbiddenKeys.has(normalizedKey)) {
      findings.push({
        path: entryPath,
        reason: `prohibited Stage 0 field: ${key}`,
      });
    }
    if (
      forbiddenDerivedKey.test(normalizedKey) &&
      typeof entry === "string" &&
      /^sha256:[0-9a-f]{64}$/u.test(entry)
    ) {
      findings.push({
        path: entryPath,
        reason: "derived hash of prohibited low-entropy private material",
      });
    }
    if (
      (normalizedKey.includes("private") ||
        normalizedKey.includes("secret") ||
        normalizedKey.includes("credential")) &&
      typeof entry === "string" &&
      /^sha256:[0-9a-f]{64}$/u.test(entry)
    ) {
      findings.push({
        path: entryPath,
        reason: "derived hash of prohibited private material",
      });
    }
    walk(entry, entryPath, findings);
  }
}
