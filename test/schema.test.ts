import assert from "node:assert/strict";
import test from "node:test";
import { validateSchema } from "../src/schema.js";

const V0_COMMON =
  "https://schemas.tiber.dev/research/v0/common.schema.json";
const V1 =
  "https://schemas.tiber.dev/research/v1";
const DIGEST_A = `sha256:${"a".repeat(64)}`;
const DIGEST_B = `sha256:${"b".repeat(64)}`;
const DIGEST_C = `sha256:${"c".repeat(64)}`;
const DIGEST_D = `sha256:${"d".repeat(64)}`;
const COMMIT = "e".repeat(40);
const TREE = "f".repeat(40);

function artifactRef(
  artifactType: string,
  path: string,
  digest = DIGEST_A,
): Record<string, unknown> {
  return {
    artifact_type: artifactType,
    path,
    digest,
    digest_mode: "tiber-canonical-json-v1",
  };
}

function assertValid(schemaId: string, value: unknown): void {
  const result = validateSchema(schemaId, value);
  assert.equal(result.valid, true, JSON.stringify(result.errors, null, 2));
}

test("compiled runtime resolves the repository schema directory", () => {
  const result = validateSchema(V0_COMMON, {});

  assert.equal(result.valid, true);
});

test("recursive schema loading compiles and validates v1 preflight contracts", async (t) => {
  const observationPolicyRef = artifactRef(
    "observation_policy",
    "policies/observation-policy.json",
  );
  const availabilityEvidenceRef = artifactRef(
    "availability_evidence",
    "evidence/source-availability.json",
    DIGEST_B,
  );
  const availabilityReceipt = {
    schema_version: "research-external-source-availability-receipt/v1",
    receipt_id: "availability-source-001",
    candidate_run_id: "run-opportunity-001",
    source_object_id: "source-market-001",
    source_family_id: "approved-market-source",
    source_identifier: "source:market:revision-2026-07-30",
    revision_id: "revision-2026-07-30",
    content_digest: DIGEST_C,
    metadata_digest: DIGEST_D,
    claimed_available_at: "2026-07-30T10:00:00Z",
    cutoff_at: "2026-07-30T12:00:00Z",
    evidence_ref: availabilityEvidenceRef,
    observation_method: "trusted_connector_observation",
    observed_at: "2026-07-30T10:05:00Z",
    observer: {
      observer_id: "trusted-connector:github",
      role: "trusted_connector",
      trust_basis: "Connector receipt captured independently of the executor.",
    },
    trust_boundary: {
      boundary_id: "connector-boundary",
      boundary_type: "connector_receipt",
      policy_ref: observationPolicyRef,
    },
  };

  const governedReceipt = {
    schema_version: "research-governed-artifact-provenance-receipt/v1",
    receipt_id: "provenance-baseline-001",
    candidate_run_id: "run-opportunity-001",
    artifact_id: "artifact-opportunity-baseline",
    repository: "Prometheus-Frameworks/TIBER-Ops",
    commit: COMMIT,
    path: "research/baseline.json",
    blob_digest: DIGEST_B,
    artifact_digest: DIGEST_C,
    observed_at: "2026-07-30T10:00:00Z",
    effective_at: "2026-07-30T09:00:00Z",
    verified_at: "2026-07-30T10:10:00Z",
    cutoff_at: "2026-07-30T12:00:00Z",
    governing_authority_ref: artifactRef(
      "governing_authority",
      "authority/governing-decision.json",
      DIGEST_D,
    ),
    governing_manifest_ref: artifactRef(
      "governing_manifest",
      "manifests/baseline-manifest.json",
      DIGEST_A,
    ),
    verifier: {
      verifier_id: "trusted-connector:github",
      role: "trusted_connector",
      trust_basis: "The repository object identity was observed through the connector.",
    },
    verification_method: "repository_blob_verification",
    trust_boundary: {
      boundary_id: "governed-repository",
      boundary_type: "governed_repository",
      policy_ref: observationPolicyRef,
    },
    freshness: {
      state: "current",
      as_of: "2026-07-30T10:10:00Z",
      policy_ref: artifactRef(
        "freshness_policy",
        "policies/freshness-policy.json",
        DIGEST_B,
      ),
      rationale: "The exact governed revision is current for the declared cutoff.",
    },
  };

  const deniedNetworkPolicy = {
    schema_version: "research-network-policy/v1",
    policy_id: "network-policy-denied",
    candidate_run_id: "run-opportunity-001",
    mode: "denied",
    default_action: "deny",
    destinations: [],
    enforcement_boundary: {
      boundary_id: "sandbox-egress",
      boundary_type: "sandbox_firewall",
      enforcement_policy_ref: artifactRef(
        "egress_policy",
        "policies/egress-policy.json",
      ),
    },
    policy_owner: "TIBER operator",
    policy_status: "approved",
    recorded_at: "2026-07-30T10:15:00Z",
  };
  const allowlistedNetworkPolicy = {
    ...deniedNetworkPolicy,
    policy_id: "network-policy-allowlisted",
    mode: "allowlisted",
    destinations: [
      {
        destination_id: "source-api",
        scheme: "https",
        host: "api.example.com",
        port: 443,
        methods: ["GET", "HEAD"],
        path_prefix: "/v1/snapshots",
        source_family_refs: ["approved-market-source"],
      },
    ],
  };
  const egressPolicy = {
    schema_version: "research-egress-enforcement-policy/v1",
    control_state: "enforced",
    default_action: "deny",
    execution_profile: "stage1-sandbox",
    limitations: [
      "The policy establishes enforcement posture, not empirical truth.",
    ],
    policy_ref: "TIBER-Ops:stage1-egress",
  };
  const observationPolicy = {
    schema_version: "research-observation-policy/v1",
    policy_id: "stage1-observation-policy",
    admitted_observations: [
      {
        boundary_id: "governed-artifact-boundary",
        boundary_type: "governed_repository",
        actor_id: "artifact-custodian:stage1",
        actor_role: "artifact_custodian",
        method: "repository_blob_verification",
        trust_basis: "The governed repository exposes exact blob identity.",
      },
      {
        boundary_id: "stage1-sandbox",
        boundary_type: "sandbox_firewall",
        actor_id: "trusted-runner:stage1",
        actor_role: "trusted_runner",
        method: "network_enforcement_observation",
        trust_basis: "The runner observed the effective sandbox policy.",
      },
    ],
  };
  const freshnessPolicy = {
    schema_version: "research-freshness-policy/v1",
    policy_id: "stage1-freshness-policy",
    chronology_rule:
      "effective_at_lte_freshness_as_of_lte_verified_at",
    cutoff_rule: "freshness_as_of_lte_cutoff_at",
    current_state_rule:
      "current_requires_exact_governing_manifest_and_authority",
  };
  const governingManifest = {
    schema_version: "research-governing-manifest/v1",
    artifact_id: "artifact-opportunity-baseline",
    governance_status: "promoted",
    repository: "Prometheus-Frameworks/TIBER-Ops",
    commit: COMMIT,
    path: "research/baseline.json",
    blob_digest: DIGEST_B,
  };

  const networkEnforcementReceipt = {
    schema_version: "research-network-enforcement-receipt/v1",
    receipt_id: "network-enforcement-001",
    candidate_run_id: "run-opportunity-001",
    network_policy_ref: artifactRef(
      "network_policy",
      "preflight/network-policy.json",
      DIGEST_B,
    ),
    effective_mode: "denied",
    effective_destinations: [],
    default_action: "deny",
    observed_at: "2026-07-30T10:20:00Z",
    valid_from: "2026-07-30T10:20:00Z",
    valid_until: "2026-07-31T10:20:00Z",
    observer: {
      observer_id: "trusted-runner:stage1",
      role: "trusted_runner",
      trust_basis: "The runner observed the effective sandbox policy.",
    },
    observation_method: "network_enforcement_observation",
    observation_policy_ref: artifactRef(
      "observation_policy",
      "policies/observation-policy.json",
    ),
    enforcement_boundary: deniedNetworkPolicy.enforcement_boundary,
    environment_identity: {
      environment_id: "stage1-sandbox",
      execution_surface: "Bounded manual research runner",
      isolation_id: "isolation-opportunity-001",
      observed_capabilities_digest: DIGEST_C,
    },
    limitations: [
      "The receipt establishes configured egress controls, not empirical source truth.",
    ],
  };

  const costPolicy = {
    schema_version: "research-cost-policy/v1",
    policy_id: "cost-policy-stage1",
    candidate_run_id: "run-opportunity-001",
    unit: "tiber_actor_session_v1",
    ceiling: 2,
    accounting_mode: "fixed_session_reservation",
    rate_card_ref: artifactRef(
      "cost_rate_card",
      "preflight/cost-rate-card.json",
      DIGEST_C,
    ),
    trusted_observation_required: true,
    checkpoint_rule: {
      scope: "cumulative_run",
      reconciliation: "ceiling_minus_cumulative_trusted_usage",
      rework: "carry_forward",
      overrun_behavior: "block",
    },
    fixed_reservation: {
      amount: 2,
      roles: ["executor", "reviewer"],
      role_limits: [
        {
          role: "executor",
          amount: 1,
        },
        {
          role: "reviewer",
          amount: 1,
        },
      ],
      accounting_basis:
        "one_unit_per_trusted_observed_provider_backed_actor_session_ref",
      accounting_limitation:
        "Bounds trusted-observed provider-backed actor session starts, not tokens, compute, or currency.",
    },
    policy_owner: "TIBER operator",
    policy_status: "approved",
    recorded_at: "2026-07-30T10:25:00Z",
    limitations: [
      "Actor-session accounting does not measure tokens, compute, or currency.",
    ],
  };
  const trustedUsageCostPolicy = {
    ...costPolicy,
    policy_id: "cost-policy-trusted-usage",
    unit: "usd_micro",
    ceiling: 1000000,
    accounting_mode: "trusted_usage",
    fixed_reservation: null,
    limitations: [
      "Normalized currency accounting depends on the pinned rate card.",
    ],
  };
  const costRateCard = {
    schema_version: "research-cost-rate-card/v1",
    unit: "tiber_actor_session_v1",
    accounting_basis:
      "one_unit_per_trusted_observed_provider_backed_actor_session_ref",
    definition:
      "One independently observed provider-backed actor session.",
    exclusions: [
      "Not tokens, compute, or currency.",
    ],
  };

  const usageReceipt = {
    schema_version: "research-trusted-usage-receipt/v1",
    receipt_id: "usage-executor-001",
    candidate_run_id: "run-opportunity-001",
    attempt_id: "attempt-001",
    role: "executor",
    actor_session_ref: "actor-executor-001",
    invocation_id: "invocation-executor-001",
    provider: "provider-example",
    model: "model-example",
    usage_started_at: "2026-07-30T10:30:00Z",
    usage_ended_at: "2026-07-30T10:45:00Z",
    observed_at: "2026-07-30T10:45:01Z",
    provider_native_usage: [
      {
        unit: "actor_session",
        quantity: 1,
      },
    ],
    normalized_cost: {
      unit: "tiber_actor_session_v1",
      amount: 1,
    },
    observer: {
      observer_id: "trusted-runner:stage1",
      role: "trusted_runner",
      trust_basis: "The runner observed the provider-backed actor session.",
    },
    observation_method: "provider_usage_observation",
    trust_boundary: {
      boundary_id: "runner-usage-boundary",
      boundary_type: "runner_observation",
      policy_ref: artifactRef(
        "usage_observation_policy",
        "policies/usage-observation.json",
      ),
    },
    rate_card_digest: DIGEST_C,
    cost_policy_ref: artifactRef(
      "cost_policy",
      "preflight/cost-policy.json",
      DIGEST_D,
    ),
    previous_receipt_digest: null,
  };

  const operatorDirection = {
    schema_version: "research-operator-direction-record/v1",
    authority_class: "activate_run",
    decision_ref: "TIBER-Ops:stage1-operator-direction",
    operator: "TIBER operator",
    candidate_run_id: "run-opportunity-001",
    operator_direction: "Activate the exact bound fixture.",
    quote_digest: DIGEST_B,
    quote_digest_mode: "tiber-raw-sha256-v1",
    recorded_at: "2026-07-30T10:00:00Z",
    approved_artifact_refs: [
      artifactRef(
        "candidate_inputs",
        "runs/run-opportunity-001/inputs.json",
      ),
    ],
    scope: [
      "Exact bound fixture only.",
    ],
    exclusions: [
      "No promotion or publication.",
    ],
    terminal_outcomes: [
      "stage1_activation_ready_for_operator_decision",
    ],
  };

  const preflight = {
    schema_version: "research-stage1-preflight/v1",
    preflight_id: "stage1-preflight-001",
    candidate_run_id: "run-opportunity-001",
    prepared_at: "2026-07-30T11:00:00Z",
    stage0_base: {
      repository: "Prometheus-Frameworks/TIBER-Research",
      commit: COMMIT,
      tree_sha: TREE,
      pull_request_ref:
        "https://github.com/Prometheus-Frameworks/TIBER-Research/pull/1",
      contract_inventory_ref: artifactRef(
        "stage0_contract_inventory",
        "preflight/stage0-contract-inventory.json",
      ),
      schema_version: "tiber-research-schemas-v0",
      validator_version: "tiber-research-validator-v0",
      ci_status: "passed",
    },
    ops_decision: {
      decision_ref: "TIBER-Ops:stage1-operator-direction",
      quote_digest: DIGEST_B,
      quote_digest_mode: "tiber-raw-sha256-v1",
      quote_observed_at: "2026-07-30T10:00:00Z",
      operator: "TIBER operator",
    },
    gate_artifacts: {
      external_source_availability_receipt_refs: [
        artifactRef(
          "external_source_availability_receipt",
          "preflight/availability-source-001.json",
        ),
      ],
      governed_artifact_provenance_receipt_refs: [
        artifactRef(
          "governed_artifact_provenance_receipt",
          "preflight/provenance-baseline-001.json",
        ),
      ],
      network_policy_ref: artifactRef(
        "network_policy",
        "preflight/network-policy.json",
      ),
      network_enforcement_receipt_ref: artifactRef(
        "network_enforcement_receipt",
        "preflight/network-enforcement-receipt.json",
      ),
      cost_policy_ref: artifactRef(
        "cost_policy",
        "preflight/cost-policy.json",
      ),
      trusted_usage_receipt_refs: [
        artifactRef(
          "trusted_usage_receipt",
          "preflight/usage-executor-001.json",
        ),
      ],
    },
    candidate_artifact_refs: [
      artifactRef(
        "candidate_job",
        "jobs/opportunity-clusters-2026-v0/v1/job.yaml",
      ),
    ],
    requirements: [
      {
        requirement_id: "gate-contracts",
        description: "All Stage 1 gate contracts are present and pinned.",
        status: "satisfied",
        evidence_refs: [
          artifactRef(
            "preflight_evidence",
            "preflight/gate-evidence.json",
          ),
        ],
      },
    ],
    unresolved_inputs: [],
    status: "ready_for_activation",
    activation_ready: true,
  };

  const cases: Array<[string, string, unknown]> = [
    [
      "external availability receipt",
      `${V1}/external-source-availability-receipt.schema.json`,
      availabilityReceipt,
    ],
    [
      "governed artifact provenance receipt",
      `${V1}/governed-artifact-provenance-receipt.schema.json`,
      governedReceipt,
    ],
    [
      "denied network policy",
      `${V1}/network-policy.schema.json`,
      deniedNetworkPolicy,
    ],
    [
      "egress enforcement policy",
      `${V1}/egress-enforcement-policy.schema.json`,
      egressPolicy,
    ],
    [
      "receipt observation policy",
      `${V1}/observation-policy.schema.json`,
      observationPolicy,
    ],
    [
      "governed artifact freshness policy",
      `${V1}/freshness-policy.schema.json`,
      freshnessPolicy,
    ],
    [
      "governing manifest",
      `${V1}/governing-manifest.schema.json`,
      governingManifest,
    ],
    [
      "allowlisted network policy",
      `${V1}/network-policy.schema.json`,
      allowlistedNetworkPolicy,
    ],
    [
      "network enforcement receipt",
      `${V1}/network-enforcement-receipt.schema.json`,
      networkEnforcementReceipt,
    ],
    [
      "fixed actor-session cost policy",
      `${V1}/cost-policy.schema.json`,
      costPolicy,
    ],
    [
      "actor-session cost rate card",
      `${V1}/cost-rate-card.schema.json`,
      costRateCard,
    ],
    [
      "trusted normalized cost policy",
      `${V1}/cost-policy.schema.json`,
      trustedUsageCostPolicy,
    ],
    [
      "trusted usage receipt",
      `${V1}/trusted-usage-receipt.schema.json`,
      usageReceipt,
    ],
    [
      "operator direction record",
      `${V1}/operator-direction-record.schema.json`,
      operatorDirection,
    ],
    [
      "Stage 1 preflight manifest",
      `${V1}/stage1-preflight.schema.json`,
      preflight,
    ],
  ];

  for (const [name, schemaId, value] of cases) {
    await t.test(name, () => {
      assertValid(schemaId, value);
    });
  }
});
