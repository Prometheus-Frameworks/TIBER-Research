import assert from "node:assert/strict";
import {
  appendFileSync,
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { canonicalizeJson } from "../src/canonical.js";
import { sha256CanonicalJson, sha256Raw } from "../src/digest.js";
import { writeJson, writeUtf8 } from "../src/io.js";
import { finalizeLedgerEvent } from "../src/ledger.js";
import {
  renderPacketMarkdown,
  type ResearchPacket,
} from "../src/renderer.js";
import {
  validateAttempt,
  type ValidationReport,
} from "../src/validator.js";

const FIXTURE = resolve("fixtures/synthetic-complete");
const RUN_ID = "run-synthetic-001";
const ATTEMPT_ID = "attempt-001";
const AUTHORITY_DECISION = "authority/decision.json";
const RUN_ROOT = `runs/${RUN_ID}`;
const ATTEMPT_ROOT = `${RUN_ROOT}/attempts/${ATTEMPT_ID}`;
const ACTIVATION = `${RUN_ROOT}/activation.json`;
const INPUTS = `${RUN_ROOT}/inputs.json`;
const RUN_EVENTS = `${RUN_ROOT}/run-events.jsonl`;
const LEDGER = `${ATTEMPT_ROOT}/ledger.jsonl`;
const PACKET = `${ATTEMPT_ROOT}/packet.json`;
const PACKET_MD = `${ATTEMPT_ROOT}/packet.md`;
const SUBMISSION = `${ATTEMPT_ROOT}/submission.json`;
const REVIEW = `${ATTEMPT_ROOT}/review.json`;
const SEAL = `${ATTEMPT_ROOT}/seal.json`;

type JsonObject = Record<string, any>;

function withFixture<T>(action: (root: string) => T): T {
  const parent = mkdtempSync(join(tmpdir(), "tiber-research-extension-"));
  const root = join(parent, "workspace");
  cpSync(FIXTURE, root, { recursive: true });
  try {
    return action(root);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function absolute(root: string, relativePath: string): string {
  return join(root, ...relativePath.split("/"));
}

function json<T = JsonObject>(root: string, path: string): T {
  return JSON.parse(readFileSync(absolute(root, path), "utf8")) as T;
}

function mutateJson(
  root: string,
  path: string,
  mutate: (value: JsonObject) => void,
): void {
  const value = json(root, path);
  mutate(value);
  writeJson(root, path, value);
}

function mutatePacket(
  root: string,
  mutate: (packet: JsonObject) => void,
): void {
  const packet = json(root, PACKET);
  mutate(packet);
  writeJson(root, PACKET, packet);
  writeUtf8(
    root,
    PACKET_MD,
    renderPacketMarkdown(packet as ResearchPacket),
  );
}

function mutatePacketV01(
  root: string,
  mutate: (packet: JsonObject) => void,
): void {
  mutatePacket(root, (packet) => {
    packet.schema_version = "research-packet/v0.1";
    mutate(packet);
  });
}

function readJsonl(root: string, path: string): JsonObject[] {
  return readFileSync(absolute(root, path), "utf8")
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as JsonObject);
}

function writeRechainedJsonl(
  root: string,
  path: string,
  events: JsonObject[],
): void {
  let previous: string | null = null;
  const records = events.map((event, index) => {
    const { event_hash: _eventHash, ...projection } = event;
    if (
      projection.event_type === "checkpoint" &&
      projection.payload !== null &&
      typeof projection.payload === "object"
    ) {
      (projection.payload as JsonObject).ledger_head_before_checkpoint =
        previous;
    }
    const finalized = finalizeLedgerEvent({
      ...projection,
      sequence: index + 1,
      previous_event_hash: previous,
    });
    previous = finalized.event_hash;
    return canonicalizeJson(finalized);
  });
  writeFileSync(absolute(root, path), `${records.join("\n")}\n`, "utf8");
}

function appendJobYaml(root: string, yamlFragment: string): void {
  const jobPath = absolute(root, "job.yaml");
  const upgraded = readFileSync(jobPath, "utf8").replace(
    "schema_version: research-job/v0\n",
    "schema_version: research-job/v0.1\n",
  );
  writeFileSync(jobPath, upgraded + yamlFragment, "utf8");
  refreshFrozenJobAuthorization(root);
}

function refreshFrozenJobAuthorization(root: string): void {
  const jobDigest = sha256Raw(readFileSync(absolute(root, "job.yaml")));
  mutateJson(root, INPUTS, (inputs) => {
    inputs.job_ref.digest = jobDigest;
  });
  const inputs = json(root, INPUTS);
  mutateJson(root, AUTHORITY_DECISION, (decision) => {
    decision.inputs_ref.digest = sha256CanonicalJson(inputs);
    decision.job_ref.digest = jobDigest;
  });
  const authorityDecision = json(root, AUTHORITY_DECISION);
  mutateJson(root, ACTIVATION, (activation) => {
    activation.inputs_ref.digest = sha256CanonicalJson(inputs);
    activation.job_ref.digest = jobDigest;
    activation.ops_decision_ref.digest =
      sha256CanonicalJson(authorityDecision);
  });
}

function refreshTerminalBindings(root: string): void {
  mutateJson(root, SUBMISSION, (submission) => {
    for (const artifact of submission.artifacts as JsonObject[]) {
      artifact.digest =
        artifact.digest_mode === "tiber-canonical-json-v1"
          ? sha256CanonicalJson(json(root, artifact.path as string))
          : sha256Raw(readFileSync(absolute(root, artifact.path as string)));
    }
    for (const source of submission.sources as JsonObject[]) {
      for (const artifact of [source.metadata, source.content]) {
        if (artifact === null) {
          continue;
        }
        artifact.digest =
          artifact.digest_mode === "tiber-canonical-json-v1"
            ? sha256CanonicalJson(json(root, artifact.path as string))
            : sha256Raw(
                readFileSync(absolute(root, artifact.path as string)),
              );
      }
    }
    const ledger = readJsonl(root, LEDGER);
    const last = ledger[ledger.length - 1];
    assert.ok(last);
    submission.ledger_head = {
      event_count: ledger.length,
      event_hash: last.event_hash,
      event_id: last.event_id,
    };
  });
  const submission = json(root, SUBMISSION);

  mutateJson(root, REVIEW, (value) => {
    value.submission_ref.digest = sha256CanonicalJson(submission);
  });
  const review = json(root, REVIEW);

  mutateJson(root, SEAL, (seal) => {
    seal.submission_ref.digest = sha256CanonicalJson(submission);
    seal.terminal_state.process_terminal = json(root, PACKET).process_terminal;
    seal.review_ref.digest = sha256CanonicalJson(review);
    seal.terminal_state.review_verdict = review.overall_verdict;
  });
  const seal = json(root, SEAL);

  const oldEvents = readJsonl(root, RUN_EVENTS);
  const activationEvent = structuredClone(
    oldEvents.find((event) => event.event_type === "activation"),
  );
  const attemptStart = structuredClone(
    oldEvents.find(
      (event) =>
        event.event_type === "attempt_started" &&
        event.attempt_id === ATTEMPT_ID,
    ),
  );
  const submitted = structuredClone(
    oldEvents.find(
      (event) =>
        event.event_type === "attempt_submitted" &&
        event.attempt_id === ATTEMPT_ID,
    ),
  );
  const reviewed = structuredClone(
    oldEvents.find(
      (event) =>
        event.event_type === "review_returned" &&
        event.attempt_id === ATTEMPT_ID,
    ),
  );
  const closed = structuredClone(
    oldEvents.find(
      (event) =>
        event.event_type === "run_closed" &&
        event.attempt_id === ATTEMPT_ID,
    ),
  );
  assert.ok(activationEvent);
  assert.ok(attemptStart);
  assert.ok(submitted);
  assert.ok(reviewed);
  assert.ok(closed);
  activationEvent.payload.artifact_digest = sha256CanonicalJson(
    json(root, ACTIVATION),
  );
  submitted.payload.artifact_digest = sha256CanonicalJson(submission);
  submitted.recorded_at = submission.submitted_at;
  reviewed.payload.artifact_digest = sha256CanonicalJson(review);
  reviewed.recorded_at = review.reviewed_at;
  closed.payload.artifact_digest = sha256CanonicalJson(seal);
  closed.payload.terminal_state = seal.terminal_state.process_terminal;
  closed.recorded_at = seal.sealed_at;
  writeRechainedJsonl(root, RUN_EVENTS, [
    activationEvent,
    attemptStart,
    submitted,
    reviewed,
    closed,
  ]);
}

function assertValid(root: string): ValidationReport {
  const report = validateAttempt(root, RUN_ID, ATTEMPT_ID, {
    requireEndToEnd: true,
  });
  assert.equal(report.valid, true, JSON.stringify(report.errors, null, 2));
  return report;
}

function assertInvalid(
  root: string,
  expectedCodes: string | string[],
): ValidationReport {
  const report = validateAttempt(root, RUN_ID, ATTEMPT_ID);
  assert.equal(report.valid, false, JSON.stringify(report, null, 2));
  for (const code of Array.isArray(expectedCodes)
    ? expectedCodes
    : [expectedCodes]) {
    assert.ok(
      report.errors.some((entry) => entry.code === code),
      `expected ${code}; received ${report.errors
        .map((entry) => entry.code)
        .join(", ")}`,
    );
  }
  return report;
}

const JOB_BRANCHES_YAML = `response_branches:
  - branch_id: branch-holds
    label: Replacement holds
    description: The invented replacement device performs without added synthetic help.
    expected_signals:
      - Stable synthetic pass rate across retained cycles.
`;

const JOB_DECISIONS_YAML = `terminal_decisions:
  - decision: synthetic_pilot_complete
    class: complete
  - decision: synthetic_pilot_requires_data_followup
    class: requires_data_followup
  - decision: synthetic_pilot_blocked
    class: blocked
`;

function packetBranch(overrides: JsonObject = {}): JsonObject {
  return {
    assessment: "supported",
    branch_id: "branch-holds",
    claim_refs: ["claim-threshold-001"],
    context_notes: [],
    counterevidence_refs: [],
    description:
      "The invented replacement device performs without added synthetic help.",
    evidence_refs: ["event-002-observation"],
    expected_signals: ["Stable synthetic pass rate across retained cycles."],
    label: "Replacement holds",
    limitations: [],
    ...overrides,
  };
}

function packetCausalPath(overrides: JsonObject = {}): JsonObject {
  return {
    description:
      "Invented mechanism from the synthetic bench change to the observed pass count.",
    edges: [
      {
        claim_refs: ["claim-threshold-001"],
        counterevidence_refs: [],
        edge_id: "edge-bench-to-pass",
        evidence_refs: ["event-002-observation"],
        falsifiers: [
          "A retained fixture row with outcome fail on the affected cycle would falsify this edge.",
        ],
        from_node: "node-bench-change",
        mechanism:
          "The invented bench change alters the fictional pass outcome of Device Lantern.",
        to_node: "node-pass-count",
        uncertainty:
          "The invented sample contains only four retained cycles.",
      },
    ],
    nodes: [
      {
        label: "Invented bench change",
        node_id: "node-bench-change",
        subject_refs: ["device-lantern"],
      },
      {
        label: "Observed synthetic pass count",
        node_id: "node-pass-count",
        subject_refs: [],
      },
    ],
    path_id: "path-bench-mechanism",
    ...overrides,
  };
}

function unresolvedGap(
  unresolvedId: string,
  kind: string,
  overrides: JsonObject = {},
): JsonObject {
  return {
    blocked_input_refs: [],
    kind,
    related_claim_refs: [],
    related_question_refs: ["question-threshold"],
    statement:
      "Additional invented cycles are unavailable in the frozen fixture.",
    unresolved_id: unresolvedId,
    ...overrides,
  };
}

function packetRfi(overrides: JsonObject = {}): JsonObject {
  return {
    owner_repository: "Prometheus-Frameworks/TIBER-Data",
    related_issue: null,
    requested_evidence:
      "A separately authorized synthetic fixture with more invented cycles.",
    unresolved_refs: ["unresolved-more-cycles"],
    ...overrides,
  };
}

test("event-shock extension round trip", async (t) => {
  await t.test(
    "an extended v0.1 packet with branches, causal paths, falsifiers, a bound RFI, and a terminal decision validates end to end",
    () => {
      withFixture((root) => {
        appendJobYaml(root, JOB_BRANCHES_YAML + JOB_DECISIONS_YAML);
        mutatePacketV01(root, (packet) => {
          packet.terminal_decision = "synthetic_pilot_complete";
          packet.response_branches = [packetBranch()];
          packet.causal_paths = [packetCausalPath()];
          packet.claims[0].falsifiers = [
            "A retained fixture row with outcome fail would falsify the threshold claim.",
          ];
          packet.unresolved = [
            unresolvedGap("unresolved-more-cycles", "missing_evidence"),
          ];
          packet.followups[0].rfi = packetRfi();
        });
        refreshTerminalBindings(root);
        assertValid(root);
      });
    },
  );

  await t.test(
    "a forecast-class claim requires explicit falsifiers",
    () => {
      withFixture((root) => {
        mutatePacketV01(root, (packet) => {
          packet.claims[0].epistemic_class = "forecast";
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "packet.claim_epistemic_mismatch");

        mutatePacket(root, (packet) => {
          packet.claims[0].falsifiers = [
            "A retained fixture row with outcome fail would falsify the forecast.",
          ];
        });
        refreshTerminalBindings(root);
        assertValid(root);
      });
    },
  );

  await t.test(
    "an out_of_scope claim is excluded from the question aggregate",
    () => {
      withFixture((root) => {
        mutatePacketV01(root, (packet) => {
          packet.claims[0].assessment = "out_of_scope";
          packet.questions[0].assessment = "insufficient";
        });
        refreshTerminalBindings(root);
        assertValid(root);
      });
    },
  );

  await t.test(
    "a mixed claim propagates through the conservative question aggregate",
    () => {
      withFixture((root) => {
        mutatePacketV01(root, (packet) => {
          packet.claims[0].assessment = "mixed";
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "packet.question_assessment_mismatch");

        mutatePacket(root, (packet) => {
          packet.questions[0].assessment = "mixed";
        });
        refreshTerminalBindings(root);
        assertValid(root);
      });
    },
  );
});

test("wire-identity versioning", async (t) => {
  await t.test(
    "extension packet fields are rejected under the v0 packet identity",
    () => {
      withFixture((root) => {
        mutatePacket(root, (packet) => {
          packet.claims[0].falsifiers = [
            "A retained fixture row with outcome fail would falsify the claim.",
          ];
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "schema.invalid");
      });
    },
  );

  await t.test(
    "extension enum members are rejected under the v0 packet identity",
    () => {
      withFixture((root) => {
        mutatePacket(root, (packet) => {
          packet.claims[0].assessment = "out_of_scope";
          packet.questions[0].assessment = "insufficient";
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "schema.invalid");
      });
    },
  );

  await t.test(
    "extension job fields are rejected under the v0 job identity",
    () => {
      withFixture((root) => {
        appendFileSync(
          absolute(root, "job.yaml"),
          JOB_DECISIONS_YAML,
          "utf8",
        );
        refreshFrozenJobAuthorization(root);
        refreshTerminalBindings(root);
        assertInvalid(root, "schema.invalid");
      });
    },
  );

  await t.test(
    "a frozen blocked-input owner is rejected under the v0 inputs identity",
    () => {
      withFixture((root) => {
        mutateJson(root, INPUTS, (inputs) => {
          inputs.blocked_inputs = [
            {
              input_id: "input-missing-cycles",
              owner_repository: "Prometheus-Frameworks/TIBER-Data",
              question_refs: ["question-threshold"],
              reason:
                "The additional synthetic cycles were never generated.",
              status: "unavailable",
            },
          ];
        });
        refreshFrozenJobAuthorization(root);
        refreshTerminalBindings(root);
        assertInvalid(root, "schema.invalid");
      });
    },
  );
});

test("terminal decision governance", async (t) => {
  await t.test("a packet may not emit an undeclared terminal decision", () => {
    withFixture((root) => {
      mutatePacketV01(root, (packet) => {
        packet.terminal_decision = "synthetic_pilot_complete";
      });
      refreshTerminalBindings(root);
      assertInvalid(root, "packet.terminal_decision_undeclared");
    });
  });

  await t.test(
    "a job that declares terminal decisions requires exactly one in the packet",
    () => {
      withFixture((root) => {
        appendJobYaml(root, JOB_DECISIONS_YAML);
        refreshTerminalBindings(root);
        assertInvalid(root, "packet.terminal_decision_missing");
      });
    },
  );

  await t.test("the emitted decision must be one of the declared tokens", () => {
    withFixture((root) => {
      appendJobYaml(root, JOB_DECISIONS_YAML);
      mutatePacketV01(root, (packet) => {
        packet.terminal_decision = "synthetic_pilot_unknown";
      });
      refreshTerminalBindings(root);
      assertInvalid(root, "packet.terminal_decision_not_permitted");
    });
  });

  await t.test(
    "a blocked-class decision cannot ride on a completed process terminal",
    () => {
      withFixture((root) => {
        appendJobYaml(root, JOB_DECISIONS_YAML);
        mutatePacketV01(root, (packet) => {
          packet.terminal_decision = "synthetic_pilot_blocked";
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "packet.terminal_decision_state");
      });
    },
  );

  await t.test(
    "a requires_data_followup decision must bind an evidence gap and a routed RFI",
    () => {
      withFixture((root) => {
        appendJobYaml(root, JOB_DECISIONS_YAML);
        mutatePacketV01(root, (packet) => {
          packet.terminal_decision =
            "synthetic_pilot_requires_data_followup";
        });
        refreshTerminalBindings(root);
        assertInvalid(root, [
          "packet.terminal_decision_gap_required",
          "packet.terminal_decision_rfi_required",
        ]);
      });
    },
  );

  await t.test(
    "an unrelated RFI does not satisfy a requires_data_followup decision",
    () => {
      withFixture((root) => {
        appendJobYaml(root, JOB_DECISIONS_YAML);
        mutatePacketV01(root, (packet) => {
          packet.terminal_decision =
            "synthetic_pilot_requires_data_followup";
          packet.unresolved = [
            unresolvedGap("unresolved-gap-a", "missing_evidence"),
            unresolvedGap("unresolved-note-b", "contradiction", {
              statement:
                "Two invented observations disagree about a synthetic label.",
            }),
          ];
          packet.followups[0].rfi = packetRfi({
            unresolved_refs: ["unresolved-note-b"],
          });
        });
        refreshTerminalBindings(root);
        assertInvalid(root, [
          "packet.rfi_unresolved_link",
          "packet.terminal_decision_rfi_required",
        ]);
      });
    },
  );

  await t.test(
    "a gap-bound requires_data_followup packet validates end to end",
    () => {
      withFixture((root) => {
        appendJobYaml(root, JOB_DECISIONS_YAML);
        mutatePacketV01(root, (packet) => {
          packet.terminal_decision =
            "synthetic_pilot_requires_data_followup";
          packet.unresolved = [
            unresolvedGap("unresolved-more-cycles", "missing_evidence"),
          ];
          packet.followups[0].rfi = packetRfi();
        });
        refreshTerminalBindings(root);
        assertValid(root);
      });
    },
  );
});

test("RFI routing governance", async (t) => {
  await t.test(
    "an RFI must bind a missing or blocked unresolved item",
    () => {
      withFixture((root) => {
        mutatePacketV01(root, (packet) => {
          packet.followups[0].rfi = packetRfi({
            unresolved_refs: ["unresolved-nonexistent"],
          });
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "packet.rfi_unresolved_link");
      });
    },
  );

  await t.test(
    "an RFI owner must match the frozen blocked-input owner",
    () => {
      withFixture((root) => {
        mutateJson(root, INPUTS, (inputs) => {
          inputs.schema_version = "research-inputs/v0.1";
          inputs.blocked_inputs = [
            {
              input_id: "input-missing-cycles",
              owner_repository: "Prometheus-Frameworks/TIBER-Data",
              question_refs: ["question-threshold"],
              reason:
                "The additional synthetic cycles were never generated.",
              status: "unavailable",
            },
          ];
        });
        refreshFrozenJobAuthorization(root);
        mutatePacketV01(root, (packet) => {
          packet.unresolved = [
            unresolvedGap("unresolved-missing-cycles", "blocked_input", {
              blocked_input_refs: ["input-missing-cycles"],
            }),
          ];
          packet.followups[0].rfi = packetRfi({
            owner_repository: "Prometheus-Frameworks/TIBER-Fantasy",
            unresolved_refs: ["unresolved-missing-cycles"],
          });
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "packet.rfi_owner_mismatch");
      });
    },
  );

  await t.test(
    "an RFI owner repository must be an owner/name reference",
    () => {
      withFixture((root) => {
        mutatePacketV01(root, (packet) => {
          packet.unresolved = [
            unresolvedGap("unresolved-more-cycles", "missing_evidence"),
          ];
          packet.followups[0].rfi = packetRfi({
            owner_repository: "not-a-repository",
          });
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "schema.invalid");
      });
    },
  );
});

test("response branch governance", async (t) => {
  await t.test(
    "a packet may not assess branches the job did not preregister",
    () => {
      withFixture((root) => {
        mutatePacketV01(root, (packet) => {
          packet.response_branches = [packetBranch()];
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "packet.response_branch_undeclared");
      });
    },
  );

  await t.test("every preregistered branch must be assessed", () => {
    withFixture((root) => {
      appendJobYaml(root, JOB_BRANCHES_YAML);
      refreshTerminalBindings(root);
      assertInvalid(root, "packet.response_branch_missing");
    });
  });

  await t.test(
    "an assessed branch must match its preregistration exactly",
    () => {
      withFixture((root) => {
        appendJobYaml(root, JOB_BRANCHES_YAML);
        mutatePacketV01(root, (packet) => {
          packet.response_branches = [
            packetBranch({ label: "Replacement mostly holds" }),
          ];
        });
        refreshTerminalBindings(root);
        assertInvalid(
          root,
          "packet.response_branch_preregistration_mismatch",
        );
      });
    },
  );

  await t.test(
    "a supported branch assessment must cite admitted evidence",
    () => {
      withFixture((root) => {
        appendJobYaml(root, JOB_BRANCHES_YAML);
        mutatePacketV01(root, (packet) => {
          packet.response_branches = [packetBranch({ evidence_refs: [] })];
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "packet.response_branch_evidence_required");
      });
    },
  );

  await t.test(
    "an insufficient branch assessment may stand without evidence",
    () => {
      withFixture((root) => {
        appendJobYaml(root, JOB_BRANCHES_YAML);
        mutatePacketV01(root, (packet) => {
          packet.response_branches = [
            packetBranch({
              assessment: "insufficient",
              claim_refs: [],
              evidence_refs: [],
            }),
          ];
        });
        refreshTerminalBindings(root);
        assertValid(root);
      });
    },
  );
});

test("causal path governance", async (t) => {
  await t.test("edge endpoints must resolve to declared nodes", () => {
    withFixture((root) => {
      mutatePacketV01(root, (packet) => {
        const causalPath = packetCausalPath();
        causalPath.edges[0].to_node = "node-undeclared";
        packet.causal_paths = [causalPath];
      });
      refreshTerminalBindings(root);
      assertInvalid(root, "packet.causal_edge_node_link");
    });
  });

  await t.test("a causal path must be acyclic", () => {
    withFixture((root) => {
      mutatePacketV01(root, (packet) => {
        const causalPath = packetCausalPath();
        causalPath.edges.push({
          ...structuredClone(causalPath.edges[0]),
          edge_id: "edge-pass-to-bench",
          from_node: "node-pass-count",
          to_node: "node-bench-change",
        });
        packet.causal_paths = [causalPath];
      });
      refreshTerminalBindings(root);
      assertInvalid(root, "packet.causal_path_cycle");
    });
  });

  await t.test(
    "edge evidence must resolve to admitted current observations",
    () => {
      withFixture((root) => {
        mutatePacketV01(root, (packet) => {
          const causalPath = packetCausalPath();
          causalPath.edges[0].evidence_refs = ["event-001-hypothesis"];
          packet.causal_paths = [causalPath];
        });
        refreshTerminalBindings(root);
        assertInvalid(root, "packet.causal_edge_evidence_link");
      });
    },
  );

  await t.test("node subjects must resolve to governed job subjects", () => {
    withFixture((root) => {
      mutatePacketV01(root, (packet) => {
        const causalPath = packetCausalPath();
        causalPath.nodes[0].subject_refs = ["subject-undeclared"];
        packet.causal_paths = [causalPath];
      });
      refreshTerminalBindings(root);
      assertInvalid(root, "packet.causal_node_subject_link");
    });
  });
});

test("declared terminal decision hygiene", async (t) => {
  await t.test("duplicate declared terminal decisions are rejected", () => {
    withFixture((root) => {
      appendJobYaml(
        root,
        `terminal_decisions:
  - decision: synthetic_pilot_complete
    class: complete
  - decision: synthetic_pilot_complete
    class: blocked
`,
      );
      mutatePacketV01(root, (packet) => {
        packet.terminal_decision = "synthetic_pilot_complete";
      });
      refreshTerminalBindings(root);
      assertInvalid(root, "job.duplicate_terminal_decision");
    });
  });
});
