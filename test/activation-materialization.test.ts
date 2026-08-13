import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { sha256CanonicalJson, sha256Raw, sha256Utf8 } from "../src/digest.js";
import { readYaml, writeJson } from "../src/io.js";
import { validateStage1Preflight } from "../src/preflight.js";
import { validateActivationCandidate } from "../src/validator.js";

type JsonObject = Record<string, any>;

const V2_PACKAGE = "preflight/tunsil-absence-shock-v0";
const V2_RUN = "runs/tunsil-absence-shock-v0";
const V2_RUN_ID = "tunsil-absence-shock-v0";
const V2_JOB = `${V2_PACKAGE}/candidate/job.yaml`;
const V2_INPUTS = `${V2_RUN}/inputs.json`;
const FIXTURE = resolve("fixtures/synthetic-complete");
const FIXTURE_RUN_ID = "run-synthetic-001";
const FIXTURE_RUN = `runs/${FIXTURE_RUN_ID}`;

function withTempWorkspace<T>(
  prepare: (root: string) => void,
  action: (root: string) => T,
): T {
  const parent = mkdtempSync(join(tmpdir(), "tiber-activation-materialize-"));
  const root = join(parent, "workspace");
  prepare(root);
  try {
    return action(root);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function copyV2Workspace(root: string): void {
  cpSync(resolve(V2_PACKAGE), join(root, ...V2_PACKAGE.split("/")), {
    recursive: true,
  });
  cpSync(resolve(V2_RUN), join(root, ...V2_RUN.split("/")), {
    recursive: true,
  });
}

function readWorkspaceJson<T = JsonObject>(root: string, path: string): T {
  return JSON.parse(
    readFileSync(join(root, ...path.split("/")), "utf8"),
  ) as T;
}

function ref(
  artifactType: string,
  path: string,
  value: unknown,
): JsonObject {
  return {
    artifact_type: artifactType,
    path,
    digest: sha256CanonicalJson(value),
    digest_mode: "tiber-canonical-json-v1",
  };
}

function rawFileRef(
  root: string,
  artifactType: string,
  path: string,
): JsonObject {
  return {
    artifact_type: artifactType,
    path,
    digest: sha256Raw(readFileSync(join(root, ...path.split("/")))),
    digest_mode: "tiber-raw-sha256-v1",
  };
}

// ---------------------------------------------------------------------------
// Capability / write-path axis: the v2-shaped candidate (attempts-root plus
// run-event-log write envelope, runs/<id>/inputs.json identity pin, decision
// beneath top-level authority/) must satisfy the Stage 0 activation-candidate
// validator; the v1 envelope shape must fail with the capability error codes.
// ---------------------------------------------------------------------------

function authorV2AuthorityDecision(
  root: string,
  reshapeToV1Envelope: boolean,
): { authorityPath: string; activationAt: string } {
  const job = readYaml<JsonObject>(root, V2_JOB);
  const inputs = readWorkspaceJson(root, V2_INPUTS);
  const now = new Date().toISOString();
  const capabilities = reshapeToV1Envelope
    ? {
        ...job.capabilities,
        repository_read: ["docs", "schemas", "src"],
        repository_write: [V2_RUN],
      }
    : job.capabilities;
  const decision = {
    schema_version: "research-authority-decision/v0",
    synthetic_fixture: false,
    decision_ref: "test:tunsil-v2-activation-shape",
    decision_type: "activate_run",
    run_id: V2_RUN_ID,
    job_ref: {
      job_id: job.job_id,
      job_version: job.job_version,
      path: V2_JOB,
      digest: sha256Raw(readFileSync(join(root, ...V2_JOB.split("/")))),
      digest_mode: "tiber-raw-sha256-v1",
    },
    inputs_ref: {
      path: V2_INPUTS,
      digest: sha256CanonicalJson(inputs),
      digest_mode: "tiber-canonical-json-v1",
    },
    cutoff_at: inputs.cutoff_at,
    capabilities,
    budget: job.budgets,
    authority_ceiling: "research_custody_only",
    permitted_branch: "claude/tunsil-pilot-preflight",
    permitted_path: reshapeToV1Envelope ? V2_RUN : `${V2_RUN}/attempts`,
    approved_at: now,
    approved_by: "Joseph (@Prometheus-Frameworks)",
    scope:
      "Regression-only synthetic activation record proving the v2 package shapes satisfy the Stage 0 activation contract; not an operator decision.",
    exclusions: [
      "Regression fixture only; grants no authority and activates nothing.",
    ],
  };
  writeJson(root, "authority/decision.json", decision);
  return { authorityPath: "authority/decision.json", activationAt: now };
}

test("v2 package shapes satisfy the Stage 0 activation-candidate contract", () => {
  withTempWorkspace(copyV2Workspace, (root) => {
    const { authorityPath, activationAt } = authorV2AuthorityDecision(
      root,
      false,
    );
    const errors = validateActivationCandidate(
      root,
      V2_RUN_ID,
      V2_JOB,
      V2_INPUTS,
      authorityPath,
      activationAt,
    );
    assert.deepEqual(errors, []);
  });
});

test("v1 capability envelope shape fails Stage 0 activation validation", () => {
  withTempWorkspace(copyV2Workspace, (root) => {
    const { authorityPath, activationAt } = authorV2AuthorityDecision(
      root,
      true,
    );
    const errors = validateActivationCandidate(
      root,
      V2_RUN_ID,
      V2_JOB,
      V2_INPUTS,
      authorityPath,
      activationAt,
    );
    const codes = new Set(errors.map((entry) => entry.code));
    assert.ok(codes.has("authority.write_scope"));
    assert.ok(codes.has("authority.write_scope_missing"));
    assert.ok(codes.has("authority.permitted_path"));
    assert.ok(codes.has("authority.read_scope_missing"));
  });
});

// ---------------------------------------------------------------------------
// Provenance digest-semantics axis: a Stage 1 package whose frozen
// artifact_digest is the canonical digest of a promoted governing-manifest
// record accepts a provenance receipt bound to an activate_run authority
// decision; the v1 semantics (artifact_digest = content digest) are rejected
// with provenance_coverage_mismatch.
// ---------------------------------------------------------------------------

const PKG = "preflight/test-package";
const GOVERNING_MANIFEST_PATH = `${PKG}/governance/synthetic-governed-artifact.json`;

function buildStage1ProvenanceWorkspace(
  root: string,
  contentDigestSemantics: boolean,
): void {
  cpSync(FIXTURE, root, { recursive: true });
  // Reduce the fixture run to the pre-activation layout the Stage 0
  // candidate validator requires: only frozen inputs and declared sources.
  rmSync(join(root, ...`${FIXTURE_RUN}/activation.json`.split("/")));
  rmSync(join(root, ...`${FIXTURE_RUN}/run-events.jsonl`.split("/")));
  rmSync(join(root, ...`${FIXTURE_RUN}/attempts`.split("/")), {
    recursive: true,
  });

  const now = new Date().toISOString();
  const governingManifest = {
    schema_version: "research-governing-manifest/v1",
    artifact_id: "synthetic-governed-artifact",
    governance_status: "promoted",
    repository: "Prometheus-Frameworks/TIBER-Synthetic",
    commit: "a".repeat(40),
    path: "exports/promoted/synthetic_artifact.json",
    blob_digest: `sha256:${"b".repeat(64)}`,
  };
  writeJson(root, GOVERNING_MANIFEST_PATH, governingManifest);
  const governingRef = ref(
    "governing_manifest",
    GOVERNING_MANIFEST_PATH,
    governingManifest,
  );
  const artifactDigest = contentDigestSemantics
    ? `sha256:${"c".repeat(64)}`
    : governingRef.digest;

  const inputsPath = `${FIXTURE_RUN}/inputs.json`;
  const inputs = readWorkspaceJson(root, inputsPath);
  inputs.artifacts = [
    {
      artifact_id: governingManifest.artifact_id,
      repository: governingManifest.repository,
      commit: governingManifest.commit,
      path: governingManifest.path,
      blob_digest: governingManifest.blob_digest,
      artifact_digest: artifactDigest,
      admissibility: "admitted",
      freshness: "current",
    },
  ];
  writeJson(root, inputsPath, inputs);
  const inputsDigest = sha256CanonicalJson(inputs);

  const authorityPath = "authority/decision.json";
  const authority = readWorkspaceJson(root, authorityPath);
  authority.inputs_ref.digest = inputsDigest;
  writeJson(root, authorityPath, authority);
  const authorityRef = ref("authority_decision", authorityPath, authority);
  const jobRef = rawFileRef(root, "candidate_job", "job.yaml");
  const inputsRef = {
    artifact_type: "candidate_inputs",
    path: inputsPath,
    digest: inputsDigest,
    digest_mode: "tiber-canonical-json-v1",
  };

  const observationPolicy = {
    schema_version: "research-observation-policy/v1",
    policy_id: "synthetic-observation",
    admitted_observations: [
      {
        boundary_id: "synthetic-governed-repo",
        boundary_type: "governed_repository",
        actor_id: "synthetic-verifier",
        actor_role: "artifact_custodian",
        method: "repository_blob_verification",
        trust_basis: "Synthetic regression fixture.",
      },
    ],
  };
  writeJson(root, `${PKG}/controls/observation-policy.json`, observationPolicy);
  const observationRef = ref(
    "observation_policy",
    `${PKG}/controls/observation-policy.json`,
    observationPolicy,
  );

  const freshnessPolicy = {
    schema_version: "research-freshness-policy/v1",
    policy_id: "synthetic-freshness",
    chronology_rule: "effective_at_lte_freshness_as_of_lte_verified_at",
    cutoff_rule: "freshness_as_of_lte_cutoff_at",
    current_state_rule: "current_requires_exact_governing_manifest_and_authority",
  };
  writeJson(root, `${PKG}/controls/freshness-policy.json`, freshnessPolicy);
  const freshnessRef = ref(
    "freshness_policy",
    `${PKG}/controls/freshness-policy.json`,
    freshnessPolicy,
  );

  const egressPolicy = {
    schema_version: "research-egress-enforcement-policy/v1",
    control_state: "candidate_not_enforced",
    default_action: "deny",
    execution_profile: "synthetic_profile",
    limitations: ["Synthetic regression fixture."],
    policy_ref: "synthetic:regression",
  };
  writeJson(root, `${PKG}/controls/egress-enforcement-policy.json`, egressPolicy);
  const egressRef = ref(
    "egress_policy",
    `${PKG}/controls/egress-enforcement-policy.json`,
    egressPolicy,
  );

  const networkPolicy = {
    schema_version: "research-network-policy/v1",
    policy_id: "synthetic-network",
    candidate_run_id: FIXTURE_RUN_ID,
    mode: "denied",
    default_action: "deny",
    destinations: [],
    enforcement_boundary: {
      boundary_id: "synthetic-runner",
      boundary_type: "sandbox_firewall",
      enforcement_policy_ref: egressRef,
    },
    policy_owner: "Synthetic regression fixture",
    policy_status: "proposed",
    recorded_at: "2026-01-01T14:06:00Z",
  };
  writeJson(root, `${PKG}/controls/network-policy.json`, networkPolicy);
  const networkRef = ref(
    "network_policy",
    `${PKG}/controls/network-policy.json`,
    networkPolicy,
  );

  const rateCard = {
    schema_version: "research-cost-rate-card/v1",
    unit: "tiber_actor_session_v1",
    accounting_basis:
      "one_unit_per_trusted_observed_provider_backed_actor_session_ref",
    definition:
      "One provider-backed actor session bound to a unique actor_session_ref.",
    exclusions: ["Synthetic regression fixture."],
  };
  writeJson(root, `${PKG}/controls/cost-rate-card.json`, rateCard);
  const rateCardRef = ref(
    "cost_rate_card",
    `${PKG}/controls/cost-rate-card.json`,
    rateCard,
  );
  const costPolicy = {
    schema_version: "research-cost-policy/v1",
    policy_id: "synthetic-cost",
    candidate_run_id: FIXTURE_RUN_ID,
    unit: "tiber_actor_session_v1",
    ceiling: 2,
    accounting_mode: "fixed_session_reservation",
    rate_card_ref: rateCardRef,
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
        { role: "executor", amount: 1 },
        { role: "reviewer", amount: 1 },
      ],
      accounting_basis:
        "one_unit_per_trusted_observed_provider_backed_actor_session_ref",
      accounting_limitation:
        "Bounds trusted-observed provider-backed actor session starts, not tokens, compute, or currency.",
    },
    policy_owner: "Synthetic regression fixture",
    policy_status: "approved",
    recorded_at: "2026-01-01T14:06:00Z",
    limitations: ["Synthetic regression fixture."],
  };
  writeJson(root, `${PKG}/controls/cost-policy.json`, costPolicy);
  const costRef = ref(
    "cost_policy",
    `${PKG}/controls/cost-policy.json`,
    costPolicy,
  );

  const directionQuote =
    "Synthetic activation direction for regression coverage.";
  const direction = {
    schema_version: "research-operator-direction-record/v1",
    authority_class: "activate_run",
    decision_ref: authority.decision_ref,
    operator: authority.approved_by,
    candidate_run_id: FIXTURE_RUN_ID,
    operator_direction: directionQuote,
    quote_digest: sha256Utf8(directionQuote),
    quote_digest_mode: "tiber-raw-sha256-v1",
    recorded_at: "2026-01-01T14:05:00Z",
    approved_artifact_refs: [],
    scope: ["Synthetic regression coverage only."],
    exclusions: ["No real-world claims or authority."],
    terminal_outcomes: ["synthetic_regression"],
  };
  writeJson(root, `${PKG}/authority/direction.json`, direction);
  const directionRef = ref(
    "operator_direction_record",
    `${PKG}/authority/direction.json`,
    direction,
  );

  const receipt = {
    schema_version: "research-governed-artifact-provenance-receipt/v1",
    receipt_id: "prov-synthetic-governed-artifact",
    candidate_run_id: FIXTURE_RUN_ID,
    artifact_id: governingManifest.artifact_id,
    repository: governingManifest.repository,
    commit: governingManifest.commit,
    path: governingManifest.path,
    blob_digest: governingManifest.blob_digest,
    artifact_digest: artifactDigest,
    observed_at: now,
    effective_at: "2026-01-01T12:00:00Z",
    verified_at: now,
    cutoff_at: inputs.cutoff_at,
    governing_authority_ref: authorityRef,
    governing_manifest_ref: {
      artifact_type: "governing_manifest",
      path: GOVERNING_MANIFEST_PATH,
      digest: governingRef.digest,
      digest_mode: "tiber-canonical-json-v1",
    },
    verifier: {
      verifier_id: "synthetic-verifier",
      role: "artifact_custodian",
      trust_basis: "Synthetic regression fixture.",
    },
    verification_method: "repository_blob_verification",
    trust_boundary: {
      boundary_id: "synthetic-governed-repo",
      boundary_type: "governed_repository",
      policy_ref: observationRef,
    },
    freshness: {
      state: "current",
      as_of: "2026-01-01T14:12:00Z",
      policy_ref: freshnessRef,
      rationale: "Synthetic regression fixture.",
    },
  };
  writeJson(root, `${PKG}/receipts/provenance.json`, receipt);
  const receiptRef = ref(
    "governed_artifact_provenance_receipt",
    `${PKG}/receipts/provenance.json`,
    receipt,
  );

  cpSync(
    resolve(`${V2_PACKAGE}/candidate/stage0-contract-inventory.json`),
    join(root, ...`${PKG}/candidate/stage0-contract-inventory.json`.split("/")),
  );
  const inventoryRef = ref(
    "stage0_contract_inventory",
    `${PKG}/candidate/stage0-contract-inventory.json`,
    readWorkspaceJson(root, `${PKG}/candidate/stage0-contract-inventory.json`),
  );

  const manifest = {
    schema_version: "research-stage1-preflight/v1",
    preflight_id: "synthetic-materialization-preflight",
    candidate_run_id: FIXTURE_RUN_ID,
    prepared_at: now,
    stage0_base: {
      repository: "Prometheus-Frameworks/TIBER-Research",
      commit: "8a8039eeaa2ba1b8cae65859d43746df6b949ecd",
      tree_sha: "582930f21d6fafafcfc55527e5aa9363c08ad417",
      pull_request_ref:
        "https://github.com/Prometheus-Frameworks/TIBER-Research/pull/1",
      contract_inventory_ref: inventoryRef,
      schema_version: "tiber-research-schemas-v0",
      validator_version: "tiber-research-validator-v0",
      ci_status: "passed",
    },
    ops_decision: {
      decision_ref: direction.decision_ref,
      quote_digest: direction.quote_digest,
      quote_digest_mode: "tiber-raw-sha256-v1",
      quote_observed_at: direction.recorded_at,
      operator: direction.operator,
    },
    gate_artifacts: {
      external_source_availability_receipt_refs: [],
      governed_artifact_provenance_receipt_refs: [receiptRef],
      network_policy_ref: networkRef,
      network_enforcement_receipt_ref: null,
      cost_policy_ref: costRef,
      trusted_usage_receipt_refs: [],
    },
    candidate_artifact_refs: [
      directionRef,
      authorityRef,
      jobRef,
      inputsRef,
      governingRef,
    ],
    requirements: [
      {
        requirement_id: "candidate-inputs",
        description: "Synthetic frozen inputs are bound.",
        status: "satisfied",
        evidence_refs: [inputsRef],
      },
      {
        requirement_id: "candidate-job",
        description: "Synthetic candidate job is bound.",
        status: "satisfied",
        evidence_refs: [jobRef],
      },
      {
        requirement_id: "cost-accounting",
        description: "Synthetic approved two-session reservation.",
        status: "satisfied",
        evidence_refs: [costRef],
      },
      {
        requirement_id: "external-source-availability",
        description:
          "The admitted synthetic source has no availability receipt yet.",
        status: "unresolved",
        evidence_refs: [inputsRef],
      },
      {
        requirement_id: "governed-artifact-provenance",
        description:
          "The pinned synthetic artifact carries a provenance receipt bound to the activate_run decision and its promoted governing manifest.",
        status: "satisfied",
        evidence_refs: [receiptRef],
      },
      {
        requirement_id: "network-enforcement",
        description: "No trusted enforcement receipt exists.",
        status: "unresolved",
        evidence_refs: [networkRef],
      },
      {
        requirement_id: "operator-activation",
        description:
          "A synthetic activate_run direction and decision are bound.",
        status: "satisfied",
        evidence_refs: [directionRef, authorityRef],
      },
    ],
    unresolved_inputs: [
      {
        input_id: "synthetic-availability-receipt",
        description:
          "The synthetic source availability receipt has not been authored.",
        blocking: true,
        requirement_refs: ["external-source-availability"],
        disposition: "missing",
      },
      {
        input_id: "synthetic-network-enforcement-receipt",
        description:
          "The synthetic network enforcement receipt has not been observed.",
        blocking: true,
        requirement_refs: ["network-enforcement"],
        disposition: "unverified",
      },
    ],
    status: "requires_operator_inputs",
    activation_ready: false,
  };
  writeJson(root, `${PKG}/preflight.json`, manifest);
}

test("governing-manifest digest semantics satisfy provenance coverage", () => {
  withTempWorkspace(
    (root) => buildStage1ProvenanceWorkspace(root, false),
    (root) => {
      const report = validateStage1Preflight(root, `${PKG}/preflight.json`);
      assert.deepEqual(report.errors, []);
      assert.equal(report.valid, true);
      assert.deepEqual(report.gate_state.governed_artifact_provenance, {
        receipt_count: 1,
        state: "present",
      });
    },
  );
});

test("content-digest artifact semantics fail provenance coverage", () => {
  withTempWorkspace(
    (root) => buildStage1ProvenanceWorkspace(root, true),
    (root) => {
      const report = validateStage1Preflight(root, `${PKG}/preflight.json`);
      assert.equal(report.valid, false);
      assert.ok(
        report.errors.some(
          (entry) => entry.code === "provenance_coverage_mismatch",
        ),
      );
      assert.deepEqual(report.gate_state.governed_artifact_provenance, {
        receipt_count: 1,
        state: "unresolved",
      });
    },
  );
});
