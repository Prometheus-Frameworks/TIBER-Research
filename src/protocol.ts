export interface CapabilityEnvelope {
  tools: string[];
  network: "allowlisted" | "denied";
  repository_read: string[];
  repository_write: string[];
}

export function capabilityExpansionErrors(
  allowed: CapabilityEnvelope,
  effective: CapabilityEnvelope,
): string[] {
  const errors: string[] = [];

  if (allowed.network === "denied" && effective.network !== "denied") {
    errors.push("effective network access exceeds the job envelope");
  }

  checkSubset("tool", allowed.tools, effective.tools, errors);
  checkSubset(
    "read path",
    allowed.repository_read,
    effective.repository_read,
    errors,
  );
  checkSubset(
    "write path",
    allowed.repository_write,
    effective.repository_write,
    errors,
  );

  return errors;
}

function checkSubset(
  label: string,
  allowed: string[],
  effective: string[],
  errors: string[],
): void {
  const allowedSet = new Set(allowed);
  for (const value of effective) {
    if (!allowedSet.has(value)) {
      errors.push(`effective ${label} is not allowed: ${value}`);
    }
  }
}

export function isAfter(left: string, right: string): boolean {
  const leftMs = Date.parse(left);
  const rightMs = Date.parse(right);
  if (!Number.isFinite(leftMs) || !Number.isFinite(rightMs)) {
    throw new Error(`invalid timestamp comparison: ${left} / ${right}`);
  }
  return leftMs > rightMs;
}
