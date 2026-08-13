# Tunsil absence shock v0 — preflight orientation (draft)

Status: **ORIENTATION ONLY — NOT A PREFLIGHT PACKAGE, NOT ACTIVATED**

Prepared 2026-08-13 for [TIBER-Research issue #3](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/3)
(Lane 1). This document orients the merged Research protocol against the
pilot definition and enumerates the **exact operator inputs still required**
to activate the bounded run. It authorizes nothing. The candidate job mapping
in [`candidate-job.draft.yaml`](candidate-job.draft.yaml) is a draft for
operator review — it is deliberately placed under `docs/` (not `preflight/`
or `runs/`) so no tooling can mistake it for an activation artifact.

## 1. What the protocol requires to activate a run

From the merged Stage 0/0.1 contracts (`schemas/v0/*`), the Stage 1 control
contracts (`schemas/v1/*`), and `src/preflight.ts` gates:

1. **`job.yaml`** (`research-job/v0.1`) — bounded question contract. The
   v0.1 extensions merged in PR #4 make issue #3 fully representable:
   preregistered `response_branches` (H1/H2/H3 frozen before evidence) and
   job-scoped `terminal_decisions` (the three `tunsil_absence_shock_v0_*`
   tokens, classed `complete` / `requires_data_followup` / `blocked`).
2. **Frozen `inputs.json`** (`research-inputs/v0.1`) — subjects with
   identities, pinned governed artifacts (commit + blob digests), admitted
   source receipts (each with the 8-field temporal block, rights disposition,
   retention mode), and `blocked_inputs` — which since PR #4 carry
   `owner_repository`, so every missing quantitative witness freezes with its
   owner attached.
3. **Authority decision + activation record** — a separate operator decision
   with `authority_class: "activate_run"` binding exact job/inputs digests,
   cutoff, budget, capability envelope, permitted branch, and write path. The
   existing Ops #54 direction record is `stage1_preflight_only` and cannot be
   reused.
4. **A Stage 1 preflight package** for this pilot (the
   `preflight/opportunity-clusters-2026-v0/` package is job-specific and not
   reusable): manifest + operator-direction record + subject identity map +
   source envelope + capability map + controls (network policy, egress
   policy, cost policy, rate card), every file hash-bound in the package
   inventory, `stage0_base` reproducing the compiled trust anchor
   (`8a8039ee…` / tree `582930f2…` — still valid; it pins Stage 0, not
   current main). `activation_ready: true` requires all seven requirement
   gates resolved (`candidate-inputs`, `candidate-job`, `cost-accounting`,
   `external-source-availability`, `governed-artifact-provenance`,
   `network-enforcement`, `operator-activation`) and a non-null network
   enforcement receipt even for a denied-network run.
5. **Mechanical prerequisite:** `package.json`'s `preflight:check` is
   hard-wired to the opportunity-clusters package; CI will silently ignore a
   new package until that script is extended. One-line change, but it is a
   code change and therefore needs explicit authorization.

## 2. What exists now (post-merge inventory, 2026-08-13)

| Prerequisite | State |
|---|---|
| Packet contract can express the pilot | ✅ v0.1 extensions merged (PR #4): W4 vocabulary, forecast class, causal paths, preregistered branches, terminal decisions, gap-bound owner-routed RFIs |
| Event recorded post-cutoff | ✅ five candidate ledger records on TIBER-Fantasy main (PR #322), explicitly pre-baseline |
| Upstream evidence boundaries documented | ✅ all four TIBER-Data readiness audits merged (#247 route/snap, #248 ADP, #249 player-state, #250 depth chart) — these are now **governed, pinnable artifacts** the frozen inputs can cite as evidence that the quantitative witnesses do not exist |
| Governed skill-subject identities | ✅ from the source-backed roster map: McLaurin `00-0035659`, Daniels `00-0039910`, White `00-0037256`, Croskey-Merritt `00-0040242`; context subjects Diggs `00-0031588`, McNichols `00-0033955`, Okonkwo `00-0037809` |
| OL identities | ❌ Tunsil and Coleman are **outside the governed skill-position population** — no governed GSIS binding exists; they require explicit **run-scoped identities** (permitted by the protocol; guessing is prohibited). The remaining line (Paul, Conerly Jr., Wylie) is modeled as **one composite line-configuration subject**, not individual subject identities (see §3.3) |
| Seed evidence admission | ❌ none of the nine issue #3 seed references is admitted; each needs a per-item operator admission decision (see §3.2) |
| Preflight package for this job | ❌ does not exist |
| Activation authority | ❌ does not exist |

## 3. Exact operator inputs required to activate

These are the decisions only the operator can make. Everything else
(authoring the package files, hash-binding, validation) is mechanical work
that can be executed once these are bound.

### 3.1 Cutoff

One exact `cutoff_at` instant. **Recommended default: a fresh cutoff bound
after the manual admission receipts are created** — admission first, then
cutoff, so every admitted source carries an honest `retrieved_at` /
`admissible_at` ≤ `cutoff_at` with no backdating. Sequencing: operator
directs the manual observations (§3.2) → receipts are written with their
true retrieval clocks → the operator binds `cutoff_at` at or after the last
`admissible_at` → freeze. Later medical/practice observations before that
instant become admissible; nothing after it may leak backward.

The issue-posting instant (`2026-08-12T22:08:51Z`) is viable **only if**
trustworthy pre-cutoff retrieval/availability receipts for the external
pages already exist and validate — they do not today. The issue text itself
being pre-cutoff does not make the seven external commanders.com pages
pre-cutoff: a page admitted after a cutoff cannot be made pre-cutoff merely
because its URL or a summary appeared in the issue, and retrieval clocks are
never backdated nor page state assumed immutable. The issue *artifact* can
be admitted against either cutoff; the *pages* cannot be admitted against
the earlier one.

### 3.2 Source admission decisions (per item, none inferred)

For each of the nine seed references, an explicit admit/exclude with
acquisition method, retention mode, reportability, and rights treatment:

- **Seven commanders.com articles** — first-party club pages on the NFL club
  platform, whose terms prohibit systematic retrieval (re-confirmed in the
  Lane 2 W3 audit). The compatible lane is
  `operator_provided_observation`: manual, per-instance retrieval at operator
  direction, retention `reference_only` or `excerpt` (recommendation:
  `excerpt` with immutable digest of the retained excerpt only, not page
  bytes), reportability `internal`. Each needs its 8-clock temporal block at
  admission (publication date as shown, retrieval instant, admissible-at ≤
  cutoff).
- **Two pff.com player profiles** — recommendation: **exclude**
  (`provider_or_license_blocked`; the 2026-03-24 PFF ToS prohibits scraping,
  redistribution, and ML/LLM-pipeline use). Their factual content (e.g.
  Coleman's 87-snap late-2025 LT sample) enters, if at all, only as an
  operator-attested secondary reference inside the issue text itself, scoped
  and flagged as unverifiable — or is dropped and the counterfactual reported
  as unresolved, which the issue already permits.
- **Governed TIBER artifacts** to pin in `inputs.artifacts` (no admission
  question, just exact commit/blob digests at freeze): the four merged
  readiness audits, the source-backed roster map, and the five TIBER-Fantasy
  ledger records.

### 3.3 Subject identity treatment

- Confirm the seven governed GSIS bindings above (re-resolved at freeze from
  pinned artifacts, not from this document).
- Approve the **subject grain for the line** (single model, applied
  consistently in job and inputs): **run-scoped individual identities for
  Tunsil and Coleman only** (name+team+position bound to the run, explicitly
  marked non-canonical), plus **one composite
  `was-oline-configuration` subject** for the surrounding line, inside whose
  label Paul, Conerly Jr., and Wylie appear as configuration facts — not as
  required individual subject identities. This matches the issue's bounded
  subject "Brandon Coleman and the immediate Washington offensive-line
  configuration" and the candidate job draft. An RFI routes to TIBER-Data
  for OL identity coverage regardless.
- Confirm the closed comparison population: the three context-only subjects,
  and nothing else (no roster expansion).

### 3.4 Research context and horizon

- Observation window (proposal: 2026-08-08 event through cutoff; camp/joint
  practice period only; zero regular-season observations exist).
- `time_horizon` wording and the `research_context` dimensions (team =
  Washington, season = 2026, phase = training camp/preseason).

### 3.5 Budget and cost

- `budgets`: wall-clock minutes, tool calls, evidence objects.
- Cost policy ceiling + unit and rate card, with explicit operator approval
  recorded (Stage 1 `cost-accounting` gate).

### 3.6 Branch and write path

- One bounded branch and one permitted write path in TIBER-Research for the
  run directory (`runs/<run-id>/…`). All other repositories read-only.

### 3.7 Reviewer boundary

- A named fresh-context independent reviewer for the packet (the Stage 1
  `independent-reviewer-binding` input; executor and reviewer must be
  different actors).

### 3.8 Network enforcement

- Proposed execution network: `denied` (consistent with Ops #54 and with
  manual pre-run source admission). Even so, `activation_ready` requires a
  **trusted denied-network enforcement receipt** — the operator must decide
  what attestation satisfies it (environment attestation at run start is the
  minimal candidate).

### 3.9 Retention and reportability

- Packet `reportability` (recommendation: `internal` — the issue prohibits
  publishing betting/lineup advice, and `public_safe` can be a later
  promotion decision).
- Retention mode defaults for the run (`excerpt`/`reference_only`).

### 3.10 The activation decision itself

- A separate operator decision record, `authority_class: "activate_run"`,
  quoting the operator's exact words, binding the exact completed job/inputs
  digests. Per protocol, none of §3.1–3.9 individually or collectively
  activates anything.

### 3.11 Mechanical authorizations (code, not judgment)

- Authoring the `preflight/tunsil-absence-shock-v0/` package files.
- Extending `preflight:check` in `package.json` to validate the new package.
- Creating the run directory skeleton at activation.

## 4. How the run stays honest about missing witnesses

Per the issue's hard boundaries and the operator directive: **no proxies.**
The quantitative witnesses that do not exist freeze as `blocked_inputs` with
`owner_repository`, and the packet's follow-ups route them as gap-bound RFIs
(the v0.1 validator now enforces the binding):

| Missing witness | Frozen as | Owner |
|---|---|---|
| Route participation / true routes (claims 4, 5) | `blocked_input`, status `unavailable` | `Prometheus-Frameworks/TIBER-Data` (per merged #247 audit) |
| Protection quality: pass-block attribution, pressure, chips, double-teams (claims 2, 3, 4) | `blocked_input`, status `unavailable` | `Prometheus-Frameworks/TIBER-Data` (the issue's proposed "[D0] Tunsil golden trace" successor) |
| Current governed injury/roster/availability state (claim 1's quantitative side) | `blocked_input`, status `unavailable` | `Prometheus-Frameworks/TIBER-Data` (per merged #249 audit; Lane 2 tracks the durable witness) |
| OL canonical identity | `blocked_input`, status `identity_unresolved` | `Prometheus-Frameworks/TIBER-Data` |
| RB pass-protection role interpretation (claim 4's downstream home) | follow-up RFI | `Prometheus-Frameworks/Role-and-opportunity-model` (#23) |

Expected honest shape of the packet given today's evidence: claim 1
plausibly assessable from admitted operator observations; claims 2–5 largely
`insufficient` with precisely-identified missing witnesses; per-branch
H1/H2/H3 assessments mostly `insufficient`; terminal decision
`tunsil_absence_shock_v0_requires_data_followup` — which the issue itself
names as a successful outcome if the RFIs are exact. No football answer is
forced.

## 5. Proposed sequence after operator input

1. Operator binds §3.1–3.9 (a single checklist reply is sufficient to start).
2. Mechanical: author the preflight package + candidate job/inputs; validate
   offline; extend `preflight:check`; stop at a draft PR with
   `activation_ready` honestly reflecting any still-unresolved gates.
3. Independent fresh-context review of the package.
4. Operator issues the separate activation decision (§3.10).
5. Bounded run executes with network denied; packet → submission →
   independent review → seal; one terminal decision.
