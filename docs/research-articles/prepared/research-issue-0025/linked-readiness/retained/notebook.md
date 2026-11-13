# Existing work and source readiness

Observation window: **October 1, 2026, 17:19–17:26 UTC (13:19–13:26 America/Toronto)**. Branch/commit reads below are source inspection, not runtime probes. Public issue/review claims are attributed as records; retained report/review text was inspected for TTS readiness, but this preparation did not independently rehash all historical source/output bytes or rerun producers. Private packets and conversations are not reproduced here.

## Exact repository state inspected

| Repository | Pin / scope | What the read establishes |
|---|---|---|
| Research | main `0952e3325fb610f9cdb22c5242397d223c7a6c26` | README custody/Ops authority boundaries and existing contracts; no AGENTS.md/CLAUDE.md in complete tree; only open PR #23 (TIBER Now link), no #25 follow-up comments at this read |
| Fantasy | main `4204ddfc0fb0dd38da708e9aea3c4d01b77997ab` | Legacy streamer implementation and source mount, not deployed head or live output correctness |
| Teamstate | main `9513fdae81d3a70189b8ebf03f38d40e1921204e` | W1 adapter/acceptance documentation; later retained reviewed reports are additional evidence, not absent merely because main is older |
| Data | main `e1e92078c626b9e2e502e927ba0de79afd26f451` | Canonical contracts/governance and capped PBP reader documentation; no new defensive or kicker admission |
| Strategy | main `29f6abab70c3ea115f51d034f762ba7fb9da2b03` | Player-free interpretation vocabulary/untested field notes, no streaming projection or activation |

Research [README](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0952e3325fb610f9cdb22c5242397d223c7a6c26/README.md) assigns activation/amendment/promotion to Ops and custody to Research. Existing `schemas/v0/` job, inputs, source-metadata, review and seal contracts, together with `schemas/v1/external-source-availability-receipt.schema.json` and `schemas/v1/stage1-preflight.schema.json`, must be reused where applicable, rather than creating a parallel research lifecycle. Preparation documents are outside those live run trees.

## Legacy streamer: implemented does not mean validated

All Fantasy references below are at the pinned Fantasy head.

| Surface | Exact blob | Findings |
|---|---|---|
| [dstStreamer.ts](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/blob/4204ddfc0fb0dd38da708e9aea3c4d01b77997ab/server/modules/dstStreamer.ts) | `f2e2451762c5e9798f704ee776a139593598cb0a` | Fixed 32-team defense/offense tables, fixed injury/rookie flags, no per-value source/revision/availability clocks; database supplies schedule only; unknown-team fallback values are plausible defaults |
| [mounted snapshotRoutes.ts](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/blob/4204ddfc0fb0dd38da708e9aea3c4d01b77997ab/server/modules/datalab/snapshots/snapshotRoutes.ts#L1564) | `4ab5992430e6325c4b0a89d4899560de2f0c8595` | GET `/dst-streamer`; defaults week 14/season 2025; imports this streamer |
| [server/routes.ts](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/blob/4204ddfc0fb0dd38da708e9aea3c4d01b77997ab/server/routes.ts#L2609) | `e18b0c557e0e8b85e2b7f56dc37b761cbe05d690` | Mounts the **modules/datalab/snapshots** router at `/api/data-lab`; similarly named `server/routes/dataLabRoutes.ts` is not the import at this mount |
| [RankingsHub.tsx](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/blob/4204ddfc0fb0dd38da708e9aea3c4d01b77997ab/client/src/pages/RankingsHub.tsx#L494) | `06a52ff1076cce6f3933ff9878549109fd4eb605` | Requests `/api/data-lab/dst-streamer` with current-week/season hook; renders rankings, tiers and projected points; no kicker tab in this inspected hub |
| [runtimeProfile.ts](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/blob/4204ddfc0fb0dd38da708e9aea3c4d01b77997ab/server/runtimeProfile.ts), [index.ts](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/blob/4204ddfc0fb0dd38da708e9aea3c4d01b77997ab/server/index.ts) | `2f080136a798d8aec72c20992442094ad12772d1`; `5e888ce4599b4f0c36f56faabd728ea4ce615c22` | Full runtime registers the broad router; public-draft-review containment excludes it. Which profile/head is currently deployed was not checked here |

The model adds fixed matchup boosts to a fixed base alpha, computes `projectedPoints = score / 9`, then clamps/rounds alpha for tiers/ranking. No calibrated scoring-profile mapping or empirical validation is present in this function. `rosteredPct` is optional and never populated there; the hidden-gem predicate accepts `undefined` as if the under-40% availability test passed. That is not historical or actual waiver eligibility. Empty schedule returns success with empty rankings. Pressure/turnover-worthy numbers in constants are not qualified measured inputs. This study must not use them as observed 2026 defense facts or a valid pregame baseline.

The older [DST handoff](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/blob/4204ddfc0fb0dd38da708e9aea3c4d01b77997ab/attached_assets/Pasted-Add-the-complete-Tiber-DST-Streamer-module-Week-15-2025_1765051629936.txt) (blob `a0fdbec20f09a9069b8a92ff60d0f318af58914f`) claims Week 15 2025 readiness and proposes random ownership placeholders and a cron. It is historical proposal text, not source proof or permission. The [Waiver Wisdom handoff](https://github.com/Prometheus-Frameworks/TIBER-Fantasy/blob/4204ddfc0fb0dd38da708e9aea3c4d01b77997ab/attached_assets/Pasted--WAIVER-WISDOM-MODULE-COMPLETE-HANDOFF-PACKAGE-Version-1-1-Created-November-19-202-1763603010933_1763603010935.txt) (blob `8a7de741d7670fb3a105c846b62ae635099bb2cb`) describes teaching/API concepts and implementation plans. Its tiers, thresholds and FAAB language are not validated kicker/DST research. No legacy code is repaired or activated in this task.

## TTS: preserve what already exists

The [W1 acceptance](https://github.com/Prometheus-Frameworks/TIBER-Teamstate/blob/9513fdae81d3a70189b8ebf03f38d40e1921204e/docs/receipts/teamstate-week1-provisional-acceptance-2026-09-22.md) and [binding](https://github.com/Prometheus-Frameworks/TIBER-Teamstate/blob/9513fdae81d3a70189b8ebf03f38d40e1921204e/src/provisional/week1Binding.ts) identify a narrow provisional ten-field input. Later evidence must not be erased by reading only this older adapter checkpoint. [Ops #85's later checkpoint](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/85#issuecomment-5846409757) records the reviewed W1→W2 comparison and observational composition.

| Evidence identity (SHA-256 unless commit) | Reported/inspected status and limits |
|---|---|
| W1 Data candidate `e59ff910a70414be333a5145adb9e451d007ea0c5b07c66fd9d87182ce7844d5`; support commit `e890f825bc5863d16c7afedfbd376c806cfed448` | Purpose-bounded provisional TTS use, not broad source admission; original source review exists |
| W1 TTS report `67d2baa4bdce4b9fb795161223929f29ece19cfcdea0584e2a14185fc00acd66`; receipt `2b338f8105dbacbcd96fb23694340b503c1ef2183bf74907cecd3dad9b9b40a6` | Later Gate A review CLEAN WITH NON-BLOCKING NOTES for declared identity/activity/evidence/reconciliation plus boxScoreAttemptShare. Does not accept fantasy accounting or original Markdown. Original report/receipt bytes were not recovered for the later reciprocal task; not independently rehashed here |
| W2 Data candidate `3c7cd5d0bfaeb52363cf30fa2387ce024b78070dc2ad51a2b2f77ee2efa44ef9`; support commit `426655473c53ba347a99ce2914cd5c9e7a7fbec1` | Retained candidate/review package exists; provisional purpose acceptance does not change source flags |
| W2 TTS attempt-02 output `99cd30b6a270af5fd93b38e03ca82d1425fe5baa86adb27984a42456dd57ee17`; receipt `af53f3b9369c017097ba8bbd37121766550b75d754ccb77e40381301d5e2f845` | Independent review text reports CLEAN WITH NON-BLOCKING NOTES, 320/320 values and reconciliation across 32 rows/16 games. Earlier receipt-order failure is historical and was repaired; do not present it as current failure |
| Ordinary own-offense W1→W2 ten-field comparison sealed archive `d8797252bfc83019ffc2ae47307671471fc97025936dbfb8d948df59ca3ee047`; machine `f06b8b9ed2cdde963bb150ba331883c17d3deaa7bbc616a5117bf57d32c3269f` | Reviewed descriptive comparison exists; review text reports all 320 W1/W2/delta triples comparable. No predictive/causal classification or as-of replay follows |
| Later reciprocal CAR–ATL candidate `c4fb18a6adcb0467bdb4c47ceae5eebb16af462ef9a46d1e96eab177a8cc95f6` | Purpose-accepted September 27 for bounded descriptive research. Later population reciprocal qualification is W2-only; full reciprocal W1→W2 qualification remains withheld pending original W1 report/receipt recovery. This is different from the already reviewed ordinary comparison |

W1 original Markdown had a disclosure revision finding. A later explanatory report exists, but no separate durable clean receipt for that explanatory Markdown was located in the inspected records. Do not transfer the numerical report's clean status to it. Exact historical artifact identities above are provenance locators from inspected records, not claims that this preparation newly authenticated their bytes or widened reuse permission.

### Clocks and use boundary

- W1 source receipts: player release September 16 14:14:12Z / retrieval 16:53:28.912415Z; team release 14:14:15Z / retrieval 16:53:59.205717Z; compilation 16:54:12.716238Z. The TTS pilot was September 22 14:20:06.578Z. These are distinct receipt assertions; they are not an independently witnessed pre-cutoff availability claim.
- W2 team update September 25 10:34:01Z / retrieval 12:00:15.367833Z / compilation 12:00:27.816176Z; candidate build 12:01:50.547930Z. TTS attempt-02 execution September 26 02:48:01.956Z–02:48:02.043Z; review 02:54:53.917216Z. These postdate the September 20 CAR–ATL game. W2 is evaluation outcome evidence only for a pre-W2 study.
- W1's September 16 retained version cannot establish availability at a Tuesday September 15 cutoff. A later Sunday cutoff would still require exact-version availability qualification, not clock substitution. A null/unestablished evidence cutoff stays null.
- Finality remains unknown, full-week-final false, corrections open/provisional, source-consumer-admitted false. Same-provider player/team reconciliation is not independent corroboration. Receiving air-yard conflicts remain outside the accepted ten fields.
- nflverse attribution/license statements in retained records do not make this document a new use-rights determination or a source-admission event.

## Field/source readiness matrix

| Requirement | Existing support | What is missing / next owner |
|---|---|---|
| Team own offensive activity | Ten fields: attempts, completions, passing yards/TDs/INTs, sacks suffered, carries, rushing yards/TDs, total fumbles lost | Research may plan diagnostic use; exact artifact custody/purpose recheck before empirical execution |
| Passing exposure | Attempts counts; separately accepted W1 attempts/(attempts+carries) derivative | Attempts are not dropbacks; carries include QB runs; no pressure/pace/neutral-pass inference. Data/TTS owns denominator extension |
| Opponent reciprocal activity | Existing W2 descriptive reciprocal work | W1 original output/receipt recovery required for new full reciprocal comparison. No conversion to defense credit without semantics/review |
| DST credited scoring events | Prior retained-field audit reports raw defensive and recovery columns physically retained | Not selected/reviewed by current offensive builder; not automatically available as qualified targets. Fractional sack credit, recovery/TD overlap, block/safety/2-point phase and corrected field names need a reviewed mapping. Data owns qualification |
| Points-allowed fantasy brackets | Final scores reported in issue | Event attribution and exact scoring policy; offense/ST points treatment. Research scoring contract plus eligible event source required |
| Pressure/turnover-worthy rate, drives, field position, score state, red zone, explosive/neutral EPA | Not supplied by ten-field TTS binding | Relevant event/charting source and definitions/rights/cutoffs; no inference from sacks or offense totals |
| Kicker attempts/makes/misses/distances, PAT and job identity | No such fields in ten-field TTS binding; #270 is direction | Separate kicker source/identity/outcome inventory and reviewed purpose. Not proof no raw source has these fields anywhere |
| Personnel, weather/roof, fourth-down choice | No qualified witness established here | Exact as-of versions and permission, Data/source custodian |
| League waiver/free-agent availability | No dated pool witness established here | Operator-supplied permitted snapshot or expressly simulated pool; never current roster percentage as history |
| Market/expert baseline | No contemporaneous eligible snapshot established here | Provider/version/rights/availability, odds conventions where needed; no closing-line substitution |

[Data #270](https://github.com/Prometheus-Frameworks/TIBER-Data/issues/270) is a special-teams game-impact direction, not streaming execution permission. Its historical reference to #269 as pending is stale: [#269](https://github.com/Prometheus-Frameworks/TIBER-Data/pull/269) merged September 12 at `e65791d3169c0234b80bdb4bfb00c3ed848d64dd` (head `4a19bcd754e7393a7f113a20877b07c4077d67b0`). The [merged capped PBP reader documentation](https://github.com/Prometheus-Frameworks/TIBER-Data/blob/e1e92078c626b9e2e502e927ba0de79afd26f451/docs/data/pbp-one-game-offline-read-v0.md) still leaves real 2026 game availability unverified absent a separately authorized source read. A reader implementation is not a complete permitted special-teams dataset. Do not run it here.

## Ownership and smallest useful boundary

- **Data:** source contracts, IDs, rights/provenance, event-field qualification and availability witnesses
- **Teamstate:** descriptive team evidence and reviewed reciprocal semantics; not DST scoring/projection
- **Research:** study design, exact input custody, separation of features/outcomes, evaluation and honest blocked/inconclusive findings
- **Strategy:** interpretation principles; no per-player/weekly label activation from this packet
- **Forecast:** any future calibrated prediction/model experiment remains a separately authorized lane; no code or run proposed for immediate execution
- **Fantasy/TEAM:** future consumer integration only after identity/purpose/serving gates; legacy source implementation does not establish deployment or evidence eligibility
- **Ops/Joe:** exact empirical activation and any later promotion/publication/consumer decisions

Disposition: **preparation is feasible; new numerical diagnostic is conditional on retained-byte recovery and purpose binding; verified historical replay and full kicker/DST evaluation are blocked on enumerated sources/availability/scoring witnesses**. Continue useful design without inventing those witnesses. Existing reviewed W1–W2 activity evidence remains visible.
