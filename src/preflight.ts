import {
  lstatSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import {
  readBytes,
  readNormalizedJson,
  readUtf8,
  readYaml,
  resolveContained,
} from "./io.js";
import {
  sha256CanonicalJson,
  sha256Raw,
  sha256Utf8,
} from "./digest.js";
import {
  scanRawTextPrivacy,
  scanStructuralPrivacy,
} from "./privacy.js";
import { validateSchema } from "./schema.js";
import { validateActivationCandidate } from "./validator.js";

const V1_SCHEMA_ROOT = "https://schemas.tiber.dev/research/v1";
const V0_SCHEMA_ROOT = "https://schemas.tiber.dev/research/v0";
const PREFLIGHT_SCHEMA = `${V1_SCHEMA_ROOT}/stage1-preflight.schema.json`;
const CANONICAL_UTC_INSTANT =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;
const TIMESTAMP_PRECISION_PATTERN =
  "^(?!.*\\.\\d{4,}(?:[zZ]|[+-]\\d{2}:\\d{2})$).+$";
const STAGE0_TRUST_ANCHOR = Object.freeze({
  repository: "Prometheus-Frameworks/TIBER-Research",
  commit: "8a8039eeaa2ba1b8cae65859d43746df6b949ecd",
  tree_sha: "582930f21d6fafafcfc55527e5aa9363c08ad417",
  pull_request_ref:
    "https://github.com/Prometheus-Frameworks/TIBER-Research/pull/1",
  ci_status: "passed",
});

const ARTIFACT_SCHEMAS: Readonly<Record<string, string>> = {
  authority_decision: `${V0_SCHEMA_ROOT}/authority-decision.schema.json`,
  candidate_inputs: `${V0_SCHEMA_ROOT}/inputs.schema.json`,
  candidate_job: `${V0_SCHEMA_ROOT}/job.schema.json`,
  cost_policy: `${V1_SCHEMA_ROOT}/cost-policy.schema.json`,
  cost_rate_card: `${V1_SCHEMA_ROOT}/cost-rate-card.schema.json`,
  egress_policy: `${V1_SCHEMA_ROOT}/egress-enforcement-policy.schema.json`,
  external_source_availability_receipt:
    `${V1_SCHEMA_ROOT}/external-source-availability-receipt.schema.json`,
  freshness_policy: `${V1_SCHEMA_ROOT}/freshness-policy.schema.json`,
  governing_manifest: `${V1_SCHEMA_ROOT}/governing-manifest.schema.json`,
  governed_artifact_provenance_receipt:
    `${V1_SCHEMA_ROOT}/governed-artifact-provenance-receipt.schema.json`,
  network_enforcement_receipt:
    `${V1_SCHEMA_ROOT}/network-enforcement-receipt.schema.json`,
  network_policy: `${V1_SCHEMA_ROOT}/network-policy.schema.json`,
  observation_policy: `${V1_SCHEMA_ROOT}/observation-policy.schema.json`,
  operator_direction_record:
    `${V1_SCHEMA_ROOT}/operator-direction-record.schema.json`,
  trusted_usage_receipt:
    `${V1_SCHEMA_ROOT}/trusted-usage-receipt.schema.json`,
};

const REQUIRED_REQUIREMENTS = new Set([
  "candidate-inputs",
  "candidate-job",
  "cost-accounting",
  "external-source-availability",
  "governed-artifact-provenance",
  "network-enforcement",
  "operator-activation",
]);

export interface ArtifactRef {
  artifact_type: string;
  path: string;
  digest: string;
  digest_mode: "tiber-canonical-json-v1" | "tiber-raw-sha256-v1";
}

interface Requirement {
  requirement_id: string;
  description: string;
  status: "satisfied" | "unresolved" | "not_applicable";
  evidence_refs: ArtifactRef[];
}

interface UnresolvedInput {
  input_id: string;
  description: string;
  blocking: boolean;
  requirement_refs: string[];
  disposition: "missing" | "inadmissible" | "unverified" | "deferred";
}

interface GateArtifacts {
  external_source_availability_receipt_refs: ArtifactRef[];
  governed_artifact_provenance_receipt_refs: ArtifactRef[];
  network_policy_ref: ArtifactRef;
  network_enforcement_receipt_ref: ArtifactRef | null;
  cost_policy_ref: ArtifactRef;
  trusted_usage_receipt_refs: ArtifactRef[];
}

interface Stage1Preflight {
  schema_version: "research-stage1-preflight/v1";
  preflight_id: string;
  candidate_run_id: string;
  prepared_at: string;
  stage0_base: {
    repository: string;
    commit: string;
    tree_sha: string;
    pull_request_ref: string;
    contract_inventory_ref: ArtifactRef;
    schema_version: string;
    validator_version: string;
    ci_status: "passed";
  };
  ops_decision: {
    decision_ref: string;
    quote_digest: string;
    quote_digest_mode: "tiber-raw-sha256-v1";
    quote_observed_at: string;
    operator: string;
  };
  gate_artifacts: GateArtifacts;
  candidate_artifact_refs: ArtifactRef[];
  requirements: Requirement[];
  unresolved_inputs: UnresolvedInput[];
  status:
    | "ready_for_activation"
    | "requires_operator_inputs"
    | "blocked";
  activation_ready: boolean;
}

interface NetworkPolicy {
  candidate_run_id: string;
  mode: "denied" | "allowlisted";
  default_action: "deny";
  destinations: Array<{
    destination_id: string;
  }>;
  enforcement_boundary: {
    boundary_id: string;
    boundary_type: string;
    enforcement_policy_ref: ArtifactRef;
  };
  policy_status: "proposed" | "approved";
  recorded_at: string;
}

interface NetworkEnforcementReceipt {
  receipt_id: string;
  candidate_run_id: string;
  network_policy_ref: ArtifactRef;
  effective_mode: "denied" | "allowlisted";
  effective_destinations: unknown[];
  default_action: "deny";
  observed_at: string;
  valid_from: string;
  valid_until: string;
  observer: {
    observer_id: string;
    role: string;
    trust_basis: string;
  };
  observation_method: string;
  observation_policy_ref: ArtifactRef;
  enforcement_boundary: NetworkPolicy["enforcement_boundary"];
  environment_identity: {
    environment_id: string;
    execution_surface: string;
    isolation_id: string;
    observed_capabilities_digest: string;
  };
  limitations: string[];
}

interface EgressPolicy {
  schema_version: "research-egress-enforcement-policy/v1";
  control_state: "candidate_not_enforced" | "enforced";
  default_action: "deny";
  execution_profile: string;
  limitations: string[];
  policy_ref: string;
}

interface CostPolicy {
  candidate_run_id: string;
  unit: "usd_micro" | "tiber_actor_session_v1";
  ceiling: number;
  accounting_mode: "trusted_usage" | "fixed_session_reservation";
  rate_card_ref: ArtifactRef;
  fixed_reservation: {
    amount: number;
    roles: Array<"executor" | "reviewer">;
    role_limits: Array<{
      role: "executor" | "reviewer";
      amount: number;
    }>;
  } | null;
  policy_status: "proposed" | "approved";
  recorded_at: string;
}

interface CostRateCard {
  schema_version: "research-cost-rate-card/v1";
  unit: "usd_micro" | "tiber_actor_session_v1";
  accounting_basis: string;
  definition: string;
  exclusions: string[];
}

interface UsageReceipt {
  receipt_id: string;
  candidate_run_id: string;
  role: "executor" | "reviewer";
  actor_session_ref: string;
  invocation_id: string;
  usage_started_at: string;
  usage_ended_at: string;
  observed_at: string;
  provider_native_usage: Array<{
    unit: string;
    quantity: number;
  }>;
  normalized_cost: {
    unit: "usd_micro" | "tiber_actor_session_v1";
    amount: number;
  };
  observer: {
    observer_id: string;
    role: string;
    trust_basis: string;
  };
  observation_method: string;
  trust_boundary: {
    boundary_id: string;
    boundary_type: string;
    policy_ref: ArtifactRef;
  };
  rate_card_digest: string;
  cost_policy_ref: ArtifactRef;
  previous_receipt_digest: string | null;
}

interface AvailabilityReceipt {
  receipt_id: string;
  candidate_run_id: string;
  source_object_id: string;
  source_family_id: string;
  source_identifier: string;
  revision_id: string;
  content_digest: string;
  metadata_digest: string;
  claimed_available_at: string;
  cutoff_at: string;
  evidence_ref: ArtifactRef;
  observed_at: string;
  observation_method: string;
  observer: {
    observer_id: string;
    role: string;
    trust_basis: string;
  };
  trust_boundary: {
    boundary_id: string;
    boundary_type: string;
    policy_ref: ArtifactRef;
  };
}

interface ProvenanceReceipt {
  receipt_id: string;
  candidate_run_id: string;
  artifact_id: string;
  repository: string;
  commit: string;
  path: string;
  blob_digest: string;
  artifact_digest: string;
  effective_at: string;
  observed_at: string;
  verified_at: string;
  cutoff_at: string;
  governing_authority_ref: ArtifactRef;
  governing_manifest_ref: ArtifactRef;
  verifier: {
    verifier_id: string;
    role: string;
    trust_basis: string;
  };
  verification_method: string;
  trust_boundary: {
    boundary_id: string;
    boundary_type: string;
    policy_ref: ArtifactRef;
  };
  freshness: {
    state: "current" | "stale" | "unresolved";
    as_of: string;
    policy_ref: ArtifactRef;
  };
}

interface ObservationPolicy {
  schema_version: "research-observation-policy/v1";
  policy_id: string;
  admitted_observations: Array<{
    boundary_id: string;
    boundary_type: string;
    actor_id: string;
    actor_role: string;
    method: string;
    trust_basis: string;
  }>;
}

interface GoverningManifest {
  schema_version: "research-governing-manifest/v1";
  artifact_id: string;
  governance_status: "promoted";
  repository: string;
  commit: string;
  path: string;
  blob_digest: string;
}

interface OperatorDirectionRecord {
  authority_class: "stage1_preflight_only" | "activate_run";
  decision_ref: string;
  operator: string;
  candidate_run_id: string;
  operator_direction: string;
  quote_digest: string;
  quote_digest_mode: "tiber-raw-sha256-v1";
  recorded_at: string;
  approved_artifact_refs: ArtifactRef[];
}

interface Stage0ContractInventory {
  repository: string;
  base_commit: string;
  base_tree: string;
  pull_request: string;
  audit: {
    ci_status: string;
  };
}

interface CandidateJob {
  schema_version: "research-job/v0";
  synthetic_fixture: boolean;
  job_id: string;
  job_version: string;
  cutoff_at: string;
  subjects: unknown[];
  comparison_population: {
    mode: "closed";
    members: unknown[];
  };
  research_context: {
    context_id: string;
    context_class: string;
  };
  source_envelope: {
    families: Array<{
      source_family_id: string;
      intended_use: string;
      acquisition_methods: string[];
      retention_modes: string[];
      reportability: string[];
      rights_disposition_ref: string;
    }>;
    evidence_classes: string[];
    required_replayability: string;
  };
  capabilities: {
    tools: string[];
    network: "denied" | "allowlisted";
    repository_read: string[];
    repository_write: string[];
  };
  budgets: unknown;
  authority: {
    ceiling: string;
    human_decision_owner: string;
  };
  reportability: string;
}

interface CandidateInputArtifact {
  artifact_id: string;
  repository: string;
  commit: string;
  path: string;
  blob_digest: string;
  artifact_digest: string;
  admissibility: string;
  freshness: string;
}

interface CandidateInputSource {
  source_object_id: string;
  metadata_path: string;
  metadata_digest: string;
  content_path: string | null;
  content_digest: string | null;
  retention_mode: string;
  replayability: string;
  admissibility: string;
  promotable: boolean;
}

interface CandidateInputs {
  schema_version: "research-inputs/v0";
  synthetic_fixture: boolean;
  run_id: string;
  frozen_at: string;
  cutoff_at: string;
  job_ref: {
    job_id: string;
    job_version: string;
    path: string;
    digest: string;
    digest_mode: "tiber-raw-sha256-v1";
  };
  research_context: unknown;
  subjects: unknown[];
  comparisons: unknown[];
  artifacts: CandidateInputArtifact[];
  sources: CandidateInputSource[];
}

interface AuthorityDecision {
  schema_version: "research-authority-decision/v0";
  synthetic_fixture: boolean;
  decision_ref: string;
  decision_type: "activate_run";
  run_id: string;
  job_ref: CandidateInputs["job_ref"];
  inputs_ref: {
    path: string;
    digest: string;
    digest_mode: "tiber-canonical-json-v1";
  };
  cutoff_at: string;
  capabilities: CandidateJob["capabilities"];
  budget: unknown;
  authority_ceiling: string;
  permitted_branch: string;
  permitted_path: string;
  approved_at: string;
  approved_by: string;
}

interface SourceMetadata {
  synthetic_fixture: boolean;
  run_id: string;
  source_object_id: string;
  source_family_id: string;
  source_identifier: string;
  source_class: string;
  intended_use: string;
  rights_disposition_ref: string;
  acquisition_method: string;
  content_path: string | null;
  content_digest: string | null;
  retention_mode: string;
  reportability: string;
  replayability: string;
  admitted: boolean;
  admissibility: {
    state: string;
  };
  freshness: {
    state: string;
  };
  context_match: {
    context_ref: string;
    matched: boolean;
  };
  promotable: boolean;
  revision: {
    revision_id: string;
  };
  temporal: {
    event_time: string | null;
    effective_at: string | null;
    published_at: string | null;
    source_available_at: string | null;
    retrieved_at: string | null;
    first_observed_at: string | null;
    admissible_at: string | null;
    cutoff_at: string;
  };
}

interface Coverage {
  expected: number | null;
  covered: number;
}

export interface PreflightFailure {
  code: string;
  path: string;
  message: string;
}

export interface PreflightGateState {
  external_source_availability: {
    receipt_count: number;
    state: "not_applicable" | "present" | "unresolved";
  };
  governed_artifact_provenance: {
    receipt_count: number;
    state: "not_applicable" | "present" | "unresolved";
  };
  network_enforcement: {
    policy_mode: "denied" | "allowlisted" | null;
    receipt_present: boolean;
    state: "present" | "unresolved";
  };
  cost_accounting: {
    unit: "usd_micro" | "tiber_actor_session_v1" | null;
    ceiling: number | null;
    cumulative_usage: number;
    receipt_count: number;
    state: "present" | "unresolved";
  };
}

export interface PreflightValidationReport {
  valid: boolean;
  activation_ready: boolean;
  evaluation_at: string | null;
  manifest_path: string;
  preflight_id: string | null;
  candidate_run_id: string | null;
  status: string | null;
  gate_state: PreflightGateState;
  errors: PreflightFailure[];
}

export interface PreflightValidationOptions {
  /**
   * Trusted time supplied by the activation-facing caller. Without it the
   * artifact may be validated historically, but readiness is never granted.
   */
  evaluationAt?: string;
}

export function validateStage1Preflight(
  workspace: string,
  manifestPath: string,
  options: PreflightValidationOptions = {},
): PreflightValidationReport {
  const errors: PreflightFailure[] = [];
  const evaluationAt = options.evaluationAt ?? null;
  if (evaluationAt !== null) {
    validateEvaluationInstant(evaluationAt, errors);
  }
  const gateState: PreflightGateState = {
    external_source_availability: {
      receipt_count: 0,
      state: "unresolved",
    },
    governed_artifact_provenance: {
      receipt_count: 0,
      state: "unresolved",
    },
    network_enforcement: {
      policy_mode: null,
      receipt_present: false,
      state: "unresolved",
    },
    cost_accounting: {
      unit: null,
      ceiling: null,
      cumulative_usage: 0,
      receipt_count: 0,
      state: "unresolved",
    },
  };

  let manifest: Stage1Preflight;
  try {
    manifest = readNormalizedJson<Stage1Preflight>(workspace, manifestPath);
  } catch (error) {
    fail(errors, "manifest_read", manifestPath, error);
    return emptyReport(
      manifestPath,
      evaluationAt,
      gateState,
      errors,
    );
  }

  const manifestSchema = validateSchema(PREFLIGHT_SCHEMA, manifest);
  for (const error of manifestSchema.errors) {
    errors.push({
      code: `schema_${error.keyword}`,
      path: `${manifestPath}${error.instancePath}`,
      message: error.message,
    });
  }
  if (!manifestSchema.valid) {
    return reportFor(
      manifestPath,
      manifest,
      evaluationAt,
      gateState,
      errors,
    );
  }

  addPrivacyFindings(errors, manifestPath, manifest, readUtf8(workspace, manifestPath));
  if (evaluationAt !== null) {
    isAfter(
      manifest.prepared_at,
      evaluationAt,
      errors,
      "evaluation_at",
      "The preflight preparation instant cannot postdate the trusted evaluation instant.",
      "preflight_after_evaluation",
    );
  }
  validateRequirements(manifest, errors);
  validateManifestRefUniqueness(manifest, errors);

  const refs = new Map<string, ArtifactRef>();
  const values = new Map<string, unknown>();
  const pending: ArtifactRef[] = [
    manifest.stage0_base.contract_inventory_ref,
    ...manifest.gate_artifacts.external_source_availability_receipt_refs,
    ...manifest.gate_artifacts.governed_artifact_provenance_receipt_refs,
    manifest.gate_artifacts.network_policy_ref,
    ...(manifest.gate_artifacts.network_enforcement_receipt_ref === null
      ? []
      : [manifest.gate_artifacts.network_enforcement_receipt_ref]),
    manifest.gate_artifacts.cost_policy_ref,
    ...manifest.gate_artifacts.trusted_usage_receipt_refs,
    ...manifest.candidate_artifact_refs,
    ...manifest.requirements.flatMap((entry) => entry.evidence_refs),
  ];

  while (pending.length > 0) {
    const ref = pending.shift();
    if (!ref) {
      break;
    }
    const prior = refs.get(ref.path);
    if (prior) {
      if (!sameArtifactRef(prior, ref)) {
        errors.push({
          code: "artifact_ref_conflict",
          path: ref.path,
          message: "The same path is bound by conflicting artifact references.",
        });
        values.delete(ref.path);
      }
      continue;
    }
    refs.set(ref.path, ref);
    const value = validateReferencedArtifact(workspace, ref, errors);
    if (value !== undefined) {
      values.set(ref.path, value);
      for (const nested of findArtifactRefs(value)) {
        pending.push(nested);
      }
    }
  }

  if (refs.has(manifestPath)) {
    errors.push({
      code: "manifest_self_reference",
      path: manifestPath,
      message: "A preflight manifest must not bind itself.",
    });
  }
  validatePackageInventory(workspace, manifestPath, refs, errors);

  const policy = typedValue<NetworkPolicy>(
    values,
    manifest.gate_artifacts.network_policy_ref.path,
  );
  const egressPolicyRef =
    policy?.enforcement_boundary.enforcement_policy_ref;
  const egressPolicy =
    egressPolicyRef === undefined ||
    egressPolicyRef.artifact_type !== "egress_policy"
      ? undefined
      : typedValue<EgressPolicy>(values, egressPolicyRef.path);
  const inventory = typedValue<Stage0ContractInventory>(
    values,
    manifest.stage0_base.contract_inventory_ref.path,
  );
  const operatorDirectionRef = oneCandidateRef(
    manifest,
    "operator_direction_record",
    errors,
  );
  const operatorDirection =
    operatorDirectionRef === undefined
      ? undefined
      : typedValue<OperatorDirectionRecord>(
          values,
          operatorDirectionRef.path,
        );
  const candidateJobRef = oneCandidateRef(
    manifest,
    "candidate_job",
    errors,
  );
  const candidateInputsRef = oneCandidateRef(
    manifest,
    "candidate_inputs",
    errors,
  );
  const authorityDecisionRef = oneCandidateRef(
    manifest,
    "authority_decision",
    errors,
  );
  const candidateJob =
    candidateJobRef === undefined
      ? undefined
      : typedValue<CandidateJob>(values, candidateJobRef.path);
  const candidateInputs =
    candidateInputsRef === undefined
      ? undefined
      : typedValue<CandidateInputs>(values, candidateInputsRef.path);
  const authorityDecision =
    authorityDecisionRef === undefined
      ? undefined
      : typedValue<AuthorityDecision>(values, authorityDecisionRef.path);
  const enforcementRef =
    manifest.gate_artifacts.network_enforcement_receipt_ref;
  const enforcement =
    enforcementRef === null
      ? undefined
      : typedValue<NetworkEnforcementReceipt>(values, enforcementRef.path);
  const cost = typedValue<CostPolicy>(
    values,
    manifest.gate_artifacts.cost_policy_ref.path,
  );
  const costRateCard =
    cost === undefined
      ? undefined
      : typedValue<CostRateCard>(values, cost.rate_card_ref.path);
  const availability = manifest.gate_artifacts
    .external_source_availability_receipt_refs
    .map((ref) => typedValue<AvailabilityReceipt>(values, ref.path))
    .filter((value): value is AvailabilityReceipt => value !== undefined);
  const provenance = manifest.gate_artifacts
    .governed_artifact_provenance_receipt_refs
    .map((ref) => typedValue<ProvenanceReceipt>(values, ref.path))
    .filter((value): value is ProvenanceReceipt => value !== undefined);
  const usage = manifest.gate_artifacts.trusted_usage_receipt_refs
    .map((ref) => ({
      ref,
      value: typedValue<UsageReceipt>(values, ref.path),
    }))
    .filter(
      (entry): entry is { ref: ArtifactRef; value: UsageReceipt } =>
        entry.value !== undefined,
    );
  const observationPolicyRefs = [
    ...new Map(
      [
        ...availability.map(
          (receipt) => receipt.trust_boundary.policy_ref,
        ),
        ...provenance.map(
          (receipt) => receipt.trust_boundary.policy_ref,
        ),
        ...(enforcement === undefined
          ? []
          : [enforcement.observation_policy_ref]),
        ...usage.map(
          (entry) => entry.value.trust_boundary.policy_ref,
        ),
      ].map((ref) => [artifactRefIdentity(ref), ref]),
    ).values(),
  ];

  validateCandidateRunBinding(
    manifest,
    [
      operatorDirection,
      candidateInputs === undefined
        ? undefined
        : { candidate_run_id: candidateInputs.run_id },
      authorityDecision === undefined
        ? undefined
        : { candidate_run_id: authorityDecision.run_id },
      policy,
      enforcement,
      cost,
      ...availability,
      ...provenance,
      ...usage.map((entry) => entry.value),
    ],
    errors,
  );
  validateStage0Base(manifest, inventory, errors);
  validateOperatorDirection(
    manifest,
    operatorDirectionRef,
    operatorDirection,
    errors,
  );
  validateActivationBundle(
    workspace,
    manifest,
    evaluationAt ?? manifest.prepared_at,
    candidateJobRef,
    candidateJob,
    candidateInputsRef,
    candidateInputs,
    authorityDecisionRef,
    authorityDecision,
    operatorDirection,
    observationPolicyRefs,
    errors,
  );
  const availabilityCoverage = validateAvailability(
    workspace,
    manifest,
    candidateJob,
    candidateInputs,
    availability,
    operatorDirection,
    values,
    errors,
  );
  const provenanceCoverage = validateProvenance(
    manifest,
    candidateInputs,
    authorityDecisionRef,
    authorityDecision,
    provenance,
    operatorDirection,
    values,
    errors,
  );
  validateNetwork(
    manifest,
    evaluationAt ?? manifest.prepared_at,
    candidateJob,
    policy,
    enforcement,
    egressPolicyRef,
    egressPolicy,
    operatorDirection,
    values,
    errors,
  );
  validateCost(
    manifest,
    cost,
    costRateCard,
    usage,
    operatorDirection,
    values,
    errors,
    gateState,
  );
  validateGateRequirementCoherence(
    manifest,
    candidateInputs,
    availabilityCoverage,
    provenanceCoverage,
    enforcement !== undefined,
    cost?.policy_status === "approved",
    operatorDirection?.authority_class === "activate_run" &&
      authorityDecision !== undefined,
    errors,
  );

  const availabilityRequirement = manifest.requirements.find(
    (entry) => entry.requirement_id === "external-source-availability",
  );
  gateState.external_source_availability = {
    receipt_count: availability.length,
    state:
      availabilityCoverage.expected === 0
        ? "not_applicable"
        : availabilityCoverage.expected !== null &&
            availabilityCoverage.covered === availabilityCoverage.expected
        ? "present"
        : availabilityCoverage.expected === null &&
            availabilityRequirement?.status === "not_applicable"
          ? "not_applicable"
          : "unresolved",
  };
  gateState.governed_artifact_provenance = {
    receipt_count: provenance.length,
    state:
      provenanceCoverage.expected === 0
        ? "not_applicable"
        : provenanceCoverage.expected !== null &&
            provenanceCoverage.covered === provenanceCoverage.expected
          ? "present"
          : "unresolved",
  };
  gateState.network_enforcement = {
    policy_mode: policy?.mode ?? null,
    receipt_present: enforcement !== undefined,
    state: enforcement === undefined ? "unresolved" : "present",
  };

  validateDisposition(manifest, errors);
  return reportFor(
    manifestPath,
    manifest,
    evaluationAt,
    gateState,
    errors,
  );
}

function validateReferencedArtifact(
  workspace: string,
  ref: ArtifactRef,
  errors: PreflightFailure[],
): unknown {
  let value: unknown;
  try {
    if (ref.digest_mode === "tiber-canonical-json-v1") {
      value = readNormalizedJson(workspace, ref.path);
      const actual = sha256CanonicalJson(value);
      if (actual !== ref.digest) {
        errors.push({
          code: "artifact_digest",
          path: ref.path,
          message: `Expected ${ref.digest}; calculated ${actual}.`,
        });
      }
      addPrivacyFindings(
        errors,
        ref.path,
        value,
        readUtf8(workspace, ref.path),
      );
    } else {
      const bytes = readBytes(workspace, ref.path);
      const actual = sha256Raw(bytes);
      if (actual !== ref.digest) {
        errors.push({
          code: "artifact_digest",
          path: ref.path,
          message: `Expected ${ref.digest}; calculated ${actual}.`,
        });
      }
      const text = readUtf8(workspace, ref.path);
      if (ref.artifact_type === "candidate_job") {
        value = readYaml(workspace, ref.path);
      }
      addPrivacyFindings(errors, ref.path, value, text);
    }
  } catch (error) {
    fail(errors, "artifact_read", ref.path, error);
    return undefined;
  }

  const schemaId = ARTIFACT_SCHEMAS[ref.artifact_type];
  if (schemaId) {
    const expectedDigestMode =
      ref.artifact_type === "candidate_job"
        ? "tiber-raw-sha256-v1"
        : "tiber-canonical-json-v1";
    if (ref.digest_mode !== expectedDigestMode) {
      errors.push({
        code: "artifact_digest_mode",
        path: ref.path,
        message:
          `${ref.artifact_type} must use ${expectedDigestMode}.`,
      });
    }
    const result = validateSchema(schemaId, value);
    for (const error of result.errors) {
      const code =
        error.keyword === "pattern" &&
        error.params.pattern === TIMESTAMP_PRECISION_PATTERN
          ? "timestamp_precision"
          : `schema_${error.keyword}`;
      errors.push({
        code,
        path: `${ref.path}${error.instancePath}`,
        message: error.message,
      });
    }
    if (!result.valid) {
      return undefined;
    }
  }
  return value;
}

function validateRequirements(
  manifest: Stage1Preflight,
  errors: PreflightFailure[],
): void {
  const requirementIds = new Set<string>();
  for (const requirement of manifest.requirements) {
    if (requirementIds.has(requirement.requirement_id)) {
      errors.push({
        code: "duplicate_requirement",
        path: "requirements",
        message: `Duplicate requirement_id: ${requirement.requirement_id}.`,
      });
    }
    requirementIds.add(requirement.requirement_id);
  }
  for (const required of REQUIRED_REQUIREMENTS) {
    if (!requirementIds.has(required)) {
      errors.push({
        code: "missing_requirement",
        path: "requirements",
        message: `Missing mandatory Stage 1 requirement: ${required}.`,
      });
    }
  }

  const inputIds = new Set<string>();
  const referencedUnresolvedRequirements = new Set<string>();
  for (const input of manifest.unresolved_inputs) {
    if (inputIds.has(input.input_id)) {
      errors.push({
        code: "duplicate_unresolved_input",
        path: "unresolved_inputs",
        message: `Duplicate input_id: ${input.input_id}.`,
      });
    }
    inputIds.add(input.input_id);
    for (const requirementRef of input.requirement_refs) {
      referencedUnresolvedRequirements.add(requirementRef);
      if (!requirementIds.has(requirementRef)) {
        errors.push({
          code: "unknown_requirement_ref",
          path: `unresolved_inputs.${input.input_id}`,
          message: `Unknown requirement_ref: ${requirementRef}.`,
        });
      }
    }
  }
  for (const requirement of manifest.requirements) {
    if (
      requirement.status === "unresolved" &&
      !referencedUnresolvedRequirements.has(requirement.requirement_id)
    ) {
      errors.push({
        code: "unbound_unresolved_requirement",
        path: `requirements.${requirement.requirement_id}`,
        message: "Every unresolved requirement must name an unresolved input.",
      });
    }
  }
}

function validateManifestRefUniqueness(
  manifest: Stage1Preflight,
  errors: PreflightFailure[],
): void {
  const groups: Array<[string, ArtifactRef[]]> = [
    [
      "gate_artifacts.external_source_availability_receipt_refs",
      manifest.gate_artifacts.external_source_availability_receipt_refs,
    ],
    [
      "gate_artifacts.governed_artifact_provenance_receipt_refs",
      manifest.gate_artifacts.governed_artifact_provenance_receipt_refs,
    ],
    [
      "gate_artifacts.trusted_usage_receipt_refs",
      manifest.gate_artifacts.trusted_usage_receipt_refs,
    ],
    ["candidate_artifact_refs", manifest.candidate_artifact_refs],
    ...manifest.requirements.map(
      (entry): [string, ArtifactRef[]] => [
        `requirements.${entry.requirement_id}.evidence_refs`,
        entry.evidence_refs,
      ],
    ),
  ];
  for (const [path, refs] of groups) {
    const identities = new Set<string>();
    for (const ref of refs) {
      const identity = [
        ref.artifact_type,
        ref.path,
        ref.digest,
        ref.digest_mode,
      ].join("\u0000");
      if (identities.has(identity)) {
        errors.push({
          code: "duplicate_artifact_ref",
          path,
          message: `Duplicate artifact reference: ${ref.path}.`,
        });
      }
      identities.add(identity);
    }
  }
}

function oneCandidateRef(
  manifest: Stage1Preflight,
  artifactType: string,
  errors: PreflightFailure[],
): ArtifactRef | undefined {
  const matches = manifest.candidate_artifact_refs.filter(
    (ref) => ref.artifact_type === artifactType,
  );
  if (matches.length > 1) {
    errors.push({
      code: "duplicate_candidate_artifact_type",
      path: "candidate_artifact_refs",
      message:
        `Expected at most one ${artifactType} artifact; found ${matches.length}.`,
    });
  }
  return matches[0];
}

function validateStage0Base(
  manifest: Stage1Preflight,
  inventory: Stage0ContractInventory | undefined,
  errors: PreflightFailure[],
): void {
  if (!inventory) {
    errors.push({
      code: "stage0_inventory_missing",
      path: manifest.stage0_base.contract_inventory_ref.path,
      message: "The Stage 0 contract inventory could not be read.",
    });
    return;
  }
  const expected: Array<[string, unknown, unknown, unknown]> = [
    [
      "repository",
      manifest.stage0_base.repository,
      inventory.repository,
      STAGE0_TRUST_ANCHOR.repository,
    ],
    [
      "commit",
      manifest.stage0_base.commit,
      inventory.base_commit,
      STAGE0_TRUST_ANCHOR.commit,
    ],
    [
      "tree_sha",
      manifest.stage0_base.tree_sha,
      inventory.base_tree,
      STAGE0_TRUST_ANCHOR.tree_sha,
    ],
    [
      "pull_request_ref",
      manifest.stage0_base.pull_request_ref,
      inventory.pull_request,
      STAGE0_TRUST_ANCHOR.pull_request_ref,
    ],
    [
      "ci_status",
      manifest.stage0_base.ci_status,
      inventory.audit?.ci_status,
      STAGE0_TRUST_ANCHOR.ci_status,
    ],
  ];
  for (const [field, declared, frozen, trusted] of expected) {
    if (declared !== frozen || declared !== trusted) {
      errors.push({
        code: "stage0_base_mismatch",
        path: `stage0_base.${field}`,
        message:
          `Manifest value ${String(declared)} and inventory value ${String(frozen)} must both match trusted Stage 0 value ${String(trusted)}.`,
      });
    }
  }
}

function validateOperatorDirection(
  manifest: Stage1Preflight,
  ref: ArtifactRef | undefined,
  record: OperatorDirectionRecord | undefined,
  errors: PreflightFailure[],
): void {
  if (!ref || !record) {
    errors.push({
      code: "operator_direction_missing",
      path: "candidate_artifact_refs",
      message:
        "The Ops decision must be backed by exactly one operator_direction_record.",
    });
    return;
  }
  const expected: Array<[string, unknown, unknown]> = [
    ["decision_ref", manifest.ops_decision.decision_ref, record.decision_ref],
    ["operator", manifest.ops_decision.operator, record.operator],
    [
      "quote_digest",
      manifest.ops_decision.quote_digest,
      record.quote_digest,
    ],
    [
      "quote_digest_mode",
      manifest.ops_decision.quote_digest_mode,
      record.quote_digest_mode,
    ],
    [
      "quote_observed_at",
      manifest.ops_decision.quote_observed_at,
      record.recorded_at,
    ],
    [
      "candidate_run_id",
      manifest.candidate_run_id,
      record.candidate_run_id,
    ],
  ];
  for (const [field, declared, frozen] of expected) {
    if (declared !== frozen) {
      errors.push({
        code: "operator_direction_mismatch",
        path: `ops_decision.${field}`,
        message:
          `Manifest value ${String(declared)} does not match the operator direction record value ${String(frozen)}.`,
      });
    }
  }
  const calculatedQuoteDigest = sha256Utf8(record.operator_direction);
  if (calculatedQuoteDigest !== record.quote_digest) {
    errors.push({
      code: "operator_quote_digest",
      path: ref.path,
      message:
        `Expected ${record.quote_digest}; calculated ${calculatedQuoteDigest} from operator_direction.`,
    });
  }
  isAfter(
    record.recorded_at,
    manifest.prepared_at,
    errors,
    "ops_decision.quote_observed_at",
    "The operator direction was recorded after the preflight was prepared.",
  );
}

function validateActivationBundle(
  workspace: string,
  manifest: Stage1Preflight,
  evaluationAt: string,
  jobRef: ArtifactRef | undefined,
  job: CandidateJob | undefined,
  inputsRef: ArtifactRef | undefined,
  inputs: CandidateInputs | undefined,
  authorityRef: ArtifactRef | undefined,
  authority: AuthorityDecision | undefined,
  operatorDirection: OperatorDirectionRecord | undefined,
  observationPolicyRefs: ArtifactRef[],
  errors: PreflightFailure[],
): void {
  if (manifest.activation_ready) {
    for (const [type, ref, value] of [
      ["candidate_job", jobRef, job],
      ["candidate_inputs", inputsRef, inputs],
      ["authority_decision", authorityRef, authority],
    ] as const) {
      if (!ref || !value) {
        errors.push({
          code: "activation_candidate_missing",
          path: "candidate_artifact_refs",
          message: `Activation readiness requires one schema-valid ${type}.`,
        });
      }
    }
    if (operatorDirection?.authority_class !== "activate_run") {
      errors.push({
        code: "operator_activation_missing",
        path: "ops_decision",
        message:
          "Activation readiness requires an exact operator direction with authority_class=activate_run.",
      });
    }
  }
  if (!jobRef || !job || !inputsRef || !inputs) {
    return;
  }

  if (inputs.run_id !== manifest.candidate_run_id) {
    errors.push({
      code: "candidate_run_mismatch",
      path: inputsRef.path,
      message:
        `Expected ${manifest.candidate_run_id}; found ${inputs.run_id}.`,
    });
  }
  validateJobRef(inputs.job_ref, jobRef, job, `${inputsRef.path}.job_ref`, errors);
  if (
    inputs.cutoff_at !== job.cutoff_at ||
    !sameJson(inputs.research_context, job.research_context) ||
    !sameJson(inputs.subjects, job.subjects) ||
    inputs.synthetic_fixture !== job.synthetic_fixture
  ) {
    errors.push({
      code: "job_inputs_mismatch",
      path: inputsRef.path,
      message:
        "Frozen inputs must exactly match the job cutoff, research context, subjects, and synthetic-fixture classification.",
    });
  }
  isAfter(
    inputs.frozen_at,
    manifest.prepared_at,
    errors,
    `${inputsRef.path}.frozen_at`,
    "Frozen inputs were created after the preflight was prepared.",
  );
  // Canonical Research chronology (issue #3 comment 5286246398):
  // evidence/admission <= cutoff <= freeze <= activation/execution. A freeze
  // before the cutoff would leave an eligible-but-unobservable evidence
  // interval, so it is rejected.
  isAfter(
    inputs.cutoff_at,
    inputs.frozen_at,
    errors,
    `${inputsRef.path}.frozen_at`,
    "Frozen inputs must be created at or after the cutoff they freeze.",
    "inputs_frozen_before_cutoff",
  );
  parseInstant(job.cutoff_at, `${jobRef.path}.cutoff_at`, errors);
  parseInstant(inputs.cutoff_at, `${inputsRef.path}.cutoff_at`, errors);
  parseInstant(inputs.frozen_at, `${inputsRef.path}.frozen_at`, errors);

  if (!authorityRef || !authority) {
    return;
  }
  if (
    authority.run_id !== manifest.candidate_run_id ||
    authority.decision_ref !== manifest.ops_decision.decision_ref ||
    authority.cutoff_at !== inputs.cutoff_at ||
    authority.inputs_ref.path !== inputsRef.path ||
    authority.inputs_ref.digest !== inputsRef.digest ||
    authority.inputs_ref.digest_mode !== inputsRef.digest_mode ||
    authority.approved_by !== manifest.ops_decision.operator
  ) {
    errors.push({
      code: "authority_bundle_mismatch",
      path: authorityRef.path,
      message:
        "The activation decision must bind the exact run, decision, inputs, cutoff, and operator declared by the preflight.",
    });
  }
  validateJobRef(
    authority.job_ref,
    jobRef,
    job,
    `${authorityRef.path}.job_ref`,
    errors,
  );
  if (
    !sameJson(authority.capabilities, job.capabilities) ||
    !sameJson(authority.budget, job.budgets)
  ) {
    errors.push({
      code: "authority_contract_mismatch",
      path: authorityRef.path,
      message:
        "Activation capabilities and budget must exactly match the frozen job contract.",
    });
  }
  isAfter(
    inputs.frozen_at,
    authority.approved_at,
    errors,
    `${authorityRef.path}.approved_at`,
    "Activation approval predates the frozen inputs.",
  );
  isAfter(
    authority.approved_at,
    manifest.prepared_at,
    errors,
    `${authorityRef.path}.approved_at`,
    "Activation approval was recorded after the preflight was prepared.",
  );
  parseInstant(
    authority.approved_at,
    `${authorityRef.path}.approved_at`,
    errors,
  );
  parseInstant(authority.cutoff_at, `${authorityRef.path}.cutoff_at`, errors);

  for (const issue of validateActivationCandidate(
    workspace,
    manifest.candidate_run_id,
    jobRef.path,
    inputsRef.path,
    authorityRef.path,
    evaluationAt,
  )) {
    errors.push({
      code: `stage0_${issue.code.replace(/[^A-Za-z0-9]+/g, "_")}`,
      path: issue.path,
      message: issue.message,
    });
  }

  if (
    manifest.activation_ready &&
    operatorDirection &&
    authority.approved_at !== operatorDirection.recorded_at
  ) {
    errors.push({
      code: "operator_activation_chronology",
      path: `${authorityRef.path}.approved_at`,
      message:
        "The activation decision and exact operator direction must share one recorded approval instant.",
    });
  }

  if (manifest.activation_ready && operatorDirection) {
    const requiredApprovedRefs = [
      jobRef,
      inputsRef,
      authorityRef,
      manifest.gate_artifacts.network_policy_ref,
      manifest.gate_artifacts.cost_policy_ref,
      ...observationPolicyRefs,
    ];
    const uniqueApprovedRefs = new Set(
      operatorDirection.approved_artifact_refs.map(artifactRefIdentity),
    );
    if (
      uniqueApprovedRefs.size !==
      operatorDirection.approved_artifact_refs.length
    ) {
      errors.push({
        code: "duplicate_operator_approved_ref",
        path: "operator_direction_record.approved_artifact_refs",
        message: "Operator-approved artifact references must be unique.",
      });
    }
    for (const requiredRef of requiredApprovedRefs) {
      if (!uniqueApprovedRefs.has(artifactRefIdentity(requiredRef))) {
        errors.push({
          code: "operator_approval_bundle_incomplete",
          path: "operator_direction_record.approved_artifact_refs",
          message:
            `The activation direction does not approve exact artifact ${requiredRef.path}.`,
        });
      }
    }
  }
}

function validateJobRef(
  declared: CandidateInputs["job_ref"],
  artifactRef: ArtifactRef,
  job: CandidateJob,
  path: string,
  errors: PreflightFailure[],
): void {
  if (
    declared.job_id !== job.job_id ||
    declared.job_version !== job.job_version ||
    declared.path !== artifactRef.path ||
    declared.digest !== artifactRef.digest ||
    declared.digest_mode !== artifactRef.digest_mode
  ) {
    errors.push({
      code: "job_ref_mismatch",
      path,
      message: "The job reference does not bind the exact candidate job.",
    });
  }
}

function validateCandidateRunBinding(
  manifest: Stage1Preflight,
  values: Array<{ candidate_run_id: string } | undefined>,
  errors: PreflightFailure[],
): void {
  for (const value of values) {
    if (
      value !== undefined &&
      value.candidate_run_id !== manifest.candidate_run_id
    ) {
      errors.push({
        code: "candidate_run_mismatch",
        path: "candidate_run_id",
        message:
          `Expected ${manifest.candidate_run_id}; found ${value.candidate_run_id}.`,
      });
    }
  }
}

function validateAvailability(
  workspace: string,
  manifest: Stage1Preflight,
  job: CandidateJob | undefined,
  inputs: CandidateInputs | undefined,
  receipts: AvailabilityReceipt[],
  operatorDirection: OperatorDirectionRecord | undefined,
  values: Map<string, unknown>,
  errors: PreflightFailure[],
): Coverage {
  const receiptIds = new Set<string>();
  const receiptsBySource = new Map<string, AvailabilityReceipt>();
  for (const receipt of receipts) {
    uniqueId(receiptIds, receipt.receipt_id, "availability receipt", errors);
    validateObservationTrust(
      receipt.trust_boundary,
      receipt.observer,
      receipt.observation_method,
      values,
      receipt.receipt_id,
      errors,
    );
    if (operatorDirection !== undefined) {
      isAfter(
        operatorDirection.recorded_at,
        receipt.observed_at,
        errors,
        receipt.receipt_id,
        "An availability receipt cannot predate the operator direction that authorizes its observation policy.",
        "availability_before_operator_direction",
      );
    }
    if (receiptsBySource.has(receipt.source_object_id)) {
      errors.push({
        code: "duplicate_availability_coverage",
        path: receipt.source_object_id,
        message: "Each admitted source object must have exactly one receipt.",
      });
    }
    receiptsBySource.set(receipt.source_object_id, receipt);
    isAfter(
      receipt.claimed_available_at,
      receipt.cutoff_at,
      errors,
      receipt.receipt_id,
      "claimed_available_at is later than cutoff_at.",
      "availability_after_cutoff",
    );
    isAfter(
      receipt.claimed_available_at,
      receipt.observed_at,
      errors,
      receipt.receipt_id,
      "An availability observation cannot predate the claimed availability instant.",
      "availability_observed_before_available",
    );
    if (
      receipt.observation_method === "direct_pre_cutoff_capture"
    ) {
      isAfter(
        receipt.observed_at,
        receipt.cutoff_at,
        errors,
        receipt.receipt_id,
        "A direct_pre_cutoff_capture must itself be observed by the cutoff.",
        "late_direct_observation",
      );
    }
    isAfter(
      receipt.observed_at,
      manifest.prepared_at,
      errors,
      receipt.receipt_id,
      "An availability receipt cannot be observed after preflight preparation.",
      "availability_observed_after_preflight",
    );
  }

  if (!inputs) {
    return { expected: null, covered: 0 };
  }
  const admittedSources = inputs.sources.filter(
    (source) => source.admissibility === "admitted",
  );
  if (
    manifest.activation_ready &&
    admittedSources.length !== inputs.sources.length
  ) {
    errors.push({
      code: "input_source_not_admitted",
      path: "candidate_inputs.sources",
      message: "Every source in activation-ready inputs must be admitted.",
    });
  }

  let covered = 0;
  const expectedSourceIds = new Set<string>();
  const admittedFamilies = new Set(
    job?.source_envelope.families.map((family) => family.source_family_id) ??
      [],
  );
  for (const source of admittedSources) {
    if (expectedSourceIds.has(source.source_object_id)) {
      errors.push({
        code: "duplicate_input_source",
        path: source.source_object_id,
        message: "Frozen input source identities must be unique.",
      });
    }
    expectedSourceIds.add(source.source_object_id);
    const receipt = receiptsBySource.get(source.source_object_id);
    if (receipt) {
      const expectedEvidenceRef: ArtifactRef = {
        artifact_type: "source_metadata",
        path: source.metadata_path,
        digest: source.metadata_digest,
        digest_mode: "tiber-canonical-json-v1",
      };
      if (!sameArtifactRef(receipt.evidence_ref, expectedEvidenceRef)) {
        errors.push({
          code: "availability_evidence_binding",
          path: receipt.receipt_id,
          message:
            "The availability receipt must cite the exact frozen source-metadata object it attests.",
        });
      }
    }
    const metadata = validateSourceInputFiles(
      workspace,
      source,
      manifest.activation_ready,
      errors,
    );
    if (!receipt || !metadata) {
      continue;
    }
    if (
      receipt.source_family_id !== metadata.source_family_id ||
      receipt.source_identifier !== metadata.source_identifier ||
      receipt.revision_id !== metadata.revision.revision_id ||
      receipt.content_digest !== source.content_digest ||
      receipt.metadata_digest !== source.metadata_digest ||
      receipt.claimed_available_at !== metadata.temporal.source_available_at ||
      receipt.cutoff_at !== inputs.cutoff_at ||
      metadata.temporal.cutoff_at !== inputs.cutoff_at ||
      (job !== undefined &&
        !admittedFamilies.has(metadata.source_family_id))
    ) {
      errors.push({
        code: "availability_coverage_mismatch",
        path: receipt.receipt_id,
        message:
          "The availability receipt does not exactly cover its frozen source object, metadata, cutoff, and admitted source family.",
      });
      continue;
    }
    for (const field of [
      "retrieved_at",
      "first_observed_at",
      "admissible_at",
    ] as const) {
      const custodyAt = metadata.temporal[field];
      if (custodyAt !== null) {
        isAfter(
          custodyAt,
          receipt.observed_at,
          errors,
          receipt.receipt_id,
          `The availability receipt predates source metadata ${field}.`,
          "availability_before_source_custody",
        );
      }
    }
    covered += 1;
  }
  for (const sourceId of receiptsBySource.keys()) {
    if (!expectedSourceIds.has(sourceId)) {
      errors.push({
        code: "unrelated_availability_receipt",
        path: sourceId,
        message:
          "An availability receipt does not correspond to an admitted frozen source.",
      });
    }
  }
  return { expected: admittedSources.length, covered };
}

function validateSourceInputFiles(
  workspace: string,
  source: CandidateInputSource,
  activationReady: boolean,
  errors: PreflightFailure[],
): SourceMetadata | undefined {
  let metadata: SourceMetadata;
  try {
    metadata = readNormalizedJson<SourceMetadata>(
      workspace,
      source.metadata_path,
    );
    const metadataDigest = sha256CanonicalJson(metadata);
    if (metadataDigest !== source.metadata_digest) {
      errors.push({
        code: "source_metadata_digest",
        path: source.metadata_path,
        message:
          `Expected ${source.metadata_digest}; calculated ${metadataDigest}.`,
      });
    }
    const result = validateSchema(
      `${V0_SCHEMA_ROOT}/source-metadata.schema.json`,
      metadata,
    );
    for (const error of result.errors) {
      errors.push({
        code: `schema_${error.keyword}`,
        path: `${source.metadata_path}${error.instancePath}`,
        message: error.message,
      });
    }
    if (!result.valid) {
      return undefined;
    }
    addPrivacyFindings(
      errors,
      source.metadata_path,
      metadata,
      readUtf8(workspace, source.metadata_path),
    );
  } catch (error) {
    fail(errors, "source_metadata_read", source.metadata_path, error);
    return undefined;
  }
  if (metadata.source_object_id !== source.source_object_id) {
    errors.push({
      code: "source_metadata_identity",
      path: source.metadata_path,
      message: "Source metadata identity does not match frozen inputs.",
    });
  }
  // Retention-conditional content rule (PR #7 fail-closed review of
  // 6b4e4e9): reference_only retention forbids retained bytes — readiness
  // rests on the digest-bound availability receipt plus the recorded
  // revision/content identity; content-retaining modes keep the strict
  // resolvable-bytes requirement. Strict in both directions.
  if (source.retention_mode === "reference_only") {
    if (source.content_path !== null) {
      errors.push({
        code: "reference_only_content_retained",
        path: source.source_object_id,
        message:
          "A reference_only source must not retain content bytes the admitted retention policy forbids.",
      });
      return metadata;
    }
    if (activationReady && source.content_digest === null) {
      errors.push({
        code: "source_content_missing_for_activation",
        path: source.source_object_id,
        message:
          "An activation-ready reference_only source requires its recorded content identity digest.",
      });
      return metadata;
    }
    if (
      source.content_digest !== null &&
      typeof (metadata as unknown as { content_digest?: unknown })
        .content_digest === "string" &&
      (metadata as unknown as { content_digest: string }).content_digest !==
        source.content_digest
    ) {
      errors.push({
        code: "source_metadata_content_binding",
        path: source.metadata_path,
        message:
          "Source metadata does not bind the frozen recorded content identity digest.",
      });
    }
    return metadata;
  }
  if (source.content_path === null || source.content_digest === null) {
    if (activationReady) {
      errors.push({
        code: "source_content_missing_for_activation",
        path: source.source_object_id,
        message:
          "Activation-ready source objects require retained, digest-bound content.",
      });
    }
    return metadata;
  }
  try {
    const content = readBytes(workspace, source.content_path);
    const contentDigest = sha256Raw(content);
    if (contentDigest !== source.content_digest) {
      errors.push({
        code: "source_content_digest",
        path: source.content_path,
        message:
          `Expected ${source.content_digest}; calculated ${contentDigest}.`,
      });
    }
    if (
      typeof (metadata as unknown as { content_digest?: unknown })
        .content_digest === "string" &&
      (metadata as unknown as { content_digest: string }).content_digest !==
        source.content_digest
    ) {
      errors.push({
        code: "source_metadata_content_binding",
        path: source.metadata_path,
        message:
          "Source metadata does not bind the frozen source content digest.",
      });
    }
  } catch (error) {
    fail(errors, "source_content_read", source.content_path, error);
  }
  return metadata;
}

function validateObservationTrust(
  boundary: {
    boundary_id: string;
    boundary_type: string;
    policy_ref: ArtifactRef;
  },
  actor: {
    observer_id: string;
    role: string;
    trust_basis: string;
  },
  method: string,
  values: Map<string, unknown>,
  path: string,
  errors: PreflightFailure[],
): void {
  const policy = typedValue<ObservationPolicy>(
    values,
    boundary.policy_ref.path,
  );
  if (
    boundary.policy_ref.artifact_type !== "observation_policy" ||
    policy === undefined
  ) {
    errors.push({
      code: "observation_policy_binding",
      path,
      message:
        "The receipt must bind a schema-valid observation policy.",
    });
    return;
  }
  const admitted = policy.admitted_observations.some(
    (entry) =>
      entry.boundary_id === boundary.boundary_id &&
      entry.boundary_type === boundary.boundary_type &&
      entry.actor_id === actor.observer_id &&
      entry.actor_role === actor.role &&
      entry.method === method &&
      entry.trust_basis === actor.trust_basis,
  );
  if (!admitted) {
    errors.push({
      code: "observation_policy_scope",
      path,
      message:
        "Receipt boundary, observer identity, role, method, and trust basis must match one exact observation-policy admission.",
    });
  }
}

function validateProvenance(
  manifest: Stage1Preflight,
  inputs: CandidateInputs | undefined,
  authorityDecisionRef: ArtifactRef | undefined,
  authorityDecision: AuthorityDecision | undefined,
  receipts: ProvenanceReceipt[],
  operatorDirection: OperatorDirectionRecord | undefined,
  values: Map<string, unknown>,
  errors: PreflightFailure[],
): Coverage {
  const receiptIds = new Set<string>();
  const receiptsByArtifact = new Map<string, ProvenanceReceipt>();
  for (const receipt of receipts) {
    uniqueId(receiptIds, receipt.receipt_id, "provenance receipt", errors);
    validateObservationTrust(
      receipt.trust_boundary,
      {
        observer_id: receipt.verifier.verifier_id,
        role: receipt.verifier.role,
        trust_basis: receipt.verifier.trust_basis,
      },
      receipt.verification_method,
      values,
      receipt.receipt_id,
      errors,
    );
    if (operatorDirection !== undefined) {
      isAfter(
        operatorDirection.recorded_at,
        receipt.observed_at,
        errors,
        receipt.receipt_id,
        "A provenance receipt cannot predate the operator direction that authorizes its observation policy.",
        "provenance_before_operator_direction",
      );
    }
    const freshnessPolicy = typedValue<{ cutoff_rule?: string }>(
      values,
      receipt.freshness.policy_ref.path,
    );
    if (
      receipt.freshness.policy_ref.artifact_type !==
        "freshness_policy" ||
      freshnessPolicy === undefined
    ) {
      errors.push({
        code: "freshness_policy_binding",
        path: receipt.receipt_id,
        message:
          "The provenance receipt must bind a schema-valid governed-artifact freshness policy.",
      });
    } else if (
      freshnessPolicy.cutoff_rule === "freshness_as_of_lte_cutoff_at"
    ) {
      // Superseded-vocabulary trap (PR #7 fail-closed review of 6b4e4e9): a
      // policy that still claims the pre-adjudication cutoff rule is held to
      // that rule verbatim — it cannot govern a receipt whose custody-side
      // assessment instant follows the cutoff. The canonical vocabulary is
      // evidence_clocks_lte_cutoff_custody_assessment_may_follow.
      isAfter(
        receipt.freshness.as_of,
        receipt.cutoff_at,
        errors,
        receipt.receipt_id,
        "The governing freshness policy's declared cutoff rule requires as_of at or before the cutoff.",
        "freshness_after_cutoff",
      );
    }
    if (receiptsByArtifact.has(receipt.artifact_id)) {
      errors.push({
        code: "duplicate_provenance_coverage",
        path: receipt.artifact_id,
        message: "Each admitted governed artifact must have exactly one receipt.",
      });
    }
    receiptsByArtifact.set(receipt.artifact_id, receipt);
    isAfter(
      receipt.effective_at,
      receipt.cutoff_at,
      errors,
      receipt.receipt_id,
      "effective_at is later than cutoff_at.",
      "artifact_effective_after_cutoff",
    );
    isAfter(
      receipt.effective_at,
      receipt.observed_at,
      errors,
      receipt.receipt_id,
      "A governed artifact cannot be observed before it becomes effective.",
      "artifact_observed_before_effective",
    );
    isAfter(
      receipt.effective_at,
      manifest.prepared_at,
      errors,
      receipt.receipt_id,
      "A governed artifact cannot become effective after preflight preparation.",
      "artifact_effective_after_preflight",
    );
    isAfter(
      receipt.observed_at,
      receipt.verified_at,
      errors,
      receipt.receipt_id,
      "verified_at is earlier than observed_at.",
      "artifact_verification_order",
    );
    // Canonical Research chronology (issue #3 comment 5286246398): the
    // freshness assessment instant is a custody-side clock and may follow
    // the evidence cutoff; only the evidence-side clock (effective_at) must
    // stay at or before the cutoff.
    isAfter(
      receipt.effective_at,
      receipt.freshness.as_of,
      errors,
      receipt.receipt_id,
      "Freshness cannot be assessed before the governed artifact becomes effective.",
      "freshness_before_effective",
    );
    isAfter(
      receipt.freshness.as_of,
      receipt.verified_at,
      errors,
      receipt.receipt_id,
      "Freshness cannot be assessed after the recorded verification instant.",
      "freshness_after_verification",
    );
    isAfter(
      receipt.freshness.as_of,
      manifest.prepared_at,
      errors,
      receipt.receipt_id,
      "A freshness verification cannot be dated after preflight preparation.",
      "freshness_after_preflight",
    );
    isAfter(
      receipt.observed_at,
      manifest.prepared_at,
      errors,
      receipt.receipt_id,
      "A provenance receipt cannot be observed after preflight preparation.",
      "provenance_observed_after_preflight",
    );
    isAfter(
      receipt.verified_at,
      manifest.prepared_at,
      errors,
      receipt.receipt_id,
      "A provenance receipt cannot be verified after preflight preparation.",
      "provenance_verified_after_preflight",
    );
    if (manifest.activation_ready && receipt.freshness.state !== "current") {
      errors.push({
        code: "artifact_not_current",
        path: receipt.receipt_id,
        message: "Activation-ready governed artifacts must be current.",
      });
    }
    if (authorityDecision !== undefined) {
      isAfter(
        authorityDecision.approved_at,
        receipt.observed_at,
        errors,
        receipt.receipt_id,
        "The provenance receipt predates the governing activation authority it cites.",
        "provenance_before_governing_authority",
      );
      isAfter(
        authorityDecision.approved_at,
        receipt.freshness.as_of,
        errors,
        receipt.receipt_id,
        "Freshness cannot be assessed before the governing activation authority is recorded.",
        "freshness_before_governing_authority",
      );
    }
    if (operatorDirection !== undefined) {
      isAfter(
        operatorDirection.recorded_at,
        receipt.freshness.as_of,
        errors,
        receipt.receipt_id,
        "Freshness cannot be assessed before the operator direction that authorizes its observation policy.",
        "freshness_before_operator_direction",
      );
    }
  }

  if (!inputs) {
    return { expected: null, covered: 0 };
  }
  const admittedArtifacts = inputs.artifacts.filter(
    (artifact) =>
      artifact.admissibility === "admitted" &&
      artifact.freshness === "current",
  );
  if (
    manifest.activation_ready &&
    admittedArtifacts.length !== inputs.artifacts.length
  ) {
    errors.push({
      code: "input_artifact_not_current",
      path: "candidate_inputs.artifacts",
      message:
        "Every governed artifact in activation-ready inputs must be admitted and current.",
    });
  }
  let covered = 0;
  const expectedArtifactIds = new Set<string>();
  for (const artifact of admittedArtifacts) {
    if (expectedArtifactIds.has(artifact.artifact_id)) {
      errors.push({
        code: "duplicate_input_artifact",
        path: artifact.artifact_id,
        message: "Frozen input artifact identities must be unique.",
      });
    }
    expectedArtifactIds.add(artifact.artifact_id);
    const receipt = receiptsByArtifact.get(artifact.artifact_id);
    if (!receipt) {
      continue;
    }
    const governingManifest = typedValue<GoverningManifest>(
      values,
      receipt.governing_manifest_ref.path,
    );
    if (
      receipt.repository !== artifact.repository ||
      receipt.commit !== artifact.commit ||
      receipt.path !== artifact.path ||
      receipt.blob_digest !== artifact.blob_digest ||
      receipt.artifact_digest !== artifact.artifact_digest ||
      receipt.cutoff_at !== inputs.cutoff_at ||
      authorityDecisionRef === undefined ||
      !sameArtifactRef(
        receipt.governing_authority_ref,
        authorityDecisionRef,
      ) ||
      receipt.governing_manifest_ref.artifact_type !==
        "governing_manifest" ||
      receipt.governing_manifest_ref.digest_mode !==
        "tiber-canonical-json-v1" ||
      receipt.governing_manifest_ref.digest !== artifact.artifact_digest ||
      governingManifest === undefined ||
      governingManifest.artifact_id !== artifact.artifact_id ||
      governingManifest.governance_status !== "promoted" ||
      governingManifest.repository !== artifact.repository ||
      governingManifest.commit !== artifact.commit ||
      governingManifest.path !== artifact.path ||
      governingManifest.blob_digest !== artifact.blob_digest
    ) {
      errors.push({
        code: "provenance_coverage_mismatch",
        path: receipt.receipt_id,
        message:
          "The provenance receipt does not exactly cover its frozen governed artifact, cutoff, activation authority, and governing manifest.",
      });
      continue;
    }
    covered += 1;
  }
  for (const artifactId of receiptsByArtifact.keys()) {
    if (!expectedArtifactIds.has(artifactId)) {
      errors.push({
        code: "unrelated_provenance_receipt",
        path: artifactId,
        message:
          "A provenance receipt does not correspond to an admitted, current frozen artifact.",
      });
    }
  }
  return { expected: admittedArtifacts.length, covered };
}

function validateNetwork(
  manifest: Stage1Preflight,
  evaluationAt: string,
  job: CandidateJob | undefined,
  policy: NetworkPolicy | undefined,
  enforcement: NetworkEnforcementReceipt | undefined,
  egressPolicyRef: ArtifactRef | undefined,
  egressPolicy: EgressPolicy | undefined,
  operatorDirection: OperatorDirectionRecord | undefined,
  values: Map<string, unknown>,
  errors: PreflightFailure[],
): void {
  if (!policy) {
    return;
  }
  if (
    egressPolicyRef === undefined ||
    egressPolicyRef.artifact_type !== "egress_policy" ||
    egressPolicy === undefined
  ) {
    errors.push({
      code: "egress_policy_binding",
      path: manifest.gate_artifacts.network_policy_ref.path,
      message:
        "The network policy must bind a schema-valid egress enforcement policy.",
    });
  }
  isAfter(
    policy.recorded_at,
    manifest.prepared_at,
    errors,
    manifest.gate_artifacts.network_policy_ref.path,
    "The network policy was recorded after preflight preparation.",
    "network_policy_after_preflight",
  );
  if (job && policy.mode !== job.capabilities.network) {
    errors.push({
      code: "network_capability_mismatch",
      path: manifest.gate_artifacts.network_policy_ref.path,
      message:
        "The Stage 1 network policy must exactly match the frozen job capability.",
    });
  }
  if (manifest.activation_ready && operatorDirection) {
    isAfter(
      policy.recorded_at,
      operatorDirection.recorded_at,
      errors,
      manifest.gate_artifacts.network_policy_ref.path,
      "The exact operator activation direction predates the network policy it purports to approve.",
      "operator_approval_predates_network_policy",
    );
  }
  if (manifest.activation_ready && policy.policy_status !== "approved") {
    errors.push({
      code: "network_policy_not_approved",
      path: manifest.gate_artifacts.network_policy_ref.path,
      message: "Activation readiness requires an approved network policy.",
    });
  }
  const destinationIds = new Set<string>();
  for (const destination of policy.destinations) {
    uniqueId(
      destinationIds,
      destination.destination_id,
      "network destination",
      errors,
    );
  }
  if (enforcement) {
    validateObservationTrust(
      {
        boundary_id: enforcement.enforcement_boundary.boundary_id,
        boundary_type: enforcement.enforcement_boundary.boundary_type,
        policy_ref: enforcement.observation_policy_ref,
      },
      enforcement.observer,
      enforcement.observation_method,
      values,
      enforcement.receipt_id,
      errors,
    );
    if (operatorDirection !== undefined) {
      isAfter(
        operatorDirection.recorded_at,
        enforcement.observed_at,
        errors,
        enforcement.receipt_id,
        "A network enforcement receipt cannot predate the operator direction that authorizes its observation policy.",
        "network_before_operator_direction",
      );
    }
    if (
      !sameArtifactRef(
        enforcement.network_policy_ref,
        manifest.gate_artifacts.network_policy_ref,
      )
    ) {
      errors.push({
        code: "network_policy_binding",
        path: "network_enforcement_receipt.network_policy_ref",
        message: "The enforcement receipt does not bind the manifest policy.",
      });
    }
    if (
      enforcement.effective_mode !== policy.mode ||
      enforcement.default_action !== policy.default_action ||
      !sameJson(enforcement.effective_destinations, policy.destinations) ||
      !sameJson(enforcement.enforcement_boundary, policy.enforcement_boundary)
    ) {
      errors.push({
        code: "network_effective_mismatch",
        path: "network_enforcement_receipt",
        message: "Effective network controls do not exactly match the policy.",
      });
    }
    if (
      job !== undefined &&
      enforcement.environment_identity.observed_capabilities_digest !==
        sha256CanonicalJson(job.capabilities)
    ) {
      errors.push({
        code: "network_capability_observation_mismatch",
        path: "network_enforcement_receipt.environment_identity",
        message:
          "The enforcement receipt must observe the exact frozen capability envelope.",
      });
    }
    if (
      egressPolicy !== undefined &&
      enforcement.environment_identity.environment_id !==
        egressPolicy.execution_profile
    ) {
      errors.push({
        code: "network_environment_mismatch",
        path: "network_enforcement_receipt.environment_identity",
        message:
          "The enforcement receipt environment must match the exact egress execution profile.",
      });
    }
    // Structured provenance must not overclaim the enforcement mechanism
    // (PR #7 review of a34237e): while the deny-default egress control is
    // not in enforced state, a receipt may only attest the weakest truthful
    // boundary class — runner_protocol_attestation — never a technical
    // isolation class.
    if (
      egressPolicy !== undefined &&
      egressPolicy.control_state !== "enforced" &&
      enforcement.enforcement_boundary.boundary_type !==
        "runner_protocol_attestation"
    ) {
      errors.push({
        code: "enforcement_boundary_overclaim",
        path: "network_enforcement_receipt.enforcement_boundary",
        message:
          "An enforcement receipt over an unenforced egress control must declare runner_protocol_attestation, not a technical isolation boundary.",
      });
    }
    isAfter(
      enforcement.valid_from,
      enforcement.observed_at,
      errors,
      "network_enforcement_receipt",
      "The observation precedes its enforcement validity window.",
      "network_receipt_window",
    );
    isAfter(
      policy.recorded_at,
      enforcement.valid_from,
      errors,
      "network_enforcement_receipt",
      "The enforcement validity window cannot begin before the exact network policy is recorded.",
      "network_valid_before_policy",
    );
    isAfter(
      enforcement.observed_at,
      enforcement.valid_until,
      errors,
      "network_enforcement_receipt",
      "The observation follows its enforcement validity window.",
      "network_receipt_window",
    );
    isAfter(
      enforcement.observed_at,
      manifest.prepared_at,
      errors,
      "network_enforcement_receipt",
      "The enforcement receipt was observed after preflight preparation.",
      "network_observed_after_preflight",
    );
    isAfter(
      policy.recorded_at,
      enforcement.observed_at,
      errors,
      "network_enforcement_receipt",
      "The enforcement receipt cannot observe a policy before that policy is recorded.",
      "network_observed_before_policy",
    );
    if (
      manifest.activation_ready
    ) {
      isAfter(
        enforcement.valid_from,
        evaluationAt,
        errors,
        "network_enforcement_receipt",
        "The enforcement receipt is not yet valid at the trusted evaluation time.",
        "network_receipt_not_current",
      );
      isAfter(
        evaluationAt,
        enforcement.valid_until,
        errors,
        "network_enforcement_receipt",
        "The enforcement receipt is no longer valid at the trusted evaluation time.",
        "network_receipt_not_current",
      );
    }
  }
  if (
    manifest.activation_ready &&
    (policy.mode !== "denied" || policy.destinations.length !== 0)
  ) {
    errors.push({
      code: "unsupported_live_network_profile",
      path: manifest.gate_artifacts.network_policy_ref.path,
      message:
        "The v0 execution contract cannot attest per-destination use; this Stage 1 profile must remain denied with an empty destination list.",
      });
  }
  if (
    manifest.activation_ready &&
    egressPolicy?.control_state !== "enforced"
  ) {
    // Attested-denial readiness rule (PR #7 fail-closed review of 6b4e4e9):
    // a runner_protocol_attestation receipt may satisfy readiness over an
    // unenforced egress control only in the full truthful-denial shape —
    // exact receipt/policy boundary match, denied mode with deny default and
    // an empty destination set, and its weakness declared in non-empty
    // limitations (the receipt validity window is enforced by the trusted
    // evaluation-time checks above). Technical isolation boundary classes
    // still require an enforced egress control.
    const attestedDenial =
      enforcement !== undefined &&
      enforcement.enforcement_boundary.boundary_type ===
        "runner_protocol_attestation" &&
      policy.enforcement_boundary.boundary_type ===
        "runner_protocol_attestation" &&
      enforcement.effective_mode === "denied" &&
      enforcement.default_action === "deny" &&
      enforcement.effective_destinations.length === 0 &&
      policy.mode === "denied" &&
      policy.destinations.length === 0 &&
      enforcement.limitations.length > 0;
    if (!attestedDenial) {
      errors.push({
        code: "egress_policy_not_enforced",
        path: egressPolicyRef?.path ?? "network_policy.enforcement_boundary",
        message:
          "Activation readiness requires an enforced deny-default egress policy, or a fully attested runner_protocol_attestation denial with its limitations declared.",
      });
    }
  }
}

function validateCost(
  manifest: Stage1Preflight,
  policy: CostPolicy | undefined,
  rateCard: CostRateCard | undefined,
  receipts: Array<{ ref: ArtifactRef; value: UsageReceipt }>,
  operatorDirection: OperatorDirectionRecord | undefined,
  values: Map<string, unknown>,
  errors: PreflightFailure[],
  gateState: PreflightGateState,
): void {
  if (!policy) {
    return;
  }
  if (
    policy.rate_card_ref.artifact_type !== "cost_rate_card" ||
    rateCard === undefined
  ) {
    errors.push({
      code: "cost_rate_card_binding",
      path: manifest.gate_artifacts.cost_policy_ref.path,
      message:
        "The cost policy must bind a schema-valid provider-neutral rate card.",
    });
  } else if (
    rateCard.unit !== policy.unit ||
    (policy.unit === "tiber_actor_session_v1" &&
      rateCard.accounting_basis !==
        "one_unit_per_trusted_observed_provider_backed_actor_session_ref")
  ) {
    errors.push({
      code: "cost_rate_card_mismatch",
      path: policy.rate_card_ref.path,
      message:
        "The exact rate-card unit and accounting basis must match the cost policy.",
    });
  }
  let cumulative = 0;
  const receiptIds = new Set<string>();
  const actorSessions = new Set<string>();
  const invocations = new Set<string>();
  const roleUsage = new Map<"executor" | "reviewer", number>();
  let previousDigest: string | null = null;

  isAfter(
    policy.recorded_at,
    manifest.prepared_at,
    errors,
    manifest.gate_artifacts.cost_policy_ref.path,
    "The cost policy was recorded after preflight preparation.",
    "cost_policy_after_preflight",
  );
  if (manifest.activation_ready && operatorDirection) {
    isAfter(
      policy.recorded_at,
      operatorDirection.recorded_at,
      errors,
      manifest.gate_artifacts.cost_policy_ref.path,
      "The exact operator activation direction predates the cost policy it purports to approve.",
      "operator_approval_predates_cost_policy",
    );
  }
  if (manifest.activation_ready) {
    if (
      policy.policy_status !== "approved" ||
      policy.unit !== "tiber_actor_session_v1" ||
      policy.accounting_mode !== "fixed_session_reservation" ||
      policy.fixed_reservation === null
    ) {
      errors.push({
        code: "unsupported_activation_cost_policy",
        path: manifest.gate_artifacts.cost_policy_ref.path,
        message:
          "Activation readiness supports only an approved fixed tiber_actor_session_v1 reservation.",
      });
    }
    if (receipts.length !== 0) {
      errors.push({
        code: "preactivation_usage_present",
        path: "gate_artifacts.trusted_usage_receipt_refs",
        message:
          "An activation-ready preflight must begin with no usage receipts.",
      });
    }
    if (operatorDirection?.authority_class !== "activate_run") {
      errors.push({
        code: "cost_policy_without_activation_authority",
        path: manifest.gate_artifacts.cost_policy_ref.path,
        message:
          "An approved activation cost policy requires exact activate_run authority.",
      });
    }
  }

  for (const { ref, value } of receipts) {
    validateObservationTrust(
      value.trust_boundary,
      value.observer,
      value.observation_method,
      values,
      value.receipt_id,
      errors,
    );
    isAfter(
      policy.recorded_at,
      value.usage_started_at,
      errors,
      value.receipt_id,
      "Usage cannot begin before the exact cost policy is recorded.",
      "usage_before_cost_policy",
    );
    if (operatorDirection !== undefined) {
      isAfter(
        operatorDirection.recorded_at,
        value.usage_started_at,
        errors,
        value.receipt_id,
        "Usage cannot begin before the exact operator direction is recorded.",
        "usage_before_operator_direction",
      );
    }
    isAfter(
      value.observed_at,
      manifest.prepared_at,
      errors,
      value.receipt_id,
      "A usage receipt cannot be observed after the preflight snapshot is prepared.",
      "usage_observed_after_preflight",
    );
    uniqueId(receiptIds, value.receipt_id, "usage receipt", errors);
    uniqueId(actorSessions, value.actor_session_ref, "actor session", errors);
    uniqueId(invocations, value.invocation_id, "invocation", errors);
    const providerUnits = new Set<string>();
    for (const providerUsage of value.provider_native_usage) {
      uniqueId(
        providerUnits,
        providerUsage.unit,
        "provider-native usage unit",
        errors,
      );
    }
    if (!sameArtifactRef(value.cost_policy_ref, manifest.gate_artifacts.cost_policy_ref)) {
      errors.push({
        code: "cost_policy_binding",
        path: value.receipt_id,
        message: "Usage receipt does not bind the manifest cost policy.",
      });
    }
    if (value.previous_receipt_digest !== previousDigest) {
      errors.push({
        code: "usage_chain",
        path: value.receipt_id,
        message:
          `Expected previous_receipt_digest ${String(previousDigest)}; found ${String(value.previous_receipt_digest)}.`,
      });
    }
    previousDigest = ref.digest;
    isAfter(
      value.usage_started_at,
      value.usage_ended_at,
      errors,
      value.receipt_id,
      "Usage start is later than usage end.",
      "usage_time_order",
    );
    isAfter(
      value.usage_ended_at,
      value.observed_at,
      errors,
      value.receipt_id,
      "Usage end is later than observation.",
      "usage_time_order",
    );
    if (value.normalized_cost.unit !== policy.unit) {
      errors.push({
        code: "cost_unit_mismatch",
        path: value.receipt_id,
        message: "Usage and policy cost units differ.",
      });
    }
    if (value.rate_card_digest !== policy.rate_card_ref.digest) {
      errors.push({
        code: "rate_card_mismatch",
        path: value.receipt_id,
        message: "Usage receipt does not bind the policy rate card digest.",
      });
    }
    if (
      policy.fixed_reservation !== null &&
      !policy.fixed_reservation.roles.includes(value.role)
    ) {
      errors.push({
        code: "unreserved_actor_role",
        path: value.receipt_id,
        message: `Role ${value.role} is not included in the fixed reservation.`,
      });
    }
    if (policy.unit === "tiber_actor_session_v1") {
      if (
        value.normalized_cost.amount !== 1 ||
        value.provider_native_usage.length !== 1 ||
        value.provider_native_usage[0]?.unit !==
          "tiber_actor_session_v1" ||
        value.provider_native_usage[0]?.quantity !== 1
      ) {
        errors.push({
          code: "actor_session_usage_mismatch",
          path: value.receipt_id,
          message:
            "An actor-session receipt must record exactly one native and one normalized actor-session unit.",
        });
      }
    }
    roleUsage.set(value.role, (roleUsage.get(value.role) ?? 0) + 1);
    cumulative += value.normalized_cost.amount;
  }

  if (
    policy.accounting_mode === "fixed_session_reservation" &&
    policy.fixed_reservation?.amount !== policy.ceiling
  ) {
    errors.push({
      code: "fixed_reservation_ceiling",
      path: manifest.gate_artifacts.cost_policy_ref.path,
      message: "Fixed reservation amount must exactly equal the policy ceiling.",
    });
  }
  if (policy.fixed_reservation !== null) {
    const roleLimits = new Map<"executor" | "reviewer", number>();
    for (const limit of policy.fixed_reservation.role_limits) {
      if (roleLimits.has(limit.role)) {
        errors.push({
          code: "duplicate_role_limit",
          path: manifest.gate_artifacts.cost_policy_ref.path,
          message: `Duplicate fixed reservation role limit: ${limit.role}.`,
        });
      }
      roleLimits.set(limit.role, limit.amount);
    }
    const declaredRoles = new Set(policy.fixed_reservation.roles);
    if (
      declaredRoles.size !== roleLimits.size ||
      [...declaredRoles].some((role) => !roleLimits.has(role))
    ) {
      errors.push({
        code: "role_limit_set_mismatch",
        path: manifest.gate_artifacts.cost_policy_ref.path,
        message:
          "Fixed reservation roles must exactly match the per-role limit set.",
      });
    }
    const roleLimitTotal = [...roleLimits.values()].reduce(
      (sum, amount) => sum + amount,
      0,
    );
    if (
      roleLimitTotal !== policy.fixed_reservation.amount ||
      roleLimitTotal !== policy.ceiling
    ) {
      errors.push({
        code: "role_limit_total_mismatch",
        path: manifest.gate_artifacts.cost_policy_ref.path,
        message:
          "Per-role limits must sum exactly to the fixed reservation and ceiling.",
      });
    }
    if (
      manifest.activation_ready &&
      (roleLimits.size !== 2 ||
        roleLimits.get("executor") !== 1 ||
        roleLimits.get("reviewer") !== 1 ||
        policy.fixed_reservation.amount !== 2 ||
        policy.ceiling !== 2)
    ) {
      errors.push({
        code: "unsupported_activation_role_reservation",
        path: manifest.gate_artifacts.cost_policy_ref.path,
        message:
          "This Stage 1 pilot requires exactly one reserved executor session and one reserved fresh-context reviewer session.",
      });
    }
    for (const [role, count] of roleUsage) {
      if (count > (roleLimits.get(role) ?? 0)) {
        errors.push({
          code: "role_session_limit_exceeded",
          path: manifest.gate_artifacts.cost_policy_ref.path,
          message:
            `${role} used ${count} sessions; reserved limit is ${String(roleLimits.get(role) ?? 0)}.`,
        });
      }
    }
  }
  if (cumulative > policy.ceiling) {
    errors.push({
      code: "cost_ceiling_exceeded",
      path: manifest.gate_artifacts.cost_policy_ref.path,
      message: `Cumulative trusted usage ${cumulative} exceeds ceiling ${policy.ceiling}.`,
    });
  }

  gateState.cost_accounting = {
    unit: policy.unit,
    ceiling: policy.ceiling,
    cumulative_usage: cumulative,
    receipt_count: receipts.length,
    state: policy.policy_status === "approved" ? "present" : "unresolved",
  };
}

function validateGateRequirementCoherence(
  manifest: Stage1Preflight,
  inputs: CandidateInputs | undefined,
  availability: Coverage,
  provenance: Coverage,
  enforcementPresent: boolean,
  costApproved: boolean,
  activationAuthorityPresent: boolean,
  errors: PreflightFailure[],
): void {
  const requirements = new Map(
    manifest.requirements.map((entry) => [entry.requirement_id, entry]),
  );
  const check = (
    requirementId: string,
    satisfied: boolean,
    notApplicable: boolean,
  ): void => {
    const requirement = requirements.get(requirementId);
    if (!requirement) {
      return;
    }
    const expected = notApplicable
      ? "not_applicable"
      : satisfied
        ? "satisfied"
        : "unresolved";
    if (requirement.status !== expected) {
      errors.push({
        code: "gate_requirement_mismatch",
        path: `requirements.${requirementId}`,
        message:
          `Expected ${expected} from the bound gate artifacts; found ${requirement.status}.`,
      });
    }
  };
  if (availability.expected === null) {
    const declared =
      requirements.get("external-source-availability")?.status;
    if (manifest.activation_ready || declared === "satisfied") {
      errors.push({
        code: "gate_requirement_mismatch",
        path: "requirements.external-source-availability",
        message:
          "External-source applicability cannot be established without schema-valid frozen inputs.",
      });
    }
  } else {
    check(
      "external-source-availability",
      availability.expected > 0 &&
        availability.covered === availability.expected,
      availability.expected === 0,
    );
  }
  if (provenance.expected === null) {
    const declared =
      requirements.get("governed-artifact-provenance")?.status;
    if (manifest.activation_ready || declared === "satisfied") {
      errors.push({
        code: "gate_requirement_mismatch",
        path: "requirements.governed-artifact-provenance",
        message:
          "Governed-artifact applicability cannot be established without schema-valid frozen inputs.",
      });
    }
  } else {
    check(
      "governed-artifact-provenance",
      provenance.expected > 0 && provenance.covered === provenance.expected,
      provenance.expected === 0,
    );
  }
  check("network-enforcement", enforcementPresent, false);
  check("cost-accounting", costApproved, false);
  check("operator-activation", activationAuthorityPresent, false);

  const candidateTypes = new Set(
    manifest.candidate_artifact_refs.map((ref) => ref.artifact_type),
  );
  check("candidate-inputs", inputs !== undefined, false);
  check("candidate-job", candidateTypes.has("candidate_job"), false);

  if (manifest.activation_ready) {
    for (const artifactType of [
      "authority_decision",
      "candidate_inputs",
      "candidate_job",
      "operator_direction_record",
    ]) {
      if (!candidateTypes.has(artifactType)) {
        errors.push({
          code: "activation_candidate_missing",
          path: "candidate_artifact_refs",
          message:
            `Activation readiness requires a bound ${artifactType} artifact.`,
        });
      }
    }
  }
}

function validateDisposition(
  manifest: Stage1Preflight,
  errors: PreflightFailure[],
): void {
  const unresolvedRequirements = manifest.requirements.filter(
    (entry) => entry.status === "unresolved",
  );
  if (manifest.activation_ready) {
    if (
      manifest.status !== "ready_for_activation" ||
      manifest.unresolved_inputs.length !== 0 ||
      unresolvedRequirements.length !== 0 ||
      manifest.gate_artifacts.network_enforcement_receipt_ref === null
    ) {
      errors.push({
        code: "activation_ready_incoherent",
        path: "activation_ready",
        message:
          "Activation readiness requires a ready status, no unresolved work, and a network enforcement receipt.",
      });
    }
    return;
  }
  if (manifest.status === "ready_for_activation") {
    errors.push({
      code: "false_ready_status",
      path: "status",
      message: "ready_for_activation requires activation_ready=true.",
    });
  }
  if (manifest.unresolved_inputs.length === 0) {
    errors.push({
      code: "missing_unresolved_input",
      path: "unresolved_inputs",
      message: "A non-ready preflight must state what remains unresolved.",
    });
  }
  if (
    manifest.status === "requires_operator_inputs" &&
    manifest.unresolved_inputs.some((entry) => entry.disposition === "inadmissible")
  ) {
    errors.push({
      code: "inadmissible_requires_blocked",
      path: "status",
      message: "An inadmissible input requires blocked status.",
    });
  }
  if (
    manifest.status === "blocked" &&
    !manifest.unresolved_inputs.some((entry) => entry.disposition === "inadmissible")
  ) {
    errors.push({
      code: "blocked_without_inadmissible_input",
      path: "status",
      message:
        "blocked status is reserved for an inadmissible input; use requires_operator_inputs for missing or unverified inputs.",
    });
  }
}

function validatePackageInventory(
  workspace: string,
  manifestPath: string,
  refs: Map<string, ArtifactRef>,
  errors: PreflightFailure[],
): void {
  try {
    const manifestAbsolute = resolveContained(workspace, manifestPath);
    const packageRoot = dirname(manifestAbsolute);
    const workspaceRoot = realpathSync(workspace);
    for (const file of filesUnder(packageRoot)) {
      const path = relative(workspaceRoot, file).split(sep).join("/");
      if (path !== manifestPath && !refs.has(path)) {
        errors.push({
          code: "unbound_package_file",
          path,
          message: "Every file beside the preflight manifest must be hash-bound.",
        });
      }
    }
  } catch (error) {
    fail(errors, "package_inventory", manifestPath, error);
  }
}

function filesUnder(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const stats = lstatSync(path);
    if (stats.isSymbolicLink()) {
      throw new Error(`symbolic links are prohibited: ${path}`);
    }
    if (stats.isDirectory()) {
      files.push(...filesUnder(path));
    } else if (stats.isFile()) {
      files.push(path);
    } else {
      throw new Error(`unsupported package entry type: ${path}`);
    }
  }
  return files;
}

function findArtifactRefs(value: unknown): ArtifactRef[] {
  const refs: ArtifactRef[] = [];
  visit(value, refs);
  return refs;
}

function visit(value: unknown, refs: ArtifactRef[]): void {
  if (Array.isArray(value)) {
    for (const entry of value) {
      visit(entry, refs);
    }
    return;
  }
  if (value === null || typeof value !== "object") {
    return;
  }
  if (isArtifactRef(value)) {
    refs.push(value);
  }
  for (const entry of Object.values(value)) {
    visit(entry, refs);
  }
}

function isArtifactRef(value: object): value is ArtifactRef {
  const candidate = value as Partial<ArtifactRef>;
  return (
    typeof candidate.artifact_type === "string" &&
    typeof candidate.path === "string" &&
    typeof candidate.digest === "string" &&
    (candidate.digest_mode === "tiber-canonical-json-v1" ||
      candidate.digest_mode === "tiber-raw-sha256-v1")
  );
}

function typedValue<T>(
  values: Map<string, unknown>,
  path: string,
): T | undefined {
  return values.get(path) as T | undefined;
}

function sameArtifactRef(left: ArtifactRef, right: ArtifactRef): boolean {
  return (
    left.artifact_type === right.artifact_type &&
    left.path === right.path &&
    left.digest === right.digest &&
    left.digest_mode === right.digest_mode
  );
}

function artifactRefIdentity(ref: ArtifactRef): string {
  return [
    ref.artifact_type,
    ref.path,
    ref.digest,
    ref.digest_mode,
  ].join("\u0000");
}

function sameJson(left: unknown, right: unknown): boolean {
  return sha256CanonicalJson(left) === sha256CanonicalJson(right);
}

function uniqueId(
  seen: Set<string>,
  id: string,
  kind: string,
  errors: PreflightFailure[],
): void {
  if (seen.has(id)) {
    errors.push({
      code: "duplicate_control_identity",
      path: id,
      message: `Duplicate ${kind} identity.`,
    });
  }
  seen.add(id);
}

function isAfter(
  left: string,
  right: string,
  errors: PreflightFailure[],
  path: string,
  message: string,
  code = "timestamp_order",
): boolean {
  const leftInstant = parseInstant(left, `${path}:left`, errors);
  const rightInstant = parseInstant(right, `${path}:right`, errors);
  if (leftInstant === null || rightInstant === null) {
    return false;
  }
  if (leftInstant > rightInstant) {
    errors.push({ code, path, message });
    return true;
  }
  return false;
}

function parseInstant(
  value: string,
  path: string,
  errors: PreflightFailure[],
): number | null {
  const fractionalSeconds = value.match(
    /\.(\d+)(?:Z|[+-]\d{2}:\d{2})$/iu,
  )?.[1];
  if (
    fractionalSeconds !== undefined &&
    fractionalSeconds.length > 3
  ) {
    errors.push({
      code: "timestamp_precision",
      path,
      message:
        `Timestamp ${value} exceeds the validator's exact millisecond precision boundary.`,
    });
    return null;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    errors.push({
      code: "timestamp_unparseable",
      path,
      message:
        `Timestamp ${value} is schema-valid RFC 3339 but unsupported by the deterministic JavaScript chronology check.`,
    });
    return null;
  }
  return parsed;
}

function validateEvaluationInstant(
  value: string,
  errors: PreflightFailure[],
): void {
  if (!CANONICAL_UTC_INSTANT.test(value)) {
    errors.push({
      code: "evaluation_at_format",
      path: "evaluation_at",
      message:
        "Trusted evaluation time must be a canonical RFC 3339 UTC instant with seconds and optional millisecond precision.",
    });
    return;
  }
  const parsed = Date.parse(value);
  const normalized = value.includes(".")
    ? value
    : value.replace("Z", ".000Z");
  if (
    !Number.isFinite(parsed) ||
    new Date(parsed).toISOString() !== normalized
  ) {
    errors.push({
      code: "timestamp_unparseable",
      path: "evaluation_at",
      message:
        `Trusted evaluation timestamp ${value} is not a real canonical UTC instant.`,
    });
  }
}

function addPrivacyFindings(
  errors: PreflightFailure[],
  path: string,
  value: unknown,
  text: string,
): void {
  if (value !== undefined) {
    for (const finding of scanStructuralPrivacy(value)) {
      errors.push({
        code: "privacy_structural",
        path: `${path}:${finding.path}`,
        message: finding.reason,
      });
    }
  }
  for (const finding of scanRawTextPrivacy(text, path)) {
    errors.push({
      code: "privacy_text",
      path: finding.path,
      message: finding.reason,
    });
  }
}

function fail(
  errors: PreflightFailure[],
  code: string,
  path: string,
  error: unknown,
): void {
  errors.push({
    code,
    path,
    message: error instanceof Error ? error.message : String(error),
  });
}

function emptyReport(
  manifestPath: string,
  evaluationAt: string | null,
  gateState: PreflightGateState,
  errors: PreflightFailure[],
): PreflightValidationReport {
  return {
    valid: false,
    activation_ready: false,
    evaluation_at: evaluationAt,
    manifest_path: manifestPath,
    preflight_id: null,
    candidate_run_id: null,
    status: null,
    gate_state: gateState,
    errors,
  };
}

function reportFor(
  manifestPath: string,
  manifest: Stage1Preflight,
  evaluationAt: string | null,
  gateState: PreflightGateState,
  errors: PreflightFailure[],
): PreflightValidationReport {
  return {
    valid: errors.length === 0,
    activation_ready:
      manifest.activation_ready &&
      evaluationAt !== null &&
      errors.length === 0,
    evaluation_at: evaluationAt,
    manifest_path: manifestPath,
    preflight_id: manifest.preflight_id,
    candidate_run_id: manifest.candidate_run_id,
    status: manifest.status,
    gate_state: gateState,
    errors,
  };
}
