---
format: "tiber-research-article/v0"
record_id: "research-issue-0039-issue-body"
record_kind: "retrospective experiment"
subject: "[Completed experiment] Retrospective ROP WR target-share baselines — 2026 W1–W5"
study_window: "Retained 2026 W1–W5; W3–W5 primary, W2 warm-up"
evidence_cutoff: null
timezone: "See exact source clocks; unspecified clocks remain unknown"
latest_observation_covered: "See this edition-specific source; no later evidence incorporated"
authored_at: "2026-10-31T19:30:49.229705Z"
record_origin: "historical format copy"
original_record: "https://github.com/Prometheus-Frameworks/TIBER-Research/issues/39"
game_manifest: null
research_state: "Historical edition only; use its explicit source status, not later editions"
review_state: "Format self-check only; original review receipts remain as sourced; independent review of this copy pending"
owner: "unknown unless explicitly named in this source edition; existing investigator ownership unchanged"
admission_granted_by_record: false
external_acceptance_refs: []
---

# Historical format copy — body

Prepared 2026-10-31T19:30:49.229705Z from [body](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/39). No fresh football research, empirical re-evaluation or independent review was performed. Original source and all its stated limits remain authoritative for this historical edition. No future task or instruction quoted below is activated by this copy.

Source created: `2026-10-14T00:31:45Z`; source updated: `2026-10-14T00:31:52Z`; captured: `2026-10-31T19:25:44.008Z`. [Exact captured source](retained/body.md), SHA-256 `d1734c38e9eb982b0a56432e4025414e6a9e222e813e25f56fa2099327130bcd`. These clocks do not authenticate original-publication bytes or external source availability.

## 1. Summary

### Edition-specific source orientation

The following exact passages are from this edition; quoted future actions remain proposals, not this task’s instructions.

> **Result:** History improved on the last-week baseline within this selected retained sample. Shrinkage had the lowest pooled error, but its additional gain over simple cumulative history is inconclusive.

> **Terminal disposition: completed private retrospective experiment, delivered and independently replayed, with disclosed claim/coverage/rendering limits.**

<!-- source-block 1; retrospective organizational mapping, not an original question ID -->
### Completed retrospective experiment — October 13, 2026

**Result:** History improved on the last-week baseline within this selected retained sample. Shrinkage had the lowest pooled error, but its additional gain over simple cumulative history is inconclusive.

This is a terminal documentation record of one operator-authorized private offline Research experiment. Joe authorized its execution, qualification, implementation, tests, calculations, independent review, ordinary repairs and private delivery in the attached ROP Target-Share Experiment Handoff. After delivery, Joe explicitly requested that the work exist on GitHub. This issue publishes the bounded result and custody index; private retained data, row-level evidence, package bytes and storage-access locators remain private.

Related: [Research #27](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/27); [ROP descriptive release closeout](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/95#issuecomment-6157262521). [Forecast #190](https://github.com/Prometheus-Frameworks/TIBER-Forecast/issues/190) remains a separate strict point-in-time experiment, unactivated.

## 2. Question and scope

Within the retained80-WR 2026 W1–W5 sample, do cumulative history, discounted history or shrinkage improve next-calendar-week credited-target-share estimates over last week? Preserve all320 W2–W5 transitions. W3–W5 is the primary common scored window (203 pairs); W2 is separate warm-up, not pooled into the primary claim.

## 3. Baseline and alternatives

B0 predicts the last eligible week share. B1 divides summed historical credited player targets by summed receiver-credited team targets. B2 discounts counts using fixed one-week half-life0.5^(t−1−w). C1 uses Beta shrinkage(K+20μ)/(N+20), where μ is the mean of other eligible WRs’ earlier B1 ratios. Valid immediate prior-week same-team history is required; gaps/team changes reset history. No parameter tuning or post-score estimator changes occurred.

## 4. Evidence by question

### Question-level source crosswalk

`R-map-` IDs are retrospective navigation mappings, not original selections. Original IDs are used only when the exact token appears in this edition. Each locator names the retained source line where its specific topic begins; read the full indicated source section/table row, including its limits.

#### B0 — Last week

- **Source and specific locator:** [- B0:](retained/body.md?plain=1#L17), source line 17; [original record](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/39); exact capture SHA-256 `d1734c38e9eb982b0a56432e4025414e6a9e222e813e25f56fa2099327130bcd`.
- **Type:** executed experiment method.
- **Assessment / contrary evidence / limit:** Same eligibility/continuity and retrospective sample limits.
- **Window and operands:** retain the exact population, units and exclusions in that source section; no source or edition pooling. Unspecified operands remain unknown.
- **Clocks:** source created `2026-10-14T00:31:45Z`, updated `2026-10-14T00:31:52Z`, retrieved `2026-10-31T19:25:44.008Z`. These are record clocks, not original evidence availability; any explicit evidence cutoff in the source controls. Unspecified evidence clocks stay unknown.
- **Next action:** preserve this status; original investigator must qualify any missing witness before new research or reuse. No follow-up is activated by formatting.

#### B1 — Cumulative counts

- **Source and specific locator:** [- B1:](retained/body.md?plain=1#L18), source line 18; [original record](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/39); exact capture SHA-256 `d1734c38e9eb982b0a56432e4025414e6a9e222e813e25f56fa2099327130bcd`.
- **Type:** executed experiment method.
- **Assessment / contrary evidence / limit:** Summed denominators, not averaged weekly shares.
- **Window and operands:** retain the exact population, units and exclusions in that source section; no source or edition pooling. Unspecified operands remain unknown.
- **Clocks:** source created `2026-10-14T00:31:45Z`, updated `2026-10-14T00:31:52Z`, retrieved `2026-10-31T19:25:44.008Z`. These are record clocks, not original evidence availability; any explicit evidence cutoff in the source controls. Unspecified evidence clocks stay unknown.
- **Next action:** preserve this status; original investigator must qualify any missing witness before new research or reuse. No follow-up is activated by formatting.

#### B2 — Discounted counts

- **Source and specific locator:** [- B2:](retained/body.md?plain=1#L19), source line 19; [original record](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/39); exact capture SHA-256 `d1734c38e9eb982b0a56432e4025414e6a9e222e813e25f56fa2099327130bcd`.
- **Type:** executed experiment method.
- **Assessment / contrary evidence / limit:** One-week half-life is fixed pilot assumption, not validated setting.
- **Window and operands:** retain the exact population, units and exclusions in that source section; no source or edition pooling. Unspecified operands remain unknown.
- **Clocks:** source created `2026-10-14T00:31:45Z`, updated `2026-10-14T00:31:52Z`, retrieved `2026-10-31T19:25:44.008Z`. These are record clocks, not original evidence availability; any explicit evidence cutoff in the source controls. Unspecified evidence clocks stay unknown.
- **Next action:** preserve this status; original investigator must qualify any missing witness before new research or reuse. No follow-up is activated by formatting.

#### C1 — Beta shrinkage

- **Source and specific locator:** [- C1:](retained/body.md?plain=1#L20), source line 20; [original record](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/39); exact capture SHA-256 `d1734c38e9eb982b0a56432e4025414e6a9e222e813e25f56fa2099327130bcd`.
- **Type:** executed experiment method.
- **Assessment / contrary evidence / limit:** Peer-excluded prior; improvement over cumulative history inconclusive.
- **Window and operands:** retain the exact population, units and exclusions in that source section; no source or edition pooling. Unspecified operands remain unknown.
- **Clocks:** source created `2026-10-14T00:31:45Z`, updated `2026-10-14T00:31:52Z`, retrieved `2026-10-31T19:25:44.008Z`. These are record clocks, not original evidence availability; any explicit evidence cutoff in the source controls. Unspecified evidence clocks stay unknown.
- **Next action:** preserve this status; original investigator must qualify any missing witness before new research or reuse. No follow-up is activated by formatting.

#### R-map-results — Comparison results

- **Source and specific locator:** [## Results](retained/body.md?plain=1#L24), source line 24; [original record](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/39); exact capture SHA-256 `d1734c38e9eb982b0a56432e4025414e6a9e222e813e25f56fa2099327130bcd`.
- **Type:** reported calculated result.
- **Assessment / contrary evidence / limit:** Selected retained sample; no prospective validity or calibrated outcome intervals.
- **Window and operands:** retain the exact population, units and exclusions in that source section; no source or edition pooling. Unspecified operands remain unknown.
- **Clocks:** source created `2026-10-14T00:31:45Z`, updated `2026-10-14T00:31:52Z`, retrieved `2026-10-31T19:25:44.008Z`. These are record clocks, not original evidence availability; any explicit evidence cutoff in the source controls. Unspecified evidence clocks stay unknown.
- **Next action:** preserve this status; original investigator must qualify any missing witness before new research or reuse. No follow-up is activated by formatting.

#### B10 — Report rendering

- **Source and specific locator:** [| B10](retained/body.md?plain=1#L77), source line 77; [original record](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/39); exact capture SHA-256 `d1734c38e9eb982b0a56432e4025414e6a9e222e813e25f56fa2099327130bcd`.
- **Type:** technical verification limit.
- **Assessment / contrary evidence / limit:** Independent numerical replay does not resolve browser acceptance.
- **Window and operands:** retain the exact population, units and exclusions in that source section; no source or edition pooling. Unspecified operands remain unknown.
- **Clocks:** source created `2026-10-14T00:31:45Z`, updated `2026-10-14T00:31:52Z`, retrieved `2026-10-31T19:25:44.008Z`. These are record clocks, not original evidence availability; any explicit evidence cutoff in the source controls. Unspecified evidence clocks stay unknown.
- **Next action:** preserve this status; original investigator must qualify any missing witness before new research or reuse. No follow-up is activated by formatting.

<!-- source-block 2; retrospective organizational mapping, not an original question ID -->
### Exact input and design

- Exact unchanged `TIBER-ROP-2026-W01-W05-Private-Release.zip`, retained version 2, 24,420,710 bytes.
- Input SHA-256: `d2bb08b185c7ec73d80480ccc7cbc234ce02d89ac6d57308f6bcfa34ff69af13`.
- All 1,216 retained member pins verified. ROP/Data producers were not rerun or changed.
- All 80 release WR identities; 400 W1–W5 observation slots; all 320 W2–W5 transition slots retained.
- Target share uses player credited targets divided by receiver-credited team targets, not passing attempts.
- Valid immediately preceding calendar-week observation required. Only trailing consecutive eligible same-team history is used; gaps and team changes reset it.
- B0: last eligible week share.
- B1: ratio of summed historical player targets to summed historical receiver-credited team targets.
- B2: ratio of discounted counts, fixed one-week half-life, weight `0.5^(t-1-w)`.
- C1: Beta shrinkage mean `(K + 20*mu)/(N + 20)`; `mu` is the arithmetic mean of other eligible WRs’ earlier-history B1 ratios, excluding the subject. Empty peers or boundary priors are unavailable.
- Code/config/input freeze r1 preceded comparative scoring. Freeze SHA-256: `97d3e337cfad75d352c34bf88954c2edb5e42191cb13a98987d2a3cfa071fcca`. No parameter tuning or post-score estimator changes.
- Issued estimates persisted/hash-sealed before scoring each fold. Estimator inputs are historical rows only; the same process loads the retained snapshot, so physical future-byte isolation is not claimed.

<!-- source-block 3; retrospective organizational mapping, not an original question ID -->
### Results

Primary W3–W5 common scored sample: **203 pairs, 78 players, 32 teams, 93 team-games across 47 games**. Each method issued 221 estimates: 203 scored, 18 issued with missing outcomes; 19 slots not issued.

| Method | Pooled MAE, percentage points | Player-balanced MAE, percentage points |
|---|---:|---:|
| B0 last week | 9.65249 | 10.03569 |
| B1 cumulative | 7.87639 | 8.43026 |
| B2 recency | 8.30518 | 8.82047 |
| C1 shrinkage | 7.68481 | 8.18455 |

C1−B0 = **−1.96768 pp**. C1−B1 = **−0.19158 pp**, with a paired team-block 95% diagnostic interval of **[−0.60185, +0.21199] pp**, crossing zero.

| Target week | Common scored pairs | B0 | B1 | B2 | C1 |
|---|---:|---:|---:|---:|---:|
| W2, separate warm-up | 74 | 8.80348 | 8.80348 | 8.80348 | 7.64359 |
| W3 | 74 | 10.13945 | 8.40814 | 8.79534 | 8.04196 |
| W4 | 68 | 9.58629 | 7.69008 | 8.12679 | 7.44603 |
| W5 | 61 | 9.13556 | 7.43901 | 7.90943 | 7.51774 |

All errors are target-share percentage points. Cumulative history is slightly better than shrinkage in W5.

C1−B1 leave-one-week-out range: −0.30769 to −0.09142 pp. Leave-one-team-out range: −0.25277 to −0.08565 pp. Bootstrap: 5,000 paired source-team time blocks, fixed seed 20261013, all six method-pair comparisons retained. This preserves each sampled team’s primary-window time block but not cross-team opponent-game shocks.

Across all W2–W5 transitions, each method issued 300 estimates and scored 277. **43/320 unscorable:** 20 lack a valid preceding observation; 23 issued estimates have missing outcomes. Main-window exclusions: 37/240. Missing evidence was never converted to zero, bye, injury or DNP. No actual changed-team outcome exclusions occurred in this sample.

## 5. Interpretation and assessment

History improves on last-week share within this selected retained sample. Shrinkage has the lowest pooled error, but its additional gain over cumulative history is inconclusive: C1−B1 is −0.19158 pp and the paired team-block diagnostic interval crosses zero. W5 favors cumulative history. Preserve private retrospective/sample/availability limits and the unresolved B10 rendering check.

## 6. Unknowns and revision triggers

<!-- source-block 5; retrospective organizational mapping, not an original question ID -->
### Final Blockers & Decisions board

All entries: **Joe decision needed: no**. These limits remain visible; closing this completed experiment does not resolve them or authorize successor work.

| ID | Status / affected scope | Attempt and disposition | Owner |
|---|---|---|---|
| B01 | Passed; exact input access/integrity | Exact version retrieved, size/SHA and 1,216 member pins verified; no next action | Codex |
| B02 | Passed; source-purpose qualification | Retained licensing and grants inspected; separate scoped private Research binding independently reviewed; no next action | Codex + reviewer |
| B03 | Claim limit; all 320 transitions | Original availability/cutoff/finality unknown, corrections open. Preserve unknowns; no as-known-then/final-stat/prospective claims | Codex |
| B04 | Coverage limit; 43/320 scores, 37/240 main | All slots/issued estimates/reasons retained. No evidence fill or relabeling. No repair needed for this bounded delivery; new evidence would require separate work | Existing Data evidence custodian; Codex retains exclusions |
| B05 | Claim limit; 80-player cohort | Post-W5 opportunity-informed selection; freeze exact cohort and disclose selected-sample scope | Codex |
| B06 | Passed; identity/count/continuity/prior integrity | Exhaustive owner reconciliation plus independent reconstruction; no unresolved failure | Codex + reviewer |
| B07 | Passed; implementation/review/reproducibility | Tests, independent reconstruction, snapshot repair and fresh final retrieval/replay passed. Browser acceptance separate under B10 | Codex + reviewer |
| B08 | Claim limit; 240 potential primary slots | Only three primary weeks, five-week retained history and no untouched prospective sample. No tuning; restrict generalization | Codex |
| B09 | Not needed; optional inputs | RB shares, routes, air yards, xFP and Teamstate are not prerequisites; no acquisition | Codex |
| B10 | Technical verification blocked; 375/390/820 widths and interactions | Installed Chromium launch failed: process_singleton_posix socket() Operation not permitted. Zero rendered width checks ran. No escalation/rehosting; numerical delivery and replay completed. Open report on an allowed device for visual acceptance; physical iPhone acceptance unclaimed | Execution-environment browser capability |

## 7. Next checkpoint and closeout

<!-- source-block 7; retrospective organizational mapping, not an original question ID -->
### Interpretation and boundaries

This is chronological estimation over a **retrospectively retained snapshot**, not proven original as-known-then evidence. The cohort includes 40 WRs selected using W1–W5 opportunity, 35 historical seeds and five preserved pilots; it is not representative pregame enrollment.

Fixed half-life and prior strength are pilot assumptions, not validated settings. Estimates are marginal and unnormalized; no full-team allocation claim. Predictive Beta-binomial intervals and predictive log scores were not performed; bootstrap comparisons are not calibrated future-player uncertainty.

The original ROP observations and source grants remain unchanged. Attribution: nflverse contributors, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); retained original notices remain in the private package. Research transformations imply no endorsement.

No new acquisition/spending, producer or contract change, deployment, production Forecast activation, fantasy transaction, recurring work or nightly-queue restart occurred. This GitHub documentation request does not promote evidence, adopt a production model, activate Forecast #190 or formally register this package as a validated Stage 0 Research CLI run.

**Terminal disposition: completed private retrospective experiment, delivered and independently replayed, with disclosed claim/coverage/rendering limits.**

## 8. Sources, review and amendment history

<!-- source-block 4; retrospective organizational mapping, not an original question ID -->
### Verification and ordinary repair

- Exhaustive source/State/raw-count reconciliation of all 366 supported WR observation rows; 34 missing source rows retained; two observed zero-target slots preserved.
- Separate one-experiment private Research-purpose binding qualified against retained licensing; independent qualification review passed. Original descriptive grants unchanged.
- All 16 synthetic adversarial tests passed, including future mutation/deletion invariance, gaps/team changes, zero/null semantics, identity/week/game/denominator mismatches, peer exclusion and score-key alignment.
- Independent reviewer did not author or repair owner code. Rebuilt all 320 transitions directly from retained original States, including priors, estimates, errors, summaries, player balance, omission diagnostics and all cluster intervals. Eight empirical future mutation/deletion trials passed. No material numerical finding.
- Owner replay, independent fresh-directory candidate replay, and final saved-file retrieval/replay passed; all six deterministic output files matched exactly. Replay event clocks truthfully differ.
- Reviewer found a stale standalone report snapshot (RPT01). Ordinary packaging repair synchronized it to the exact final embedded report snapshot; numerical code/results unchanged. Finding and closure retained.
- Final saved package readback verified 61 package member pins, the original 1,216 member pins, report/snapshot consistency, 16 tests and six deterministic outputs.
- Receiving check used a separate reviewer on the same account/shared host. It does not prove another user/device/conversation can access the files.
- Compiled portable report includes all 80 player selections, W2–W5 selection, historical operands, estimates, retained outcomes, errors and the board. Rendered/browser acceptance remains blocked as below.

<!-- source-block 6; retrospective organizational mapping, not an original question ID -->
### Private deliverables and reproducibility index

These artifacts have already been privately delivered. **This issue contains no public package upload or working private-access URL.** An authorized custodian can recover the named artifacts and verify exact hashes.

| Artifact | SHA-256 |
|---|---|
| `ROP-Target-Share-Experiment.html` | `ed869bd371f2f9491c65c0d8093d5ed7a741d1289f96e1aaef1c77d50c3d1d68` |
| `TIBER-ROP-Target-Share-Experiment.zip` | `f16d069a69c4e92ae0ce022fdef8f257da20cd0356ea034a936b0f065ebb87d6` |
| `ROP-Target-Share-Receiving-Readback.json` | `f8ae7fc07dbbd524643939433e0077f26ebeee4a1edeb7f63ea7d1276bc3dfdd` |

ZIP size: 26,603,309 bytes; 61 pinned members. It contains the exact original ZIP, stdlib runner/qualification/tests/config/freeze, observation inputs, issued estimates, full ledger, scores/diagnostics, checkpoint boards, source-purpose records, independent reviews, candidate receiving receipt, compiled report/source/snapshot and terminal records. Final saved-file receiving receipt is separate to avoid circular self-hashing.

After extracting the private package, Python 3.10+ standard library only:

```sh
python3 REPRODUCE.py --out reproduced
```

This verifies pinned inputs, runs tests and reproduces only the experiment in a fresh directory. No download, credentials, dependencies, Git checkout, producer run or server is required.

### Format preparation fidelity

All source text blocks are retained and mapped once; source headings may be demoted for the shared outer shape. Relative repository links are resolved against the exact source commit. Existing question IDs, calculations, qualifiers and instructions are not rewritten. `source-map.json` gives per-block hashes and placements. Unknown header cutoff is deliberately not filled from retrieval or issue-update time. Independent copy review is pending; no downstream permission is granted.
