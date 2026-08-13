import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  sha256CanonicalJson,
  sha256Raw,
  sha256Utf8,
} from "../src/digest.js";
import {
  readBytes,
  readNormalizedJson,
  writeJson,
} from "../src/io.js";
import {
  type ArtifactRef,
  validateStage1Preflight,
} from "../src/preflight.js";

const PACKAGE = "preflight/adversarial-stage1";
const MANIFEST = `${PACKAGE}/preflight.json`;
const RUN_ID = "run-synthetic-001";
const EVALUATION_AT = "2026-01-02T01:15:00Z";
const COMMIT = "8a8039eeaa2ba1b8cae65859d43746df6b949ecd";
const TREE = "582930f21d6fafafcfc55527e5aa9363c08ad417";
const DIGEST_A = `sha256:${"a".repeat(64)}`;
const DIGEST_B = `sha256:${"d".repeat(64)}`;

interface BuiltPreflight {
  workspace: string;
  manifest: Record<string, unknown>;
  refs: Record<string, ArtifactRef>;
}

test("Stage 1 adversarial preflight bypasses fail closed", async (t) => {
  await t.test("external sources cannot be declared not applicable", () => {
    withBuilt((built) => {
      const gateArtifacts = built.manifest.gate_artifacts as Record<
        string,
        unknown
      >;
      gateArtifacts.external_source_availability_receipt_refs = [];
      const requirements = built.manifest.requirements as Array<
        Record<string, unknown>
      >;
      const requirement = requirements.find(
        (entry) =>
          entry.requirement_id === "external-source-availability",
      );
      assert.ok(requirement);
      requirement.status = "not_applicable";
      requirement.evidence_refs = [];
      const availability = built.refs.availability;
      assert.ok(availability);
      rmSync(join(built.workspace, availability.path));
      writeManifest(built);

      assertRejected(built, "gate_requirement_mismatch");
    });
  });

  await t.test("unrelated provenance cannot cover a governed artifact", () => {
    withBuilt((built) => {
      mutateArtifact(built, "provenance", (value) => {
        value.artifact_id = "unrelated-artifact";
        value.artifact_digest = DIGEST_B;
      });

      assertRejected(built, "unrelated_provenance_receipt");
    });
  });

  await t.test("an enforcement observation cannot postdate preflight", () => {
    withBuilt((built) => {
      mutateArtifact(built, "networkEnforcement", (value) => {
        value.observed_at = "2026-01-02T01:30:00Z";
      });

      assertRejected(built, "network_observed_after_preflight");
    });
  });

  await t.test("usd_micro accounting is not supported by Stage 1", () => {
    withBuilt((built) => {
      mutateArtifact(built, "costPolicy", (value) => {
        value.unit = "usd_micro";
        value.accounting_mode = "trusted_usage";
        value.fixed_reservation = null;
      });

      assertRejected(built, "unsupported_activation_cost_policy");
    });
  });

  await t.test("fixed reservations enforce each role limit", () => {
    withBuilt((built) => {
      addUsageReceipt(built, "usage-executor-1", "session-executor-1", null);
      const firstReceipt = built.refs.usageExecutor1;
      assert.ok(firstReceipt);
      addUsageReceipt(
        built,
        "usage-executor-2",
        "session-executor-2",
        firstReceipt.digest,
      );
      writeManifest(built);

      assertRejected(built, "role_session_limit_exceeded");
    });
  });

  await t.test("usage cannot predate its exact cost policy", () => {
    withBuilt((built) => {
      addUsageReceipt(built, "usage-executor-1", "session-executor-1", null);
      writeManifest(built);
      mutateArtifact(built, "usageExecutor1", (value) => {
        value.usage_started_at = "2026-01-01T14:11:00Z";
      });

      assertRejected(built, "usage_before_cost_policy");
    });
  });

  await t.test("usage observation cannot postdate the preflight snapshot", () => {
    withBuilt((built) => {
      addUsageReceipt(built, "usage-executor-1", "session-executor-1", null);
      writeManifest(built);
      mutateArtifact(built, "usageExecutor1", (value) => {
        value.observed_at = "2026-01-02T01:21:00Z";
      });

      assertRejected(built, "usage_observed_after_preflight");
    });
  });

  await t.test("usage observer identity is exactly admitted", () => {
    withBuilt((built) => {
      addUsageReceipt(built, "usage-executor-1", "session-executor-1", null);
      writeManifest(built);
      mutateArtifact(built, "usageExecutor1", (value) => {
        const observer = value.observer as Record<string, unknown>;
        observer.observer_id = "self-declared-attacker";
      });

      assertRejected(built, "observation_policy_scope");
    });
  });

  await t.test("leap-second timestamps are rejected", () => {
    withBuilt((built) => {
      mutateArtifact(built, "networkEnforcement", (value) => {
        value.observed_at = "2026-01-01T14:19:60Z";
      });

      assertRejected(built, "schema_format");
    });
  });

  await t.test("unparseable timestamps are rejected", () => {
    withBuilt((built) => {
      built.manifest.prepared_at = "not-a-timestamp";
      writeManifest(built);

      assertRejected(built, "schema_format");
    });
  });

  await t.test("schema-invalid network receipt fails closed without throwing", () => {
    withBuilt((built) => {
      mutateArtifact(built, "networkEnforcement", (value) => {
        delete value.observation_policy_ref;
      });

      assertRejected(built, "schema_required");
    });
  });

  await t.test("schema-invalid availability receipt fails closed without throwing", () => {
    withBuilt((built) => {
      mutateArtifact(built, "availability", (value) => {
        delete value.trust_boundary;
      });

      assertRejected(built, "schema_required");
    });
  });

  await t.test("schema-invalid provenance receipt fails closed without throwing", () => {
    withBuilt((built) => {
      mutateArtifact(built, "provenance", (value) => {
        delete value.freshness;
      });

      assertRejected(built, "schema_required");
    });
  });

  await t.test("schema-invalid cost policy fails closed without throwing", () => {
    withBuilt((built) => {
      mutateArtifact(built, "costPolicy", (value) => {
        delete value.rate_card_ref;
      });

      assertRejected(built, "schema_required");
    });
  });

  await t.test("schema-invalid source metadata fails closed without throwing", () => {
    withBuilt((built) => {
      mutateSourceMetadata(built, (value) => {
        delete value.temporal;
      });

      assertRejected(built, "schema_required");
    });
  });

  await t.test("conflicting artifact types cannot retain an unvalidated value", () => {
    withBuilt((built) => {
      const candidateRefs =
        built.manifest.candidate_artifact_refs as ArtifactRef[];
      const observationPolicy = candidateRefs.find(
        (ref) => ref.artifact_type === "observation_policy",
      );
      assert.ok(observationPolicy);
      observationPolicy.artifact_type = "opaque_policy";
      writeManifest(built);

      assertRejected(built, "artifact_ref_conflict");
    });
  });

  await t.test("activation authority is mandatory", () => {
    withBuilt((built) => {
      const requirements = built.manifest.requirements as Array<
        Record<string, unknown>
      >;
      built.manifest.requirements = requirements.filter(
        (entry) => entry.requirement_id !== "operator-activation",
      );
      writeManifest(built);

      assertRejected(built, "missing_requirement");
    });
  });

  await t.test("preflight-only authority cannot activate a run", () => {
    withBuilt((built) => {
      mutateArtifact(built, "operatorApproval", (value) => {
        value.authority_class = "stage1_preflight_only";
      });

      assertRejected(built, "operator_activation_missing");
    });
  });

  await t.test("activation authority must exactly match ops_decision", () => {
    withBuilt((built) => {
      built.manifest.ops_decision = {
        ...(built.manifest.ops_decision as Record<string, unknown>),
        decision_ref: "synthetic:different-decision",
      };
      writeManifest(built);

      assertRejected(built, "operator_direction_mismatch");
    });
  });

  await t.test("comparison population cannot drift from the job", () => {
    withBuilt((built) => {
      mutateArtifact(built, "candidateInputs", (value) => {
        const comparisons = value.comparisons as Array<
          Record<string, unknown>
        >;
        const first = comparisons[0];
        assert.ok(first);
        first.label = "Fictional Device Drift";
      });

      assertRejected(built, "stage0_population_comparisons_changed");
    });
  });

  await t.test("source metadata cannot cross run boundaries", () => {
    withBuilt((built) => {
      mutateSourceMetadata(built, (value) => {
        value.run_id = "run-attacker-001";
      });

      assertRejected(built, "stage0_source_manifest_mismatch");
    });
  });

  await t.test("source fixture classification is immutable", () => {
    withBuilt((built) => {
      mutateSourceMetadata(built, (value) => {
        value.synthetic_fixture = false;
      });

      assertRejected(built, "stage0_source_synthetic_fixture_mismatch");
    });
  });

  await t.test("matching fabricated Stage 0 assertions are rejected", () => {
    withBuilt((built) => {
      mutateArtifact(built, "contractInventory", (value) => {
        value.repository = "Attacker/Fabricated";
        value.base_commit = "1".repeat(40);
        value.base_tree = "2".repeat(40);
        value.pull_request = "https://github.com/Attacker/Fabricated/pull/1";
      });
      built.manifest.stage0_base = {
        ...(built.manifest.stage0_base as Record<string, unknown>),
        repository: "Attacker/Fabricated",
        commit: "1".repeat(40),
        tree_sha: "2".repeat(40),
        pull_request_ref:
          "https://github.com/Attacker/Fabricated/pull/1",
      };
      writeManifest(built);

      assertRejected(built, "stage0_base_mismatch");
    });
  });

  await t.test("activation writes stay beneath the stable attempts root", () => {
    withBuilt((built) => {
      mutateArtifact(built, "authorityDecision", (value) => {
        value.permitted_path = "runs/run-synthetic-001/attacker";
      });

      assertRejected(built, "stage0_authority_permitted_path");
    });
  });

  await t.test("a declared baseline must resolve to frozen inputs", () => {
    withBuilt((built) => {
      mutateCandidateJob(built, (text) =>
        text.replace(
          "baseline_ref: null",
          [
            "baseline_ref:",
            "  input_id: missing-baseline",
            `  digest: ${DIGEST_B}`,
          ].join("\n"),
        ),
      );

      assertRejected(built, "stage0_input_baseline_unpinned");
    });
  });

  await t.test("network policy must match activated capabilities", () => {
    withBuilt((built) => {
      mutateCandidateJob(built, (text) =>
        text.replace("  network: denied", "  network: allowlisted"),
      );
      mutateArtifact(built, "authorityDecision", (value) => {
        const capabilities = value.capabilities as Record<string, unknown>;
        capabilities.network = "allowlisted";
      });

      assertRejected(built, "network_capability_mismatch");
    });
  });

  await t.test("availability evidence must be the exact source metadata", () => {
    withBuilt((built) => {
      const unrelated = built.refs.rateCard;
      assert.ok(unrelated);
      mutateArtifact(built, "availability", (value) => {
        value.evidence_ref = unrelated;
      });

      assertRejected(built, "availability_evidence_binding");
    });
  });

  await t.test("availability cannot be observed before it exists", () => {
    withBuilt((built) => {
      mutateArtifact(built, "availability", (value) => {
        value.observed_at = "2026-01-01T12:59:00Z";
      });

      assertRejected(built, "availability_observed_before_available");
    });
  });

  await t.test("provenance must bind exact authority and manifest", () => {
    withBuilt((built) => {
      const unrelatedAuthority = built.refs.operatorApproval;
      const unrelatedManifest = built.refs.rateCard;
      assert.ok(unrelatedAuthority);
      assert.ok(unrelatedManifest);
      mutateArtifact(built, "provenance", (value) => {
        value.governing_authority_ref = unrelatedAuthority;
        value.governing_manifest_ref = unrelatedManifest;
      });

      assertRejected(built, "provenance_coverage_mismatch");
    });
  });

  await t.test("provenance cannot claim future effective state", () => {
    withBuilt((built) => {
      mutateArtifact(built, "provenance", (value) => {
        value.effective_at = "2026-01-02T01:21:00Z";
      });

      assertRejected(built, "artifact_effective_after_preflight");
    });
  });

  await t.test("operator approval cannot predate approved policies", () => {
    withBuilt((built) => {
      mutateArtifact(built, "operatorApproval", (value) => {
        value.recorded_at = "2026-01-01T14:11:00Z";
      });
      const opsDecision = built.manifest.ops_decision as Record<
        string,
        unknown
      >;
      opsDecision.quote_observed_at = "2026-01-01T14:11:00Z";
      writeManifest(built);

      assertRejected(
        built,
        "operator_approval_predates_network_policy",
      );
    });
  });

  await t.test("activation reserves a fresh reviewer session", () => {
    withBuilt((built) => {
      mutateArtifact(built, "costPolicy", (value) => {
        const reservation = value.fixed_reservation as Record<
          string,
          unknown
        >;
        reservation.roles = ["executor"];
        reservation.role_limits = [{ role: "executor", amount: 2 }];
      });

      assertRejected(built, "unsupported_activation_role_reservation");
    });
  });

  await t.test("egress policy semantics cannot be rehashed to allow", () => {
    withBuilt((built) => {
      mutateArtifact(built, "egressPolicy", (value) => {
        value.default_action = "allow";
      });

      assertRejected(built, "schema_const");
    });
  });

  await t.test("activation requires an enforced egress state", () => {
    withBuilt((built) => {
      mutateArtifact(built, "egressPolicy", (value) => {
        value.control_state = "candidate_not_enforced";
      });

      assertRejected(built, "egress_policy_not_enforced");
    });
  });

  await t.test("network receipt observes the exact capability envelope", () => {
    withBuilt((built) => {
      mutateArtifact(built, "networkEnforcement", (value) => {
        const environment = value.environment_identity as Record<
          string,
          unknown
        >;
        environment.observed_capabilities_digest = DIGEST_B;
      });

      assertRejected(
        built,
        "network_capability_observation_mismatch",
      );
    });
  });

  await t.test("network observation cannot predate its exact policy", () => {
    withBuilt((built) => {
      mutateArtifact(built, "networkEnforcement", (value) => {
        value.valid_from = "2026-01-01T14:10:00Z";
        value.observed_at = "2026-01-01T14:11:00Z";
      });

      assertRejected(built, "network_observed_before_policy");
    });
  });

  await t.test("network observation cannot predate operator policy authority", () => {
    withBuilt((built) => {
      mutateArtifact(built, "networkPolicy", (value) => {
        value.recorded_at = "2026-01-01T14:10:00Z";
      });
      mutateArtifact(built, "networkEnforcement", (value) => {
        value.valid_from = "2026-01-01T14:10:00Z";
        value.observed_at = "2026-01-01T14:11:00Z";
      });

      assertRejected(built, "network_before_operator_direction");
    });
  });

  await t.test("network validity cannot predate its exact policy", () => {
    withBuilt((built) => {
      mutateArtifact(built, "networkEnforcement", (value) => {
        value.valid_from = "2026-01-01T14:10:00Z";
      });

      assertRejected(built, "network_valid_before_policy");
    });
  });

  await t.test("governing manifest semantics are immutable", () => {
    withBuilt((built) => {
      mutateArtifact(built, "governingManifest", (value) => {
        value.artifact_id = "different-artifact";
        value.governance_status = "draft";
      });
      const governingManifest = built.refs.governingManifest;
      assert.ok(governingManifest);
      mutateArtifact(built, "candidateInputs", (value) => {
        const artifacts = value.artifacts as Array<Record<string, unknown>>;
        const first = artifacts[0];
        assert.ok(first);
        first.artifact_digest = governingManifest.digest;
      });
      mutateArtifact(built, "provenance", (value) => {
        value.artifact_digest = governingManifest.digest;
      });

      assertRejected(built, "schema_const");
    });
  });

  await t.test("freshness cannot predate artifact effectiveness", () => {
    withBuilt((built) => {
      mutateArtifact(built, "provenance", (value) => {
        const freshness = value.freshness as Record<string, unknown>;
        freshness.as_of = "2026-01-01T12:00:00Z";
      });

      assertRejected(built, "freshness_before_effective");
    });
  });

  await t.test("freshness cannot predate governing authority", () => {
    withBuilt((built) => {
      mutateArtifact(built, "provenance", (value) => {
        const freshness = value.freshness as Record<string, unknown>;
        freshness.as_of = "2026-01-01T14:10:00Z";
      });

      assertRejected(built, "freshness_before_governing_authority");
    });
  });

  await t.test("provenance cannot predate its governing authority", () => {
    withBuilt((built) => {
      mutateArtifact(built, "provenance", (value) => {
        value.observed_at = "2026-01-01T14:11:00Z";
        value.verified_at = "2026-01-01T14:11:00Z";
        const freshness = value.freshness as Record<string, unknown>;
        freshness.as_of = "2026-01-01T14:11:00Z";
      });

      assertRejected(built, "provenance_before_governing_authority");
    });
  });

  await t.test("provenance verifier identity is exactly admitted", () => {
    withBuilt((built) => {
      mutateArtifact(built, "provenance", (value) => {
        const verifier = value.verifier as Record<string, unknown>;
        verifier.verifier_id = "self-declared-attacker";
      });

      assertRejected(built, "observation_policy_scope");
    });
  });

  await t.test("availability observer trust basis is exactly admitted", () => {
    withBuilt((built) => {
      mutateArtifact(built, "availability", (value) => {
        const observer = value.observer as Record<string, unknown>;
        observer.trust_basis = "Self-declared trust.";
      });

      assertRejected(built, "observation_policy_scope");
    });
  });

  await t.test("availability observation cannot predate operator policy authority", () => {
    withBuilt((built) => {
      mutateArtifact(built, "availability", (value) => {
        value.observed_at = "2026-01-01T14:11:00Z";
      });

      assertRejected(built, "availability_before_operator_direction");
    });
  });

  await t.test("network observer identity is exactly admitted", () => {
    withBuilt((built) => {
      mutateArtifact(built, "networkEnforcement", (value) => {
        const observer = value.observer as Record<string, unknown>;
        observer.observer_id = "self-declared-attacker";
      });

      assertRejected(built, "observation_policy_scope");
    });
  });

  await t.test("operator approval binds the observation policy", () => {
    withBuilt((built) => {
      mutateArtifact(built, "operatorApproval", (value) => {
        const approved = value.approved_artifact_refs as ArtifactRef[];
        value.approved_artifact_refs = approved.filter(
          (ref) => ref.artifact_type !== "observation_policy",
        );
      });

      assertRejected(built, "operator_approval_bundle_incomplete");
    });
  });

  await t.test("preactivation run state rejects promotion records", () => {
    withBuilt((built) => {
      writeJson(
        built.workspace,
        `runs/${RUN_ID}/promotion.json`,
        { prohibited: true },
      );

      assertRejected(built, "stage0_authority_promotion_inside_run");
    });
  });

  await t.test("availability cannot predate source custody", () => {
    withBuilt((built) => {
      mutateArtifact(built, "availability", (value) => {
        value.observed_at = "2026-01-01T13:30:00Z";
      });

      assertRejected(built, "availability_before_source_custody");
    });
  });

  await t.test("rate card must match the cost policy unit", () => {
    withBuilt((built) => {
      mutateArtifact(built, "rateCard", (value) => {
        value.unit = "usd_micro";
        value.accounting_basis = "one_micro_usd";
      });

      assertRejected(built, "cost_rate_card_mismatch");
    });
  });

  await t.test("expired controls fail at trusted time of use", () => {
    withBuilt((built) => {
      assertRejected(
        built,
        "network_receipt_not_current",
        "2026-01-03T00:00:00Z",
      );
    });
  });

  await t.test("preflight preparation cannot postdate trusted evaluation", () => {
    withBuilt((built) => {
      built.manifest.prepared_at = "2026-01-02T01:21:00Z";
      writeManifest(built);

      assertRejected(built, "preflight_after_evaluation");
    });
  });

  await t.test("trusted evaluation time must be canonical UTC", () => {
    withBuilt((built) => {
      assertRejected(
        built,
        "evaluation_at_format",
        "Thu Jan 01 2026 14:20:00 GMT+0000",
      );
    });
  });

  await t.test("artifact chronology rejects sub-millisecond timestamps", () => {
    withBuilt((built) => {
      mutateArtifact(built, "networkEnforcement", (value) => {
        value.observed_at = "2026-01-01T14:16:00.0001Z";
      });

      assertRejected(built, "timestamp_precision");
    });
  });

  await t.test("readiness is withheld without a trusted evaluation time", () => {
    withBuilt((built) => {
      const report = validateStage1Preflight(built.workspace, MANIFEST);
      assert.equal(report.valid, true);
      assert.equal(report.activation_ready, false);
      assert.equal(report.evaluation_at, null);
    });
  });
});

function assertRejected(
  built: BuiltPreflight,
  expectedCode: string,
  evaluationAt = EVALUATION_AT,
): void {
  const report = validateStage1Preflight(
    built.workspace,
    MANIFEST,
    { evaluationAt },
  );
  assert.equal(
    report.valid,
    false,
    "adversarial package unexpectedly passed Stage 1 preflight",
  );
  assert.equal(report.activation_ready, false);
  assert.ok(
    report.errors.some((error) => error.code === expectedCode),
    `expected ${expectedCode}; received:\n${JSON.stringify(report.errors, null, 2)}`,
  );
}

function withBuilt(operation: (built: BuiltPreflight) => void): void {
  const built = buildReadyPreflight();
  try {
    const baseline = validateStage1Preflight(
      built.workspace,
      MANIFEST,
      { evaluationAt: EVALUATION_AT },
    );
    assert.equal(
      baseline.valid,
      true,
      `test baseline is invalid:\n${JSON.stringify(baseline.errors, null, 2)}`,
    );
    assert.equal(baseline.activation_ready, true);
    operation(built);
  } finally {
    rmSync(built.workspace, { recursive: true, force: true });
  }
}

function buildReadyPreflight(): BuiltPreflight {
  const workspace = mkdtempSync(join(tmpdir(), "tiber-stage1-adversarial-"));
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

  const contractInventory = artifact(
    "contractInventory",
    "stage0_contract_inventory",
    "stage0-contract-inventory.json",
    {
      repository: "Prometheus-Frameworks/TIBER-Research",
      base_commit: COMMIT,
      base_tree: TREE,
      pull_request:
        "https://github.com/Prometheus-Frameworks/TIBER-Research/pull/1",
      audit: { ci_status: "passed" },
    },
  );
  const egressPolicy = artifact(
    "egressPolicy",
    "egress_policy",
    "egress-enforcement-policy.json",
    {
      schema_version: "research-egress-enforcement-policy/v1",
      control_state: "enforced",
      default_action: "deny",
      execution_profile: "adversarial-stage1",
      limitations: [
        "Synthetic enforced policy for adversarial preflight tests.",
      ],
      policy_ref: "synthetic:adversarial-stage1",
    },
  );
  const observationPolicy = artifact(
    "observationPolicy",
    "observation_policy",
    "artifact-observation-policy.json",
    {
      schema_version: "research-observation-policy/v1",
      policy_id: "adversarial-observation-policy",
      admitted_observations: [
        {
          boundary_id: "synthetic-runner",
          boundary_type: "runner_observation",
          actor_id: "synthetic-trusted-runner",
          actor_role: "trusted_runner",
          method: "operator_provided_packet",
          trust_basis: "Synthetic fixture observation.",
        },
        {
          boundary_id: "synthetic-governed-repository",
          boundary_type: "governed_repository",
          actor_id: "synthetic-trusted-runner",
          actor_role: "trusted_runner",
          method: "repository_blob_verification",
          trust_basis: "Synthetic fixture verification.",
        },
        {
          boundary_id: "synthetic-sandbox",
          boundary_type: "sandbox_firewall",
          actor_id: "synthetic-trusted-runner",
          actor_role: "trusted_runner",
          method: "network_enforcement_observation",
          trust_basis: "Synthetic fixture observation.",
        },
        {
          boundary_id: "synthetic-runner",
          boundary_type: "runner_observation",
          actor_id: "synthetic-trusted-runner",
          actor_role: "trusted_runner",
          method: "provider_usage_observation",
          trust_basis: "Synthetic fixture observation.",
        },
      ],
    },
  );
  const governingManifest = artifact(
    "governingManifest",
    "governing_manifest",
    "governing-manifest.json",
    {
      schema_version: "research-governing-manifest/v1",
      artifact_id: "synthetic-baseline",
      governance_status: "promoted",
      repository: "Prometheus-Frameworks/TIBER-Synthetic",
      commit: COMMIT,
      path: "exports/synthetic-baseline.json",
      blob_digest: DIGEST_A,
    },
  );
  const freshnessPolicy = artifact(
    "freshnessPolicy",
    "freshness_policy",
    "freshness-policy.json",
    {
      schema_version: "research-freshness-policy/v1",
      policy_id: "adversarial-freshness-policy",
      chronology_rule:
        "effective_at_lte_freshness_as_of_lte_verified_at",
      cutoff_rule:
        "evidence_clocks_lte_cutoff_custody_assessment_may_follow",
      current_state_rule:
        "current_requires_exact_governing_manifest_and_authority",
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

  copyFileSync(
    join(process.cwd(), "fixtures/synthetic-complete/job.yaml"),
    join(workspace, "job.yaml"),
  );
  const candidateJob: ArtifactRef = {
    artifact_type: "candidate_job",
    path: "job.yaml",
    digest: sha256Raw(readBytes(workspace, "job.yaml")),
    digest_mode: "tiber-raw-sha256-v1",
  };
  refs.candidateJob = candidateJob;

  const sourceMetadataPath =
    "runs/run-synthetic-001/sources/source-synthetic-bench-001/metadata.json";
  const sourceContentPath =
    "runs/run-synthetic-001/sources/source-synthetic-bench-001/content";
  const sourceMetadata = readNormalizedJson<Record<string, unknown>>(
    process.cwd(),
    `fixtures/synthetic-complete/${sourceMetadataPath}`,
  );
  writeJson(workspace, sourceMetadataPath, sourceMetadata);
  const sourceMetadataRef: ArtifactRef = {
    artifact_type: "source_metadata",
    path: sourceMetadataPath,
    digest: sha256CanonicalJson(sourceMetadata),
    digest_mode: "tiber-canonical-json-v1",
  };
  refs.sourceMetadata = sourceMetadataRef;
  copyFileSync(
    join(process.cwd(), `fixtures/synthetic-complete/${sourceContentPath}`),
    join(workspace, sourceContentPath),
  );

  const candidateInputsValue = readNormalizedJson<Record<string, unknown>>(
    process.cwd(),
    "fixtures/synthetic-complete/runs/run-synthetic-001/inputs.json",
  );
  // Canonical Research chronology (issue #3 comment 5286246398): freeze and
  // activation clocks FOLLOW the evidence cutoff (2026-01-02T00:00:00Z).
  candidateInputsValue.frozen_at = "2026-01-02T00:10:00Z";
  candidateInputsValue.artifacts = [
    {
      artifact_id: "synthetic-baseline",
      repository: "Prometheus-Frameworks/TIBER-Synthetic",
      commit: COMMIT,
      path: "exports/synthetic-baseline.json",
      blob_digest: DIGEST_A,
      artifact_digest: governingManifest.digest,
      admissibility: "admitted",
      freshness: "current",
    },
  ];
  const candidateInputsPath = "runs/run-synthetic-001/inputs.json";
  writeJson(workspace, candidateInputsPath, candidateInputsValue);
  const candidateInputs: ArtifactRef = {
    artifact_type: "candidate_inputs",
    path: candidateInputsPath,
    digest: sha256CanonicalJson(candidateInputsValue),
    digest_mode: "tiber-canonical-json-v1",
  };
  refs.candidateInputs = candidateInputs;

  const authorityDecisionValue = readNormalizedJson<Record<string, unknown>>(
    process.cwd(),
    "fixtures/synthetic-complete/authority/decision.json",
  );
  authorityDecisionValue.approved_at = "2026-01-02T00:20:00Z";
  const authorityInputsRef = authorityDecisionValue.inputs_ref as Record<
    string,
    unknown
  >;
  authorityInputsRef.path = candidateInputs.path;
  authorityInputsRef.digest = candidateInputs.digest;
  const authorityDecisionPath = "authority/decision.json";
  writeJson(workspace, authorityDecisionPath, authorityDecisionValue);
  const authorityDecision: ArtifactRef = {
    artifact_type: "authority_decision",
    path: authorityDecisionPath,
    digest: sha256CanonicalJson(authorityDecisionValue),
    digest_mode: "tiber-canonical-json-v1",
  };
  refs.authorityDecision = authorityDecision;

  const networkPolicyValue = {
    schema_version: "research-network-policy/v1",
    policy_id: "adversarial-network-denied",
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
  const networkEnforcement = artifact(
    "networkEnforcement",
    "network_enforcement_receipt",
    "network-enforcement.json",
    {
      schema_version: "research-network-enforcement-receipt/v1",
      receipt_id: "adversarial-network-enforcement",
      candidate_run_id: RUN_ID,
      network_policy_ref: networkPolicy,
      effective_mode: "denied",
      effective_destinations: [],
      default_action: "deny",
      observed_at: "2026-01-02T00:30:00Z",
      valid_from: "2026-01-02T00:25:00Z",
      valid_until: "2026-01-02T12:00:00Z",
      observer: {
        observer_id: "synthetic-trusted-runner",
        role: "trusted_runner",
        trust_basis: "Synthetic fixture observation.",
      },
      observation_method: "network_enforcement_observation",
      observation_policy_ref: observationPolicy,
      enforcement_boundary: networkPolicyValue.enforcement_boundary,
      environment_identity: {
        environment_id: "adversarial-stage1",
        execution_surface: "Synthetic offline test runner",
        isolation_id: "synthetic-isolation",
        observed_capabilities_digest: sha256CanonicalJson(
          authorityDecisionValue.capabilities,
        ),
      },
      limitations: [
        "This receipt exercises protocol behavior and carries no live authority.",
      ],
    },
  );
  const costPolicy = artifact(
    "costPolicy",
    "cost_policy",
    "cost-policy.json",
    {
      schema_version: "research-cost-policy/v1",
      policy_id: "adversarial-cost-policy",
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
          { role: "executor", amount: 1 },
          { role: "reviewer", amount: 1 },
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

  const operatorDirectionText =
    "Activate the exact synthetic Stage 1 candidate.";
  const operatorApproval = artifact(
    "operatorApproval",
    "operator_direction_record",
    "operator-direction.json",
    {
      schema_version: "research-operator-direction-record/v1",
      authority_class: "activate_run",
      decision_ref: "synthetic:stage0-fixture-authorization",
      operator: "synthetic-fixture-operator",
      candidate_run_id: RUN_ID,
      operator_direction: operatorDirectionText,
      quote_digest: sha256Utf8(operatorDirectionText),
      quote_digest_mode: "tiber-raw-sha256-v1",
      recorded_at: "2026-01-02T00:20:00Z",
      approved_artifact_refs: [
        candidateJob,
        candidateInputs,
        authorityDecision,
        networkPolicy,
        costPolicy,
        observationPolicy,
      ],
      scope: ["Activate this exact synthetic job and inputs bundle."],
      exclusions: ["No promotion, publication, or downstream authority."],
      terminal_outcomes: ["stage1_activation_ready"],
    },
  );

  const availability = artifact(
    "availability",
    "external_source_availability_receipt",
    "external-source-availability.json",
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
      metadata_digest: sha256CanonicalJson(sourceMetadata),
      claimed_available_at: "2026-01-01T13:00:00Z",
      cutoff_at: "2026-01-02T00:00:00Z",
      evidence_ref: sourceMetadataRef,
      observation_method: "operator_provided_packet",
      observed_at: "2026-01-02T00:30:00Z",
      observer: {
        observer_id: "synthetic-trusted-runner",
        role: "trusted_runner",
        trust_basis: "Synthetic fixture observation.",
      },
      trust_boundary: {
        boundary_id: "synthetic-runner",
        boundary_type: "runner_observation",
        policy_ref: observationPolicy,
      },
    },
  );
  const provenance = artifact(
    "provenance",
    "governed_artifact_provenance_receipt",
    "governed-provenance.json",
    {
      schema_version: "research-governed-artifact-provenance-receipt/v1",
      receipt_id: "adversarial-provenance",
      candidate_run_id: RUN_ID,
      artifact_id: "synthetic-baseline",
      repository: "Prometheus-Frameworks/TIBER-Synthetic",
      commit: COMMIT,
      path: "exports/synthetic-baseline.json",
      blob_digest: DIGEST_A,
      artifact_digest: governingManifest.digest,
      observed_at: "2026-01-02T00:25:00Z",
      effective_at: "2026-01-01T13:00:00Z",
      verified_at: "2026-01-02T00:26:00Z",
      cutoff_at: "2026-01-02T00:00:00Z",
      governing_authority_ref: authorityDecision,
      governing_manifest_ref: governingManifest,
      verifier: {
        verifier_id: "synthetic-trusted-runner",
        role: "trusted_runner",
        trust_basis: "Synthetic fixture verification.",
      },
      verification_method: "repository_blob_verification",
      trust_boundary: {
        boundary_id: "synthetic-governed-repository",
        boundary_type: "governed_repository",
        policy_ref: observationPolicy,
      },
      freshness: {
        state: "current",
        as_of: "2026-01-02T00:26:00Z",
        policy_ref: freshnessPolicy,
        rationale: "Current for the synthetic cutoff.",
      },
    },
  );

  const manifest: Record<string, unknown> = {
    schema_version: "research-stage1-preflight/v1",
    preflight_id: "adversarial-stage1-preflight",
    candidate_run_id: RUN_ID,
    prepared_at: "2026-01-02T01:00:00Z",
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
      quote_digest: sha256Utf8(operatorDirectionText),
      quote_digest_mode: "tiber-raw-sha256-v1",
      quote_observed_at: "2026-01-02T00:20:00Z",
      operator: "synthetic-fixture-operator",
    },
    gate_artifacts: {
      external_source_availability_receipt_refs: [availability],
      governed_artifact_provenance_receipt_refs: [provenance],
      network_policy_ref: networkPolicy,
      network_enforcement_receipt_ref: networkEnforcement,
      cost_policy_ref: costPolicy,
      trusted_usage_receipt_refs: [],
    },
    candidate_artifact_refs: [
      candidateInputs,
      candidateJob,
      authorityDecision,
      contractInventory,
      egressPolicy,
      freshnessPolicy,
      governingManifest,
      observationPolicy,
      operatorApproval,
      rateCard,
    ],
    requirements: [
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
        description: "The exact frozen synthetic source is available.",
        status: "satisfied",
        evidence_refs: [availability],
      },
      {
        requirement_id: "governed-artifact-provenance",
        description: "Governed artifact provenance is pinned.",
        status: "satisfied",
        evidence_refs: [provenance],
      },
      {
        requirement_id: "network-enforcement",
        description: "The denied network policy is observed.",
        status: "satisfied",
        evidence_refs: [networkEnforcement],
      },
      {
        requirement_id: "operator-activation",
        description: "Exact operator activation authority is bound.",
        status: "satisfied",
        evidence_refs: [operatorApproval],
      },
    ],
    unresolved_inputs: [],
    status: "ready_for_activation",
    activation_ready: true,
  };
  writeJson(workspace, MANIFEST, manifest);
  return { workspace, manifest, refs };
}

function mutateArtifact(
  built: BuiltPreflight,
  refKey: string,
  operation: (value: Record<string, unknown>) => void,
): void {
  const ref = built.refs[refKey];
  assert.ok(ref, `missing artifact ref ${refKey}`);
  const value = readNormalizedJson<Record<string, unknown>>(
    built.workspace,
    ref.path,
  );
  operation(value);
  writeJson(built.workspace, ref.path, value);
  cascadeRefDigest(
    built,
    ref.path,
    sha256CanonicalJson(value),
  );
  writeManifest(built);
}

function mutateCandidateJob(
  built: BuiltPreflight,
  operation: (text: string) => string,
): void {
  const ref = built.refs.candidateJob;
  assert.ok(ref);
  const absolutePath = join(built.workspace, ref.path);
  const current = readFileSync(absolutePath, "utf8");
  const next = operation(current);
  assert.notEqual(next, current, "candidate job mutation had no effect");
  writeFileSync(absolutePath, next, "utf8");
  cascadeRefDigest(
    built,
    ref.path,
    sha256Raw(new TextEncoder().encode(next)),
  );
  writeManifest(built);
}

function mutateSourceMetadata(
  built: BuiltPreflight,
  operation: (value: Record<string, unknown>) => void,
): void {
  const metadataRef = built.refs.sourceMetadata;
  const inputsRef = built.refs.candidateInputs;
  const availabilityRef = built.refs.availability;
  assert.ok(metadataRef);
  assert.ok(inputsRef);
  assert.ok(availabilityRef);

  const metadata = readNormalizedJson<Record<string, unknown>>(
    built.workspace,
    metadataRef.path,
  );
  operation(metadata);
  writeJson(built.workspace, metadataRef.path, metadata);
  const metadataDigest = sha256CanonicalJson(metadata);
  cascadeRefDigest(built, metadataRef.path, metadataDigest);

  const inputs = readNormalizedJson<Record<string, unknown>>(
    built.workspace,
    inputsRef.path,
  );
  const sources = inputs.sources as Array<Record<string, unknown>>;
  const source = sources[0];
  assert.ok(source);
  source.metadata_digest = metadataDigest;
  writeJson(built.workspace, inputsRef.path, inputs);
  cascadeRefDigest(
    built,
    inputsRef.path,
    sha256CanonicalJson(inputs),
  );

  const availability = readNormalizedJson<Record<string, unknown>>(
    built.workspace,
    availabilityRef.path,
  );
  availability.metadata_digest = metadataDigest;
  writeJson(built.workspace, availabilityRef.path, availability);
  cascadeRefDigest(
    built,
    availabilityRef.path,
    sha256CanonicalJson(availability),
  );
  writeManifest(built);
}

function addUsageReceipt(
  built: BuiltPreflight,
  receiptId: string,
  actorSessionRef: string,
  previousReceiptDigest: string | null,
): void {
  const costPolicy = built.refs.costPolicy;
  const observationPolicy = built.refs.observationPolicy;
  const rateCard = built.refs.rateCard;
  assert.ok(costPolicy);
  assert.ok(observationPolicy);
  assert.ok(rateCard);
  const value = {
    schema_version: "research-trusted-usage-receipt/v1",
    receipt_id: receiptId,
    candidate_run_id: RUN_ID,
    attempt_id: "attempt-1",
    role: "executor",
    actor_session_ref: actorSessionRef,
    invocation_id: `invocation-${receiptId}`,
    provider: "synthetic-provider",
    model: "synthetic-model",
    usage_started_at: "2026-01-02T00:40:00Z",
    usage_ended_at: "2026-01-02T00:45:00Z",
    observed_at: "2026-01-02T00:50:00Z",
    provider_native_usage: [
      { unit: "tiber_actor_session_v1", quantity: 1 },
    ],
    normalized_cost: { unit: "tiber_actor_session_v1", amount: 1 },
    observer: {
      observer_id: "synthetic-trusted-runner",
      role: "trusted_runner",
      trust_basis: "Synthetic fixture observation.",
    },
    observation_method: "provider_usage_observation",
    trust_boundary: {
      boundary_id: "synthetic-runner",
      boundary_type: "runner_observation",
      policy_ref: observationPolicy,
    },
    rate_card_digest: rateCard.digest,
    cost_policy_ref: costPolicy,
    previous_receipt_digest: previousReceiptDigest,
  };
  const key =
    previousReceiptDigest === null ? "usageExecutor1" : "usageExecutor2";
  const path = `${PACKAGE}/${receiptId}.json`;
  writeJson(built.workspace, path, value);
  const ref: ArtifactRef = {
    artifact_type: "trusted_usage_receipt",
    path,
    digest: sha256CanonicalJson(value),
    digest_mode: "tiber-canonical-json-v1",
  };
  built.refs[key] = ref;
  const gateArtifacts = built.manifest.gate_artifacts as Record<
    string,
    unknown
  >;
  (
    gateArtifacts.trusted_usage_receipt_refs as ArtifactRef[]
  ).push(ref);
}

function writeManifest(built: BuiltPreflight): void {
  writeJson(built.workspace, MANIFEST, built.manifest);
}

function cascadeRefDigest(
  built: BuiltPreflight,
  path: string,
  digest: string,
): void {
  replaceRefDigest(built.manifest, path, digest);
  for (const ref of Object.values(built.refs)) {
    if (ref.path === path) {
      ref.digest = digest;
    }
  }

  const visited = new Set<string>();
  for (const ref of Object.values(built.refs)) {
    if (
      ref.path === path ||
      ref.digest_mode !== "tiber-canonical-json-v1" ||
      visited.has(ref.path)
    ) {
      continue;
    }
    visited.add(ref.path);
    let value: Record<string, unknown>;
    try {
      value = readNormalizedJson<Record<string, unknown>>(
        built.workspace,
        ref.path,
      );
    } catch {
      continue;
    }
    if (!replaceRefDigest(value, path, digest)) {
      continue;
    }
    writeJson(built.workspace, ref.path, value);
    const nextDigest = sha256CanonicalJson(value);
    if (nextDigest !== ref.digest) {
      cascadeRefDigest(built, ref.path, nextDigest);
    }
  }
}

function replaceRefDigest(
  value: unknown,
  path: string,
  digest: string,
): boolean {
  let replaced = false;
  if (Array.isArray(value)) {
    for (const entry of value) {
      replaced = replaceRefDigest(entry, path, digest) || replaced;
    }
    return replaced;
  }
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.path === path && typeof candidate.digest === "string") {
    candidate.digest = digest;
    replaced = true;
  }
  for (const entry of Object.values(candidate)) {
    replaced = replaceRefDigest(entry, path, digest) || replaced;
  }
  return replaced;
}
