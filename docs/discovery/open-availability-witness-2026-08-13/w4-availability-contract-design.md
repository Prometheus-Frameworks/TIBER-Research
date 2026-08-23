# W4 — Source-neutral availability record contract (design draft)

Status: **AUTHORITY-INERT DESIGN — NOT IMPLEMENTED OR ADOPTED**

Prepared 2026-08-13 for TIBER-Research issue #5 (Lane 2) as a proposed
source-neutral design following W1–W3. No durable operator record adopts this
design. No schema files, validators, collectors, admission, or ingestion are
authorized by it. The authority and custody boundary in
[`README.md`](README.md) controls this file. Terminology per
[`witness-terminology.md`](witness-terminology.md): one record is one
observation *by a Witness* — including a Manual Witness, whose records carry
the identical provenance discipline (`observation_mode:
manual_observation`); the contract never upgrades any witness's assertion to
truth.

## Proposed design constraints

1. The five availability state classes are **structurally distinct fields**,
   never one `availability_status`:
   practice participation · game designation · gameday inactive · reserve
   state (IR/PUP/NFI/suspension) · actual participation/usage.
2. Clocks are first-class and **independently nullable by source**; a source
   without a native revision clock is representable without inventing one.
3. **Provenance class / source-generation identity** is first-class, so the
   NFL Data Exchange era, the 2025 nflapi retrospective backfill, and any
   empirically established 2026 generation are never conflated.
4. Missingness is explicit: `null` is "not asserted by this source," never
   zero, never "healthy," never "inactive."

## Record grain

One record = one **source assertion** about one player, for one team, in one
report scope (season/week or date), from one retrieval of one source
revision. Records are append-only observations; corrections arrive as new
records with supersession links, never edits.

## Contract sketch

```yaml
availability_record_v0:
  # ---- identity ----
  record_id:                 # stable id of this observation record
  season:                    # int
  week:                      # int | null  (null for undated/current-state sources)
  report_date:               # date | null (the report's own date, when the source carries one)
  report_scope:
    report_edition_ref:      # exact digest-bound source publication/edition | null
    report_edition_digest:   # sha256 of that exact edition artifact | null
    report_edition_digest_mode: # tiber-raw-sha256-v1 |
                                # tiber-canonical-json-v1 | null
    declared_universe_ref:   # exact digest-bound expected population/scope | null
    declared_universe_digest: # sha256 of that exact universe artifact | null
    declared_universe_digest_mode: # tiber-raw-sha256-v1 |
                                   # tiber-canonical-json-v1 | null
    observed_record_count:   # integer ledger count for this exact revision;
                             # never a universe definition or denominator
    completeness_state:      # complete | partial | unknown
    completeness_evidence_ref: # digest-bound reconciliation binding the
                                # source observed_object_digest, edition digest,
                                # and declared-universe digest | null
  team_ref:
    team_id:                 # canonical club code
  player_ref:
    canonical_player_id:     # gsis "00-XXXXXXX" | null
    source_player_id:        # the source's native id (espn/sleeper/…) | null
    display_name:            # as published by the source
    identity_status:         # resolved | ambiguous | unresolved
    resolution_method:       # required when resolved; e.g. source_native_gsis,
                             # crosswalk_ff_playerids, exact_roster_match; null otherwise

  # ---- the five state classes (never collapsed) ----
  practice_status:           # full | limited | dnp | null
  practice_status_detail:    # source-verbatim string | null
  game_designation:          # probable | questionable | doubtful | out |
                             # none_listed | blank_unresolved | null
  game_designation_detail:   # source-verbatim string | null; preserves unmapped,
                             # dirty, and legacy values
                             # none_listed requires evidence of a complete
                             # designation publication explicitly carrying no
                             # designation; blank_unresolved preserves a raw
                             # blank without enough edition/context proof;
                             # null = source does not carry this class
  gameday_inactive:          # true | false | null  (null = source does not carry
                             # inactives; false only from an explicit actives/
                             # inactives publication)
  reserve_state:             # ir | ir_dfr | pup | nfi | suspension | none | null
  reserve_state_detail:      # source-verbatim string | null
  actual_participation:      # OUT OF SCOPE for this record in v0 — usage truth
                             # (snaps/routes) belongs to participation artifacts;
                             # this field exists only as an explicit boundary
                             # marker and must be null in v0

  injury_description:
    primary:                 # body part / reason, source-verbatim | null
    secondary:               # | null

  # ---- source and custody clocks (each independently nullable; never inferred) ----
  clocks:
    event_time:              # event described by the assertion | null
    effective_at:            # when the assertion takes effect | null
    published_at:            # when the source says it published | null
    source_available_at:     # source-claimed first retrievability | null
    retrieved_at:            # actual retrieval time; may follow cutoff | null
    first_observed_at:       # first governed custody observation; may follow cutoff
    admissible_at:           # admission instant | null unless admitted
    cutoff_at:               # run cutoff used for eligibility | null until bound
    source_modified_at:      # the source's native revision clock, ONLY when one
                             # genuinely exists (e.g. historical date_modified,
                             # sleeper news_updated); null otherwise — a missing
                             # native clock is a recorded property of the source,
                             # not a gap to fill
    generated_at:            # when this record was generated (required)

  # ---- source and revision identity ----
  source:
    source_family_id:        # e.g. nflverse_injuries_release, sleeper_players_dump
    source_object_ref:       # exact URL / release asset / endpoint identity
    source_revision_ref:     # release timestamp, immutable revision, etag, or
                             # other source-native identity | null
    observed_object_digest:  # sha256 of exact observed source-object bytes | null
    observed_digest_mode:    # tiber-raw-sha256-v1 when byte identity exists |
                             # null otherwise; identifies observation, not retention
    retention_mode:          # full | excerpt | derived_only | reference_only
    retained_artifact_ref:   # exact retained object/excerpt/derivation | null
    retained_artifact_digest: # digest of exactly the retained artifact | null
    retained_digest_mode:    # digest mode matching retained artifact | null
    reportability:           # public_safe | internal | non_promotable |
                             # later_review_only
    promotable:              # false unless separate promotion authority exists
    rights:
      observed_terms_state:  # documented_permission |
                             # terms_text_facially_restricts_declared_use |
                             # upstream_chain_unknown | no_terms_observed |
                             # not_applicable
      evidence_ref:          # governed terms/license observation | null
      counsel_state:         # not_requested | pending | resolved
    rights_disposition_ref:  # exact governed rights-policy input; null only
                             # before admission/cutoff eligibility
    admitted:                # boolean; true iff admissibility.state = admitted
    admissibility:
      state:                 # admitted | inadmissible | unresolved
      rationale:
    admission_authority_ref: # proposed exact authority link | null unless admitted
    admission_scope:         # proposed use/retention/reportability scope | null

  # ---- availability observation receipt (required for cutoff eligibility) ----
  observation:
    receipt_ref:             # immutable governed observation/availability receipt
    evidence_ref:            # digest-bound evidence object
    cutoff_policy_ref:       # exact governed freshness/cutoff policy
    cutoff_eligibility:      # eligible | ineligible | unproven
    observation_method:      # direct_pre_cutoff_capture |
                             # immutable_revision_history |
                             # signed_upstream_receipt |
                             # trusted_connector_observation |
                             # operator_provided_packet
    observed_at:             # custody time; may follow cutoff except for
                             # direct_pre_cutoff_capture
    observer:
      observer_id:
      role:                  # operator | trusted_connector | trusted_runner |
                             # source_custodian
      trust_basis:
    trust_boundary:
      boundary_id:
      boundary_type:         # operator_attestation | connector_receipt |
                             # runner_observation | upstream_signature
      policy_ref:            # digest-bound observation policy

  # ---- provenance class (load-bearing; see below) ----
  provenance:
    provenance_class_id:     # from the registered generation table
    observation_mode:        # in_season_stream | retrospective_backfill |
                             # current_state_snapshot | manual_observation |
                             # unknown_pending_observation
    upstream_visibility:     # open_pinned | open_unpinned | private_upstream |
                             # credentialed_upstream | unknown

  # ---- lineage ----
  supersedes_record_id:      # | null (corrections/revisions append, never edit)
  supersession_reason:       # | null
```

### Proposed generation table and uninstantiated candidates

| provenance_class_id | Generation | observation_mode | upstream_visibility | Notes |
|---|---|---|---|---|
| `nflverse-injuries-nfldx-2009-2024` | historical NFL Data Exchange era | in_season_stream | credentialed_upstream (endpoint public-with-default-creds, code pinned) | carries native `date_modified` revision clock |
| `nflverse-injuries-nflapi-2025-backfill` | 2026-03-18 retrospective publication | retrospective_backfill | unknown (non-public `nflapi` acquisition implementation; ultimate endpoint/source/access unobserved) | **no exposed native revision clock or row-level history**; observed release is a snapshot |
| `nflverse-injuries-nflapi-2026-pending` | prospective 2026 generation | unknown_pending_observation | unknown (non-public acquisition implementation; ultimate endpoint/source/access unobserved) | **candidate label only, not a registered class and prohibited on admitted records**; instantiate a stream or backfill class only after a governed observation establishes its mode |
| `sleeper-players-dump-current` | Sleeper current-state snapshot | current_state_snapshot | open_unpinned | mutable endpoint; a particular response becomes pinned only through a governed content digest and observation receipt |
| `operator-manual-observation` | manual governed observation (Lane 1 style) | manual_observation | n/a | per-instance admission; excerpt/reference retention |

If this design is later adopted, new observed generations (source swaps,
schema drifts, cadence changes) register a new class rather than mutating an
existing one. A consumer that treats two classes as poolable must declare that
pooling decision itself — the design never pre-pools them.

## Vocabulary mapping discipline

Source-native vocabularies map to the contract enums through **declared,
versioned mapping tables** with explicit non-mappings (the #249 pattern):
e.g. Sleeper `Questionable → game_designation: questionable` is a declared
approximate mapping (Sleeper is not the official report); Sleeper
`COV`/`DNR`/`NA` are **prohibited-no-direct-mapping** and survive only in
`*_detail`. Historical `Probable` maps only when it is actually observed.
A blank nflverse `report_status` maps to
`game_designation: blank_unresolved`, with the exact blank preserved in
`game_designation_detail`; it can mean no designation, not-yet-designated, or
a dirty/partial record. `none_listed` is permitted only when a complete
designation publication is itself observed and explicitly establishes that
the player carried no designation. Dirty values such as `Note` remain
unmapped and survive only in `game_designation_detail`.

## Fail-closed rules

1. `null` never means healthy, active, zero, or unchanged.
2. Absence of a player from a report is **not** a record; only published
   assertions become records (no synthesized "not listed" rows in v0).
3. A record without `source_modified_at` cannot participate in
   revision-ordering logic; ordering falls back to
   (`report_date`, `published_at`) and, failing those, the record is
   unorderable and says so — retrieval time never orders assertions.
4. Practice status, game designation, gameday inactive, and reserve state
   never populate one another (e.g. `reserve_state: ir` does not imply
   `gameday_inactive: true`).
5. `identity_status: resolved` requires both a canonical id and a
   `resolution_method`; ambiguous/unresolved require `canonical_player_id:
   null`.
6. `observed_record_count` is a ledger count, never the declared universe or a
   completeness denominator. `completeness_state: complete` requires non-null
   digest-bound edition and universe refs/digests/digest modes plus a
   `completeness_evidence_ref` that binds `source.observed_object_digest`, the
   edition digest, and the declared-universe digest while reconciling the exact
   edition to that universe. Otherwise completeness is `partial` or `unknown`.
   `none_listed` additionally requires that exact complete-edition evidence for
   the relevant player.
7. Cutoff eligibility requires a digest-bound observation receipt and truthful
   separation of evidence, admission, and custody clocks. Source evidence and
   admission must be at or before `cutoff_at`; custody may occur later.
   For every non-null clock, both canonical chains are required:
   `source_available_at <= retrieved_at <= admissible_at <=
   observation.observed_at` and `source_available_at <= first_observed_at <=
   admissible_at <= observation.observed_at`.
   `direct_pre_cutoff_capture` requires `observation.observed_at <= cutoff_at`.
   A later observation is eligible only through a governed immutable, signed,
   trusted-connector, or operator-packet method whose receipt establishes the
   exact revision's pre-cutoff availability. `retrieved_at` alone is not
   availability evidence, and a null `admissible_at` never becomes eligible.
   Every eligible record also requires a non-null `observed_object_digest` with
   `observed_digest_mode: tiber-raw-sha256-v1`, and the receipt must bind that
   exact source-byte digest. This does not imply retained source content.
8. Records from `retrospective_backfill` or
   `unknown_pending_observation` classes cannot satisfy a claim requiring
   contemporaneous in-window observation. Timestamps alone never upgrade the
   observation mode.
9. Rights observations and admission are separate. Facial or unknown terms
   leave `admitted: false` and `admissibility.state: unresolved` unless an exact
   authority records another disposition; they do not produce a legal
   conclusion. A non-empty `rights_disposition_ref` whose governed scope fits
   the intended use, retention, and reportability is required before admission
   or cutoff eligibility.
10. Observed identity and retained content are separate. A `reference_only`
   source may carry `observed_object_digest` while every retained-artifact
   field is null. `full`, `excerpt`, and `derived_only` require an exact
   retained reference and a digest over that retained artifact; an excerpt
   digest is never described as the whole-page digest. Neither digest implies
   permission, truth, admission, or replayability.
11. `probable` remains representable for historical records. A source-native
    blank is `blank_unresolved` unless exact report-edition evidence supports
    `none_listed`; neither value implies healthy or active.

## What this contract deliberately does not do

- No blending, scoring, or "current best availability" synthesis — that is a
  consumer decision under later governed contracts.
- No actual-usage (snaps/routes) payload — boundary field only, null in v0.
- No collector/scheduler implication: the contract describes records however
  they were obtained under separate authority. Reusable availability-stream
  admission belongs at TIBER-Data; current Research contracts also permit
  bounded, non-promotable, run-scoped Manual Witness admission with its own
  receipts and operator authority.
