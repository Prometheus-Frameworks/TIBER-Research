import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  getGatewayPacket,
  getGatewayStatus,
  inspectGatewayIntake,
} from "../src/gateway.js";
import {
  renderGatewayIntakeMarkdown,
  renderGatewayPacketMarkdown,
  renderGatewayStatusMarkdown,
} from "../src/gatewayRenderer.js";

const SYNTHETIC = resolve("fixtures/synthetic-complete");
const SYNTHETIC_RUN = "run-synthetic-001";
const ATTEMPT = "attempt-001";

function readProposal(name = "example-minimal.json"): Record<string, any> {
  return JSON.parse(
    readFileSync(resolve("fixtures/agent-entry", name), "utf8"),
  ) as Record<string, any>;
}

test("default views redact obvious credential values without hiding ordinary terminology", () => {
  const cases = [
    ["Use api_key=sk-proj-EXAMPLESECRET123 for this lookup.", "EXAMPLESECRET123"],
    ["OPENAI_API_KEY=EXAMPLEGENERICCREDENTIAL123", "EXAMPLEGENERICCREDENTIAL123"],
    ["AWS_SECRET_ACCESS_KEY=EXAMPLEGENERICCREDENTIAL456", "EXAMPLEGENERICCREDENTIAL456"],
    ["GITHUB_TOKEN=EXAMPLEGENERICCREDENTIAL789", "EXAMPLEGENERICCREDENTIAL789"],
    ["client_secret=THISISANOBVIOUSCLIENTSECRET12345", "THISISANOBVIOUSCLIENTSECRET12345"],
    ["sk-ant-api03-EXAMPLEANTHROPICCREDENTIAL12345", "EXAMPLEANTHROPICCREDENTIAL12345"],
    ["github_pat_EXAMPLEGITHUBCREDENTIAL123456789", "EXAMPLEGITHUBCREDENTIAL123456789"],
    ["STRIPE_SECRET_KEY=sk_" + "live_EXAMPLE12345678901234567890", "EXAMPLE12345678901234567890"],
    ["SLACK_BOT_TOKEN=xoxb-" + "123456789012-123456789012-EXAMPLETOKENVALUE", "EXAMPLETOKENVALUE"],
    ["HF_TOKEN=hf_EXAMPLE12345678901234567890", "EXAMPLE12345678901234567890"],
    ["GITLAB_TOKEN=glpat-EXAMPLE123456789012345", "EXAMPLE123456789012345"],
    ["NPM_TOKEN=npm_EXAMPLE12345678901234567890", "EXAMPLE12345678901234567890"],
    ["Slack token xoxb-" + "123456789012-123456789012-abcdefghijklmnopqrstuvwx", "abcdefghijklmnopqrstuvwx"],
    ["Contact joe@example.com", "joe@example.com"],
    ["eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.EXAMPLEJWTsignature123", "EXAMPLEJWTsignature123"],
    ["https://joe:EXAMPLEPASSWORD123@example.com/private", "EXAMPLEPASSWORD123"],
    ["-----BEGIN PRIVATE KEY-----", "BEGIN PRIVATE KEY"],
  ] as const;

  for (const [sensitive, exposedFragment] of cases) {
    const proposal = readProposal();
    proposal.original_take.received_text = sensitive;
    proposal.interpretation.summary = sensitive;
    proposal.nodes[0].statement = sensitive;
    const intake = inspectGatewayIntake(proposal);
    assert.equal(intake.valid, true, JSON.stringify(intake.validation_errors));

    const status = structuredClone(
      getGatewayStatus(SYNTHETIC, SYNTHETIC_RUN, ATTEMPT),
    );
    status.open_evidence_gaps = [sensitive];

    const packet = structuredClone(
      getGatewayPacket(SYNTHETIC, SYNTHETIC_RUN, ATTEMPT),
    );
    assert.notEqual(packet.body, null);
    if (packet.body !== null) {
      packet.body.packet.title = sensitive;
    }

    for (const view of [
      renderGatewayIntakeMarkdown(intake),
      renderGatewayStatusMarkdown(status),
      renderGatewayPacketMarkdown(packet),
    ]) {
      assert.equal(view.includes(exposedFragment), false, exposedFragment);
      assert.match(view, /private or credential material redacted/iu);
    }
  }

  const ordinaryProposal = readProposal();
  const ordinary = "Discuss email delivery and user ID terminology without supplying either value.";
  ordinaryProposal.original_take.received_text = ordinary;
  ordinaryProposal.interpretation.summary = ordinary;
  ordinaryProposal.nodes[0].statement = ordinary;
  const ordinaryView = renderGatewayIntakeMarkdown(
    inspectGatewayIntake(ordinaryProposal),
  );
  assert.match(ordinaryView, /Discuss email delivery and user ID terminology/u);
  assert.doesNotMatch(ordinaryView, /private or credential material redacted/iu);
});

test("default Markdown neutralizes entities and tilde fences", () => {
  const proposal = readProposal();
  proposal.original_take.received_text = [
    "Entity control: &#x1B;[2J",
    "Entity path: &#47;workspace&#47;private&#47;run.json",
    "~~~forged-boundary",
    "# Forged authority",
    "~~~",
  ].join("\n");
  proposal.interpretation.summary =
    "actor&#45;orchestrator-999 is encoded; actor-orchestrator-999 is direct.";
  proposal.nodes[0].statement = proposal.original_take.received_text;

  const report = inspectGatewayIntake(proposal);
  assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
  const view = renderGatewayIntakeMarkdown(report);

  assert.match(view, /&amp;#x1B;/u);
  assert.match(view, /&amp;#47;workspace&amp;#47;private/u);
  assert.doesNotMatch(view, /&#x1B;/u);
  assert.doesNotMatch(view, /(?:^|\n)[ \t]{0,3}~{3}/u);
  assert.match(view, /\\~~~forged-boundary/u);
  assert.match(view, /actor&amp;#45;orchestrator-999/u);
  assert.doesNotMatch(view, /actor-orchestrator-999/iu);
});

test("default Markdown neutralizes setext headings and hyphen thematic breaks", () => {
  const proposal = readProposal();
  proposal.original_take.received_text = [
    "Untrusted title",
    "===",
    "---",
  ].join("\n");
  proposal.interpretation.summary = [
    "Untrusted summary",
    "-- -",
    "- - -",
  ].join("\n");
  proposal.nodes[0].statement = proposal.original_take.received_text;

  const report = inspectGatewayIntake(proposal);
  assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
  const view = renderGatewayIntakeMarkdown(report);

  for (const escaped of ["\\===", "\\---", "\\-- -", "\\- - -"]) {
    assert.ok(view.includes(`<br>\n${escaped}`), `expected ${escaped}`);
  }
  assert.doesNotMatch(
    view,
    /(?:^|\n)[ \t]{0,3}(?:=+|-+|(?:-[ \t]*){3,})[ \t]*(?:\n|$)/u,
  );
});

test("neutralized tabs do not trigger setext punctuation escapes", () => {
  const proposal = readProposal();
  proposal.original_take.received_text = ["\t===", "\t---"].join("\n");
  proposal.nodes[0].statement = proposal.original_take.received_text;

  const report = inspectGatewayIntake(proposal);
  assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
  const view = renderGatewayIntakeMarkdown(report);

  const tabMarker = "\\[control character removed\\]";
  for (const punctuation of ["===", "---"]) {
    assert.ok(view.includes(`${tabMarker}${punctuation}`), `expected ${punctuation}`);
    assert.ok(
      !view.includes(`${tabMarker}\\${punctuation}`),
      `did not expect an escape before ${punctuation}`,
    );
  }
});

test("default views redact whole fields containing colon-prefixed, UNC, and spaced absolute paths", () => {
  for (const [sensitive, exposedFragment] of [
    ["Path:/workspace/private/run.json", "workspace/private/run.json"],
    ["//server/share/private/run.json", "server/share/private/run.json"],
    ["/Users/Joe Doe/private/run.json", "Joe Doe/private/run.json"],
  ] as const) {
    const proposal = readProposal();
    proposal.original_take.received_text = sensitive;
    proposal.interpretation.summary = sensitive;
    proposal.nodes[0].statement = sensitive;
    const report = inspectGatewayIntake(proposal);
    assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
    const view = renderGatewayIntakeMarkdown(report);
    assert.equal(view.includes(exposedFragment), false);
    assert.match(view, /absolute path redacted/iu);
  }
});

test("default views redact common non-Node stack-trace forms", () => {
  for (const [sensitive, exposedFragment] of [
    ["at com.example.Secret.run(App.java:42)", "com.example.Secret"],
    [
      'Traceback (most recent call last):\n  File "app.py", line 42, in run',
      "app.py",
    ],
  ] as const) {
    const proposal = readProposal();
    proposal.original_take.received_text = sensitive;
    proposal.interpretation.summary = sensitive;
    proposal.nodes[0].statement = sensitive;
    const report = inspectGatewayIntake(proposal);
    assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
    const view = renderGatewayIntakeMarkdown(report);
    assert.equal(view.includes(exposedFragment), false);
    assert.match(view, /stack trace redacted/iu);
  }
});

test("actor-shaped identifiers remain distinct while recognized session forms are redacted", () => {
  const proposal = readProposal("example-ragged.json");
  const text =
    "actor-relocation affects actor-lateness; actor-reviewer-007 and actor-intruder-001 recorded it; actor-reviewership, actor-reviewer-bias, and actor-sessionization are domain terms.";
  proposal.original_take.received_text = text;
  proposal.interpretation.summary = text;
  proposal.nodes[0].statement = text;
  const replacements = new Map([
    ["n-lateness", "actor-lateness-002"],
    ["n-relocation", "actor-relocation-001"],
    ["n-timetable", "actor-timetable-003"],
  ]);
  for (const node of proposal.nodes) {
    node.node_id = replacements.get(node.node_id) ?? node.node_id;
  }
  for (const edge of proposal.edges) {
    edge.from_node = replacements.get(edge.from_node) ?? edge.from_node;
    edge.to_node = replacements.get(edge.to_node) ?? edge.to_node;
  }
  for (const path of proposal.alternative_paths) {
    path.node_refs = path.node_refs.map(
      (ref: string) => replacements.get(ref) ?? ref,
    );
  }
  for (const assumption of proposal.unsupported_assumptions) {
    assumption.attached_to = assumption.attached_to.map(
      (ref: string) => replacements.get(ref) ?? ref,
    );
  }
  for (const witness of proposal.missing_witnesses) {
    witness.would_resolve = witness.would_resolve.map(
      (ref: string) => replacements.get(ref) ?? ref,
    );
  }
  proposal.subjects[0].kind = "actor-domain-004";

  const report = inspectGatewayIntake(proposal);
  assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
  const view = renderGatewayIntakeMarkdown(report);

  assert.doesNotMatch(view, /actor-relocation-001/u);
  assert.doesNotMatch(view, /actor-lateness-002/u);
  assert.doesNotMatch(view, /actor-domain-004/u);
  assert.match(
    view,
    /`Element 2 \(actor-shaped identifier redacted\)` → `Element 1 \(actor-shaped identifier redacted\)`/u,
  );
  assert.match(
    view,
    /`Subject kind 1 \(actor-shaped identifier redacted\)`/u,
  );
  assert.doesNotMatch(view, /actor-reviewer-007/u);
  assert.doesNotMatch(view, /actor-intruder-001/u);
  assert.match(view, /actor-reviewership/u);
  assert.match(view, /actor-reviewer-bias/u);
  assert.match(view, /actor-sessionization/u);
  assert.match(view, /actor session redacted/iu);
});

test("status prose redacts session forms while structured IDs remain distinct aliases", () => {
  const status = structuredClone(
    getGatewayStatus(SYNTHETIC, SYNTHETIC_RUN, ATTEMPT),
  );
  status.run_id = "actor-analysis-001";
  status.attempt_id = "actor-attempt-002";
  status.blockers = ["actor-intruder-003"];
  const view = renderGatewayStatusMarkdown(status);

  assert.doesNotMatch(
    view,
    /actor-analysis-001|actor-attempt-002|actor-intruder-003/iu,
  );
  assert.match(view, /Run: Run \(actor-shaped identifier redacted\)/u);
  assert.match(view, /Attempt: Attempt \(actor-shaped identifier redacted\)/u);
  assert.match(view, /actor session redacted/iu);
});

test("repository-native provider session forms redact without consuming domain terms", () => {
  const proposal = readProposal("example-ragged.json");
  const text =
    "claude-executor-lane and claude-session-01F3ADBnag2LBcyvEB4J7A9r recorded the executor-lane and session-analysis domain terms.";
  proposal.original_take.received_text = text;
  proposal.interpretation.summary = text;
  proposal.nodes[0].statement = text;
  const replacements = new Map([
    ["n-lateness", "claude-executor-lane"],
    ["n-relocation", "claude-session-lane"],
  ]);
  for (const node of proposal.nodes) {
    node.node_id = replacements.get(node.node_id) ?? node.node_id;
  }
  for (const edge of proposal.edges) {
    edge.from_node = replacements.get(edge.from_node) ?? edge.from_node;
    edge.to_node = replacements.get(edge.to_node) ?? edge.to_node;
  }
  for (const path of proposal.alternative_paths) {
    path.node_refs = path.node_refs.map(
      (ref: string) => replacements.get(ref) ?? ref,
    );
  }
  for (const assumption of proposal.unsupported_assumptions) {
    assumption.attached_to = assumption.attached_to.map(
      (ref: string) => replacements.get(ref) ?? ref,
    );
  }
  for (const witness of proposal.missing_witnesses) {
    witness.would_resolve = witness.would_resolve.map(
      (ref: string) => replacements.get(ref) ?? ref,
    );
  }

  const report = inspectGatewayIntake(proposal);
  assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
  const view = renderGatewayIntakeMarkdown(report);

  assert.doesNotMatch(
    view,
    /claude-executor-lane|claude-session-(?:lane|01F3ADBnag2LBcyvEB4J7A9r)/iu,
  );
  assert.match(
    view,
    /`Element 2 \(actor-shaped identifier redacted\)` → `Element 1 \(actor-shaped identifier redacted\)`/u,
  );
  assert.match(view, /executor-lane/u);
  assert.match(view, /session-analysis/u);
  assert.match(view, /actor session redacted/iu);

  const status = structuredClone(
    getGatewayStatus(SYNTHETIC, SYNTHETIC_RUN, ATTEMPT),
  );
  status.run_id = "claude-executor-lane";
  status.attempt_id = "claude-session-lane";
  status.blockers = [text];
  const statusView = renderGatewayStatusMarkdown(status);
  assert.doesNotMatch(
    statusView,
    /claude-executor-lane|claude-session-(?:lane|01F3ADBnag2LBcyvEB4J7A9r)/iu,
  );
  assert.match(
    statusView,
    /Run: Run \(actor-shaped identifier redacted\)/u,
  );
  assert.match(
    statusView,
    /Attempt: Attempt \(actor-shaped identifier redacted\)/u,
  );
  assert.match(statusView, /executor-lane/u);
  assert.match(statusView, /session-analysis/u);
});

test("inline code uses a longer fence and boundary padding", () => {
  const report = inspectGatewayIntake(readProposal());
  assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
  assert.notEqual(report.study_sheet, null);
  if (report.study_sheet === null) {
    return;
  }

  report.study_sheet.subjects = [
    {
      kind: "`[forged](https://evil.example)`",
      label_in_take: "Boundary example",
      resolution: null,
      subject_id: "s-boundary-example",
    },
  ];
  report.study_sheet.proposed_elements[0]?.evidence_refs.push(" padded-ref ");

  const view = renderGatewayIntakeMarkdown(report);
  assert.ok(view.includes("(`` `[forged](https://evil.example)` ``)"));
  assert.doesNotMatch(view, /\]\(https:\/\/evil\.example\)(?!`)/u);
  assert.ok(view.includes("`  padded-ref  `"));
});

test("provider assertions remain declarations rather than gateway-authenticated facts", () => {
  const report = inspectGatewayIntake(readProposal("example-ragged.json"));
  assert.equal(report.valid, true, JSON.stringify(report.validation_errors));
  assert.notEqual(report.study_sheet, null);
  if (report.study_sheet === null) {
    return;
  }
  report.study_sheet.received_take.byte_identity =
    "verified_against_operator_source";
  assert.ok(report.study_sheet.evidence_inventory.length > 0);
  const evidence = report.study_sheet.evidence_inventory[0];
  assert.notEqual(evidence, undefined);
  if (evidence !== undefined) {
    evidence.verified = true;
  }

  const view = renderGatewayIntakeMarkdown(report);
  assert.match(
    view,
    /Result: Agent\/provider-declared operator confirmation; unauthenticated by the gateway; not activated/iu,
  );
  assert.match(
    view,
    /Confirmation declaration: Agent\/provider-declared; unauthenticated by the gateway: Operator Confirmed/iu,
  );
  assert.match(
    view,
    /Confirmation scope: Whole Proposal \(agent\/provider-declared; unauthenticated by the gateway\)/iu,
  );
  assert.match(
    view,
    /Byte identity declaration: Agent\/provider-declared; unauthenticated by the gateway: verified against operator source/iu,
  );
  assert.match(
    view,
    /Operator stance: Asserted Belief \(agent\/provider-declared; unauthenticated by the gateway\)/iu,
  );
  assert.match(
    view,
    /Stance basis: Operator Stated \(agent\/provider-declared; unauthenticated by the gateway\)/iu,
  );
  assert.match(
    view,
    /Subject resolution declaration \(agent\/provider-declared; unauthenticated by the gateway\):/iu,
  );
  assert.match(
    view,
    /Evidence access declaration: Agent\/provider-declared; unauthenticated by the gateway: Operator Supplied Only/iu,
  );
  assert.match(
    view,
    /agent\/provider-declared retrieval verified; unauthenticated by the gateway; non-promotable/iu,
  );
  assert.match(
    view,
    /Trust boundary: Contract-consistent agent\/provider declarations only/iu,
  );
  assert.match(
    view,
    /Declaration-derived boundary \(not authorized\): Separate Job And Preflight Required/iu,
  );
});

test("invalid intake accepts no provider declaration as contract-consistent", () => {
  const view = renderGatewayIntakeMarkdown(inspectGatewayIntake({}));
  assert.match(view, /Result: Intake Invalid/u);
  assert.match(
    view,
    /Schema and cross-field consistency not established; no agent\/provider declaration accepted as contract-consistent/iu,
  );
  assert.match(view, /Confirmation declaration: Not accepted; intake is invalid/iu);
  assert.doesNotMatch(
    view,
    /Confirmation declaration: Agent\/provider-declared/iu,
  );
});
