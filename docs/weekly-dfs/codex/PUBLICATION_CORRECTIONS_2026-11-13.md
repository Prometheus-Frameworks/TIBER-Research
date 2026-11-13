# Publication correction — Week 10 pool labels

Recorded 2026-11-13T17:27:32.425124Z during the November 13, 2026 backlog review.
This is a later documentation correction of retained fields, not a new pregame
research pass or a change to the selected nine.

The original [November 13 candidate JSON](2026/week-10/daily/2026-11-13.json)
and its [readable record](2026/week-10/daily/2026-11-13.md) remain unchanged.
Three JSON text fields were copied forward without matching the new evidence:

| Field | Retained text | Correct interpretation at the recorded retrieval |
| --- | --- | --- |
| `slate_label` | Official pool unverified | Official DraftKings group 156416 pool was retrieved and checked. |
| `games_status` | Official main membership unverified | The retained export contains the ten listed Sunday afternoon games. |
| `slate_coverage` | 512 players; first official verification | The November 13 export has 514 player rows and unique IDs, two more than the separately retained November 12 export; this is a refresh of the already verified pool. |

The retained [November 13 CSV](2026/week-10/daily/2026-11-13-draftkings-156416.csv)
contains **514 rows, 514 unique IDs and ten games**. All nine selections match
its official IDs, salaries and roster eligibility. Their total remains **$49,600,
with $400 remaining**. CSV SHA-256:
`5322d21fceb6fa8fcafa8eda0e430ddfb81213cf9af9fbc34458909abffd33a7`.
The original JSON's `official_pool_verified: true`, `salary_basis: official_export`,
`pool_status`, `validation.official_export_rows: 514` and `pool_change` describe
this retained evidence consistently. Use these qualified fields and this
correction when interpreting the stale labels. The latest display-feed snapshot
already describes the official ten-game pool and needs no historical rewrite.

This verifies fidelity to the retained official export, not current live pool or
medical status. Missing Friday designations, the Rams' Thursday source gap and
other stated role uncertainties remain unresolved. The candidate is **not frozen
or jointly endorsed**; this correction changes no player, salary, rationale,
projection, source cutoff, or historical result. Future passes must preserve a
new dated record and their own actual evidence.
