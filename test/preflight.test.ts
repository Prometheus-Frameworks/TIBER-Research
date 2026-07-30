import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import {
  type ArtifactRef,
  validateStage1Preflight,
} from "../src/preflight.js";
import {
  readNormalizedJson,
  readBytes,
  writeJson,
} from "../src/io.js";
import {
  sha256CanonicalJson,
  sha256Raw,
  sha256Utf8,
} from "../src/digest.js";

const PACKAGE = "preflight/synthetic-stage1";
const MANIFEST = `${PACKAGE}/preflight.json`;
const RUN_ID = "run-synthetic-001";
const EVALUATION_AT = "2026-01-01T14:15:00Z";
const DIGEST_A = `sha256:${"a".repeat(64)}`;
const COMMIT = "8a8039eeaa2ba1b8cae65859d43746df6b949ecd";
const TREE = "582930f21d6fafafcfc55527e5aa9363c08ad417";

interface BuiltPreflight {
  workspace: string;
  manifest: Record<string, unknown>;
  refs: Record<string, ArtifactRef>;
}

test("Stage 1 preflight accepts a fully bound network-denied package", () => {
  const built = buildPreflight(true);
  try {
    const report = validateStage1Preflight(
      built.workspace,
      MANIFEST,
      { evaluationAt: EVALUATION_AT },
    );
    assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
    assert.equal(report.activation_ready, true);
    assert.equal(report.status, "ready_for_activation");
    assert.deepEqual(report.gate_state.external_source_availability, {
      receipt_count: 1,
      state: "present",
    });
    assert.deepEqual(report.gate_state.governed_artifact_provenance, {
      receipt_count: 0,
      state: "not_applicable",
    });
    assert.deepEqual(report.gate_state.cost_accounting, {
      unit: "tiber_actor_session_v1",
      ceiling: 2,
      cumulative_usage: 0,
      receipt_count: 0,
      state: "present",
    });
  } finally {
    rmSync(built.workspace, { recursive: true, force: true });
  }
});

test("Stage 1 preflight can validly require operator inputs without inventing receipts", () => {
  const built = buildPreflight(false);
  try {
    const report = validateStage1Preflight(
      built.workspace,
      MANIFEST,
      { evaluationAt: EVALUATION_AT },
    );
    assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
    assert.equal(report.activation_ready, false);
    assert.equal(report.status, "requires_operator_inputs");
    assert.equal(
      report.gate_state.network_enforcement.receipt_present,
      false,
    );
  } finally {
    rmSync(built.workspace, { recursive: true, force: true });
  }
});

test("Stage 1 preflight rejects semantic authority and integrity failures", async (t) => {
  await t.test("digest mismatch", () => {
    withBuilt(true, (built) => {
      const manifest = built.manifest;
      const candidates = manifest.candidate_artifact_refs as ArtifactRef[];
      const first = candidates[0];
      assert.ok(first);
      first.digest = DIGEST_A;
      writeJson(built.workspace, MANIFEST, manifest);

      const report = validateStage1Preflight(
        built.workspace,
        MANIFEST,
        { evaluationAt: EVALUATION_AT },
      );
      assert.equal(report.valid, false);
      assert.ok(report.errors.some((error) => error.code === "artifact_digest"));
    });
  });

  await t.test("effective network differs from policy", () => {
    withBuilt(true, (built) => {
      const enforcementRef = built.refs.networkEnforcement;
      assert.ok(enforcementRef);
      const receipt = readNormalizedJson<Record<string, unknown>>(
        built.workspace,
        enforcementRef.path,
      );
      receipt.effective_mode = "allowlisted";
      writeJson(built.workspace, enforcementRef.path, receipt);
      replaceRefDigest(
        built.manifest,
        enforcementRef.path,
        sha256CanonicalJson(receipt),
      );
      writeJson(built.workspace, MANIFEST, built.manifest);

      const report = validateStage1Preflight(
        built.workspace,
        MANIFEST,
        { evaluationAt: EVALUATION_AT },
      );
      assert.equal(report.valid, false);
      assert.ok(
        report.errors.some(
          (error) =>
            error.code === "schema_if" ||
            error.code === "network_effective_mismatch",
        ),
      );
    });
  });

  await t.test("unbound side file", () => {
    withBuilt(true, (built) => {
      writeJson(
        built.workspace,
        `${PACKAGE}/unbound.json`,
        { plausible: "but not governed" },
      );
      const report = validateStage1Preflight(
        built.workspace,
        MANIFEST,
        { evaluationAt: EVALUATION_AT },
      );
      assert.equal(report.valid, false);
      assert.ok(
        report.errors.some((error) => error.code === "unbound_package_file"),
      );
    });
  });

  await t.test("inadmissible input cannot masquerade as a request for input", () => {
    withBuilt(false, (built) => {
      const unresolved = built.manifest.unresolved_inputs as Array<
        Record<string, unknown>
      >;
      const first = unresolved[0];
      assert.ok(first);
      first.disposition = "inadmissible";
      writeJson(built.workspace, MANIFEST, built.manifest);

      const report = validateStage1Preflight(
        built.workspace,
        MANIFEST,
        { evaluationAt: EVALUATION_AT },
      );
      assert.equal(report.valid, false);
      assert.ok(
        report.errors.some(
          (error) => error.code === "inadmissible_requires_blocked",
        ),
      );
    });
  });
});

function withBuilt(
  ready: boolean,
  operation: (built: BuiltPreflight) => void,
): void {
  const built = buildPreflight(ready);
  try {
    operation(built);
  } finally {
    rmSync(built.workspace, { recursive: true, force: true });
  }
}

function buildPreflight(ready: boolean): BuiltPreflight {
  const workspace = mkdtempSync(join(tmpdir(), "tiber-stage1-preflight-"));
  cpSync(resolve("fixtures/synthetic-complete"), workspace, {
    recursive: true,
  });
  rmSync(join(workspace, "runs", RUN_ID, "activation.json"));
  rmSync(join(workspace, "runs", RUN_ID, "attempts"), {
    recursive: true,
  });
  rmSync(join(workspace, "runs", RUN_ID, "run-events.jsonl"));
  const refs: Record<string, ArtifactRef> = {};
  const artifact = (
    key: string,
    artifactType: string,
    filename: string,
    value: unknown,
  ): ArtifactRef => {
    const path = `${PACKAGE}/${filename}`;
    writeJson(workspace, path, value);
    const ref: ArtifactRef = {
      artifact_type: artifactType,
      path,
      digest: sha256CanonicalJson(value),
      digest_mode: "tiber-canonical-json-v1",
    };
    refs[key] = ref;
    return ref;
  };
  const existingJsonArtifact = (
    key: string,
    artifactType: string,
    path: string,
  ): ArtifactRef => {
    const value = readNormalizedJson(workspace, path);
    const ref: ArtifactRef = {
      artifact_type: artifactType,
      path,
      digest: sha256CanonicalJson(value),
      digest_mode: "tiber-canonical-json-v1",
    };
    refs[key] = ref;
    return ref;
  };
  const existingRawArtifact = (
    key: string,
    artifactType: string,
    path: string,
  ): ArtifactRef => {
    const ref: ArtifactRef = {
      artifact_type: artifactType,
      path,
      digest: sha256Raw(readBytes(workspace, path)),
      digest_mode: "tiber-raw-sha256-v1",
    };
    refs[key] = ref;
    return ref;
  };

  const contractInventory = artifact(
    "contractInventory",
    "stage0_contract_inventory",
    "stage0-contract-inventory.json",
    {
      audit: {
        ci_status: "passed",
      },
      base_commit: COMMIT,
      base_tree: TREE,
      pull_request:
        "https://github.com/Prometheus-Frameworks/TIBER-Research/pull/1",
      repository: "Prometheus-Frameworks/TIBER-Research",
    },
  );
  const egressPolicy = artifact(
    "egressPolicy",
    "egress_policy",
    "egress-enforcement-policy.json",
    {
      schema_version: "research-egress-enforcement-policy/v1",
      control_state: ready ? "enforced" : "candidate_not_enforced",
      default_action: "deny",
      execution_profile: "synthetic-stage1",
      limitations: [
        "Synthetic policy used only for Stage 1 preflight conformance.",
      ],
      policy_ref: "synthetic:stage1-preflight",
    },
  );
  const observationPolicy = artifact(
    "observationPolicy",
    "observation_policy",
    "artifact-observation-policy.json",
    {
      schema_version: "research-observation-policy/v1",
      policy_id: "synthetic-stage1-observation",
      admitted_observations: [
        {
          boundary_id: "synthetic-fixture-boundary",
          boundary_type: "runner_observation",
          actor_id: "synthetic-fixture-custodian",
          actor_role: "source_custodian",
          method: "direct_pre_cutoff_capture",
          trust_basis:
            "Synthetic fixture metadata and retained bytes.",
        },
        {
          boundary_id: "synthetic-sandbox",
          boundary_type: "sandbox_firewall",
          actor_id: "synthetic-trusted-runner",
          actor_role: "trusted_runner",
          method: "network_enforcement_observation",
          trust_basis: "Synthetic fixture observation.",
        },
      ],
    },
  );
  const rateCard = artifact(
    "rateCard",
    "cost_rate_card",
    "cost-rate-card.json",
    {
      schema_version: "research-cost-rate-card/v1",
      accounting_basis:
        "one_unit_per_trusted_observed_provider_backed_actor_session_ref",
      definition:
        "One independently observed provider-backed actor session.",
      exclusions: [
        "Not tokens, compute, or currency.",
      ],
      unit: "tiber_actor_session_v1",
    },
  );
  const candidateJob = existingRawArtifact(
    "candidateJob",
    "candidate_job",
    "job.yaml",
  );
  const candidateInputs = existingJsonArtifact(
    "candidateInputs",
    "candidate_inputs",
    "runs/run-synthetic-001/inputs.json",
  );
  const authorityDecision = existingJsonArtifact(
    "authorityDecision",
    "authority_decision",
    "authority/decision.json",
  );
  const sourceMetadata = existingJsonArtifact(
    "sourceMetadata",
    "source_metadata",
    "runs/run-synthetic-001/sources/source-synthetic-bench-001/metadata.json",
  );

  const networkPolicyValue = {
    schema_version: "research-network-policy/v1",
    policy_id: "synthetic-network-denied",
    candidate_run_id: RUN_ID,
    mode: "denied",
    default_action: "deny",
    destinations: [],
    enforcement_boundary: {
      boundary_id: "synthetic-sandbox",
      boundary_type: "sandbox_firewall",
      enforcement_policy_ref: egressPolicy,
    },
    policy_owner: "synthetic-fixture-operator",
    policy_status: "approved",
    recorded_at: "2026-01-01T14:12:00Z",
  };
  const networkPolicy = artifact(
    "networkPolicy",
    "network_policy",
    "network-policy.json",
    networkPolicyValue,
  );

  let networkEnforcement: ArtifactRef | null = null;
  if (ready) {
    networkEnforcement = artifact(
      "networkEnforcement",
      "network_enforcement_receipt",
      "network-enforcement.json",
      {
        schema_version: "research-network-enforcement-receipt/v1",
        receipt_id: "synthetic-network-enforcement",
        candidate_run_id: RUN_ID,
        network_policy_ref: networkPolicy,
        effective_mode: "denied",
        effective_destinations: [],
        default_action: "deny",
        observed_at: "2026-01-01T14:13:00Z",
        valid_from: "2026-01-01T14:12:00Z",
        valid_until: "2026-01-02T00:00:00Z",
        observer: {
          observer_id: "synthetic-trusted-runner",
          role: "trusted_runner",
          trust_basis: "Synthetic fixture observation.",
        },
        observation_method: "network_enforcement_observation",
        observation_policy_ref: observationPolicy,
        enforcement_boundary: networkPolicyValue.enforcement_boundary,
        environment_identity: {
          environment_id: "synthetic-stage1",
          execution_surface: "Synthetic offline test runner",
          isolation_id: "synthetic-isolation",
          observed_capabilities_digest: sha256CanonicalJson(
            readNormalizedJson<Record<string, unknown>>(
              workspace,
              authorityDecision.path,
            ).capabilities,
          ),
        },
        limitations: [
          "This receipt exercises protocol behavior and carries no live authority.",
        ],
      },
    );
  }

  const costPolicy = artifact(
    "costPolicy",
    "cost_policy",
    "cost-policy.json",
    {
      schema_version: "research-cost-policy/v1",
      policy_id: "synthetic-cost-policy",
      candidate_run_id: RUN_ID,
      unit: "tiber_actor_session_v1",
      ceiling: 2,
      accounting_mode: "fixed_session_reservation",
      rate_card_ref: rateCard,
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
      policy_owner: "synthetic-fixture-operator",
      policy_status: "approved",
      recorded_at: "2026-01-01T14:12:00Z",
      limitations: [
        "Actor-session accounting does not measure tokens, compute, or currency.",
      ],
    },
  );

  const availability = artifact(
    "availability",
    "external_source_availability_receipt",
    "source-availability.json",
    {
      schema_version: "research-external-source-availability-receipt/v1",
      receipt_id: "synthetic-source-availability",
      candidate_run_id: RUN_ID,
      source_object_id: "source-synthetic-bench-001",
      source_family_id: "synthetic-bench",
      source_identifier: "synthetic:bench-observations-v1",
      revision_id: "synthetic-bench-v1",
      content_digest:
        "sha256:5742641cc77c68dee4917a6377a3a7d284a7969ef60f2143684a59af532ff4d3",
      metadata_digest:
        "sha256:0be2b2445d278f2bd962e27cef63a69bdf4abead94686ef46ee0d2211b4fffd9",
      claimed_available_at: "2026-01-01T13:00:00Z",
      cutoff_at: "2026-01-02T00:00:00Z",
      evidence_ref: sourceMetadata,
      observation_method: "direct_pre_cutoff_capture",
      observed_at: "2026-01-01T14:13:00Z",
      observer: {
        observer_id: "synthetic-fixture-custodian",
        role: "source_custodian",
        trust_basis: "Synthetic fixture metadata and retained bytes.",
      },
      trust_boundary: {
        boundary_id: "synthetic-fixture-boundary",
        boundary_type: "runner_observation",
        policy_ref: observationPolicy,
      },
    },
  );

  const operatorQuote =
    "Activate the exact synthetic Stage 1 fixture bundle for conformance testing only.";
  const operatorDirection = artifact(
    "operatorDirection",
    "operator_direction_record",
    "operator-direction.json",
    {
      schema_version: "research-operator-direction-record/v1",
      authority_class: "activate_run",
      decision_ref: "synthetic:stage0-fixture-authorization",
      operator: "synthetic-fixture-operator",
      candidate_run_id: RUN_ID,
      operator_direction: operatorQuote,
      quote_digest: sha256Utf8(operatorQuote),
      quote_digest_mode: "tiber-raw-sha256-v1",
      recorded_at: "2026-01-01T14:12:00Z",
      approved_artifact_refs: [
        authorityDecision,
        candidateInputs,
        candidateJob,
        costPolicy,
        networkPolicy,
        observationPolicy,
      ],
      scope: [
        "Activate only the exact synthetic conformance bundle.",
      ],
      exclusions: [
        "No real-world evidence, football claims, promotion, or publication.",
      ],
      terminal_outcomes: [
        "synthetic_conformance_complete",
        "synthetic_conformance_blocked",
      ],
    },
  );

  const allCandidateRefs = [
    authorityDecision,
    candidateInputs,
    candidateJob,
    operatorDirection,
  ];
  const requirements = [
    {
      requirement_id: "candidate-inputs",
      description: "Frozen candidate inputs exist.",
      status: "satisfied",
      evidence_refs: [candidateInputs],
    },
    {
      requirement_id: "candidate-job",
      description: "A candidate job exists.",
      status: "satisfied",
      evidence_refs: [candidateJob],
    },
    {
      requirement_id: "cost-accounting",
      description: "A bounded cost policy exists.",
      status: "satisfied",
      evidence_refs: [costPolicy],
    },
    {
      requirement_id: "external-source-availability",
      description: "The admitted synthetic source is exactly receipted.",
      status: "satisfied",
      evidence_refs: [availability],
    },
    {
      requirement_id: "governed-artifact-provenance",
      description: "No governed repository artifact is admitted.",
      status: "not_applicable",
      evidence_refs: [],
    },
    {
      requirement_id: "network-enforcement",
      description: ready
        ? "The denied network policy is observed."
        : "A trusted enforcement observation is still required.",
      status: ready ? "satisfied" : "unresolved",
      evidence_refs:
        ready && networkEnforcement !== null ? [networkEnforcement] : [],
    },
    {
      requirement_id: "operator-activation",
      description: "Exact synthetic activation authority is bound.",
      status: "satisfied",
      evidence_refs: [authorityDecision, operatorDirection],
    },
  ];
  const unresolvedInputs = ready
    ? []
    : [
        {
          input_id: "trusted-network-observation",
          description:
            "A trusted runner must attest the effective denied network profile.",
          blocking: true,
          requirement_refs: ["network-enforcement"],
          disposition: "unverified",
        },
      ];

  const manifest: Record<string, unknown> = {
    schema_version: "research-stage1-preflight/v1",
    preflight_id: "synthetic-stage1-preflight",
    candidate_run_id: RUN_ID,
    prepared_at: "2026-01-01T14:15:00Z",
    stage0_base: {
      repository: "Prometheus-Frameworks/TIBER-Research",
      commit: COMMIT,
      tree_sha: TREE,
      pull_request_ref:
        "https://github.com/Prometheus-Frameworks/TIBER-Research/pull/1",
      contract_inventory_ref: contractInventory,
      schema_version: "tiber-research-schemas-v0",
      validator_version: "tiber-research-validator-v0",
      ci_status: "passed",
    },
    ops_decision: {
      decision_ref: "synthetic:stage0-fixture-authorization",
      quote_digest: sha256Utf8(operatorQuote),
      quote_digest_mode: "tiber-raw-sha256-v1",
      quote_observed_at: "2026-01-01T14:12:00Z",
      operator: "synthetic-fixture-operator",
    },
    gate_artifacts: {
      external_source_availability_receipt_refs: [availability],
      governed_artifact_provenance_receipt_refs: [],
      network_policy_ref: networkPolicy,
      network_enforcement_receipt_ref: networkEnforcement,
      cost_policy_ref: costPolicy,
      trusted_usage_receipt_refs: [],
    },
    candidate_artifact_refs: allCandidateRefs,
    requirements,
    unresolved_inputs: unresolvedInputs,
    status: ready ? "ready_for_activation" : "requires_operator_inputs",
    activation_ready: ready,
  };
  writeJson(workspace, MANIFEST, manifest);
  return { workspace, manifest, refs };
}

function replaceRefDigest(
  value: unknown,
  path: string,
  digest: string,
): void {
  if (Array.isArray(value)) {
    for (const entry of value) {
      replaceRefDigest(entry, path, digest);
    }
    return;
  }
  if (value === null || typeof value !== "object") {
    return;
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.path === path && typeof candidate.digest === "string") {
    candidate.digest = digest;
  }
  for (const entry of Object.values(candidate)) {
    replaceRefDigest(entry, path, digest);
  }
}
