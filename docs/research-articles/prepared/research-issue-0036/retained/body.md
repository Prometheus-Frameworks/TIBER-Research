## Status and authority

**Operator-authorized research publication — October 12, 2026. Exploratory, read-only source feasibility only.** Joe explicitly approved posting the completed Pittsburgh Week 5 ROP Layer 2 feasibility study to TIBER-Research. This issue records an existing inspection; it is **not** permission for a producer run, implementation, new source acquisition, data admission, external redistribution, Forecast change, consumer activation, deployment or merge.

Related: [Research #24](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/24) (DK Metcalf opportunity board), [Research #34](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/34) (WR ability / separation feasibility). **This is an opportunity/deployment study, not an ability or separation score.** Data owns future source-derived target-event contracts; ROP would be a downstream descriptive consumer only after review.

## Question

Can we reproduce **target depth and air-yard opportunity** for Pittsburgh's DK Metcalf and rookie Germie Bernard from current 2026 nflverse data, and identify exactly what cannot yet be supported about routes, first reads, alignment and personnel?

## Verified exploratory observations — 2026 REG Week 5, IND at PIT

Game: **`2026_05_IND_PIT`**, played **2026-10-11**. Inspection clock: **2026-10-13T01:15:41Z**. One-game, source-level analysis; **not qualified ROP WeeklyRoleStateV1 output**.

| Metric | DK Metcalf | Germie Bernard |
|---|---:|---:|
| Source-native player ID | `00-0035640` | `00-0041489` |
| Receiver-credited targets | 4 | 9 |
| Receptions | 3 | 6 |
| Targeted air yards | 15 | 54 |
| **aDOT** | **3.75 yd** | **6.00 yd** |
| Share of PIT receiver-credited targets | 13.3% | 30.0% |
| Share of PIT targeted air yards | 10.1% | 36.2% |
| Target depths, yards | −3, 3, 6, 9 | −5, −2, 2, 3, 7, 9, 9, 12, 19 |

PIT team in this selection: **30 receiver-credited targets**, **149 targeted air yards**, **32 pass attempts** (two without a receiver-credited target). No eligible credited target had missing `air_yards`. Bernard's one-game aDOT was **2.25 yards deeper**, with more credited target volume; **neither player had a credited 20+ air-yard target**. These are descriptive observations, not proof of a permanent role change, receiver talent, or future target volume.

**Nullified opportunities:** PBP play `768` was a deep attempt to Bernard erased by defensive offside; play `1021` was a deep attempt to Metcalf erased by defensive pass interference. Both are **no plays** and excluded from the credited-target and aDOT denominators. Retain as separate context, never invent their target depths or treat them as official targets.

## Reproducibility and immutable source pointers

1. [nflverse 2026 play-by-play release](https://github.com/nflverse/nflverse-data/releases/tag/pbp) — asset `play_by_play_2026.csv.gz`, **5,356,195 bytes**, SHA-256 **`0eb4d13e96a9b66689210ebe7ffc64d3598acf6b59b77a211d3eda53eef16c7d`**; asset updated **2026-10-12T18:57:52Z**. Exact source bytes were fetched and hashed during the bounded read-only study; target-play IDs and source-native player IDs were used. This is an external release pin, **not** an admitted TIBER-Data artifact.
2. [FTN 2026 charting via nflverse](https://github.com/nflverse/nflverse-data/releases/tag/ftn_charting) — asset `ftn_charting_2026.csv`, **1,883,948 bytes**, SHA-256 **`d8baa6db70b6f197a6ec567a5c1ed59687e748f70a823cfc58f63d06a47f9f78`**; updated **2026-10-12T14:23:14Z**. At that exact snapshot, Week 5 contained **167 rows for `2026_05_TB_DAL` only**, **zero rows for `2026_05_IND_PIT`**. Therefore PIT Week 5 first-read, motion, screen, catchability and other FTN charting comparisons are **unavailable from this snapshot**, not zero.
3. Definitions: [nflfastR PBP dictionary](https://cran.r-project.org/web/packages/nflfastR/refman/nflfastR.html) and [FTN charting dictionary](https://nflreadr.nflverse.com/articles/dictionary_ftn_charting.html).

**Pilot eligibility rule:** `game_id=2026_05_IND_PIT AND posteam=PIT AND pass_attempt=1 AND receiver_player_id present`. `aDOT = sum(air_yards of eligible credited targets) / eligible credited targets`; include negative depths. Target share uses PIT receiver-credited targets, **not team pass attempts**. Air-yard share uses PIT targeted air yards under the same event universe. A missing air-yard observation must produce **unavailable** under this conservative pilot rather than be silently dropped or zero-filled. A final contract must explicitly settle penalties/no-plays, spikes/throwaways, lateral/credit corrections, denominator completeness and signed-air-yard semantics, with independent reconciliation.

## Capability boundary

| Candidate | Finding |
|---|---|
| Targeted air yards, aDOT, depth buckets, air-yard share | **Source-level reproducibility demonstrated for this game** |
| Red-zone target location | Derivable from PBP; **not tested here** |
| FTN first-read, designed reads, screens, motion | Charting source exists, **PIT W5 not covered in pinned snapshot** |
| Routes run, routes per dropback, TPRR | **Unavailable**; targets do not establish routes |
| Slot/outside alignment and complete 11/12/13 personnel | **Unavailable for this current-game comparison** |
| Separation, ability, future usage, xFP or Forecast | **Not measured or authorized** |

FTN's `read_thrown` codes are classifications of **actual throws**, not a complete progression map of every receiver on every dropback. The two nflverse-derived surfaces may share football-source lineage; they are not automatically independent corroboration.

## Rights and provenance

The nflverse **software** license does not automatically grant rights to NFL event data. FTN charting is distributed under **CC BY-SA 4.0** with attribution to **FTN Data via nflverse** and potentially relevant share-alike obligations. Before retention, redistribution, commercial exposure or admission to TIBER-Data, qualify source-specific rights, permitted use, attribution and publication scope. This issue publishes only bounded derived summary observations, methods and public release pointers; **no raw dataset, full source rows, private packet or credentials are uploaded**.

## Codex / custodian pickup point — proposal only, NOT dispatched

If the operator separately authorizes a design pass, propose the smallest **Data-owned Target Opportunity v0** contract (not a new score or an ROP v1 silent extension):

1. Declare the event universe, exact source-native player/game/play identity, target-credit policy, signed air-yard units, penalty/no-play treatment, corrections/finality, denominators and missingness; include negative tests and competing-count reconciliation.
2. Specify typed outputs for eligible target count, total targeted air yards, aDOT, target-depth buckets, team-target share and team-air-yard share, with source/field/play provenance and revision pins. Preserve source snapshot freshness.
3. Treat FTN passing-design enrichment as an **independent optional source qualification**. Missing PIT charting cannot become `false` for screen/motion or `0` for first reads.
4. Keep routes, alignment and personnel **unavailable** until actual complete participation/route witnesses exist. Do not substitute targets or historical participation for 2026 routes.
5. Return a **design + rights + test matrix and exact minimal Data handoff**, not implementation. Require a new direct operator grant for acquisition, producer work, independent review, ROP consumption or Forecast use.

**Disposition: exploratory feasibility recorded; source admission=false; producer execution=false; consumer activation=false; Forecast changes=false.**
